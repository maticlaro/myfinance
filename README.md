# Saldo

Local-first personal finance app for iOS and Android. Built as a **frontend architecture portfolio piece**: authentication, SQLite as source of truth, an offline outbox, a swappable sync adapter, charts, tests, and a hard boundary between UI, domain, and data.

Spanish UI. English code, commits, and docs.

This repo is intentionally **not** a production product. There is no real backend. Sync talks to a mock adapter that simulates latency, failures, and a remote cursor — so the same ports can later bind to Supabase or a custom API without touching feature code.

## What a reviewer should look at

1. `ARCHITECTURE.md` — invariants (local-first, ports/adapters, outbox).
2. `src/core/di.ts` — composition root. The only place adapters are wired.
3. `src/domain/` — use cases depend on ports, never on Drizzle or React Native.
4. `src/data/sync/` — `SyncEngine` + `Outbox` + `MockSyncAdapter`.
5. `src/app/` — Expo Router screens. Thin. No SQL, no fetch.

## Features

- Email/password registration and login (local SQLite + SecureStore session)
- Categorized income and expenses
- Monthly budgets per category
- Savings goals
- Dashboard with charts
- Filters by date and category
- Offline support; sync when connectivity returns (mock remote)
- Light / dark theme
- Local notifications for expense reminders and budget thresholds
- Export movements to CSV or PDF

## Stack

- Expo SDK 57 + Expo Router + TypeScript (strict)
- expo-sqlite + Drizzle ORM
- Zustand (theme + demo sync flags)
- TanStack Query (reads through repositories)
- Custom bar charts (no extra native chart engine)
- NetInfo, expo-secure-store, expo-notifications, expo-print, expo-sharing
- Vitest for domain and sync-engine tests

## Architecture

Paradigm: **local-first + ports/adapters** (lightweight clean architecture).

```
src/app/                Expo Router — thin screens
src/core/               composition root, session, theme, notifications
src/domain/             entities, ports, use cases
src/data/
  db/                   Drizzle schema + SQLite bootstrap
  repositories/
  sync/                 SyncEngine, MockSyncAdapter
src/features/           hooks (auth, transactions, budgets, goals, dashboard, export)
src/shared/ui/
```

Rules:

1. Screens call hooks / use cases only. Zero SQL, zero fetch.
2. Use cases depend on ports (`UserRepository`, `TransactionRepository`, `SyncPort`), not Drizzle.
3. SQLite is the only source of truth. The mock remote is a mirror.
4. Every mutation writes locally **and** enqueues an outbox row. `SyncEngine` drains the queue when online.
5. `src/core/di.ts` wires adapters. No DI framework.

Conflict strategy: last-write-wins on `updatedAt`.

Amounts are stored as **integer cents**. Default currency: `CLP`.

## Getting started

```bash
git clone https://github.com/maticlaro/myfinance.git
cd myfinance
npm install
npx expo start
```

Requirements: Node 20+, Expo Go (SDK 57) or an iOS Simulator / Android emulator.

```bash
npm test
```

In **Ajustes** you can force offline, inject a sync error, drain the outbox, and export CSV/PDF.

## Project status

- Phase 0 — Scaffold, theme, composition root, SQLite schema — Done
- Phase 1 — Auth + tab shell — Done
- Phase 2 — Transactions CRUD + filters — Done
- Phase 3 — Dashboard + charts — Done
- Phase 4 — Budgets + savings goals — Done
- Phase 5 — Outbox + mock sync + offline banner — Done
- Phase 6 — Notifications + CSV/PDF export — Done
- Phase 7 — Tests + architecture polish — Done

## Out of scope

Real backend, true multi-device sync, bank connections, biometrics, full multi-currency, App Store submission.

## License

MIT
