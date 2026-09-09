import { describe, expect, it } from 'vitest';

import type { OutboxItem, Transaction } from '../entities';
import type { OutboxRepository, TransactionRepository } from '../ports';
import { DomainError } from '../errors';
import { createTransactionUseCases } from './transactions';

function setup() {
  const txs: Transaction[] = [];
  const box: OutboxItem[] = [];
  const transactions: TransactionRepository = {
    async list() {
      return txs;
    },
    async getById(id) {
      return txs.find((t) => t.id === id) ?? null;
    },
    async upsert(tx) {
      const i = txs.findIndex((t) => t.id === tx.id);
      if (i >= 0) txs[i] = tx;
      else txs.push(tx);
    },
    async delete(id) {
      const i = txs.findIndex((t) => t.id === id);
      if (i >= 0) txs.splice(i, 1);
    },
  };
  const outbox: OutboxRepository = {
    async enqueue(item) {
      box.push(item);
    },
    async listPending() {
      return box;
    },
    async remove(id) {
      const i = box.findIndex((x) => x.id === id);
      if (i >= 0) box.splice(i, 1);
    },
    async incrementAttempts() {},
    async countPending() {
      return box.length;
    },
  };
  let n = 0;
  const usecases = createTransactionUseCases({
    transactions,
    outbox,
    ids: { id: () => `id-${++n}` },
    clock: { nowIso: () => '2026-09-09T12:00:00.000Z' },
  });
  return { usecases, txs, box };
}

describe('add transaction', () => {
  it('stores cents and enqueues outbox', async () => {
    const { usecases, txs, box } = setup();
    const tx = await usecases.add({
      userId: 'u1',
      categoryId: 'c1',
      type: 'expense',
      amountPesos: 15000,
      note: 'almuerzo',
      occurredAt: '2026-09-09T12:00:00.000Z',
    });
    expect(tx.amountCents).toBe(1_500_000);
    expect(txs).toHaveLength(1);
    expect(box).toHaveLength(1);
    expect(box[0].entity).toBe('transaction');
  });

  it('rejects non-positive amounts', async () => {
    const { usecases } = setup();
    await expect(
      usecases.add({
        userId: 'u1',
        categoryId: 'c1',
        type: 'expense',
        amountPesos: 0,
        note: '',
        occurredAt: '2026-09-09T12:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
