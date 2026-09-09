import { describe, expect, it } from 'vitest';

import type { Goal } from '../entities';
import { createGoalUseCases } from './goals';

describe('goals', () => {
  it('increases current amount on contribute', async () => {
    const stored: Goal[] = [];
    const usecases = createGoalUseCases({
      goals: {
        list: async () => stored,
        getById: async (id) => stored.find((g) => g.id === id) ?? null,
        upsert: async (g) => {
          const i = stored.findIndex((x) => x.id === g.id);
          if (i >= 0) stored[i] = g;
          else stored.push(g);
        },
        delete: async () => {},
      },
      outbox: {
        enqueue: async () => {},
        listPending: async () => [],
        remove: async () => {},
        incrementAttempts: async () => {},
        countPending: async () => 0,
      },
      ids: { id: () => 'g1' },
      clock: { nowIso: () => 't' },
    });
    await usecases.create({ userId: 'u', name: 'Fondo', targetPesos: 100000, deadline: null });
    const next = await usecases.contribute('u', 'g1', 25000);
    expect(next.currentCents).toBe(2_500_000);
  });
});
