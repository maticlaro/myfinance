import { and, eq } from 'drizzle-orm';

import type { Budget } from '@/domain/entities';
import type { BudgetRepository } from '@/domain/ports';
import type { AppDb } from '@/data/db/client';
import { budgets } from '@/data/db/schema';

export function sqliteBudgetRepository(db: AppDb): BudgetRepository {
  return {
    async listByMonth(userId, month) {
      return db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.month, month)))
        .all()
        .map(map);
    },
    async listAll(userId) {
      return db.select().from(budgets).where(eq(budgets.userId, userId)).all().map(map);
    },
    async upsert(budget) {
      db.insert(budgets)
        .values({
          id: budget.id,
          userId: budget.userId,
          categoryId: budget.categoryId,
          month: budget.month,
          limitCents: budget.limitCents,
          updatedAt: budget.updatedAt,
        })
        .onConflictDoUpdate({
          target: budgets.id,
          set: {
            categoryId: budget.categoryId,
            month: budget.month,
            limitCents: budget.limitCents,
            updatedAt: budget.updatedAt,
          },
        })
        .run();
    },
    async delete(id) {
      db.delete(budgets).where(eq(budgets.id, id)).run();
    },
  };
}

function map(row: typeof budgets.$inferSelect): Budget {
  return {
    id: row.id,
    userId: row.userId,
    categoryId: row.categoryId,
    month: row.month,
    limitCents: row.limitCents,
    updatedAt: row.updatedAt,
  };
}
