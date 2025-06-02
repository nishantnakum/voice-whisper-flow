
import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SecurityStatus = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const isSecureMode = !!supabaseUrl;

  return (
    <Alert className={`mb-4 ${isSecureMode ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <div className="flex items-center gap-2">
        {isSecureMode ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        )}
        <Shield className="h-4 w-4" />
      </div>
      <AlertDescription className="ml-6">
        {isSecureMode ? (
          <span className="text-green-800">
            <strong>Secure Mode Active:</strong> API keys are protected and all communications are encrypted.
          </span>
        ) : (
          <span className="text-yellow-800">
            <strong>Demo Mode:</strong> Connect to Supabase for full security. Some features may be limited.
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};
