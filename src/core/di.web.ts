import {
  memoryBudgetRepository,
  memoryCategoryRepository,
  memoryGoalRepository,
  memoryOutboxRepository,
  memorySyncAdapter,
  memoryTransactionRepository,
  memoryUserRepository,
} from '@/data/memory/repositories';
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
  const users = memoryUserRepository();
  const categories = memoryCategoryRepository();
  const transactions = memoryTransactionRepository();
  const budgets = memoryBudgetRepository();
  const goals = memoryGoalRepository();
  const outbox = memoryOutboxRepository();
  const sync = memorySyncAdapter();
  const syncEngine = new SyncEngine(outbox, sync, netInfoPort, demoFlagsStore);

  return {
    db: null,
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
