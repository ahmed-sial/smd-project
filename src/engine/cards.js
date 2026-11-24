// cards.js — deck helpers for Rang. Aces are high (value 14).
export const SUITS = ['S', 'H', 'C', 'D']; // alternating colours makes a sorted hand easier to read
export const SYMBOL = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const SUIT_NAME = { S: 'Spades', H: 'Hearts', D: 'Diamonds', C: 'Clubs' };
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const VALUE = Object.fromEntries(RANKS.map((r, i) => [r, i + 2])); // '2' -> 2 ... 'A' -> 14

export const isRed = (suit) => suit === 'H' || suit === 'D';
export const val = (card) => VALUE[card.rank];

export function buildDeck() {
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ id: rank + suit, rank, suit });
  return deck;
}

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// group by suit, high cards first
export const sortHand = (hand) =>
  [...hand].sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) || val(b) - val(a));
