import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
      {languages.map((language) => (
        <button
          key={language.code}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
            ${i18n.language === language.code 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
            }
            hover:shadow-md hover:transform hover:-translate-y-0.5
          `}
          onClick={() => handleLanguageChange(language.code)}
          type="button"
        >
          <span className="text-lg">{language.flag}</span>
          <span className="font-medium text-sm">{language.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;