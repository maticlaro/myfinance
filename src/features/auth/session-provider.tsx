import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getContainer } from '@/core/di';
import type { Session } from '@/domain/entities';

type SessionCtx = {
  session: Session | null;
  ready: boolean;
  setSession: (session: Session | null) => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    const current = await getContainer().auth.current();
    setSession(current);
  };

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, []);

  const value = useMemo(() => ({ session, ready, setSession, refresh }), [session, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
