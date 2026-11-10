// Explainable, Rule-Based Complaint Intelligence & Smart Decision Support Engine
// Uses transparent heuristic rules and shared ResolveTrack datasets (zero external AI APIs).

import { DEPARTMENTS_DATA } from '../data/departmentsData.js';
import { COMPLAINT_CATEGORIES } from '../data/complaintCategories.js';

// Common non-distinctive civic stop words to prevent false-positive duplicate matches
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'in', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'by', 'with',
  'from', 'near', 'area', 'road', 'street', 'complaint', 'issue', 'problem', 'please', 'not', 'no',
  'are', 'was', 'were', 'has', 'have', 'had', 'our', 'my', 'this', 'that', 'been', 'several', 'days',
  'working', 'due', 'very', 'much', 'need', 'urgent', 'help', 'sir', 'madam', 'ward', 'city',
  'ದೂರು', 'ಸಮಸ್ಯೆ', 'ನಮ್ಮ', 'ಬಳಿ', 'ಹತ್ತಿರ', 'ಮತ್ತು', 'ಇಲ್ಲ', 'ಆಗಿದೆ'
]);

/**
 * Configurable keyword-to-department & category rule mappings (English + Kannada)
 */
export const KEYWORD_DEPARTMENT_RULES = [
  {
    departmentId: 'dept-1',
    code: 'MORTH',
    departmentName: 'Ministry of Road Transport & Highways',
    categoryId: 'cat-roads',
    categoryName: 'Roads and Infrastructure',
    defaultSubcategory: 'Potholes and Crater Damage',
    keywords: [
      'pothole', 'potholes', 'road', 'highway', 'crater', 'flyover', 'bridge', 'footpath',
      'divider', 'asphalt', 'traffic', 'bus', 'ksrtc', 'bmtc', 'signal', 'speed breaker',
      'rto', 'vehicle', 'accident', 'junction',
      'ರಸ್ತೆ', 'ಗುಂಡಿ', 'ಹೆದ್ದಾರಿ', 'ಸಂಚಾರ', 'ಸೇತುವೆ', 'ಬಸ್'
    ]
  },
  {
    departmentId: 'dept-2',
    code: 'JAL',
    departmentName: 'Ministry of Jal Shakti (Water Supply)',
    categoryId: 'cat-water',
    categoryName: 'Water Supply',
    defaultSubcategory: 'Contaminated / Brackish Drinking Water',
    keywords: [
      'water', 'drinking water', 'pipeline', 'pipe', 'leak', 'leakage', 'bwssb', 'borewell',
      'tanker', 'contaminated', 'dirty water', 'water supply', 'low pressure', 'tap', 'valve',
      'ನೀರು', 'ಕುಡಿಯುವ ನೀರು', 'ಪೈಪ್', 'ಸೋರಿಕೆ', 'ಬೋರ್‌ವೆಲ್', 'ಟ್ಯಾಂಕರ್'
    ]
  },
  {
    departmentId: 'dept-3',
    code: 'URBAN',
    departmentName: 'Urban Development & Municipal Corp (BBMP)',
    categoryId: 'cat-sanitation',
    categoryName: 'Sanitation',
    defaultSubcategory: 'Overflowing Garbage Dumps / Bins',
    keywords: [
      'garbage', 'trash', 'waste', 'sanitation', 'sewage', 'sewer', 'drain', 'drainage',
      'storm water', 'bbmp', 'khata', 'encroachment', 'stray dog', 'dump', 'stench',
      'cleanliness', 'sweeping', 'toilet', 'park', 'tree', 'building plan', 'property tax',
      'ಕಸ', 'ಒಳಚರಂಡಿ', 'ಚರಂಡಿ', 'ಕೊಳಚೆ', 'ನೈರ್ಮಲ್ಯ', 'ಪಾಲಿಕೆ', 'ಬಿಬಿಎಂಪಿ', 'ಒತ್ತುವರಿ'
    ]
  },
  {
    departmentId: 'dept-4',
    code: 'POWER',
    departmentName: 'Power & Energy Distribution (BESCOM / HESCOM)',
    categoryId: 'cat-electricity',
    categoryName: 'Electricity',
    defaultSubcategory: 'Power Outage / Grid Fluctuation',
    keywords: [
      'electricity', 'power', 'power cut', 'outage', 'blackout', 'transformer', 'bescom',
      'hescom', 'electric', 'meter', 'overbilling', 'voltage', 'wire', 'pole', 'spark',
      'street light', 'streetlight', 'street lights', 'cable', 'short circuit',
      'ವಿದ್ಯುತ್', 'ಕರೆಂಟ್', 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್', 'ಮೀಟರ್', 'ಬೀದಿ ದೀಪ', 'ತಂತಿ'
    ]
  },
  {
    departmentId: 'dept-5',
    code: 'PDS',
    departmentName: 'Food, Civil Supplies & Consumer Affairs',
    categoryId: 'cat-pds',
    categoryName: 'Public Distribution System',
    defaultSubcategory: 'Fair Price Shop Denial of Ration Quota',
    keywords: [
      'ration', 'ration card', 'pds', 'bpl', 'fair price', 'rice', 'grain', 'wheat',
      'biometric', 'epos', 'lpg', 'subsidy', 'food', 'kerosene', 'shop',
      'ಪಡಿತರ', 'ರೇಷನ್', 'ನ್ಯಾಯಬೆಲೆ', 'ಆಹಾರ', 'ಅಕ್ಕಿ'
    ]
  },
  {
    departmentId: 'dept-6',
    code: 'WELFARE',
    departmentName: 'Social Welfare & Senior Citizen Empowerment',
    categoryId: 'cat-other',
    categoryName: 'Other Government Services',
    defaultSubcategory: 'Senior Citizen / Widow Pension Disbursal Delay',
    keywords: [
      'pension', 'widow', 'senior citizen', 'old age', 'disability', 'scholarship',
      'welfare', 'school', 'teacher', 'mid-day meal', 'hostel', 'rte', 'rti',
      'ಪಿಂಚಣಿ', 'ವಿಧವಾ', 'ವಿಕಲಚೇತನ', 'ವಿದ್ಯಾರ್ಥಿವೇತನ', 'ಶಾಲೆ', 'ಕಲ್ಯಾಣ'
    ]
  },
  {
    departmentId: 'dept-7',
    code: 'HEALTH',
    departmentName: 'Health & Family Welfare Directorate',
    categoryId: 'cat-health',
    categoryName: 'Public Health',
    defaultSubcategory: 'Primary Health Centre (PHC) Doctor Absenteeism',
    keywords: [
      'hospital', 'doctor', 'phc', 'clinic', 'medicine', 'vaccine', 'ambulance',
      'dengue', 'malaria', 'fogging', 'mosquito', 'health', 'patient', 'birth certificate',
      'death certificate', 'oxygen', 'negligence',
      'ಆಸ್ಪತ್ರೆ', 'ವೈದ್ಯರು', 'ಔಷಧಿ', 'ಆರೋಗ್ಯ', 'ಆಂಬ್ಯುಲೆನ್ಸ್', 'ಡೆಂಗ್ಯೂ'
    ]
  },
  {
    departmentId: 'dept-8',
    code: 'POLICE',
    departmentName: 'Home Affairs & Public Safety',
    categoryId: 'cat-other',
    categoryName: 'Other Government Services',
    defaultSubcategory: 'General Administrative Inaction',
    keywords: [
      'police', 'noise', 'loudspeaker', 'harassment', 'theft', 'safety', 'law',
      'crime', 'patrol', 'parking menace', 'illegal bar', 'cctv',
      'ಪೊಲೀಸ್', 'ಶಬ್ದ ಮಾಲಿನ್ಯ', 'ಸುರಕ್ಷತೆ', 'ಕಳ್ಳತನ'
    ]
  }
];

