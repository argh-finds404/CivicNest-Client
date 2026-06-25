import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConnectionStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [statusType, setStatusType] = useState("online"); // "online" | "offline"

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatusType("online");
      setShowStatus(true);
      // Auto-hide the online success banner after 3 seconds
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusType("offline");
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check: if starting offline, show it
    if (!navigator.onLine) {
      setStatusType("offline");
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none px-4 pt-3 flex justify-center"
        >
          <div
            className={`pointer-events-auto flex items-center gap-3 px-5 py-2.5 rounded-full shadow-lg border text-xs font-bold font-body ${
              statusType === "offline"
                ? "bg-red-50 dark:bg-[#1a0a0d] border-red-200 dark:border-red-950 text-red-650 dark:text-red-400"
                : "bg-emerald-50 dark:bg-[#0a1b12] border-emerald-200 dark:border-emerald-950 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {statusType === "offline" ? (
              <>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <i className="ri-wifi-off-line text-sm" />
                <span>You are currently offline. Actions and maps are paused.</span>
              </>
            ) : (
              <>
                <i className="ri-checkbox-circle-line text-sm text-emerald-600 animate-bounce" />
                <span>Connection restored! Syncing updates.</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
