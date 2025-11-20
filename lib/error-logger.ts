/**
 * Enhanced error logging for production debugging
 */

export interface ErrorContext {
  userId?: string;
  clerkId?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class AppError extends Error {
  public readonly context: ErrorContext;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    context: ErrorContext = {},
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function logError(error: Error | AppError, context: ErrorContext = {}) {
  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
    ...(error instanceof AppError && {
      appErrorContext: error.context,
      isOperational: error.isOperational,
    }),
  };

  // Log to console (shows in Vercel function logs)
  console.error('🚨 APPLICATION ERROR:', JSON.stringify(errorDetails, null, 2));

  // In production, you could also send to error tracking service
  // Example: Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service
    // Sentry.captureException(error, { extra: errorDetails });
  }

  return errorDetails;
}

export function logInfo(message: string, data?: Record<string, any>) {
  console.log('ℹ️ INFO:', message, data ? JSON.stringify(data, null, 2) : '');
}

export function logWarning(message: string, data?: Record<string, any>) {
  console.warn('⚠️ WARNING:', message, data ? JSON.stringify(data, null, 2) : '');
}

export function logDebug(message: string, data?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🐛 DEBUG:', message, data ? JSON.stringify(data, null, 2) : '');
  }
}
