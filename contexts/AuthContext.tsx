import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextData {
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Criando o contexto com um valor padrão
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// O "Provedor" do contexto, que vai envolver nosso app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito que roda quando o app abre para tentar carregar um token salvo
  useEffect(() => {
    async function loadToken() {
      const storedToken = await SecureStore.getItemAsync('userToken');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      setIsLoading(false);
    }
    loadToken();
  }, []);

  // Função de Login
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://192.168.0.111:8000/api/login', {
        email: email,
        password: password,
      });
      
      const newToken = response.data.token; 
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await SecureStore.setItemAsync('userToken', newToken);
    } catch (error) {
      throw new Error('Email ou senha inválidos.');
    }
  };

  // Função de Logout
  const logout = async () => {
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync('userToken');
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do nosso contexto em outras telas
export function useAuth() {
  return useContext(AuthContext);
}