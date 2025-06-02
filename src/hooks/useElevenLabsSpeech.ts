
import { useApiKeyStorage } from './useApiKeyStorage';
import { useAudioPlayer } from './useAudioPlayer';
import { synthesizeSpeech } from '@/utils/elevenLabsApi';
import { addHumanExpressions } from '@/utils/textEnhancer';

export const useElevenLabsSpeech = () => {
  const { apiKey, setApiKey } = useApiKeyStorage();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();

  const speakText = async (text: string) => {
    console.log('=== ELEVENLABS TTS START ===');
    console.log('Text to speak:', text);
    
    if (!apiKey) {
      console.error('ElevenLabs API key not provided');
      return;
    }

    try {
      // Add natural human expressions to the text
      const enhancedText = addHumanExpressions(text);
      console.log('Enhanced text for ElevenLabs:', enhancedText);
      console.log('Using API key:', apiKey.substring(0, 10) + '...');
      
      const audioBlob = await synthesizeSpeech(enhancedText, apiKey);
      await playAudio(audioBlob);
      
    } catch (error) {
      console.error('Error with ElevenLabs TTS:', error);
    }
    
    console.log('=== ELEVENLABS TTS END ===');
  };

  return {
    isPlaying,
    speakText,
    stopSpeaking: stopAudio,
    setApiKey,
    apiKey,
  };
};
