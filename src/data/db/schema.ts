import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  currency: text('currency').notNull(),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  isSystem: integer('is_system').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  categoryId: text('category_id').notNull(),
  type: text('type').notNull(),
  amountCents: integer('amount_cents').notNull(),
  note: text('note').notNull(),
  occurredAt: text('occurred_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  categoryId: text('category_id').notNull(),
  month: text('month').notNull(),
  limitCents: integer('limit_cents').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  targetCents: integer('target_cents').notNull(),
  currentCents: integer('current_cents').notNull(),
  deadline: text('deadline'),
  updatedAt: text('updated_at').notNull(),
});

export const outbox = sqliteTable('outbox', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  entity: text('entity').notNull(),
  op: text('op').notNull(),
  payload: text('payload').notNull(),
  attempts: integer('attempts').notNull(),
  createdAt: text('created_at').notNull(),
});

export const remoteMirror = sqliteTable('remote_mirror', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  entity: text('entity').notNull(),
  op: text('op').notNull(),
  payload: text('payload').notNull(),
  receivedAt: text('received_at').notNull(),
});
