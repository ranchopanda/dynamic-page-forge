/**
 * Client-side rate limiter to prevent API abuse
 * Tracks requests per endpoint and enforces cooldown periods
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly defaultWindow = 60000; // 1 minute
  private readonly defaultMax = 10; // 10 requests per window

  /**
   * Check if a request is allowed
   * @param key - Unique identifier for the rate limit (e.g., 'ai-generate', 'upload')
   * @param maxRequests - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and retry time
   */
  checkLimit(
    key: string,
    maxRequests: number = this.defaultMax,
    windowMs: number = this.defaultWindow
  ): { allowed: boolean; retryAfter?: number; remaining?: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    // No previous requests or window expired
    if (!entry || now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
        lastRequest: now,
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    // Within rate limit
    if (entry.count < maxRequests) {
      entry.count++;
      entry.lastRequest = now;
      return { allowed: true, remaining: maxRequests - entry.count };
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  /**
   * Enforce a cooldown period between requests
   * @param key - Unique identifier
   * @param cooldownMs - Minimum time between requests in milliseconds
   */
  checkCooldown(key: string, cooldownMs: number): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + cooldownMs,
        lastRequest: now,
      });
      return { allowed: true };
    }

    const timeSinceLastRequest = now - entry.lastRequest;
    if (timeSinceLastRequest >= cooldownMs) {
      entry.lastRequest = now;
      return { allowed: true };
    }

    const retryAfter = Math.ceil((cooldownMs - timeSinceLastRequest) / 1000);
    return { allowed: false, retryAfter };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  resetAll(): void {
    this.limits.clear();
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number = this.defaultMax): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() >= entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limits for different operations
export const RATE_LIMITS = {
  AI_GENERATION: { max: 5, window: 60000, cooldown: 10000 }, // 5 per minute, 10s cooldown
  AI_ANALYSIS: { max: 10, window: 60000, cooldown: 3000 }, // 10 per minute, 3s cooldown
  IMAGE_UPLOAD: { max: 20, window: 60000, cooldown: 1000 }, // 20 per minute, 1s cooldown
  DESIGN_SAVE: { max: 30, window: 60000, cooldown: 500 }, // 30 per minute, 0.5s cooldown
} as const;

export default rateLimiter;
