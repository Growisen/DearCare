type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDev) return true;
    return level !== 'debug';
  }

  debug(message: string, data?: unknown) {
    if (this.shouldLog('debug')) {
      console.log(`🐛 ${message}`, data || '');
    }
  }

  info(message: string, data?: unknown) {
    if (this.shouldLog('info')) {
      console.log(`ℹ️  ${message}`, data || '');
    }
  }

  warn(message: string, data?: unknown) {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️  ${message}`, data || '');
    }
  }

  error(message: string, error?: unknown) {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, error || '');
    }
  }
}

export const logger = new Logger();