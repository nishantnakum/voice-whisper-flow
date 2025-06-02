import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Shield } from 'lucide-react';
import { defaultConfig, BrainstormerConfig } from '@/utils/geminiApi';
import { generateSecureAIResponse, validateUserName, validateMessage } from '@/utils/secureApiService';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ControlPanel } from './ControlPanel';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProcessingIndicator } from './ProcessingIndicator';
import { MessageList } from './MessageList';
import { ConfigPanel } from './ConfigPanel';
import { SecurityStatus } from './SecurityStatus';
import { Message } from './types';
import { useToast } from '@/hooks/use-toast';

const VoiceChat = () => {
  console.log('VoiceChat component rendering...');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState<BrainstormerConfig>(defaultConfig);
  const [userName, setUserName] = useState('User');
  const { toast } = useToast();

  const { speakText, stopSpeaking, isPlaying } = useSpeechSynthesis();

  const handleUserMessage = useCallback(async (text: string) => {
    console.log('handleUserMessage called with:', text, 'isPlaying:', isPlaying);
    
    if (isPlaying) {
      console.log('Skipping message processing because AI is speaking');
      return;
    }

    // Validate input
    if (!validateMessage(text)) {
      toast({
        title: "Invalid Message",
        description: "Please enter a valid message (1-2000 characters, no harmful content).",
        variant: "destructive",
      });
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
      console.log('Calling secure AI response...');
      // Pass recent chat history (last 10 messages to keep context manageable)
      const recentHistory = updatedMessages.slice(-10);
      const aiResponse = await generateSecureAIResponse(text, recentHistory, config, userName);
      console.log('AI response received:', aiResponse);
      
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
      
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    }
  }, [speakText, isPlaying, messages, config, userName, toast]);

  const handleUserNameChange = (newName: string) => {
    if (validateUserName(newName)) {
      setUserName(newName);
    } else {
      toast({
        title: "Invalid Name",
        description: "Name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores.",
        variant: "destructive",
      });
    }
  };

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
            <Shield className="h-4 w-4 text-green-600 ml-2" title="Secure Mode" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SecurityStatus />

          <ConfigPanel
            config={config}
            onConfigChange={setConfig}
            userName={userName}
            onUserNameChange={handleUserNameChange}
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

          <MessageList messages={messages} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceChat;
