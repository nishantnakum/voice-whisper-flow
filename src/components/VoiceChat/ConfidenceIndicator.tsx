
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number | null;
}

export const ConfidenceIndicator = ({ confidence }: ConfidenceIndicatorProps) => {
  if (confidence === null) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 8) return 'High Confidence';
    if (score >= 6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-medium">AI Confidence Level</span>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={confidence * 10} className="flex-1" />
        <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
          {confidence}/10 - {getConfidenceLabel(confidence)}
        </span>
      </div>
    </div>
  );
};
