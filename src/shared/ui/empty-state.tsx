import { Text } from 'react-native';

import { Card } from './card';
import { useTheme } from '@/hooks/use-theme';

export function EmptyState({ title, body }: { title: string; body: string }) {
  const theme = useTheme();
  return (
    <Card>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: theme.textSecondary }}>{body}</Text>
    </Card>
  );
}
