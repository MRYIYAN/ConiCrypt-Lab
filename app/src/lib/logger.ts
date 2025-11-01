type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private logs: Array<{ level: LogLevel; message: string; timestamp: Date }> = [];
  private maxLogs = 100;

  log(level: LogLevel, message: string) {
    const entry = { level, message, timestamp: new Date() };
    this.logs.push(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console[level === 'debug' ? 'log' : level](`[${level.toUpperCase()}]`, message);
  }

  info(message: string) {
    this.log('info', message);
  }

  warn(message: string) {
    this.log('warn', message);
  }

  error(message: string) {
    this.log('error', message);
  }

  debug(message: string) {
    this.log('debug', message);
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
