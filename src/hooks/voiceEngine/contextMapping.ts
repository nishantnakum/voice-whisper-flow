
import { VoicePersonality, VOICE_PERSONALITIES } from './personalities';

export const getPersonalityForContext = (
  aiMode: string, 
  messageType: 'strategic' | 'creative' | 'analytical' | 'diplomatic'
): VoicePersonality => {
  const personalityMap: Record<string, string> = {
    'business_strategist': 'executive',
    'research_assistant': 'analyst',
    'creative_writer': 'innovator',
    'brainstormer': 'innovator',
    'technical_solver': 'analyst'
  };

  const typeMap: Record<string, string> = {
    'strategic': 'executive',
    'creative': 'innovator',
    'analytical': 'analyst',
    'diplomatic': 'diplomatic'
  };

  const personalityId = personalityMap[aiMode] || typeMap[messageType] || 'executive';
  return VOICE_PERSONALITIES.find(p => p.id === personalityId) || VOICE_PERSONALITIES[0];
};
