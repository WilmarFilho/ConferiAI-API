import React, { createContext, ReactNode, useContext, useState } from 'react';

// Interface para uma única aposta
interface ResultadoAposta {
  aposta: number[];
  acertos: number;
  numerosAcertados: string[];
  isPremiada: boolean;
  valorPremio: number;
  descricaoPremio: string;
}

// Interface para a RESPOSTA DE SUCESSO da API
interface SuccessResponse {
  Mensagem: string;
  Concurso: number; 
  TipoJogo: string;
  NumerosSorteados: string[];
  FoiPremiado: boolean;
  ValorPremioTotal: number;
  ResultadosPorAposta: ResultadoAposta[];
  'Texto Bruto': string;
}

// Interface para a RESPOSTA DE FALLBACK (erro de identificação) da API
interface FallbackResponse {
  Mensagem: string;
  'Texto Bruto': string;
  Apostas?: number[][]; 
}

// Tipo de União: `results` pode ser um desses três formatos
export type ApiResponse = SuccessResponse | FallbackResponse;

interface ResultsContextData {
  results: ApiResponse | null;
  setResults: (data: ApiResponse | null) => void;
}

const ResultsContext = createContext<ResultsContextData>({} as ResultsContextData);

export const ResultsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<ApiResponse | null>(null);

  return (
    <ResultsContext.Provider value={{ results, setResults }}>
      {children}
    </ResultsContext.Provider>
  );
};

export function useResults() {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
}