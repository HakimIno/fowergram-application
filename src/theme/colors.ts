export const colors = {
  // Brand colors
  primary: '#5271ff',
  secondary: '#ff0050',
  tertiary: '#facc15',
  
  // Text colors
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    tertiary: '#9ca3af',
    placeholder: '#999999',
    inverse: '#ffffff',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#e5e5e5',
    dark: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      tertiary: '#333333',
    }
  },
  
  // Border colors
  border: {
    light: '#e5e5e5',
    dark: '#333333',
  },
  
  // Status colors
  status: {
    success: '#4CAF50',
    error: '#FF5252',
    warning: '#FFC107',
    info: '#2196F3',
  }
};

export const getThemeColors = (isDarkMode: boolean) => ({
  // Brand colors remain the same
  primary: colors.primary,
  secondary: colors.secondary,
  
  // Text colors
  text: {
    primary: isDarkMode ? colors.text.inverse : colors.text.primary,
    secondary: isDarkMode ? colors.text.tertiary : colors.text.secondary,
    tertiary: isDarkMode ? colors.text.tertiary : colors.text.tertiary,
    placeholder: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : colors.text.placeholder,
    inverse: colors.text.inverse,
  },
  
  // Background colors
  background: {
    primary: isDarkMode ? colors.background.dark.primary : colors.background.primary,
    secondary: isDarkMode ? colors.background.dark.secondary : colors.background.secondary,
    tertiary: isDarkMode ? colors.background.dark.tertiary : colors.background.tertiary,
  },
  
  // Border colors
  border: {
    light: isDarkMode ? colors.border.dark : colors.border.light,
    dark: colors.border.dark,
  },
  
  // Status colors remain the same
  status: colors.status,
}); 