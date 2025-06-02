
// Add natural human expressions to make speech more realistic
export const addHumanExpressions = (text: string): string => {
  let enhancedText = text;
  
  // Add thinking sounds at the beginning for questions
  if (text.includes('?') || text.toLowerCase().includes('what') || text.toLowerCase().includes('how')) {
    enhancedText = '*hmm* ' + enhancedText;
  }
  
  // Add breathing pauses for longer sentences
  if (text.length > 50) {
    enhancedText = enhancedText.replace(/\. /g, '. *takes a breath* ');
  }
  
  // Add expressions for emotions
  if (text.includes('!') || text.toLowerCase().includes('great') || text.toLowerCase().includes('awesome')) {
    enhancedText = enhancedText.replace(/!/, ' *chuckles* !');
  }
  
  // Add hesitation for complex topics
  if (text.toLowerCase().includes('complex') || text.toLowerCase().includes('difficult')) {
    enhancedText = '*umm* ' + enhancedText;
  }
  
  // Add natural pauses with breathing sounds
  enhancedText = enhancedText.replace(/,/g, ', *pause*');
  
  // Add occasional breathing sounds for longer responses
  if (text.length > 100) {
    const sentences = enhancedText.split('. ');
    if (sentences.length > 2) {
      sentences[Math.floor(sentences.length / 2)] = '*inhales* ' + sentences[Math.floor(sentences.length / 2)];
    }
    enhancedText = sentences.join('. ');
  }
  
  return enhancedText;
};
