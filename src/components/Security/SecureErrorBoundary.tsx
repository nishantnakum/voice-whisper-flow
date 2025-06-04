
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { secureLogger } from '@/utils/secureLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string;
  errorMessage: string;
  isSensitiveError: boolean;
}

export class SecureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      errorMessage: '',
      isSensitiveError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if error contains sensitive information
    const sensitivePatterns = [
      /sk_[a-zA-Z0-9]{20,}/,
      /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/,
      /AIzaSy[a-zA-Z0-9_-]{33}/,
      /password/i,
      /secret/i,
      /token/i
    ];
    
    const isSensitiveError = sensitivePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.stack || '')
    );
    
    // Sanitize error message for display
    let displayMessage = error.message;
    if (isSensitiveError) {
      displayMessage = 'A security-related error occurred. Please check your configuration.';
    }

    return {
      hasError: true,
      errorId,
      errorMessage: displayMessage,
      isSensitiveError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error securely (sensitive data will be redacted by secureLogger)
    secureLogger.error('Application error caught by boundary', {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Clear potentially corrupted data if it's a sensitive error
    if (this.state.isSensitiveError) {
      secureLogger.warn('Sensitive error detected, clearing potentially corrupted data');
      // Don't clear all localStorage, just sensitive keys
      const sensitiveKeys = ['elevenlabs-api-key', 'gemini-api-key'];
      sensitiveKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          secureLogger.error('Failed to clear sensitive data', { key });
        }
      });
    }
  }

  handleReload = () => {
    secureLogger.info('User initiated application reload from error boundary');
    window.location.reload();
  };

  handleReset = () => {
    secureLogger.info('User reset error boundary state');
    this.setState({
      hasError: false,
      errorId: '',
      errorMessage: '',
      isSensitiveError: false
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-600">Application Error</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.isSensitiveError && (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    A security-related error was detected. For your protection, 
                    some stored data may have been cleared.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert>
                <AlertDescription>
                  <strong>Error ID:</strong> {this.state.errorId}
                  <br />
                  <strong>Message:</strong> {this.state.errorMessage}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  We apologize for the inconvenience. You can try the following actions:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Refresh the page to restart the application</li>
                  <li>Check your network connection</li>
                  <li>Clear your browser cache if the problem persists</li>
                  {this.state.isSensitiveError && (
                    <li>Re-enter your API keys in the settings</li>
                  )}
                </ul>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
                <Button onClick={this.handleReset} variant="outline">
                  Try Again
                </Button>
              </div>
              
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Error ID: {this.state.errorId}
                  <br />
                  This error has been logged securely for analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
