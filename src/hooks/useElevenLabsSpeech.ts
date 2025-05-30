
import { useState, useRef, useEffect } from 'react';

export const useElevenLabsSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('elevenlabs-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('elevenlabs-api-key', key);
  };

  const speakText = async (text: string) => {
    if (!apiKey) {
      console.error('ElevenLabs API key not provided');
      return;
    }

    try {
      setIsPlaying(true);
      
      // Add natural human expressions to the text
      const enhancedText = addHumanExpressions(text);
      console.log('Enhanced text for ElevenLabs:', enhancedText);
      
      // Use Aria voice ID (9BWtsMINqrJLrRacOk9x) which is a reliable default
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: enhancedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.8,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);
        
        if (response.status === 401) {
          console.error('Invalid API key. Please check your ElevenLabs API key.');
          // Clear the invalid API key
          localStorage.removeItem('elevenlabs-api-key');
          setApiKey('');
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      console.log('Playing audio...');
      await audioRef.current.play();
    } catch (error) {
      console.error('Error with ElevenLabs TTS:', error);
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    speakText,
    stopSpeaking,
    setApiKey: handleSetApiKey,
    apiKey,
  };
};

// Add natural human expressions to make speech more realistic
const addHumanExpressions = (text: string): string => {
  let enhancedText = text;
  
  // Add thinking sounds at the beginning for questions
  if (text.includes('?') || text.toLowerCase().includes('what') || text.toLowerCase().includes('how')) {
    enhancedText = '*hmm* ' + enhancedText;
  }
  
  // Add breathing pauses for longer sentences
  if (text.length > 50) {
    enhancedText = enhancedText.replace(/\. /g, '. *takes a breath* ');
  }
  
  // Add expressions for emotions
  if (text.includes('!') || text.toLowerCase().includes('great') || text.toLowerCase().includes('awesome')) {
    enhancedText = enhancedText.replace(/!/, ' *chuckles* !');
  }
  
  // Add hesitation for complex topics
  if (text.toLowerCase().includes('complex') || text.toLowerCase().includes('difficult')) {
    enhancedText = '*umm* ' + enhancedText;
  }
  
  // Add natural pauses with breathing sounds
  enhancedText = enhancedText.replace(/,/g, ', *pause*');
  
  // Add occasional breathing sounds for longer responses
  if (text.length > 100) {
    const sentences = enhancedText.split('. ');
    if (sentences.length > 2) {
      sentences[Math.floor(sentences.length / 2)] = '*inhales* ' + sentences[Math.floor(sentences.length / 2)];
    }
    enhancedText = sentences.join('. ');
  }
  
  return enhancedText;
};
