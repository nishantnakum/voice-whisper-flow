
import { useSecureApiKeyStorage } from './useSecureApiKeyStorage';
import { useAudioPlayer } from './useAudioPlayer';
import { synthesizeSpeech } from '@/utils/elevenLabsApi';
import { addHumanExpressions } from '@/utils/textEnhancer';
import { secureLogger } from '@/utils/secureLogger';
import { inputValidator } from '@/utils/inputValidator';

export const useElevenLabsSpeech = () => {
  const { apiKey, setApiKey, hasApiKey } = useSecureApiKeyStorage();
  const { isPlaying, playAudio, stopAudio } = useAudioPlayer();

  const speakText = async (text: string) => {
    secureLogger.info('ElevenLabs TTS request initiated');
    
    if (!hasApiKey) {
      secureLogger.warn('ElevenLabs API key not provided');
      throw new Error('ElevenLabs API key required. Please provide your API key in settings.');
    }

    // Input validation
    const textValidation = inputValidator.validateTextInput(text);
    if (!textValidation.isValid) {
      secureLogger.warn('Invalid text input for TTS', { errors: textValidation.errors });
      throw new Error(`Invalid input: ${textValidation.errors.join(', ')}`);
    }

    try {
      // Add natural human expressions to the text
      const enhancedText = addHumanExpressions(textValidation.sanitizedInput);
      secureLogger.debug('Text enhanced for TTS', { originalLength: text.length, enhancedLength: enhancedText.length });
      
      const audioBlob = await synthesizeSpeech(enhancedText, apiKey);
      await playAudio(audioBlob);
      
    } catch (error) {
      secureLogger.error('Error with ElevenLabs TTS', { error: error.message });
      throw error;
    }
    
    secureLogger.info('ElevenLabs TTS completed successfully');
  };

  return {
    isPlaying,
    speakText,
    stopSpeaking: stopAudio,
    setApiKey,
    apiKey: hasApiKey ? '***CONFIGURED***' : '',
    hasApiKey,
  };
};
