/**
 * Profanity Filter Utility
 * Filters derogatory language and inappropriate content from reviews
 */

// Common profanity and derogatory terms (partial list for demonstration)
const PROFANITY_LIST = [
  'damn',
  'hell',
  'crap',
  'stupid',
  'idiot',
  'moron',
  'dumb',
  'useless',
  'worthless',
  'pathetic',
  'incompetent',
  'garbage',
  'rubbish',
  'terrible',
  'awful',
  // Add more as needed
];

// Variations and common misspellings
const PROFANITY_PATTERNS = [
  /d[a@]mn/gi,
  /h[e3]ll/gi,
  /cr[a@]p/gi,
  /st[u\*]pid/gi,
  /[i1]d[i1][o0]t/gi,
  /m[o0]r[o0]n/gi,
  /d[u\*]mb/gi,
];

/**
 * Check if text contains profanity or derogatory language
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check against word list
  for (const word of PROFANITY_LIST) {
    if (lowerText.indexOf(word) !== -1) {
      return true;
    }
  }
  
  // Check against patterns (handles variations)
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter profanity by replacing with asterisks
 */
export function filterProfanity(text: string): string {
  let filtered = text;
  
  // Replace exact matches
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, (match) => {
      return new Array(match.length + 1).join('*');
    });
  });
  
  // Replace pattern matches
  PROFANITY_PATTERNS.forEach(pattern => {
    filtered = filtered.replace(pattern, (match) => {
      return new Array(match.length + 1).join('*');
    });
  });
  
  return filtered;
}

/**
 * Validate review text
 * Returns { valid: boolean, message?: string }
 */
export function validateReviewText(text: string): { valid: boolean; message?: string } {
  // Check minimum length
  if (text.trim().length < 10) {
    return {
      valid: false,
      message: 'Review must be at least 10 characters long',
    };
  }
  
  // Check maximum length
  if (text.length > 500) {
    return {
      valid: false,
      message: 'Review must be less than 500 characters',
    };
  }
  
  // Check for profanity
  if (containsProfanity(text)) {
    return {
      valid: false,
      message: 'Review contains inappropriate language. Please keep reviews professional and constructive.',
    };
  }
  
  // Check for spam (excessive repetition)
  const words = text.toLowerCase().split(/\s+/);
  const wordCount: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Flag if any word appears more than 5 times
  for (const word in wordCount) {
    if (wordCount[word] > 5) {
      return {
        valid: false,
        message: 'Review appears to contain spam or excessive repetition',
      };
    }
  }
  
  // Check for all caps (shouting)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 20) {
    return {
      valid: false,
      message: 'Please avoid writing in all capital letters',
    };
  }
  
  return { valid: true };
}

/**
 * Get constructive feedback suggestions based on rating
 */
export function getReviewGuidelines(rating: number): string[] {
  if (rating >= 4) {
    return [
      'What did they do particularly well?',
      'Would you hire them again?',
      'Any advice for others considering this professional?',
    ];
  } else if (rating >= 3) {
    return [
      'What could have been improved?',
      'Was the issue communicated and resolved?',
      'Any positive aspects worth mentioning?',
    ];
  } else {
    return [
      'What specific issues occurred?',
      'Was there an attempt to resolve the problem?',
      'Please focus on facts rather than emotions',
    ];
  }
}
