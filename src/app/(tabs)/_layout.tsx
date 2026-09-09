import { Tabs } from 'expo-router';

import { OfflineBanner } from '@/shared/ui/offline-banner';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <>
      <OfflineBanner />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
        }}>
        <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="movements" options={{ title: 'Movimientos' }} />
        <Tabs.Screen name="budgets" options={{ title: 'Presupuestos' }} />
        <Tabs.Screen name="goals" options={{ title: 'Objetivos' }} />
        <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
      </Tabs>
    </>
  );
}
