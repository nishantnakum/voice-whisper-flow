
import { useState, useEffect } from 'react';
import { ProjectKnowledge } from '@/types/ai';

const STORAGE_KEY = 'project_knowledge';
const MAX_KNOWLEDGE_ITEMS = 100;

export const useProjectKnowledge = (projectId: string = 'default') => {
  const [knowledgeBase, setKnowledgeBase] = useState<ProjectKnowledge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadKnowledgeBase();
  }, [projectId]);

  const loadKnowledgeBase = () => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setKnowledgeBase(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  };

  const saveKnowledgeBase = (knowledge: ProjectKnowledge[]) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(knowledge));
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    }
  };

  const addKnowledge = async (
    title: string,
    content: string,
    type: 'document' | 'image' | 'note' | 'research',
    metadata: Record<string, any> = {}
  ): Promise<ProjectKnowledge> => {
    setIsLoading(true);
    
    const newKnowledge: ProjectKnowledge = {
      id: Date.now().toString(),
      projectId,
      title,
      content,
      type,
      metadata: {
        ...metadata,
        addedBy: 'user',
        tags: extractTags(content),
        wordCount: content.split(/\s+/).length
      },
      createdAt: new Date()
    };

    const updatedKnowledge = [newKnowledge, ...knowledgeBase].slice(0, MAX_KNOWLEDGE_ITEMS);
    setKnowledgeBase(updatedKnowledge);
    saveKnowledgeBase(updatedKnowledge);
    setIsLoading(false);
    
    return newKnowledge;
  };

  const searchKnowledge = (query: string): ProjectKnowledge[] => {
    const searchTerms = query.toLowerCase().split(' ');
    
    return knowledgeBase.filter(item => {
      const searchableText = `${item.title} ${item.content}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    }).sort((a, b) => {
      // Relevance scoring
      const scoreA = calculateRelevanceScore(a, searchTerms);
      const scoreB = calculateRelevanceScore(b, searchTerms);
      return scoreB - scoreA;
    });
  };

  const getKnowledgeByType = (type: 'document' | 'image' | 'note' | 'research'): ProjectKnowledge[] => {
    return knowledgeBase.filter(item => item.type === type);
  };

  const updateKnowledge = (id: string, updates: Partial<ProjectKnowledge>) => {
    const updatedKnowledge = knowledgeBase.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setKnowledgeBase(updatedKnowledge);
    saveKnowledgeBase(updatedKnowledge);
  };

  const deleteKnowledge = (id: string) => {
    const updatedKnowledge = knowledgeBase.filter(item => item.id !== id);
    setKnowledgeBase(updatedKnowledge);
    saveKnowledgeBase(updatedKnowledge);
  };

  const getContextualKnowledge = (currentTopic: string, limit: number = 5): ProjectKnowledge[] => {
    const relevant = searchKnowledge(currentTopic);
    return relevant.slice(0, limit);
  };

  const exportKnowledgeBase = (): string => {
    return JSON.stringify(knowledgeBase, null, 2);
  };

  const importKnowledgeBase = (jsonData: string): boolean => {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        const validatedKnowledge = imported.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          projectId
        }));
        setKnowledgeBase(validatedKnowledge);
        saveKnowledgeBase(validatedKnowledge);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing knowledge base:', error);
      return false;
    }
  };

  return {
    knowledgeBase,
    isLoading,
    addKnowledge,
    searchKnowledge,
    getKnowledgeByType,
    updateKnowledge,
    deleteKnowledge,
    getContextualKnowledge,
    exportKnowledgeBase,
    importKnowledgeBase
  };
};

// Helper functions
const extractTags = (content: string): string[] => {
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  const tagCounts: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      tagCounts[word] = (tagCounts[word] || 0) + 1;
    }
  });

  return Object.entries(tagCounts)
    .filter(([_, count]) => count > 1)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
};

const calculateRelevanceScore = (item: ProjectKnowledge, searchTerms: string[]): number => {
  const title = item.title.toLowerCase();
  const content = item.content.toLowerCase();
  
  let score = 0;
  searchTerms.forEach(term => {
    if (title.includes(term)) score += 3; // Title matches are more important
    if (content.includes(term)) score += 1;
  });
  
  return score;
};
