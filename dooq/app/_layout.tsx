import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import customTheme from './theme';

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Add any initialization logic here (e.g., loading fonts, data)
        await new Promise(resolve => setTimeout(resolve, 100)); // Minimum delay
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <PaperProvider theme={customTheme}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="splash"
          options={{ 
            animation: 'none',
            presentation: 'fullScreenModal'
          }}
        />
        <Stack.Screen 
          name="index"
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