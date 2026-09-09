import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { currentMonth, formatMoney, monthStartEnd } from '@/core/format';
import { useCategories, useTransactions } from '@/features/transactions/hooks';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Screen } from '@/shared/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionFilters } from '@/domain/entities';

export default function MovementsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [scope, setScope] = useState<'month' | 'all'>('month');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const monthRange = monthStartEnd(currentMonth());
  const filters: TransactionFilters = useMemo(
    () => ({
      ...(scope === 'month' ? monthRange : {}),
      categoryId,
    }),
    [scope, categoryId, monthRange.from, monthRange.to],
  );
  const { data: txs } = useTransactions(filters);
  const { data: categories } = useCategories();
  const names = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));

  return (
    <Screen>
      <Link href="/transaction-form" asChild>
        <Pressable style={{ backgroundColor: theme.primary, padding: 14, borderRadius: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>+ Nuevo movimiento</Text>
        </Pressable>
      </Link>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {(['month', 'all'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setScope(key)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 99,
              backgroundColor: scope === key ? theme.primary : theme.backgroundElement,
            }}>
            <Text style={{ color: scope === key ? '#fff' : theme.text }}>
              {key === 'month' ? 'Este mes' : 'Todo'}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setCategoryId(undefined)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 99,
            backgroundColor: !categoryId ? theme.primary : theme.backgroundElement,
          }}>
          <Text style={{ color: !categoryId ? '#fff' : theme.text }}>Todas</Text>
        </Pressable>
        {(categories ?? []).map((c) => (
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

      {!txs?.length ? (
        <EmptyState title="Sin movimientos" body="Filtra por fecha o categoría, o agrega el primero." />
      ) : (
        txs.map((tx) => (
          <Pressable key={tx.id} onPress={() => router.push({ pathname: '/transaction-form', params: { id: tx.id } })}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.text, fontWeight: '700' }}>{names[tx.categoryId] ?? 'Categoría'}</Text>
                <Text style={{ color: tx.type === 'income' ? theme.income : theme.expense, fontWeight: '800' }}>
                  {tx.type === 'income' ? '+' : '-'}
                  {formatMoney(tx.amountCents)}
                </Text>
              </View>
              <Text style={{ color: theme.textSecondary }}>
                {tx.occurredAt.slice(0, 10)} {tx.note ? `· ${tx.note}` : ''}
              </Text>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
