import { ResultsProvider } from '@/contexts/ResultsContext';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// options={{ title: 'Conferir Aposta', headerStyle: { backgroundColor: '#f0f0f0' } }}
// options={{ title: 'Resultado da Conferência', presentation: 'modal' }}

// Impede que a splash screen seja ocultada automaticamente
SplashScreen.preventAutoHideAsync();

function ProtectedLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {

     if (isLoading) {
      return;
    }
   
    const isAuthRoute = segments[0] === 'login';

    if (token && isAuthRoute) {
      router.replace('/');
    } else if (!token && !isAuthRoute) {
      router.replace('/login');
    } 

    // Oculta a splash screen quando a lógica de autenticação estiver concluída
    SplashScreen.hideAsync();

  }, [token, isLoading, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, 
        }}
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