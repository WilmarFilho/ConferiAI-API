import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ApiResponse, useResults } from '../contexts/ResultsContext';

// Uma pequena função para formatar números como moeda brasileira (R$)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

function isSuccessResponse(response: ApiResponse) {
  return 'Concurso' in response;
}

export default function ResultsScreen() {
  
  const { results } = useResults();
  const router = useRouter();

  if (!results) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando resultados...</Text>
      </View>
    );
  }

  const isSuccessResponse = 'Concurso' in results;

  // TELA DE SUCESSO
  if (isSuccessResponse) {

    const {
      Mensagem,
      Concurso,
      TipoJogo,
      NumerosSorteados,
      FoiPremiado,
      ValorPremioTotal,
      ResultadosPorAposta,
    } = results;

    const tipoJogoFormatado = TipoJogo.replace(/_/g, ' ');

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Card Principal com o Resumo */}
        <View style={[styles.card, FoiPremiado ? styles.cardSuccess : styles.cardFailure]}>
          <FontAwesome
            name={FoiPremiado ? 'check-circle' : 'times-circle'}
            size={40}
            color={FoiPremiado ? '#28a745' : '#dc3545'}
            style={styles.icon}
          />
          <Text style={[styles.message, FoiPremiado ? styles.messageSuccess : styles.messageFailure]}>
            {Mensagem}
          </Text>
          {FoiPremiado && (
            <Text style={styles.totalPrize}>{formatCurrency(ValorPremioTotal)}</Text>
          )}
        </View>

        {/* Card com as Informações do Sorteio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalhes do Sorteio</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Jogo:</Text> {tipoJogoFormatado}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Concurso:</Text> {Concurso}
          </Text>
          <Text style={styles.cardSubtitle}>Números Sorteados:</Text>
          <View style={styles.numbersContainer}>
            {NumerosSorteados.map((num) => (
              <View key={num} style={styles.lottoBall}>
                <Text style={styles.lottoBallText}>{num}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Seção com a análise de cada aposta */}
        <Text style={styles.sectionTitle}>Suas Apostas</Text>
        {ResultadosPorAposta.map((resultado, index) => {
          // Criamos um Set para uma busca rápida dos números acertados
          const acertosSet = new Set(resultado.numerosAcertados);
          return (
            <View key={index} style={[styles.card, resultado.isPremiada && styles.cardApostaPremiada]}>
              <Text style={styles.cardTitle}>Aposta #{index + 1}</Text>
              <View style={styles.numbersContainer}>
                {resultado.aposta.map((numApostado) => {
                  const numFormatado = String(numApostado).padStart(2, '0');
                  const acertou = acertosSet.has(numFormatado);
                  return (
                    <View key={numApostado} style={[styles.lottoBall, acertou ? styles.ballHit : styles.ballMiss]}>
                      <Text style={[styles.lottoBallText, acertou && styles.ballHitText]}>{numFormatado}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.betResult}>
                <Text style={styles.betResultText}>{resultado.descricaoPremio}</Text>
                {resultado.isPremiada && (
                  <Text style={styles.betPrizeText}>{formatCurrency(resultado.valorPremio)}</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // TELA DE FALLBACK
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.card, styles.cardFailure]}>
        <FontAwesome
          name="exclamation-triangle"
          size={40}
          color="#dc3545"
          style={styles.icon}
        />
        <Text style={[styles.message, styles.messageFailure]}>
          {results.Mensagem || 'Não foi possível ler o bilhete.'}
        </Text>
      </View>

      {/* Card para mostrar o texto que o OCR extraiu */}
      {results['Texto Bruto'] && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Texto Extraído da Imagem</Text>
          <Text style={styles.debugText}>
            O texto abaixo foi o que conseguimos ler da sua foto. Verifique se a imagem está nítida e bem iluminada.
          </Text>
          <Text style={styles.rawText}>{results['Texto Bruto']}</Text>
        </View>
      )}

      {/* Botão para o usuário tentar novamente */}
      <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSuccess: {
    borderLeftWidth: 5,
    borderLeftColor: '#28a745',
  },
  cardFailure: {
    borderLeftWidth: 5,
    borderLeftColor: '#dc3545',
  },
  cardApostaPremiada: {
    backgroundColor: '#e8f5e9', 
    borderColor: '#28a745',
    borderWidth: 1,
  },
  icon: {
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  messageSuccess: {
    color: '#28a745',
  },
  messageFailure: {
    color: '#dc3545',
  },
  totalPrize: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#155724',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 15,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 5,
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  lottoBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  lottoBallText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  ballHit: {
    backgroundColor: '#28a745',
    borderColor: '#1e7e34',
  },
  ballHitText: {
    color: '#fff',
  },
  ballMiss: {
    backgroundColor: '#fff',
  },
  betResult: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  betResultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  betPrizeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  rawText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace', 
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});









