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
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="fixed top-4 left-0 right-0 z-[99999] pointer-events-none px-4 flex justify-center"
        >
          <div
            style={{
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] border transition-all duration-300 ${
              statusType === "offline"
                ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {/* Glowing Connection Dot */}
            <span className="flex h-3 w-3 relative shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                statusType === "offline" ? "bg-red-400" : "bg-emerald-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                statusType === "offline" ? "bg-red-500" : "bg-emerald-500"
              }`}></span>
            </span>

            {/* Icon */}
            <i className={`text-base leading-none ${
              statusType === "offline" ? "ri-wifi-off-fill text-red-500" : "ri-wifi-fill text-emerald-500 animate-pulse"
            }`} />

            {/* Label */}
            <span className="text-[13px] font-bold font-body tracking-tight">
              {statusType === "offline" 
                ? "Offline Mode — Changes and alerts are paused" 
                : "Back Online — Syncing community updates"
              }
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
