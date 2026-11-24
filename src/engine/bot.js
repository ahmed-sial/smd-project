// bot.js — heuristic opponents. A bot only looks at its own hand and PUBLIC information:
// the rang suit is used only if the bot is the bidder or the rang has been revealed.
import { SUITS, val } from './cards';
import { canReveal, legalCards, trickWinner, MIN_BID, MAX_BID } from './game';

export function chooseMove(s) {
  if (s.phase === 'bidding') return bidMove(s);
  if (s.phase === 'chooseRang') return rangMove(s);
  return playMove(s);
}

const suitCounts = (hand) => Object.fromEntries(SUITS.map((x) => [x, hand.filter((c) => c.suit === x).length]));

// ----- bidding: judge 5 cards by high cards + length in one suit -----
function bidMove(s) {
  const hand = s.hands[s.current];
  const points = { 14: 1, 13: 0.6, 12: 0.3, 11: 0.1 };
  const strength =
    hand.reduce((sum, c) => sum + (points[val(c)] || 0), 0) +
    Math.max(0, Math.max(...Object.values(suitCounts(hand))) - 2) * 0.6 +
    (Math.random() - 0.5) * 0.4;
  const target = strength >= 3.2 ? 11 : strength >= 2.6 ? 10 : strength >= 2.0 ? 9 : strength >= 1.5 ? 8 : 0;
  if (target > s.highBid && target >= MIN_BID && target <= MAX_BID) return { type: 'bid', amount: target };
  return { type: 'bid', amount: 0 };
}

// ----- rang: longest suit (ties: higher cards); hide its lowest card -----
function rangMove(s) {
  const hand = s.hands[s.current];
  const counts = suitCounts(hand);
  const power = (x) => hand.filter((c) => c.suit === x).reduce((a, c) => a + val(c), 0);
  const suit = [...SUITS].sort((a, b) => counts[b] - counts[a] || power(b) - power(a))[0];
  const lowest = hand.filter((c) => c.suit === suit).sort((a, b) => val(a) - val(b))[0];
  return { type: 'rang', cardId: lowest.id };
}

// ----- playing -----
function playMove(s) {
  const me = s.current;
  const hand = s.hands[me];
  const rang = s.revealed || s.bidder === me ? s.rangSuit : null; // what this bot is allowed to know
  const partner = (me + 2) % 4;
  const trick = s.trick;
  const led = trick.length ? trick[0].card.suit : null;
  const winner = trick.length ? trickWinner(trick, s.revealed, s.rangSuit) : null;
  const partnerWinning = winner === partner;
  const hasLed = led && hand.some((c) => c.suit === led);

  // should this bot ask to reveal the rang?
  if (canReveal(s, me) && led && !hasLed) {
    if (me === s.bidder) {
      if (hand.some((c) => c.suit === rang) || s.hidden) { if (!partnerWinning) return { type: 'reveal' }; }
    } else if (!partnerWinning && Math.random() < (me === (s.bidder + 2) % 4 ? 0.15 : 0.6)) {
      return { type: 'reveal' };
    }
  }

  const legal = legalCards(s, me);
  const lowest = (list) => [...list].sort((a, b) => val(a) - val(b))[0];
  const wins = (c) => trickWinner([...trick, { seat: me, card: c }], s.revealed, s.rangSuit) === me;
  const nonRang = legal.filter((c) => c.suit !== rang);

  // leading: play a card nobody can beat, otherwise a cheap one
  if (!trick.length) {
    const unseen = (c) => !s.seen.some((x) => x.id === c.id) && !hand.some((x) => x.id === c.id);
    const higherLeft = (c) => {
      let n = 0;
      for (const r of ['2','3','4','5','6','7','8','9','10','J','Q','K','A']) {
        const probe = { id: r + c.suit, rank: r, suit: c.suit };
        if (val(probe) > val(c) && unseen(probe)) n++;
      }
      return n;
    };
    const masters = legal.filter((c) => higherLeft(c) === 0 && c.suit !== rang);
    if (masters.length) return { type: 'play', cardId: masters.sort((a, b) => val(b) - val(a))[0].id };
    return { type: 'play', cardId: lowest(nonRang.length ? nonRang : legal).id };
  }

  if (hasLed) {
    // following suit
    if (partnerWinning && (trick.length === 3 || val(trick.find((t) => t.seat === partner).card) >= 12))
      return { type: 'play', cardId: lowest(legal).id };
    const winners = legal.filter(wins);
    return { type: 'play', cardId: lowest(winners.length ? winners : legal).id };
  }

  // cannot follow suit: trump if it helps, otherwise throw away the lowest card
  if (s.revealed && rang && !partnerWinning) {
    const trumpWins = legal.filter((c) => c.suit === rang && wins(c));
    if (trumpWins.length) return { type: 'play', cardId: lowest(trumpWins).id };
  }
  return { type: 'play', cardId: lowest(nonRang.length ? nonRang : legal).id };
}
