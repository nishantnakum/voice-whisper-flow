
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { generateAIResponse } from '@/utils/geminiApi';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useElevenLabsSpeech } from '@/hooks/useElevenLabsSpeech';
import { ControlPanel } from './ControlPanel';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProcessingIndicator } from './ProcessingIndicator';
import { MessageList } from './MessageList';
import { ApiKeyInput } from './ApiKeyInput';
import { Message } from './types';

const VoiceChat = () => {
  console.log('VoiceChat component rendering...');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { speakText, stopSpeaking, isPlaying, setApiKey, apiKey } = useElevenLabsSpeech();

  // Show API key input if not set
  if (!apiKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ApiKeyInput onApiKeySet={setApiKey} />
      </div>
    );
  }

  const handleUserMessage = useCallback(async (text: string) => {
    console.log('handleUserMessage called with:', text, 'isPlaying:', isPlaying);
    
    if (isPlaying) {
      console.log('Skipping message processing because AI is speaking');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    console.log('Adding user message:', userMessage);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsProcessing(true);

    try {
      console.log('Calling generateAIResponse with history...');
      // Pass recent chat history (last 10 messages to keep context manageable)
      const recentHistory = updatedMessages.slice(-10);
      const aiResponse = await generateAIResponse(text, recentHistory);
      console.log('AI response received:', aiResponse);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      
      console.log('Speaking AI response with ElevenLabs...');
      speakText(aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  }, [speakText, isPlaying, messages]);

  const { isRecording, currentTranscript, toggleRecording } = useSpeechRecognition(
    handleUserMessage, 
    isPlaying
  );

  console.log('VoiceChat state:', { 
    messagesCount: messages.length, 
    isProcessing, 
    isRecording, 
    isPlaying,
    currentTranscript 
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Voice Chat with AI
            <span className="text-sm font-normal text-green-600 ml-2">
              (ElevenLabs Enhanced)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ControlPanel
            isRecording={isRecording}
            isPlaying={isPlaying}
            onToggleRecording={toggleRecording}
            onStopSpeaking={stopSpeaking}
          />

          <TranscriptDisplay
            isRecording={isRecording}
            currentTranscript={currentTranscript}
          />

          <ProcessingIndicator isProcessing={isProcessing} />

          <MessageList messages={messages} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceChat;
