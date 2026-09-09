import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { netInfoPort } from '@/core/network';
import { useDemoFlags } from '@/core/demo-flags';
import { useTheme } from '@/hooks/use-theme';

export function OfflineBanner() {
  const theme = useTheme();
  const forceOffline = useDemoFlags((s) => s.forceOffline);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const online = await netInfoPort.isOnline();
      if (mounted) setOffline(!online);
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [forceOffline]);

  if (!offline) return null;
  return (
    <View style={{ backgroundColor: theme.expense, padding: 8 }}>
      <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
        Sin conexión — los cambios quedan en la cola local
      </Text>
    </View>
  );
}
