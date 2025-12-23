export const theme = {
  colors: {
    primary: '#FFB7C5', // Cherry Blossom Pink
    primaryLight: '#FFE4E8',
    primaryDark: '#FF99AC',
    background: '#FFF9FA',
    surface: '#FFFFFF',
    text: '#4A4A4A',
    textLight: '#8E8E8E',
    border: '#FFE1E6',
    hot: '#FF4D6D',
    success: '#7ED321',
    error: '#FF5A5F',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 24, fontWeight: 'bold' as const },
    h2: { fontSize: 20, fontWeight: 'bold' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: 'normal' as const },
    caption: { fontSize: 14, fontWeight: 'medium' as const },
  }
};
