// BidPanel.js — the human's bidding buttons (Pass, or 8..13 when higher than the current bid).
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MIN_BID, MAX_BID } from '../engine/game';
import { colors, radius } from '../theme';

export default function BidPanel({ highBid, onBid }) {
  const amounts = [];
  for (let n = MIN_BID; n <= MAX_BID; n++) amounts.push(n);
  return (
    <View style={styles.wrap}>
      <Pressable style={[styles.btn, styles.pass]} onPress={() => onBid(0)}>
        <Text style={styles.passText}>Pass</Text>
      </Pressable>
      {amounts.map((n) => {
        const ok = n > highBid;
        return (
          <Pressable key={n} disabled={!ok} style={[styles.btn, ok ? styles.on : styles.off]} onPress={() => onBid(n)}>
            <Text style={[styles.text, !ok && { opacity: 0.35 }]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  btn: { minWidth: 48, paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.pill, alignItems: 'center' },
  on: { backgroundColor: colors.saffron },
  off: { backgroundColor: 'rgba(255,255,255,0.08)' },
  pass: { backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 18 },
  text: { color: colors.cardInk, fontWeight: '800', fontSize: 16 },
  passText: { color: colors.text, fontWeight: '800', fontSize: 16 },
});
