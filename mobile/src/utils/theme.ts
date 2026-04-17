import { useColorScheme } from 'react-native';
import { useAppStore } from '../state/appStore';

export function useTheme() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const systemColorScheme = useColorScheme();

  // Use user preference if set, otherwise use system preference
  const theme = isDarkMode ? 'dark' : 'light';

  const colors = {
    // Background colors
    background: isDarkMode ? '#0f172a' : '#ffffff',
    surface: isDarkMode ? '#1e293b' : '#f8fafc',
    card: isDarkMode ? '#334155' : '#ffffff',
    
    // Primary colors (soft green)
    primary: isDarkMode ? '#4ade80' : '#22c55e',
    primaryLight: isDarkMode ? '#86efac' : '#bbf7d0',
    primaryDark: isDarkMode ? '#16a34a' : '#15803d',
    
    // Accent colors (soft pink/coral)
    accent: isDarkMode ? '#f87171' : '#ef4444',
    accentLight: isDarkMode ? '#fca5a5' : '#fecaca',
    
    // Warm accent (muted yellow/peach)
    warm: isDarkMode ? '#fbbf24' : '#f59e0b',
    warmLight: isDarkMode ? '#fcd34d' : '#fde68a',
    
    // Text colors
    text: isDarkMode ? '#f1f5f9' : '#0f172a',
    textSecondary: isDarkMode ? '#cbd5e1' : '#64748b',
    textMuted: isDarkMode ? '#94a3b8' : '#94a3b8',
    
    // Border colors
    border: isDarkMode ? '#475569' : '#e2e8f0',
    borderLight: isDarkMode ? '#334155' : '#f1f5f9',
    
    // Status colors
    success: isDarkMode ? '#4ade80' : '#22c55e',
    error: isDarkMode ? '#f87171' : '#ef4444',
    warning: isDarkMode ? '#fbbf24' : '#f59e0b',
    info: isDarkMode ? '#60a5fa' : '#3b82f6',
  };

  return {
    theme,
    isDarkMode,
    toggleDarkMode,
    colors,
  };
}
