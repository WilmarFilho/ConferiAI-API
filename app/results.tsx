// app/results.tsx
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function ResultsScreen() {
  const params = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dados Recebidos da API</Text>
      <Text style={styles.jsonText}>
        {/* Mostra os dados formatados. Ótimo para debugar! */}
        {JSON.stringify(params, null, 2)}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  jsonText: {
    fontFamily: 'monospace', // Usa uma fonte monoespaçada para alinhar o JSON
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});