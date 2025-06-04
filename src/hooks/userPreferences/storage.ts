
import { UserPreferences } from '@/types/ai';
import { UserAnalytics, STORAGE_KEY, ANALYTICS_KEY } from './types';

export const loadPreferences = (userId: string): UserPreferences | null => {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
  return null;
};

export const savePreferences = (userId: string, preferences: UserPreferences): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

export const loadAnalytics = (userId: string): UserAnalytics | null => {
  try {
    const saved = localStorage.getItem(`${ANALYTICS_KEY}_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastActive: new Date(parsed.lastActive)
      };
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
  return null;
};

export const saveAnalytics = (userId: string, analytics: UserAnalytics): void => {
  try {
    localStorage.setItem(`${ANALYTICS_KEY}_${userId}`, JSON.stringify(analytics));
  } catch (error) {
    console.error('Error saving analytics:', error);
  }
};
