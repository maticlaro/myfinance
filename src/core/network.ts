import NetInfo from '@react-native-community/netinfo';

import type { NetworkPort } from '@/domain/ports';
import { demoFlagsStore } from './demo-flags';

export const netInfoPort: NetworkPort = {
  async isOnline() {
    if (demoFlagsStore.get().forceOffline) return false;
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected && state.isInternetReachable !== false);
  },
};
