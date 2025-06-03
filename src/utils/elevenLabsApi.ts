
export interface ElevenLabsConfig {
  voiceId: string;
  modelId: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export const defaultConfig: ElevenLabsConfig = {
  voiceId: '9BWtsMINqrJLrRacOk9x', // Aria voice
  modelId: 'eleven_multilingual_v2',
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.8,
    use_speaker_boost: true
  }
};

export const synthesizeSpeech = async (
  text: string, 
  apiKey: string, 
  config: ElevenLabsConfig = defaultConfig
): Promise<Blob> => {
  console.log('Making API request to ElevenLabs...');
  console.log('Using voice:', config.voiceId, 'model:', config.modelId);
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: config.modelId,
      voice_settings: config.voiceSettings,
      output_format: 'mp3_44100_128'
    }),
  });

  console.log('API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs API error:', response.status, errorText);
    
    if (response.status === 401) {
      console.error('Invalid API key. Please check your ElevenLabs API key.');
      throw new Error('Invalid ElevenLabs API key. Please verify your credentials.');
    }
    
    if (response.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  const audioBlob = await response.blob();
  console.log('Audio blob created, size:', audioBlob.size, 'bytes');
  
  return audioBlob;
};

// Voice cloning functionality
export const cloneVoice = async (
  apiKey: string,
  name: string,
  description: string,
  audioFiles: File[]
): Promise<string> => {
  console.log('Starting voice cloning process...');
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  
  audioFiles.forEach((file, index) => {
    formData.append(`files`, file);
  });

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Voice cloning error:', response.status, errorText);
    throw new Error(`Voice cloning failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Voice cloned successfully:', data.voice_id);
  
  return data.voice_id;
};

// Get available voices
export const getAvailableVoices = async (apiKey: string) => {
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  const data = await response.json();
  return data.voices;
};

// Voice analysis for personality matching
export const analyzeVoiceCharacteristics = (voiceId: string): {
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'mature';
  accent: string;
  tone: 'warm' | 'neutral' | 'authoritative';
} => {
  // Voice characteristics mapping based on ElevenLabs voice IDs
  const voiceCharacteristics: Record<string, any> = {
    '9BWtsMINqrJLrRacOk9x': { // Aria
      gender: 'female',
      age: 'young',
      accent: 'american',
      tone: 'warm'
    },
    'CwhRBWXzGAHq8TQ4Fs17': { // Roger
      gender: 'male',
      age: 'middle',
      accent: 'british',
      tone: 'authoritative'
    },
    'EXAVITQu4vr4xnSDxMaL': { // Sarah
      gender: 'female',
      age: 'middle',
      accent: 'american',
      tone: 'neutral'
    },
    'JBFqnCBsd6RMkjVDRZzb': { // George
      gender: 'male',
      age: 'mature',
      accent: 'british',
      tone: 'authoritative'
    },
    'TX3LPaxmHKxFdv7VOQHJ': { // Liam
      gender: 'male',
      age: 'young',
      accent: 'american',
      tone: 'neutral'
    },
    'XB0fDUnXU5powFXDhCwa': { // Charlotte
      gender: 'female',
      age: 'middle',
      accent: 'british',
      tone: 'warm'
    }
  };

  return voiceCharacteristics[voiceId] || {
    gender: 'neutral',
    age: 'middle',
    accent: 'neutral',
    tone: 'neutral'
  };
};
