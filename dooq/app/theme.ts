import { MD3LightTheme } from 'react-native-paper';

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF5733', // Main brand color
    secondary: '#1a1a1a', // Dark background color
    background: '#000', // Background color for the app
    surface: '#fff', // Surface color for cards and surfaces
    text: '#fff', // Default text color
    placeholder: '#666', // Placeholder text color
    // Add more custom colors as needed
  },
  fonts: {
    displayLarge: {
      fontFamily: 'Poppins-Regular',
      fontSize: 57,
      lineHeight: 64,
    },
    displayMedium: {
      fontFamily: 'Poppins-Regular',
      fontSize: 45,
      lineHeight: 52,
    },
    displaySmall: {
      fontFamily: 'Poppins-Regular',
      fontSize: 36,
      lineHeight: 44,
    },
    headlineLarge: {
      fontFamily: 'Poppins-Regular',
      fontSize: 32,
      lineHeight: 40,
    },
    headlineMedium: {
      fontFamily: 'Poppins-Regular',
      fontSize: 28,
      lineHeight: 36,
    },
    headlineSmall: {
      fontFamily: 'Poppins-Regular',
      fontSize: 24,
      lineHeight: 32,
    },
    titleLarge: {
      fontFamily: 'Poppins-Regular',
      fontSize: 22,
      lineHeight: 28,
    },
    titleMedium: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    titleSmall: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      lineHeight: 20,
    },
    labelLarge: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      lineHeight: 20,
    },
    labelMedium: {
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: 'Poppins-Regular',
      fontSize: 11,
      lineHeight: 16,
    },
    bodyLarge: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      lineHeight: 20,
    },
    bodySmall: {
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
      lineHeight: 16,
    },
  },
};

export default customTheme;