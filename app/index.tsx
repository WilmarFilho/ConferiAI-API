// app/index.tsx
import { FontAwesome } from '@expo/vector-icons'; // Importando ícones
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // Hook para navegar entre telas

    // Função para pegar a imagem da galeria
    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar a foto.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Função para enviar a foto para sua API
    const handleSendImage = async () => {
        if (!imageUri) {
            Alert.alert('Nenhuma imagem', 'Por favor, selecione uma imagem antes de enviar.');
            return;
        }

        setIsLoading(true);
        const apiUrl = 'http://192.168.0.111:8000/api/ocr-upload'; // <<< COLOQUE A URL DA SUA API AQUI

        const token = '2|g7BCBrdWDPU8VMalIpYk5synmhXYUJzZEW2tJoJxed111528';

        // === INÍCIO DOS LOGS DE DEPURAÇÃO ===
        console.log('--- Iniciando Envio ---');
        console.log('URL da API:', apiUrl);
        console.log('URI da Imagem:', imageUri);


        const formData = new FormData();

        formData.append('file', {
            uri: imageUri,
            name: `recibo_${new Date().getTime()}.jpg`,
            type: 'image/jpeg',
        } as any);

        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // ==========================================================
                    // AQUI ESTÁ A ADIÇÃO DO TOKEN
                    // O formato é 'Bearer ' + seu token.
                    'Authorization': `Bearer ${token}`,
                    // ==========================================================
                },
            });

            // Navega para a tela de resultados, passando os dados da API como parâmetros
            router.push({ pathname: '/results', params: response.data });

        } catch (error: any) {
            // ESTE É O LOG MAIS IMPORTANTE
            console.error('❌ ERRO NA REQUISIÇÃO AXIOS:');

            if (error.response) {
                // O servidor respondeu com um status de erro (4xx, 5xx)
                console.error('Data da resposta:', error.response.data);
                console.error('Status da resposta:', error.response.status);
                console.error('Headers da resposta:', error.response.headers);
            } else if (error.request) {
                // A requisição foi feita, mas nenhuma resposta foi recebida
                console.error('Requisição feita, mas sem resposta:', error.request);
            } else {
                // Algo deu errado ao configurar a requisição
                console.error('Erro na configuração da requisição:', error.message);
            }
            // Log do objeto de configuração do Axios, útil para ver a URL, headers, etc.
            console.error('Configuração do Axios:', error.config);

            Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor. Verifique os logs no terminal para mais detalhes.');
        } finally {
            console.log('--- Fim do Envio ---');
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Compartilhe sua foto</Text>
            <Text style={styles.subtitle}>Compartilhe sua foto para descobrir se ganhou algum dos prêmios.</Text>

            <TouchableOpacity style={styles.selectButton} onPress={handlePickImage}>
                <FontAwesome name="camera" size={20} color="white" />
                <Text style={styles.selectButtonText}>Clique aqui</Text>
            </TouchableOpacity>

            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <FontAwesome name="photo" size={50} color="#8e8e8e" />
                        <Text style={styles.placeholderText}>Nenhuma foto selecionada</Text>
                        <Text style={styles.placeholderSubText}>Clique no botão para selecionar uma foto</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.submitButton, !imageUri || isLoading ? styles.submitButtonDisabled : null]}
                onPress={handleSendImage}
                disabled={!imageUri || isLoading}>
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>Enviar Foto</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

// Estilos para recriar o visual da imagem
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e9e9ef',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 40,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4a4a4a',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 12,
        marginBottom: 30,
    },
    selectButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 15,
        fontSize: 16,
        color: '#555',
        fontWeight: 'bold',
    },
    placeholderSubText: {
        marginTop: 5,
        fontSize: 14,
        color: '#8e8e8e',
    },
    submitButton: {
        backgroundColor: '#5cb85c',
        paddingVertical: 18,
        width: '100%',
        borderRadius: 15,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#a5d8a5',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});