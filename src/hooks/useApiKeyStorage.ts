
import { useSecureApiKeyStorage } from './useSecureApiKeyStorage';

// Wrapper for backward compatibility
export const useApiKeyStorage = () => {
  return useSecureApiKeyStorage();
};
