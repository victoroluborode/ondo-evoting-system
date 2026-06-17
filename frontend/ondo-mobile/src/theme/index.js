export const colors = {
  primary: '#0F4C2A',
  primaryDark: '#0D1A12',
  primaryMid: '#1A6B3C',
  primarySoft: '#2E9E5B',
  primaryDim: '#EBF4EE',
  primaryLight: '#EBF4EE',
  primaryBorder: '#C8DFD0',
  accent: '#C0392B',
  warning: '#A66C00',
  warningTint: '#FFF8E7',
  success: '#1A6B3C',
  white: '#FFFFFF',
  offWhite: '#F6F8F6',
  background: '#F6F8F6',
  canvas: '#ECEEED',
  surface: '#FFFFFF',
  text: '#0D1A12',
  textDark: '#0D1A12',
  textMid: '#3D5145',
  textMuted: '#7A9082',
  textLight: '#83918A',
  border: '#D5E0D9',
  borderLight: '#E8EEE9',
  error: '#C0392B',
  errorTint: '#FDECEB',
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  base: 12,
  md: 16,
  ml: 20,
  lg: 24,
  xl: 36,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  full: 999,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  h2: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  button: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heading1: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMid,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMid,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mono: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
  },
};

export const shadows = {
  card: {
    shadowColor: '#0D1A12',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
};
