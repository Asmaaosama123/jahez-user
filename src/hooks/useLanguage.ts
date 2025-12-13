import { useTranslation } from 'react-i18next';
import { Language } from '../types/i18n';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language as Language;
  const isRTL = currentLanguage === 'ar';

  return {
    currentLanguage,
    changeLanguage,
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
  };
};