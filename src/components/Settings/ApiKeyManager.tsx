
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, TestTube, Key, CheckCircle, XCircle } from 'lucide-react';
import { useSecureApiKeyStorage } from '@/hooks/useSecureApiKeyStorage';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyManagerProps {
  service: 'elevenlabs' | 'gemini';
  title: string;
  description: string;
  docsUrl: string;
  testFunction?: (apiKey: string) => Promise<boolean>;
}

export const ApiKeyManager = ({ 
  service, 
  title, 
  description, 
  docsUrl, 
  testFunction 
}: ApiKeyManagerProps) => {
  const { apiKey, setApiKey, clearApiKey, hasApiKey } = useSecureApiKeyStorage();
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const handleSaveKey = () => {
    if (!newKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid API key',
        variant: 'destructive'
      });
      return;
    }

    setApiKey(newKey.trim());
    setNewKey('');
    setIsEditing(false);
    setTestResult(null);
    
    toast({
      title: 'Success',
      description: `${title} API key saved securely`,
    });
  };

  const handleTestKey = async () => {
    if (!testFunction || !hasApiKey) return;
    
    setIsTesting(true);
    try {
      const isValid = await testFunction(apiKey);
      setTestResult(isValid ? 'success' : 'error');
      
      toast({
        title: isValid ? 'Success' : 'Error',
        description: isValid 
          ? `${title} API key is working correctly` 
          : `${title} API key test failed`,
        variant: isValid ? 'default' : 'destructive'
      });
    } catch (error) {
      setTestResult('error');
      toast({
        title: 'Test Failed',
        description: 'Unable to test API key. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearKey = () => {
    clearApiKey();
    setTestResult(null);
    toast({
      title: 'Cleared',
      description: `${title} API key removed`,
    });
  };

  const maskedKey = hasApiKey ? `${apiKey.substring(0, 6)}${'*'.repeat(Math.max(0, apiKey.length - 10))}${apiKey.substring(apiKey.length - 4)}` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {title}
          {hasApiKey && (
            <Badge variant={testResult === 'success' ? 'default' : testResult === 'error' ? 'destructive' : 'secondary'}>
              {testResult === 'success' ? 'Verified' : testResult === 'error' ? 'Invalid' : 'Configured'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        
        {hasApiKey && !isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={showKey ? apiKey : maskedKey}
                readOnly
                className="font-mono"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Update Key
              </Button>
              
              {testFunction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestKey}
                  disabled={isTesting}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  {isTesting ? 'Testing...' : 'Test'}
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearKey}
              >
                Clear
              </Button>
            </div>
            
            {testResult && (
              <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
                <AlertDescription className="flex items-center gap-2">
                  {testResult === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  API key {testResult === 'success' ? 'is valid and working' : 'test failed'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`${service}-key`}>API Key</Label>
              <Input
                id={`${service}-key`}
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={`Enter your ${title} API key...`}
                className="font-mono"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveKey} disabled={!newKey.trim()}>
                Save Key
              </Button>
              
              {hasApiKey && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setNewKey('');
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
            
            <Alert>
              <AlertDescription>
                Need an API key? Visit the{' '}
                <a 
                  href={docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  {title} documentation
                </a>{' '}
                to get started.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
