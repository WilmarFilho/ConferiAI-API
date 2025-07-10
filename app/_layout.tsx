import { ResultsProvider } from '@/contexts/ResultsContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function ProtectedLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      
      const isAuthRoute = segments[0] === 'login';

      if (token && isAuthRoute) {
        router.replace('/');
      } else if (!token && !isAuthRoute) {
        router.replace('/login');
      }
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return null; 
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="index"
        options={{ title: 'Conferir Aposta', headerStyle: { backgroundColor: '#f0f0f0' } }}
      />
      <Stack.Screen
        name="results"
        options={{ title: 'Resultado da Conferência', presentation: 'modal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ResultsProvider>
        <ProtectedLayout />
      </ResultsProvider>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}