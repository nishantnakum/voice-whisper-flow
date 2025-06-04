
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Shield, Download, Upload, Trash2 } from 'lucide-react';
import { ApiKeyManager } from './ApiKeyManager';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/use-toast';

export const SettingsPanel = () => {
  const { preferences, updatePreferences, exportUserData, resetPreferences } = useUserPreferences();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();

  const testElevenLabsKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const testGeminiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleExportData = () => {
    const data = exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noesis-ai-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Data Exported',
      description: 'Your data has been exported successfully'
    });
  };

  const handleResetData = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    
    resetPreferences();
    localStorage.clear();
    setShowResetConfirm(false);
    
    toast({
      title: 'Data Reset',
      description: 'All preferences and data have been reset'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Noesis AI Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api-keys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys" className="space-y-4">
              <ApiKeyManager
                service="elevenlabs"
                title="ElevenLabs"
                description="Required for advanced text-to-speech with multiple voice personalities"
                docsUrl="https://elevenlabs.io/docs/api-reference/getting-started"
                testFunction={testElevenLabsKey}
              />
              
              <ApiKeyManager
                service="gemini"
                title="Google Gemini"
                description="Required for advanced AI conversation and analysis capabilities"
                docsUrl="https://ai.google.dev/gemini-api/docs/api-key"
                testFunction={testGeminiKey}
              />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-enabled">Enable Voice Features</Label>
                    <Switch
                      id="voice-enabled"
                      checked={preferences.voiceSettings.enabled}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          voiceSettings: { ...preferences.voiceSettings, enabled: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Voice Speed: {preferences.voiceSettings.speed}x</Label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={preferences.voiceSettings.speed}
                      onChange={(e) =>
                        updatePreferences({
                          voiceSettings: { ...preferences.voiceSettings, speed: parseFloat(e.target.value) }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Creativity Level: {Math.round(preferences.aiSettings.creativity * 100)}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={preferences.aiSettings.creativity}
                      onChange={(e) =>
                        updatePreferences({
                          aiSettings: { ...preferences.aiSettings, creativity: parseFloat(e.target.value) }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Response Length: {Math.round(preferences.aiSettings.verbosity * 100)}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={preferences.aiSettings.verbosity}
                      onChange={(e) =>
                        updatePreferences({
                          aiSettings: { ...preferences.aiSettings, verbosity: parseFloat(e.target.value) }
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-refs">Include References</Label>
                    <Switch
                      id="include-refs"
                      checked={preferences.aiSettings.includeReferences}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          aiSettings: { ...preferences.aiSettings, includeReferences: checked }
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Features Active:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>API keys are stored locally and never transmitted to our servers</li>
                    <li>All inputs are sanitized to prevent injection attacks</li>
                    <li>Rate limiting protects against abuse</li>
                    <li>Sensitive data is automatically redacted from logs</li>
                    <li>Client-side encryption for stored preferences</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Storage Consent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    This application stores your preferences and conversation history locally in your browser. 
                    No data is sent to external servers except when making API calls to the services you've configured.
                  </p>
                  <Alert>
                    <AlertDescription>
                      Your API keys and personal data remain on your device and are never shared with Noesis.tech or any third parties.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={handleExportData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      This will permanently delete all your preferences, conversation history, and stored API keys.
                    </p>
                    
                    {!showResetConfirm ? (
                      <Button onClick={handleResetData} variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset All Data
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">
                          Are you sure? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={handleResetData} variant="destructive" size="sm">
                            Yes, Reset Everything
                          </Button>
                          <Button 
                            onClick={() => setShowResetConfirm(false)} 
                            variant="ghost" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
