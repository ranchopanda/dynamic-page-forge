/**
 * Safe storage utility that handles restricted browser contexts
 * Falls back to in-memory storage when localStorage is blocked
 * Handles quota exceeded errors gracefully
 */

const memoryStorage: Record<string, string> = {};

// Track if we've already tried to clear storage in this session
let hasTriedClearing = false;

function canUseLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Even accessing window.localStorage can throw in some contexts
    // Use a try-catch for the property access itself
    let storage;
    try {
      storage = window.localStorage;
    } catch {
      return false;
    }
    
    if (!storage) return false;
    
    // Test actual read/write operations
    const testKey = '__test__' + Date.now();
    storage.setItem(testKey, 'x');
    const value = storage.getItem(testKey);
    storage.removeItem(testKey);
    
    return value === 'x';
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (canUseLocalStorage()) {
        return window.localStorage.getItem(key);
      }
    } catch { /* ignore */ }
    return memoryStorage[key] ?? null;
  },

  setItem(key: string, value: string): void {
    // Always store in memory first
    memoryStorage[key] = value;
    
    try {
      if (canUseLocalStorage()) {
        window.localStorage.setItem(key, value);
      }
    } catch (error: any) {
      // Handle quota exceeded errors specifically
      if (error?.name === 'QuotaExceededError' || 
          error?.code === 22 || 
          error?.message?.includes('quota') ||
          error?.message?.includes('QuotaExceededError')) {
        
        // localStorage quota exceeded - try to clear space
        if (!hasTriedClearing) {
          hasTriedClearing = true;
          
          try {
            // Clear items that might be taking up space (common culprits)
            const nonEssentialKeys = [
              'inputHistory', 
              'recentSearches', 
              'cache',
              'debug',
              'logs',
              'analytics'
            ];
            
            for (const k of nonEssentialKeys) {
              try {
                window.localStorage.removeItem(k);
              } catch { /* ignore */ }
            }
            
            // Try one more time after clearing
            window.localStorage.setItem(key, value);
          } catch {
            // Still quota exceeded - using memory storage only
          }
        }
      }
    }
  },

  removeItem(key: string): void {
    delete memoryStorage[key];
    try {
      if (canUseLocalStorage()) {
        window.localStorage.removeItem(key);
      }
    } catch { /* ignore */ }
  },

  clear(): void {
    Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    try {
      if (canUseLocalStorage()) {
        window.localStorage.clear();
      }
    } catch { /* ignore */ }
  },

  isAvailable(): boolean {
    return canUseLocalStorage();
  },
};

export default safeStorage;
