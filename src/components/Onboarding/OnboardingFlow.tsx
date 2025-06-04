
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ArrowRight, ArrowLeft, Rocket, Shield, Mic, Brain } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  isComplete?: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Noesis AI',
      description: 'Your advanced AI command center for strategic decision-making',
      icon: <Rocket className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Professional-Grade AI Assistant</h3>
            <p className="text-gray-600">
              Noesis AI combines advanced speech recognition, multiple AI personalities, 
              and enterprise-grade security to provide world-class AI assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Brain className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">AI Modes</h4>
              <p className="text-sm text-gray-600">Strategic, Creative, Research & More</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Mic className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium">Voice Control</h4>
              <p className="text-sm text-gray-600">Natural speech interaction</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium">Secure</h4>
              <p className="text-sm text-gray-600">Enterprise-grade security</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Understanding how your data is protected',
      icon: <Shield className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Your Privacy is Protected:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>All data stays on your device</li>
                <li>API keys are stored locally and encrypted</li>
                <li>No conversation data is sent to our servers</li>
                <li>Input sanitization prevents security issues</li>
                <li>Rate limiting protects against abuse</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What happens to your data:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Conversations stored locally in your browser</li>
              <li>✅ Preferences synchronized across browser sessions</li>
              <li>✅ API calls made directly to service providers</li>
              <li>❌ No data collection by Noesis.tech</li>
              <li>❌ No tracking or analytics</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'setup',
      title: 'Quick Setup',
      description: 'Configure your AI services (optional)',
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            To unlock the full potential of Noesis AI, you'll need API keys from these services. 
            Don't worry - you can add these later in Settings if you prefer to explore first.
          </p>
          
          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium">ElevenLabs (Text-to-Speech)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Enables advanced voice personalities and natural speech generation
              </p>
              <a 
                href="https://elevenlabs.io/docs/api-reference/getting-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline"
              >
                Get ElevenLabs API Key →
              </a>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium">Google Gemini (AI Conversations)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Powers the advanced AI conversation and analysis capabilities
              </p>
              <a 
                href="https://ai.google.dev/gemini-api/docs/api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline"
              >
                Get Gemini API Key →
              </a>
            </div>
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>Note:</strong> You can start using Noesis AI immediately with basic features, 
              then add API keys later to unlock advanced capabilities.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Ready to Begin',
      description: 'Start your AI-powered strategic sessions',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-4 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
            <p className="text-gray-600">
              Noesis AI is ready to assist you with strategic decision-making, 
              creative brainstorming, research, and more.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Quick Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use voice input for natural conversations</li>
              <li>• Switch AI modes based on your task</li>
              <li>• Upload documents and images for analysis</li>
              <li>• Access Settings anytime to configure API keys</li>
            </ul>
          </div>
          
          <Button onClick={onComplete} className="w-full">
            <Rocket className="h-4 w-4 mr-2" />
            Launch Noesis AI
          </Button>
        </div>
      )
    }
  ];

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const nextStep = () => {
    markStepComplete(steps[currentStep].id);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <p className="text-gray-600">{steps[currentStep].description}</p>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          <div className="flex justify-between pt-4">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={onComplete}>
                <Rocket className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
