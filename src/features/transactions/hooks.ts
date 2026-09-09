import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getContainer } from '@/core/di';
import { currentMonth, monthStartEnd } from '@/core/format';
import { notifyBudgetThreshold } from '@/core/notifications';
import type { TransactionFilters, TransactionType } from '@/domain/entities';
import { useSession } from '@/features/auth/session-provider';

export function useCategories() {
  const { session } = useSession();
  return useQuery({
    queryKey: ['categories', session?.userId],
    enabled: Boolean(session),
    queryFn: () => getContainer().categories.listByUser(session!.userId),
  });
}

export function useTransactions(filters: TransactionFilters) {
  const { session } = useSession();
  return useQuery({
    queryKey: ['transactions', session?.userId, filters],
    enabled: Boolean(session),
    queryFn: () => getContainer().transactions.list(session!.userId, filters),
  });
}

export function useSaveTransaction() {
  const { session } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      categoryId: string;
      type: TransactionType;
      amountPesos: number;
      note: string;
      occurredAt: string;
    }) => {
      const app = getContainer();
      const userId = session!.userId;
      const tx = input.id
        ? await app.transactions.update({ ...input, id: input.id, userId })
        : await app.transactions.add({ ...input, userId });
      if (tx.type === 'expense') {
        const month = currentMonth();
        const { from, to } = monthStartEnd(month);
        const summary = await app.dashboard.summarize(userId, { from, to }, month);
        const row = summary.budgetProgress.find((b) => b.categoryId === tx.categoryId);
        if (row && row.limitCents > 0) {
          const ratio = row.spentCents / row.limitCents;
          if (ratio >= 0.8) await notifyBudgetThreshold(row.name, ratio);
        }
      }
      return tx;
    },
    onSuccess: () => {
      client.invalidateQueries();
    },
  });
}

export function useDeleteTransaction() {
  const { session } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getContainer().transactions.remove(session!.userId, id),
    onSuccess: () => client.invalidateQueries(),
  });
}
