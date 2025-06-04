
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

export interface VoiceCharacteristics {
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'mature';
  accent: string;
  tone: 'warm' | 'neutral' | 'authoritative';
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
