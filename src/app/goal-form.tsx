import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { mutationMessage } from '@/features/auth/hooks';
import { useCreateGoal } from '@/features/goals/hooks';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { TextField } from '@/shared/ui/text-field';
import { useTheme } from '@/hooks/use-theme';

export default function GoalFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const create = useCreateGoal();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  return (
    <Screen>
      <TextField label="Nombre" value={name} onChangeText={setName} />
      <TextField label="Meta (CLP)" keyboardType="numeric" value={target} onChangeText={setTarget} />
      <TextField label="Fecha límite (opcional YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} />
      {create.error ? <Text style={{ color: theme.danger }}>{mutationMessage(create.error)}</Text> : null}
      <Button
        label="Crear objetivo"
        disabled={create.isPending}
        onPress={() =>
          create.mutate(
            { name, targetPesos: Number(target), deadline: deadline || null },
            { onSuccess: () => router.back() },
          )
        }
      />
    </Screen>
  );
}
