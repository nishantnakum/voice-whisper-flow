
export interface VoicePersonality {
  id: string;
  name: string;
  description: string;
  voiceId: string;
  characteristics: {
    formality: 'formal' | 'professional' | 'casual';
    energy: 'low' | 'medium' | 'high';
    warmth: 'cold' | 'neutral' | 'warm';
    authority: 'authoritative' | 'collaborative' | 'supportive';
  };
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export const VOICE_PERSONALITIES: VoicePersonality[] = [
  {
    id: 'executive',
    name: 'Executive Leader',
    description: 'Authoritative, confident, ideal for strategic discussions',
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George
    characteristics: {
      formality: 'formal',
      energy: 'medium',
      warmth: 'neutral',
      authority: 'authoritative'
    },
    voiceSettings: {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.9,
      use_speaker_boost: true
    }
  },
  {
    id: 'diplomatic',
    name: 'Diplomatic Advisor',
    description: 'Warm, measured, perfect for sensitive negotiations',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah
    characteristics: {
      formality: 'professional',
      energy: 'medium',
      warmth: 'warm',
      authority: 'collaborative'
    },
    voiceSettings: {
      stability: 0.8,
      similarity_boost: 0.75,
      style: 0.6,
      use_speaker_boost: true
    }
  },
  {
    id: 'analyst',
    name: 'Strategic Analyst',
    description: 'Precise, analytical, excellent for data-driven insights',
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ', // Liam
    characteristics: {
      formality: 'professional',
      energy: 'low',
      warmth: 'neutral',
      authority: 'supportive'
    },
    voiceSettings: {
      stability: 0.9,
      similarity_boost: 0.7,
      style: 0.4,
      use_speaker_boost: false
    }
  },
  {
    id: 'innovator',
    name: 'Innovation Catalyst',
    description: 'Energetic, creative, inspiring for brainstorming sessions',
    voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
    characteristics: {
      formality: 'casual',
      energy: 'high',
      warmth: 'warm',
      authority: 'collaborative'
    },
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.8,
      use_speaker_boost: true
    }
  }
];
