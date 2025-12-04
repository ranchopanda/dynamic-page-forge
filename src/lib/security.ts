/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes script tags and dangerous attributes
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (except for images)
  sanitized = sanitized.replace(/data:(?!image\/)/gi, '');
  
  return sanitized.trim();
};

/**
 * Sanitize user input for safe display
 * Escapes HTML entities
 */
export const escapeHtml = (input: string): string => {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return 'unnamed';
  
  // Remove path separators and special characters
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
};

/**
 * Validate image file type
 */
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

/**
 * Validate image file size (default 10MB)
 */
export const isValidImageSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validate and sanitize user input object
 */
export const sanitizeUserInput = (input: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeHtml(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeUserInput(value);
    }
  }
  
  return sanitized;
};

/**
 * Generate CSRF token (for forms)
 */
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token in session
 */
export const storeCsrfToken = (token: string): void => {
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch {
    // Fallback to memory if sessionStorage blocked
    (window as any).__csrf_token = token;
  }
};

/**
 * Get CSRF token from session
 */
export const getCsrfToken = (): string | null => {
  try {
    return sessionStorage.getItem('csrf_token') || (window as any).__csrf_token || null;
  } catch {
    return (window as any).__csrf_token || null;
  }
};

/**
 * Validate CSRF token
 */
export const validateCsrfToken = (token: string): boolean => {
  const storedToken = getCsrfToken();
  return storedToken === token;
};

/**
 * Rate limit checker for client-side operations
 */
export const checkOperationLimit = (
  operationKey: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const storageKey = `rate_limit_${operationKey}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
    
    // Reset if window expired
    if (now >= data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      localStorage.setItem(storageKey, JSON.stringify(data));
      return { allowed: true, remaining: maxAttempts - 1 };
    }
    
    // Check limit
    if (data.count >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment and allow
    data.count++;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return { allowed: true, remaining: maxAttempts - data.count };
  } catch {
    // If localStorage fails, allow the operation
    return { allowed: true, remaining: maxAttempts };
  }
};

export default {
  sanitizeHtml,
  escapeHtml,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeFilename,
  isValidImageType,
  isValidImageSize,
  sanitizeUserInput,
  generateCsrfToken,
  storeCsrfToken,
  getCsrfToken,
  validateCsrfToken,
  checkOperationLimit,
};
