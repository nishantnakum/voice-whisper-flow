
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

export interface ConversationMemory {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  messages: Message[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectKnowledge {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: 'document' | 'image' | 'note' | 'research';
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface UserPreferences {
  userId: string;
  preferredMode: string;
  voiceSettings: {
    speed: number;
    voice: string;
    enabled: boolean;
  };
  aiSettings: {
    creativity: number;
    verbosity: number;
    includeReferences: boolean;
  };
}

export interface AIMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  capabilities: string[];
}
