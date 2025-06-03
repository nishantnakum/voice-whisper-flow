import { AIMode, Message, MessageAttachment } from '@/types/ai';
import { getAIModeById } from '@/config/aiModes';
import { performWebSearch, citeSources, synthesizeSearchResults } from './webSearchService';
import { secureLogger } from '@/utils/secureLogger';
import { inputValidator } from '@/utils/inputValidator';

// Remove hardcoded API key
interface EnhancedAIRequest {
  message: string;
  mode: string;
  chatHistory: Message[];
  attachments?: MessageAttachment[];
  userName: string;
  context?: Record<string, any>;
  knowledgeBase?: any[];
  userPreferences?: any;
  apiKey?: string;
}

export const generateEnhancedAIResponse = async (request: EnhancedAIRequest): Promise<string> => {
  const { message, mode, chatHistory, attachments, userName, context, knowledgeBase, userPreferences, apiKey } = request;
  
  // Check if API key is provided
  if (!apiKey) {
    secureLogger.error('No Gemini API key provided for enhanced AI');
    throw new Error('Gemini API key is required. Please provide your API key to use AI features.');
  }

  // Rate limiting check
  if (!inputValidator.checkRateLimit()) {
    secureLogger.warn('Rate limit exceeded for enhanced AI requests');
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }

  // Input validation
  const messageValidation = inputValidator.validateTextInput(message);
  if (!messageValidation.isValid) {
    secureLogger.warn('Invalid message input for enhanced AI', { errors: messageValidation.errors });
    throw new Error(`Invalid input: ${messageValidation.errors.join(', ')}`);
  }

  const apiKeyValidation = inputValidator.validateApiKey(apiKey);
  if (!apiKeyValidation.isValid) {
    secureLogger.warn('Invalid API key for enhanced AI');
    throw new Error('Invalid API key provided');
  }

  secureLogger.info('Enhanced AI request initiated', { 
    mode, 
    hasAttachments: !!attachments?.length, 
    hasKnowledge: !!knowledgeBase?.length,
    messageLength: messageValidation.sanitizedInput.length
  });
  
  const aiMode = getAIModeById(mode);
  if (!aiMode) {
    throw new Error(`Unknown AI mode: ${mode}`);
  }

  try {
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    let enhancedPrompt = await buildEnhancedPrompt(aiMode, messageValidation.sanitizedInput, userName, attachments, context, knowledgeBase, userPreferences);
    
    // For Research Assistant mode, integrate web search
    if (mode === 'research_assistant') {
      const searchResults = await performWebSearch(messageValidation.sanitizedInput);
      const synthesizedInfo = synthesizeSearchResults(searchResults);
      const citations = citeSources(searchResults);
      
      enhancedPrompt += `\n\n**Latest Research Findings:**\n${synthesizedInfo}${citations}`;
    }

    const contents = buildConversationContents(chatHistory, enhancedPrompt);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKeyValidation.sanitizedInput}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: getTemperatureForMode(mode, userPreferences),
          topP: 0.9,
          topK: 50,
          maxOutputTokens: getMaxTokensForUser(userPreferences),
        }
      }),
    });

    if (!response.ok) {
      secureLogger.error('Enhanced AI API request failed', { status: response.status });
      throw new Error(`Enhanced AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.candidates[0].content.parts[0].text;
    
    // Apply post-processing based on mode and preferences
    aiResponse = postProcessResponse(aiResponse, mode, userPreferences);
    
    secureLogger.info('Enhanced AI response generated successfully');
    return aiResponse;
  } catch (error) {
    secureLogger.error('Error in enhanced AI service', { error: error.message });
    throw error;
  }
};

const buildEnhancedPrompt = async (
  aiMode: AIMode, 
  userMessage: string, 
  userName: string, 
  attachments?: MessageAttachment[],
  context?: Record<string, any>,
  knowledgeBase?: any[],
  userPreferences?: any
): Promise<string> => {
  let prompt = `${aiMode.prompt}\n\n`;
  
  // Add user preferences for personalization
  if (userPreferences) {
    const settings = userPreferences.getPersonalizedSettings();
    prompt += `User Profile - Preferred Style: ${settings.adaptedSettings.verbosity > 0.7 ? 'Detailed' : settings.adaptedSettings.verbosity < 0.3 ? 'Concise' : 'Balanced'}, `;
    prompt += `Creativity Level: ${settings.adaptedSettings.creativity > 0.7 ? 'High' : settings.adaptedSettings.creativity < 0.3 ? 'Conservative' : 'Moderate'}, `;
    prompt += `Top Interests: ${settings.topInterests.join(', ')}\n\n`;
  }
  
  // Add relevant knowledge base context
  if (knowledgeBase && knowledgeBase.length > 0) {
    prompt += `Relevant Project Knowledge:\n`;
    knowledgeBase.slice(0, 3).forEach((item, index) => {
      prompt += `${index + 1}. ${item.title}: ${item.content.substring(0, 200)}...\n`;
    });
    prompt += '\n';
  }
  
  // Add session context if available
  if (context && Object.keys(context).length > 0) {
    prompt += `Session Context:\n${JSON.stringify(context, null, 2)}\n\n`;
  }
  
  // Add attachment analysis with enhanced detail
  if (attachments && attachments.length > 0) {
    prompt += `Attached Files Analysis:\n`;
    attachments.forEach(attachment => {
      prompt += `📎 **${attachment.name}** (${attachment.type}):\n`;
      prompt += `${attachment.metadata?.analysis || 'Processing...'}\n\n`;
    });
  }
  
  // Add the user message with enhanced context
  prompt += `**${userName}** asks: "${userMessage}"\n\n`;
  
  // Add mode-specific enhanced instructions
  prompt += getModeSpecificInstructions(aiMode.id);
  
  // Add quality and formatting guidelines
  prompt += `\n\n**Response Guidelines:**
- Provide actionable, strategic insights suitable for world leaders
- Include specific examples and case studies where relevant
- Structure response with clear headings and bullet points
- Conclude with concrete next steps and recommendations
- Maintain professional yet engaging tone throughout`;
  
  return prompt;
};

const buildConversationContents = (chatHistory: Message[], currentPrompt: string) => {
  const contents: any[] = [];
  
  // Add recent chat history with more context
  const recentHistory = chatHistory.slice(-8);
  recentHistory.forEach(message => {
    if (message.type === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: `${message.text}${message.attachments?.length ? ` [${message.attachments.length} files attached]` : ''}` }]
      });
    } else if (message.type === 'ai') {
      contents.push({
        role: 'model',
        parts: [{ text: message.text }]
      });
    }
  });
  
  // Add current enhanced prompt
  contents.push({
    role: 'user',
    parts: [{ text: currentPrompt }]
  });
  
  return contents;
};

const getTemperatureForMode = (mode: string, userPreferences?: any): number => {
  const baseTemperatures: Record<string, number> = {
    'brainstormer': 0.9,
    'research_assistant': 0.3,
    'creative_writer': 0.8,
    'technical_solver': 0.2,
    'business_strategist': 0.4
  };
  
  let temperature = baseTemperatures[mode] || 0.7;
  
  // Adjust based on user creativity preference
  if (userPreferences?.preferences?.aiSettings?.creativity) {
    const creativityAdjustment = (userPreferences.preferences.aiSettings.creativity - 0.5) * 0.3;
    temperature = Math.max(0.1, Math.min(1.0, temperature + creativityAdjustment));
  }
  
  return temperature;
};

const getMaxTokensForUser = (userPreferences?: any): number => {
  if (!userPreferences?.preferences?.aiSettings?.verbosity) {
    return 2000;
  }
  
  const verbosity = userPreferences.preferences.aiSettings.verbosity;
  if (verbosity < 0.3) return 1000;  // Concise
  if (verbosity > 0.7) return 3000;  // Detailed
  return 2000;  // Balanced
};

const postProcessResponse = (response: string, mode: string, userPreferences?: any): string => {
  // Add mode-specific formatting
  if (mode === 'research_assistant') {
    // Ensure citations are properly formatted
    response = response.replace(/\[(\d+)\]/g, '<sup>[$1]</sup>');
  }
  
  if (mode === 'business_strategist') {
    // Ensure strategic structure
    if (!response.includes('## ') && !response.includes('**')) {
      response = formatBusinessResponse(response);
    }
  }
  
  // Add user preference adjustments
  if (userPreferences?.analytics?.responsePreferences?.includeExamples) {
    if (!response.includes('example') && !response.includes('case study')) {
      response += '\n\n💡 **Example Application:** Consider how these insights apply to your specific context and industry.';
    }
  }
  
  return response;
};

const formatBusinessResponse = (response: string): string => {
  const sections = response.split('\n\n');
  if (sections.length > 2) {
    return `## Strategic Analysis\n\n${sections[0]}\n\n## Key Recommendations\n\n${sections.slice(1).join('\n\n')}\n\n## Next Steps\n\n• Review and validate these recommendations with stakeholders\n• Develop implementation timeline\n• Establish success metrics`;
  }
  return response;
};

