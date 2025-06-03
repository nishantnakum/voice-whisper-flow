
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Brain, Search, Book, Lightbulb, ScreenShare } from 'lucide-react';
import { AI_MODES } from '@/config/aiModes';

interface EnhancedConfigPanelProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  onNewConversation: () => void;
}

export const EnhancedConfigPanel = ({ 
  currentMode, 
  onModeChange, 
  userName, 
  onUserNameChange,
  onNewConversation 
}: EnhancedConfigPanelProps) => {
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'brain': Brain,
      'search': Search,
      'book': Book,
      'lightbulb': Lightbulb,
      'screen-share': ScreenShare
    };
    
    const IconComponent = icons[iconName] || Brain;
    return <IconComponent className="h-4 w-4" />;
  };

  const currentAIMode = AI_MODES.find(mode => mode.id === currentMode);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4" />
          Enhanced AI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              value={currentMode}
              onValueChange={onModeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI mode" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODES.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    <div className="flex items-center gap-2">
                      {getIconComponent(mode.icon)}
                      <span>{mode.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Actions</Label>
            <Button 
              onClick={onNewConversation}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>

        {currentAIMode && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {getIconComponent(currentAIMode.icon)}
              <span className="font-medium text-sm">{currentAIMode.name}</span>
            </div>
            <p className="text-xs text-gray-600">{currentAIMode.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {currentAIMode.capabilities.map((capability) => (
                <span 
                  key={capability}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