const URGENCY_RULES = {
  CRITICAL: [
    'spark', 'fire', 'live wire', 'fallen pole', 'electrocution', 'collapsed', 'collapse',
    'accident', 'death', 'life', 'critical', 'emergency', 'flooding', 'poison', 'sewage intrusion',
    'contaminated', 'cholera', 'hospital negligence', 'oxygen', 'ambulance', 'crater',
    'ಬೆಂಕಿ', 'ಅಪಘಾತ', 'ಜೀವ', 'ತುರ್ತು', 'ಕಲುಷಿತ', 'ಕುಸಿತ'
  ],
  HIGH: [
    'outage', 'no water', 'not supplied', 'several days', 'days', 'overflowing', 'blocked',
    'broken', 'damaged', 'hazard', 'mosquito', 'dengue', 'pension delayed', 'denied ration',
    'darkness', 'street lights not working', 'leakage', 'burst', 'multiple', 'residents',
    'ವ್ಯತ್ಯಯ', 'ಸೋರಿಕೆ', 'ಹಾನಿ', 'ತೊಂದರೆ', 'ವಿಳಂಬ', 'ಉಕ್ಕಿ'
  ],
  MEDIUM: [
    'delay', 'irregular', 'billing', 'meter', 'license', 'khata', 'certificate',
    'repair', 'maintenance', 'request', 'pending', 'survey',
    'ವಿಳಂಬ', 'ಬಿಲ್', 'ದುರಸ್ತಿ', 'ಪರವಾನಗಿ'
  ],
  LOW: [
    'inquiry', 'information', 'update', 'correction', 'clarification', 'rti', 'minor',
    'ಮಾಹಿತಿ', 'ತಿದ್ದುಪಡಿ', 'ಸಾಮಾನ್ಯ'
  ]
};

/**
 * Normalize text and extract meaningful tokens (excluding civic stop words)
 */
export function extractMeaningfulTokens(text = '') {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 2 && !STOP_WORDS.has(token));
  return Array.from(new Set(cleaned));
}

/**
 * 1. INTELLIGENT DEPARTMENT RECOMMENDATION (Rule-Based Matching)
 * Returns primary recommendation, alternatives, matched keywords, matching score, and explanation.
 */
export function recommendDepartment(complaintInput = {}, departmentsList = DEPARTMENTS_DATA) {
  const title = complaintInput.title || complaintInput.complaintTitle || '';
  const description = complaintInput.description || complaintInput.complaintDescription || '';
  const category = complaintInput.category || '';
  const subcategory = complaintInput.subcategory || '';
  const location = complaintInput.location || complaintInput.ward || complaintInput.incidentLocation || '';

  const combinedText = `${title} ${description} ${category} ${subcategory} ${location}`.toLowerCase().trim();

  if (!combinedText) {
    return {
      recommendedDepartment: null,
      alternatives: [],
      matchedKeywords: [],
      matchingScore: 0,
      explanation: 'Insufficient complaint text or metadata provided for rule-based department matching.',
      explanationKn: 'ಇಲಾಖೆ ಶಿಫಾರಸು ಮಾಡಲು ಸಾಕಷ್ಟು ದೂರಿನ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ.',
      isHeuristic: true
    };
  }

  const scoredRules = KEYWORD_DEPARTMENT_RULES.map(rule => {
    const matchedKeywords = [];
    let rawScore = 0;

    rule.keywords.forEach(kw => {
      if (combinedText.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
        // Stronger weight if found in title vs description
        if (title.toLowerCase().includes(kw.toLowerCase())) {
          rawScore += 22;
        } else {
          rawScore += 14;
        }
      }
    });

    // Category direct match bonus
    if (category && rule.categoryName.toLowerCase().includes(category.toLowerCase())) {
      rawScore += 30;
    }

    // Clamp rule-based matching score between 0 and 96 (never claiming 100% AI certainty)
    const matchingScore = matchedKeywords.length > 0 || rawScore > 0 ? Math.min(96, Math.max(35, rawScore)) : 0;

    const deptObj =
      departmentsList.find(d => d.id === rule.departmentId || d.code === rule.code) || {
        id: rule.departmentId,
        code: rule.code,
        name: rule.departmentName
      };

    return {
      department: deptObj,
      matchedKeywords: Array.from(new Set(matchedKeywords)),
      matchingScore,
      ruleCategoryName: rule.categoryName
    };
  })
    .filter(r => r.matchingScore > 0)
    .sort((a, b) => b.matchingScore - a.matchingScore);

  if (scoredRules.length === 0) {
    const fallbackDept = departmentsList.find(d => d.id === 'dept-3') || departmentsList[0];
    return {
      recommendedDepartment: fallbackDept,
      alternatives: departmentsList.slice(1, 3),
      matchedKeywords: [],
      matchingScore: 30,
      explanation: 'No specific domain keyword matched; suggesting Municipal Administration for initial civic triage.',
      explanationKn: 'ನಿರ್ದಿಷ್ಟ ಕೀವರ್ಡ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ; ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆಗೆ ನಗರ ಪಾಲಿಕೆ ಇಲಾಖೆಯನ್ನು ಸೂಚಿಸಲಾಗಿದೆ.',
      isHeuristic: true
    };
  }

  const primary = scoredRules[0];
  const alternatives = scoredRules.slice(1, 3).map(alt => ({
    ...alt.department,
    matchingScore: alt.matchingScore,
    matchedKeywords: alt.matchedKeywords
  }));

  const kwText = primary.matchedKeywords.slice(0, 5).join(', ');
  return {
    recommendedDepartment: primary.department,
    alternatives,
    matchedKeywords: primary.matchedKeywords,
    matchingScore: primary.matchingScore,
    explanation: primary.matchedKeywords.length > 0
      ? `Rule-based match triggered by keywords [${kwText}]${category ? ` and category "${category}"` : ''}.`
      : `Matched via complaint category classification "${category}".`,
    explanationKn: primary.matchedKeywords.length > 0
      ? `ದೂರಿನಲ್ಲಿ ಕಂಡುಬಂದ ಕೀವರ್ಡ್‌ಗಳು [${kwText}] ಆಧರಿಸಿ ಈ ಇಲಾಖೆಯನ್ನು ಸೂಚಿಸಲಾಗಿದೆ.`
      : `ದೂರಿನ ವರ್ಗದ ಆಧಾರದ ಮೇಲೆ ಈ ಇಲಾಖೆಯನ್ನು ಸೂಚಿಸಲಾಗಿದೆ.`,
    isHeuristic: true
  };
}

/**
 * 2. COMPLAINT CATEGORY SUGGESTION
 * Analyzes title & description and returns primary category, secondary category, subcategory & reasons.
 */
