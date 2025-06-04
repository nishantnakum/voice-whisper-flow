
import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/types/ai';
import { generateEnhancedAIResponse } from '@/services/enhancedAIService';

interface WorkflowStep {
  id: string;
  type: 'ai_analysis' | 'knowledge_search' | 'collaboration' | 'synthesis' | 'action_item';
  title: string;
  description: string;
  aiMode?: string;
  parameters: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  executedAt?: Date;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'creative' | 'strategic' | 'technical';
  steps: WorkflowStep[];
  isCustom: boolean;
}

interface ActiveWorkflow {
  id: string;
  templateId: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentStep: number;
  steps: WorkflowStep[];
  startedAt: Date;
  completedAt?: Date;
  results: Record<string, any>;
  context: Record<string, any>;
}

interface ScheduledTask {
  id: string;
  workflowId: string;
  schedule: string; // cron-like format
  nextRun: Date;
  enabled: boolean;
  parameters: Record<string, any>;
}

export const useWorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState<ActiveWorkflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize default workflow templates
  useEffect(() => {
    const defaultTemplates: WorkflowTemplate[] = [
      {
        id: 'research-deep-dive',
        name: 'Deep Research Analysis',
        description: 'Comprehensive research workflow with multiple AI perspectives',
        category: 'research',
        isCustom: false,
        steps: [
          {
            id: 'initial-research',
            type: 'ai_analysis',
            title: 'Initial Research',
            description: 'Gather initial research and insights',
            aiMode: 'research_assistant',
            parameters: { includeWebSearch: true },
            dependencies: [],
            status: 'pending'
          },
          {
            id: 'creative-angles',
            type: 'ai_analysis',
            title: 'Creative Perspectives',
            description: 'Explore creative and unconventional angles',
            aiMode: 'creative_writer',
            parameters: { focus: 'alternative_perspectives' },
            dependencies: ['initial-research'],
            status: 'pending'
          },
          {
            id: 'strategic-synthesis',
            type: 'synthesis',
            title: 'Strategic Synthesis',
            description: 'Synthesize findings into actionable insights',
            aiMode: 'business_strategist',
            parameters: { includeActionItems: true },
            dependencies: ['initial-research', 'creative-angles'],
            status: 'pending'
          }
        ]
      },
      {
        id: 'creative-project-pipeline',
        name: 'Creative Project Pipeline',
        description: 'End-to-end creative project development workflow',
        category: 'creative',
        isCustom: false,
        steps: [
          {
            id: 'ideation',
            type: 'ai_analysis',
            title: 'Creative Ideation',
            description: 'Generate multiple creative concepts',
            aiMode: 'brainstormer',
            parameters: { ideaCount: 5 },
            dependencies: [],
            status: 'pending'
          },
          {
            id: 'concept-development',
            type: 'ai_analysis',
            title: 'Concept Development',
            description: 'Develop the best concepts further',
            aiMode: 'creative_writer',
            parameters: { detailLevel: 'high' },
            dependencies: ['ideation'],
            status: 'pending'
          },
          {
            id: 'implementation-plan',
            type: 'ai_analysis',
            title: 'Implementation Planning',
            description: 'Create technical implementation plan',
            aiMode: 'technical_solver',
            parameters: { includeTimeline: true },
            dependencies: ['concept-development'],
            status: 'pending'
          }
        ]
      }
    ];
    setTemplates(defaultTemplates);
  }, []);

  const createWorkflowFromTemplate = useCallback((
    templateId: string, 
    name: string, 
    context: Record<string, any> = {}
  ): ActiveWorkflow => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const workflow: ActiveWorkflow = {
      id: Date.now().toString(),
      templateId,
      name,
      status: 'running',
      currentStep: 0,
      steps: template.steps.map(step => ({ ...step, status: 'pending' })),
      startedAt: new Date(),
      results: {},
      context
    };

    setWorkflows(prev => [...prev, workflow]);
    return workflow;
  }, [templates]);

  const executeWorkflowStep = useCallback(async (
    workflowId: string, 
    stepId: string,
    apiKey: string
  ): Promise<any> => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) throw new Error('Step not found');

    // Update step status
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? {
            ...w,
            steps: w.steps.map(s => 
              s.id === stepId ? { ...s, status: 'running' } : s
            )
          }
        : w
    ));

    try {
      let result: any;

      switch (step.type) {
        case 'ai_analysis':
          result = await executeAIAnalysisStep(step, workflow, apiKey);
          break;
        case 'knowledge_search':
          result = await executeKnowledgeSearchStep(step, workflow);
          break;
        case 'synthesis':
          result = await executeSynthesisStep(step, workflow, apiKey);
          break;
        case 'collaboration':
          result = await executeCollaborationStep(step, workflow, apiKey);
          break;
        case 'action_item':
          result = await executeActionItemStep(step, workflow);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Update step with results
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? {
              ...w,
              steps: w.steps.map(s => 
                s.id === stepId 
                  ? { ...s, status: 'completed', result, executedAt: new Date() }
                  : s
              ),
              results: { ...w.results, [stepId]: result }
            }
          : w
      ));

      return result;
    } catch (error) {
      console.error('Error executing workflow step:', error);
      
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? {
              ...w,
              steps: w.steps.map(s => 
                s.id === stepId ? { ...s, status: 'failed' } : s
              )
            }
          : w
      ));
      
      throw error;
    }
  }, [workflows]);

  const executeAIAnalysisStep = async (
    step: WorkflowStep, 
    workflow: ActiveWorkflow,
    apiKey: string
  ): Promise<string> => {
    const prompt = buildStepPrompt(step, workflow);
    
    const response = await generateEnhancedAIResponse({
      message: prompt,
      mode: step.aiMode || 'brainstormer',
      chatHistory: [],
      userName: 'Workflow Automation',
      context: { 
        isWorkflow: true, 
        workflowName: workflow.name,
        stepTitle: step.title,
        ...workflow.context 
      },
      apiKey
    });

    return response;
  };

  const executeKnowledgeSearchStep = async (
    step: WorkflowStep, 
    workflow: ActiveWorkflow
  ): Promise<any[]> => {
    // This would integrate with the smart knowledge management
    const searchQuery = step.parameters.query || workflow.context.topic || '';
    // Return mock results for now
    return [
      { title: 'Relevant Knowledge Item 1', content: 'Mock content...', relevance: 0.9 },
      { title: 'Relevant Knowledge Item 2', content: 'Mock content...', relevance: 0.8 }
    ];
  };

  const executeSynthesisStep = async (
    step: WorkflowStep, 
    workflow: ActiveWorkflow,
    apiKey: string
  ): Promise<string> => {
    const previousResults = step.dependencies
      .map(depId => workflow.results[depId])
      .filter(Boolean);

    const synthesisPrompt = `
Synthesize the following workflow results for "${workflow.name}":

${previousResults.map((result, index) => `
**Step ${index + 1} Results:**
${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
`).join('\n')}

Provide a comprehensive synthesis that:
1. Combines key insights from all previous steps
2. Identifies patterns and connections
3. Generates actionable recommendations
4. Suggests next steps

Context: ${JSON.stringify(workflow.context, null, 2)}
    `;

    const response = await generateEnhancedAIResponse({
      message: synthesisPrompt,
      mode: step.aiMode || 'business_strategist',
      chatHistory: [],
      userName: 'Workflow Synthesis',
      context: { isSynthesis: true, workflowName: workflow.name },
      apiKey
    });

    return response;
  };

  const executeCollaborationStep = async (
    step: WorkflowStep, 
    workflow: ActiveWorkflow,
    apiKey: string
  ): Promise<any> => {
    // This would integrate with the multi-AI collaboration system
    return { message: 'Collaboration step would be executed here', status: 'completed' };
  };

  const executeActionItemStep = async (
    step: WorkflowStep, 
    workflow: ActiveWorkflow
  ): Promise<any> => {
    // Generate action items based on workflow results
    const actionItems = extractActionItems(workflow);
    return { actionItems, generatedAt: new Date() };
  };

  const buildStepPrompt = (step: WorkflowStep, workflow: ActiveWorkflow): string => {
    let prompt = `You are executing step "${step.title}" in the workflow "${workflow.name}".

Step Description: ${step.description}

Workflow Context: ${JSON.stringify(workflow.context, null, 2)}

`;

    // Include results from dependency steps
    if (step.dependencies.length > 0) {
      prompt += `Previous Step Results:\n`;
      step.dependencies.forEach(depId => {
        const result = workflow.results[depId];
        if (result) {
          prompt += `\n**${depId}:** ${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}\n`;
        }
      });
    }

    prompt += `\nStep Parameters: ${JSON.stringify(step.parameters, null, 2)}

Please execute this step according to your specialized capabilities and provide comprehensive results.`;

    return prompt;
  };

  const extractActionItems = (workflow: ActiveWorkflow): string[] => {
    // Simple action item extraction from workflow results
    const allResults = Object.values(workflow.results).join(' ');
    const actionWords = ['implement', 'create', 'develop', 'establish', 'build', 'design'];
    
    return allResults
      .split('.')
      .filter(sentence => 
        actionWords.some(word => sentence.toLowerCase().includes(word))
      )
      .slice(0, 5)
      .map(item => item.trim());
  };

  const executeWorkflow = useCallback(async (
    workflowId: string, 
    apiKey: string
  ): Promise<void> => {
    setIsExecuting(true);
    
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) throw new Error('Workflow not found');

      // Execute steps in dependency order
      const executedSteps = new Set<string>();
      const maxIterations = workflow.steps.length * 2; // Prevent infinite loops
      let iterations = 0;

      while (executedSteps.size < workflow.steps.length && iterations < maxIterations) {
        iterations++;
        
        for (const step of workflow.steps) {
          if (executedSteps.has(step.id)) continue;
          
          // Check if all dependencies are completed
          const dependenciesCompleted = step.dependencies.every(depId => 
            executedSteps.has(depId)
          );
          
          if (dependenciesCompleted) {
            await executeWorkflowStep(workflowId, step.id, apiKey);
            executedSteps.add(step.id);
          }
        }
      }

      // Mark workflow as completed
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'completed', completedAt: new Date() }
          : w
      ));

    } catch (error) {
      console.error('Error executing workflow:', error);
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: 'failed' } : w
      ));
    } finally {
      setIsExecuting(false);
    }
  }, [workflows, executeWorkflowStep]);

  const scheduleWorkflow = useCallback((
    workflowId: string,
    schedule: string,
    parameters: Record<string, any> = {}
  ): ScheduledTask => {
    const task: ScheduledTask = {
      id: Date.now().toString(),
      workflowId,
      schedule,
      nextRun: calculateNextRun(schedule),
      enabled: true,
      parameters
    };

    setScheduledTasks(prev => [...prev, task]);
    return task;
  }, []);

  const calculateNextRun = (schedule: string): Date => {
    // Simple schedule parsing (in production, use a proper cron parser)
    const now = new Date();
    if (schedule === 'daily') {
      const nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(9, 0, 0, 0); // 9 AM next day
      return nextRun;
    }
    if (schedule === 'weekly') {
      const nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 7);
      return nextRun;
    }
    // Default to 1 hour from now
    return new Date(now.getTime() + 60 * 60 * 1000);
  };

  const createCustomTemplate = useCallback((
    name: string,
    description: string,
    category: 'research' | 'creative' | 'strategic' | 'technical',
    steps: Omit<WorkflowStep, 'status'>[]
  ): WorkflowTemplate => {
    const template: WorkflowTemplate = {
      id: Date.now().toString(),
      name,
      description,
      category,
      isCustom: true,
      steps: steps.map(step => ({ ...step, status: 'pending' }))
    };

    setTemplates(prev => [...prev, template]);
    return template;
  }, []);

  return {
    workflows,
    templates,
    scheduledTasks,
    isExecuting,
    createWorkflowFromTemplate,
    executeWorkflow,
    executeWorkflowStep,
    scheduleWorkflow,
    createCustomTemplate
  };
};
