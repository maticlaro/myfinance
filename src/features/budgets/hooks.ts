import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getContainer } from '@/core/di';
import { currentMonth } from '@/core/format';
import { useSession } from '@/features/auth/session-provider';

export function useBudgets() {
  const { session } = useSession();
  const month = currentMonth();
  return useQuery({
    queryKey: ['budgets', session?.userId, month],
    enabled: Boolean(session),
    queryFn: () => getContainer().budgets.listByMonth(session!.userId, month),
  });
}

export function useSaveBudget() {
  const { session } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { categoryId: string; limitPesos: number; id?: string }) =>
      getContainer().budgets.upsert({
        ...input,
        userId: session!.userId,
        month: currentMonth(),
      }),
    onSuccess: () => client.invalidateQueries(),
  });
}
