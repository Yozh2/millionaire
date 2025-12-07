/**
 * Centralized logging service for the engine.
 *
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Automatic prefix with component/module name
 * - Disabled in production (except errors)
 * - Structured logging with context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  /** Minimum level to log (default: 'info' in prod, 'debug' in dev) */
  minLevel: LogLevel;
  /** Whether logging is enabled */
  enabled: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDev = import.meta.env.DEV;

const defaultConfig: LoggerConfig = {
  minLevel: isDev ? 'debug' : 'warn',
  enabled: true,
};

let globalConfig: LoggerConfig = { ...defaultConfig };

/**
 * Configure the global logger settings.
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Create a logger instance with a specific prefix.
 *
 * @param prefix - Module/component name to prepend to logs
 * @returns Logger instance with debug, info, warn, error methods
 *
 * @example
 * const logger = createLogger('AssetLoader');
 * logger.info('Loading assets...', { count: 5 });
 * logger.warn('Asset not found', { path: '/images/test.png' });
 */
export function createLogger(prefix: string) {
  const formatPrefix = () => `[${prefix}]`;

  const shouldLog = (level: LogLevel): boolean => {
    if (!globalConfig.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[globalConfig.minLevel];
  };

  return {
    debug: (message: string, context?: Record<string, unknown>) => {
      if (shouldLog('debug')) {
        if (context) {
          console.log(formatPrefix(), message, context);
        } else {
          console.log(formatPrefix(), message);
        }
      }
    },

    info: (message: string, context?: Record<string, unknown>) => {
      if (shouldLog('info')) {
        if (context) {
          console.log(formatPrefix(), message, context);
        } else {
          console.log(formatPrefix(), message);
        }
      }
    },

    warn: (message: string, context?: Record<string, unknown>) => {
      if (shouldLog('warn')) {
        if (context) {
          console.warn(formatPrefix(), message, context);
        } else {
          console.warn(formatPrefix(), message);
        }
      }
    },

    error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
      if (shouldLog('error')) {
        if (context) {
          console.error(formatPrefix(), message, error, context);
        } else if (error) {
          console.error(formatPrefix(), message, error);
        } else {
          console.error(formatPrefix(), message);
        }
      }
    },
  };
}

/**
 * Pre-configured loggers for engine modules.
 */
export const logger = {
  assetLoader: createLogger('AssetLoader'),
  audioPlayer: createLogger('AudioPlayer'),
  gameState: createLogger('GameState'),
  millionaireGame: createLogger('MillionaireGame'),
  errorBoundary: createLogger('ErrorBoundary'),
};
