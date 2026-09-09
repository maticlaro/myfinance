import type { Budget, Category, Goal, OutboxItem, Transaction, User } from '@/domain/entities';

export type RemoteEvent = {
  id: string;
  userId: string;
  entity: OutboxItem['entity'];
  op: OutboxItem['op'];
  payload: string;
  receivedAt: string;
};

export type MemoryState = {
  users: User[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  outbox: OutboxItem[];
  remote: RemoteEvent[];
};

const KEY = 'saldo.memory.v1';

function empty(): MemoryState {
  return {
    users: [],
    categories: [],
    transactions: [],
    budgets: [],
    goals: [],
    outbox: [],
    remote: [],
  };
}

function read(): MemoryState {
  if (typeof localStorage === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? ({ ...empty(), ...JSON.parse(raw) } as MemoryState) : empty();
  } catch {
    return empty();
  }
}

function write(state: MemoryState) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

let state = read();

export function memoryState() {
  return state;
}

export function persist() {
  write(state);
}

export function replace(next: MemoryState) {
  state = next;
  persist();
}
