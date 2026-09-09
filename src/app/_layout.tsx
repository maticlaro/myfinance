import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/core/providers';
import { useResolvedScheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useResolvedScheme();
  return (
    <AppProviders>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="transaction-form"
          options={{ presentation: 'modal', headerShown: true, title: 'Movimiento' }}
        />
        <Stack.Screen
          name="goal-form"
          options={{ presentation: 'modal', headerShown: true, title: 'Objetivo' }}
        />
        <Stack.Screen
          name="budget-form"
          options={{ presentation: 'modal', headerShown: true, title: 'Presupuesto' }}
        />
      </Stack>
    </AppProviders>
  );
}
