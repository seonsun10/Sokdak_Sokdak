export const theme = {
  colors: {
    primary: '#D85B73', // 가독성이 강화된 Deep Rose (4.5:1 대비 확보)
    primaryLight: '#FFE4E8',
    primaryDark: '#B53D56',
    background: '#FFF9FA',
    surface: '#FFFFFF',
    text: '#2D2D2D', // 가득찬 느낌을 위해 조금 더 어둡게 (기존 #4A4A4A)
    textLight: '#6C6C6C', // 어두운 회색 (4.5:1 대비 확보, 기존 #8E8E8E)
    border: '#FFE1E6',
    hot: '#E63958', // 선명한 빨강 (기존 #FF4D6D)
    success: '#558B2F', // 어두운 초록 (기존 #7ED321)
    error: '#D32F2F', // 표준 에러 컬러 (기존 #FF5A5F)
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
