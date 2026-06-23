import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PwaInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
    
    // Listen for the native install prompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show our custom prompt after 5 seconds if not dismissed
    // (Especially useful for iOS or browsers that don't support beforeinstallprompt)
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition p-1 bg-slate-50 hover:bg-slate-100 rounded-full"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex gap-4 items-start pt-1">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Install LawyerOnline App</h3>
          <p className="text-xs text-slate-500 mt-1 mb-3 leading-relaxed">
            Add to your home screen for quick access, offline features, and better experience.
          </p>
          <div className="flex gap-2">
            {deferredPrompt ? (
              <button 
                onClick={handleInstall}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Install App
              </button>
            ) : (
              <Link 
                to="/download-app"
                onClick={() => setIsVisible(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                View Instructions
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
