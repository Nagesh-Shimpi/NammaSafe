// Deterministic Rule-Based Language Identification & Bilingual Civic Translation Aid
// No external AI or translation APIs used. Citizen source text is never modified or overwritten.

const CIVIC_PHRASE_MAP = [
  { en: 'cybercrime', kn: 'ಸೈಬರ್ ಅಪರಾಧ / ಆನ್‌ಲೈನ್ ವಂಚನೆ', keywords: ['cybercrime', 'cyber crime', 'phishing', 'otp scam', 'hacking', 'ಸೈಬರ್', 'ಆನ್‌ಲೈನ್ ವಂಚನೆ'] },
  { en: 'financial fraud / unauthorized transaction', kn: 'ಆರ್ಥಿಕ ವಂಚನೆ / ಅನಧಿಕೃತ ಹಣಕಾಸು ವಹಿವಾಟು', keywords: ['financial fraud', 'upi fraud', 'bank fraud', 'money deducted', 'scam', 'ಆರ್ಥಿಕ ವಂಚನೆ', 'ಹಣ ಕಡಿತ', 'ಬ್ಯಾಂಕ್ ವಂಚನೆ'] },
  { en: 'lost property / missing document', kn: 'ಕಳೆದುಹೋದ ವಸ್ತು / ದಾಖಲೆ ನಾಪತ್ತೆ', keywords: ['lost property', 'lost phone', 'missing wallet', 'missing document', 'lost bag', 'ಕಳೆದುಹೋದ', 'ನಾಪತ್ತೆ'] },
  { en: 'public safety & traffic hazard', kn: 'ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ & ಸಂಚಾರ ತೊಂದರೆ', keywords: ['public safety', 'traffic', 'signal failure', 'rash driving', 'cctv', 'patrol', 'ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ', 'ಸಂಚಾರ', 'ಪೊಲೀಸ್'] },
  { en: 'dispute / complaint involving individuals', kn: 'ವ್ಯಕ್ತಿಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ದೂರು / ಕಿರುಕುಳ', keywords: ['harassment', 'threat', 'neighbour dispute', 'loudspeaker', 'trespass', 'ಕಿರುಕುಳ', 'ವ್ಯಕ್ತಿ', 'ಬೆದರಿಕೆ'] },
  { en: 'contaminated drinking water', kn: 'ಕಲುಷಿತ ಕುಡಿಯುವ ನೀರು', keywords: ['water', 'contaminated', 'pipeline', 'leakage', 'bwssb', 'jal shakti', 'ಕುಡಿಯುವ ನೀರು', 'ಕಲುಷಿತ', 'ಪೈಪ್'] },
  { en: 'pothole / road hazard', kn: 'ರಸ್ತೆ ಗುಂಡಿ ಮತ್ತು ಸಂಚಾರ ಅಪಾಯ', keywords: ['pothole', 'road', 'highway', 'crater', 'footpath', 'streetlight', 'ರಸ್ತೆ', 'ಗುಂಡಿ', 'ಬೀದಿ ದೀಪ'] },
  { en: 'power outage / transformer fault', kn: 'ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ ಮತ್ತು ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ದೋಷ', keywords: ['power', 'electricity', 'bescom', 'hescom', 'transformer', 'meter', 'outage', 'ವಿದ್ಯುತ್', 'ಕರೆಂಟ್'] },
  { en: 'garbage / sewage / sanitation', kn: 'ಕಸ ವಿಲೇವಾರಿ / ಒಳಚರಂಡಿ ನೈರ್ಮಲ್ಯ', keywords: ['garbage', 'sewage', 'drain', 'sanitation', 'bbmp', 'waste', 'ಕಸ', 'ಚರಂಡಿ', 'ಸ್ವಚ್ಛತೆ'] },
  { en: 'hospital / public health delay', kn: 'ಆಸ್ಪತ್ರೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ವಿಳಂಬ', keywords: ['hospital', 'doctor', 'ambulance', 'medicine', 'health', 'dengue', 'ಆಸ್ಪತ್ರೆ', 'ವೈದ್ಯರು', 'ಆರೋಗ್ಯ'] },
  { en: 'pension / welfare / ration card', kn: 'ಪಿಂಚಣಿ / ಪಡಿತರ ಚೀಟಿ / ಕಲ್ಯಾಣ ಯೋಜನೆ', keywords: ['pension', 'ration', 'pds', 'scholarship', 'senior citizen', 'welfare', 'ಪಿಂಚಣಿ', 'ರೇಷನ್', 'ಪಡಿತರ'] },
  { en: 'overdue follow-up / escalation needed', kn: 'ಗಡುವು ಮೀರಿದ ಅನುಸರಣೆ / ಮೇಲ್ಮನವಿ ಅಗತ್ಯ', keywords: ['overdue', 'delay', 'pending', 'urgent', 'escalate', 'ವಿಳಂಬ', 'ತುರ್ತು', 'ಬಾಕಿ'] }
];

