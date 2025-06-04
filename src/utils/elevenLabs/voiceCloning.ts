
import { secureLogger } from '../secureLogger';
import { inputValidator } from '../inputValidator';

export const cloneVoice = async (
  apiKey: string,
  name: string,
  description: string,
  audioFiles: File[]
): Promise<string> => {
  // Rate limiting check
  if (!inputValidator.checkRateLimit()) {
    secureLogger.warn('Rate limit exceeded for voice cloning');
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }

  // Input validation
  const apiKeyValidation = inputValidator.validateApiKey(apiKey);
  if (!apiKeyValidation.isValid) {
    secureLogger.warn('Invalid API key for voice cloning');
    throw new Error('Invalid API key provided');
  }

  const nameValidation = inputValidator.validateTextInput(name);
  const descValidation = inputValidator.validateTextInput(description);

  if (!nameValidation.isValid || !descValidation.isValid) {
    secureLogger.warn('Invalid input for voice cloning');
    throw new Error('Invalid name or description provided');
  }

  secureLogger.info('Starting voice cloning process', { fileCount: audioFiles.length });
  
  const formData = new FormData();
  formData.append('name', nameValidation.sanitizedInput);
  formData.append('description', descValidation.sanitizedInput);
  
  audioFiles.forEach((file, index) => {
    formData.append(`files`, file);
  });

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKeyValidation.sanitizedInput,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    secureLogger.error('Voice cloning API error', { status: response.status });
    throw new Error(`Voice cloning failed: ${response.status}`);
  }

  const data = await response.json();
  secureLogger.info('Voice cloned successfully');
  
  return data.voice_id;
};

export const getAvailableVoices = async (apiKey: string) => {
  const apiKeyValidation = inputValidator.validateApiKey(apiKey);
  if (!apiKeyValidation.isValid) {
    throw new Error('Invalid API key provided');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    method: 'GET',
    headers: {
      'xi-api-key': apiKeyValidation.sanitizedInput,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  const data = await response.json();
  return data.voices;
};
