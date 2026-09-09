import { eq } from 'drizzle-orm';

import type { Category } from '@/domain/entities';
import type { CategoryRepository } from '@/domain/ports';
import type { AppDb } from '@/data/db/client';
import { categories } from '@/data/db/schema';

export function sqliteCategoryRepository(db: AppDb): CategoryRepository {
  return {
    async listByUser(userId) {
      return db.select().from(categories).where(eq(categories.userId, userId)).all().map(map);
    },
    async getById(id) {
      const row = db.select().from(categories).where(eq(categories.id, id)).get();
      return row ? map(row) : null;
    },
    async insertMany(items) {
      if (!items.length) return;
      db.insert(categories)
        .values(
          items.map((c) => ({
            id: c.id,
            userId: c.userId,
            name: c.name,
            type: c.type,
            isSystem: c.isSystem ? 1 : 0,
          })),
        )
        .run();
    },
  };
}

function map(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    type: row.type as Category['type'],
    isSystem: row.isSystem === 1,
  };
}
