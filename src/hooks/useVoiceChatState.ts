
import { useState, useCallback, useEffect } from 'react';
import { Message, MessageAttachment } from '@/types/ai';
import { SpeechConfig, SpeechResult } from '@/hooks/useAdvancedSpeechRecognition';

export const useVoiceChatState = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMode, setCurrentMode] = useState('brainstormer');
  const [userName, setUserName] = useState('World Leader');
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [speechConfig, setSpeechConfig] = useState<SpeechConfig>({
    language: 'en-US',
    enableTranslation: false,
    noiseFiltering: true,
    speakerRecognition: true,
    confidenceThreshold: 0.8
  });

  const handleSpeechConfigChange = useCallback((updates: Partial<SpeechConfig>) => {
    setSpeechConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const removePendingAttachment = useCallback((id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearPendingAttachments = useCallback(() => {
    setPendingAttachments([]);
  }, []);

  return {
    isProcessing,
    setIsProcessing,
    currentMode,
    setCurrentMode,
    userName,
    setUserName,
    pendingAttachments,
    setPendingAttachments,
    speechConfig,
    setSpeechConfig,
    handleSpeechConfigChange,
    removePendingAttachment,
    clearPendingAttachments
  };
};
