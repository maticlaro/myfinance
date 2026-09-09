import { create } from 'zustand';

import type { DemoFlags, DemoFlagsStore } from '@/domain/ports';

type DemoState = DemoFlags & {
  setForceOffline: (value: boolean) => void;
  setInjectError: (value: boolean) => void;
  setLatencyMs: (value: number) => void;
};

export const useDemoFlags = create<DemoState>((set) => ({
  forceOffline: false,
  injectError: false,
  latencyMs: 400,
  setForceOffline: (forceOffline) => set({ forceOffline }),
  setInjectError: (injectError) => set({ injectError }),
  setLatencyMs: (latencyMs) => set({ latencyMs }),
}));

export const demoFlagsStore: DemoFlagsStore = {
  get: () => {
    const s = useDemoFlags.getState();
    return { forceOffline: s.forceOffline, injectError: s.injectError, latencyMs: s.latencyMs };
  },
};
