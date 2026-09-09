import type { TransactionFilters } from '../entities';
import type { CategoryRepository, TransactionRepository } from '../ports';

function pesos(cents: number) {
  return (cents / 100).toFixed(0);
}

export function createExportUseCases(deps: {
  transactions: TransactionRepository;
  categories: CategoryRepository;
}) {
  return {
    async toCsv(userId: string, filters?: TransactionFilters): Promise<string> {
      const [txs, categories] = await Promise.all([
        deps.transactions.list(userId, filters),
        deps.categories.listByUser(userId),
      ]);
      const names = Object.fromEntries(categories.map((c) => [c.id, c.name]));
      const header = 'fecha,tipo,categoria,monto_clp,nota';
      const rows = txs.map((tx) =>
        [
          tx.occurredAt.slice(0, 10),
          tx.type,
          names[tx.categoryId] ?? '',
          pesos(tx.amountCents),
          `"${tx.note.replaceAll('"', '""')}"`,
        ].join(','),
      );
      return [header, ...rows].join('\n');
    },

    async toHtml(userId: string, filters?: TransactionFilters): Promise<string> {
      const csvish = await this.toCsv(userId, filters);
      const [header, ...rows] = csvish.split('\n');
      const th = header.split(',').map((h) => `<th>${h}</th>`).join('');
      const body = rows
        .map((row) => `<tr>${row.split(',').map((c) => `<td>${c.replaceAll('"', '')}</td>`).join('')}</tr>`)
        .join('');
      return `<html><body><h1>Saldo — movimientos</h1><table border="1" cellpadding="6"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    },
  };
}
