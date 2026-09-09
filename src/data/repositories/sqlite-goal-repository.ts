import { eq } from 'drizzle-orm';

import type { Goal } from '@/domain/entities';
import type { GoalRepository } from '@/domain/ports';
import type { AppDb } from '@/data/db/client';
import { goals } from '@/data/db/schema';

export function sqliteGoalRepository(db: AppDb): GoalRepository {
  return {
    async list(userId) {
      return db.select().from(goals).where(eq(goals.userId, userId)).all().map(map);
    },
    async getById(id) {
      const row = db.select().from(goals).where(eq(goals.id, id)).get();
      return row ? map(row) : null;
    },
    async upsert(goal) {
      db.insert(goals)
        .values({
          id: goal.id,
          userId: goal.userId,
          name: goal.name,
          targetCents: goal.targetCents,
          currentCents: goal.currentCents,
          deadline: goal.deadline,
          updatedAt: goal.updatedAt,
        })
        .onConflictDoUpdate({
          target: goals.id,
          set: {
            name: goal.name,
            targetCents: goal.targetCents,
            currentCents: goal.currentCents,
            deadline: goal.deadline,
            updatedAt: goal.updatedAt,
          },
        })
        .run();
    },
    async delete(id) {
      db.delete(goals).where(eq(goals.id, id)).run();
    },
  };
}

function map(row: typeof goals.$inferSelect): Goal {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    targetCents: row.targetCents,
    currentCents: row.currentCents,
    deadline: row.deadline,
    updatedAt: row.updatedAt,
  };
}
