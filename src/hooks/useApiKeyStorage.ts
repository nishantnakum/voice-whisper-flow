
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'elevenlabs-api-key';
const DEFAULT_API_KEY = 'sk_4e46ade5c4bf6e82057b27817af4a7a2b9200860c3c92e85';

export const useApiKeyStorage = () => {
  const [apiKey, setApiKeyState] = useState(DEFAULT_API_KEY);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(STORAGE_KEY);
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
    } else {
      // Set the default API key and save it
      localStorage.setItem(STORAGE_KEY, DEFAULT_API_KEY);
    }
  }, []);

  // Save API key to localStorage when it changes
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(STORAGE_KEY, key);
  };

  return {
    apiKey,
    setApiKey,
  };
};
