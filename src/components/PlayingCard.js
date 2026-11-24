// PlayingCard.js — draws one card (face or back). Purely visual; the parent decides what a tap does.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SYMBOL, isRed } from '../engine/cards';
import { colors, serif } from '../theme';

export default function PlayingCard({ card, width = 64, faceDown, playable, glow, dim, onPress, style }) {
  const height = Math.round(width * 1.42);
  const s = width / 64; // scale everything off the card width

  if (faceDown) {
    return (
      <Pressable onPress={onPress} disabled={!onPress} style={[{ width, height }, styles.base, style]}>
        <LinearGradient colors={['#3B2A57', '#241838']} style={StyleSheet.absoluteFill} />
        <View style={[styles.backFrame, { borderRadius: 6 * s }]}>
          <Text style={[styles.backMark, { fontSize: 22 * s }]}>502</Text>
        </View>
      </Pressable>
    );
  }

  const color = isRed(card.suit) ? colors.rose : colors.cardInk;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        { width, height },
        styles.base,
        { backgroundColor: colors.cream },
        playable && styles.playable,
        glow && styles.glow,
        dim && { opacity: 0.45 },
        style,
      ]}
    >
      <Text style={[styles.corner, { color, fontSize: 15 * s, left: 5 * s, top: 3 * s }]}>
        {card.rank}
        {'\n'}
        {SYMBOL[card.suit]}
      </Text>
      <Text style={[styles.center, { color, fontSize: 34 * s }]}>{SYMBOL[card.suit]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  playable: { borderColor: colors.saffron, borderWidth: 2, transform: [{ translateY: -14 }] },
  corner: { position: 'absolute', fontFamily: serif, fontWeight: '700', lineHeight: 17, textAlign: 'center' },
  center: { marginTop: 4 },
  glow: { borderColor: colors.saffron, borderWidth: 3 },
  backFrame: {
    ...StyleSheet.absoluteFillObject,
    margin: 5,
    borderWidth: 1.5,
    borderColor: colors.saffron,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backMark: { color: colors.saffron, fontFamily: serif, fontWeight: '800' },
});
