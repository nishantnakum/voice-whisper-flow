
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorStop, Camera, Upload } from 'lucide-react';
import { startScreenShare, stopScreenShare } from '@/services/enhancedAIService';
import { useVisionCapabilities } from '@/hooks/useVisionCapabilities';

interface ScreenSharePanelProps {
  onScreenAnalysis: (analysis: string) => void;
}

export const ScreenSharePanel = ({ onScreenAnalysis }: ScreenSharePanelProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { analyzeScreenShare } = useVisionCapabilities();

  const handleStartScreenShare = async () => {
    try {
      const stream = await startScreenShare();
      if (stream) {
        setCurrentStream(stream);
        setIsSharing(true);
        
        // Listen for screen share end
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          handleStopScreenShare();
        });
      }
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  };

  const handleStopScreenShare = () => {
    if (currentStream) {
      stopScreenShare(currentStream);
      setCurrentStream(null);
    }
    setIsSharing(false);
  };

  const handleCaptureAndAnalyze = async () => {
    if (!currentStream) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeScreenShare(currentStream);
      onScreenAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze screen:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Monitor className="h-4 w-4" />
          Screen Sharing & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {!isSharing ? (
            <Button 
              onClick={handleStartScreenShare}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Monitor className="h-4 w-4" />
              Start Screen Share
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Screen sharing active</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCaptureAndAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 flex items-center gap-2"
                  variant="default"
                >
                  <Camera className="h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Capture & Analyze'}
                </Button>
                
                <Button 
                  onClick={handleStopScreenShare}
                  variant="destructive"
                  size="sm"
                >
                  <MonitorStop className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>• Share your screen for real-time visual brainstorming</p>
          <p>• AI analyzes presentations, documents, and workflows</p>
          <p>• Get strategic insights on visual content</p>
          <p>• Perfect for collaborative decision-making sessions</p>
        </div>
      </CardContent>
    </Card>
  );
};
