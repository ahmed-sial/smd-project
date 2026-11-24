# Rang Rush — React Native / Expo

Single-player version of **Rang** from https://502-game.vercel.app/rang-rules. You + Sara (opposite) vs Ali + Zain (bots).

## Run
```
npm install
npx expo start      # scan the QR code with Expo Go, or press a / i
npm test            # plays 4000 full bot hands and checks the rules
```

## Rules implemented (from the site's Rang rules page)
4 players, 2 teams, partners opposite · 5 cards dealt, then everyone passes or bids 8–13 tricks (once each; if all pass the first player bids 8) ·
bidder hides one card of the trump suit face down (the **rang**) · rest dealt to 13 each · bidder leads · follow suit if you can ·
while hidden, highest card of the led suit wins · bidder can reveal any time on their turn; others only when they cannot follow suit ·
after the reveal any rang card beats every other suit (even a 2 beats an Ace) · before the reveal tricks are collected at once; after it they
pile up in the middle until the **same player wins two tricks in a row**, then that team takes the whole pile · bidding team wins with at least the bid.

### Where the site's rules were silent (my choices — be ready to explain)
- The hidden card returns to the bidder's hand when the rang is revealed (and is turned over automatically for the bidder's last card).
- After a pile is collected the "in a row" count starts again. A pile still left after trick 13 goes to the last trick's winner.
- A hand is the unit of play; the app keeps a running hands-won tally for "Us" and "Them".
- The player left of the dealer bids first; the dealer rotates every hand.

## Files
| File | Purpose |
|---|---|
| `App.js` | Entry. Home ↔ Game; changing `gameKey` restarts the match |
| `src/engine/cards.js` | Deck, shuffle, rank values (Ace high), hand sorting |
| `src/engine/game.js` | **All rules**: `startHand, placeBid, chooseRang, legalCards, canReveal, reveal, playCard, trickWinner, finishTrick, nextHand` |
| `src/engine/bot.js` | Bot AI (bids, picks rang, plays). Uses only its own hand + public info |
| `src/screens/HomeScreen.js` | Title screen |
| `src/screens/GameScreen.js` | The table; `useReducer` state; `useEffect` timers drive bots and trick collection |
| `src/components/` | `PlayingCard`, `SeatChip`, `TrickArea`, `BidPanel`, `ResultModal` |
| `tests/sim.mjs` | Engine tests (no UI needed) |

## Libraries (package.json)
`react-native-reanimated` (a short fade when cards appear), `expo-linear-gradient`, `react-native-safe-area-context`.
