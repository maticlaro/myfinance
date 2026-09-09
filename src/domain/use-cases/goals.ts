import { DomainError } from '../errors';
import type { Goal } from '../entities';
import type { Clock, GoalRepository, IdGen, OutboxRepository } from '../ports';

async function persist(deps: {
  goals: GoalRepository;
  outbox: OutboxRepository;
  ids: IdGen;
  clock: Clock;
}, goal: Goal) {
  await deps.goals.upsert(goal);
  await deps.outbox.enqueue({
    id: deps.ids.id(),
    userId: goal.userId,
    entity: 'goal',
    op: 'upsert',
    payload: JSON.stringify(goal),
    attempts: 0,
    createdAt: deps.clock.nowIso(),
  });
}

export function createGoalUseCases(deps: {
  goals: GoalRepository;
  outbox: OutboxRepository;
  ids: IdGen;
  clock: Clock;
}) {
  return {
    async create(input: {
      userId: string;
      name: string;
      targetPesos: number;
      deadline: string | null;
    }): Promise<Goal> {
      if (!input.name.trim()) throw new DomainError('El objetivo necesita un nombre');
      if (!Number.isFinite(input.targetPesos) || input.targetPesos <= 0) {
        throw new DomainError('La meta debe ser mayor a 0');
      }
      const goal: Goal = {
        id: deps.ids.id(),
        userId: input.userId,
        name: input.name.trim(),
        targetCents: Math.round(input.targetPesos * 100),
        currentCents: 0,
        deadline: input.deadline,
        updatedAt: deps.clock.nowIso(),
      };
      await persist(deps, goal);
      return goal;
    },

    async contribute(userId: string, goalId: string, pesos: number): Promise<Goal> {
      const goal = await deps.goals.getById(goalId);
      if (!goal || goal.userId !== userId) throw new DomainError('Objetivo no encontrado');
      if (!Number.isFinite(pesos) || pesos <= 0) throw new DomainError('El aporte debe ser mayor a 0');
      const next: Goal = {
        ...goal,
        currentCents: goal.currentCents + Math.round(pesos * 100),
        updatedAt: deps.clock.nowIso(),
      };
      await persist(deps, next);
      return next;
    },

    list(userId: string) {
      return deps.goals.list(userId);
    },
  };
}
