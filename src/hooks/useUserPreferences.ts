
import { useState, useEffect } from 'react';
import { UserPreferences } from '@/types/ai';
import { 
  UserAnalytics, 
  FeedbackContext,
  createDefaultPreferences, 
  createDefaultAnalytics 
} from './userPreferences/types';
import { 
  loadPreferences, 
  savePreferences, 
  loadAnalytics, 
  saveAnalytics 
} from './userPreferences/storage';
import { 
  trackInteraction as trackAnalyticsInteraction, 
  getPersonalizedSettings as getAnalyticsPersonalizedSettings,
  processLearningFeedback 
} from './userPreferences/analytics';

export const useUserPreferences = (userId: string = 'default') => {
  const [preferences, setPreferences] = useState<UserPreferences>(
    createDefaultPreferences(userId)
  );
  
  const [analytics, setAnalytics] = useState<UserAnalytics>(
    createDefaultAnalytics()
  );

  useEffect(() => {
    const loadedPreferences = loadPreferences(userId);
    if (loadedPreferences) {
      setPreferences({ ...preferences, ...loadedPreferences });
    }

    const loadedAnalytics = loadAnalytics(userId);
    if (loadedAnalytics) {
      setAnalytics(loadedAnalytics);
    }
  }, [userId]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...updates };
    savePreferences(userId, updatedPreferences);
    setPreferences(updatedPreferences);
  };

  const trackInteraction = (mode: string, topic: string, sessionDuration?: number) => {
    const updatedAnalytics = trackAnalyticsInteraction(analytics, mode, topic, sessionDuration);
    saveAnalytics(userId, updatedAnalytics);
    setAnalytics(updatedAnalytics);
  };

  const learnFromFeedback = (feedback: 'positive' | 'negative', context: FeedbackContext) => {
    const updatedPreferences = { ...preferences };
    
    if (feedback === 'positive') {
      if (context.responseLength < 200) {
        updatedPreferences.aiSettings.verbosity = Math.max(0, updatedPreferences.aiSettings.verbosity - 0.1);
      } else if (context.responseLength > 800) {
        updatedPreferences.aiSettings.verbosity = Math.min(1, updatedPreferences.aiSettings.verbosity + 0.1);
      }
      
      updatedPreferences.aiSettings.includeReferences = context.includedReferences;
    } else {
      updatedPreferences.aiSettings.verbosity = 0.5;
    }

    savePreferences(userId, updatedPreferences);
    setPreferences(updatedPreferences);
    
    const updatedAnalytics = processLearningFeedback(analytics, feedback, context);
    saveAnalytics(userId, updatedAnalytics);
    setAnalytics(updatedAnalytics);
  };

  const getPersonalizedSettings = () => {
    const analyticsSettings = getAnalyticsPersonalizedSettings(analytics, preferences.preferredMode);
    
    return {
      ...analyticsSettings,
      adaptedSettings: {
        creativity: preferences.aiSettings.creativity,
        verbosity: preferences.aiSettings.verbosity,
        includeReferences: preferences.aiSettings.includeReferences
      }
    };
  };

  const resetPreferences = () => {
    const defaultPreferences = createDefaultPreferences(userId);
    savePreferences(userId, defaultPreferences);
    setPreferences(defaultPreferences);
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
