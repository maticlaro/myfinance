import { Colors } from '@/constants/theme';
import { useThemePreference } from '@/core/theme-preference';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const preference = useThemePreference((s) => s.preference);
  const system = scheme === 'unspecified' ? 'light' : scheme;
  const theme = preference === 'system' ? system : preference;
  return Colors[theme];
}

export function useResolvedScheme() {
  const scheme = useColorScheme();
  const preference = useThemePreference((s) => s.preference);
  const system = scheme === 'unspecified' ? 'light' : scheme;
  return preference === 'system' ? system : preference;
}
