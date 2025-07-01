// app/login.tsx
import { useRouter } from 'expo-router'; // Importe o hook de roteamento
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {

  // Pega a instância do roteador
  const router = useRouter();

  // Função que será chamada ao pressionar o botão
  const handleLogin = () => {
    // Por enquanto, sem lógica, apenas navegação.
    // Usamos 'replace' em vez de 'push' para que o usuário não consiga "voltar" para a tela de login.
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acessar sua Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
      />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});