import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

type State = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemePreference = create<State>((set) => ({
  preference: 'system',
  setPreference: (preference) => set({ preference }),
}));