export function suggestComplaintCategory(complaintInput = {}, categoriesList = COMPLAINT_CATEGORIES) {
  const title = (complaintInput.title || complaintInput.complaintTitle || '').toLowerCase();
  const desc = (complaintInput.description || complaintInput.complaintDescription || '').toLowerCase();
  const combined = `${title} ${desc}`.trim();

  if (!combined) {
    return {
      primaryCategory: categoriesList[0] || null,
      secondaryCategory: categoriesList[1] || null,
      suggestedSubcategory: categoriesList[0]?.subcategories?.[0] || '',
      matchedKeywords: [],
      matchingScore: 0,
      explanation: 'Provide complaint title or description to generate category suggestions.',
      explanationKn: 'ವರ್ಗದ ಸಲಹೆಗಾಗಿ ದೂರಿನ ಶೀರ್ಷಿಕೆ ಅಥವಾ ವಿವರವನ್ನು ನಮೂದಿಸಿ.'
    };
  }

  const matches = categoriesList.map(cat => {
    const matchedKeywords = [];
    let score = 0;

    // Check linked keyword rule
    const rule = KEYWORD_DEPARTMENT_RULES.find(r => r.categoryId === cat.id);
    if (rule) {
      rule.keywords.forEach(kw => {
        if (combined.includes(kw.toLowerCase())) {
          matchedKeywords.push(kw);
          score += title.includes(kw.toLowerCase()) ? 24 : 15;
        }
      });
    }

    // Check subcategory terms
    let bestSub = cat.subcategories?.[0] || '';
    let bestSubHits = -1;
    (cat.subcategories || []).forEach(sub => {
      const subTokens = extractMeaningfulTokens(sub);
      let hits = 0;
      subTokens.forEach(t => {
        if (combined.includes(t)) {
          hits++;
          score += 12;
          matchedKeywords.push(t);
        }
      });
      if (hits > bestSubHits) {
        bestSubHits = hits;
        bestSub = sub;
      }
    });

    return {
      category: cat,
      suggestedSubcategory: bestSub,
      matchedKeywords: Array.from(new Set(matchedKeywords)),
      score: Math.min(95, score)
    };
  })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    const fallback = categoriesList.find(c => c.id === 'cat-other') || categoriesList[0];
    return {
      primaryCategory: fallback,
      secondaryCategory: categoriesList[0],
      suggestedSubcategory: fallback?.subcategories?.[0] || 'General Administrative Inaction',
      matchedKeywords: [],
      matchingScore: 30,
      explanation: 'No specific domain tokens detected; defaulting to general citizen services category for manual review.',
      explanationKn: 'ನಿರ್ದಿಷ್ಟ ಪದಗಳು ಕಂಡುಬರದ ಕಾರಣ ಸಾಮಾನ್ಯ ಸೇವಾ ವರ್ಗವನ್ನು ಸೂಚಿಸಲಾಗಿದೆ.'
    };
  }

  const top = matches[0];
  const secondary = matches[1]?.category || null;
  return {
    primaryCategory: top.category,
    secondaryCategory: secondary,
    suggestedSubcategory: top.suggestedSubcategory,
    matchedKeywords: top.matchedKeywords,
    matchingScore: top.score,
    explanation: `Suggested "${top.category.name}" → "${top.suggestedSubcategory}" based on keywords: [${top.matchedKeywords.slice(0, 5).join(', ')}].`,
    explanationKn: `[${top.matchedKeywords.slice(0, 5).join(', ')}] ಪದಗಳ ಆಧಾರದ ಮೇಲೆ "${top.category.nameKn || top.category.name}" ವರ್ಗವನ್ನು ಸೂಚಿಸಲಾಗಿದೆ.`
  };
}

/**
 * 3. DUPLICATE COMPLAINT DETECTION (Normalized text, keyword overlap, category, dept & location)
 * Returns candidate duplicates with similarity score >= threshold (default 35%).
 */
export function detectPotentialDuplicates(targetComplaint, existingComplaints = [], options = {}) {
  const { minScore = 38, maxResults = 5 } = options;
  if (!targetComplaint || !Array.isArray(existingComplaints) || existingComplaints.length === 0) {
    return [];
  }

  const targetToken = (targetComplaint.token || targetComplaint.trackingId || '').toLowerCase();
  const targetTitle = targetComplaint.title || targetComplaint.complaintTitle || '';
  const targetDesc = targetComplaint.description || targetComplaint.complaintDescription || '';
  const targetTokens = extractMeaningfulTokens(`${targetTitle} ${targetDesc}`);
  const targetCategory = (targetComplaint.category || '').toLowerCase();
  const targetDeptId = targetComplaint.departmentId || '';
  const targetDistrict = (targetComplaint.district || '').toLowerCase();
  const targetLocation = (targetComplaint.ward || targetComplaint.location || targetComplaint.incidentLocation || '').toLowerCase();

  if (targetTokens.length === 0 && !targetTitle) return [];

  const results = [];

  existingComplaints.forEach(existing => {
    const existingToken = (existing.token || existing.trackingId || '').toLowerCase();
    // Skip comparing ticket against itself
    if (targetToken && existingToken && targetToken === existingToken) return;

    const existingTitle = existing.title || '';
    const existingDesc = existing.description || '';
    const existingTokens = extractMeaningfulTokens(`${existingTitle} ${existingDesc}`);

    if (existingTokens.length === 0) return;

    // 1. Keyword Overlap (Jaccard / Intersection ratio)
    const existingSet = new Set(existingTokens);
    const sharedKeywords = targetTokens.filter(t => existingSet.has(t));

    // Avoid comparing unrelated records if zero meaningful keyword overlap
    if (sharedKeywords.length === 0) return;

    const unionSize = new Set([...targetTokens, ...existingTokens]).size || 1;
    const jaccardScore = (sharedKeywords.length / unionSize) * 100;
    const overlapRatio = (sharedKeywords.length / Math.max(1, Math.min(targetTokens.length, existingTokens.length))) * 100;

    let score = Math.round(jaccardScore * 0.45 + overlapRatio * 0.35);
    const reasons = [`Shared key terms (${sharedKeywords.slice(0, 4).join(', ')})`];
    const reasonsKn = [`ಸಾಮಾನ್ಯ ಕೀವರ್ಡ್‌ಗಳು (${sharedKeywords.slice(0, 4).join(', ')})`];

    // 2. Category match weight (+12)
    if (targetCategory && existing.category && targetCategory === existing.category.toLowerCase()) {
      score += 12;
      reasons.push(`Same category (${existing.category})`);
      reasonsKn.push(`ಒಂದೇ ವರ್ಗ (${existing.category})`);
    }

    // 3. Department match weight (+10)
    if (targetDeptId && existing.departmentId && targetDeptId === existing.departmentId) {
      score += 10;
      reasons.push('Same responsible department');
      reasonsKn.push('ಒಂದೇ ಸಂಬಂಧಿತ ಇಲಾಖೆ');
    }

    // 4. Location / District match weight (+15)
    const existingLocation = (existing.ward || existing.location || '').toLowerCase();
    const existingDistrict = (existing.district || '').toLowerCase();
    if (targetDistrict && existingDistrict && targetDistrict === existingDistrict) {
      score += 8;
      reasons.push(`Same district (${existing.district})`);
      reasonsKn.push(`ಒಂದೇ ಜಿಲ್ಲೆ (${existing.district})`);
    }
    if (targetLocation && existingLocation && (existingLocation.includes(targetLocation) || targetLocation.includes(existingLocation))) {
      score += 12;
      reasons.push(`Matching location/ward (${existing.ward || existing.location})`);
      reasonsKn.push(`ಹೊಂದಾಣಿಕೆಯ ಸ್ಥಳ (${existing.ward || existing.location})`);
    }

    // Ensure non-meaningful single generic word overlap without domain match does not create false positive
    if (sharedKeywords.length === 1 && !reasons.some(r => r.includes('Same category'))) {
      score = Math.min(score, 25);
    }

    score = Math.min(98, score);

    if (score >= minScore) {
      results.push({
        newComplaintId: targetComplaint.token || targetComplaint.trackingId || 'NEW-DRAFT',
        similarComplaint: existing,
        similarComplaintId: existing.token || existing.trackingId || existing.id,
        title: existing.title,
        departmentName: existing.departmentName,
        location: `${existing.ward || ''}${existing.ward && existing.district ? ', ' : ''}${existing.district || ''}`,
        similarityScore: score,
        sharedKeywords,
        matchingReasons: reasons,
        matchingReasonsKn: reasonsKn,
        status: existing.status
      });
    }
  });

  return results.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, maxResults);
}

