
import { AIMode, Message, MessageAttachment } from '@/types/ai';
import { getAIModeById } from '@/config/aiModes';

const GEMINI_API_KEY = 'AIzaSyDJ21se4_1SdYPv3Wz72B8Ke1YQ_tFuGwc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface EnhancedAIRequest {
  message: string;
  mode: string;
  chatHistory: Message[];
  attachments?: MessageAttachment[];
  userName: string;
  context?: Record<string, any>;
}

export const generateEnhancedAIResponse = async (request: EnhancedAIRequest): Promise<string> => {
  const { message, mode, chatHistory, attachments, userName, context } = request;
  
  console.log('Enhanced AI request:', { mode, hasAttachments: !!attachments?.length });
  
  const aiMode = getAIModeById(mode);
  if (!aiMode) {
    throw new Error(`Unknown AI mode: ${mode}`);
  }

  try {
    const prompt = buildEnhancedPrompt(aiMode, message, userName, attachments, context);
    const contents = buildConversationContents(chatHistory, prompt);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: getTemperatureForMode(mode),
          topP: 0.9,
          topK: 50,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Enhanced AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    console.log('Enhanced AI response generated');
    return aiResponse;
  } catch (error) {
    console.error('Error in enhanced AI service:', error);
    throw error;
  }
};

const buildEnhancedPrompt = (
  aiMode: AIMode, 
  userMessage: string, 
  userName: string, 
  attachments?: MessageAttachment[],
  context?: Record<string, any>
): string => {
  let prompt = `${aiMode.prompt}\n\n`;
  
  // Add context if available
  if (context && Object.keys(context).length > 0) {
    prompt += `Context from previous sessions:\n${JSON.stringify(context, null, 2)}\n\n`;
  }
  
  // Add attachment analysis
  if (attachments && attachments.length > 0) {
    prompt += `Attached files analysis:\n`;
    attachments.forEach(attachment => {
      prompt += `- ${attachment.name} (${attachment.type}): ${attachment.metadata?.analysis || 'No analysis available'}\n`;
    });
    prompt += '\n';
  }
  
  // Add user message
  prompt += `${userName} asks: "${userMessage}"\n\n`;
  
  // Add mode-specific instructions
  prompt += getModeSpecificInstructions(aiMode.id);
  
  return prompt;
};

const buildConversationContents = (chatHistory: Message[], currentPrompt: string) => {
  const contents: any[] = [];
  
  // Add recent chat history (last 10 messages)
  const recentHistory = chatHistory.slice(-10);
  recentHistory.forEach(message => {
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
  
  // Add current prompt
  contents.push({
    role: 'user',
    parts: [{ text: currentPrompt }]
  });
  
  return contents;
};

const getTemperatureForMode = (mode: string): number => {
  const temperatureMap: Record<string, number> = {
    'brainstormer': 0.9,
    'research_assistant': 0.3,
    'creative_writer': 0.8,
    'technical_solver': 0.2,
    'business_strategist': 0.4
  };
  
  return temperatureMap[mode] || 0.7;
};

const getModeSpecificInstructions = (mode: string): string => {
  const instructions: Record<string, string> = {
    'brainstormer': 'Focus on generating multiple creative perspectives and innovative solutions. Structure your response with clear idea categories and implementation steps.',
    'research_assistant': 'Provide well-researched, factual information with sources when possible. Structure findings logically with supporting evidence.',
    'creative_writer': 'Create engaging, original content that matches the requested style and tone. Focus on narrative flow and creative expression.',
    'technical_solver': 'Provide systematic, step-by-step technical solutions with code examples where relevant. Consider scalability and best practices.',
    'business_strategist': 'Deliver actionable business insights with market considerations, risk assessments, and implementation timelines.'
  };
  
  return instructions[mode] || 'Provide helpful, accurate, and well-structured responses.';
};

// Web search integration (placeholder for future implementation)
export const searchWeb = async (query: string): Promise<string[]> => {
  // This would integrate with a web search API in production
  console.log('Web search requested for:', query);
  return [`Search results for "${query}" would appear here in production implementation.`];
};
