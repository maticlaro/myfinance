import { openAppDb } from '@/data/db/client';
import { sqliteBudgetRepository } from '@/data/repositories/sqlite-budget-repository';
import { sqliteCategoryRepository } from '@/data/repositories/sqlite-category-repository';
import { sqliteGoalRepository } from '@/data/repositories/sqlite-goal-repository';
import { sqliteOutboxRepository } from '@/data/repositories/sqlite-outbox-repository';
import { sqliteTransactionRepository } from '@/data/repositories/sqlite-transaction-repository';
import { sqliteUserRepository } from '@/data/repositories/sqlite-user-repository';
import { mockSyncAdapter } from '@/data/sync/mock-sync-adapter';
import { SyncEngine } from '@/data/sync/sync-engine';
import { createAuthUseCases } from '@/domain/use-cases/auth';
import { createBudgetUseCases } from '@/domain/use-cases/budgets';
import { createDashboardUseCases } from '@/domain/use-cases/dashboard';
import { createExportUseCases } from '@/domain/use-cases/export';
import { createGoalUseCases } from '@/domain/use-cases/goals';
import { createTransactionUseCases } from '@/domain/use-cases/transactions';

import { systemClock } from './clock';
import { expoIdGen, expoPasswordHasher } from './crypto';
import { demoFlagsStore } from './demo-flags';
import { netInfoPort } from './network';
import { secureSessionStore } from './session-store';

export type AppContainer = ReturnType<typeof buildContainer>;

let container: AppContainer | null = null;

function buildContainer() {
  const { db } = openAppDb();
  const users = sqliteUserRepository(db);
  const categories = sqliteCategoryRepository(db);
  const transactions = sqliteTransactionRepository(db);
  const budgets = sqliteBudgetRepository(db);
  const goals = sqliteGoalRepository(db);
  const outbox = sqliteOutboxRepository(db);
  const sync = mockSyncAdapter(db);
  const syncEngine = new SyncEngine(outbox, sync, netInfoPort, demoFlagsStore);

  return {
    db,
    session: secureSessionStore,
    outbox,
    sync,
    syncEngine,
    auth: createAuthUseCases({
      users,
      categories,
      session: secureSessionStore,
      hasher: expoPasswordHasher,
      ids: expoIdGen,
      clock: systemClock,
    }),
    transactions: createTransactionUseCases({
      transactions,
      outbox,
      ids: expoIdGen,
      clock: systemClock,
    }),
    categories,
    budgets: createBudgetUseCases({
      budgets,
      outbox,
      ids: expoIdGen,
      clock: systemClock,
    }),
    budgetRepo: budgets,
    goals: createGoalUseCases({
      goals,
      outbox,
      ids: expoIdGen,
      clock: systemClock,
    }),
    dashboard: createDashboardUseCases({ transactions, categories, budgets }),
    export: createExportUseCases({ transactions, categories }),
  };
}

export function bootApp() {
  if (!container) container = buildContainer();
  return container;
}

export function getContainer() {
  if (!container) throw new Error('App container not booted. Call bootApp() first.');
  return container;
}
