import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import customTheme from './theme'; // Import the custom theme

export default function RootLayout() {
  return (
    <PaperProvider theme={customTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="index"
          options={{ animation: 'none' }}
        />
        <Stack.Screen 
          name="splash"
          options={{ animation: 'none' }}
        />
        <Stack.Screen 
          name="(auth)"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="(tabs)"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
    </PaperProvider>
  );
}