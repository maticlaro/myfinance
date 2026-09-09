export function formatMoney(cents: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function monthStartEnd(month: string) {
  const [y, m] = month.split('-').map(Number);
  const from = `${month}-01T00:00:00.000Z`;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const to = `${month}-${String(last).padStart(2, '0')}T23:59:59.999Z`;
  return { from, to };
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
