import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TRANSLATIONS,
  translate,
  getLocalizedDepartment,
  getLocalizedCategory,
  getLocalizedStatus,
  getLocalizedPriority,
  getLocalizedChannel,
  REMINDER_TEMPLATES,
  formatTemplate,
  GOVERNMENT_GLOSSARY
} from '../i18n/index';

export const LanguageContext = createContext();

export { TRANSLATIONS };

const STORAGE_KEY = 'resolvetrack_lang';

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'kn') {
        return saved;
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
    return 'en';
  });

  // Apply language attribute and font styling class to document body
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      if (lang === 'kn') {
        document.body.classList.add('font-kannada');
      } else {
        document.body.classList.remove('font-kannada');
      }
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLangState(prev => (prev === 'en' ? 'kn' : 'en'));
  }, []);

  const setSpecificLanguage = useCallback((newLang) => {
    if (newLang === 'en' || newLang === 'kn') {
      setLangState(newLang);
    }
  }, []);

  const setLanguage = setSpecificLanguage;

  // Universal translation function with interpolation & fallback
  const t = useCallback((key, params = {}) => {
    return translate(lang, key, params);
  }, [lang]);

  // Dynamic entity translators
  const tStatus = useCallback((status) => getLocalizedStatus(status, lang), [lang]);
  const tPriority = useCallback((priority) => getLocalizedPriority(priority, lang), [lang]);
  const tDepartment = useCallback((dept) => getLocalizedDepartment(dept, lang), [lang]);
  const tCategory = useCallback((cat) => getLocalizedCategory(cat, lang), [lang]);
  const tChannel = useCallback((chan) => getLocalizedChannel(chan, lang), [lang]);
  const tGlossary = useCallback((term) => GOVERNMENT_GLOSSARY[lang]?.[term] ?? term, [lang]);

  // Reminder template formatter with bilingual selection
  const tReminderTemplate = useCallback((templateKey, values = {}) => {
    const tmpl = REMINDER_TEMPLATES[templateKey];
    if (!tmpl) return '';
    const templateStr = lang === 'kn' ? tmpl.kn : tmpl.en;
    return formatTemplate(templateStr, values);
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        setSpecificLanguage,
        toggleLanguage,
        t,
        tStatus,
        tPriority,
        tDepartment,
        tCategory,
        tChannel,
        tGlossary,
        tReminderTemplate,
        REMINDER_TEMPLATES,
        GOVERNMENT_GLOSSARY
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
