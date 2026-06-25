import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollProgressButton() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(currentProgress);
      }

      // Show button only after scrolling down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Radial progress calculations
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-45 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgba(15,118,110,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 border border-slate-200/50 dark:border-[#1e3040]/50 bg-white/90 dark:bg-[#0a120e]/95 backdrop-blur-md"
        >
          {/* Circular Progress SVG */}
          <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 50 50">
            <circle
              className="text-slate-100 dark:text-[#14241d]"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="25"
              cy="25"
            />
            <circle
              className="text-[#0f766e] dark:text-emerald-500 transition-all duration-100"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="25"
              cy="25"
            />
          </svg>

          {/* Dynamic Content: Arrow or Percentage */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <AnimatePresence mode="wait">
              {isHovered ? (
                <motion.span
                  key="percent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="text-[10px] font-extrabold text-[#0f766e] dark:text-emerald-400 font-mono tracking-tighter"
                >
                  {Math.round(scrollProgress)}%
                </motion.span>
              ) : (
                <motion.i
                  key="arrow"
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="ri-arrow-up-line text-lg text-slate-700 dark:text-slate-200"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
