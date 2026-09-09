import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { getContainer } from '@/core/di';
import { currentMonth, monthStartEnd } from '@/core/format';
import { useSession } from '@/features/auth/session-provider';

export function useExport() {
  const { session } = useSession();
  const filters = monthStartEnd(currentMonth());

  return {
    async csv() {
      const csv = await getContainer().export.toCsv(session!.userId, filters);
      const file = new File(Paths.cache, 'saldo-movimientos.csv');
      if (file.exists) file.delete();
      file.create();
      file.write(csv);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri);
    },
    async pdf() {
      const html = await getContainer().export.toHtml(session!.userId, filters);
      const printed = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(printed.uri);
    },
  };
}
