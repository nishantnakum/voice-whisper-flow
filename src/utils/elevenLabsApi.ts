
import { generateSecureSpeech } from './secureApiService';

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

// Secure speech synthesis using Edge Functions
export const synthesizeSpeech = async (
  text: string, 
  apiKey: string, 
  config: ElevenLabsConfig = defaultConfig
): Promise<Blob> => {
  console.log('Using secure speech synthesis...');
  
  // Use secure API service instead of direct API calls
  const audioBlob = await generateSecureSpeech(text);
  
  if (!audioBlob) {
    throw new Error('Failed to synthesize speech securely');
  }
  
  return audioBlob;
};
