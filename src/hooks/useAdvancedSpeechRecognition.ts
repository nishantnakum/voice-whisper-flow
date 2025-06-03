
import { useState, useRef, useCallback, useEffect } from 'react';

export interface SpeechConfig {
  language: string;
  enableTranslation: boolean;
  targetLanguage?: string;
  noiseFiltering: boolean;
  speakerRecognition: boolean;
  confidenceThreshold: number;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  language: string;
  translatedText?: string;
  speakerId?: string;
  timestamp: Date;
  audioLevel: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' }
];

export const useAdvancedSpeechRecognition = (
  onResult: (result: SpeechResult) => void,
  config: SpeechConfig = {
    language: 'en-US',
    enableTranslation: false,
    noiseFiltering: true,
    speakerRecognition: false,
    confidenceThreshold: 0.7
  }
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState(config.language);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize audio analysis for noise filtering and level detection
  const initializeAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: config.noiseFiltering,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start audio level monitoring
      const monitorAudioLevel = () => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          const sum = dataArray.reduce((a, b) => a + b, 0);
          const avgLevel = sum / bufferLength;
          setAudioLevel(avgLevel / 255);
        }
        
        if (isRecording) {
          animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
        }
      };

      monitorAudioLevel();
    } catch (error) {
      console.error('Error initializing audio analysis:', error);
    }
  }, [config.noiseFiltering, isRecording]);

  // Advanced language detection
  const detectLanguage = useCallback(async (text: string): Promise<string> => {
    try {
      // Simple heuristic-based language detection
      const patterns = {
        'zh-CN': /[\u4e00-\u9fff]/,
        'ja-JP': /[\u3040-\u309f\u30a0-\u30ff]/,
        'ko-KR': /[\uac00-\ud7af]/,
        'ar-SA': /[\u0600-\u06ff]/,
        'hi-IN': /[\u0900-\u097f]/,
        'ru-RU': /[\u0400-\u04ff]/
      };

      for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
          return lang;
        }
      }

      // Default to configured language for Latin scripts
      return config.language;
    } catch (error) {
      console.error('Language detection error:', error);
      return config.language;
    }
  }, [config.language]);

  // Real-time translation using browser APIs
  const translateText = useCallback(async (text: string, targetLang: string): Promise<string> => {
    if (!config.enableTranslation || !config.targetLanguage) {
      return text;
    }

    try {
      // Use browser's built-in translation capabilities if available
      if ('translation' in navigator) {
        // @ts-ignore - experimental API
        const translator = await navigator.translation.createTranslator({
          sourceLanguage: detectedLanguage.split('-')[0],
          targetLanguage: targetLang.split('-')[0]
        });
        return await translator.translate(text);
      }

      // Fallback to a simple translation service
      const response = await fetch('https://api.mymemory.translated.net/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.responseData?.translatedText || text;
      }

      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [config.enableTranslation, config.targetLanguage, detectedLanguage]);

  // Speaker identification (basic implementation)
  const identifySpeaker = useCallback(async (audioData: Float32Array): Promise<string> => {
    if (!config.speakerRecognition) return 'unknown';

    try {
      // Basic voice print analysis using audio characteristics
      const fundamentalFreq = await estimateFundamentalFreq(audioData);
      const spectralCentroid = calculateSpectralCentroid(audioData);
      
      // Simple speaker classification based on voice characteristics
      if (fundamentalFreq < 150) return 'speaker_low';
      if (fundamentalFreq > 250) return 'speaker_high';
      return 'speaker_medium';
    } catch (error) {
      console.error('Speaker identification error:', error);
      return 'unknown';
    }
  }, [config.speakerRecognition]);

  const estimateFundamentalFreq = async (audioData: Float32Array): Promise<number> => {
    // Simplified fundamental frequency estimation
    const sampleRate = 48000;
    const correlationBuffer = new Float32Array(audioData.length);
    
    for (let lag = 20; lag < audioData.length / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - lag; i++) {
        correlation += audioData[i] * audioData[i + lag];
      }
      correlationBuffer[lag] = correlation;
    }
    
    let maxCorrelation = 0;
    let bestLag = 0;
    for (let i = 20; i < correlationBuffer.length; i++) {
      if (correlationBuffer[i] > maxCorrelation) {
        maxCorrelation = correlationBuffer[i];
        bestLag = i;
      }
    }
    
    return sampleRate / bestLag;
  };

  const calculateSpectralCentroid = (audioData: Float32Array): number => {
    // Simplified spectral centroid calculation
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const magnitude = Math.abs(audioData[i]);
      numerator += i * magnitude;
      denominator += magnitude;
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  };

  const startRecording = useCallback(async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    try {
      await initializeAudioAnalysis();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = config.language;

      recognitionRef.current.addEventListener('start', () => {
        console.log('Advanced speech recognition started');
        setIsRecording(true);
      });

      recognitionRef.current.addEventListener('result', async (event) => {
        setIsProcessing(true);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;

          if (result.isFinal && confidence >= config.confidenceThreshold) {
            // Detect language
            const detectedLang = await detectLanguage(transcript);
            setDetectedLanguage(detectedLang);

            // Translate if needed
            const translatedText = config.enableTranslation && config.targetLanguage
              ? await translateText(transcript, config.targetLanguage)
              : undefined;

            // Create audio data for speaker identification
            const audioData = new Float32Array(1024); // Simplified for demo
            const speakerId = await identifySpeaker(audioData);

            const speechResult: SpeechResult = {
              transcript,
              confidence,
              language: detectedLang,
              translatedText,
              speakerId,
              timestamp: new Date(),
              audioLevel
            };

            console.log('Advanced speech result:', speechResult);
            onResult(speechResult);
            setCurrentTranscript('');
          } else {
            setCurrentTranscript(transcript);
          }
        }
        
        setIsProcessing(false);
      });

      recognitionRef.current.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsProcessing(false);
      });

      recognitionRef.current.addEventListener('end', () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setIsProcessing(false);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      });

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting advanced speech recognition:', error);
    }
  }, [config, onResult, audioLevel, initializeAudioAnalysis, detectLanguage, translateText, identifySpeaker]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsRecording(false);
    setCurrentTranscript('');
    setAudioLevel(0);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    isProcessing,
    currentTranscript,
    audioLevel,
    detectedLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    startRecording,
    stopRecording,
    toggleRecording
  };
};
