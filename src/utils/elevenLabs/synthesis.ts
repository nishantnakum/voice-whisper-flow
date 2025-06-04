
import { secureLogger } from '../secureLogger';
import { inputValidator } from '../inputValidator';
import { ElevenLabsConfig, defaultConfig } from './types';

export const synthesizeSpeech = async (
  text: string, 
  apiKey: string, 
  config: ElevenLabsConfig = defaultConfig
): Promise<Blob> => {
  // Rate limiting check
  if (!inputValidator.checkRateLimit()) {
    secureLogger.warn('Rate limit exceeded for TTS requests');
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }

  // Input validation
  const textValidation = inputValidator.validateTextInput(text);
  if (!textValidation.isValid) {
    secureLogger.warn('Invalid text input for TTS', { errors: textValidation.errors });
    throw new Error(`Invalid input: ${textValidation.errors.join(', ')}`);
  }

  const apiKeyValidation = inputValidator.validateApiKey(apiKey);
  if (!apiKeyValidation.isValid) {
    secureLogger.warn('Invalid API key provided');
    throw new Error('Invalid API key provided');
  }

  secureLogger.info('Making TTS API request', { 
    textLength: textValidation.sanitizedInput.length,
    voiceId: config.voiceId,
    modelId: config.modelId
  });
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKeyValidation.sanitizedInput,
    },
    body: JSON.stringify({
      text: textValidation.sanitizedInput,
      model_id: config.modelId,
      voice_settings: config.voiceSettings,
      output_format: 'mp3_44100_128'
    }),
  });

  secureLogger.info('TTS API response received', { status: response.status });

  if (!response.ok) {
    const errorText = await response.text();
    secureLogger.error('ElevenLabs API error', { status: response.status, error: errorText });
    
    if (response.status === 401) {
      throw new Error('Invalid ElevenLabs API key. Please verify your credentials.');
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const audioBlob = await response.blob();
  secureLogger.info('Audio blob created successfully', { size: audioBlob.size });
  
  return audioBlob;
};
