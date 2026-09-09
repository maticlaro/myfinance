import type {
  BudgetRepository,
  CategoryRepository,
  GoalRepository,
  OutboxRepository,
  SyncPort,
  TransactionRepository,
  UserRepository,
} from '@/domain/ports';

import { memoryState, persist } from './store';

export function memoryUserRepository(): UserRepository {
  return {
    async findByEmail(email) {
      return memoryState().users.find((u) => u.email === email) ?? null;
    },
    async getById(id) {
      return memoryState().users.find((u) => u.id === id) ?? null;
    },
    async insert(user) {
      memoryState().users.push(user);
      persist();
    },
  };
}

export function memoryCategoryRepository(): CategoryRepository {
  return {
    async listByUser(userId) {
      return memoryState().categories.filter((c) => c.userId === userId);
    },
    async getById(id) {
      return memoryState().categories.find((c) => c.id === id) ?? null;
    },
    async insertMany(items) {
      memoryState().categories.push(...items);
      persist();
    },
  };
}

export function memoryTransactionRepository(): TransactionRepository {
  return {
    async list(userId, filters) {
      return memoryState()
        .transactions.filter((tx) => tx.userId === userId)
        .filter((tx) => !filters?.from || tx.occurredAt >= filters.from)
        .filter((tx) => !filters?.to || tx.occurredAt <= filters.to)
        .filter((tx) => !filters?.categoryId || tx.categoryId === filters.categoryId)
        .filter((tx) => !filters?.type || tx.type === filters.type)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    },
    async getById(id) {
      return memoryState().transactions.find((tx) => tx.id === id) ?? null;
    },
    async upsert(tx) {
      const rows = memoryState().transactions;
      const i = rows.findIndex((row) => row.id === tx.id);
      if (i >= 0) rows[i] = tx;
      else rows.push(tx);
      persist();
    },
    async delete(id) {
      const rows = memoryState().transactions;
      const i = rows.findIndex((row) => row.id === id);
      if (i >= 0) rows.splice(i, 1);
      persist();
    },
  };
}

export function memoryBudgetRepository(): BudgetRepository {
  return {
    async listByMonth(userId, month) {
      return memoryState().budgets.filter((b) => b.userId === userId && b.month === month);
    },
    async listAll(userId) {
      return memoryState().budgets.filter((b) => b.userId === userId);
    },
    async upsert(budget) {
      const rows = memoryState().budgets;
      const i = rows.findIndex((row) => row.id === budget.id);
      if (i >= 0) rows[i] = budget;
      else rows.push(budget);
      persist();
    },
    async delete(id) {
      const rows = memoryState().budgets;
      const i = rows.findIndex((row) => row.id === id);
      if (i >= 0) rows.splice(i, 1);
      persist();
    },
  };
}

export function memoryGoalRepository(): GoalRepository {
  return {
    async list(userId) {
      return memoryState().goals.filter((g) => g.userId === userId);
    },
    async getById(id) {
      return memoryState().goals.find((g) => g.id === id) ?? null;
    },
    async upsert(goal) {
      const rows = memoryState().goals;
      const i = rows.findIndex((row) => row.id === goal.id);
      if (i >= 0) rows[i] = goal;
      else rows.push(goal);
      persist();
    },
    async delete(id) {
      const rows = memoryState().goals;
      const i = rows.findIndex((row) => row.id === id);
      if (i >= 0) rows.splice(i, 1);
      persist();
    },
  };
}

export function memoryOutboxRepository(): OutboxRepository {
  return {
    async enqueue(item) {
      memoryState().outbox.push(item);
      persist();
    },
    async listPending(userId) {
      return memoryState().outbox.filter((item) => item.userId === userId);
    },
    async remove(id) {
      const rows = memoryState().outbox;
      const i = rows.findIndex((row) => row.id === id);
      if (i >= 0) rows.splice(i, 1);
      persist();
    },
    async incrementAttempts(id) {
      const item = memoryState().outbox.find((row) => row.id === id);
      if (item) {
        item.attempts += 1;
        persist();
      }
    },
    async countPending(userId) {
      return memoryState().outbox.filter((item) => item.userId === userId).length;
    },
  };
}

export function memorySyncAdapter(): SyncPort {
  return {
    async push(item) {
      memoryState().remote.push({
        id: item.id,
        userId: item.userId,
        entity: item.entity,
        op: item.op,
        payload: item.payload,
        receivedAt: new Date().toISOString(),
      });
      persist();
    },
    async pull() {},
    async listRemote(userId) {
      return memoryState()
        .remote.filter((row) => row.userId === userId)
        .map((row) => ({
          entity: row.entity,
          op: row.op,
          payload: row.payload,
          receivedAt: row.receivedAt,
        }));
    },
  };
}
