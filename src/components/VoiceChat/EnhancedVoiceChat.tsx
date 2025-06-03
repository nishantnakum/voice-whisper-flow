import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Brain, Upload } from 'lucide-react';
import { useAdvancedSpeechRecognition, SpeechConfig, SpeechResult } from '@/hooks/useAdvancedSpeechRecognition';
import { useElevenLabsVoiceEngine } from '@/hooks/useElevenLabsVoiceEngine';
import { useVisionCapabilities } from '@/hooks/useVisionCapabilities';
import { useConversationMemory } from '@/hooks/useConversationMemory';
import { useProjectKnowledge } from '@/hooks/useProjectKnowledge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { generateEnhancedAIResponse } from '@/services/enhancedAIService';
import { analyzeEmotionalTone } from '@/utils/advancedTextEnhancer';
import { AI_MODES } from '@/config/aiModes';
import { Message, MessageAttachment } from '@/types/ai';
import { AdvancedVoiceControlPanel } from './AdvancedVoiceControlPanel';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProcessingIndicator } from './ProcessingIndicator';
import { EnhancedMessageList } from './EnhancedMessageList';
import { EnhancedConfigPanel } from './EnhancedConfigPanel';
import { FileUploadArea } from './FileUploadArea';
import { ConversationHistory } from './ConversationHistory';
import { ScreenSharePanel } from './ScreenSharePanel';

const EnhancedVoiceChat = () => {
  console.log('EnhancedVoiceChat component rendering...');
  
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

  // Advanced Voice Hooks
  const {
    isPlaying,
    isProcessing: voiceProcessing,
    currentPersonality,
    availablePersonalities,
    voiceQuality,
    speakWithPersonality,
    switchPersonality,
    getPersonalityForContext,
    setVoiceQuality,
    stopSpeaking,
    setApiKey: setVoiceApiKey,
    apiKey: voiceApiKey
  } = useElevenLabsVoiceEngine();

  const { analyzeImage, analyzeDocument, createAttachment, isProcessing: isAnalyzing } = useVisionCapabilities();
  const { getContextualKnowledge, addKnowledge } = useProjectKnowledge();
  const userPreferences = useUserPreferences();
  
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
      createNewConversation('Strategic AI Session', 'default');
    }
  }, [currentConversation, createNewConversation]);

  // Track user interactions for learning
  useEffect(() => {
    if (currentConversation?.messages.length) {
      const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
      if (lastMessage.type === 'user') {
        userPreferences.trackInteraction(currentMode, lastMessage.text);
      }
    }
  }, [currentConversation?.messages, currentMode, userPreferences]);

  const getCurrentMessages = (): Message[] => {
    return currentConversation?.messages || [];
  };

  const handleSpeechResult = useCallback(async (result: SpeechResult) => {
    console.log('Advanced speech result received:', result);
    
    if (result.confidence >= speechConfig.confidenceThreshold) {
      const textToProcess = result.translatedText || result.transcript;
      await handleUserMessage(textToProcess, result);
    }
  }, [speechConfig.confidenceThreshold]);

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
    setPendingAttachments([]);
    setIsProcessing(true);

    // Add to knowledge base if significant
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
      
      // Get relevant knowledge for context
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
      
      // Add AI response to knowledge base
      await addKnowledge(
        `AI Response - ${AI_MODES.find(m => m.id === currentMode)?.name}`,
        aiResponse,
        'research',
        { mode: currentMode, timestamp: new Date(), userQuery: text }
      );
      
      // Analyze emotional tone and select appropriate voice personality
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
  }, [isPlaying, currentMode, userName, currentConversation, pendingAttachments, addMessageToConversation, getCurrentMessages, getContextualKnowledge, addKnowledge, userPreferences, speakWithPersonality, getPersonalityForContext]);

  const {
    isRecording,
    isProcessing: speechProcessing,
    currentTranscript,
    audioLevel,
    detectedLanguage,
    supportedLanguages,
    toggleRecording
  } = useAdvancedSpeechRecognition(handleSpeechResult, speechConfig);

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
        
        // Add to knowledge base
        await addKnowledge(
          file.name,
          analysisResult,
          file.type.startsWith('image/') ? 'image' : 'document',
          { originalFile: file.name, uploadDate: new Date() }
        );
        
        const attachment = createAttachment(file, analysisResult);
        newAttachments.push(attachment);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
    
    setPendingAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleScreenAnalysis = async (analysis: string) => {
    // Add screen analysis as a user message
    await handleUserMessage(`Screen Analysis: ${analysis}`);
    
    // Add to knowledge base
    await addKnowledge(
      `Screen Capture - ${new Date().toLocaleTimeString()}`,
      analysis,
      'image',
      { source: 'screen-share', timestamp: new Date() }
    );
  };

  const handleNewConversation = () => {
    const title = `${AI_MODES.find(m => m.id === currentMode)?.name} Session`;
    createNewConversation(title, 'default');
  };

  const handleSpeechConfigChange = (updates: Partial<SpeechConfig>) => {
    setSpeechConfig(prev => ({ ...prev, ...updates }));
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
    pendingAttachments: pendingAttachments.length,
    voicePersonality: currentPersonality.name,
    speechConfig
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Advanced AI Command Center by Noesis.tech
            <span className="text-sm font-normal text-blue-600 ml-2">
              ({currentAIMode?.name || 'Strategic Mode'})
            </span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Professional-grade AI assistance with advanced voice capabilities for world leaders
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <EnhancedConfigPanel
                currentMode={currentMode}
                onModeChange={setCurrentMode}
                userName={userName}
                onUserNameChange={setUserName}
                onNewConversation={handleNewConversation}
              />

              <AdvancedVoiceControlPanel
                isRecording={isRecording}
                isProcessing={speechProcessing || voiceProcessing}
                audioLevel={audioLevel}
                detectedLanguage={detectedLanguage}
                supportedLanguages={supportedLanguages}
                speechConfig={speechConfig}
                onSpeechConfigChange={handleSpeechConfigChange}
                onToggleRecording={toggleRecording}
                isPlaying={isPlaying}
                currentPersonality={currentPersonality}
                voiceQuality={voiceQuality}
                onPersonalityChange={switchPersonality}
                onVoiceQualityChange={setVoiceQuality}
                onStopSpeaking={stopSpeaking}
                apiKey={voiceApiKey}
                onApiKeyChange={setVoiceApiKey}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadArea 
                  onFileUpload={handleFileUpload}
                  pendingAttachments={pendingAttachments}
                  onRemoveAttachment={(id) => setPendingAttachments(prev => prev.filter(a => a.id !== id))}
                  isProcessing={isAnalyzing}
                />
                
                <ScreenSharePanel onScreenAnalysis={handleScreenAnalysis} />
              </div>

              <TranscriptDisplay
                isRecording={isRecording}
                currentTranscript={currentTranscript}
              />

              <ProcessingIndicator isProcessing={isProcessing || isAnalyzing || speechProcessing || voiceProcessing} />

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