/**
 * 4. SIMILAR COMPLAINT SEARCH (Historical multi-field query)
 */
export function findSimilarComplaints(queryParams = {}, complaints = []) {
  const {
    keyword = '',
    category = 'ALL',
    departmentId = 'ALL',
    district = 'ALL',
    location = ''
  } = queryParams;

  const trimmedKeyword = keyword.trim().toLowerCase();
  const queryTokens = extractMeaningfulTokens(keyword);

  return complaints
    .map(c => {
      // Exact dropdown filters first
      if (category !== 'ALL' && c.category !== category) return null;
      if (departmentId !== 'ALL' && c.departmentId !== departmentId && c.departmentName !== departmentId) return null;
      if (district !== 'ALL' && c.district !== district) return null;
      if (location.trim()) {
        const locLower = location.toLowerCase();
        const cLoc = `${c.ward || ''} ${c.taluk || ''} ${c.district || ''} ${c.address || ''}`.toLowerCase();
        if (!cLoc.includes(locLower)) return null;
      }

      if (!trimmedKeyword) {
        return { complaint: c, similarityScore: 70, matchedTerms: [] };
      }

      // Direct tracking ID match
      if ((c.token || '').toLowerCase().includes(trimmedKeyword) || (c.legacyToken || '').toLowerCase().includes(trimmedKeyword)) {
        return { complaint: c, similarityScore: 100, matchedTerms: [c.token] };
      }

      const corpus = `${c.title || ''} ${c.description || ''} ${c.category || ''} ${c.departmentName || ''} ${c.district || ''} ${c.ward || ''}`.toLowerCase();
      if (corpus.includes(trimmedKeyword)) {
        return { complaint: c, similarityScore: 90, matchedTerms: [trimmedKeyword] };
      }

      const corpusTokens = new Set(extractMeaningfulTokens(corpus));
      const matchedTerms = queryTokens.filter(t => corpusTokens.has(t));
      if (matchedTerms.length === 0) return null;

      const score = Math.min(88, Math.round((matchedTerms.length / Math.max(1, queryTokens.length)) * 85));
      return { complaint: c, similarityScore: score, matchedTerms };
    })
    .filter(Boolean)
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * 5. INTELLIGENT PRIORITY RECOMMENDATION
 * Rule-based urgency evaluation considering safety hazards, essential services, overdue/escalation, duration.
 */
export function recommendPriority(complaint = {}) {
  const title = (complaint.title || complaint.complaintTitle || '').toLowerCase();
  const desc = (complaint.description || complaint.complaintDescription || '').toLowerCase();
  const category = (complaint.category || '').toLowerCase();
  const combined = `${title} ${desc} ${category}`;

  const matchedRules = [];
  const matchedRulesKn = [];
  let suggestedPriority = 'MEDIUM';

  const criticalHits = URGENCY_RULES.CRITICAL.filter(kw => combined.includes(kw));
  const highHits = URGENCY_RULES.HIGH.filter(kw => combined.includes(kw));
  const lowHits = URGENCY_RULES.LOW.filter(kw => combined.includes(kw));

  const isOverdue = complaint.status === 'OVERDUE' || (complaint.daysOverdue || 0) > 0 || (complaint.hoursRemaining !== undefined && complaint.hoursRemaining < 0);
  const isEscalated = (complaint.escalationLevel && complaint.escalationLevel > 0) || (complaint.escalationTier && complaint.escalationTier !== 'NONE');

  if (criticalHits.length > 0 || (isOverdue && (complaint.daysOverdue || 0) >= 3) || (isEscalated && isOverdue)) {
    suggestedPriority = 'CRITICAL';
    if (criticalHits.length > 0) {
      matchedRules.push(`Public safety / emergency hazard terms detected: [${criticalHits.slice(0, 3).join(', ')}]`);
      matchedRulesKn.push(`ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ / ತುರ್ತು ಪದಗಳು ಪತ್ತೆಯಾಗಿವೆ: [${criticalHits.slice(0, 3).join(', ')}]`);
    }
    if (isOverdue) {
      matchedRules.push('Unresolved past statutory SLA deadline');
      matchedRulesKn.push('ಕಾನೂನುಬದ್ಧ SLA ಗಡುವು ಮೀರಿದೆ');
    }
    if (isEscalated) {
      matchedRules.push('Active hierarchical escalation flagged');
      matchedRulesKn.push('ಸಕ್ರಿಯ ಮೇಲ್ಮನವಿ ಹಂತದಲ್ಲಿದೆ');
    }
  } else if (highHits.length > 0 || isOverdue || category.includes('water') || category.includes('electricity') || category.includes('health')) {
    suggestedPriority = 'HIGH';
    if (highHits.length > 0) {
      matchedRules.push(`Essential service / multi-citizen disruption indicators: [${highHits.slice(0, 3).join(', ')}]`);
      matchedRulesKn.push(`ಅಗತ್ಯ ಸೇವೆ ವ್ಯತ್ಯಯದ ಪದಗಳು: [${highHits.slice(0, 3).join(', ')}]`);
    }
    if (category.includes('water') || category.includes('electricity') || category.includes('health')) {
      matchedRules.push(`Essential civic utility category (${complaint.category})`);
      matchedRulesKn.push(`ಅತ್ಯಗತ್ಯ ನಾಗರಿಕ ಸೇವಾ ವರ್ಗ (${complaint.category})`);
    }
    if (isOverdue) {
      matchedRules.push('Deadline exceeded without final resolution');
      matchedRulesKn.push('ಗಡುವು ಮೀರಿದೆ');
    }
  } else if (lowHits.length > 0 && desc.length < 150) {
    suggestedPriority = 'LOW';
    matchedRules.push(`Routine inquiry or administrative request markers: [${lowHits.slice(0, 3).join(', ')}]`);
    matchedRulesKn.push(`ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ಅಥವಾ ತಿದ್ದುಪಡಿ ವಿನಂತಿ: [${lowHits.slice(0, 3).join(', ')}]`);
  } else {
    suggestedPriority = 'MEDIUM';
    matchedRules.push('Localized civic service defect within standard SLA parameters');
    matchedRulesKn.push('ಪ್ರಮಾಣಿತ SLA ಮಾನದಂಡದ ಒಳಗಿನ ಸ್ಥಳೀಯ ಸೇವಾ ದೂರು');
  }

  return {
    suggestedPriority,
    currentPriority: complaint.priority || 'MEDIUM',
    matchesCurrent: (complaint.priority || 'MEDIUM') === suggestedPriority,
    matchedRules,
    matchedRulesKn,
    reason: matchedRules[0] || 'Evaluated via standard SLA severity matrix.',
    reasonKn: matchedRulesKn[0] || 'ಪ್ರಮಾಣಿತ ತೀವ್ರತಾ ನಿಯಮಗಳನ್ವಯ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ.',
    isHeuristic: true
  };
}

/**
 * 6. COMPLAINT HEALTH INDICATOR (0 - 100 Transparent Scoring Formula)
 * Excludes missing data rather than treating null/undefined fields as failures.
 * Tiers: 80-100 Healthy | 60-79 Attention Required | 40-59 At Risk | 0-39 Critical
 */
export function calculateComplaintHealth(complaint = {}, reminders = [], escalations = []) {
  if (!complaint || Object.keys(complaint).length === 0) {
    return { score: 0, tier: 'CRITICAL', label: 'No Record', labelKn: 'ದಾಖಲೆ ಇಲ್ಲ', factors: [], reasons: [] };
  }

  // Closed or Resolved tickets represent resolved operational health
  if (complaint.status === 'CLOSED' || complaint.status === 'RESOLVED') {
    return {
      score: complaint.status === 'CLOSED' ? 98 : 92,
      tier: 'HEALTHY',
      label: 'Healthy (Resolved)',
      labelKn: 'ಉತ್ತಮ (ಪರಿಹರಿಸಲಾಗಿದೆ)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      factors: [{ label: 'Resolution Completed', labelKn: 'ಪರಿಹಾರ ಪೂರ್ಣಗೊಂಡಿದೆ', impact: '+Baseline', positive: true }],
      reasons: ['Grievance has reached resolution milestone.'],
      reasonsKn: ['ದೂರು ಪರಿಹಾರ ಹಂತವನ್ನು ತಲುಪಿದೆ.']
    };
  }

  let score = 100;
  const factors = [];
  const reasons = [];
  const reasonsKn = [];

  // 1. Deadline / Overdue Penalty (Only evaluate if hoursRemaining or daysOverdue exists)
  if (typeof complaint.daysOverdue === 'number' && complaint.daysOverdue > 0) {
    const deduction = Math.min(35, complaint.daysOverdue * 8);
    score -= deduction;
    factors.push({ label: `Overdue by ${complaint.daysOverdue} days`, labelKn: `${complaint.daysOverdue} ದಿನ ಗಡುವು ಮೀರಿದೆ`, impact: `-${deduction}`, positive: false });
    reasons.push(`Follow-up / SLA deadline exceeded by ${complaint.daysOverdue} day(s)`);
    reasonsKn.push(`ಗಡುವು ${complaint.daysOverdue} ದಿನ ಮೀರಿದೆ`);
  } else if (typeof complaint.hoursRemaining === 'number') {
    if (complaint.hoursRemaining < 0) {
      score -= 28;
      factors.push({ label: `SLA Breached (${Math.abs(complaint.hoursRemaining)}h overdue)`, labelKn: `SLA ಉಲ್ಲಂಘನೆ (${Math.abs(complaint.hoursRemaining)}ಗಂ ಮೀರಿದೆ)`, impact: '-28', positive: false });
      reasons.push(`SLA window breached by ${Math.abs(complaint.hoursRemaining)} hours`);
      reasonsKn.push(`SLA ಅವಧಿ ${Math.abs(complaint.hoursRemaining)} ಗಂಟೆ ಮೀರಿದೆ`);
    } else if (complaint.hoursRemaining <= 12) {
      score -= 15;
      factors.push({ label: `Deadline Imminent (${complaint.hoursRemaining}h left)`, labelKn: `ಗಡುವು ಸಮೀಪಿಸಿದೆ (${complaint.hoursRemaining}ಗಂ ಬಾಕಿ)`, impact: '-15', positive: false });
      reasons.push('Deadline approaching within 12 hours');
      reasonsKn.push('12 ಗಂಟೆಯೊಳಗೆ ಗಡುವು ಮುಕ್ತಾಯವಾಗಲಿದೆ');
    } else {
      factors.push({ label: `SLA Healthy (${complaint.hoursRemaining}h left)`, labelKn: `SLA ಸುರಕ್ಷಿತ (${complaint.hoursRemaining}ಗಂ ಬಾಕಿ)`, impact: '0', positive: true });
    }
  }

  // 2. Active Escalation check
  const ticketToken = complaint.token || complaint.trackingId;
  const hasEscalation =
    (complaint.escalationLevel && complaint.escalationLevel > 0) ||
    (complaint.escalationTier && complaint.escalationTier !== 'NONE') ||
    escalations.some(e => e.complaintToken === ticketToken || e.complaintId === ticketToken);

  if (hasEscalation) {
    score -= 22;
    factors.push({ label: 'Active Escalation Flagged', labelKn: 'ಸಕ್ರಿಯ ಮೇಲ್ಮನವಿ ಹಂತದಲ್ಲಿದೆ', impact: '-22', positive: false });
    reasons.push('Active supervisory escalation in progress');
    reasonsKn.push('ಮೇಲ್ವಿಚಾರಕರ ಮೇಲ್ಮನವಿ ಚಾಲನೆಯಲ್ಲಿದೆ');
  }

  // 3. Reopened or Disputed penalty
  if (complaint.status === 'REOPENED') {
    score -= 20;
    factors.push({ label: 'Citizen Disputed & Reopened', labelKn: 'ನಾಗರಿಕರಿಂದ ಮರುತೆರೆಯಲಾಗಿದೆ', impact: '-20', positive: false });
    reasons.push('Previously reopened after unsatisfactory closure attempt');
    reasonsKn.push('ಪರಿಹಾರ ತೃಪ್ತಿಕರವಾಗದ ಕಾರಣ ಮರುತೆರೆಯಲಾಗಿದೆ');
  }

  // 4. Failed / Multiple Reminders check (only if reminders dataset passed)
  if (Array.isArray(reminders) && reminders.length > 0 && ticketToken) {
    const ticketReminders = reminders.filter(r => r.complaintToken === ticketToken || r.complaintId === ticketToken);
    const failedCount = ticketReminders.filter(r => r.status === 'FAILED').length;
    if (failedCount > 0) {
      score -= 8;
      factors.push({ label: `${failedCount} Failed Follow-up Dispatch`, labelKn: `${failedCount} ವಿಫಲ ಜ್ಞಾಪನೆ`, impact: '-8', positive: false });
      reasons.push('Follow-up communication delivery failure logged');
      reasonsKn.push('ಅನುಸರಣಾ ಸಂದೇಶ ರವಾನೆ ವಿಫಲವಾಗಿದೆ');
    } else if (ticketReminders.length >= 2) {
      score -= 10;
      factors.push({ label: `${ticketReminders.length} Follow-up Reminders Needed`, labelKn: `${ticketReminders.length} ಜ್ಞಾಪನೆಗಳು ಬೇಕಾಗಿವೆ`, impact: '-10', positive: false });
      reasons.push('Multiple follow-up reminders required to prompt officer action');
      reasonsKn.push('ಹಲವು ಜ್ಞಾಪನೆಗಳನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ');
    }
  }

  // 5. Officer Assignment & Action Presence
  if (!complaint.assignedOfficer && !complaint.assignedOfficerId) {
    score -= 12;
    factors.push({ label: 'Pending Nodal Officer Assignment', labelKn: 'ಅಧಿಕಾರಿ ನಿಯೋಜನೆ ಬಾಕಿ', impact: '-12', positive: false });
    reasons.push('No nodal officer assigned yet');
    reasonsKn.push('ಇನ್ನೂ ನೋಡಲ್ ಅಧಿಕಾರಿಯನ್ನು ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ');
  } else if (Array.isArray(complaint.actions) && complaint.actions.length === 0 && complaint.status !== 'SUBMITTED') {
    score -= 8;
    factors.push({ label: 'Zero Field Action Logs Recorded', labelKn: 'ಕ್ಷೇತ್ರ ಕ್ರಮ ದಾಖಲಾಗಿಲ್ಲ', impact: '-8', positive: false });
    reasons.push('No officer field action recorded since assignment');
    reasonsKn.push('ನಿಯೋಜನೆಯ ನಂತರ ಅಧಿಕಾರಿಯ ಕ್ರಮ ದಾಖಲಾಗಿಲ್ಲ');
  }

  // 6. Pending Citizen Response check
  if (complaint.status === 'AWAITING_INFO' || complaint.status === 'PENDING_CITIZEN_RESPONSE') {
    score -= 10;
    factors.push({ label: 'Awaiting Citizen Information', labelKn: 'ನಾಗರಿಕರ ಮಾಹಿತಿ ಬಾಕಿ ಇದೆ', impact: '-10', positive: false });
    reasons.push('Waiting on citizen supplementary evidence');
    reasonsKn.push('ನಾಗರಿಕರಿಂದ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ ನಿರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ');
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 80) {
    return {
      score,
      tier: 'HEALTHY',
      label: 'Healthy',
      labelKn: 'ಉತ್ತಮ ಸ್ಥಿತಿ',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      factors,
      reasons: reasons.length ? reasons : ['All SLA checkpoints and officer actions within healthy tolerance.'],
      reasonsKn: reasonsKn.length ? reasonsKn : ['ಎಲ್ಲಾ SLA ಮಾನದಂಡಗಳು ಉತ್ತಮವಾಗಿವೆ.']
    };
  }
  if (score >= 60) {
    return {
      score,
      tier: 'ATTENTION',
      label: 'Attention Required',
      labelKn: 'ಗಮನ ಅಗತ್ಯ',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      factors,
      reasons,
      reasonsKn
    };
  }
  if (score >= 40) {
    return {
      score,
      tier: 'AT_RISK',
      label: 'At Risk',
      labelKn: 'ಅಪಾಯದಲ್ಲಿದೆ',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-300',
      factors,
      reasons,
      reasonsKn
    };
  }
  return {
    score,
    tier: 'CRITICAL',
    label: 'Critical',
    labelKn: 'ಗಂಭೀರ ಸ್ಥಿತಿ',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    factors,
    reasons,
    reasonsKn
  };
}

/**
 * 7. ESCALATION RISK IDENTIFICATION
 */
export function assessEscalationRisk(complaint = {}, officersList = [], reminders = []) {
  if (!complaint || ['RESOLVED', 'CLOSED'].includes(complaint.status)) {
    return {
      riskLevel: 'LOW',
      label: 'Low Risk',
      labelKn: 'ಕಡಿಮೆ ಅಪಾಯ',
      reasons: ['Complaint is already resolved or closed.'],
      reasonsKn: ['ದೂರು ಈಗಾಗಲೇ ಪರಿಹರಿಸಲ್ಪಟ್ಟಿದೆ.'],
      recommendedAction: 'No Escalation Action Required',
      recommendedActionKn: 'ಯಾವುದೇ ವರ್ಗಾವಣೆ ಕ್ರಮದ ಅಗತ್ಯವಿಲ್ಲ',
      actionType: 'NONE'
    };
  }

  const reasons = [];
  const reasonsKn = [];
  let riskPoints = 0;

  const isOverdue = complaint.status === 'OVERDUE' || (complaint.daysOverdue || 0) > 0 || (typeof complaint.hoursRemaining === 'number' && complaint.hoursRemaining < 0);
  const isApproaching = typeof complaint.hoursRemaining === 'number' && complaint.hoursRemaining >= 0 && complaint.hoursRemaining <= 16;
  const hasEscalation = (complaint.escalationLevel || 0) > 0 || (complaint.escalationTier && complaint.escalationTier !== 'NONE');

  if (isOverdue) {
    riskPoints += 45;
    reasons.push(`Statutory SLA deadline breached (${complaint.daysOverdue || 1} day(s) overdue)`);
    reasonsKn.push(`ಕಾನೂನುಬದ್ಧ SLA ಗಡುವು ಮೀರಿದೆ`);
  } else if (isApproaching) {
    riskPoints += 25;
    reasons.push(`SLA window approaching cutoff (${complaint.hoursRemaining}h remaining)`);
    reasonsKn.push(`SLA ಗಡುವು ಸಮೀಪಿಸುತ್ತಿದೆ (${complaint.hoursRemaining} ಗಂ ಬಾಕಿ)`);
  }

  if (hasEscalation) {
    riskPoints += 30;
    reasons.push('Prior hierarchical escalation history exists');
    reasonsKn.push('ಹಿಂದಿನ ಮೇಲ್ಮನವಿ ಇತಿಹಾಸ ಹೊಂದಿದೆ');
  }

  if (complaint.status === 'REOPENED') {
    riskPoints += 25;
    reasons.push('Reopened by citizen due to unresolved physical defect');
    reasonsKn.push('ನಾಗರಿಕರಿಂದ ಮರುತೆರೆಯಲಾಗಿದೆ');
  }

  if (complaint.priority === 'CRITICAL') {
    riskPoints += 20;
    reasons.push('Designated CRITICAL public safety priority');
    reasonsKn.push('ಅತಿ ಗಂಭೀರ ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಆದ್ಯತೆ');
  }

  const assignedId = complaint.assignedOfficer?.id || complaint.assignedOfficerId;
  const assignedOff = officersList.find(o => o.id === assignedId);
  if (assignedOff && (assignedOff.activeCaseload || 0) >= 25) {
    riskPoints += 15;
    reasons.push(`Assigned officer (${assignedOff.name}) is overloaded (${assignedOff.activeCaseload} active cases)`);
    reasonsKn.push(`ನಿಯೋಜಿತ ಅಧಿಕಾರಿ (${assignedOff.name}) ಅಧಿಕ ಕಾರ್ಯಭಾರ ಹೊಂದಿದ್ದಾರೆ`);
  }

  const ticketToken = complaint.token || complaint.trackingId;
  const remCount = reminders.filter(r => r.complaintToken === ticketToken || r.complaintId === ticketToken).length;
  if (remCount >= 2) {
    riskPoints += 15;
    reasons.push(`${remCount} reminders issued without closure`);
    reasonsKn.push(`${remCount} ಜ್ಞಾಪನೆಗಳನ್ನು ಕಳುಹಿಸಿದರೂ ಪರಿಹಾರವಾಗಿಲ್ಲ`);
  }

  let riskLevel = 'LOW';
  let label = 'Low';
  let labelKn = 'ಕಡಿಮೆ';
  let recommendedAction = 'Continue Standard Monitoring';
  let recommendedActionKn = 'ಸಾಮಾನ್ಯ ಮೇಲ್ವಿಚಾರಣೆ ಮುಂದುವರಿಸಿ';
  let actionType = 'MONITOR';

  if (riskPoints >= 70) {
    riskLevel = 'CRITICAL';
    label = 'Critical Risk';
    labelKn = 'ಗಂಭೀರ ಅಪಾಯ';
    recommendedAction = 'Initiate Authorized Escalation & Notify Supervisor';
    recommendedActionKn = 'ಅಧಿಕೃತ ಮೇಲ್ಮನವಿ ಮತ್ತು ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಸೂಚನೆ ನೀಡಿ';
    actionType = 'ESCALATE';
  } else if (riskPoints >= 45) {
    riskLevel = 'HIGH';
    label = 'High Risk';
    labelKn = 'ಹೆಚ್ಚಿನ ಅಪಾಯ';
    recommendedAction = assignedOff?.activeCaseload >= 25 ? 'Review Officer Workload & Send Urgent Reminder' : 'Send Urgent Reminder & Notify Supervisor';
    recommendedActionKn = 'ತುರ್ತು ಜ್ಞಾಪನೆ ಕಳುಹಿಸಿ ಮತ್ತು ಮೇಲ್ವಿಚಾರಕರಿಗೆ ತಿಳಿಸಿ';
    actionType = 'NOTIFY_SUPERVISOR';
  } else if (riskPoints >= 20) {
    riskLevel = 'MEDIUM';
    label = 'Medium Risk';
    labelKn = 'ಮಧ್ಯಮ ಅಪಾಯ';
    recommendedAction = 'Send Proactive Reminder & Review Deadline';
    recommendedActionKn = 'ಮುನ್ನೆಚ್ಚರಿಕೆ ಜ್ಞಾಪನೆ ಕಳುಹಿಸಿ & ಗಡುವು ಪರಿಶೀಲಿಸಿ';
    actionType = 'SEND_REMINDER';
  }

  return {
    riskLevel,
    riskPoints,
    label,
    labelKn,
    reasons: reasons.length ? reasons : ['No immediate SLA or workload risk markers identified.'],
    reasonsKn: reasonsKn.length ? reasonsKn : ['ಯಾವುದೇ ತಕ್ಷಣದ SLA ಅಪಾಯ ಕಂಡುಬಂದಿಲ್ಲ.'],
    recommendedAction,
    recommendedActionKn,
    actionType
  };
}

/**
 * 8. INTELLIGENT OFFICER RECOMMENDATION (Integrates directly with shared officers dataset)
 */
export function recommendOfficer(complaint = {}, officersList = []) {
  if (!Array.isArray(officersList) || officersList.length === 0) {
    return { recommendedOfficer: null, comparisonList: [], reason: 'No active officers in registry.' };
  }

  const complaintDeptId = complaint.departmentId || '';
  const complaintDeptName = (complaint.departmentName || '').toLowerCase();
  const complaintCategory = (complaint.category || '').toLowerCase();

  const evaluated = officersList.map(officer => {
    let suitabilityScore = 40;
    const reasons = [];
    const reasonsKn = [];

    const isOnLeave = officer.availability === 'ON_LEAVE';
    const maxCap = officer.maxCapacity || 30;
    const caseload = officer.activeCaseload || 0;
    const utilizationPct = Math.round((caseload / maxCap) * 100);

    // 1. Department Compatibility (+30)
    const isDeptMatch =
      (complaintDeptId && officer.departmentId === complaintDeptId) ||
      (complaintDeptName && officer.department && officer.department.toLowerCase().includes(complaintDeptName));

    if (isDeptMatch) {
      suitabilityScore += 30;
      reasons.push('Direct ministerial department match');
      reasonsKn.push('ಸಂಬಂಧಿತ ಇಲಾಖೆಗೆ ನೇರ ಹೊಂದಾಣಿಕೆ');
    }

    // 2. Workload Balance (+20 / penalty if overloaded)
    if (isOnLeave) {
      suitabilityScore = 0;
      reasons.push('Currently On Leave (Ineligible)');
      reasonsKn.push('ಪ್ರಸ್ತುತ ರಜೆಯಲ್ಲಿದ್ದಾರೆ');
    } else if (caseload <= 12) {
      suitabilityScore += 20;
      reasons.push(`Balanced low caseload (${caseload}/${maxCap})`);
      reasonsKn.push(`ಕಡಿಮೆ ಕಾರ್ಯಭಾರ (${caseload}/${maxCap})`);
    } else if (caseload <= 20) {
      suitabilityScore += 10;
      reasons.push(`Moderate workload (${caseload}/${maxCap})`);
      reasonsKn.push(`ಮಧ್ಯಮ ಕಾರ್ಯಭಾರ (${caseload}/${maxCap})`);
    } else if (caseload > 25) {
      suitabilityScore -= 25;
      reasons.push(`Overloaded caseload (${caseload}/${maxCap})`);
      reasonsKn.push(`ಅಧಿಕ ಕಾರ್ಯಭಾರ (${caseload}/${maxCap})`);
    }

    // 3. Domain Expertise match (+10)
    const hasExpertise =
      Array.isArray(officer.categoryExperience) &&
      officer.categoryExperience.some(exp =>
        exp.toLowerCase().includes(complaintCategory) || complaintCategory.includes(exp.toLowerCase().split(' ')[0])
      );
    if (!isOnLeave && hasExpertise) {
      suitabilityScore += 10;
      reasons.push('Verified domain expertise in category');
      reasonsKn.push('ವಿಭಾಗದಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿದ್ದಾರೆ');
    }

    // 4. SLA track record bonus (+5)
    if (!isOnLeave && (officer.slaRate || 0) >= 90) {
      suitabilityScore += 5;
      reasons.push(`Strong SLA compliance (${officer.slaRate}%)`);
      reasonsKn.push(`ಉತ್ತಮ SLA ಅನುಸರಣೆ (${officer.slaRate}%)`);
    }

    suitabilityScore = isOnLeave ? 0 : Math.min(98, Math.max(10, suitabilityScore));

    return {
      officer,
      suitabilityScore,
      utilizationPct,
      isEligible: !isOnLeave && caseload < maxCap,
      reasons,
      reasonsKn
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const top = evaluated[0];
  return {
    recommendedOfficer: top?.officer || null,
    suitabilityScore: top?.suitabilityScore || 0,
    reason: top?.reasons?.join(' · ') || 'Selected based on available cadre capacity.',
    reasonKn: top?.reasonsKn?.join(' · ') || 'ಲಭ್ಯವಿರುವ ಕಾರ್ಯಭಾರದ ಆಧಾರದ ಮೇಲೆ ಸೂಚಿಸಲಾಗಿದೆ.',
    comparisonList: evaluated.slice(0, 5)
  };
}

/**
 * 9. INTELLIGENCE ALERT GENERATION (Deduplicated by complaintId + alertType)
 */
export function generateIntelligenceAlerts(
  complaints = [],
  officers = [],
  reminders = [],
  escalations = [],
  existingAlerts = []
) {
  if (!Array.isArray(complaints) || complaints.length === 0) return existingAlerts;

  const existingKeys = new Set(
    existingAlerts.map(a => `${a.complaintId}::${a.alertType}`)
  );

  const generated = [...existingAlerts];
  const todayStr = new Date().toISOString().substring(0, 10);

  const addAlertIfUnique = (complaintId, alertType, payload) => {
    const key = `${complaintId}::${alertType}`;
    if (existingKeys.has(key)) return;
    existingKeys.add(key);

    generated.push({
      id: `INT-ALT-${1000 + generated.length + 1}`,
      complaintId,
      alertType,
      reviewStatus: 'OPEN', // 'OPEN' | 'REVIEWED' | 'DISMISSED'
      generatedDate: todayStr,
      reviewedBy: null,
      reviewedDate: null,
      ...payload
    });
  };

  // Scan top active complaints to surface explainable rule-based alerts
  complaints.forEach((c, idx) => {
    const token = c.token || c.trackingId || c.id;
    const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(c.status);
    if (isResolvedOrClosed) return;

    // 1. Critical Complaint Health
    const health = calculateComplaintHealth(c, reminders, escalations);
    if (health.score < 50) {
      addAlertIfUnique(token, 'CRITICAL_HEALTH', {
        alertCategoryLabel: 'Critical Complaint Health',
        alertCategoryLabelKn: 'ಗಂಭೀರ ದೂರಿನ ಆರೋಗ್ಯ ಸೂಚ್ಯಂಕ',
        riskLevel: health.score < 40 ? 'CRITICAL' : 'HIGH',
        description: `Complaint #${token} health dropped to ${health.score}/100: ${health.reasons[0] || 'Multiple SLA breaches'}.`,
        descriptionKn: `ದೂರು #${token} ಆರೋಗ್ಯ ಅಂಕ ${health.score}/100 ಕ್ಕೆ ಇಳಿದಿದೆ.`,
        recommendedAction: 'Inspect Timeline & Reassign / Issue Statutory Notice',
        recommendedActionKn: 'ಕಾಲಾವಧಿ ಪರಿಶೀಲಿಸಿ & ಜ್ಞಾಪನೆ ಕಳುಹಿಸಿ'
      });
    }

    // 2. Escalation Risk
    const escRisk = assessEscalationRisk(c, officers, reminders);
    if (escRisk.riskLevel === 'CRITICAL' || escRisk.riskLevel === 'HIGH') {
      addAlertIfUnique(token, 'ESCALATION_RISK', {
        alertCategoryLabel: 'Escalation Risk',
        alertCategoryLabelKn: 'ಮೇಲ್ಮನವಿ ಅಪಾಯ',
        riskLevel: escRisk.riskLevel,
        description: `#${token}: ${escRisk.reasons[0] || 'Approaching or breached SLA deadline'}.`,
        descriptionKn: `#${token}: ${escRisk.reasonsKn[0] || 'ಗಡುವು ಮೀರಿದೆ ಅಥವಾ ಸಮೀಪಿಸಿದೆ'}.`,
        recommendedAction: escRisk.recommendedAction,
        recommendedActionKn: escRisk.recommendedActionKn
      });
    }

    // 3. Potential Duplicate Complaint (scan first 25 open items for performance)
    if (idx < 25) {
      const dups = detectPotentialDuplicates(c, complaints, { minScore: 62, maxResults: 1 });
      if (dups.length > 0) {
        const dup = dups[0];
        addAlertIfUnique(token, 'POTENTIAL_DUPLICATE', {
          alertCategoryLabel: 'Potential Duplicate Complaint',
          alertCategoryLabelKn: 'ಸಂಭಾವ್ಯ ನಕಲಿ / ಸಂಬಂಧಿತ ದೂರು',
          riskLevel: 'MEDIUM',
          description: `#${token} shares ${dup.similarityScore}% keyword/location overlap with #${dup.similarComplaintId}.`,
          descriptionKn: `#${token} ಮತ್ತು #${dup.similarComplaintId} ನಡುವೆ ${dup.similarityScore}% ಹೋಲಿಕೆ ಕಂಡುಬಂದಿದೆ.`,
          recommendedAction: 'Compare Records & Link as Related',
          recommendedActionKn: 'ದಾಖಲೆಗಳನ್ನು ಹೋಲಿಸಿ & ಸಂಬಂಧಿತವೆಂದು ಗುರುತಿಸಿ',
          relatedComplaintId: dup.similarComplaintId
        });
      }
    }

    // 4. High-Priority Recommendation Mismatch
    const prioRec = recommendPriority(c);
    if (prioRec.suggestedPriority === 'CRITICAL' && c.priority !== 'CRITICAL') {
      addAlertIfUnique(token, 'HIGH_PRIORITY_COMPLAINT', {
        alertCategoryLabel: 'High-Priority Complaint',
        alertCategoryLabelKn: 'ಅತಿ ಆದ್ಯತೆಯ ದೂರು ಶಿಫಾರಸು',
        riskLevel: 'HIGH',
        description: `#${token} currently marked ${c.priority}, but rule analysis suggests CRITICAL (${prioRec.reason}).`,
        descriptionKn: `#${token} ಪ್ರಸ್ತುತ ${c.priority} ಆಗಿದೆ, ಆದರೆ ನಿಯಮ ವಿಶ್ಲೇಷಣೆಯು ತುರ್ತು (CRITICAL) ಎಂದು ಸೂಚಿಸುತ್ತದೆ.`,
        recommendedAction: 'Upgrade Priority to CRITICAL',
        recommendedActionKn: 'ಆದ್ಯತೆಯನ್ನು ಅತಿ ಗಂಭೀರ (CRITICAL) ಗೆ ಬದಲಾಯಿಸಿ'
      });
    }

    // 5. Incorrect Department Recommendation check
    const deptRec = recommendDepartment(c);
    if (deptRec.recommendedDepartment && deptRec.matchingScore >= 65 && c.departmentId && deptRec.recommendedDepartment.id !== c.departmentId) {
      addAlertIfUnique(token, 'DEPARTMENT_MISMATCH', {
        alertCategoryLabel: 'Incorrect Department Recommendation',
        alertCategoryLabelKn: 'ತಪ್ಪು ಇಲಾಖೆ ಹಂಚಿಕೆ ಶಂಕೆ',
        riskLevel: 'MEDIUM',
        description: `#${token} is in "${c.departmentName}", while keywords suggest "${deptRec.recommendedDepartment.name}" (${deptRec.matchingScore} match score).`,
        descriptionKn: `#${token} ಪ್ರಸ್ತುತ ಬೇರೆ ಇಲಾಖೆಯಲ್ಲಿದೆ; ಕೀವರ್ಡ್‌ಗಳು "${deptRec.recommendedDepartment.nameKn || deptRec.recommendedDepartment.name}" ಸೂಚಿಸುತ್ತವೆ.`,
        recommendedAction: 'Review Department Transfer',
        recommendedActionKn: 'ಇಲಾಖೆ ಬದಲಾವಣೆಯನ್ನು ಪರಿಶೀಲಿಸಿ'
      });
    }
  });

  // 6. Officer Workload Imbalance Alerts
  officers.forEach(o => {
    if ((o.activeCaseload || 0) >= 26) {
      addAlertIfUnique(o.id, 'OFFICER_WORKLOAD_IMBALANCE', {
        alertCategoryLabel: 'Officer Workload Imbalance',
        alertCategoryLabelKn: 'ಅಧಿಕಾರಿ ಕಾರ್ಯಭಾರ ಅಸಮತೋಲನ',
        riskLevel: 'HIGH',
        description: `Nodal Officer ${o.name} has ${o.activeCaseload}/${o.maxCapacity || 30} active dockets assigned.`,
        descriptionKn: `ಅಧಿಕಾರಿ ${o.name} ರವರು ${o.activeCaseload}/${o.maxCapacity || 30} ದೂರುಗಳ ಅಧಿಕ ಹೊರೆ ಹೊಂದಿದ್ದಾರೆ.`,
        recommendedAction: 'Rebalance Caseload in Workload Module',
        recommendedActionKn: 'ಕಾರ್ಯಭಾರ ವಿಭಾಗದಲ್ಲಿ ದೂರುಗಳನ್ನು ಮರುಹಂಚಿಕೆ ಮಾಡಿ'
      });
    }
  });

  return generated;
}
