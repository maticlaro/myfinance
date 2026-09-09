import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getContainer } from '@/core/di';
import { useSession } from '@/features/auth/session-provider';

export function useGoals() {
  const { session } = useSession();
  return useQuery({
    queryKey: ['goals', session?.userId],
    enabled: Boolean(session),
    queryFn: () => getContainer().goals.list(session!.userId),
  });
}

export function useCreateGoal() {
  const { session } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; targetPesos: number; deadline: string | null }) =>
      getContainer().goals.create({ ...input, userId: session!.userId }),
    onSuccess: () => client.invalidateQueries(),
  });
}

export function useContributeGoal() {
  const { session } = useSession();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, pesos }: { goalId: string; pesos: number }) =>
      getContainer().goals.contribute(session!.userId, goalId, pesos),
    onSuccess: () => client.invalidateQueries(),
  });
}
