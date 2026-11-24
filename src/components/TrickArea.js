// TrickArea.js — the four cards currently on the table, each placed toward the seat that played it.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import PlayingCard from './PlayingCard';

// seat -> position inside the 190x170 box (0 = you at the bottom, then clockwise: left, top, right)
const SPOT = {
  0: { left: 69, top: 92 },
  1: { left: 12, top: 50 },
  2: { left: 69, top: 8 },
  3: { left: 126, top: 50 },
};
export const CARD_W = 52;

export default function TrickArea({ trick, winner }) {
  return (
    <View style={styles.box}>
      {trick.map(({ seat, card }) => (
        <Animated.View key={card.id} entering={FadeIn.duration(180)} style={[styles.spot, SPOT[seat]]}>
          <PlayingCard card={card} width={CARD_W} glow={winner === seat} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 190, height: 170 },
  spot: { position: 'absolute' },
});
