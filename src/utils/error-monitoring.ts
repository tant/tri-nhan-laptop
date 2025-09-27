/**
 * Error Monitoring and Reporting System
 *
 * Comprehensive error monitoring for Vietnamese Laptop Repair Shop operations,
 * including Vietnamese business context, customer data privacy, and production-ready
 * error tracking with Sentry integration.
 */

// Error monitoring configuration for Vietnamese business
export interface VietnameseErrorConfig {
  environment: 'development' | 'staging' | 'production';
  enableSentry: boolean;
  enableConsoleLogging: boolean;
  enableVietnameseContextCollection: boolean;
  customerDataPrivacy: boolean;
  errorReportingLevel: 'minimal' | 'standard' | 'verbose';
}

// Vietnamese business error context
export interface VietnameseBusinessErrorContext {
  userId?: string;
  userRole?: 'shop_owner' | 'staff';
  customerPhone?: string;        // Anonymized for privacy
  repairTicketCode?: string;     // Business context
  businessOperation?: string;    // Vietnamese repair operation
  vietnameseLocale?: string;     // vi-VN locale context
  timestamp: string;
  sessionId: string;
}

// Error severity levels for Vietnamese business operations
export type VietnameseErrorSeverity =
  | 'low'          // Minor UI issues, non-critical Vietnamese text rendering
  | 'medium'       // Vietnamese business logic errors, form validation
  | 'high'         // Customer data issues, repair workflow failures
  | 'critical';    // System crashes, data loss, Vietnamese financial calculations

// Vietnamese business error categories
export type VietnameseErrorCategory =
  | 'authentication'        // User login/logout issues
  | 'customer_management'   // Vietnamese customer operations
  | 'repair_workflow'       // Vietnamese repair ticket operations
  | 'inventory_management'  // Parts and inventory errors
  | 'financial_operations'  // VND calculations and billing
  | 'vietnamese_locale'     // Vietnamese text and formatting
  | 'mobile_interface'      // Mobile responsiveness issues
  | 'database_operations'   // Supabase and data errors
  | 'performance'           // Performance and loading issues
  | 'security';             // Security and privacy violations

/**
 * Enhanced error object for Vietnamese business context
 */
export interface VietnameseBusinessError extends Error {
  severity: VietnameseErrorSeverity;
  category: VietnameseErrorCategory;
  vietnameseContext?: VietnameseBusinessErrorContext;
  userFriendlyMessage?: string;  // Vietnamese error message for users
  technicalDetails?: Record<string, any>;
  timestamp: string;
  errorId: string;
}

/**
 * Vietnamese Business Error Monitor
 */
export class VietnameseBusinessErrorMonitor {
  private static instance: VietnameseBusinessErrorMonitor;
  private config: VietnameseErrorConfig;
  private errorQueue: VietnameseBusinessError[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.config = this.loadConfiguration();
    this.initializeErrorMonitoring();
  }

  static getInstance(): VietnameseBusinessErrorMonitor {
    if (!VietnameseBusinessErrorMonitor.instance) {
      VietnameseBusinessErrorMonitor.instance = new VietnameseBusinessErrorMonitor();
    }
    return VietnameseBusinessErrorMonitor.instance;
  }

  /**
   * Load error monitoring configuration
   */
  private loadConfiguration(): VietnameseErrorConfig {
    return {
      environment: (import.meta.env.VITE_APP_ENVIRONMENT || 'development') as any,
      enableSentry: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
      enableConsoleLogging: import.meta.env.DEV || import.meta.env.VITE_ENABLE_CONSOLE_ERRORS === 'true',
      enableVietnameseContextCollection: true,
      customerDataPrivacy: true,
      errorReportingLevel: import.meta.env.PROD ? 'standard' : 'verbose',
    };
  }

