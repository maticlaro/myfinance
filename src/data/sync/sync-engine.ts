import type { DemoFlagsStore, NetworkPort, OutboxRepository, SyncPort } from '@/domain/ports';

export class SyncEngine {
  constructor(
    private readonly outbox: OutboxRepository,
    private readonly sync: SyncPort,
    private readonly network: NetworkPort,
    private readonly flags: DemoFlagsStore,
  ) {}

  async drain(userId: string): Promise<{ pushed: number; error?: string; skipped?: string }> {
    const flags = this.flags.get();
    const online = !flags.forceOffline && (await this.network.isOnline());
    if (!online) return { pushed: 0, skipped: 'offline' };

    const items = await this.outbox.listPending(userId);
    let pushed = 0;
    for (const item of items) {
      if (flags.injectError) {
        await this.outbox.incrementAttempts(item.id);
        return { pushed, error: 'Error de sync simulado desde Ajustes' };
      }
      if (flags.latencyMs > 0) {
        await new Promise((r) => setTimeout(r, flags.latencyMs));
      }
      await this.sync.push(item);
      await this.outbox.remove(item.id);
      pushed += 1;
    }
    await this.sync.pull(userId);
    return { pushed };
  }
}
