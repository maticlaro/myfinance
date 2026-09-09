import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { type ReactNode } from 'react';

import { bootApp } from '@/core/di';
import { useResolvedScheme } from '@/hooks/use-theme';
import { SessionProvider } from '@/features/auth/session-provider';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  const scheme = useResolvedScheme();
  bootApp();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
