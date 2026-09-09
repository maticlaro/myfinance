# Architecture spine

Saldo is a **local-first** Expo app. SQLite is the source of truth. The UI never talks to SQLite or to the network. A composition root wires ports to adapters.

## Invariants

1. Screens call hooks / use cases only. Zero SQL, zero fetch.
2. Use cases depend on ports (`UserRepository`, `TransactionRepository`, `SyncPort`, …), not Drizzle.
3. SQLite is the only source of truth. `MockSyncAdapter` is a mirror (`remote_mirror` table).
4. Every mutation writes locally **and** enqueues an outbox row. `SyncEngine` drains the queue when online.
5. `src/core/di.ts` is the only place adapters are constructed.

Conflict strategy: last-write-wins on `updatedAt` (documented for a future real remote; the mock only records pushed events).

Amounts are integer **cents**. Default currency: `CLP`.

## Layers

```
src/app/            Expo Router screens (thin)
src/features/       hooks that call use cases
src/domain/         entities, ports, use cases
src/data/           Drizzle schema, SQLite repos, SyncEngine, MockSyncAdapter
src/core/           composition root, session, theme, notifications
src/shared/         UI primitives and charts
```

## Sync

```
mutation → repository.upsert → outbox.enqueue
SyncEngine.drain → (if online) SyncPort.push → outbox.remove
```

Settings can force offline, inject a sync error, and show pending vs remote-mirror counts. Swap `MockSyncAdapter` for a real API without changing features.

## Auth

Registration / login hash passwords with SHA-256 + salt (demo only) and persist the session in SecureStore.
