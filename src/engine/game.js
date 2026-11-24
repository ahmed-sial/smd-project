// game.js — all Rang rules as pure functions: (state, ...args) -> new state.
// Seats go clockwise 0,1,2,3. Partners sit opposite: team 0 = seats 0 & 2 (you + Sara), team 1 = seats 1 & 3.
import { buildDeck, shuffle, sortHand, val } from './cards';

export const NAMES = ['You', 'Ali', 'Sara', 'Zain'];
export const MIN_BID = 8;
export const MAX_BID = 13;
export const teamOf = (seat) => seat % 2;
const next = (seat) => (seat + 1) % 4;

// ---------- setup ----------
export function createMatch() {
  // dealer starts at 2 so that hand 1 has dealer 3 and you (seat 0) bid first
  return startHand({ dealer: 2, handNo: 0, wins: [0, 0], turn: 0 });
}

export function startHand(s) {
  const deck = shuffle(buildDeck());
  const hands = [[], [], [], []];
  for (let i = 0; i < 20; i++) hands[i % 4].push(deck[i]); // 5 cards each for bidding
  const dealer = (s.dealer + 1) % 4;
  const first = next(dealer);
  return {
    wins: s.wins, handNo: s.handNo + 1, dealer, first, turn: s.turn + 1,
    phase: 'bidding', current: first,
    hands: hands.map(sortHand), rest: deck.slice(20),
    bids: [null, null, null, null], highBid: 0, highBidder: null,
    bidder: null, bid: 0,
    rangSuit: null, hidden: null, revealed: false,
    trick: [], trickNo: 1, trickWinner: null,
    teamTricks: [0, 0], pile: 0, streak: null, seen: [], result: null,
    message: `${NAMES[first]} ${first === 0 ? 'bid' : 'bids'} first`,
  };
}

// ---------- bidding ----------
// amount 0 = pass, otherwise 8..13 and higher than the current bid. Each player speaks once.
export function placeBid(s, amount) {
  if (s.phase !== 'bidding') return s;
  if (amount !== 0 && (amount < MIN_BID || amount > MAX_BID || amount <= s.highBid)) return s;
  const bids = [...s.bids];
  bids[s.current] = amount;
  const highBid = amount > 0 ? amount : s.highBid;
  const highBidder = amount > 0 ? s.current : s.highBidder;
  const who = NAMES[s.current];
  const said = amount ? `${who} bid ${amount}` : `${who} passed`;

  if (bids.every((b) => b !== null)) {
    // all four have spoken; if everybody passed, the first player is forced to bid 8
    const bidder = highBidder ?? s.first;
    const bid = highBidder === null ? MIN_BID : highBid;
    return {
      ...s, bids, highBid, highBidder, bidder, bid, phase: 'chooseRang', current: bidder, turn: s.turn + 1,
      message: highBidder === null ? `Everyone passed — ${NAMES[bidder]} must bid 8` : `${NAMES[bidder]} won the bid at ${bid}`,
    };
  }
  return { ...s, bids, highBid, highBidder, current: next(s.current), turn: s.turn + 1, message: said };
}

// ---------- choosing the rang ----------
// The bidder sets one of their first 5 cards face down; its suit is trump. Then the rest is dealt (13 each).
export function chooseRang(s, cardId) {
  if (s.phase !== 'chooseRang') return s;
  const card = s.hands[s.bidder].find((c) => c.id === cardId);
  if (!card) return s;
  const hands = s.hands.map((h, i) => (i === s.bidder ? h.filter((c) => c.id !== cardId) : [...h]));
  for (let i = 0; i < 32; i++) hands[i % 4].push(s.rest[i]);
  return {
    ...s, hidden: card, rangSuit: card.suit, hands: hands.map(sortHand), rest: [],
    phase: 'playing', current: s.bidder, trick: [], turn: s.turn + 1,
    message: `${NAMES[s.bidder]} leads`,
  };
}

// ---------- playing ----------
export function legalCards(s, seat) {
  const hand = s.hands[seat];
  if (s.trick.length === 0) return hand;
  const led = s.trick[0].card.suit;
  const follow = hand.filter((c) => c.suit === led);
  return follow.length ? follow : hand; // must follow suit if possible
}

