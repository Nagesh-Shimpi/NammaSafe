import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

/**
 * Custom translation hook
 * Returns { t, lang, setLanguage, toggleLanguage, tStatus, tPriority, tDepartment, tCategory, tChannel }
 */
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export default useTranslation;
