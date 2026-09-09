import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { formatMoney } from '@/core/format';
import { useDashboard } from '@/features/dashboard/hooks';
import { useBudgets } from '@/features/budgets/hooks';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Screen } from '@/shared/ui/screen';
import { BarRows } from '@/shared/charts/bar-rows';
import { useTheme } from '@/hooks/use-theme';

export default function BudgetsScreen() {
  const theme = useTheme();
  const { data: budgets } = useBudgets();
  const { data: dash } = useDashboard();

  return (
    <Screen>
      <Link href="/budget-form" asChild>
        <Pressable style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>+ Presupuesto del mes</Text>
        </Pressable>
      </Link>
      {!budgets?.length ? (
        <EmptyState title="Sin presupuestos" body="Define un tope mensual por categoría." />
      ) : (
        (dash?.budgetProgress ?? []).map((b) => (
          <Card key={b.categoryId}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>{b.name}</Text>
            <Text style={{ color: theme.textSecondary }}>
              {formatMoney(b.spentCents)} de {formatMoney(b.limitCents)}
            </Text>
            <BarRows
              items={[
                {
                  label: 'Uso',
                  value: b.spentCents,
                  color: b.spentCents > b.limitCents ? theme.expense : theme.income,
                },
              ]}
            />
          </Card>
        ))
      )}
      <View />
    </Screen>
  );
}
