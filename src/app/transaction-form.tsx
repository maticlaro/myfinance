import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getContainer } from '@/core/di';
import { todayIsoDate } from '@/core/format';
import { mutationMessage } from '@/features/auth/hooks';
import { useSession } from '@/features/auth/session-provider';
import { useCategories, useDeleteTransaction, useSaveTransaction } from '@/features/transactions/hooks';
import type { TransactionType } from '@/domain/entities';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TextField } from '@/shared/ui/text-field';
import { useTheme } from '@/hooks/use-theme';

export default function TransactionFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: categories } = useCategories();
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState(todayIsoDate());

  const filtered = useMemo(
    () => (categories ?? []).filter((c) => c.type === type),
    [categories, type],
  );

  useEffect(() => {
    if (!id || !session) return;
    getContainer()
      .transactions.list(session.userId)
      .then((list) => {
        const tx = list.find((item) => item.id === id);
        if (!tx) return;
        setType(tx.type);
        setCategoryId(tx.categoryId);
        setAmount(String(Math.round(tx.amountCents / 100)));
        setNote(tx.note);
        setOccurredAt(tx.occurredAt.slice(0, 10));
      });
  }, [id, session]);

  useEffect(() => {
    if (!categoryId && filtered[0]) setCategoryId(filtered[0].id);
  }, [filtered, categoryId]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['expense', 'income'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => {
              setType(key);
              setCategoryId('');
            }}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              backgroundColor: type === key ? theme.primary : theme.backgroundElement,
            }}>
            <Text style={{ textAlign: 'center', color: type === key ? '#fff' : theme.text, fontWeight: '700' }}>
              {key === 'expense' ? 'Gasto' : 'Ingreso'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: theme.textSecondary }}>Categoría</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {filtered.map((c) => (
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

      <TextField label="Monto (CLP)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextField label="Fecha (YYYY-MM-DD)" value={occurredAt} onChangeText={setOccurredAt} />
      <TextField label="Nota" value={note} onChangeText={setNote} />
      {save.error ? <Text style={{ color: theme.danger }}>{mutationMessage(save.error)}</Text> : null}
      <Button
        label="Guardar"
        disabled={save.isPending}
        onPress={() =>
          save.mutate(
            {
              id,
              categoryId,
              type,
              amountPesos: Number(amount),
              note,
              occurredAt: `${occurredAt}T12:00:00.000Z`,
            },
            { onSuccess: () => router.back() },
          )
        }
      />
      {id ? (
        <Button
          label="Eliminar"
          variant="danger"
          onPress={() => remove.mutate(id, { onSuccess: () => router.back() })}
        />
      ) : null}
    </Screen>
  );
}
