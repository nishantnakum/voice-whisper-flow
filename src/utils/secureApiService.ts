
import { supabase } from '@/lib/supabase';

// Secure API service that calls backend Edge Functions instead of direct API calls
export interface SecureApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export const generateSecureAIResponse = async (
  userMessage: string,
  chatHistory: any[] = [],
  config: any = {},
  userName: string = 'User'
): Promise<string> => {
  console.log('Calling secure AI response via Edge Function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-ai-response', {
      body: {
        userMessage: sanitizeInput(userMessage),
        chatHistory: chatHistory.map(msg => ({
          ...msg,
          text: sanitizeInput(msg.text)
        })),
        config,
        userName: sanitizeInput(userName)
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error('Failed to generate AI response');
    }

    return data.response || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    console.error('Secure API error:', error);
    return "I'm experiencing technical difficulties. Please try again.";
  }
};

export const generateSecureSpeech = async (text: string): Promise<Blob | null> => {
  console.log('Calling secure speech synthesis via Edge Function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('synthesize-speech', {
      body: {
        text: sanitizeInput(text)
      }
    });

    if (error) {
      console.error('Speech synthesis error:', error);
      return null;
    }

    // Convert base64 response back to blob
    if (data.audioData) {
      const audioBuffer = Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0));
      return new Blob([audioBuffer], { type: 'audio/mpeg' });
    }

    return null;
  } catch (error) {
    console.error('Secure speech synthesis error:', error);
    return null;
  }
};

// Input sanitization function
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 2000); // Limit input length
};

// Validate user name
export const validateUserName = (name: string): boolean => {
  const sanitized = sanitizeInput(name);
  return sanitized.length >= 1 && sanitized.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(sanitized);
};

// Validate message content
export const validateMessage = (message: string): boolean => {
  const sanitized = sanitizeInput(message);
  return sanitized.length >= 1 && sanitized.length <= 2000;
};
