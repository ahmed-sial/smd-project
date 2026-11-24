// theme.js — one place for colours and type so every screen looks consistent.
import { Platform } from 'react-native';

export const colors = {
  ink: '#17111F',        // app background
  plum: '#2A1E3D',       // panels
  jade: '#0E3B38',       // table felt (dark end)
  jadeLight: '#16524C',  // table felt (light end)
  saffron: '#F2A93B',    // primary accent / "your turn"
  rose: '#E0516A',       // red suits, warnings
  cream: '#FBF5E6',      // card face
  text: '#F4EEFA',
  muted: '#A396BA',
  cardInk: '#22182E',
};

export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });
export const radius = { card: 10, pill: 999, panel: 18 };
