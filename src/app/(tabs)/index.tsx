import { Text, View } from 'react-native';

import { formatMoney } from '@/core/format';
import { useDashboard } from '@/features/dashboard/hooks';
import { BarRows } from '@/shared/charts/bar-rows';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Screen } from '@/shared/ui/screen';
import { useTheme } from '@/hooks/use-theme';

export default function DashboardScreen() {
  const theme = useTheme();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Screen>
        <Text style={{ color: theme.textSecondary }}>Cargando…</Text>
      </Screen>
    );
  }

  if (!data || (data.incomeCents === 0 && data.expenseCents === 0)) {
    return (
      <Screen>
        <EmptyState title="Sin movimientos este mes" body="Registra un ingreso o gasto para ver el dashboard." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={{ color: theme.textSecondary }}>Balance del mes</Text>
        <Text style={{ color: data.balanceCents >= 0 ? theme.income : theme.expense, fontSize: 32, fontWeight: '800' }}>
          {formatMoney(data.balanceCents)}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: theme.income }}>Ingresos {formatMoney(data.incomeCents)}</Text>
          <Text style={{ color: theme.expense }}>Gastos {formatMoney(data.expenseCents)}</Text>
        </View>
      </Card>

      <Card>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 18 }}>Gastos por categoría</Text>
        {data.byCategory.length ? (
          <BarRows items={data.byCategory.map((c) => ({ label: c.name, value: c.totalCents, color: theme.expense }))} />
        ) : (
          <Text style={{ color: theme.textSecondary }}>Sin gastos categorizados</Text>
        )}
      </Card>

      <Card>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 18 }}>Serie mensual</Text>
        <BarRows
          items={data.byMonth.map((m) => ({
            label: m.month,
            value: m.expenseCents,
            color: theme.primary,
          }))}
        />
      </Card>

      {data.budgetProgress.length ? (
        <Card>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 18 }}>Presupuestos</Text>
          {data.budgetProgress.map((b) => (
            <BarRows
              key={b.categoryId}
              items={[{ label: `${b.name} (${formatMoney(b.spentCents)} / ${formatMoney(b.limitCents)})`, value: b.spentCents, color: b.spentCents > b.limitCents ? theme.expense : theme.income }]}
            />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
