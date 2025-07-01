// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

// Esta linha é importante, ela previne a tela de splash de sumir antes de tudo estar pronto.
// Se você não tiver a biblioteca, instale com: npx expo install expo-splash-screen
import * as SplashScreen from 'expo-splash-screen';

// Previne a tela de splash de esconder automaticamente.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Carrega as fontes que vêm no projeto. É uma boa prática manter isso.
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Esconde a tela de splash assim que as fontes carregarem
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Se as fontes não carregaram ainda (ou deu erro), não renderiza nada para evitar a tela preta.
  if (!loaded && !error) {
    return null;
  }

  // A Stack é a navegação em pilha.
  // A propriedade "initialRouteName" define qual tela abre primeiro!
  return (
    <>
      <Stack initialRouteName="login">
        {/* Tela de login. Será a primeira a ser vista. */}
        <Stack.Screen
          name="login"
          options={{
            headerShown: false, // Esconde o cabeçalho para parecer uma tela de entrada
          }}
        />
        {/* A tela principal do app. Onde o usuário vai enviar a foto. */}
        <Stack.Screen
          name="index"
          options={{
            title: 'Conferir Aposta',
            headerStyle: { backgroundColor: '#f0f0f0' },
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        {/* A tela que mostrará o resultado vindo da sua API. */}
        <Stack.Screen
          name="results"
          options={{
            title: 'Resultado da Conferência',
            presentation: 'modal', // Abre a tela de baixo para cima
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}