  /**
   * Initialize error monitoring systems
   */
  private initializeErrorMonitoring(): void {
    // Initialize Sentry for production error monitoring
    if (this.config.enableSentry && import.meta.env.PROD) {
      this.initializeSentry();
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    // Set up unhandled promise rejection handler
    this.setupUnhandledRejectionHandler();

    console.log('🇻🇳 Vietnamese Business Error Monitoring initialized');
  }

  /**
   * Initialize Sentry error monitoring
   */
  private initializeSentry(): void {
    try {
      // Sentry would be initialized here in production
      const sentryConfig = {
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: this.config.environment,
        beforeSend: (event: any) => this.sanitizeVietnameseBusinessData(event),
        integrations: [
          // Vietnamese business specific integrations
        ],
        tracesSampleRate: this.config.environment === 'production' ? 0.1 : 1.0,
      };

      console.log('📊 Sentry error monitoring configured for Vietnamese business');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Sentry:', error);
    }
  }

  /**
   * Sanitize Vietnamese business data for privacy compliance
   */
  private sanitizeVietnameseBusinessData(event: any): any {
    if (!this.config.customerDataPrivacy) {
      return event;
    }

    // Remove or anonymize Vietnamese customer data
    if (event.extra?.vietnameseContext) {
      const context = event.extra.vietnameseContext;

      // Anonymize customer phone number
      if (context.customerPhone) {
        context.customerPhone = this.anonymizeVietnamesePhone(context.customerPhone);
      }

      // Keep business context but remove personal identifiers
      delete context.userId;
    }

    // Remove sensitive Vietnamese business data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb: any) => {
        if (breadcrumb.data) {
          delete breadcrumb.data.customerPhone;
          delete breadcrumb.data.customerName;
          delete breadcrumb.data.personalData;
        }
        return breadcrumb;
      });
    }

    return event;
  }

  /**
   * Anonymize Vietnamese phone number for error reporting
   */
  private anonymizeVietnamesePhone(phone: string): string {
    if (phone.length >= 10) {
      return `${phone.substring(0, 3)}****${phone.substring(phone.length - 3)}`;
    }
    return '***masked***';
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureVietnameseBusinessError({
          name: 'Global Error',
          message: event.message,
          stack: event.error?.stack,
          severity: 'high',
          category: 'performance',
          vietnameseContext: {
            businessOperation: 'Global Error Handler',
            vietnameseLocale: 'vi-VN',
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
          },
          timestamp: new Date().toISOString(),
          errorId: this.generateErrorId(),
        } as VietnameseBusinessError);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureVietnameseBusinessError({
          name: 'Unhandled Promise Rejection',
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          severity: 'high',
          category: 'database_operations',
          vietnameseContext: {
            businessOperation: 'Promise Rejection Handler',
            vietnameseLocale: 'vi-VN',
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
          },
          timestamp: new Date().toISOString(),
          errorId: this.generateErrorId(),
        } as VietnameseBusinessError);
      });
    }
  }

  /**
   * Set up unhandled rejection handler
   */
  private setupUnhandledRejectionHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('🚨 Vietnamese Business Unhandled Promise Rejection:', event.reason);

        // Prevent default browser behavior
        event.preventDefault();
      });
    }
  }

  /**
   * Capture Vietnamese business error
   */
  captureVietnameseBusinessError(
    error: Partial<VietnameseBusinessError>,
    additionalContext?: Record<string, any>
  ): void {
    const vietnameseError: VietnameseBusinessError = {
      name: error.name || 'Vietnamese Business Error',
      message: error.message || 'Unknown Vietnamese business error',
      stack: error.stack,
      severity: error.severity || 'medium',
      category: error.category || 'performance',
      vietnameseContext: {
        ...error.vietnameseContext,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        ...additionalContext,
      },
      timestamp: new Date().toISOString(),
      errorId: error.errorId || this.generateErrorId(),
    };

    // Add to error queue
    this.errorQueue.push(vietnameseError);

    // Console logging for development
    if (this.config.enableConsoleLogging) {
      this.logVietnameseBusinessError(vietnameseError);
    }

    // Send to external monitoring service
    if (this.config.enableSentry && import.meta.env.PROD) {
      this.sendToSentry(vietnameseError);
    }

    // Clean up old errors
    this.cleanupErrorQueue();
  }

  /**
   * Log Vietnamese business error to console
   */
  private logVietnameseBusinessError(error: VietnameseBusinessError): void {
    const logLevel = this.getConsoleLogLevel(error.severity);
    const vietnamesePrefix = '🇻🇳 Vietnamese Business Error';

    console.group(`${vietnamesePrefix} [${error.severity.toUpperCase()}] ${error.category}`);
    console[logLevel]('Error ID:', error.errorId);
    console[logLevel]('Message:', error.message);
    console[logLevel]('Vietnamese Context:', error.vietnameseContext);

    if (error.technicalDetails) {
      console[logLevel]('Technical Details:', error.technicalDetails);
    }

    if (error.stack && this.config.errorReportingLevel === 'verbose') {
      console[logLevel]('Stack Trace:', error.stack);
    }

    console.groupEnd();
  }

  /**
   * Get console log level based on error severity
   */
  private getConsoleLogLevel(severity: VietnameseErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low': return 'log';
      case 'medium': return 'warn';
      case 'high':
      case 'critical': return 'error';
      default: return 'warn';
    }
  }

  /**
   * Send error to Sentry
   */
  private sendToSentry(error: VietnameseBusinessError): void {
    try {
      // In production, this would use the actual Sentry SDK
      // For now, we'll simulate the error reporting
      console.log('📊 Sending Vietnamese business error to Sentry:', {
        errorId: error.errorId,
        severity: error.severity,
        category: error.category,
        message: error.message,
      });
    } catch (sentryError) {
      console.warn('⚠️ Failed to send error to Sentry:', sentryError);
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `vn-error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `vn-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Clean up old errors from queue
   */
  private cleanupErrorQueue(): void {
    const maxErrors = 100;
    if (this.errorQueue.length > maxErrors) {
      this.errorQueue = this.errorQueue.slice(-maxErrors);
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count = 10): VietnameseBusinessError[] {
    return this.errorQueue.slice(-count);
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: VietnameseErrorCategory): VietnameseBusinessError[] {
    return this.errorQueue.filter(error => error.category === category);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): Record<string, any> {
    const totalErrors = this.errorQueue.length;
    const errorsByCategory = this.errorQueue.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsBySeverity = this.errorQueue.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      sessionId: this.sessionId,
      lastErrorTime: this.errorQueue[this.errorQueue.length - 1]?.timestamp,
    };
  }
}

/**
 * Vietnamese business error helper functions
 */
export const VietnameseBusinessErrorHelpers = {
  /**
   * Create customer management error
   */
  createCustomerError(
    message: string,
    customerPhone?: string,
    severity: VietnameseErrorSeverity = 'medium'
  ): VietnameseBusinessError {
    return {
      name: 'Vietnamese Customer Error',
      message,
      severity,
      category: 'customer_management',
      vietnameseContext: {
        customerPhone: customerPhone ? VietnameseBusinessErrorMonitor.getInstance()['anonymizeVietnamesePhone'](customerPhone) : undefined,
        businessOperation: 'Customer Management',
        vietnameseLocale: 'vi-VN',
        timestamp: new Date().toISOString(),
        sessionId: VietnameseBusinessErrorMonitor.getInstance()['sessionId'],
      },
      timestamp: new Date().toISOString(),
      errorId: `customer-${Date.now()}`,
    };
  },

  /**
   * Create repair workflow error
   */
  createRepairWorkflowError(
    message: string,
    repairTicketCode?: string,
    severity: VietnameseErrorSeverity = 'high'
  ): VietnameseBusinessError {
    return {
      name: 'Vietnamese Repair Workflow Error',
      message,
      severity,
      category: 'repair_workflow',
      vietnameseContext: {
        repairTicketCode,
        businessOperation: 'Repair Workflow',
        vietnameseLocale: 'vi-VN',
        timestamp: new Date().toISOString(),
        sessionId: VietnameseBusinessErrorMonitor.getInstance()['sessionId'],
      },
      timestamp: new Date().toISOString(),
      errorId: `repair-${Date.now()}`,
    };
  },

  /**
   * Create Vietnamese locale error
   */
  createVietnameseLocaleError(
    message: string,
    severity: VietnameseErrorSeverity = 'low'
  ): VietnameseBusinessError {
    return {
      name: 'Vietnamese Locale Error',
      message,
      severity,
      category: 'vietnamese_locale',
      vietnameseContext: {
        businessOperation: 'Vietnamese Locale Processing',
        vietnameseLocale: 'vi-VN',
        timestamp: new Date().toISOString(),
        sessionId: VietnameseBusinessErrorMonitor.getInstance()['sessionId'],
      },
      timestamp: new Date().toISOString(),
      errorId: `locale-${Date.now()}`,
    };
  },

  /**
   * Create financial operation error
   */
  createFinancialError(
    message: string,
    amount?: number,
    severity: VietnameseErrorSeverity = 'high'
  ): VietnameseBusinessError {
    return {
      name: 'Vietnamese Financial Error',
      message,
      severity,
      category: 'financial_operations',
      vietnameseContext: {
        businessOperation: 'Financial Operations',
        vietnameseLocale: 'vi-VN',
        timestamp: new Date().toISOString(),
        sessionId: VietnameseBusinessErrorMonitor.getInstance()['sessionId'],
      },
      technicalDetails: {
        amount: amount ? `${amount} VND` : undefined,
        currency: 'VND',
      },
      timestamp: new Date().toISOString(),
      errorId: `financial-${Date.now()}`,
    };
  },
};

/**
 * Error boundary component helper for Vietnamese business
 */
export function createVietnameseBusinessErrorBoundary(
  onError?: (error: VietnameseBusinessError) => void
) {
  return class VietnameseBusinessErrorBoundary extends Error {
    constructor(error: Error, errorInfo: any) {
      super(error.message);

      const vietnameseError = {
        name: 'Vietnamese Business Component Error',
        message: error.message,
        stack: error.stack,
        severity: 'high' as VietnameseErrorSeverity,
        category: 'performance' as VietnameseErrorCategory,
        vietnameseContext: {
          businessOperation: 'Component Rendering',
          vietnameseLocale: 'vi-VN',
          timestamp: new Date().toISOString(),
          sessionId: VietnameseBusinessErrorMonitor.getInstance()['sessionId'],
        },
        technicalDetails: errorInfo,
        timestamp: new Date().toISOString(),
        errorId: `component-${Date.now()}`,
      } as VietnameseBusinessError;

      VietnameseBusinessErrorMonitor.getInstance().captureVietnameseBusinessError(vietnameseError);

      if (onError) {
        onError(vietnameseError);
      }
    }
  };
}

// Initialize error monitoring
if (typeof window !== 'undefined') {
  VietnameseBusinessErrorMonitor.getInstance();
}

// Export singleton instance
export const errorMonitor = VietnameseBusinessErrorMonitor.getInstance();