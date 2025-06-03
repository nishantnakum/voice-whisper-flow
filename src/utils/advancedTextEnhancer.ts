
export interface EmotionalTone {
  primary: 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';
  intensity: number; // 0-1
  secondary?: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface VoiceCharacteristics {
  formality: 'formal' | 'professional' | 'casual';
  energy: 'low' | 'medium' | 'high';
  warmth: 'cold' | 'neutral' | 'warm';
  authority: 'authoritative' | 'collaborative' | 'supportive';
}

export const analyzeEmotionalTone = (text: string): EmotionalTone => {
  const words = text.toLowerCase().split(/\s+/);
  
  const emotionKeywords = {
    joy: ['happy', 'excited', 'wonderful', 'amazing', 'fantastic', 'great', 'excellent', 'brilliant', 'success', 'achievement'],
    trust: ['reliable', 'confident', 'sure', 'certain', 'believe', 'trust', 'proven', 'established', 'solid', 'dependable'],
    fear: ['worried', 'concerned', 'anxious', 'uncertain', 'risk', 'danger', 'threat', 'problem', 'issue', 'challenge'],
    surprise: ['unexpected', 'surprising', 'remarkable', 'incredible', 'unbelievable', 'shocking', 'astonishing'],
    sadness: ['disappointed', 'unfortunate', 'regret', 'sorry', 'sad', 'decline', 'loss', 'failure', 'setback'],
    disgust: ['terrible', 'awful', 'horrible', 'disgusting', 'unacceptable', 'wrong', 'bad', 'poor'],
    anger: ['frustrated', 'angry', 'outrageous', 'unacceptable', 'ridiculous', 'absurd', 'infuriating'],
    anticipation: ['future', 'upcoming', 'plan', 'expect', 'hope', 'vision', 'goal', 'opportunity', 'potential']
  };

  const sentimentKeywords = {
    positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'success', 'achievement', 'opportunity', 'beneficial', 'effective'],
    negative: ['bad', 'poor', 'terrible', 'failure', 'problem', 'issue', 'concern', 'risk', 'decline', 'loss'],
    neutral: ['analysis', 'data', 'information', 'report', 'study', 'research', 'findings', 'results', 'statistics']
  };

  let emotionScores: Record<string, number> = {};
  let sentimentScores = { positive: 0, negative: 0, neutral: 0 };

  // Analyze emotional keywords
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    emotionScores[emotion] = keywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).length;
  });

  // Analyze sentiment
  Object.entries(sentimentKeywords).forEach(([sentiment, keywords]) => {
    sentimentScores[sentiment as keyof typeof sentimentScores] = keywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).length;
  });

  // Determine primary emotion
  const primaryEmotion = Object.entries(emotionScores).reduce((a, b) => 
    emotionScores[a[0]] > emotionScores[b[0]] ? a : b
  )[0] as EmotionalTone['primary'];

  // Determine sentiment
  const sentiment = Object.entries(sentimentScores).reduce((a, b) => 
    sentimentScores[a[0] as keyof typeof sentimentScores] > sentimentScores[b[0] as keyof typeof sentimentScores] ? a : b
  )[0] as EmotionalTone['sentiment'];

  // Calculate intensity and confidence
  const totalEmotionalWords = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
  const intensity = Math.min(1, totalEmotionalWords / Math.max(1, words.length * 0.1));
  const confidence = totalEmotionalWords > 0 ? Math.min(1, totalEmotionalWords / words.length) : 0.5;

  return {
    primary: primaryEmotion,
    intensity,
    sentiment,
    confidence
  };
};

