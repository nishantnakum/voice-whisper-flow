
interface ValidationResult {
  isValid: boolean;
  sanitizedInput: string;
  errors: string[];
}

class InputValidator {
  private readonly MAX_INPUT_LENGTH = 10000;
  private readonly MAX_API_CALLS_PER_MINUTE = 30;
  private readonly callTimestamps: number[] = [];

  validateTextInput(input: string): ValidationResult {
    const errors: string[] = [];
    let sanitizedInput = input;

    // Check length
    if (input.length > this.MAX_INPUT_LENGTH) {
      errors.push(`Input too long. Maximum ${this.MAX_INPUT_LENGTH} characters allowed.`);
      sanitizedInput = input.substring(0, this.MAX_INPUT_LENGTH);
    }

    // Check for potential prompt injection patterns
    const dangerousPatterns = [
      /ignore\s+previous\s+instructions/i,
      /forget\s+everything/i,
      /you\s+are\s+now\s+a/i,
      /system\s*[:]\s*you\s+are/i,
      /\[SYSTEM\]/i,
      /\bprompt\s*[:]\s*/i,
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];

    const foundDangerousPattern = dangerousPatterns.some(pattern => pattern.test(input));
    if (foundDangerousPattern) {
      errors.push('Input contains potentially unsafe content.');
      // Remove dangerous patterns
      sanitizedInput = dangerousPatterns.reduce(
        (text, pattern) => text.replace(pattern, '[REMOVED]'),
        sanitizedInput
      );
    }

    // Basic HTML/XSS sanitization
    sanitizedInput = sanitizedInput
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return {
      isValid: errors.length === 0,
      sanitizedInput,
      errors
    };
  }

  checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old timestamps
    while (this.callTimestamps.length > 0 && this.callTimestamps[0] < oneMinuteAgo) {
      this.callTimestamps.shift();
    }

    if (this.callTimestamps.length >= this.MAX_API_CALLS_PER_MINUTE) {
      return false;
    }

    this.callTimestamps.push(now);
    return true;
  }

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey || apiKey.trim().length === 0) {
      errors.push('API key is required');
    } else if (!apiKey.startsWith('sk_')) {
      errors.push('Invalid API key format');
    } else if (apiKey.length < 20) {
      errors.push('API key appears to be too short');
    }

    return {
      isValid: errors.length === 0,
      sanitizedInput: apiKey.trim(),
      errors
    };
  }
}

export const inputValidator = new InputValidator();
