
import { useState, useCallback } from 'react';
import { useApiKeyStorage } from './useApiKeyStorage';
import { useAudioPlayer } from './useAudioPlayer';
import { synthesizeSpeech, ElevenLabsConfig } from '@/utils/elevenLabsApi';
import { addHumanExpressions, analyzeEmotionalTone, adaptVoiceForTone } from '@/utils/textEnhancer';

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

export const useElevenLabsVoiceEngine = () => {
  const { apiKey, setApiKey } = useApiKeyStorage();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();
  const [currentPersonality, setCurrentPersonality] = useState<VoicePersonality>(VOICE_PERSONALITIES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceQuality, setVoiceQuality] = useState<'standard' | 'premium'>('premium');

  const speakWithPersonality = useCallback(async (
    text: string, 
    personality?: VoicePersonality,
    emotionalContext?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      urgency: 'low' | 'medium' | 'high';
      formality: 'casual' | 'professional' | 'formal';
    }
  ) => {
    console.log('=== ELEVENLABS PERSONALITY TTS START ===');
    
    if (!apiKey) {
      console.error('ElevenLabs API key not provided');
      return;
    }

    setIsProcessing(true);
    const selectedPersonality = personality || currentPersonality;

    try {
      // Analyze emotional tone and adapt text
      const emotionalTone = analyzeEmotionalTone(text);
      const adaptedText = adaptVoiceForTone(text, emotionalTone, selectedPersonality.characteristics);
      
      // Add human expressions based on personality
      const enhancedText = addHumanExpressions(adaptedText, selectedPersonality.characteristics);
      
      console.log('Enhanced text for personality:', selectedPersonality.name, enhancedText);

      // Create adaptive voice configuration
      const adaptiveConfig: ElevenLabsConfig = {
        voiceId: selectedPersonality.voiceId,
        modelId: voiceQuality === 'premium' ? 'eleven_multilingual_v2' : 'eleven_turbo_v2_5',
        voiceSettings: {
          ...selectedPersonality.voiceSettings,
          // Adjust settings based on emotional context
          stability: emotionalContext?.urgency === 'high' ? 
            Math.max(0.3, selectedPersonality.voiceSettings.stability - 0.2) : 
            selectedPersonality.voiceSettings.stability,
          style: emotionalContext?.sentiment === 'positive' ? 
            Math.min(1.0, selectedPersonality.voiceSettings.style + 0.1) : 
            selectedPersonality.voiceSettings.style
        }
      };

      const audioBlob = await synthesizeSpeech(enhancedText, apiKey, adaptiveConfig);
      await playAudio(audioBlob);
      
    } catch (error) {
      console.error('Error with ElevenLabs personality TTS:', error);
    } finally {
      setIsProcessing(false);
    }
    
    console.log('=== ELEVENLABS PERSONALITY TTS END ===');
  }, [apiKey, currentPersonality, voiceQuality, playAudio]);

  const switchPersonality = useCallback((personalityId: string) => {
    const personality = VOICE_PERSONALITIES.find(p => p.id === personalityId);
    if (personality) {
      setCurrentPersonality(personality);
      console.log('Switched to personality:', personality.name);
    }
  }, []);

  const getPersonalityForContext = useCallback((aiMode: string, messageType: 'strategic' | 'creative' | 'analytical' | 'diplomatic') => {
    const personalityMap: Record<string, string> = {
      'business_strategist': 'executive',
      'research_assistant': 'analyst',
      'creative_writer': 'innovator',
      'brainstormer': 'innovator',
      'technical_solver': 'analyst'
    };

    const typeMap: Record<string, string> = {
      'strategic': 'executive',
      'creative': 'innovator',
      'analytical': 'analyst',
      'diplomatic': 'diplomatic'
    };

    const personalityId = personalityMap[aiMode] || typeMap[messageType] || 'executive';
    return VOICE_PERSONALITIES.find(p => p.id === personalityId) || VOICE_PERSONALITIES[0];
  }, []);

  return {
    isPlaying,
    isProcessing,
    currentPersonality,
    availablePersonalities: VOICE_PERSONALITIES,
    voiceQuality,
    speakWithPersonality,
    switchPersonality,
    getPersonalityForContext,
    setVoiceQuality,
    stopSpeaking: stopAudio,
    setApiKey,
    apiKey
  };
};
