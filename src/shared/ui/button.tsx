import { Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const theme = useTheme();
  const bg =
    variant === 'primary' ? theme.primary : variant === 'danger' ? theme.danger : 'transparent';
  const color = variant === 'ghost' ? theme.primary : theme.card;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1, borderColor: theme.primary }]}>
      <Text style={[styles.label, { color: variant === 'ghost' ? theme.primary : '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
  },
  label: { fontSize: 16, fontWeight: '700' },
});
