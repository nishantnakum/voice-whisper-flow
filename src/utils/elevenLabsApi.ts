
// Re-export all functionality from the modular structure
export { type ElevenLabsConfig, type VoiceCharacteristics, defaultConfig } from './elevenLabs/types';
export { synthesizeSpeech } from './elevenLabs/synthesis';
export { cloneVoice, getAvailableVoices } from './elevenLabs/voiceCloning';
export { analyzeVoiceCharacteristics } from './elevenLabs/voiceAnalysis';
