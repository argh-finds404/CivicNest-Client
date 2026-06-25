import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import SEO from "./SEO";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1215] px-6 py-12 relative overflow-hidden font-body transition-colors duration-300">
      <SEO title="404 - Page Not Found" />

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10">
        
        {/* Animated Icon Illustration */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-36 h-36 mx-auto mb-8 bg-gradient-to-tr from-teal-500 to-emerald-400 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/20 relative"
        >
          {/* Glowing Ring */}
          <div className="absolute inset-0 rounded-3xl border border-white/20 animate-ping opacity-25 scale-110 pointer-events-none" />
          <i className="ri-map-pin-5-line text-6xl" />
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-7xl md:text-8xl font-black font-logo tracking-tight bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight mb-4"
        >
          Strayed Off the Clean Path
        </motion.h2>

        {/* Subdescription */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-slate-500 dark:text-slate-400 text-[14px] leading-relaxed max-w-md mx-auto mb-8 font-medium"
        >
          The page you are looking for has been recycled, moved, or swept away by our cleanliness crew. Let's get you back to the community dashboard!
        </motion.p>

        {/* Shortcut Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8"
        >
          <button
            onClick={() => navigate("/issues")}
            className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-[#0a120e] hover:bg-slate-100 dark:hover:bg-[#1e3040]/30 border border-slate-200 dark:border-[#1e3040] rounded-xl text-xs font-bold text-slate-700 dark:text-[#cbd5e1] transition-all shadow-sm cursor-pointer"
          >
            <i className="ri-alert-line text-[#f97316]" /> Active Reports
          </button>
          <button
            onClick={() => navigate("/volunteers")}
            className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-[#0a120e] hover:bg-slate-100 dark:hover:bg-[#1e3040]/30 border border-slate-200 dark:border-[#1e3040] rounded-xl text-xs font-bold text-slate-700 dark:text-[#cbd5e1] transition-all shadow-sm cursor-pointer"
          >
            <i className="ri-team-line text-[#0f766e]" /> Volunteer Drives
          </button>
          <button
            onClick={() => navigate("/forum")}
            className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-[#0a120e] hover:bg-slate-100 dark:hover:bg-[#1e3040]/30 border border-slate-200 dark:border-[#1e3040] rounded-xl text-xs font-bold text-slate-700 dark:text-[#cbd5e1] transition-all shadow-sm cursor-pointer"
          >
            <i className="ri-discuss-line text-[#9333ea]" /> Discussions
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-[#0a120e] hover:bg-slate-100 dark:hover:bg-[#1e3040]/30 border border-slate-200 dark:border-[#1e3040] rounded-xl text-xs font-bold text-slate-700 dark:text-[#cbd5e1] transition-all shadow-sm cursor-pointer"
          >
            <i className="ri-trophy-line text-[#d4af37]" /> Leaderboard
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 border border-slate-200 dark:border-[#1e3040] hover:bg-slate-100 dark:hover:bg-[#1e3040] text-slate-700 dark:text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer uppercase tracking-wider"
          >
            <i className="ri-arrow-left-line mr-1" /> Go Back
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full sm:w-auto px-6 py-3 bg-[#0f766e] hover:bg-[#0d645d] text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-teal-500/20 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <i className="ri-home-5-line mr-1" /> Return Home
          </button>
        </motion.div>

      </div>
    </div>
  );
}
