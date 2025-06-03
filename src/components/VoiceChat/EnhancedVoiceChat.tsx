
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Brain, Upload } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useVisionCapabilities } from '@/hooks/useVisionCapabilities';
import { useConversationMemory } from '@/hooks/useConversationMemory';
import { generateEnhancedAIResponse } from '@/services/enhancedAIService';
import { AI_MODES } from '@/config/aiModes';
import { Message, MessageAttachment } from '@/types/ai';
import { ControlPanel } from './ControlPanel';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProcessingIndicator } from './ProcessingIndicator';
import { EnhancedMessageList } from './EnhancedMessageList';
import { EnhancedConfigPanel } from './EnhancedConfigPanel';
import { FileUploadArea } from './FileUploadArea';
import { ConversationHistory } from './ConversationHistory';

const EnhancedVoiceChat = () => {
  console.log('EnhancedVoiceChat component rendering...');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMode, setCurrentMode] = useState('brainstormer');
  const [userName, setUserName] = useState('User');
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);

  const { speakText, stopSpeaking, isPlaying } = useSpeechSynthesis();
  const { analyzeImage, analyzeDocument, createAttachment, isProcessing: isAnalyzing } = useVisionCapabilities();
  
  const {
    conversations,
    currentConversation,
    createNewConversation,
    addMessageToConversation,
    loadConversation,
    setCurrentConversation
  } = useConversationMemory();

  // Initialize with a default conversation
  useEffect(() => {
    if (!currentConversation) {
      createNewConversation('New Brainstorming Session', 'default');
    }
  }, [currentConversation, createNewConversation]);

  const getCurrentMessages = (): Message[] => {
    return currentConversation?.messages || [];
  };

  const handleUserMessage = useCallback(async (text: string) => {
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
    };

    console.log('Adding user message:', userMessage);
    addMessageToConversation(currentConversation.id, userMessage);
    setPendingAttachments([]); // Clear pending attachments
    setIsProcessing(true);

    try {
      console.log('Calling enhanced AI service...');
      const aiResponse = await generateEnhancedAIResponse({
        message: text,
        mode: currentMode,
        chatHistory: getCurrentMessages(),
        attachments: userMessage.attachments,
        userName,
        context: currentConversation.context
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
      
      console.log('Speaking AI response...');
      speakText(aiResponse);
    } catch (error) {
      console.error('Error generating enhanced AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        mode: currentMode,
      };
      addMessageToConversation(currentConversation.id, errorMessage);
      setIsProcessing(false);
    }
  }, [speakText, isPlaying, currentMode, userName, currentConversation, pendingAttachments, addMessageToConversation, getCurrentMessages]);

  const { isRecording, currentTranscript, toggleRecording } = useSpeechRecognition(
    handleUserMessage, 
    isPlaying
  );

  const handleFileUpload = async (files: File[]) => {
    const newAttachments: MessageAttachment[] = [];
    
    for (const file of files) {
      try {
        let analysisResult: string;
        
        if (file.type.startsWith('image/')) {
          analysisResult = await analyzeImage(file);
        } else {
          analysisResult = await analyzeDocument(file);
        }
        
        const attachment = createAttachment(file, analysisResult);
        newAttachments.push(attachment);
      } catch (error) {
        console.error('Error processing file:', error);
        // Continue with other files
      }
    }
    
    setPendingAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleNewConversation = () => {
    const title = `${AI_MODES.find(m => m.id === currentMode)?.name} Session`;
    createNewConversation(title, 'default');
  };

  const currentAIMode = AI_MODES.find(mode => mode.id === currentMode);

  console.log('EnhancedVoiceChat state:', { 
    messagesCount: getCurrentMessages().length, 
    isProcessing, 
    isRecording, 
    isPlaying,
    currentTranscript,
    currentMode,
    conversationsCount: conversations.length,
    pendingAttachments: pendingAttachments.length
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6" />
            Enhanced AI Brainstormer by Noesis.tech
            <span className="text-sm font-normal text-blue-600 ml-2">
              ({currentAIMode?.name || 'Advanced Mode'})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <EnhancedConfigPanel
                currentMode={currentMode}
                onModeChange={setCurrentMode}
                userName={userName}
                onUserNameChange={setUserName}
                onNewConversation={handleNewConversation}
              />

              <FileUploadArea 
                onFileUpload={handleFileUpload}
                pendingAttachments={pendingAttachments}
                onRemoveAttachment={(id) => setPendingAttachments(prev => prev.filter(a => a.id !== id))}
                isProcessing={isAnalyzing}
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

              <ProcessingIndicator isProcessing={isProcessing || isAnalyzing} />

              <EnhancedMessageList messages={getCurrentMessages()} />
            </div>

            <div className="space-y-4">
              <ConversationHistory
                conversations={conversations}
                currentConversation={currentConversation}
                onLoadConversation={loadConversation}
                onNewConversation={handleNewConversation}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedVoiceChat;
