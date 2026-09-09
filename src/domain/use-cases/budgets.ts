import { DomainError } from '../errors';
import type { Budget } from '../entities';
import type { BudgetRepository, Clock, IdGen, OutboxRepository } from '../ports';

export function createBudgetUseCases(deps: {
  budgets: BudgetRepository;
  outbox: OutboxRepository;
  ids: IdGen;
  clock: Clock;
}) {
  return {
    async upsert(input: {
      userId: string;
      categoryId: string;
      month: string;
      limitPesos: number;
      id?: string;
    }): Promise<Budget> {
      if (!Number.isFinite(input.limitPesos) || input.limitPesos <= 0) {
        throw new DomainError('El presupuesto debe ser mayor a 0');
      }
      const budget: Budget = {
        id: input.id ?? deps.ids.id(),
        userId: input.userId,
        categoryId: input.categoryId,
        month: input.month,
        limitCents: Math.round(input.limitPesos * 100),
        updatedAt: deps.clock.nowIso(),
      };
      await deps.budgets.upsert(budget);
      await deps.outbox.enqueue({
        id: deps.ids.id(),
        userId: budget.userId,
        entity: 'budget',
        op: 'upsert',
        payload: JSON.stringify(budget),
        attempts: 0,
        createdAt: deps.clock.nowIso(),
      });
      return budget;
    },

    listByMonth(userId: string, month: string) {
      return deps.budgets.listByMonth(userId, month);
    },
  };
}
