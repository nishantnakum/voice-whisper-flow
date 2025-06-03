
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'elevenlabs-api-key';

interface ApiKeyStorageReturn {
  apiKey: string;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  hasApiKey: boolean;
  isUsingUserKey: boolean;
}

export const useSecureApiKeyStorage = (): ApiKeyStorageReturn => {
  const [apiKey, setApiKeyState] = useState('');
  const [isUsingUserKey, setIsUsingUserKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(STORAGE_KEY);
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
      setIsUsingUserKey(true);
    }
  }, []);

  const setApiKey = (key: string) => {
    if (!key || key.trim().length === 0) {
      console.warn('Empty API key provided');
      return;
    }

    // Validate API key format (basic validation)
    if (!key.startsWith('sk_') || key.length < 20) {
      console.warn('Invalid API key format');
      return;
    }

    setApiKeyState(key.trim());
    setIsUsingUserKey(true);
    localStorage.setItem(STORAGE_KEY, key.trim());
    
    // Security notice
    console.info('API key stored locally. Please ensure you trust this device.');
  };

  const clearApiKey = () => {
    setApiKeyState('');
    setIsUsingUserKey(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasApiKey: !!apiKey,
    isUsingUserKey,
  };
};
