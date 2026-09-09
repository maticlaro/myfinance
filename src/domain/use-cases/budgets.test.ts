import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors';
import { createBudgetUseCases } from './budgets';

describe('budgets', () => {
  it('rejects negative limits', async () => {
    const usecases = createBudgetUseCases({
      budgets: {
        listByMonth: async () => [],
        listAll: async () => [],
        upsert: async () => {},
        delete: async () => {},
      },
      outbox: {
        enqueue: async () => {},
        listPending: async () => [],
        remove: async () => {},
        incrementAttempts: async () => {},
        countPending: async () => 0,
      },
      ids: { id: () => 'b1' },
      clock: { nowIso: () => 't' },
    });
    await expect(
      usecases.upsert({ userId: 'u', categoryId: 'c', month: '2026-09', limitPesos: -1 }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
