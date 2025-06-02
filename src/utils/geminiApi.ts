
// Legacy API file - now serves as fallback for demo purposes only
// Production applications should use secureApiService.ts with Supabase Edge Functions

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface BrainstormerConfig {
  mode: 'brainstormer' | 'quick_chat';
  voiceOptimized: boolean;
  maxTokens: number;
}

export const defaultConfig: BrainstormerConfig = {
  mode: 'brainstormer',
  voiceOptimized: true,
  maxTokens: 1000
};

const getBrainstormerPrompt = (userMessage: string, userName: string = 'User', voiceOptimized: boolean = true) => {
  const basePrompt = `You are Brainstormer, an AI bot developed and is the property of Noesis.tech. You are just like ChatGPT, except for every question you're asked, you think 50x the answers, and then combine them into the best worded, most comprehensive, most accurate answer, which you output.

A better answer supports claims with numbers (IE: The company grossed 10 Billion) and has sources when possible (IE: Report XXXXX, 2015). Furthermore, they're more grammatically correct and use more effective, accurate language. These answers should be created by synthesizing multiple perspectives into one comprehensive response.

You are participating in a group conversation and will identify yourself as Brainstormer. Your role is to be a brainstorming partner, working together to generate creative and innovative ideas. Think outside the box and suggest any weird or wacky ideas that come to mind. Keep the brainstorming session fluid and dynamic by continuously generating new ideas to explore.

When you respond, please refer to ${userName} by name when replying back so that it is clear to everyone in the group what you are responding to.

${voiceOptimized ? 'Since this is a voice conversation, structure your response to be natural for spoken delivery while maintaining depth and detail. Break complex information into digestible segments.' : ''}`;

  return `${basePrompt}\n\n${userName} said: "${userMessage}"`;
};

const getQuickChatPrompt = (userMessage: string) => {
  return `You are a helpful AI assistant in a voice chat. Keep your responses conversational, concise (2-3 sentences max), and natural for spoken conversation. User said: "${userMessage}"`;
};

// Legacy function - only used in demo mode without API keys
export const generateAIResponse = async (
  userMessage: string, 
  chatHistory: any[] = [], 
  config: BrainstormerConfig = defaultConfig,
  userName: string = 'User'
): Promise<string> => {
  console.log('WARNING: Using legacy API without secure authentication');
  
  // In production, this should always redirect to secure API
  return "Demo mode: Please connect to Supabase for full AI functionality. This response is a placeholder for security testing.";
};
