export const Colors = {
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryDark: '#0D3B13',
  secondary: '#FF6F00',
  secondaryLight: '#FFA040',
  accent: '#2196F3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  border: '#E0E0E0',
  error: '#D32F2F',
  errorLight: '#FFCDD2',
  success: '#388E3C',
  successLight: '#C8E6C9',
  warning: '#F57C00',
  warningLight: '#FFE0B2',
  warningBackground: '#FFF3CD',
  warningText: '#856404',
  info: '#1976D2',
  infoLight: '#BBDEFB',
  disabled: '#BDBDBD',
  overlay: 'rgba(0, 0, 0, 0.5)',
  scoreLow: '#D32F2F',
  scoreMedium: '#F57C00',
  scoreGood: '#FFC107',
  scoreGreat: '#4CAF50',
  scoreExcellent: '#1B5E20',
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export function getScoreColor(score: number): string {
  if (score >= 85) return Colors.scoreExcellent;
  if (score >= 70) return Colors.scoreGreat;
  if (score >= 55) return Colors.scoreGood;
  if (score >= 40) return Colors.scoreMedium;
  return Colors.scoreLow;
}
