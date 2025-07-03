// app/index.tsx
import { useResults } from '@/contexts/ResultsContext';
import { FontAwesome } from '@expo/vector-icons'; // Importando ícones
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // Importamos o hook


export default function HomeScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // Hook para navegar entre telas
    const navigation = useNavigation();
    const { token, logout } = useAuth(); // Pegamos o token dinâmico e a função de logout!
    const { setResults } = useResults(); // <<< PEGAMOS A FUNÇÃO PARA SALVAR OS DADOS

    // Adicionamos um botão de logout no header para testar
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={logout} style={styles.logoutIconButton}>
                    <FontAwesome name="sign-out" size={18} color="white" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, logout]);

    useFocusEffect(
        useCallback(() => {
            // Esta função será executada toda vez que a tela HomeScreen ganhar foco
            setImageUri(null);
            console.log('Tela focada: imagem limpa para nova conferência.');
        }, [])
    );

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

        // AVISO: Se o token for nulo, algo está errado, mas a rota já protege disso.
        if (!token) {
            Alert.alert('Erro de Autenticação', 'Nenhum token encontrado. Por favor, faça login novamente.');
            logout(); // Força o logout
            return;
        }


        setIsLoading(true);
        const apiUrl = 'http://192.168.0.111:8000/api/ocr-upload'; // <<< COLOQUE A URL DA SUA API AQUI

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

            setResults(response.data);

            router.push('/results');

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
        marginTop: 30,
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
        justifyContent: 'center',
        backgroundColor: '#4a4a4a',
        paddingVertical: 15,
        paddingHorizontal: 60,
        width: '100%',
        borderRadius: 15,
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
     logoutIconButton: {
        backgroundColor: '#4a4a4a',
        width: 38,
        height: 38,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
});