import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { mutationMessage, useAuthActions } from '@/features/auth/hooks';
import { useSession } from '@/features/auth/session-provider';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TextField } from '@/shared/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const { register } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (session) return <Redirect href="/(tabs)" />;

  return (
    <Screen>
      <ThemedText type="subtitle">Crear cuenta</ThemedText>
      <Text style={{ color: theme.textSecondary }}>Auth local: SQLite + sesión en SecureStore.</Text>
      <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextField label="Contraseña (mín. 6)" secureTextEntry value={password} onChangeText={setPassword} />
      {register.error ? <Text style={{ color: theme.danger }}>{mutationMessage(register.error)}</Text> : null}
      <Button label="Registrarme" disabled={register.isPending} onPress={() => register.mutate({ email, password })} />
      <Link href="/login">
        <Text style={{ color: theme.primary, fontWeight: '700' }}>Ya tengo cuenta</Text>
      </Link>
    </Screen>
  );
}
