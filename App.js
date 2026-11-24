// App.js — entry point. Two screens, no navigation library needed: Home and Game.
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  const [playing, setPlaying] = useState(false);
  const [gameKey, setGameKey] = useState(0); // changing the key remounts GameScreen = a brand-new match

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {playing ? (
        <GameScreen key={gameKey} onReplay={() => setGameKey((k) => k + 1)} onHome={() => setPlaying(false)} />
      ) : (
        <HomeScreen onStart={() => setPlaying(true)} />
      )}
    </SafeAreaProvider>
  );
}
