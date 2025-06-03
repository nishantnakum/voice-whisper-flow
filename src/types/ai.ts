
export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  name: string;
  size: number;
  url?: string;
  analysis?: string;
  metadata?: Record<string, any>;
}

export interface SpeechMetadata {
  confidence: number;
  language: string;
  speakerId?: string;
  audioLevel: number;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  mode: string;
  attachments?: MessageAttachment[];
  metadata?: {
    speechData?: SpeechMetadata;
    [key: string]: any;
  };
}

export interface ConversationContext {
  userId?: string;
  sessionId?: string;
  preferences?: Record<string, any>;
  speechData?: SpeechMetadata;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created: Date;
  updated: Date;
  context: ConversationContext;
}
