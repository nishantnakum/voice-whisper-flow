
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, MessageCircle, Plus } from 'lucide-react';
import { ConversationMemory } from '@/types/ai';

interface ConversationHistoryProps {
  conversations: ConversationMemory[];
  currentConversation: ConversationMemory | null;
  onLoadConversation: (id: string) => void;
  onNewConversation: () => void;
}

export const ConversationHistory = ({ 
  conversations, 
  currentConversation, 
  onLoadConversation,
  onNewConversation 
}: ConversationHistoryProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4" />
          Conversation History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onNewConversation}
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No conversations yet</p>
            </div>
          )}
          
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                currentConversation?.id === conversation.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onLoadConversation(conversation.id)}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium truncate">{conversation.title}</p>
                <p className="text-xs text-gray-500">
                  {conversation.messages.length} messages
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(conversation.updatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