/**
 * Detect whether input text is English, Kannada, or Mixed Bilingual.
 * Matches Unicode range U+0C80–U+0CFF for Kannada script.
 */
export function detectTextLanguage(text = '') {
  const clean = String(text || '').trim();
  if (!clean) {
    return {
      code: 'en',
      label: 'English (Default)',
      labelKn: 'ಇಂಗ್ಲಿಷ್ (ಪೂರ್ವನಿಯೋಜಿತ)',
      confidence: 100,
      kannadaChars: 0,
      latinChars: 0
    };
  }

  const kannadaMatches = clean.match(/[\u0C80-\u0CFF]/g) || [];
  const latinMatches = clean.match(/[A-Za-z]/g) || [];
  const knCount = kannadaMatches.length;
  const enCount = latinMatches.length;
  const total = knCount + enCount;

  if (total === 0) {
    return {
      code: 'en',
      label: 'English / Numeric',
      labelKn: 'ಇಂಗ್ಲಿಷ್ / ಸಂಖ್ಯೆಗಳು',
      confidence: 70,
      kannadaChars: 0,
      latinChars: 0
    };
  }

  const knRatio = knCount / total;
  const enRatio = enCount / total;

  if (knCount >= 3 && enCount >= 6 && knRatio >= 0.15 && enRatio >= 0.15) {
    return {
      code: 'mixed',
      label: 'Bilingual (Kannada + English)',
      labelKn: 'ದ್ವಿಭಾಷಾ (ಕನ್ನಡ + ಇಂಗ್ಲಿಷ್)',
      confidence: Math.round(Math.min(98, 70 + Math.min(knRatio, enRatio) * 60)),
      kannadaChars: knCount,
      latinChars: enCount
    };
  }

  if (knRatio >= 0.35 || (knCount > 0 && enCount === 0)) {
    return {
      code: 'kn',
      label: 'Kannada (ಕನ್ನಡ)',
      labelKn: 'ಕನ್ನಡ (Kannada)',
      confidence: Math.round(Math.min(99, 65 + knRatio * 34)),
      kannadaChars: knCount,
      latinChars: enCount
    };
  }

  return {
    code: 'en',
    label: 'English',
    labelKn: 'ಇಂಗ್ಲಿಷ್ (English)',
    confidence: Math.round(Math.min(99, 65 + enRatio * 34)),
    kannadaChars: knCount,
    latinChars: enCount
  };
}

/**
 * Generates an explainable bilingual translation aid for officer triage without
 * mutating or overwriting citizen-submitted text.
 */
export function buildBilingualTranslationAid({
  title = '',
  description = '',
  titleKn = '',
  descriptionKn = '',
  departmentName = '',
  category = ''
} = {}) {
  const combined = `${title} ${description}`.trim();
  const detected = detectTextLanguage(combined);
  const lower = combined.toLowerCase();

  const matchedConcepts = CIVIC_PHRASE_MAP.filter((entry) =>
    entry.keywords.some((kw) => lower.includes(kw.toLowerCase()) || combined.includes(kw))
  );

  return {
    detected,
    hasOfficialKnCopy: Boolean(titleKn || descriptionKn),
    officialKnTitle: titleKn || null,
    officialKnDescription: descriptionKn || null,
    matchedConcepts: matchedConcepts.slice(0, 5),
    summaryEn:
      titleKn && detected.code === 'kn'
        ? title
        : matchedConcepts.length > 0
        ? `Key Subject Indicators (${category || departmentName}): ${matchedConcepts.map((m) => m.en).join('; ')}`
        : title,
    summaryKn:
      titleKn ||
      (matchedConcepts.length > 0
        ? `ಪ್ರಮುಖ ವಿಷಯ ಸೂಚಕಗಳು: ${matchedConcepts.map((m) => m.kn).join(' · ')}`
        : 'ನಾಗರಿಕರ ಮೂಲ ದೂರಿನ ಪಠ್ಯವನ್ನು ಯಥಾವತ್ತಾಗಿ ಸಂರಕ್ಷಿಸಲಾಗಿದೆ.')
  };
}

