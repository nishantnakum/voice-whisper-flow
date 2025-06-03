
import { useState } from 'react';
import { MessageAttachment } from '@/types/ai';

export const useVisionCapabilities = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeImage = async (file: File): Promise<string> => {
    setIsProcessing(true);
    
    try {
      // Convert image to base64
      const base64 = await fileToBase64(file);
      
      // Use Gemini Vision API for image analysis
      const response = await analyzeImageWithGemini(base64);
      
      return response;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeDocument = async (file: File): Promise<string> => {
    setIsProcessing(true);
    
    try {
      if (file.type === 'application/pdf') {
        return await analyzePDF(file);
      } else if (file.type.startsWith('text/')) {
        return await analyzeTextFile(file);
      } else if (file.type.includes('document')) {
        return await analyzeDocument(file);
      } else {
        throw new Error('Unsupported document type');
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document');
    } finally {
      setIsProcessing(false);
    }
  };

  const createAttachment = (file: File, analysisResult: string): MessageAttachment => {
    return {
      id: Date.now().toString(),
      type: file.type.startsWith('image/') ? 'image' : 'document',
      name: file.name,
      url: URL.createObjectURL(file),
      metadata: {
        size: file.size,
        analysis: analysisResult,
        uploadedAt: new Date().toISOString()
      }
    };
  };

  return {
    analyzeImage,
    analyzeDocument,
    createAttachment,
    isProcessing
  };
};

// Helper functions
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
  });
};

const analyzeImageWithGemini = async (base64Image: string): Promise<string> => {
  const GEMINI_API_KEY = 'AIzaSyDJ21se4_1SdYPv3Wz72B8Ke1YQ_tFuGwc';
  const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            text: "Analyze this image in detail. Describe what you see, identify key elements, and provide insights that would be useful for brainstorming or problem-solving. Focus on actionable observations."
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const analyzePDF = async (file: File): Promise<string> => {
  // For now, return a placeholder. In production, you'd use a PDF parsing library
  return `PDF document "${file.name}" uploaded. Size: ${(file.size / 1024).toFixed(1)}KB. Content analysis would require PDF parsing implementation.`;
};

const analyzeTextFile = async (file: File): Promise<string> => {
  const text = await file.text();
  return `Text document "${file.name}" contains ${text.length} characters. Preview: ${text.substring(0, 200)}...`;
};
