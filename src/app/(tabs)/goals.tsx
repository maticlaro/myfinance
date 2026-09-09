import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { formatMoney } from '@/core/format';
import { useContributeGoal, useGoals } from '@/features/goals/hooks';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Screen } from '@/shared/ui/screen';
import { TextField } from '@/shared/ui/text-field';
import { Button } from '@/shared/ui/button';
import { BarRows } from '@/shared/charts/bar-rows';
import { useTheme } from '@/hooks/use-theme';

export default function GoalsScreen() {
  const theme = useTheme();
  const { data } = useGoals();
  const contribute = useContributeGoal();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  return (
    <Screen>
      <Link href="/goal-form" asChild>
        <Pressable style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>+ Nuevo objetivo</Text>
        </Pressable>
      </Link>
      {!data?.length ? (
        <EmptyState title="Sin objetivos" body="Crea una meta de ahorro y registra aportes." />
      ) : (
        data.map((goal) => (
          <Card key={goal.id}>
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 18 }}>{goal.name}</Text>
            <Text style={{ color: theme.textSecondary }}>
              {formatMoney(goal.currentCents)} / {formatMoney(goal.targetCents)}
              {goal.deadline ? ` · hasta ${goal.deadline}` : ''}
            </Text>
            <BarRows items={[{ label: 'Progreso', value: goal.currentCents, color: theme.income }]} />
            <TextField
              label="Aporte (CLP)"
              keyboardType="numeric"
              value={amounts[goal.id] ?? ''}
              onChangeText={(v) => setAmounts((s) => ({ ...s, [goal.id]: v }))}
            />
            <Button
              label="Aportar"
              disabled={contribute.isPending}
              onPress={() =>
                contribute.mutate({ goalId: goal.id, pesos: Number(amounts[goal.id] ?? 0) })
              }
            />
          </Card>
        ))
      )}
    </Screen>
  );
}
