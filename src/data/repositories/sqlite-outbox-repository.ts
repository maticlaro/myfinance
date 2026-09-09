import { eq } from 'drizzle-orm';

import type { OutboxItem } from '@/domain/entities';
import type { OutboxRepository } from '@/domain/ports';
import type { AppDb } from '@/data/db/client';
import { outbox } from '@/data/db/schema';

export function sqliteOutboxRepository(db: AppDb): OutboxRepository {
  return {
    async enqueue(item) {
      db.insert(outbox)
        .values({
          id: item.id,
          userId: item.userId,
          entity: item.entity,
          op: item.op,
          payload: item.payload,
          attempts: item.attempts,
          createdAt: item.createdAt,
        })
        .run();
    },
    async listPending(userId) {
      return db.select().from(outbox).where(eq(outbox.userId, userId)).all().map(map);
    },
    async remove(id) {
      db.delete(outbox).where(eq(outbox.id, id)).run();
    },
    async incrementAttempts(id) {
      const row = db.select().from(outbox).where(eq(outbox.id, id)).get();
      if (!row) return;
      db.update(outbox).set({ attempts: row.attempts + 1 }).where(eq(outbox.id, id)).run();
    },
    async countPending(userId) {
      return db.select().from(outbox).where(eq(outbox.userId, userId)).all().length;
    },
  };
}

function map(row: typeof outbox.$inferSelect): OutboxItem {
  return {
    id: row.id,
    userId: row.userId,
    entity: row.entity as OutboxItem['entity'],
    op: row.op as OutboxItem['op'],
    payload: row.payload,
    attempts: row.attempts,
    createdAt: row.createdAt,
  };
}
