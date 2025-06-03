
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Users, 
  Settings, 
  Zap,
  Globe,
  Filter,
  Waves,
  Brain
} from 'lucide-react';
import { VoicePersonality, VOICE_PERSONALITIES } from '@/hooks/useElevenLabsVoiceEngine';
import { SpeechConfig } from '@/hooks/useAdvancedSpeechRecognition';

interface AdvancedVoiceControlPanelProps {
  // Speech Recognition
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number;
  detectedLanguage: string;
  supportedLanguages: Array<{ code: string; name: string; flag: string }>;
  speechConfig: SpeechConfig;
  onSpeechConfigChange: (config: Partial<SpeechConfig>) => void;
  onToggleRecording: () => void;

  // Voice Synthesis
  isPlaying: boolean;
  currentPersonality: VoicePersonality;
  voiceQuality: 'standard' | 'premium';
  onPersonalityChange: (personalityId: string) => void;
  onVoiceQualityChange: (quality: 'standard' | 'premium') => void;
  onStopSpeaking: () => void;

  // API Configuration
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const AdvancedVoiceControlPanel = ({
  isRecording,
  isProcessing,
  audioLevel,
  detectedLanguage,
  supportedLanguages,
  speechConfig,
  onSpeechConfigChange,
  onToggleRecording,
  isPlaying,
  currentPersonality,
  voiceQuality,
  onPersonalityChange,
  onVoiceQualityChange,
  onStopSpeaking,
  apiKey,
  onApiKeyChange
}: AdvancedVoiceControlPanelProps) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);

  const AudioLevelIndicator = () => (
    <div className="flex items-center gap-2">
      <Waves className="h-4 w-4 text-blue-500" />
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-100 ${
            audioLevel > 0.7 ? 'bg-red-500' : 
            audioLevel > 0.4 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${audioLevel * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">{Math.round(audioLevel * 100)}%</span>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Advanced Voice AI Control
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* API Key Configuration */}
        {showApiKeyInput && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Label className="text-sm font-medium text-amber-800">
              ElevenLabs API Key Required
            </Label>
            <p className="text-xs text-amber-700 mb-2">
              Premium voice synthesis requires an ElevenLabs API key
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter your ElevenLabs API key"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Button
                size="sm"
                onClick={() => setShowApiKeyInput(false)}
                disabled={!apiKey}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Speech Recognition Control */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Speech Recognition
            </Label>
            
            <Button
              onClick={onToggleRecording}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="w-full flex items-center gap-2"
              disabled={isProcessing}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>

            {isRecording && <AudioLevelIndicator />}

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                Detected: {supportedLanguages.find(l => l.code === detectedLanguage)?.flag} 
                {supportedLanguages.find(l => l.code === detectedLanguage)?.name}
              </span>
            </div>
          </div>

          {/* Voice Synthesis Control */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Voice Synthesis
            </Label>
            
            <Button
              onClick={onStopSpeaking}
              variant={isPlaying ? "secondary" : "outline"}
              size="lg"
              className="w-full flex items-center gap-2"
              disabled={!isPlaying}
            >
              {isPlaying ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  AI Ready
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{currentPersonality.name}</span>
              <Badge variant="secondary" className="text-xs">
                {currentPersonality.characteristics.formality}
              </Badge>
            </div>
          </div>
        </div>

        {/* Voice Personality Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Voice Personality</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {VOICE_PERSONALITIES.map((personality) => (
              <Button
                key={personality.id}
                variant={currentPersonality.id === personality.id ? "default" : "outline"}
                size="sm"
                onClick={() => onPersonalityChange(personality.id)}
                className="justify-start text-left h-auto p-3"
              >
                <div>
                  <div className="font-medium">{personality.name}</div>
                  <div className="text-xs text-gray-500">{personality.description}</div>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {personality.characteristics.energy}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {personality.characteristics.authority}
                    </Badge>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvancedSettings && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Settings
            </Label>

            {/* Language Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Input Language</Label>
                <Select
                  value={speechConfig.language}
                  onValueChange={(value) => onSpeechConfigChange({ language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Voice Quality</Label>
                <Select
                  value={voiceQuality}
                  onValueChange={(value: 'standard' | 'premium') => onVoiceQualityChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Standard (Fast)
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Premium (High Quality)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <Label className="text-sm">Real-time Translation</Label>
                </div>
                <Switch
                  checked={speechConfig.enableTranslation}
                  onCheckedChange={(checked) => onSpeechConfigChange({ enableTranslation: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Label className="text-sm">Noise Filtering</Label>
                </div>
                <Switch
                  checked={speechConfig.noiseFiltering}
                  onCheckedChange={(checked) => onSpeechConfigChange({ noiseFiltering: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label className="text-sm">Speaker Recognition</Label>
                </div>
                <Switch
                  checked={speechConfig.speakerRecognition}
                  onCheckedChange={(checked) => onSpeechConfigChange({ speakerRecognition: checked })}
                />
              </div>
            </div>

            {/* Confidence Threshold */}
            <div className="space-y-2">
              <Label className="text-sm">Speech Confidence Threshold</Label>
              <Slider
                value={[speechConfig.confidenceThreshold]}
                onValueChange={([value]) => onSpeechConfigChange({ confidenceThreshold: value })}
                min={0.1}
                max={1.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Less Strict</span>
                <span>{Math.round(speechConfig.confidenceThreshold * 100)}%</span>
                <span>More Strict</span>
              </div>
            </div>

            {/* Translation Target Language */}
            {speechConfig.enableTranslation && (
              <div className="space-y-2">
                <Label className="text-sm">Translation Target</Label>
                <Select
                  value={speechConfig.targetLanguage || 'en-US'}
                  onValueChange={(value) => onSpeechConfigChange({ targetLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2">
          {isRecording && (
            <Badge variant="default" className="animate-pulse">
              <Mic className="h-3 w-3 mr-1" />
              Recording
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary" className="animate-pulse">
              <Brain className="h-3 w-3 mr-1" />
              Processing
            </Badge>
          )}
          {isPlaying && (
            <Badge variant="default" className="animate-pulse">
              <Volume2 className="h-3 w-3 mr-1" />
              Speaking
            </Badge>
          )}
          {speechConfig.enableTranslation && (
            <Badge variant="outline">
              <Languages className="h-3 w-3 mr-1" />
              Translation On
            </Badge>
          )}
          {speechConfig.noiseFiltering && (
            <Badge variant="outline">
              <Filter className="h-3 w-3 mr-1" />
              Noise Filter
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
