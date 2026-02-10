import { enUS, zhCN, hi, es, fr, arSA, bn, ru, ptBR, id as idLocale, type Locale } from "date-fns/locale";

export const getDateLocale = (lang: string): Locale => {
  const localeMap: Record<string, Locale> = {
    'en': enUS,
    'zh': zhCN,
    'hi': hi,
    'es': es,
    'fr': fr,
    'ar': arSA,
    'bn': bn,
    'ru': ru,
    'pt': ptBR,
    'id': idLocale,
  };
  return localeMap[lang] || enUS;
};
