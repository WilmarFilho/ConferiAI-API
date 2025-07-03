// contexts/ResultsContext.tsx
import React, { createContext, useContext, useState } from 'react';

// A interface dos nossos dados de resultado
// (Você pode copiar e colar do seu arquivo results.tsx antigo)
interface ResultadoAposta {
  aposta: number[];
  acertos: number;
  numerosAcertados: string[];
  isPremiada: boolean;
  valorPremio: number;
  descricaoPremio: string;
}

export interface ResultData {
  Mensagem: string;
  Concurso: string;
  TipoJogo: string;
  NumerosSorteados: string[];
  FoiPremiado: boolean;
  ValorPremioTotal: number;
  ResultadosPorAposta: ResultadoAposta[];
}

// A "forma" do nosso contexto
interface ResultsContextData {
  results: ResultData | null;
  setResults: (data: ResultData) => void;
}

const ResultsContext = createContext<ResultsContextData>({} as ResultsContextData);

export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<ResultData | null>(null);

  return (
    <ResultsContext.Provider value={{ results, setResults }}>
      {children}
    </ResultsContext.Provider>
  );
};

// Hook customizado para usar nosso contexto facilmente
export function useResults() {
  return useContext(ResultsContext);
}