
import { useState, useCallback } from 'react';
import { Message } from '@/types/ai';
import { generateEnhancedAIResponse } from '@/services/enhancedAIService';
import { AI_MODES } from '@/config/aiModes';

interface CollaborationSession {
  id: string;
  participants: string[]; // AI mode IDs
  topic: string;
  messages: Message[];
  currentSpeaker: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

interface AIDebateRound {
  participant: string;
  response: string;
  timestamp: Date;
  perspective: string;
}

export const useMultiAICollaboration = () => {
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [debateRounds, setDebateRounds] = useState<AIDebateRound[]>([]);

  const startCollaboration = useCallback(async (
    topic: string, 
    participants: string[],
    apiKey: string
  ) => {
    const session: CollaborationSession = {
      id: Date.now().toString(),
      participants,
      topic,
      messages: [],
      currentSpeaker: participants[0],
      status: 'active',
      createdAt: new Date()
    };

    setActiveSession(session);
    setIsCollaborating(true);
    setDebateRounds([]);

    // Start the collaboration with an introduction
    await facilitateCollaboration(session, apiKey);
  }, []);

  const facilitateCollaboration = useCallback(async (
    session: CollaborationSession,
    apiKey: string
  ) => {
    const rounds: AIDebateRound[] = [];

    for (const participantId of session.participants) {
      const aiMode = AI_MODES.find(mode => mode.id === participantId);
      if (!aiMode) continue;

      const perspective = getAIPerspective(participantId);
      const collaborationPrompt = buildCollaborationPrompt(
        session.topic,
        participantId,
        rounds,
        perspective
      );

      try {
        const response = await generateEnhancedAIResponse({
          message: collaborationPrompt,
          mode: participantId,
          chatHistory: session.messages,
          userName: 'Collaboration Facilitator',
          context: { isCollaboration: true, topic: session.topic },
          apiKey
        });

        const round: AIDebateRound = {
          participant: participantId,
          response,
          timestamp: new Date(),
          perspective
        };

        rounds.push(round);
        setDebateRounds(prev => [...prev, round]);

        // Add to session messages
        const message: Message = {
          id: `${Date.now()}-${participantId}`,
          type: 'ai',
          text: `**${aiMode.name} (${perspective}):** ${response}`,
          timestamp: new Date(),
          mode: participantId
        };

        session.messages.push(message);
      } catch (error) {
        console.error(`Error in collaboration for ${participantId}:`, error);
      }
    }

    // Generate synthesis
    await generateCollaborationSynthesis(session, rounds, apiKey);
  }, []);

  const generateCollaborationSynthesis = useCallback(async (
    session: CollaborationSession,
    rounds: AIDebateRound[],
    apiKey: string
  ) => {
    const synthesisPrompt = `
As an AI Collaboration Synthesizer, analyze the following multi-perspective discussion on "${session.topic}":

${rounds.map(round => `
**${round.perspective} Perspective (${round.participant}):**
${round.response}
`).join('\n')}

Provide a comprehensive synthesis that:
1. Identifies key areas of consensus
2. Highlights valuable contrasting viewpoints
3. Suggests actionable next steps
4. Recommends the best combined approach

Focus on creating actionable insights from this multi-AI collaboration.
    `;

    try {
      const synthesis = await generateEnhancedAIResponse({
        message: synthesisPrompt,
        mode: 'business_strategist',
        chatHistory: session.messages,
        userName: 'Synthesis Generator',
        context: { isSynthesis: true },
        apiKey
      });

      const synthesisMessage: Message = {
        id: `${Date.now()}-synthesis`,
        type: 'ai',
        text: `🔄 **AI Collaboration Synthesis:**\n\n${synthesis}`,
        timestamp: new Date(),
        mode: 'synthesis'
      };

      session.messages.push(synthesisMessage);
      session.status = 'completed';
      setActiveSession(session);
      setIsCollaborating(false);

    } catch (error) {
      console.error('Error generating synthesis:', error);
    }
  }, []);

  const getAIPerspective = (modeId: string): string => {
    const perspectives: Record<string, string> = {
      'brainstormer': 'Creative Innovation',
      'research_assistant': 'Data-Driven Analysis',
      'creative_writer': 'Narrative & Communication',
      'technical_solver': 'Technical Implementation',
      'business_strategist': 'Strategic Business'
    };
    return perspectives[modeId] || 'General Analysis';
  };

  const buildCollaborationPrompt = (
    topic: string,
    currentMode: string,
    previousRounds: AIDebateRound[],
    perspective: string
  ): string => {
    let prompt = `You are participating in a multi-AI collaboration session on: "${topic}"

Your role is to provide insights from the ${perspective} perspective.

`;

    if (previousRounds.length > 0) {
      prompt += `Previous contributions from other AI perspectives:\n`;
      previousRounds.forEach(round => {
        prompt += `\n**${round.perspective}:** ${round.response.substring(0, 200)}...\n`;
      });
      prompt += `\nNow provide your unique ${perspective} perspective. Build upon or respectfully challenge the previous viewpoints while maintaining your specialized focus.\n`;
    } else {
      prompt += `You are the first to contribute. Provide your initial ${perspective} analysis of this topic.\n`;
    }

    prompt += `
Guidelines:
- Stay true to your specialized perspective
- Provide specific, actionable insights
- Be concise but comprehensive (200-300 words)
- If you disagree with previous points, explain why respectfully
- Suggest concrete next steps from your viewpoint
    `;

    return prompt;
  };

  const stopCollaboration = useCallback(() => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, status: 'paused' } : null);
    }
    setIsCollaborating(false);
  }, [activeSession]);

  return {
    activeSession,
    isCollaborating,
    debateRounds,
    startCollaboration,
    stopCollaboration,
    facilitateCollaboration
  };
};
