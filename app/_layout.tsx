// app/_layout.tsx
import { ResultsProvider } from '@/contexts/ResultsContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext'; // Importamos nosso contexto

function ProtectedLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando, verificamos o token
    if (!isLoading) {
      // ====================================================================
      // AQUI ESTÁ A CORREÇÃO
      // Em vez de procurar por um grupo '(auth)', verificamos se o segmento
      // atual é a própria tela de login.
      const isAuthRoute = segments[0] === 'login';
      // ====================================================================

      if (token && isAuthRoute) {
        // Se o usuário está logado e na tela de login, redireciona para a home
        router.replace('/');
      } else if (!token && !isAuthRoute) {
        // Se o usuário não está logado e NÃO está na tela de login, redireciona para o login
        router.replace('/login');
      }
    }
  }, [token, isLoading, segments]);

  // Se estiver carregando as informações de auth, não mostra nada para evitar piscar a tela.
  if (isLoading) {
    return null; // Ou um ActivityIndicator global, se preferir
  }

  // A Stack é a navegação em pilha.
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
  // Envolvemos toda a aplicação com o nosso provedor de autenticação.
  return (
    <AuthProvider>
      {/* ...e depois com o ResultsProvider por dentro. */}
      <ResultsProvider>
        <ProtectedLayout />
      </ResultsProvider>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}