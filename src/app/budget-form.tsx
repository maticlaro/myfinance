import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { mutationMessage } from '@/features/auth/hooks';
import { useSaveBudget } from '@/features/budgets/hooks';
import { useCategories } from '@/features/transactions/hooks';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TextField } from '@/shared/ui/text-field';
import { useTheme } from '@/hooks/use-theme';

export default function BudgetFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: categories } = useCategories();
  const save = useSaveBudget();
  const expenses = (categories ?? []).filter((c) => c.type === 'expense');
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (!categoryId && expenses[0]) setCategoryId(expenses[0].id);
  }, [expenses, categoryId]);

  return (
    <Screen>
      <Text style={{ color: theme.textSecondary }}>Categoría de gasto</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {expenses.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategoryId(c.id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 99,
              backgroundColor: categoryId === c.id ? theme.primary : theme.backgroundElement,
            }}>
            <Text style={{ color: categoryId === c.id ? '#fff' : theme.text }}>{c.name}</Text>
          </Pressable>
        ))}
      </View>
      <TextField label="Tope mensual (CLP)" keyboardType="numeric" value={limit} onChangeText={setLimit} />
      {save.error ? <Text style={{ color: theme.danger }}>{mutationMessage(save.error)}</Text> : null}
      <Button
        label="Guardar presupuesto"
        disabled={save.isPending}
        onPress={() =>
          save.mutate(
            { categoryId, limitPesos: Number(limit) },
            { onSuccess: () => router.back() },
          )
        }
      />
    </Screen>
  );
}
