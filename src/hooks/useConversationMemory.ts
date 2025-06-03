
import { useState, useEffect } from 'react';
import { ConversationMemory, Message } from '@/types/ai';

const STORAGE_KEY = 'conversation_memory';
const MAX_CONVERSATIONS = 50;

export const useConversationMemory = () => {
  const [conversations, setConversations] = useState<ConversationMemory[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationMemory | null>(null);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      } catch (error) {
        console.error('Error loading conversation memory:', error);
      }
    }
  }, []);

  // Save conversations to localStorage
  const saveConversations = (convs: ConversationMemory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch (error) {
      console.error('Error saving conversation memory:', error);
    }
  };

  const createNewConversation = (title: string, userId: string = 'default', projectId?: string): ConversationMemory => {
    const newConversation: ConversationMemory = {
      id: Date.now().toString(),
      userId,
      projectId,
      title,
      messages: [],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedConversations = [newConversation, ...conversations].slice(0, MAX_CONVERSATIONS);
    setConversations(updatedConversations);
    setCurrentConversation(newConversation);
    saveConversations(updatedConversations);

    return newConversation;
  };

  const updateConversation = (conversationId: string, updates: Partial<ConversationMemory>) => {
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, ...updates, updatedAt: new Date() }
        : conv
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const addMessageToConversation = (conversationId: string, message: Message) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      const updatedMessages = [...conversation.messages, message];
      updateConversation(conversationId, { messages: updatedMessages });
    }
  };

  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  return {
    conversations,
    currentConversation,
    createNewConversation,
    updateConversation,
    addMessageToConversation,
    deleteConversation,
    loadConversation,
    setCurrentConversation
  };
};
