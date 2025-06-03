
import { useState, useEffect } from 'react';
import { UserPreferences } from '@/types/ai';

const STORAGE_KEY = 'user_preferences';
const ANALYTICS_KEY = 'user_analytics';

interface UserAnalytics {
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

export const useUserPreferences = (userId: string = 'default') => {
  const [preferences, setPreferences] = useState<UserPreferences>({
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
  
  const [analytics, setAnalytics] = useState<UserAnalytics>({
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

  useEffect(() => {
    loadPreferences();
    loadAnalytics();
  }, [userId]);

  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...preferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadAnalytics = () => {
    try {
      const saved = localStorage.getItem(`${ANALYTICS_KEY}_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnalytics({
          ...parsed,
          lastActive: new Date(parsed.lastActive)
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const savePreferences = (newPreferences: UserPreferences) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const saveAnalytics = (newAnalytics: UserAnalytics) => {
    try {
      localStorage.setItem(`${ANALYTICS_KEY}_${userId}`, JSON.stringify(newAnalytics));
      setAnalytics(newAnalytics);
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...updates };
    savePreferences(updatedPreferences);
  };

  const trackInteraction = (mode: string, topic: string, sessionDuration?: number) => {
    const updatedAnalytics = {
      ...analytics,
      totalInteractions: analytics.totalInteractions + 1,
      preferredModes: {
        ...analytics.preferredModes,
        [mode]: (analytics.preferredModes[mode] || 0) + 1
      },
      topicInterests: {
        ...analytics.topicInterests,
        [topic]: (analytics.topicInterests[topic] || 0) + 1
      },
      lastActive: new Date()
    };

    if (sessionDuration) {
      updatedAnalytics.averageSessionLength = 
        (analytics.averageSessionLength * analytics.sessionCount + sessionDuration) / 
        (analytics.sessionCount + 1);
      updatedAnalytics.sessionCount = analytics.sessionCount + 1;
    }

    saveAnalytics(updatedAnalytics);
  };

  const learnFromFeedback = (feedback: 'positive' | 'negative', context: {
    mode: string;
    responseLength: number;
    includedReferences: boolean;
    topic: string;
  }) => {
    const updatedPreferences = { ...preferences };
    
    if (feedback === 'positive') {
      // Reinforce successful patterns
      if (context.responseLength < 200) {
        updatedPreferences.aiSettings.verbosity = Math.max(0, updatedPreferences.aiSettings.verbosity - 0.1);
      } else if (context.responseLength > 800) {
        updatedPreferences.aiSettings.verbosity = Math.min(1, updatedPreferences.aiSettings.verbosity + 0.1);
      }
      
      updatedPreferences.aiSettings.includeReferences = context.includedReferences;
    } else {
      // Adjust based on negative feedback
      updatedPreferences.aiSettings.verbosity = 0.5; // Reset to middle ground
    }

    savePreferences(updatedPreferences);
    
    // Update analytics
    const updatedAnalytics = {
      ...analytics,
      responsePreferences: {
        ...analytics.responsePreferences,
        preferredLength: context.responseLength < 300 ? 'short' : 
                        context.responseLength > 700 ? 'long' : 'medium'
      }
    };
    
    saveAnalytics(updatedAnalytics);
  };

  const getPersonalizedSettings = () => {
    const mostUsedMode = Object.entries(analytics.preferredModes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || preferences.preferredMode;

    const topInterests = Object.entries(analytics.topicInterests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      recommendedMode: mostUsedMode,
      topInterests,
      sessionStats: {
        totalSessions: analytics.sessionCount,
        totalInteractions: analytics.totalInteractions,
        averageSessionLength: analytics.averageSessionLength
      },
      adaptedSettings: {
        creativity: preferences.aiSettings.creativity,
        verbosity: preferences.aiSettings.verbosity,
        includeReferences: preferences.aiSettings.includeReferences
      }
    };
  };

  const resetPreferences = () => {
    const defaultPreferences: UserPreferences = {
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
    };
    
    savePreferences(defaultPreferences);
  };

  const exportUserData = () => {
    return {
      preferences,
      analytics,
      exportedAt: new Date()
    };
  };

  return {
    preferences,
    analytics,
    updatePreferences,
    trackInteraction,
    learnFromFeedback,
    getPersonalizedSettings,
    resetPreferences,
    exportUserData
  };
};
