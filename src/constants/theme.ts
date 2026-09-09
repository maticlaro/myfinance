import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#12231F',
    background: '#F4F6F4',
    backgroundElement: '#E7EEEA',
    backgroundSelected: '#D7E3DC',
    textSecondary: '#5B6B66',
    primary: '#0F3D3E',
    card: '#FFFFFF',
    income: '#2A8F6F',
    expense: '#C44536',
    border: '#D5DED8',
    danger: '#B42318',
  },
  dark: {
    text: '#F4F7F6',
    background: '#0C1615',
    backgroundElement: '#1A2624',
    backgroundSelected: '#243330',
    textSecondary: '#A8B6B2',
    primary: '#7DC4B2',
    card: '#15201E',
    income: '#4EC9A2',
    expense: '#F07167',
    border: '#2C3C39',
    danger: '#F97066',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
