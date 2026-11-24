// GameScreen.js — the table. useReducer holds the game state; every tap calls a rule from engine/game.js.
import React, { useEffect, useReducer } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlayingCard from '../components/PlayingCard';
import SeatChip from '../components/SeatChip';
import TrickArea from '../components/TrickArea';
import BidPanel from '../components/BidPanel';
import ResultModal from '../components/ResultModal';
import {
  NAMES, createMatch, placeBid, chooseRang, playCard, reveal, finishTrick, nextHand, legalCards, canReveal, teamOf,
} from '../engine/game';
import { chooseMove } from '../engine/bot';
import { SYMBOL, SUIT_NAME, isRed } from '../engine/cards';
import { colors, radius, serif } from '../theme';

function reducer(s, a) {
  switch (a.type) {
    case 'bid': return placeBid(s, a.amount);
    case 'rang': return chooseRang(s, a.cardId);
    case 'reveal': return reveal(s);
    case 'play': return playCard(s, a.cardId);
    case 'finish': return finishTrick(s);
    case 'next': return nextHand(s);
    case 'bot': {
      const m = chooseMove(s);
      if (m.type === 'bid') return placeBid(s, m.amount);
      if (m.type === 'rang') return chooseRang(s, m.cardId);
      if (m.type === 'reveal') return reveal(s);
      return playCard(s, m.cardId);
    }
    default: return s;
  }
}

const SEAT_SUB = (s, seat) => {
  if (s.phase === 'bidding') return s.bids[seat] === null ? '' : s.bids[seat] === 0 ? 'Pass' : `Bid ${s.bids[seat]}`;
  return seat === s.bidder ? `Bid ${s.bid}` : seat === 2 ? 'Partner' : '';
};

