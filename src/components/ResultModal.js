// ResultModal.js — shown when all 13 tricks are done: who won, the tricks, and the match tally.
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NAMES } from '../engine/game';
import { colors, radius, serif } from '../theme';

export default function ResultModal({ state, onNext, onHome }) {
  const { result, wins, bidder } = state;
  const youWon = result.winnerTeam === 0;
  const bidTeamName = result.bidTeam === 0 ? 'Your team' : 'Their team';
  const made = result.made >= result.bid;
  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{youWon ? 'Your team wins!' : 'Their team wins'}</Text>
          <Text style={styles.sub}>
            {NAMES[bidder] === 'You' ? 'You' : NAMES[bidder]} bid {result.bid}. {bidTeamName} took {result.made} trick{result.made === 1 ? '' : 's'} —
            {made ? ' contract made.' : ' contract failed.'}
          </Text>
          <View style={styles.tally}>
            <View style={styles.col}><Text style={styles.num}>{wins[0]}</Text><Text style={styles.lbl}>Us</Text></View>
            <Text style={styles.dash}>–</Text>
            <View style={styles.col}><Text style={styles.num}>{wins[1]}</Text><Text style={styles.lbl}>Them</Text></View>
          </View>
          <Pressable style={styles.primary} onPress={onNext}><Text style={styles.primaryText}>Deal next hand</Text></Pressable>
          <Pressable style={styles.ghost} onPress={onHome}><Text style={styles.ghostText}>Back to menu</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,6,16,0.82)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.plum, borderRadius: 24, padding: 22 },
  title: { color: colors.text, fontFamily: serif, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  tally: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginVertical: 20, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, paddingVertical: 14 },
  col: { alignItems: 'center' },
  num: { color: colors.saffron, fontFamily: serif, fontSize: 40, fontWeight: '800' },
  lbl: { color: colors.muted, fontSize: 13 },
  dash: { color: colors.muted, fontSize: 28 },
  primary: { backgroundColor: colors.saffron, borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: colors.cardInk, fontWeight: '800', fontSize: 16 },
  ghost: { paddingVertical: 14, alignItems: 'center' },
  ghostText: { color: colors.muted, fontWeight: '600' },
});
