
import { useState, useRef } from 'react';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (audioBlob: Blob): Promise<void> => {
    console.log('Creating audio from blob...');
    
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
    setIsPlaying(true);
    
    try {
      await audioRef.current.play();
      console.log('Audio play() promise resolved successfully');
    } catch (playError) {
      console.error('Error during audio.play():', playError);
      setIsPlaying(false);
      throw playError;
    }
  };

  const stopAudio = () => {
    console.log('stopAudio called');
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
    playAudio,
    stopAudio,
  };
};
