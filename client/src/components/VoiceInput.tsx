import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Keyboard, Send } from "lucide-react";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useSpeechLanguage, SpeechLanguageCode } from "@/contexts/SpeechLanguageContext";
import { useTranslation } from "@/contexts/LanguageContext";

interface VoiceInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

const speechLanguages = [
  { code: 'en-US' as SpeechLanguageCode, name: 'English', flag: '🇺🇸' },
  { code: 'zh-CN' as SpeechLanguageCode, name: '中文', flag: '🇨🇳' },
  { code: 'hi-IN' as SpeechLanguageCode, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es-ES' as SpeechLanguageCode, name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR' as SpeechLanguageCode, name: 'Français', flag: '🇫🇷' },
  { code: 'ar-SA' as SpeechLanguageCode, name: 'العربية', flag: '🇸🇦' },
  { code: 'bn-IN' as SpeechLanguageCode, name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ru-RU' as SpeechLanguageCode, name: 'Русский', flag: '🇷🇺' },
  { code: 'pt-BR' as SpeechLanguageCode, name: 'Português', flag: '🇧🇷' },
  { code: 'id-ID' as SpeechLanguageCode, name: 'Indonesia', flag: '🇮🇩' },
];

export default function VoiceInput({ onSendMessage, isLoading }: VoiceInputProps) {
  const t = useTranslation();
  const [textInput, setTextInput] = useState("");
  const [isKeyboardMode, setIsKeyboardMode] = useState(true);
  const { speechLanguage, setSpeechLanguage } = useSpeechLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    error
  } = useSpeechRecognition(speechLanguage);

  // Maintain focus on input when in keyboard mode and not loading
  useEffect(() => {
    if (isKeyboardMode && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isKeyboardMode, isLoading]);

  const handleLanguageChange = (newLang: SpeechLanguageCode) => {
    setSpeechLanguage(newLang);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleSendVoice = () => {
    if (transcript.trim()) {
      onSendMessage(transcript);
      resetTranscript();
      stopListening();
    }
  };

  const handleSendText = () => {
    if (textInput.trim()) {
      onSendMessage(textInput);
      setTextInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="absolute bottom-20 left-0 right-0 p-4" data-testid="voice-input-area">
      <div className="border-2 border-border rounded-full p-2 shadow-lg bg-[#fafcff]">
        {isKeyboardMode ? (
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              onClick={() => setIsKeyboardMode(false)}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg animate-pulse"
              data-testid="button-switch-voice"
            >
              <Mic className="w-6 h-6 text-white" />
            </Button>
            <Input
              ref={inputRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.chat.textInputPlaceholder}
              className="flex-1 border-0 focus-visible:ring-0 text-base placeholder:text-[#F9F6EE]"
              disabled={isLoading}
              data-testid="text-input"
            />
            <Button
              size="sm"
              onClick={handleSendText}
              disabled={!textInput.trim() || isLoading}
              className="bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-[#dddde1]"
              data-testid="button-send-text"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Select value={speechLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-16 h-8 border-0 focus:ring-0">
                <SelectValue>
                  {speechLanguages.find(l => l.code === speechLanguage)?.flag || '🌐'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {speechLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {browserSupportsSpeechRecognition ? (
              <>
                <Button
                  size="lg"
                  onClick={handleVoiceToggle}
                  disabled={isLoading}
                  className={`w-12 h-12 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600 pulse-mic' : 'bg-primary hover:bg-primary/90'}`}
                  data-testid="button-voice-toggle"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <div className="flex-1 text-muted-foreground text-sm">
                  {error ? (
                    <div className="text-red-500 text-xs" data-testid="voice-error">
                      {error}
                    </div>
                  ) : isListening ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-medium">{t.chat.listening}</span>
                      {transcript && (
                        <Button
                          size="sm"
                          onClick={handleSendVoice}
                          className="ml-2"
                          data-testid="button-send-voice"
                        >
                          {t.chat.send}
                        </Button>
                      )}
                    </div>
                  ) : transcript ? (
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{transcript}</span>
                      <Button
                        size="sm"
                        onClick={handleSendVoice}
                        data-testid="button-send-transcript"
                      >
                        {t.chat.send}
                      </Button>
                    </div>
                  ) : (
                    <span data-testid="voice-prompt">
                      {t.chat.tapMicToStart}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 text-center text-muted-foreground text-sm">
                {t.chat.speechNotSupported}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsKeyboardMode(true)}
              className="text-xs font-medium px-3"
              data-testid="button-switch-keyboard"
            >
              <Keyboard className="w-4 h-4 mr-1" />
              {t.chat.type}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