const getModeSpecificInstructions = (mode: string): string => {
  const instructions: Record<string, string> = {
    'brainstormer': `🎯 **Brainstorming Excellence:**
- Generate 3-5 distinct creative perspectives
- Include unconventional approaches and breakthrough thinking
- Provide implementation frameworks for each idea
- Consider global impact and scalability
- End with synthesis of best concepts`,
    
    'research_assistant': `🔬 **Research Standards:**
- Provide comprehensive, fact-based analysis
- Include multiple perspectives and expert opinions  
- Cite credible sources and recent findings
- Identify knowledge gaps and areas for further research
- Present findings in executive summary format`,
    
    'creative_writer': `✍️ **Creative Excellence:**
- Craft compelling, original content with strong narrative flow
- Adapt style to purpose (persuasive, informative, inspirational)
- Use vivid examples and storytelling techniques
- Ensure cultural sensitivity and global appeal
- Conclude with memorable call-to-action`,
    
    'technical_solver': `⚙️ **Technical Mastery:**
- Provide systematic, step-by-step solutions
- Include scalable architecture considerations
- Address security, performance, and maintainability
- Offer alternative approaches with trade-off analysis
- Include implementation timeline and resource requirements`,
    
    'business_strategist': `📊 **Strategic Leadership:**
- Deliver actionable insights with clear business impact
- Include market analysis and competitive considerations
- Provide risk assessment and mitigation strategies
- Outline implementation roadmap with milestones
- Conclude with measurable success criteria`
  };
  
  return instructions[mode] || 'Provide comprehensive, professional analysis with actionable recommendations.';
};

// Screen sharing integration
export const startScreenShare = async (): Promise<MediaStream | null> => {
  try {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen sharing not supported in this browser');
    }

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 }
      },
      audio: false
    });

    secureLogger.info('Screen sharing started successfully');
    return stream;
  } catch (error) {
    secureLogger.error('Error starting screen share', { error: error.message });
    return null;
  }
};

export const stopScreenShare = (stream: MediaStream) => {
  stream.getTracks().forEach(track => {
    track.stop();
  });
  secureLogger.info('Screen sharing stopped');
};
