
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'elevenlabs-api-key';

export const useApiKeyStorage = () => {
  const [apiKey, setApiKeyState] = useState('');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(STORAGE_KEY);
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  const setApiKey = (key: string) => {
    if (key && key.length > 0) {
      setApiKeyState(key);
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      setApiKeyState('');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Check if we have a valid API key
  const hasValidApiKey = apiKey && apiKey.startsWith('sk_') && apiKey.length > 20;

  return {
    apiKey: hasValidApiKey ? apiKey : '',
    setApiKey,
    hasValidApiKey,
  };
};