export default function GameScreen({ onReplay, onHome }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [s, dispatch] = useReducer(reducer, null, createMatch);
  const myTurn = s.current === 0;
  const myHand = s.hands[0];
  const cardW = Math.max(46, Math.min(62, (width - 24) / 7)); // 13 overlapped cards fit the screen width

  // bots act after a short pause; a finished trick stays visible for a moment, then is collected.
  // s.turn changes after every action, so this effect re-runs each time.
  useEffect(() => {
    let delay = null;
    let action = null;
    if (s.phase === 'trickDone') { delay = 1400; action = { type: 'finish' }; }
    else if (['bidding', 'chooseRang', 'playing'].includes(s.phase) && s.current !== 0) { delay = 900; action = { type: 'bot' }; }
    if (!action) return;
    const t = setTimeout(() => dispatch(action), delay);
    return () => clearTimeout(t);
  }, [s.turn, s.phase]);

  const legal = s.phase === 'playing' && myTurn ? legalCards(s, 0).map((c) => c.id) : [];
  const led = s.trick.length ? s.trick[0].card.suit : null;

  const onCard = (card) => {
    if (s.phase === 'chooseRang' && myTurn) dispatch({ type: 'rang', cardId: card.id });
    else if (legal.includes(card.id)) dispatch({ type: 'play', cardId: card.id });
  };
  const menu = () =>
    Alert.alert('Menu', undefined, [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Restart match', onPress: onReplay },
      { text: 'Quit to menu', style: 'destructive', onPress: onHome },
    ]);

  // text under the table that tells you what to do
  let hint = s.message;
  if (s.phase === 'bidding' && myTurn) hint = 'How many of the 13 tricks will your team win?';
  else if (s.phase === 'chooseRang' && myTurn) hint = 'Tap a card to hide it. Its suit becomes the rang (trump).';
  else if (s.phase === 'playing' && myTurn) {
    if (!led) hint = 'Your lead';
    else if (legal.length === myHand.length && !myHand.some((c) => c.suit === led)) hint = `No ${SUIT_NAME[led]} — play any card${canReveal(s, 0) ? ' or reveal the rang' : ''}`;
    else hint = `Follow ${SUIT_NAME[led]} ${SYMBOL[led]}`;
  }

  const rangText = s.revealed ? `Rang ${SYMBOL[s.rangSuit]}` : s.rangSuit && s.bidder === 0 ? `Your rang ${SYMBOL[s.rangSuit]} (hidden)` : s.phase === 'playing' ? 'Rang hidden' : 'No rang yet';
  const bidTeam = s.bidder === null ? null : teamOf(s.bidder);

  return (
    <LinearGradient colors={[colors.jadeLight, colors.jade, '#071F1D']} style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.topBar}>
        <Pressable onPress={menu} hitSlop={12}><Text style={styles.link}>Menu</Text></Pressable>
        <Text style={styles.title}>Hand {s.handNo}</Text>
        <Text style={styles.score}>{s.wins[0]} – {s.wins[1]}</Text>
      </View>

      <View style={styles.strip}>
        <Text style={styles.stripText}>{s.bidder !== null ? `${NAMES[s.bidder]} bid ${s.bid}` : 'Bidding'}</Text>
        <Text style={[styles.stripText, s.revealed && { color: isRed(s.rangSuit) ? '#FF8FA3' : colors.saffron }]}>{rangText}</Text>
        {s.phase !== 'bidding' && s.phase !== 'chooseRang' ? (
          <Text style={styles.stripText}>Us {s.teamTricks[0]} · Them {s.teamTricks[1]}{s.pile ? ` · Pile ${s.pile}` : ''}</Text>
        ) : null}
      </View>

      <View style={styles.table}>
        <View style={styles.topSeat}>
          <SeatChip name={NAMES[2]} sub={SEAT_SUB(s, 2)} cards={s.hands[2].length} active={s.current === 2 && s.phase !== 'handOver' && s.phase !== 'trickDone'} highlight />
        </View>
        <View style={styles.leftSeat}>
          <SeatChip name={NAMES[1]} sub={SEAT_SUB(s, 1)} cards={s.hands[1].length} active={s.current === 1 && s.phase !== 'handOver' && s.phase !== 'trickDone'} />
        </View>
        <View style={styles.rightSeat}>
          <SeatChip name={NAMES[3]} sub={SEAT_SUB(s, 3)} cards={s.hands[3].length} active={s.current === 3 && s.phase !== 'handOver' && s.phase !== 'trickDone'} />
        </View>
        <TrickArea trick={s.trick} winner={s.phase === 'trickDone' ? s.trickWinner : null} />
      </View>

      <View style={styles.status}>
        {s.phase === 'bidding' && myTurn ? <BidPanel highBid={s.highBid} onBid={(amount) => dispatch({ type: 'bid', amount })} /> : null}
        {s.phase === 'playing' && myTurn && canReveal(s, 0) ? (
          <Pressable style={styles.reveal} onPress={() => dispatch({ type: 'reveal' })}>
            <Text style={styles.revealText}>Reveal the rang</Text>
          </Pressable>
        ) : null}
        <Text style={styles.message}>{hint}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.handScroll} contentContainerStyle={styles.hand}>
        {myHand.map((card) => {
          const ok = s.phase === 'chooseRang' ? myTurn : legal.includes(card.id);
          const active = (s.phase === 'playing' && myTurn) || (s.phase === 'chooseRang' && myTurn);
          return (
            <Animated.View key={card.id} entering={FadeIn.duration(200)} style={{ marginRight: -cardW * 0.5 }}>
              <PlayingCard card={card} width={cardW} playable={ok && active} dim={active && !ok} onPress={() => onCard(card)} />
            </Animated.View>
          );
        })}
      </ScrollView>

      {s.phase === 'handOver' && <ResultModal state={s} onNext={() => dispatch({ type: 'next' })} onHome={onHome} />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 6 },
  link: { color: colors.text, fontWeight: '600', width: 50 },
  title: { color: colors.text, fontFamily: serif, fontSize: 18, fontWeight: '700' },
  score: { color: colors.saffron, fontWeight: '800', width: 50, textAlign: 'right' },
  strip: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.25)', marginHorizontal: 16, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 14 },
  stripText: { color: colors.text, fontSize: 12.5, fontWeight: '600' },
  table: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topSeat: { position: 'absolute', top: 6, alignSelf: 'center' },
  leftSeat: { position: 'absolute', left: 8, top: '42%' },
  rightSeat: { position: 'absolute', right: 8, top: '42%' },
  status: { alignItems: 'center', paddingHorizontal: 16, minHeight: 86, justifyContent: 'center', gap: 10 },
  message: { color: colors.text, fontSize: 15, textAlign: 'center' },
  reveal: { backgroundColor: colors.saffron, borderRadius: radius.pill, paddingHorizontal: 22, paddingVertical: 10 },
  revealText: { color: colors.cardInk, fontWeight: '800' },
  handScroll: { flexGrow: 0 },
  hand: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 18, alignItems: 'flex-end', paddingRight: 16 + 30 },
});
