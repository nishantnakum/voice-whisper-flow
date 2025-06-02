import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { generateAIResponse, extractConfidenceScore, defaultConfig, BrainstormerConfig } from '@/utils/geminiApi';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ControlPanel } from './ControlPanel';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProcessingIndicator } from './ProcessingIndicator';
import { MessageList } from './MessageList';
import { ConfigPanel } from './ConfigPanel';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Message } from './types';

const VoiceChat = () => {
  console.log('VoiceChat component rendering...');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState<BrainstormerConfig>(defaultConfig);
  const [userName, setUserName] = useState('User');
  const [lastConfidenceScore, setLastConfidenceScore] = useState<number | null>(null);

  const { speakText, stopSpeaking, isPlaying } = useSpeechSynthesis();

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
      console.log('Calling generateAIResponse with Brainstormer config...');
      // Pass recent chat history (last 10 messages to keep context manageable)
      const recentHistory = updatedMessages.slice(-10);
      const aiResponse = await generateAIResponse(text, recentHistory, config, userName);
      console.log('AI response received:', aiResponse);
      
      // Extract confidence score
      const confidenceScore = extractConfidenceScore(aiResponse);
      setLastConfidenceScore(confidenceScore);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      
      console.log('Speaking AI response with browser speech synthesis...');
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
      setLastConfidenceScore(null);
    }
  }, [speakText, isPlaying, messages, config, userName]);

  const { isRecording, currentTranscript, toggleRecording } = useSpeechRecognition(
    handleUserMessage, 
    isPlaying
  );

  console.log('VoiceChat state:', { 
    messagesCount: messages.length, 
    isProcessing, 
    isRecording, 
    isPlaying,
    currentTranscript,
    mode: config.mode
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6" />
            {config.mode === 'brainstormer' ? 'Brainstormer AI by Noesis.tech' : 'Voice Chat with AI'}
            <span className="text-sm font-normal text-blue-600 ml-2">
              ({config.mode === 'brainstormer' ? 'Enhanced Mode' : 'Quick Chat'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigPanel
            config={config}
            onConfigChange={setConfig}
            userName={userName}
            onUserNameChange={setUserName}
          />

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

          {config.mode === 'brainstormer' && (
            <ConfidenceIndicator confidence={lastConfidenceScore} />
          )}

          <MessageList messages={messages} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceChat;
