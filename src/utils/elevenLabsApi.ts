
import { secureLogger } from './secureLogger';
import { inputValidator } from './inputValidator';

export interface ElevenLabsConfig {
  voiceId: string;
  modelId: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export const defaultConfig: ElevenLabsConfig = {
  voiceId: '9BWtsMINqrJLrRacOk9x', // Aria voice
  modelId: 'eleven_multilingual_v2',
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.8,
    use_speaker_boost: true
  }
};

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

// Voice cloning functionality
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

// Get available voices
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

// Voice analysis for personality matching
export const analyzeVoiceCharacteristics = (voiceId: string): {
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'mature';
  accent: string;
  tone: 'warm' | 'neutral' | 'authoritative';
} => {
  // Voice characteristics mapping based on ElevenLabs voice IDs
  const voiceCharacteristics: Record<string, any> = {
    '9BWtsMINqrJLrRacOk9x': { // Aria
      gender: 'female',
      age: 'young',
      accent: 'american',
      tone: 'warm'
    },
    'CwhRBWXzGAHq8TQ4Fs17': { // Roger
      gender: 'male',
      age: 'middle',
      accent: 'british',
      tone: 'authoritative'
    },
    'EXAVITQu4vr4xnSDxMaL': { // Sarah
      gender: 'female',
      age: 'middle',
      accent: 'american',
      tone: 'neutral'
    },
    'JBFqnCBsd6RMkjVDRZzb': { // George
      gender: 'male',
      age: 'mature',
      accent: 'british',
      tone: 'authoritative'
    },
    'TX3LPaxmHKxFdv7VOQHJ': { // Liam
      gender: 'male',
      age: 'young',
      accent: 'american',
      tone: 'neutral'
    },
    'XB0fDUnXU5powFXDhCwa': { // Charlotte
      gender: 'female',
      age: 'middle',
      accent: 'british',
      tone: 'warm'
    }
  };

  return voiceCharacteristics[voiceId] || {
    gender: 'neutral',
    age: 'middle',
    accent: 'neutral',
    tone: 'neutral'
  };
};
