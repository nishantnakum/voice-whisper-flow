
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const isDevelopment = import.meta.env.DEV;

class SecureLogger {
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Remove API keys, tokens, and other sensitive patterns
      return data
        .replace(/sk_[a-zA-Z0-9]{20,}/g, 'sk_***REDACTED***')
        .replace(/Bearer\s+[a-zA-Z0-9\-._~+/]+=*/g, 'Bearer ***REDACTED***')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***EMAIL_REDACTED***')
        .replace(/AIzaSy[a-zA-Z0-9_-]{33}/g, 'AIzaSy***REDACTED***');
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {};
      
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        
        // Skip sensitive fields entirely
        if (lowerKey.includes('key') || lowerKey.includes('token') || 
            lowerKey.includes('secret') || lowerKey.includes('password')) {
          sanitized[key] = '***REDACTED***';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      
      return sanitized;
    }

    return data;
  }

  private log(level: string, message: string, ...args: any[]) {
    if (!isDevelopment && level === LOG_LEVELS.DEBUG) {
      return; // Skip debug logs in production
    }

    const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
    const timestamp = new Date().toISOString();
    
    console[level as keyof Console](`[${timestamp}] ${message}`, ...sanitizedArgs);
  }

  error(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.ERROR, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.WARN, message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.INFO, message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log(LOG_LEVELS.DEBUG, message, ...args);
  }
}

export const secureLogger = new SecureLogger();
