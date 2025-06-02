
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { BrainstormerConfig } from '@/utils/geminiApi';

interface ConfigPanelProps {
  config: BrainstormerConfig;
  onConfigChange: (config: BrainstormerConfig) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export const ConfigPanel = ({ config, onConfigChange, userName, onUserNameChange }: ConfigPanelProps) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4" />
          Brainstormer Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Your Name</Label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ai-mode">AI Mode</Label>
            <Select
              value={config.mode}
              onValueChange={(value: 'brainstormer' | 'quick_chat') => 
                onConfigChange({ ...config, mode: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brainstormer">Brainstormer Mode (Detailed)</SelectItem>
                <SelectItem value="quick_chat">Quick Chat (Concise)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="voice-optimized"
            checked={config.voiceOptimized}
            onCheckedChange={(checked) => 
              onConfigChange({ ...config, voiceOptimized: checked })
            }
          />
          <Label htmlFor="voice-optimized">Voice Optimized Responses</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-tokens">Response Length</Label>
          <Select
            value={config.maxTokens.toString()}
            onValueChange={(value) => 
              onConfigChange({ ...config, maxTokens: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="200">Short (200 tokens)</SelectItem>
              <SelectItem value="500">Medium (500 tokens)</SelectItem>
              <SelectItem value="1000">Long (1000 tokens)</SelectItem>
              <SelectItem value="1500">Very Long (1500 tokens)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
