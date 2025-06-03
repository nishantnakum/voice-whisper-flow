
import { analyzeEmotionalTone, adaptVoiceForTone, addHumanExpressionsAdvanced, VoiceCharacteristics } from './advancedTextEnhancer';

export const addHumanExpressions = (
  text: string, 
  characteristics?: VoiceCharacteristics
): string => {
  if (characteristics) {
    return addHumanExpressionsAdvanced(text, characteristics);
  }

  // Fallback to basic implementation
  let enhancedText = text;

  // Add natural pauses and hesitations
  const thoughtfulPhrases = [
    'Well, ',
    'You know, ',
    'I think ',
    'It seems to me that ',
    'From my perspective, ',
    'Let me consider this... '
  ];

  // Add occasional thoughtful beginning (20% chance)
  if (Math.random() < 0.2) {
    const randomPhrase = thoughtfulPhrases[Math.floor(Math.random() * thoughtfulPhrases.length)];
    enhancedText = randomPhrase + enhancedText.toLowerCase();
  }

  // Add emphasis to important points
  enhancedText = enhancedText.replace(/\b(very important|crucial|essential|critical)\b/gi, match => 
    `*${match}*`
  );

  // Add natural transitions
  enhancedText = enhancedText.replace(/\. ([A-Z])/g, (match, p1) => 
    `. ... ${p1}`
  );

  return enhancedText;
};

// Re-export advanced functions
export { 
  analyzeEmotionalTone, 
  adaptVoiceForTone,
  addHumanExpressionsAdvanced,
  generateVoiceStylesheet 
} from './advancedTextEnhancer';
