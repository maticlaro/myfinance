export type TransactionType = 'income' | 'expense';
export type SyncEntity = 'transaction' | 'budget' | 'goal' | 'category';
export type SyncOp = 'upsert' | 'delete';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  currency: 'CLP';
  createdAt: string;
};

export type Session = {
  userId: string;
  email: string;
  currency: 'CLP';
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  isSystem: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amountCents: number;
  note: string;
  occurredAt: string;
  updatedAt: string;
};

export type Budget = {
  id: string;
  userId: string;
  categoryId: string;
  month: string;
  limitCents: number;
  updatedAt: string;
};

export type Goal = {
  id: string;
  userId: string;
  name: string;
  targetCents: number;
  currentCents: number;
  deadline: string | null;
  updatedAt: string;
};

export type OutboxItem = {
  id: string;
  userId: string;
  entity: SyncEntity;
  op: SyncOp;
  payload: string;
  attempts: number;
  createdAt: string;
};

export type TransactionFilters = {
  from?: string;
  to?: string;
  categoryId?: string;
  type?: TransactionType;
};

export type DashboardSummary = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  byCategory: { categoryId: string; name: string; type: TransactionType; totalCents: number }[];
  byMonth: { month: string; incomeCents: number; expenseCents: number }[];
  budgetProgress: {
    categoryId: string;
    name: string;
    spentCents: number;
    limitCents: number;
  }[];
};