// bidder: any time on their turn. Anyone else: only when they cannot follow the led suit.
export function canReveal(s, seat) {
  if (s.phase !== 'playing' || s.revealed || s.current !== seat) return false;
  if (seat === s.bidder) return true;
  if (s.trick.length === 0) return false;
  const led = s.trick[0].card.suit;
  return !s.hands[seat].some((c) => c.suit === led);
}

function doReveal(s) {
  // the face-down card goes back into the bidder's hand
  const hands = s.hands.map((h, i) => (i === s.bidder ? sortHand([...h, s.hidden]) : h));
  return { ...s, hands, hidden: null, revealed: true, streak: null };
}

export function reveal(s, seat = s.current) {
  if (!canReveal(s, seat)) return s;
  const r = doReveal(s);
  return { ...r, turn: s.turn + 1, message: `${NAMES[seat]} revealed the rang` };
}

// the bidder's last card is the hidden one, so it is turned over automatically
function ensurePlayable(s) {
  if (s.phase === 'playing' && s.hidden && s.hands[s.current].length === 0) return doReveal(s);
  return s;
}

// who is winning the cards on the table (cards = [{seat, card}])
export function trickWinner(trick, revealed, rangSuit) {
  const led = trick[0].card.suit;
  const trumps = revealed ? trick.filter((t) => t.card.suit === rangSuit) : [];
  const pool = trumps.length ? trumps : trick.filter((t) => t.card.suit === led);
  return pool.reduce((best, t) => (val(t.card) > val(best.card) ? t : best)).seat;
}

export function playCard(s, cardId) {
  if (s.phase !== 'playing') return s;
  const seat = s.current;
  if (!legalCards(s, seat).some((c) => c.id === cardId)) return s;
  const card = s.hands[seat].find((c) => c.id === cardId);
  const hands = s.hands.map((h, i) => (i === seat ? h.filter((c) => c.id !== cardId) : h));
  const trick = [...s.trick, { seat, card }];
  const base = { ...s, hands, trick, seen: [...s.seen, card], turn: s.turn + 1 };
  if (trick.length === 4) {
    const winner = trickWinner(trick, s.revealed, s.rangSuit);
    return { ...base, phase: 'trickDone', trickWinner: winner, message: `${NAMES[winner]} won the trick` };
  }
  return ensurePlayable({ ...base, current: next(seat), message: '' });
}

// apply the finished trick: collect it straight away (rang hidden) or pile it up (rang revealed)
export function finishTrick(s) {
  if (s.phase !== 'trickDone') return s;
  const w = s.trickWinner;
  const teamTricks = [...s.teamTricks];
  let { pile, streak } = s;
  if (!s.revealed) {
    teamTricks[teamOf(w)] += 1;
  } else {
    pile += 1;
    if (streak === w) {
      // same player won twice in a row: their team takes the whole pile
      teamTricks[teamOf(w)] += pile;
      pile = 0;
      streak = null;
    } else streak = w;
  }

  if (s.trickNo === 13) {
    if (pile > 0) { teamTricks[teamOf(w)] += pile; pile = 0; } // leftover pile goes to the last winner
    const bidTeam = teamOf(s.bidder);
    const made = teamTricks[bidTeam];
    const winnerTeam = made >= s.bid ? bidTeam : 1 - bidTeam;
    const wins = [...s.wins];
    wins[winnerTeam] += 1;
    return {
      ...s, teamTricks, pile, streak, wins, phase: 'handOver', turn: s.turn + 1,
      result: { bidTeam, bid: s.bid, made, winnerTeam },
      message: '',
    };
  }
  return ensurePlayable({
    ...s, teamTricks, pile, streak, trick: [], trickWinner: null, trickNo: s.trickNo + 1,
    current: w, phase: 'playing', turn: s.turn + 1, message: `${NAMES[w]} leads`,
  });
}

export function nextHand(s) {
  return s.phase === 'handOver' ? startHand(s) : s;
}
