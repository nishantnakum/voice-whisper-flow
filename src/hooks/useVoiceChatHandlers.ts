
import { useCallback } from 'react';
import { Message, MessageAttachment } from '@/types/ai';
import { SpeechResult } from '@/hooks/useAdvancedSpeechRecognition';
import { generateEnhancedAIResponse } from '@/services/enhancedAIService';
import { analyzeEmotionalTone } from '@/utils/advancedTextEnhancer';
import { AI_MODES } from '@/config/aiModes';

interface UseVoiceChatHandlersProps {
  currentMode: string;
  userName: string;
  isPlaying: boolean;
  currentConversation: any;
  pendingAttachments: MessageAttachment[];
  speechConfigConfidenceThreshold: number;
  addMessageToConversation: (conversationId: string, message: Message) => void;
  clearPendingAttachments: () => void;
  setIsProcessing: (processing: boolean) => void;
  getCurrentMessages: () => Message[];
  getContextualKnowledge: (text: string, limit: number) => any[];
  addKnowledge: (title: string, content: string, type: string, metadata: any) => Promise<void>;
  userPreferences: any;
  speakWithPersonality: (text: string, personality?: any, context?: any) => Promise<void>;
  getPersonalityForContext: (mode: string, type: string) => any;
}

export const useVoiceChatHandlers = ({
  currentMode,
  userName,
  isPlaying,
  currentConversation,
  pendingAttachments,
  speechConfigConfidenceThreshold,
  addMessageToConversation,
  clearPendingAttachments,
  setIsProcessing,
  getCurrentMessages,
  getContextualKnowledge,
  addKnowledge,
  userPreferences,
  speakWithPersonality,
  getPersonalityForContext
}: UseVoiceChatHandlersProps) => {

  const handleUserMessage = useCallback(async (text: string, speechResult?: SpeechResult) => {
    console.log('handleUserMessage called with:', text, 'mode:', currentMode);
    
    if (isPlaying) {
      console.log('Skipping message processing because AI is speaking');
      return;
    }

    if (!currentConversation) {
      console.error('No current conversation');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
      mode: currentMode,
      metadata: speechResult ? {
        speechData: {
          confidence: speechResult.confidence,
          language: speechResult.language,
          speakerId: speechResult.speakerId,
          audioLevel: speechResult.audioLevel
        }
      } : undefined
    };

    console.log('Adding user message:', userMessage);
    addMessageToConversation(currentConversation.id, userMessage);
    clearPendingAttachments();
    setIsProcessing(true);

    if (text.length > 50) {
      await addKnowledge(
        `User Input - ${new Date().toLocaleDateString()}`,
        text,
        'note',
        { 
          mode: currentMode, 
          timestamp: new Date(),
          speechMetadata: speechResult 
        }
      );
    }

    try {
      console.log('Calling enhanced AI service...');
      
      const relevantKnowledge = getContextualKnowledge(text, 3);
      
      const aiResponse = await generateEnhancedAIResponse({
        message: text,
        mode: currentMode,
        chatHistory: getCurrentMessages(),
        attachments: userMessage.attachments,
        userName,
        context: {
          ...currentConversation.context,
          speechData: speechResult
        },
        knowledgeBase: relevantKnowledge,
        userPreferences
      });
      
      console.log('Enhanced AI response received:', aiResponse);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: aiResponse,
        timestamp: new Date(),
        mode: currentMode,
      };

      addMessageToConversation(currentConversation.id, aiMessage);
      setIsProcessing(false);
      
      await addKnowledge(
        `AI Response - ${AI_MODES.find(m => m.id === currentMode)?.name}`,
        aiResponse,
        'research',
        { mode: currentMode, timestamp: new Date(), userQuery: text }
      );
      
      const emotionalTone = analyzeEmotionalTone(aiResponse);
      const messageType = currentMode === 'business_strategist' ? 'strategic' :
                         currentMode === 'creative_writer' ? 'creative' :
                         currentMode === 'research_assistant' ? 'analytical' : 'diplomatic';
      
      const appropriatePersonality = getPersonalityForContext(currentMode, messageType);
      
      console.log('Speaking with personality:', appropriatePersonality.name, 'for tone:', emotionalTone);
      
      await speakWithPersonality(aiResponse, appropriatePersonality, {
        sentiment: emotionalTone.sentiment,
        urgency: emotionalTone.intensity > 0.7 ? 'high' : emotionalTone.intensity > 0.4 ? 'medium' : 'low',
        formality: appropriatePersonality.characteristics.formality
      });
      
    } catch (error) {
      console.error('Error generating enhanced AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: "I apologize, but I encountered an error processing your request. Please ensure your connection is stable and try again.",
        timestamp: new Date(),
        mode: currentMode,
      };
      addMessageToConversation(currentConversation.id, errorMessage);
      setIsProcessing(false);
    }
  }, [
    isPlaying, currentMode, userName, currentConversation, pendingAttachments,
    addMessageToConversation, clearPendingAttachments, setIsProcessing,
    getCurrentMessages, getContextualKnowledge, addKnowledge, userPreferences,
    speakWithPersonality, getPersonalityForContext
  ]);

  const handleSpeechResult = useCallback(async (result: SpeechResult) => {
    console.log('Advanced speech result received:', result);
    
    if (result.confidence >= speechConfigConfidenceThreshold) {
      const textToProcess = result.translatedText || result.transcript;
      await handleUserMessage(textToProcess, result);
    }
  }, [speechConfigConfidenceThreshold, handleUserMessage]);

  return {
    handleUserMessage,
    handleSpeechResult
  };
};
