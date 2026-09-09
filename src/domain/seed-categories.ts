import type { Category } from './entities';
import type { IdGen } from './ports';

const EXPENSE = ['Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Ocio', 'Educación', 'Otros'];
const INCOME = ['Sueldo', 'Freelance', 'Inversiones', 'Otros ingresos'];

export function defaultCategories(userId: string, ids: IdGen): Category[] {
  return [
    ...EXPENSE.map((name) => ({
      id: ids.id(),
      userId,
      name,
      type: 'expense' as const,
      isSystem: true,
    })),
    ...INCOME.map((name) => ({
      id: ids.id(),
      userId,
      name,
      type: 'income' as const,
      isSystem: true,
    })),
  ];
}
