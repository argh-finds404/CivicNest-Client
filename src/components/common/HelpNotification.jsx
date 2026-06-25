import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpNotification() {
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastShownTime, setLastShownTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const triggerNotification = (msg) => {
      const now = Date.now();
      // Throttle notification display to at most once per 45 seconds to prevent spam
      if (now - lastShownTime < 45000) return;

      setErrorMessage(msg || 'Something went wrong while processing your request.');
      setLastShownTime(now);
      setVisible(true);
    };

    const handleGlobalError = (event) => {
      // Only display for meaningful failures (ignore extension errors or trivial bugs)
      if (event.message && !event.message.includes('ResizeObserver')) {
        triggerNotification(`Error: ${event.message}`);
      }
    };

    const handlePromiseRejection = (event) => {
      const reason = event.reason;
      const message = reason?.message || (typeof reason === 'string' ? reason : 'Unhandled asynchronous rejection');
      // Skip auth state changes or network offline errors
      if (message && !message.includes('auth') && !message.includes('ResizeObserver')) {
        triggerNotification(message);
      }
    };

    const handleCustomError = (event) => {
      const msg = event.detail?.message;
      triggerNotification(msg);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    window.addEventListener('app:error-reported', handleCustomError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      window.removeEventListener('app:error-reported', handleCustomError);
    };
  }, [lastShownTime]);

  const handleOpenManual = () => {
    setVisible(false);
    navigate('/user-manual');
  };

  const handleAskAI = () => {
    setVisible(false);
    // Dispatch a custom event to FloatingCivicBot to trigger chat with prefilled context
    const cleanMsg = errorMessage.length > 60 ? errorMessage.substring(0, 60) + '...' : errorMessage;
    window.dispatchEvent(
      new CustomEvent('civicbot:open', {
        detail: { prompt: `I received an error: "${cleanMsg}". How can I resolve this?` }
      })
    );
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-6 left-6 z-[9999] w-[320px] bg-white dark:bg-[#0a120e] border border-slate-200 dark:border-[#14241d] border-l-4 border-l-amber-500 rounded-r-2xl rounded-l-md shadow-2xl p-4 flex flex-col gap-3 pointer-events-auto"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
                <i className="ri-error-warning-line text-base" />
              </span>
              <span className="text-[11px] uppercase font-black tracking-wider text-slate-400">
                Troubleshooting Help
              </span>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
              Encountered a problem?
            </h4>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              If you're lost or facing system issues, check our User Manual or ask CivicBot AI.
            </p>
          </div>

          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={handleOpenManual}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 font-extrabold text-[10.5px] rounded-lg transition-colors cursor-pointer"
            >
              Read Manual
            </button>
            <button
              onClick={handleAskAI}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-150/60 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 border border-teal-200/50 dark:border-teal-900/30 text-teal-800 dark:text-teal-400 font-extrabold text-[10.5px] rounded-lg transition-colors cursor-pointer"
            >
              Ask CivicBot AI
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
