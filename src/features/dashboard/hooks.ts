import { useQuery } from '@tanstack/react-query';

import { getContainer } from '@/core/di';
import { currentMonth, monthStartEnd } from '@/core/format';
import { useSession } from '@/features/auth/session-provider';

export function useDashboard() {
  const { session } = useSession();
  const month = currentMonth();
  const range = monthStartEnd(month);
  return useQuery({
    queryKey: ['dashboard', session?.userId, month],
    enabled: Boolean(session),
    queryFn: () => getContainer().dashboard.summarize(session!.userId, range, month),
  });
}
