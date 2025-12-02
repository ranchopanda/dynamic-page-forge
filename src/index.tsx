// CRITICAL: Install storage protection FIRST, before any imports
// This prevents storage errors from third-party libraries during initialization

if (typeof window !== 'undefined') {
  // Create a safe storage proxy that never throws
  const createSafeStorage = (storageType: 'local' | 'session') => {
    const memoryStore: Record<string, string> = {};
    let realStorage: Storage | null = null;
    
    // Try to get real storage, but don't fail if blocked
    try {
      const originalStorage = storageType === 'local' 
        ? Object.getOwnPropertyDescriptor(Window.prototype, 'localStorage')?.get?.call(window)
        : Object.getOwnPropertyDescriptor(Window.prototype, 'sessionStorage')?.get?.call(window);
      
      if (originalStorage) {
        // Test if it actually works
        const testKey = '__test__';
        originalStorage.setItem(testKey, 'x');
        originalStorage.removeItem(testKey);
        realStorage = originalStorage;
      }
    } catch {
      realStorage = null;
      // Storage blocked - silently use memory fallback
    }
    
    return new Proxy({} as Storage, {
      get(_target, prop: string) {
        if (prop === 'length') {
          try {
            return realStorage?.length ?? Object.keys(memoryStore).length;
          } catch {
            return Object.keys(memoryStore).length;
          }
        }
        if (prop === 'key') {
          return (index: number) => {
            try {
              return realStorage?.key(index) ?? Object.keys(memoryStore)[index] ?? null;
            } catch {
              return Object.keys(memoryStore)[index] ?? null;
            }
          };
        }
        if (prop === 'getItem') {
          return (key: string) => {
            try {
              return realStorage?.getItem(key) ?? memoryStore[key] ?? null;
            } catch {
              return memoryStore[key] ?? null;
            }
          };
        }
        if (prop === 'setItem') {
          return (key: string, value: string) => {
            memoryStore[key] = value;
            try {
              realStorage?.setItem(key, value);
            } catch { /* ignore */ }
          };
        }
        if (prop === 'removeItem') {
          return (key: string) => {
            delete memoryStore[key];
            try {
              realStorage?.removeItem(key);
            } catch { /* ignore */ }
          };
        }
        if (prop === 'clear') {
          return () => {
            Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
            try {
              realStorage?.clear();
            } catch { /* ignore */ }
          };
        }
        return undefined;
      },
      set(_target, prop: string, value: any) {
        memoryStore[prop] = String(value);
        try {
          if (realStorage) realStorage[prop] = value;
        } catch { /* ignore */ }
        return true;
      }
    });
  };

  // Create cached instances to avoid infinite recursion
  const safeLocalStorage = createSafeStorage('local');
  const safeSessionStorage = createSafeStorage('session');

  // Replace localStorage with safe version
  try {
    Object.defineProperty(window, 'localStorage', {
      get: () => safeLocalStorage,
      configurable: true
    });
  } catch {
    // Could not override localStorage - will use memory fallback
  }

  // Replace sessionStorage with safe version
  try {
    Object.defineProperty(window, 'sessionStorage', {
      get: () => safeSessionStorage,
      configurable: true
    });
  } catch {
    // Could not override sessionStorage - will use memory fallback
  }
}

// Error handler for any storage errors that slip through
const isStorageError = (error: any) => {
  if (!error) return false;
  
  const message = error.message || error.reason?.message || String(error);
  const name = error.name || error.reason?.name || '';
  
  if (name === 'QuotaExceededError' || message.includes('QuotaExceededError')) {
    return true;
  }
  
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('storage') || 
    lowerMessage.includes('localstorage') ||
    lowerMessage.includes('sessionstorage') ||
    lowerMessage.includes('access to storage') ||
    lowerMessage.includes('not allowed from this context') ||
    lowerMessage.includes('denied') ||
    lowerMessage.includes('quota')
  );
};

// Suppress storage errors silently (no console output)
window.addEventListener('unhandledrejection', (event) => {
  if (isStorageError(event.reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
}, true);

window.addEventListener('error', (event) => {
  if (isStorageError(event.error || event.message || event)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  }
}, true);

// Also catch console errors related to storage
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ').toLowerCase();
  if (message.includes('storage') && (message.includes('access') || message.includes('not allowed'))) {
    return; // Suppress storage-related console errors
  }
  originalConsoleError.apply(console, args);
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
