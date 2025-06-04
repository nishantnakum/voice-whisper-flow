
import { useState, useCallback } from 'react';
import { useApiKeyStorage } from './useApiKeyStorage';
import { useAudioPlayer } from './useAudioPlayer';
import { synthesizeSpeech, ElevenLabsConfig } from '@/utils/elevenLabsApi';
import { addHumanExpressions, analyzeEmotionalTone, adaptVoiceForTone } from '@/utils/textEnhancer';
import { VoicePersonality, VOICE_PERSONALITIES } from './voiceEngine/personalities';
import { getPersonalityForContext } from './voiceEngine/contextMapping';

export { type VoicePersonality, VOICE_PERSONALITIES } from './voiceEngine/personalities';

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
      const emotionalTone = analyzeEmotionalTone(text);
      const adaptedText = adaptVoiceForTone(text, emotionalTone, selectedPersonality.characteristics);
      const enhancedText = addHumanExpressions(adaptedText, selectedPersonality.characteristics);
      
      console.log('Enhanced text for personality:', selectedPersonality.name, enhancedText);

      const adaptiveConfig: ElevenLabsConfig = {
        voiceId: selectedPersonality.voiceId,
        modelId: voiceQuality === 'premium' ? 'eleven_multilingual_v2' : 'eleven_turbo_v2_5',
        voiceSettings: {
          ...selectedPersonality.voiceSettings,
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
