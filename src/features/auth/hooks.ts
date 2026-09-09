import { useMutation } from '@tanstack/react-query';

import { getContainer } from '@/core/di';
import { DomainError } from '@/domain/errors';
import { useSession } from './session-provider';

export function useAuthActions() {
  const { setSession } = useSession();

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      getContainer().auth.login(email, password),
    onSuccess: setSession,
  });

  const register = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      getContainer().auth.register(email, password),
    onSuccess: setSession,
  });

  const logout = useMutation({
    mutationFn: () => getContainer().auth.logout(),
    onSuccess: () => setSession(null),
  });

  return { login, register, logout };
}

export function mutationMessage(error: unknown) {
  if (error instanceof DomainError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error';
}
