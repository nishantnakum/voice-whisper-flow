
import { useState, useRef, useEffect } from 'react';

export const useElevenLabsSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState('sk_4e46ade5c4bf6e82057b27817af4a7a2b9200860c3c92e85');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load API key from localStorage on mount, but default to provided key
  useEffect(() => {
    const savedApiKey = localStorage.getItem('elevenlabs-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Set the new provided API key as default and save it
      localStorage.setItem('elevenlabs-api-key', 'sk_4e46ade5c4bf6e82057b27817af4a7a2b9200860c3c92e85');
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('elevenlabs-api-key', key);
  };

  const speakText = async (text: string) => {
    console.log('=== ELEVENLABS TTS START ===');
    console.log('Text to speak:', text);
    
    if (!apiKey) {
      console.error('ElevenLabs API key not provided');
      return;
    }

    try {
      setIsPlaying(true);
      console.log('Set isPlaying to true');
      
      // Add natural human expressions to the text
      const enhancedText = addHumanExpressions(text);
      console.log('Enhanced text for ElevenLabs:', enhancedText);
      console.log('Using API key:', apiKey.substring(0, 10) + '...');
      
      // Use Aria voice ID (9BWtsMINqrJLrRacOk9x) which is a reliable default
      console.log('Making API request to ElevenLabs...');
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

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);
        
        if (response.status === 401) {
          console.error('Invalid API key. Please check your ElevenLabs API key.');
          console.error('Current API key being used:', apiKey);
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      console.log('ElevenLabs API response successful, creating audio...');
      const audioBlob = await response.blob();
      console.log('Audio blob created, size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Audio URL created:', audioUrl);
      
      // Stop any existing audio
      if (audioRef.current) {
        console.log('Stopping existing audio');
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Create new audio element
      console.log('Creating new Audio element...');
      audioRef.current = new Audio(audioUrl);
      
      // Set up event listeners
      audioRef.current.onloadstart = () => console.log('Audio load started');
      audioRef.current.oncanplay = () => console.log('Audio can play');
      audioRef.current.onplay = () => console.log('Audio play event fired');
      audioRef.current.onplaying = () => console.log('Audio is playing');
      audioRef.current.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = (error) => {
        console.error('Audio playback error:', error);
        console.error('Audio error details:', audioRef.current?.error);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onpause = () => console.log('Audio paused');
      audioRef.current.onabort = () => console.log('Audio aborted');
      audioRef.current.onstalled = () => console.log('Audio stalled');
      audioRef.current.onsuspend = () => console.log('Audio suspended');
      
      // Set volume
      audioRef.current.volume = 1.0;
      console.log('Audio volume set to:', audioRef.current.volume);
      
      console.log('Starting audio playback...');
      try {
        await audioRef.current.play();
        console.log('Audio play() promise resolved successfully');
      } catch (playError) {
        console.error('Error during audio.play():', playError);
        setIsPlaying(false);
        throw playError;
      }
      
    } catch (error) {
      console.error('Error with ElevenLabs TTS:', error);
      setIsPlaying(false);
    }
    
    console.log('=== ELEVENLABS TTS END ===');
  };

  const stopSpeaking = () => {
    console.log('stopSpeaking called');
    if (audioRef.current) {
      console.log('Stopping audio playback');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      console.log('No audio to stop');
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
