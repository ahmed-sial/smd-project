// HomeScreen.js — title screen with a short pitch and the start button.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlayingCard from '../components/PlayingCard';
import { colors, radius, serif } from '../theme';

const FAN = [
  { card: { id: 'KH', rank: 'K', suit: 'H' }, rot: '-14deg', x: -62 },
  { card: { id: 'AS', rank: 'A', suit: 'S' }, rot: '0deg', x: 0 },
  { card: { id: 'QD', rank: 'Q', suit: 'D' }, rot: '14deg', x: 62 },
];

export default function HomeScreen({ onStart }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={[colors.ink, '#2B1B3F']} style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.fan}>
        {FAN.map((f, i) => (
          <Animated.View key={f.card.id} entering={FadeIn.delay(i * 120).duration(250)} style={{ position: 'absolute', transform: [{ translateX: f.x }, { rotate: f.rot }] }}>
            <PlayingCard card={f.card} width={86} />
          </Animated.View>
        ))}
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>Rang Rush</Text>
        <Text style={styles.tagline}>Bid on your tricks, hide your trump, and team up with Sara.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>You and Sara against Ali and Zain</Text>
        <Pressable style={styles.play} onPress={onStart}>
          <Text style={styles.playText}>Deal me in</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },
  fan: { height: 220, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  copy: { alignItems: 'center' },
  title: { color: colors.text, fontFamily: serif, fontSize: 52, fontWeight: '800' },
  tagline: { color: colors.muted, fontSize: 16, marginTop: 6, textAlign: 'center', lineHeight: 22 },
  panel: { backgroundColor: colors.plum, borderRadius: 24, padding: 20 },
  label: { color: colors.muted, fontSize: 14, marginBottom: 14, textAlign: 'center' },
  play: { backgroundColor: colors.saffron, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' },
  playText: { color: colors.cardInk, fontWeight: '800', fontSize: 18 },
});
