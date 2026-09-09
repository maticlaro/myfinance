import { DomainError } from '../errors';
import type { Transaction, TransactionFilters, TransactionType } from '../entities';
import type { Clock, IdGen, OutboxRepository, TransactionRepository } from '../ports';

function enqueue(
  outbox: OutboxRepository,
  ids: IdGen,
  clock: Clock,
  tx: Transaction,
  op: 'upsert' | 'delete',
) {
  return outbox.enqueue({
    id: ids.id(),
    userId: tx.userId,
    entity: 'transaction',
    op,
    payload: JSON.stringify(tx),
    attempts: 0,
    createdAt: clock.nowIso(),
  });
}

export function createTransactionUseCases(deps: {
  transactions: TransactionRepository;
  outbox: OutboxRepository;
  ids: IdGen;
  clock: Clock;
}) {
  return {
    async add(input: {
      userId: string;
      categoryId: string;
      type: TransactionType;
      amountPesos: number;
      note: string;
      occurredAt: string;
    }): Promise<Transaction> {
      if (!Number.isFinite(input.amountPesos) || input.amountPesos <= 0) {
        throw new DomainError('El monto debe ser mayor a 0');
      }
      const tx: Transaction = {
        id: deps.ids.id(),
        userId: input.userId,
        categoryId: input.categoryId,
        type: input.type,
        amountCents: Math.round(input.amountPesos * 100),
        note: input.note.trim(),
        occurredAt: input.occurredAt,
        updatedAt: deps.clock.nowIso(),
      };
      await deps.transactions.upsert(tx);
      await enqueue(deps.outbox, deps.ids, deps.clock, tx, 'upsert');
      return tx;
    },

    async update(input: {
      id: string;
      userId: string;
      categoryId: string;
      type: TransactionType;
      amountPesos: number;
      note: string;
      occurredAt: string;
    }): Promise<Transaction> {
      const existing = await deps.transactions.getById(input.id);
      if (!existing || existing.userId !== input.userId) throw new DomainError('Movimiento no encontrado');
      if (!Number.isFinite(input.amountPesos) || input.amountPesos <= 0) {
        throw new DomainError('El monto debe ser mayor a 0');
      }
      const tx: Transaction = {
        ...existing,
        categoryId: input.categoryId,
        type: input.type,
        amountCents: Math.round(input.amountPesos * 100),
        note: input.note.trim(),
        occurredAt: input.occurredAt,
        updatedAt: deps.clock.nowIso(),
      };
      await deps.transactions.upsert(tx);
      await enqueue(deps.outbox, deps.ids, deps.clock, tx, 'upsert');
      return tx;
    },

    async remove(userId: string, id: string): Promise<void> {
      const existing = await deps.transactions.getById(id);
      if (!existing || existing.userId !== userId) throw new DomainError('Movimiento no encontrado');
      await deps.transactions.delete(id);
      await enqueue(deps.outbox, deps.ids, deps.clock, existing, 'delete');
    },

    list(userId: string, filters?: TransactionFilters) {
      return deps.transactions.list(userId, filters);
    },
  };
}
