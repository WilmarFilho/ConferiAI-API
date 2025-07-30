import { useResults } from '@/contexts/ResultsContext';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView, // 1. Importado o SafeAreaView para respeitar a área útil da tela
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';


export default function HomeScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { token } = useAuth(); // A função 'logout' não é mais necessária nesta tela
    const { setResults } = useResults();

    // 2. O useLayoutEffect para configurar o header foi removido completamente
    // pois a barra de navegação não existe mais nesta tela.

    // Limpa a imagem selecionada sempre que a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            setImageUri(null);
            setResults(null);
        }, [setResults])
    );

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

    const handleSendImage = async () => {
        if (!imageUri) {
            Alert.alert('Nenhuma imagem', 'Por favor, selecione uma imagem antes de enviar.');
            return;
        }

        setIsLoading(true);

        const apiUrl = 'https://confereai.conexaopro.com.br/public/api/ocr-upload';
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: `recibo_${new Date().getTime()}.jpg`,
            type: 'image/jpeg',
        } as any);

        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(response.data);
            router.push('/results');

        } catch (error) {
            console.error('❌ ERRO NA REQUISIÇÃO:', JSON.stringify(error));

            let userMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    userMessage = error.response.data?.message || `Erro no servidor (Status: ${error.response.status}).`;
                } else if (error.request) {
                    userMessage = 'Sem resposta do servidor. Verifique sua conexão com a internet.';
                }
            }

            Alert.alert('Erro no Envio', userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // O container principal agora é um SafeAreaView
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Confira sua Aposta</Text>
            <Text style={styles.subtitle}>
                {'Envie a foto do seu bilhete\npara conferir o resultado.'}
            </Text>

            <TouchableOpacity style={styles.selectButton} onPress={handlePickImage}>
                <FontAwesome name="camera" size={20} color="white" />
                <Text style={styles.selectButtonText}>Selecionar Foto</Text>
            </TouchableOpacity>

            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <FontAwesome name="photo" size={50} color="#ccc" />
                        <Text style={styles.placeholderText}>Nenhuma imagem selecionada</Text>
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
                    <Text style={styles.submitButtonText}>Conferir Resultado</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        alignItems: 'center',
        paddingHorizontal: 20, // Padding horizontal mantido
        paddingTop: 90, // Adicionado um padding superior para dar espaço ao título
        paddingBottom: 20, // Padding inferior para não colar na borda
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007bff',
        paddingVertical: 15,
        width: '100%',
        borderRadius: 10,
        marginBottom: 20,
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
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 15,
        fontSize: 16,
        color: '#aaa',
    },
    submitButton: {
        backgroundColor: '#28a745',
        paddingVertical: 18,
        width: '100%',
        borderRadius: 10,
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
    // 3. Estilo 'logoutIconButton' removido pois não é mais utilizado.
});