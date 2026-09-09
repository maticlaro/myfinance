import { eq } from 'drizzle-orm';

import type { User } from '@/domain/entities';
import type { UserRepository } from '@/domain/ports';
import type { AppDb } from '@/data/db/client';
import { users } from '@/data/db/schema';

export function sqliteUserRepository(db: AppDb): UserRepository {
  return {
    async findByEmail(email) {
      const row = db.select().from(users).where(eq(users.email, email)).get();
      return row ? map(row) : null;
    },
    async getById(id) {
      const row = db.select().from(users).where(eq(users.id, id)).get();
      return row ? map(row) : null;
    },
    async insert(user) {
      db.insert(users).values({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
        currency: user.currency,
        createdAt: user.createdAt,
      }).run();
    },
  };
}

function map(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    passwordSalt: row.passwordSalt,
    currency: row.currency as User['currency'],
    createdAt: row.createdAt,
  };
}
