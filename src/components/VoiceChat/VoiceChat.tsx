import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { generateAIResponse, defaultConfig, BrainstormerConfig } from '@/utils/geminiApi';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ControlPanel } from './ControlPanel';
import { TranscriptDisplay } from './TranscriptDisplay';
import { ProcessingIndicator } from './ProcessingIndicator';
import { MessageList } from './MessageList';
import { ConfigPanel } from './ConfigPanel';
import { Message } from './types';
import EnhancedVoiceChat from './EnhancedVoiceChat';

const VoiceChat = () => {
  // Use the enhanced version
  return <EnhancedVoiceChat />;
};

export default VoiceChat;
