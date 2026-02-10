import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
  { code: 'bn' as Language, name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' },
  { code: 'id' as Language, name: 'Indonesia', flag: '🇮🇩' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className="w-32 h-9 bg-card/90 border-border/20">
        <SelectValue>
          {currentLang && `${currentLang.flag} ${currentLang.code.toUpperCase()}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
