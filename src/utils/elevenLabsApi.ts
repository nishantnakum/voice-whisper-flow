
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
      voice_settings: config.voiceSettings
    }),
  });

  console.log('API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs API error:', response.status, errorText);
    
    if (response.status === 401) {
      console.error('Invalid API key. Please check your ElevenLabs API key.');
    }
    
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const audioBlob = await response.blob();
  console.log('Audio blob created, size:', audioBlob.size, 'bytes');
  
  return audioBlob;
};
