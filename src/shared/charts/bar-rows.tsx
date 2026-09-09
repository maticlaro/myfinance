import { Text, View } from 'react-native';

import { formatMoney } from '@/core/format';
import { useTheme } from '@/hooks/use-theme';

export function BarRows({
  items,
}: {
  items: { label: string; value: number; color?: string }[];
}) {
  const theme = useTheme();
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <View style={{ gap: 10 }}>
      {items.map((item) => (
        <View key={item.label} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>{item.label}</Text>
            <Text style={{ color: theme.textSecondary }}>{formatMoney(item.value)}</Text>
          </View>
          <View style={{ height: 10, backgroundColor: theme.backgroundElement, borderRadius: 99 }}>
            <View
              style={{
                width: `${Math.round((item.value / max) * 100)}%`,
                height: 10,
                borderRadius: 99,
                backgroundColor: item.color ?? theme.primary,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
