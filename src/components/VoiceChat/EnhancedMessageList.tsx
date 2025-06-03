
import React from 'react';
import { MessageCircle, Image, FileText, Brain, User } from 'lucide-react';
import { Message } from '@/types/ai';
import { AI_MODES } from '@/config/aiModes';

interface EnhancedMessageListProps {
  messages: Message[];
}

export const EnhancedMessageList = ({ messages }: EnhancedMessageListProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModeIcon = (mode?: string) => {
    const aiMode = AI_MODES.find(m => m.id === mode);
    return aiMode?.icon || 'brain';
  };

  const getModeColor = (mode?: string) => {
    const colorMap: Record<string, string> = {
      'brainstormer': 'bg-purple-500',
      'research_assistant': 'bg-blue-500',
      'creative_writer': 'bg-green-500',
      'technical_solver': 'bg-orange-500',
      'business_strategist': 'bg-red-500'
    };
    return colorMap[mode || ''] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Start a conversation by clicking the record button or uploading files!</p>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
        >
          <div className="flex items-start space-x-2 max-w-lg">
            {message.type === 'ai' && (
              <div className={`w-8 h-8 rounded-full ${getModeColor(message.mode)} flex items-center justify-center flex-shrink-0`}>
                <Brain className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div
              className={`px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.type === 'ai' && message.mode && (
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <span className="font-medium">
                    {AI_MODES.find(m => m.id === message.mode)?.name || 'AI'}
                  </span>
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 text-xs">
                      {attachment.type === 'image' ? (
                        <Image className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      <span className="truncate">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
            
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
