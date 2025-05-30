
import React from 'react';

interface TranscriptDisplayProps {
  isRecording: boolean;
  currentTranscript: string;
}

export const TranscriptDisplay = ({ isRecording, currentTranscript }: TranscriptDisplayProps) => {
  if (!isRecording && !currentTranscript) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-600 mb-1">
        {isRecording ? "Listening..." : "Last transcript:"}
      </p>
      <p className="text-blue-800">{currentTranscript || "Speak now..."}</p>
    </div>
  );
};
