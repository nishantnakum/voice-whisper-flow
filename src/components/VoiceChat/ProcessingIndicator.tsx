
import React from 'react';

interface ProcessingIndicatorProps {
  isProcessing: boolean;
}

export const ProcessingIndicator = ({ isProcessing }: ProcessingIndicatorProps) => {
  if (!isProcessing) return null;

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">AI is thinking...</p>
    </div>
  );
};