export const adaptVoiceForTone = (
  text: string, 
  emotionalTone: EmotionalTone, 
  voiceCharacteristics: VoiceCharacteristics
): string => {
  let adaptedText = text;

  // Add appropriate pauses for authority
  if (voiceCharacteristics.authority === 'authoritative') {
    adaptedText = adaptedText.replace(/\. /g, '. ... ');
    adaptedText = adaptedText.replace(/: /g, ': ... ');
  }

  // Adjust for emotional intensity
  if (emotionalTone.intensity > 0.7) {
    if (emotionalTone.primary === 'joy' || emotionalTone.primary === 'anticipation') {
      adaptedText = adaptedText.replace(/!/g, '!!');
    }
    if (emotionalTone.primary === 'anger' || emotionalTone.primary === 'disgust') {
      adaptedText = adaptedText.replace(/\./g, '.');
    }
  }

  // Add warmth indicators
  if (voiceCharacteristics.warmth === 'warm') {
    adaptedText = adaptedText.replace(/^/, 'You know, ');
    adaptedText = adaptedText.replace(/\b(we|us|our)\b/g, 'we together');
  }

  // Adjust for formality
  if (voiceCharacteristics.formality === 'formal') {
    adaptedText = adaptedText.replace(/\b(can't|won't|don't|isn't|aren't)\b/g, match => 
      match.replace("'", ' not')
    );
  }

  // Add energy markers
  if (voiceCharacteristics.energy === 'high') {
    adaptedText = adaptedText.replace(/\b(very|really|quite)\b/g, 'absolutely');
    adaptedText = adaptedText.replace(/\b(good|great)\b/g, 'fantastic');
  }

  return adaptedText;
};

export const addHumanExpressionsAdvanced = (
  text: string, 
  voiceCharacteristics: VoiceCharacteristics,
  emotionalTone?: EmotionalTone
): string => {
  let enhancedText = text;

  // Add thoughtful pauses
  const thoughtfulPhrases = [
    'Let me think about this...',
    'That\'s an interesting point...',
    'I see what you\'re getting at...',
    'From my analysis...',
    'Based on the data...'
  ];

  // Add transition phrases based on authority level
  const authorityPhrases = {
    authoritative: ['Clearly,', 'Obviously,', 'Without question,', 'Definitively,'],
    collaborative: ['Perhaps we could consider,', 'What if we looked at,', 'Another perspective might be,'],
    supportive: ['I understand that,', 'You\'re absolutely right that,', 'That makes perfect sense,']
  };

  // Add appropriate transitions
  if (Math.random() < 0.3) {
    const phrases = authorityPhrases[voiceCharacteristics.authority];
    if (phrases.length > 0) {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      enhancedText = `${randomPhrase} ${enhancedText}`;
    }
  }

  // Add emotional markers based on tone
  if (emotionalTone) {
    switch (emotionalTone.primary) {
      case 'joy':
        enhancedText = enhancedText.replace(/\b(success|achievement)\b/g, match => `wonderful ${match}`);
        break;
      case 'trust':
        enhancedText = enhancedText.replace(/\b(plan|strategy)\b/g, match => `well-proven ${match}`);
        break;
      case 'anticipation':
        enhancedText = enhancedText.replace(/\b(future|opportunity)\b/g, match => `exciting ${match}`);
        break;
    }
  }

  // Add natural hesitations for complex topics
  const complexityMarkers = ['analysis', 'strategy', 'implementation', 'framework', 'methodology'];
  if (complexityMarkers.some(marker => text.toLowerCase().includes(marker))) {
    enhancedText = enhancedText.replace(/\b(analysis|strategy)\b/g, '... $1');
  }

  return enhancedText;
};

export const generateVoiceStylesheet = (
  personality: string,
  emotionalContext: EmotionalTone
): string => {
  const stylesheets = {
    executive: `
      <prosody rate="medium" pitch="low" volume="loud">
        <emphasis level="strong">
    `,
    diplomatic: `
      <prosody rate="slow" pitch="medium" volume="medium">
        <emphasis level="moderate">
    `,
    analyst: `
      <prosody rate="medium-slow" pitch="medium-low" volume="medium">
        <emphasis level="reduced">
    `,
    innovator: `
      <prosody rate="fast" pitch="medium-high" volume="medium-loud">
        <emphasis level="strong">
    `
  };

  const emotionalAdjustments = {
    joy: 'pitch="+10%" rate="+5%"',
    trust: 'pitch="-5%" rate="-5%"',
    fear: 'pitch="+15%" rate="+10%"',
    anger: 'pitch="+20%" volume="+10%"',
    anticipation: 'pitch="+5%" rate="+10%"'
  };

  const baseStyle = stylesheets[personality as keyof typeof stylesheets] || stylesheets.executive;
  const emotionalStyle = emotionalAdjustments[emotionalContext.primary] || '';

  return `${baseStyle} ${emotionalStyle}`;
};
