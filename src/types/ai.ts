
export interface AIMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  capabilities: string[];
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

export interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  attachments?: MessageAttachment[];
  mode?: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'url';
  name: string;
  url: string;
  metadata?: Record<string, any>;
}
