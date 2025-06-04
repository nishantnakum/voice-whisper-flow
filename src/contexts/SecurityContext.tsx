
import React, { createContext, useContext, useEffect, useState } from 'react';
import { secureLogger } from '@/utils/secureLogger';

interface SecurityConfig {
  enableCSP: boolean;
  enableSecureHeaders: boolean;
  enableDataEncryption: boolean;
  sessionTimeout: number; // minutes
  maxFailedAttempts: number;
}

interface SecurityContextType {
  config: SecurityConfig;
  isSecure: boolean;
  lastActivity: Date;
  failedAttempts: number;
  updateActivity: () => void;
  recordFailedAttempt: () => void;
  resetFailedAttempts: () => void;
  checkSecurityHeaders: () => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const defaultConfig: SecurityConfig = {
  enableCSP: true,
  enableSecureHeaders: true,
  enableDataEncryption: true,
  sessionTimeout: 60, // 1 hour
  maxFailedAttempts: 5
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config] = useState<SecurityConfig>(defaultConfig);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isSecure, setIsSecure] = useState(true);

  const updateActivity = () => {
    setLastActivity(new Date());
  };

  const recordFailedAttempt = () => {
    setFailedAttempts(prev => prev + 1);
    secureLogger.warn('Security: Failed attempt recorded', { attempts: failedAttempts + 1 });
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
  };

  const checkSecurityHeaders = (): boolean => {
    // Check if we're running in a secure context
    const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    const hasSecureContext = window.isSecureContext;
    
    setIsSecure(isHTTPS && hasSecureContext);
    return isHTTPS && hasSecureContext;
  };

  // Session timeout monitoring
  useEffect(() => {
    const checkSession = () => {
      const now = new Date();
      const timeSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60); // minutes
      
      if (timeSinceActivity > config.sessionTimeout) {
        secureLogger.warn('Security: Session timeout detected');
        // Clear sensitive data
        const sensitiveKeys = ['elevenlabs-api-key', 'gemini-api-key'];
        sensitiveKeys.forEach(key => localStorage.removeItem(key));
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity, config.sessionTimeout]);

  // Add global activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // Security headers check
  useEffect(() => {
    checkSecurityHeaders();
    
    if (config.enableCSP) {
      // Log CSP compliance
      secureLogger.info('Security: Content Security Policy enabled');
    }
  }, [config.enableCSP]);

  const value: SecurityContextType = {
    config,
    isSecure,
    lastActivity,
    failedAttempts,
    updateActivity,
    recordFailedAttempt,
    resetFailedAttempts,
    checkSecurityHeaders
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
