
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="h-5 w-5" />
          ElevenLabs API Key Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              To enable realistic human-like speech with breathing and natural expressions, please enter your ElevenLabs API key:
            </p>
            <Input
              type="password"
              placeholder="Enter your ElevenLabs API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!apiKey.trim()}>
            Set API Key
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Your API key is stored locally and never sent to our servers.
            <br />
            Get your free API key at elevenlabs.io
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
