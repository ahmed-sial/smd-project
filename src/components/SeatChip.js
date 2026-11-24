// SeatChip.js — a player's name tag: cards left, bid, and a pulse when it is their turn.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export default function SeatChip({ name, sub, cards, active, highlight }) {
  return (
    <View style={[styles.chip, active && styles.active, highlight && styles.team]}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.count}><Text style={styles.countText}>{cards}</Text></View>
      </View>
      {sub ? <Text style={styles.sub} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.plum, borderRadius: radius.panel, paddingVertical: 8, paddingHorizontal: 10, width: 82, borderWidth: 2, borderColor: 'transparent' },
  active: { borderColor: colors.saffron },
  team: { backgroundColor: '#3A2A57' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4 },
  name: { color: colors.text, fontWeight: '700', fontSize: 13, flexShrink: 1 },
  count: { backgroundColor: colors.cream, borderRadius: radius.pill, minWidth: 22, paddingHorizontal: 5, alignItems: 'center' },
  countText: { color: colors.cardInk, fontWeight: '800', fontSize: 11 },
  sub: { color: colors.muted, fontSize: 11, marginTop: 3 },
});
