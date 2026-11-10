// Master Internationalization Engine (src/i18n/index.js)
import { en } from './translations/en.js';
import { kn } from './translations/kn.js';
import { GOVERNMENT_GLOSSARY } from './translations/governmentGlossary.js';
import { REMINDER_TEMPLATES, formatTemplate } from './translations/reminderTemplates.js';
import {
  DEPARTMENT_TRANSLATIONS,
  CATEGORY_TRANSLATIONS,
  STATUS_TRANSLATIONS,
  PRIORITY_TRANSLATIONS,
  CHANNEL_TRANSLATIONS,
  getLocalizedDepartment,
  getLocalizedCategory,
  getLocalizedStatus,
  getLocalizedPriority,
  getLocalizedChannel
} from './translations/dynamicDataTranslations.js';

export const TRANSLATIONS = {
  en: { ...en, glossary: GOVERNMENT_GLOSSARY.en },
  kn: { ...kn, glossary: GOVERNMENT_GLOSSARY.kn }
};

/**
 * Universal Translation Resolver
 * Supports:
 * 1. Flat keys: t('totalComplaints')
 * 2. Dot notation: t('glossary.citizen')
 * 3. Dynamic parameter interpolation: t('reminders.upcoming', { trackingId, date })
 * 4. Fallback from Kannada -> English -> key string
 */
export function translate(lang = 'en', key, params = {}) {
  if (!key) return '';

  const activeDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const fallbackDict = TRANSLATIONS.en;

  // Resolve dot notation e.g. "glossary.officer"
  const resolveNested = (dict, path) => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
  };

  let value = resolveNested(activeDict, key) ?? resolveNested(fallbackDict, key);

  if (value === undefined) {
    // Check flat glossary fallback
    value = GOVERNMENT_GLOSSARY[lang]?.[key] ?? GOVERNMENT_GLOSSARY.en?.[key] ?? key;
  }

  if (typeof value !== 'string') {
    return value;
  }

  // Handle dynamic interpolation {{param}} or {param}
  if (params && Object.keys(params).length > 0) {
    return Object.keys(params).reduce((str, pKey) => {
      const regex = new RegExp(`({{\\s*${pKey}\\s*}}|{\\s*${pKey}\\s*})`, 'g');
      return str.replace(regex, params[pKey] ?? '');
    }, value);
  }

  return value;
}

export {
  en,
  kn,
  GOVERNMENT_GLOSSARY,
  REMINDER_TEMPLATES,
  formatTemplate,
  DEPARTMENT_TRANSLATIONS,
  CATEGORY_TRANSLATIONS,
  STATUS_TRANSLATIONS,
  PRIORITY_TRANSLATIONS,
  CHANNEL_TRANSLATIONS,
  getLocalizedDepartment,
  getLocalizedCategory,
  getLocalizedStatus,
  getLocalizedPriority,
  getLocalizedChannel
};
