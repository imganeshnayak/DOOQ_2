import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  // Replace the current screen with the 'register' screen when the component mounts
  useEffect(() => {
    router.replace('./register');
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="register">
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
} 