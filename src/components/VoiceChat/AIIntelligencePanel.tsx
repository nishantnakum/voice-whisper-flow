
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Users, 
  Search, 
  Workflow, 
  Play, 
  Pause, 
  Clock,
  Lightbulb,
  Database,
  Zap
} from 'lucide-react';
import { useMultiAICollaboration } from '@/hooks/useMultiAICollaboration';
import { useSmartKnowledgeManagement } from '@/hooks/useSmartKnowledgeManagement';
import { useWorkflowAutomation } from '@/hooks/useWorkflowAutomation';
import { AI_MODES } from '@/config/aiModes';

interface AIIntelligencePanelProps {
  apiKey?: string;
  onApiKeyRequired: () => void;
}

export const AIIntelligencePanel = ({ apiKey, onApiKeyRequired }: AIIntelligencePanelProps) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    activeSession,
    isCollaborating,
    debateRounds,
    startCollaboration,
    stopCollaboration
  } = useMultiAICollaboration();

  const {
    knowledgeBase,
    isProcessingEmbeddings,
    knowledgeStats,
    semanticSearch,
    generateKnowledgeInsights,
    processKnowledgeEmbeddings
  } = useSmartKnowledgeManagement();

  const {
    workflows,
    templates,
    isExecuting,
    createWorkflowFromTemplate,
    executeWorkflow
  } = useWorkflowAutomation();

  const handleStartCollaboration = async () => {
    if (!apiKey) {
      onApiKeyRequired();
      return;
    }

    if (!selectedTopic || selectedParticipants.length < 2) {
      alert('Please enter a topic and select at least 2 AI participants');
      return;
    }

    await startCollaboration(selectedTopic, selectedParticipants, apiKey);
  };

  const handleSemanticSearch = async () => {
    if (!searchQuery) return;
    
    const results = await semanticSearch(searchQuery, 5, 0.2);
    console.log('Semantic search results:', results);
  };

  const handleStartWorkflow = async (templateId: string) => {
    if (!apiKey) {
      onApiKeyRequired();
      return;
    }

    const workflow = createWorkflowFromTemplate(
      templateId, 
      `Automated ${templates.find(t => t.id === templateId)?.name}`,
      { topic: selectedTopic || 'General Analysis' }
    );
    
    await executeWorkflow(workflow.id, apiKey);
  };

  const insights = generateKnowledgeInsights();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Intelligence & Automation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="collaboration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collaboration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              AI Collaboration
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Smart Knowledge
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collaboration" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discussion Topic</label>
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="What should the AIs collaborate on?"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">AI Participants</label>
                <div className="grid grid-cols-2 gap-2">
                  {AI_MODES.map(mode => (
                    <label key={mode.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(mode.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants(prev => [...prev, mode.id]);
                          } else {
                            setSelectedParticipants(prev => prev.filter(id => id !== mode.id));
                          }
                        }}
                      />
                      <span className="text-sm">{mode.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartCollaboration}
                  disabled={isCollaborating || !selectedTopic || selectedParticipants.length < 2}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Collaboration
                </Button>
                {isCollaborating && (
                  <Button onClick={stopCollaboration} variant="outline">
                    <Pause className="h-4 w-4" />
                    Stop
                  </Button>
                )}
              </div>

              {activeSession && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Active Session: {activeSession.topic}</h4>
                  <div className="space-y-2">
                    {debateRounds.map((round, index) => (
                      <div key={index} className="p-2 bg-white rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{round.perspective}</Badge>
                          <span className="text-xs text-gray-500">
                            {round.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{round.response.substring(0, 150)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{knowledgeStats.totalItems}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{knowledgeStats.totalWords}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {knowledgeStats.averageWordsPerItem}
                </div>
                <div className="text-sm text-gray-600">Avg Words/Item</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{insights.length}</div>
                <div className="text-sm text-gray-600">Insights</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Semantic Search</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search knowledge semantically..."
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <Button onClick={handleSemanticSearch} disabled={!searchQuery}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                onClick={processKnowledgeEmbeddings}
                disabled={isProcessingEmbeddings}
                variant="outline"
                className="w-full"
              >
                {isProcessingEmbeddings ? 'Processing...' : 'Update Knowledge Embeddings'}
              </Button>

              {insights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Knowledge Insights
                  </h4>
                  <div className="space-y-2">
                    {insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                        <h5 className="font-medium text-sm">{insight.pattern}</h5>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <p className="text-xs text-blue-600 mt-2">💡 {insight.actionSuggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <div className="grid gap-4">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Workflow Templates
              </h4>
              
              {templates.map(template => (
                <div key={template.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{template.name}</h5>
                    <Badge variant={template.isCustom ? 'secondary' : 'default'}>
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.steps.length} steps
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleStartWorkflow(template.id)}
                      disabled={isExecuting}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Execute
                    </Button>
                  </div>
                </div>
              ))}

              {workflows.length > 0 && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-green-500" />
                    Active Workflows
                  </h4>
                  <div className="space-y-2">
                    {workflows.map(workflow => (
                      <div key={workflow.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{workflow.name}</h5>
                          <Badge 
                            variant={
                              workflow.status === 'completed' ? 'default' :
                              workflow.status === 'failed' ? 'destructive' : 'secondary'
                            }
                          >
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Step {workflow.currentStep + 1} of {workflow.steps.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
