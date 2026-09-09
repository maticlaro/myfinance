import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function scheduleDailyExpenseReminder() {
  const ok = await ensureNotificationPermission();
  if (!ok) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Saldo',
      body: '¿Registraste tus gastos de hoy?',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function notifyBudgetThreshold(categoryName: string, ratio: number) {
  const ok = await ensureNotificationPermission();
  if (!ok) return;
  const percent = Math.round(ratio * 100);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: percent >= 100 ? 'Presupuesto superado' : 'Presupuesto al 80%',
      body: `${categoryName}: ${percent}% del tope mensual`,
    },
    trigger: null,
  });
}
