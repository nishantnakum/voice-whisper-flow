
import { VoiceCharacteristics } from './types';

export const analyzeVoiceCharacteristics = (voiceId: string): VoiceCharacteristics => {
  const voiceCharacteristics: Record<string, VoiceCharacteristics> = {
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
