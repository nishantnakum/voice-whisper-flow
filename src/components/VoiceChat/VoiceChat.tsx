
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { generateAIResponse } from '@/utils/geminiApi';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ControlPanel } from './ControlPanel';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProcessingIndicator } from './ProcessingIndicator';
import { MessageList } from './MessageList';
import { Message } from './types';

const VoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { speakText, stopSpeaking, isPlaying } = useSpeechSynthesis();

  const handleUserMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const aiResponse = await generateAIResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      
      // Speak the AI response
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
  }, [speakText]);

  const { isRecording, currentTranscript, toggleRecording } = useSpeechRecognition(handleUserMessage);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Voice Chat with AI
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
