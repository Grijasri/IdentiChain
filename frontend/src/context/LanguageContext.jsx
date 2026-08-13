import React, { createContext, useContext, useState } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('identichain_lang') || 'en';
  });

  const changeLanguage = (lang) => {
    if (['en', 'uk'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('identichain_lang', lang);
    }
  };

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let current = translations[language] || translations['en'];
    for (let k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (let fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return keyPath;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
