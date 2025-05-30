
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface ControlPanelProps {
  isRecording: boolean;
  isPlaying: boolean;
  onToggleRecording: () => void;
  onStopSpeaking: () => void;
}

export const ControlPanel = ({
  isRecording,
  isPlaying,
  onToggleRecording,
  onStopSpeaking,
}: ControlPanelProps) => {
  return (
    <div className="flex justify-center items-center gap-4 mb-6">
      <Button
        onClick={onToggleRecording}
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        className="flex items-center gap-2"
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

      <Button
        onClick={onStopSpeaking}
        variant={isPlaying ? "secondary" : "outline"}
        size="lg"
        disabled={!isPlaying}
        className="flex items-center gap-2"
      >
        {isPlaying ? (
          <>
            <VolumeX className="h-5 w-5" />
            Stop Speaking
          </>
        ) : (
          <>
            <Volume2 className="h-5 w-5" />
            AI Speaking
          </>
        )}
      </Button>
    </div>
  );
};
