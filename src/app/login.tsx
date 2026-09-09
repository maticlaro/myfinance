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

export default function LoginScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const { login } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (session) return <Redirect href="/(tabs)" />;

  return (
    <Screen>
      <ThemedText type="subtitle">Saldo</ThemedText>
      <Text style={{ color: theme.textSecondary }}>Inicia sesión para registrar ingresos y gastos offline.</Text>
      <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextField label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      {login.error ? <Text style={{ color: theme.danger }}>{mutationMessage(login.error)}</Text> : null}
      <Button label="Entrar" disabled={login.isPending} onPress={() => login.mutate({ email, password })} />
      <Link href="/register">
        <Text style={{ color: theme.primary, fontWeight: '700' }}>Crear cuenta</Text>
      </Link>
    </Screen>
  );
}
