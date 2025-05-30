
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

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        // Don't process results if AI is speaking
        if (isAISpeaking) {
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
          onTranscriptComplete(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
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
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptComplete, toast, isAISpeaking]);

  // Stop recording when AI starts speaking
  useEffect(() => {
    if (isAISpeaking && isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setCurrentTranscript('');
    }
  }, [isAISpeaking, isRecording]);

  const toggleRecording = () => {
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
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
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
