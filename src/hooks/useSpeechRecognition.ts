
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpeechRecognition = (
  onTranscriptComplete: (text: string) => void,
  isAISpeaking: boolean = false
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  console.log('useSpeechRecognition: isAISpeaking =', isAISpeaking, 'isRecording =', isRecording);

  useEffect(() => {
    console.log('useSpeechRecognition: Initializing speech recognition...');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        console.log('Speech recognition result received, isAISpeaking:', isAISpeaking);
        
        // Don't process results if AI is speaking
        if (isAISpeaking) {
          console.log('Ignoring speech recognition because AI is speaking');
          return;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(finalTranscript + interimTranscript);

        if (finalTranscript && !isAISpeaking) {
          console.log('Calling onTranscriptComplete with:', finalTranscript);
          onTranscriptComplete(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setCurrentTranscript('');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Speech Recognition Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
        setIsRecording(false);
      };
    } else {
      console.log('Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Stop recording when AI starts speaking
  useEffect(() => {
    if (isAISpeaking && isRecording && recognitionRef.current) {
      console.log('Stopping recording because AI started speaking');
      recognitionRef.current.stop();
      setIsRecording(false);
      setCurrentTranscript('');
    }
  }, [isAISpeaking, isRecording]);

  const toggleRecording = () => {
    console.log('toggleRecording called, current state:', { isRecording, isAISpeaking });
    
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    // Don't allow recording while AI is speaking
    if (isAISpeaking) {
      toast({
        title: "Please Wait",
        description: "Please wait for the AI to finish speaking before recording.",
        variant: "default",
      });
      return;
    }

    if (isRecording) {
      console.log('Stopping recording');
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      console.log('Starting recording');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return {
    isRecording,
    currentTranscript,
    toggleRecording,
  };
};
