
const GEMINI_API_KEY = 'AIzaSyDJ21se4_1SdYPv3Wz72B8Ke1YQ_tFuGwc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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

export const generateAIResponse = async (
  userMessage: string, 
  chatHistory: any[] = [], 
  config: BrainstormerConfig = defaultConfig,
  userName: string = 'User'
): Promise<string> => {
  console.log('generateAIResponse called with:', userMessage, 'Mode:', config.mode, 'History length:', chatHistory.length);
  
  try {
    console.log('Making API request to Gemini...');
    
    // Convert chat history to Gemini format
    const contents: ChatMessage[] = [];
    
    // Add chat history
    chatHistory.forEach(message => {
      if (message.type === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: message.text }]
        });
      } else if (message.type === 'ai') {
        contents.push({
          role: 'model',
          parts: [{ text: message.text }]
        });
      }
    });
    
    // Add current user message with appropriate prompt
    const prompt = config.mode === 'brainstormer' 
      ? getBrainstormerPrompt(userMessage, userName, config.voiceOptimized)
      : getQuickChatPrompt(userMessage);
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    console.log('Sending contents to API:', contents);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: config.mode === 'brainstormer' ? 0.8 : 0.7,
          topP: config.mode === 'brainstormer' ? 0.9 : 0.8,
          topK: config.mode === 'brainstormer' ? 50 : 40,
          maxOutputTokens: config.maxTokens,
        }
      }),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('Extracted AI response:', aiResponse);
      return aiResponse;
    } else {
      console.error('Invalid response format from Gemini API:', data);
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Could you please try again?";
  }
};
