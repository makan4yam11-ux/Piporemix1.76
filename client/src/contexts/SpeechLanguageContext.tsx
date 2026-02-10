import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SpeechLanguageCode = 'en-US' | 'zh-CN' | 'hi-IN' | 'es-ES' | 'fr-FR' | 'ar-SA' | 'bn-IN' | 'ru-RU' | 'pt-BR' | 'id-ID';

interface SpeechLanguageContextType {
  speechLanguage: SpeechLanguageCode;
  setSpeechLanguage: (lang: SpeechLanguageCode) => void;
}

const SpeechLanguageContext = createContext<SpeechLanguageContextType | undefined>(undefined);

export function SpeechLanguageProvider({ children }: { children: ReactNode }) {
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguageCode>(() => {
    const saved = localStorage.getItem('pipo-speech-language');
    return (saved as SpeechLanguageCode) || 'en-US';
  });

  useEffect(() => {
    localStorage.setItem('pipo-speech-language', speechLanguage);
  }, [speechLanguage]);

  return (
    <SpeechLanguageContext.Provider value={{ speechLanguage, setSpeechLanguage }}>
      {children}
    </SpeechLanguageContext.Provider>
  );
}

export function useSpeechLanguage() {
  const context = useContext(SpeechLanguageContext);
  if (context === undefined) {
    throw new Error('useSpeechLanguage must be used within a SpeechLanguageProvider');
  }
  return context;
}
