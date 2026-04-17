/**
 * Input Validation Utilities
 * Sanitize and validate user inputs to prevent injection attacks
 */

// UK Postcode regex pattern
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

// Email regex pattern (basic validation)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone regex pattern (UK format)
const UK_PHONE_REGEX = /^(?:(?:\+44)|(?:0))(?:\s?\d){9,10}$/;

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Sanitize string input - remove potential XSS/injection characters
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    // Remove potential script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape special characters that could be used for injection
    .replace(/[<>"'&]/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return escapeMap[char] || char;
    });
}

/**
 * Sanitize input for AI prompts - prevent prompt injection
 */
export function sanitizeForAI(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    // Remove potential prompt injection patterns
    .replace(/ignore\s+(previous|above|all)\s+instructions?/gi, '[FILTERED]')
    .replace(/disregard\s+(previous|above|all)/gi, '[FILTERED]')
    .replace(/system\s*:/gi, '[FILTERED]')
    .replace(/assistant\s*:/gi, '[FILTERED]')
    .replace(/user\s*:/gi, '[FILTERED]')
    // Remove markdown code blocks that might contain instructions
    .replace(/```[\s\S]*?```/g, '[CODE BLOCK REMOVED]')
    // Remove potential JSON injection
    .replace(/\{[\s\S]*"role"[\s\S]*\}/g, '[FILTERED]');
}

/**
 * Validate UK postcode
 */
export function validatePostcode(postcode: string): ValidationResult {
  if (!postcode || typeof postcode !== 'string') {
    return { isValid: false, error: 'Postcode is required' };
  }

  const sanitized = postcode.trim().toUpperCase();

  if (!UK_POSTCODE_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid UK postcode' };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitized = email.trim().toLowerCase();

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  if (!EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate UK phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s-]/g, '');

  if (!UK_PHONE_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid UK phone number' };
  }

  return { isValid: true, sanitized: phone.trim() };
}

/**
 * Validate room dimensions
 */
export function validateRoomDimension(value: number, fieldName: string): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (value < 0.5) {
    return { isValid: false, error: `${fieldName} must be at least 0.5 meters` };
  }

  if (value > 50) {
    return { isValid: false, error: `${fieldName} cannot exceed 50 meters` };
  }

  return { isValid: true };
}

/**
 * Validate count (doors, windows, etc.)
 */
export function validateCount(value: number, fieldName: string, max: number = 100): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (value < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }

  if (!Number.isInteger(value)) {
    return { isValid: false, error: `${fieldName} must be a whole number` };
  }

  if (value > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { isValid: true };
}

/**
 * Validate monetary amount
 */
export function validateAmount(value: number, fieldName: string = 'Amount'): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (value < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }

  if (value > 1000000) {
    return { isValid: false, error: `${fieldName} exceeds maximum allowed value` };
  }

  // Check for valid decimal places (max 2 for currency)
  if (Math.round(value * 100) !== value * 100) {
    return { isValid: false, error: `${fieldName} can only have up to 2 decimal places` };
  }

  return { isValid: true };
}

/**
 * Validate business/profile description
 */
export function validateDescription(description: string, maxLength: number = 1000): ValidationResult {
  if (!description || typeof description !== 'string') {
    return { isValid: false, error: 'Description is required' };
  }

  const trimmed = description.trim();

  if (trimmed.length < 10) {
    return { isValid: false, error: 'Description must be at least 10 characters' };
  }

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Description cannot exceed ${maxLength} characters` };
  }

  return { isValid: true, sanitized: sanitizeString(trimmed, maxLength) };
}

/**
 * Validate image URI
 */
export function validateImageUri(uri: string): ValidationResult {
  if (!uri || typeof uri !== 'string') {
    return { isValid: false, error: 'Image URI is required' };
  }

  // Allow file://, content://, data:image/, and https:// URIs
  const validPrefixes = ['file://', 'content://', 'data:image/', 'https://'];
  const isValidUri = validPrefixes.some(prefix => uri.startsWith(prefix));

  if (!isValidUri) {
    return { isValid: false, error: 'Invalid image URI format' };
  }

  // Check for suspicious patterns in data URIs
  if (uri.startsWith('data:image/')) {
    // Ensure it's actually an image
    if (!uri.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)) {
      return { isValid: false, error: 'Invalid image data format' };
    }
  }

  return { isValid: true, sanitized: uri };
}

/**
 * Validate estimate ID format
 */
export function validateEstimateId(id: string): ValidationResult {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: 'Estimate ID is required' };
  }

  // Expected format: timestamp-randomstring (e.g., "1234567890123-abc123def")
  const sanitized = id.trim();

  if (sanitized.length < 10 || sanitized.length > 50) {
    return { isValid: false, error: 'Invalid estimate ID format' };
  }

  // Only allow alphanumeric and hyphens
  if (!/^[a-zA-Z0-9-]+$/.test(sanitized)) {
    return { isValid: false, error: 'Estimate ID contains invalid characters' };
  }

  return { isValid: true, sanitized };
}
