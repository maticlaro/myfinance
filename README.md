# Saldo

Local-first personal finance app for iOS and Android. Built as a **frontend architecture portfolio piece**: authentication, SQLite as source of truth, an offline outbox, a swappable sync adapter, charts, tests, and a hard boundary between UI, domain, and data.

Spanish UI. English code, commits, and docs.

This repo is intentionally **not** a production product. There is no real backend. Sync talks to a mock adapter that simulates latency, failures, and a remote cursor — so the same ports can later bind to Supabase or a custom API without touching feature code.

## What a reviewer should look at

1. `ARCHITECTURE.md` — invariants (local-first, ports/adapters, outbox).
2. `src/core/di.ts` — composition root. The only place adapters are wired.
3. `src/domain/` — use cases depend on ports, never on Drizzle or React Native.
4. `src/data/sync/` — `SyncEngine` + `Outbox` + `MockSyncAdapter`.
5. `app/` — Expo Router screens. Thin. No SQL, no fetch.

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

- Expo + Expo Router + TypeScript (strict)
- expo-sqlite + Drizzle ORM
- Zustand (UI state only: theme, session, screen filters)
- TanStack Query (reads through repositories)
- Zod
- victory-native + react-native-skia
- NetInfo, expo-secure-store, expo-notifications, expo-print, expo-sharing
- Jest + React Native Testing Library

## Architecture

Paradigm: **local-first + ports/adapters** (lightweight clean architecture).

```
app/                    Expo Router — thin screens
src/
  core/                 theme, composition root, errors, netinfo
  domain/               entities, ports, use cases
  data/
    db/                 Drizzle schema + migrations
    repositories/
    sync/               SyncEngine, Outbox, MockSyncAdapter
  features/             auth, transactions, budgets, goals, dashboard, settings, export
  shared/ui/
```

Rules:

1. Screens call hooks / use cases only. Zero SQL, zero fetch.
2. Use cases depend on ports (`AuthPort`, `TransactionRepository`, `SyncPort`), not Drizzle.
3. SQLite is the only source of truth. The mock remote is a mirror.
4. Every mutation writes locally **and** enqueues an outbox row. `SyncEngine` drains the queue when online.
5. `src/core/di.ts` wires adapters. No DI framework.

Conflict strategy: last-write-wins on `updatedAt`.

Amounts are stored as **integer cents**. Default currency: `CLP`.

## Getting started

> The Expo app is not scaffolded yet. After `npx create-expo-app`, this section becomes the real runbook.

```bash
git clone https://github.com/maticlaro/myfinance.git
cd myfinance
npx expo install
npx expo start
```

Requirements: Node 20+, Expo Go or an iOS Simulator / Android emulator.

```bash
npm test
```

## Project status

Roadmap (each phase leaves the app runnable):

- Phase 0 — Scaffold, theme, composition root, SQLite schema — Planned
- Phase 1 — Auth + tab shell — Planned
- Phase 2 — Transactions CRUD + filters — Planned
- Phase 3 — Dashboard + charts — Planned
- Phase 4 — Budgets + savings goals — Planned
- Phase 5 — Outbox + mock sync + offline banner — Planned
- Phase 6 — Notifications + CSV/PDF export — Planned
- Phase 7 — Tests + architecture polish — Planned

## Out of scope

Real backend, true multi-device sync, bank connections, biometrics, full multi-currency, App Store submission.

## License

MIT
