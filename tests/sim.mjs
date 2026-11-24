// Plays thousands of full Rang hands with bots in all four seats and checks the rules hold.
import { createMatch, placeBid, chooseRang, playCard, finishTrick, reveal, nextHand, legalCards, canReveal, trickWinner } from '../src/engine/game.js';
import { chooseMove } from '../src/engine/bot.js';

let hands = 0, reveals = 0, neverRevealed = 0, bidWins = 0, forced = 0;
let s = createMatch();
for (let g = 0; g < 4000; g++) {
  let guard = 0;
  while (s.phase !== 'handOver') {
    if (++guard > 500) throw new Error('stuck in phase ' + s.phase);
    if (s.phase === 'trickDone') { s = finishTrick(s); continue; }
    const all = [...s.hands.flat(), ...(s.hidden ? [s.hidden] : []), ...s.seen, ...s.rest];
    if (all.length !== 52 || new Set(all.map((c) => c.id)).size !== 52) throw new Error('cards lost: ' + all.length);
    const m = chooseMove(s);
    const before = s;
    if (m.type === 'bid') s = placeBid(s, m.amount);
    else if (m.type === 'rang') s = chooseRang(s, m.cardId);
    else if (m.type === 'reveal') { s = reveal(s); reveals++; }
    else { if (!legalCards(s, s.current).some((c) => c.id === m.cardId)) throw new Error('illegal play'); s = playCard(s, m.cardId); }
    if (s === before) throw new Error('move rejected ' + JSON.stringify(m) + ' in ' + before.phase);
  }
  hands++;
  const [a, b] = s.teamTricks;
  if (a + b !== 13 || s.pile !== 0) throw new Error('tricks must total 13, got ' + a + '+' + b);
  if (!s.revealed) neverRevealed++;
  if (s.result.winnerTeam === s.result.bidTeam) bidWins++;
  if (s.highBidder === null) forced++;
  if (s.hands.some((h) => h.length)) throw new Error('cards left over');
  s = nextHand(s);
}
console.log({ hands, bidTeamWinRate: +(bidWins / hands).toFixed(2), forcedBids: forced, neverRevealed, reveals });

// --- targeted rule checks ---
const C = (id) => ({ id, rank: id.slice(0, -1), suit: id.slice(-1) });
const T = (seat, id) => ({ seat, card: C(id) });
const eq = (a, b, m) => { if (a !== b) throw new Error('FAIL ' + m + ': ' + a + ' != ' + b); };
// hidden rang: highest card of the led suit wins; trumps do nothing
eq(trickWinner([T(0, 'KH'), T(1, 'AH'), T(2, '2S'), T(3, '9H')], false, 'S'), 1, 'hidden: highest of led suit');
// revealed: even the 2 of the rang beats an Ace
eq(trickWinner([T(0, 'KH'), T(1, 'AH'), T(2, '2S'), T(3, '9H')], true, 'S'), 2, 'revealed: 2 of rang beats Ace');
eq(trickWinner([T(0, 'KH'), T(1, '3S'), T(2, '2S'), T(3, '9H')], true, 'S'), 1, 'highest trump wins');
// must follow suit; non-bidder may only reveal when void in the led suit
let t = { ...createMatch() };
t = { ...t, phase: 'playing', bidder: 1, current: 2, revealed: false, rangSuit: 'S', hidden: C('4S'),
  hands: [[], [], [C('3H'), C('5C')], []], trick: [{ seat: 1, card: C('9H') }] };
eq(legalCards(t, 2).length, 1, 'must follow hearts'); eq(canReveal(t, 2), false, 'cannot reveal while able to follow');
t.hands[2] = [C('5C'), C('6D')];
eq(legalCards(t, 2).length, 2, 'void: any card'); eq(canReveal(t, 2), true, 'void may reveal');
// pile: collected only when the same player wins twice in a row
let p = { ...t, hidden: null, phase: 'trickDone', revealed: true, trickWinner: 1, pile: 0, streak: null, trickNo: 5, teamTricks: [0, 0], bid: 8 };
p = finishTrick(p); eq(p.pile, 1, 'pile 1'); eq(p.teamTricks[1], 0, 'not collected yet');
p = { ...p, phase: 'trickDone', trickWinner: 1 }; p = finishTrick(p); eq(p.teamTricks[1], 2, 'two in a row collects 2'); eq(p.pile, 0, 'pile cleared');
let q = { ...t, hidden: null, phase: 'trickDone', revealed: true, trickWinner: 0, pile: 1, streak: 1, trickNo: 6, teamTricks: [0, 0], bid: 8 };
q = finishTrick(q); eq(q.teamTricks[0], 0, 'different winner: no collection'); eq(q.pile, 2, 'pile grows'); eq(q.streak, 0, 'streak moves');
// before the reveal, tricks go straight to the winning team
let r = { ...t, phase: 'trickDone', revealed: false, trickWinner: 3, trickNo: 2, teamTricks: [0, 0], bid: 8 };
r = finishTrick(r); eq(r.teamTricks[1], 1, 'hidden trick collected immediately');
// everyone passes -> first player bids 8
let b = createMatch(); for (let i = 0; i < 4; i++) b = placeBid(b, 0);
eq(b.bid, 8, 'forced 8'); eq(b.bidder, b.first, 'first player is forced bidder');
// bids must beat the current bid
let c = createMatch(); c = placeBid(c, 9); const c2 = placeBid(c, 9); eq(c2, c, 'bid must be higher');
console.log('rule checks passed');
