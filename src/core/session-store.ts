import * as SecureStore from 'expo-secure-store';

import type { Session } from '@/domain/entities';
import type { SessionStore } from '@/domain/ports';

const KEY = 'saldo.session';
let memory: Session | null = null;

export const secureSessionStore: SessionStore = {
  async get() {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      return raw ? (JSON.parse(raw) as Session) : memory;
    } catch {
      return memory;
    }
  },
  async set(session) {
    memory = session;
    try {
      await SecureStore.setItemAsync(KEY, JSON.stringify(session));
    } catch {
      // web / unsupported platform: keep in-memory session
    }
  },
  async clear() {
    memory = null;
    try {
      await SecureStore.deleteItemAsync(KEY);
    } catch {
      // ignore
    }
  },
};
