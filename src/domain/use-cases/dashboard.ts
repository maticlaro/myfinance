import type { DashboardSummary, TransactionFilters } from '../entities';
import type { BudgetRepository, CategoryRepository, TransactionRepository } from '../ports';

export function createDashboardUseCases(deps: {
  transactions: TransactionRepository;
  categories: CategoryRepository;
  budgets: BudgetRepository;
}) {
  return {
    async summarize(userId: string, filters: TransactionFilters, month: string): Promise<DashboardSummary> {
      const [txs, categories, budgets] = await Promise.all([
        deps.transactions.list(userId, filters),
        deps.categories.listByUser(userId),
        deps.budgets.listByMonth(userId, month),
      ]);
      const catName = Object.fromEntries(categories.map((c) => [c.id, c]));
      let incomeCents = 0;
      let expenseCents = 0;
      const byCategoryMap = new Map<string, number>();
      const byMonthMap = new Map<string, { incomeCents: number; expenseCents: number }>();

      for (const tx of txs) {
        if (tx.type === 'income') incomeCents += tx.amountCents;
        else expenseCents += tx.amountCents;

        if (tx.type === 'expense') {
          byCategoryMap.set(tx.categoryId, (byCategoryMap.get(tx.categoryId) ?? 0) + tx.amountCents);
        }
        const m = tx.occurredAt.slice(0, 7);
        const row = byMonthMap.get(m) ?? { incomeCents: 0, expenseCents: 0 };
        if (tx.type === 'income') row.incomeCents += tx.amountCents;
        else row.expenseCents += tx.amountCents;
        byMonthMap.set(m, row);
      }

      const spentByCategory = new Map<string, number>();
      for (const tx of txs) {
        if (tx.type === 'expense' && tx.occurredAt.startsWith(month)) {
          spentByCategory.set(tx.categoryId, (spentByCategory.get(tx.categoryId) ?? 0) + tx.amountCents);
        }
      }

      return {
        incomeCents,
        expenseCents,
        balanceCents: incomeCents - expenseCents,
        byCategory: [...byCategoryMap.entries()]
          .map(([categoryId, totalCents]) => ({
            categoryId,
            name: catName[categoryId]?.name ?? 'Sin categoría',
            type: catName[categoryId]?.type ?? 'expense',
            totalCents,
          }))
          .sort((a, b) => b.totalCents - a.totalCents),
        byMonth: [...byMonthMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([monthKey, row]) => ({ month: monthKey, ...row })),
        budgetProgress: budgets.map((b) => ({
          categoryId: b.categoryId,
          name: catName[b.categoryId]?.name ?? 'Sin categoría',
          spentCents: spentByCategory.get(b.categoryId) ?? 0,
          limitCents: b.limitCents,
        })),
      };
    },
  };
}
