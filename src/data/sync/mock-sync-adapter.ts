import { eq } from 'drizzle-orm';

import type { SyncPort } from '@/domain/ports';
import type { AppDb } from '@/data/db/client';
import { remoteMirror } from '@/data/db/schema';

export function mockSyncAdapter(db: AppDb): SyncPort {
  return {
    async push(item) {
      db.insert(remoteMirror)
        .values({
          id: item.id,
          userId: item.userId,
          entity: item.entity,
          op: item.op,
          payload: item.payload,
          receivedAt: new Date().toISOString(),
        })
        .run();
    },
    async pull() {
      // Local SQLite is the source of truth. Pull is a no-op in the mock.
    },
    async listRemote(userId) {
      return db
        .select()
        .from(remoteMirror)
        .where(eq(remoteMirror.userId, userId))
        .all()
        .map((row) => ({
          entity: row.entity as 'transaction' | 'budget' | 'goal' | 'category',
          op: row.op as 'upsert' | 'delete',
          payload: row.payload,
          receivedAt: row.receivedAt,
        }));
    },
  };
}
