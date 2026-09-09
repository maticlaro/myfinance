import { describe, expect, it } from 'vitest';

import { createDashboardUseCases } from './dashboard';

describe('dashboard', () => {
  it('computes balance as income minus expense', async () => {
    const usecases = createDashboardUseCases({
      transactions: {
        list: async () => [
          {
            id: '1',
            userId: 'u',
            categoryId: 'c1',
            type: 'income',
            amountCents: 100000,
            note: '',
            occurredAt: '2026-09-01T00:00:00.000Z',
            updatedAt: 't',
          },
          {
            id: '2',
            userId: 'u',
            categoryId: 'c2',
            type: 'expense',
            amountCents: 40000,
            note: '',
            occurredAt: '2026-09-02T00:00:00.000Z',
            updatedAt: 't',
          },
        ],
        getById: async () => null,
        upsert: async () => {},
        delete: async () => {},
      },
      categories: {
        listByUser: async () => [
          { id: 'c1', userId: 'u', name: 'Sueldo', type: 'income', isSystem: true },
          { id: 'c2', userId: 'u', name: 'Comida', type: 'expense', isSystem: true },
        ],
        getById: async () => null,
        insertMany: async () => {},
      },
      budgets: {
        listByMonth: async () => [],
        listAll: async () => [],
        upsert: async () => {},
        delete: async () => {},
      },
    });
    const summary = await usecases.summarize('u', {}, '2026-09');
    expect(summary.balanceCents).toBe(60000);
  });
});
