import { createContext, useContext, useState } from "react";
import { translations } from "../utils/translations"; // غير الاسم

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: any) {
  const [language, setLanguage] = useState(
    localStorage.getItem("lang") || "ar"
  );

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const t = translations[language]; // ✅ هنا نختار اللغة المناسبة

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
