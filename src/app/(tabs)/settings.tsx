import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { getContainer } from '@/core/di';
import { useDemoFlags } from '@/core/demo-flags';
import { scheduleDailyExpenseReminder } from '@/core/notifications';
import { useThemePreference } from '@/core/theme-preference';
import { useAuthActions } from '@/features/auth/hooks';
import { useExport } from '@/features/export/hooks';
import { useSession } from '@/features/auth/session-provider';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Screen } from '@/shared/ui/screen';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const { logout } = useAuthActions();
  const flags = useDemoFlags();
  const preference = useThemePreference();
  const exporter = useExport();
  const client = useQueryClient();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const pending = useQuery({
    queryKey: ['outbox-count', session?.userId, flags.forceOffline],
    enabled: Boolean(session),
    queryFn: () => getContainer().outbox.countPending(session!.userId),
  });
  const remote = useQuery({
    queryKey: ['remote-mirror', session?.userId],
    enabled: Boolean(session),
    queryFn: () => getContainer().sync.listRemote(session!.userId),
  });

  return (
    <Screen>
      <Card>
        <Text style={{ color: theme.text, fontWeight: '700' }}>{session?.email}</Text>
        <Text style={{ color: theme.textSecondary }}>Moneda {session?.currency} · SQLite local</Text>
        <Button label="Cerrar sesión" variant="ghost" onPress={() => logout.mutate()} />
      </Card>

      <Card>
        <Text style={{ color: theme.text, fontWeight: '700' }}>Tema</Text>
        {(['system', 'light', 'dark'] as const).map((key) => (
          <Button
            key={key}
            variant={preference.preference === key ? 'primary' : 'ghost'}
            label={key === 'system' ? 'Sistema' : key === 'light' ? 'Claro' : 'Oscuro'}
            onPress={() => preference.setPreference(key)}
          />
        ))}
      </Card>

      <Card>
        <Text style={{ color: theme.text, fontWeight: '700' }}>Demo de sync</Text>
        <Text style={{ color: theme.textSecondary }}>Cola pendiente: {pending.data ?? 0}</Text>
        <Text style={{ color: theme.textSecondary }}>Remoto mock: {remote.data?.length ?? 0} eventos</Text>
        <Row label="Forzar offline" value={flags.forceOffline} on={flags.setForceOffline} />
        <Row label="Inyectar error" value={flags.injectError} on={flags.setInjectError} />
        <Button
          label="Sincronizar ahora"
          onPress={async () => {
            const result = await getContainer().syncEngine.drain(session!.userId);
            setSyncMsg(
              result.error
                ? result.error
                : result.skipped
                  ? 'Offline: la cola no se drenó'
                  : `Push ${result.pushed} item(s)`,
            );
            client.invalidateQueries();
          }}
        />
        {syncMsg ? <Text style={{ color: theme.primary }}>{syncMsg}</Text> : null}
      </Card>

      <Card>
        <Text style={{ color: theme.text, fontWeight: '700' }}>Notificaciones y export</Text>
        <Button label="Activar recordatorio diario (20:00)" onPress={() => scheduleDailyExpenseReminder()} />
        <Button label="Exportar CSV del mes" variant="ghost" onPress={() => exporter.csv()} />
        <Button label="Exportar PDF del mes" variant="ghost" onPress={() => exporter.pdf()} />
      </Card>
    </Screen>
  );
}

function Row({ label, value, on }: { label: string; value: boolean; on: (v: boolean) => void }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: theme.text }}>{label}</Text>
      <Switch value={value} onValueChange={on} />
    </View>
  );
}
