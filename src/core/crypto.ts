import * as Crypto from 'expo-crypto';

import type { IdGen, PasswordHasher } from '@/domain/ports';

export const expoIdGen: IdGen = {
  id: () => Crypto.randomUUID(),
};

export const expoPasswordHasher: PasswordHasher = {
  newSalt: () => Crypto.randomUUID(),
  hash: (password, salt) =>
    Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`),
};
