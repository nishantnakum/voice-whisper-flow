
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Settings } from 'lucide-react';
import { useAdvancedSpeechRecognition } from '@/hooks/useAdvancedSpeechRecognition';
import { useElevenLabsVoiceEngine } from '@/hooks/useElevenLabsVoiceEngine';
import { useVisionCapabilities } from '@/hooks/useVisionCapabilities';
import { useConversationMemory } from '@/hooks/useConversationMemory';
import { useProjectKnowledge } from '@/hooks/useProjectKnowledge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useVoiceChatState } from '@/hooks/useVoiceChatState';
import { useVoiceChatHandlers } from '@/hooks/useVoiceChatHandlers';
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
import { AIIntelligencePanel } from './AIIntelligencePanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EnhancedVoiceChat = () => {
  console.log('EnhancedVoiceChat component rendering...');
  
  const {
    isProcessing,
    setIsProcessing,
    currentMode,
    setCurrentMode,
    userName,
    setUserName,
    pendingAttachments,
    setPendingAttachments,
    speechConfig,
    handleSpeechConfigChange,
    removePendingAttachment,
    clearPendingAttachments
  } = useVoiceChatState();

  // Voice Engine Hook
  const {
    isPlaying,
    isProcessing: voiceProcessing,
    currentPersonality,
    voiceQuality,
    speakWithPersonality,
    switchPersonality,
    getPersonalityForContext,
    setVoiceQuality,
    stopSpeaking,
    setApiKey: setVoiceApiKey,
    apiKey: voiceApiKey
  } = useElevenLabsVoiceEngine();

  // Other hooks
  const { analyzeImage, analyzeDocument, createAttachment, isProcessing: isAnalyzing } = useVisionCapabilities();
  const { getContextualKnowledge, addKnowledge } = useProjectKnowledge();
  const userPreferences = useUserPreferences();
  
  const {
    conversations,
    currentConversation,
    createNewConversation,
    addMessageToConversation,
    loadConversation
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

  // Voice Chat Handlers
  const { handleUserMessage, handleSpeechResult } = useVoiceChatHandlers({
    currentMode,
    userName,
    isPlaying,
    currentConversation,
    pendingAttachments,
    speechConfigConfidenceThreshold: speechConfig.confidenceThreshold,
    addMessageToConversation,
    clearPendingAttachments,
    setIsProcessing,
    getCurrentMessages,
    getContextualKnowledge,
    addKnowledge,
    userPreferences,
    speakWithPersonality,
    getPersonalityForContext
  });

  // Speech Recognition Hook
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
    await handleUserMessage(`Screen Analysis: ${analysis}`);
    
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

  const handleSettingsClick = () => {
    window.history.pushState({}, '', '/settings');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleApiKeyRequired = () => {
    handleSettingsClick();
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
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSettingsClick}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Professional-grade AI assistance with advanced voice capabilities and automation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">Main Interface</TabsTrigger>
              <TabsTrigger value="intelligence">AI Intelligence & Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-6">
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
                      onRemoveAttachment={removePendingAttachment}
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
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <AIIntelligencePanel 
                apiKey={voiceApiKey}
                onApiKeyRequired={handleApiKeyRequired}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedVoiceChat;
