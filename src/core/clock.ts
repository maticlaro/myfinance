import type { Clock } from '@/domain/ports';

export const systemClock: Clock = {
  nowIso: () => new Date().toISOString(),
};
