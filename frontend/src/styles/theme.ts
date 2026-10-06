export const theme = {
  sage: '#9fb4a4',
  sageDark: '#7f9183',
  bg: '#ffffff',
  softGrey: '#f4f5f3',
  border: '#e8ece9',
  textMain: '#4a4a4a',
  textLight: '#95a5a6',
  inputBg: '#fafafa',
  danger: '#a05c5c',
  dangerBg: '#fdf0f0',
  dangerBorder: '#f0d3d3',
  shadowApp: '0 8px 30px rgba(0,0,0,0.04)',
  shadowCard: '0 2px 10px rgba(0,0,0,0.02)',
  shadowActive: '0 2px 8px rgba(0,0,0,0.05)',
} as const;

export type Theme = typeof theme;
