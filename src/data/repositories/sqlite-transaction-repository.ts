import { and, desc, eq, gte, lte } from 'drizzle-orm';

import type { Transaction, TransactionFilters } from '@/domain/entities';
import type { TransactionRepository } from '@/domain/ports';
import type { AppDb } from '@/data/db/client';
import { transactions } from '@/data/db/schema';

export function sqliteTransactionRepository(db: AppDb): TransactionRepository {
  return {
    async list(userId, filters) {
      const clauses = [eq(transactions.userId, userId)];
      if (filters?.from) clauses.push(gte(transactions.occurredAt, filters.from));
      if (filters?.to) clauses.push(lte(transactions.occurredAt, filters.to));
      if (filters?.categoryId) clauses.push(eq(transactions.categoryId, filters.categoryId));
      if (filters?.type) clauses.push(eq(transactions.type, filters.type));
      return db
        .select()
        .from(transactions)
        .where(and(...clauses))
        .orderBy(desc(transactions.occurredAt))
        .all()
        .map(map);
    },
    async getById(id) {
      const row = db.select().from(transactions).where(eq(transactions.id, id)).get();
      return row ? map(row) : null;
    },
    async upsert(tx) {
      db.insert(transactions)
        .values({
          id: tx.id,
          userId: tx.userId,
          categoryId: tx.categoryId,
          type: tx.type,
          amountCents: tx.amountCents,
          note: tx.note,
          occurredAt: tx.occurredAt,
          updatedAt: tx.updatedAt,
        })
        .onConflictDoUpdate({
          target: transactions.id,
          set: {
            categoryId: tx.categoryId,
            type: tx.type,
            amountCents: tx.amountCents,
            note: tx.note,
            occurredAt: tx.occurredAt,
            updatedAt: tx.updatedAt,
          },
        })
        .run();
    },
    async delete(id) {
      db.delete(transactions).where(eq(transactions.id, id)).run();
    },
  };
}

function map(row: typeof transactions.$inferSelect): Transaction {
  return {
    id: row.id,
    userId: row.userId,
    categoryId: row.categoryId,
    type: row.type as Transaction['type'],
    amountCents: row.amountCents,
    note: row.note,
    occurredAt: row.occurredAt,
    updatedAt: row.updatedAt,
  };
}
