import type {
  Budget,
  Category,
  Goal,
  OutboxItem,
  Session,
  SyncEntity,
  SyncOp,
  Transaction,
  TransactionFilters,
  User,
} from './entities';

export type Clock = { nowIso: () => string };
export type IdGen = { id: () => string };

export type PasswordHasher = {
  newSalt: () => string;
  hash: (password: string, salt: string) => Promise<string>;
};

export type SessionStore = {
  get: () => Promise<Session | null>;
  set: (session: Session) => Promise<void>;
  clear: () => Promise<void>;
};

export type NetworkPort = {
  isOnline: () => Promise<boolean>;
};

export type UserRepository = {
  findByEmail: (email: string) => Promise<User | null>;
  getById: (id: string) => Promise<User | null>;
  insert: (user: User) => Promise<void>;
};

export type CategoryRepository = {
  listByUser: (userId: string) => Promise<Category[]>;
  getById: (id: string) => Promise<Category | null>;
  insertMany: (categories: Category[]) => Promise<void>;
};

export type TransactionRepository = {
  list: (userId: string, filters?: TransactionFilters) => Promise<Transaction[]>;
  getById: (id: string) => Promise<Transaction | null>;
  upsert: (tx: Transaction) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

export type BudgetRepository = {
  listByMonth: (userId: string, month: string) => Promise<Budget[]>;
  listAll: (userId: string) => Promise<Budget[]>;
  upsert: (budget: Budget) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

export type GoalRepository = {
  list: (userId: string) => Promise<Goal[]>;
  getById: (id: string) => Promise<Goal | null>;
  upsert: (goal: Goal) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

export type OutboxRepository = {
  enqueue: (item: OutboxItem) => Promise<void>;
  listPending: (userId: string) => Promise<OutboxItem[]>;
  remove: (id: string) => Promise<void>;
  incrementAttempts: (id: string) => Promise<void>;
  countPending: (userId: string) => Promise<number>;
};

export type SyncPort = {
  push: (item: OutboxItem) => Promise<void>;
  pull: (userId: string) => Promise<void>;
  listRemote: (userId: string) => Promise<{ entity: SyncEntity; op: SyncOp; payload: string; receivedAt: string }[]>;
};

export type DemoFlags = {
  forceOffline: boolean;
  injectError: boolean;
  latencyMs: number;
};

export type DemoFlagsStore = {
  get: () => DemoFlags;
};
