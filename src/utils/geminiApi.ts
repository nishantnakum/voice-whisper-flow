
const GEMINI_API_KEY = 'AIzaSyDJ21se4_1SdYPv3Wz72B8Ke1YQ_tFuGwc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateAIResponse = async (userMessage: string): Promise<string> => {
  console.log('generateAIResponse called with:', userMessage);
  
  try {
    console.log('Making API request to Gemini...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful AI assistant in a voice chat. Keep your responses conversational, concise (2-3 sentences max), and natural for spoken conversation. User said: "${userMessage}"`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 200,
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
