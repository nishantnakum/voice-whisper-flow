
import { UserPreferences } from '@/types/ai';

export interface UserAnalytics {
  sessionCount: number;
  totalInteractions: number;
  preferredModes: Record<string, number>;
  averageSessionLength: number;
  topicInterests: Record<string, number>;
  responsePreferences: {
    preferredLength: 'short' | 'medium' | 'long';
    preferredStyle: 'formal' | 'casual' | 'technical';
    includeExamples: boolean;
  };
  lastActive: Date;
}

export interface FeedbackContext {
  mode: string;
  responseLength: number;
  includedReferences: boolean;
  topic: string;
}

export const STORAGE_KEY = 'user_preferences';
export const ANALYTICS_KEY = 'user_analytics';

export const createDefaultPreferences = (userId: string): UserPreferences => ({
  userId,
  preferredMode: 'brainstormer',
  voiceSettings: {
    speed: 1.0,
    voice: 'default',
    enabled: true
  },
  aiSettings: {
    creativity: 0.7,
    verbosity: 0.5,
    includeReferences: true
  }
});

export const createDefaultAnalytics = (): UserAnalytics => ({
  sessionCount: 0,
  totalInteractions: 0,
  preferredModes: {},
  averageSessionLength: 0,
  topicInterests: {},
  responsePreferences: {
    preferredLength: 'medium',
    preferredStyle: 'casual',
    includeExamples: true
  },
  lastActive: new Date()
});
