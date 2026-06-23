
import { auth } from './firebase';

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'warn';
  message: string;
  details?: any;
  context?: string;
}

class LogService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;
  private readonly STORAGE_KEY = 'jurisconnect_debug_logs';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load logs from storage', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      // If storage is full, clear half
      if (this.logs.length > 0) {
        this.logs = this.logs.slice(-Math.floor(this.MAX_LOGS / 2));
        this.saveToStorage();
      }
    }
  }

  log(type: 'info' | 'error' | 'warn', message: string, details?: any, context?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      context,
    };

    console[type](`[${context || 'LOG'}] ${message}`, details || '');

    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
    this.saveToStorage();
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('jurisconnect_new_log', { detail: entry }));
  }

  info(message: string, details?: any, context?: string) {
    this.log('info', message, details, context);
  }

  warn(message: string, details?: any, context?: string) {
    this.log('warn', message, details, context);
  }

  error(message: string, details?: any, context?: string) {
    this.log('error', message, details, context);
  }

  getLogs() {
    return [...this.logs].reverse();
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('jurisconnect_new_log'));
  }

  getDiagnosticInfo() {
    return {
      auth: {
        isSignedIn: !!auth.currentUser,
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }
}

export const logService = new LogService();
