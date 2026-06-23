
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bug, X, Trash2, ChevronDown, ChevronUp, Copy, Terminal, Database, ShieldAlert, User as UserIcon } from 'lucide-react';
import { logService, LogEntry } from '../services/logService';

export const DebugOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(logService.getLogs());
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewLog = () => {
      setLogs(logService.getLogs());
    };

    window.addEventListener('jurisconnect_new_log', handleNewLog);
    return () => window.removeEventListener('jurisconnect_new_log', handleNewLog);
  }, []);

  const copyLogs = () => {
    const diagnostic = logService.getDiagnosticInfo();
    const text = JSON.stringify({ diagnostic, logs }, null, 2);
    navigator.clipboard.writeText(text);
    alert('Logs copied to clipboard!');
  };

  const getLogIcon = (type: string, context?: string) => {
    if (context === 'Firestore') return <Database className="w-4 h-4 text-amber-500" />;
    if (type === 'error') return <ShieldAlert className="w-4 h-4 text-red-500" />;
    return <Terminal className="w-4 h-4 text-slate-400" />;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] bg-slate-900 text-white p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-transform active:scale-95 border border-slate-700"
        title="Debug Logs"
      >
        <Bug className={`w-5 h-5 ${isOpen ? 'rotate-180' : ''} transition-transform duration-300`} />
        {logs.some(l => l.type === 'error') && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-4 z-[9998] w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-slate-900 border border-slate-700 rounded-2xl shadow-3xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100">Debug Monitor</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
                  {logs.length} events
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLogs}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Copy Full Diagnostic"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => logService.clearLogs()}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                  title="Clear Logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Diagnostic Toolbar */}
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center gap-4 overflow-x-auto text-[11px]">
               <div className="flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
                 <UserIcon className="w-3 h-3" />
                 <span className="font-mono">{logService.getDiagnosticInfo().auth.email || 'Guest'}</span>
               </div>
               <div className={`flex items-center gap-1.5 whitespace-nowrap ${logService.getDiagnosticInfo().auth.isSignedIn ? 'text-emerald-400' : 'text-amber-400'}`}>
                 <span className="w-1.5 h-1.5 rounded-full bg-current" />
                 {logService.getDiagnosticInfo().auth.isSignedIn ? 'Authenticated' : 'Logged Out'}
               </div>
            </div>

            {/* Log List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[11px]">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 opacity-50">
                  <Terminal className="w-8 h-8" />
                  <p>No system logs yet</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.timestamp + log.message}
                    className={`rounded-lg border transition-colors ${
                      log.type === 'error' 
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                        : log.type === 'warn'
                        ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                        : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.timestamp ? null : log.timestamp)}
                      className="w-full text-left p-2 flex items-start gap-2"
                    >
                      <span className="mt-0.5">{getLogIcon(log.type, log.context)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`${
                            log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : 'text-slate-300'
                          } font-bold truncate`}>
                            {log.context ? `[${log.context}] ` : ''}{log.message}
                          </span>
                          <span className="text-slate-600 text-[9px] shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {log.details && (
                        <div className="ml-auto text-slate-500">
                          {expandedLog === log.timestamp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" /> }
                        </div>
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedLog === log.timestamp && log.details && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-black/40 rounded-b-lg"
                        >
                          <pre className="p-3 text-[10px] text-slate-400 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
