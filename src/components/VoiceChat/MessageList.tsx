
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Start a conversation by clicking the record button!</p>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <p className={`text-xs mt-1 ${
              message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
