import { describe, expect, it } from 'vitest';

import type { OutboxItem } from '@/domain/entities';
import { SyncEngine } from './sync-engine';

function item(id: string): OutboxItem {
  return {
    id,
    userId: 'u1',
    entity: 'transaction',
    op: 'upsert',
    payload: '{}',
    attempts: 0,
    createdAt: 't',
  };
}

describe('SyncEngine', () => {
  it('does not drain when offline', async () => {
    const pending = [item('1')];
    const engine = new SyncEngine(
      {
        enqueue: async () => {},
        listPending: async () => pending,
        remove: async () => {},
        incrementAttempts: async () => {},
        countPending: async () => pending.length,
      },
      { push: async () => {}, pull: async () => {}, listRemote: async () => [] },
      { isOnline: async () => true },
      { get: () => ({ forceOffline: true, injectError: false, latencyMs: 0 }) },
    );
    const result = await engine.drain('u1');
    expect(result.pushed).toBe(0);
    expect(result.skipped).toBe('offline');
  });

  it('pushes and removes items when online', async () => {
    const pending = [item('1'), item('2')];
    const pushed: string[] = [];
    const engine = new SyncEngine(
      {
        enqueue: async () => {},
        listPending: async () => [...pending],
        remove: async (id) => {
          const i = pending.findIndex((x) => x.id === id);
          if (i >= 0) pending.splice(i, 1);
        },
        incrementAttempts: async () => {},
        countPending: async () => pending.length,
      },
      {
        push: async (row) => {
          pushed.push(row.id);
        },
        pull: async () => {},
        listRemote: async () => [],
      },
      { isOnline: async () => true },
      { get: () => ({ forceOffline: false, injectError: false, latencyMs: 0 }) },
    );
    const result = await engine.drain('u1');
    expect(result.pushed).toBe(2);
    expect(pushed).toEqual(['1', '2']);
    expect(pending).toHaveLength(0);
  });

  it('stops and increments attempts on injected error', async () => {
    let attempts = 0;
    const engine = new SyncEngine(
      {
        enqueue: async () => {},
        listPending: async () => [item('1')],
        remove: async () => {},
        incrementAttempts: async () => {
          attempts += 1;
        },
        countPending: async () => 1,
      },
      { push: async () => {}, pull: async () => {}, listRemote: async () => [] },
      { isOnline: async () => true },
      { get: () => ({ forceOffline: false, injectError: true, latencyMs: 0 }) },
    );
    const result = await engine.drain('u1');
    expect(result.error).toBeTruthy();
    expect(attempts).toBe(1);
    expect(result.pushed).toBe(0);
  });
});
