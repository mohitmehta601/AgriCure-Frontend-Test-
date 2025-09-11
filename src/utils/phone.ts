/**
 * Phone number utilities for E.164 format normalization
 * Supports India-friendly formatting
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Normalize phone number to E.164 format
 * Handles common Indian number formats
 */
export function normalizePhoneNumber(phone: string): PhoneValidationResult {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle different input formats
  if (cleaned.startsWith('+')) {
    // Already has country code
    if (cleaned.length >= 10 && cleaned.length <= 16) {
      return { isValid: true, formatted: cleaned };
    }
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    // Indian number with country code but no +
    return { isValid: true, formatted: `+${cleaned}` };
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Indian number with leading 0
    return { isValid: true, formatted: `+91${cleaned.substring(1)}` };
  } else if (cleaned.length === 10) {
    // Indian number without country code
    return { isValid: true, formatted: `+91${cleaned}` };
  }
  
  return { 
    isValid: false, 
    error: 'Please enter a valid mobile number (e.g., +919876543210 or 9876543210)' 
  };
}

/**
 * Check if a string looks like an email
 */
export function isEmail(identifier: string): boolean {
  return identifier.includes('@') && identifier.includes('.');
}

/**
 * Check if a string looks like a phone number
 */
export function isPhoneNumber(identifier: string): boolean {
  const cleaned = identifier.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') || /^\d{10,12}$/.test(cleaned);
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  if (phone.startsWith('+91')) {
    const number = phone.substring(3);
    return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
  }
  return phone;
}

/**
 * Validate Indian mobile number specifically
 */
export function validateIndianMobile(phone: string): PhoneValidationResult {
  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized.isValid) {
    return normalized;
  }
  
  const formatted = normalized.formatted!;
  
  // Check if it's a valid Indian mobile number
  if (formatted.startsWith('+91')) {
    const number = formatted.substring(3);
    // Indian mobile numbers start with 6, 7, 8, or 9
    if (/^[6-9]\d{9}$/.test(number)) {
      return { isValid: true, formatted };
    }
  }
  
  return { 
    isValid: false, 
    error: 'Please enter a valid Indian mobile number' 
  };
}