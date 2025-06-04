
import { useState, useCallback, useMemo } from 'react';
import { ProjectKnowledge } from '@/types/ai';
import { useProjectKnowledge } from './useProjectKnowledge';

interface KnowledgeVector {
  id: string;
  embedding: number[];
  content: string;
  metadata: Record<string, any>;
}

interface SmartRecommendation {
  knowledge: ProjectKnowledge;
  relevanceScore: number;
  reason: string;
  category: string;
}

interface KnowledgeInsight {
  pattern: string;
  description: string;
  relatedItems: ProjectKnowledge[];
  actionSuggestion: string;
}

export const useSmartKnowledgeManagement = (projectId?: string) => {
  const { knowledgeBase, addKnowledge, getContextualKnowledge } = useProjectKnowledge(projectId);
  const [knowledgeVectors, setKnowledgeVectors] = useState<KnowledgeVector[]>([]);
  const [isProcessingEmbeddings, setIsProcessingEmbeddings] = useState(false);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);

  // Simulate text embedding generation (in production, use OpenAI embeddings API)
  const generateEmbedding = useCallback(async (text: string): Promise<number[]> => {
    // Simulate embedding generation with a deterministic approach
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Simulate 384-dimensional embedding
    
    words.forEach((word, index) => {
      const hash = simpleHash(word);
      embedding[hash % 384] += 1;
      embedding[(hash * 2) % 384] += 0.5;
      embedding[(hash * 3) % 384] += 0.3;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }, []);

  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const cosineSimilarity = useCallback((a: number[], b: number[]): number => {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }, []);

  const processKnowledgeEmbeddings = useCallback(async () => {
    if (knowledgeBase.length === 0) return;
    
    setIsProcessingEmbeddings(true);
    const vectors: KnowledgeVector[] = [];
    
    for (const item of knowledgeBase) {
      try {
        const content = `${item.title} ${item.content}`;
        const embedding = await generateEmbedding(content);
        
        vectors.push({
          id: item.id,
          embedding,
          content,
          metadata: {
            ...item.metadata,
            type: item.type,
            createdAt: item.createdAt
          }
        });
      } catch (error) {
        console.error('Error processing embedding for:', item.id, error);
      }
    }
    
    setKnowledgeVectors(vectors);
    setIsProcessingEmbeddings(false);
  }, [knowledgeBase, generateEmbedding]);

  const semanticSearch = useCallback(async (
    query: string, 
    limit: number = 5,
    minSimilarity: number = 0.1
  ): Promise<SmartRecommendation[]> => {
    if (knowledgeVectors.length === 0) {
      await processKnowledgeEmbeddings();
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);
    const similarities: Array<{ id: string; score: number; vector: KnowledgeVector }> = [];

    knowledgeVectors.forEach(vector => {
      const similarity = cosineSimilarity(queryEmbedding, vector.embedding);
      if (similarity >= minSimilarity) {
        similarities.push({ id: vector.id, score: similarity, vector });
      }
    });

    similarities.sort((a, b) => b.score - a.score);

    const recommendations: SmartRecommendation[] = [];
    
    for (const sim of similarities.slice(0, limit)) {
      const knowledge = knowledgeBase.find(k => k.id === sim.id);
      if (knowledge) {
        recommendations.push({
          knowledge,
          relevanceScore: sim.score,
          reason: generateRecommendationReason(sim.score, knowledge.type),
          category: categorizeKnowledge(knowledge)
        });
      }
    }

    return recommendations;
  }, [knowledgeVectors, knowledgeBase, generateEmbedding, cosineSimilarity, processKnowledgeEmbeddings]);

  const generateRecommendationReason = (score: number, type: string): string => {
    if (score > 0.8) return `Highly relevant ${type} with strong semantic similarity`;
    if (score > 0.6) return `Related ${type} with good contextual match`;
    if (score > 0.4) return `Potentially useful ${type} with moderate relevance`;
    return `Background ${type} that might provide additional context`;
  };

  const categorizeKnowledge = (knowledge: ProjectKnowledge): string => {
    const categories: Record<string, string> = {
      'document': 'Documentation',
      'image': 'Visual Content',
      'note': 'Personal Notes',
      'research': 'Research Data'
    };
    return categories[knowledge.type] || 'General';
  };

  const autoTagKnowledge = useCallback(async (content: string): Promise<string[]> => {
    // Extract meaningful keywords and concepts
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const commonWords = new Set([
      'that', 'this', 'with', 'have', 'will', 'been', 'from', 'they', 'know',
      'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come',
      'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take',
      'than', 'them', 'well', 'were'
    ]);

    return Object.entries(wordFreq)
      .filter(([word, freq]) => freq > 1 && !commonWords.has(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  }, []);

  const generateKnowledgeInsights = useCallback((): KnowledgeInsight[] => {
    const insights: KnowledgeInsight[] = [];
    
    // Pattern: Recent activity clusters
    const recentItems = knowledgeBase.filter(
      item => Date.now() - item.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
    );
    
    if (recentItems.length > 5) {
      insights.push({
        pattern: 'High Recent Activity',
        description: `${recentItems.length} items added in the last week`,
        relatedItems: recentItems.slice(0, 3),
        actionSuggestion: 'Consider organizing recent items into categories or creating a summary'
      });
    }

    // Pattern: Content type distribution
    const typeDistribution = knowledgeBase.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantType = Object.entries(typeDistribution)
      .sort(([, a], [, b]) => b - a)[0];

    if (dominantType && dominantType[1] > knowledgeBase.length * 0.6) {
      insights.push({
        pattern: 'Content Type Specialization',
        description: `${Math.round(dominantType[1] / knowledgeBase.length * 100)}% of content is ${dominantType[0]} type`,
        relatedItems: knowledgeBase.filter(item => item.type === dominantType[0]).slice(0, 3),
        actionSuggestion: 'Consider diversifying content types for broader knowledge coverage'
      });
    }

    return insights;
  }, [knowledgeBase]);

  const smartAddKnowledge = useCallback(async (
    title: string,
    content: string,
    type: 'document' | 'image' | 'note' | 'research',
    metadata: Record<string, any> = {}
  ) => {
    // Auto-generate tags
    const autoTags = await autoTagKnowledge(content);
    
    // Enhanced metadata
    const enhancedMetadata = {
      ...metadata,
      autoTags,
      wordCount: content.split(/\s+/).length,
      readingTime: Math.ceil(content.split(/\s+/).length / 200), // minutes
      complexity: content.split(/[.!?]+/).length > 10 ? 'high' : 'medium',
      addedAt: new Date().toISOString()
    };

    const newKnowledge = await addKnowledge(title, content, type, enhancedMetadata);
    
    // Update embeddings
    setTimeout(() => processKnowledgeEmbeddings(), 100);
    
    return newKnowledge;
  }, [addKnowledge, autoTagKnowledge, processKnowledgeEmbeddings]);

  const knowledgeStats = useMemo(() => {
    const totalItems = knowledgeBase.length;
    const totalWords = knowledgeBase.reduce(
      (sum, item) => sum + (item.metadata?.wordCount || 0), 0
    );
    const typeDistribution = knowledgeBase.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems,
      totalWords,
      typeDistribution,
      averageWordsPerItem: totalItems > 0 ? Math.round(totalWords / totalItems) : 0
    };
  }, [knowledgeBase]);

  return {
    knowledgeBase,
    knowledgeVectors,
    isProcessingEmbeddings,
    smartRecommendations,
    knowledgeStats,
    semanticSearch,
    smartAddKnowledge,
    autoTagKnowledge,
    generateKnowledgeInsights,
    processKnowledgeEmbeddings
  };
};
