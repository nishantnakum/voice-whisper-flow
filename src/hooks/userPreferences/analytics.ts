
import { UserAnalytics, FeedbackContext } from './types';

export const trackInteraction = (
  analytics: UserAnalytics,
  mode: string,
  topic: string,
  sessionDuration?: number
): UserAnalytics => {
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

  return updatedAnalytics;
};

export const getPersonalizedSettings = (analytics: UserAnalytics, preferredMode: string) => {
  const mostUsedMode = Object.entries(analytics.preferredModes)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || preferredMode;

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
    }
  };
};

export const processLearningFeedback = (
  analytics: UserAnalytics,
  feedback: 'positive' | 'negative',
  context: FeedbackContext
): UserAnalytics => {
  let preferredLength: 'short' | 'medium' | 'long';
  if (context.responseLength < 300) {
    preferredLength = 'short';
  } else if (context.responseLength > 700) {
    preferredLength = 'long';
  } else {
    preferredLength = 'medium';
  }

  return {
    ...analytics,
    responsePreferences: {
      ...analytics.responsePreferences,
      preferredLength
    }
  };
};
