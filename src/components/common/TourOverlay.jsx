import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const TOUR_STEPS = [
  {
    step: 1,
    selector: '#tour-nav-issues',
    mobileSelector: '#tour-nav-drawer-toggle', // Fallback for mobile if desktop nav is hidden
    title: '1. Report & Browse Issues',
    text: 'Report cleanliness issues, track active reports, and verify solved incidents. Members receive 3 issue credits every 72 hours.',
    action: 'close-drawer'
  },
  {
    step: 2,
    selector: '#tour-drawer-map',
    mobileSelector: '#tour-drawer-map',
    title: '2. Interactive Cleanliness Map',
    text: 'Browse litter reports, feeding drives, and lost & found listings live. Click points on the map to inspect nearby tasks.',
    action: 'open-drawer'
  },
  {
    step: 3,
    selector: '#tour-nav-volunteers',
    mobileSelector: '#tour-nav-drawer-toggle',
    title: '3. Volunteer Hub',
    text: 'Register as a volunteer to claim double points (2x multiplier) on all cleanup reports, verifications, and drives.',
    action: 'close-drawer'
  },
  {
    step: 4,
    selector: '#tour-drawer-leaderboard',
    mobileSelector: '#tour-drawer-leaderboard',
    title: '4. Community Leaderboard',
    text: 'Check out the top-performing neighbors and active contributors. Climb the ranks by participating in civic drives.',
    action: 'open-drawer'
  },
  {
    step: 5,
    selector: '#tour-drawer-threads',
    mobileSelector: '#tour-drawer-threads',
    title: '5. Discussion Forum',
    text: 'Participate in neighborhood discussion channels, start new threads, and collaborate on local cleanliness plans.',
    action: 'open-drawer'
  },
  {
    step: 6,
    selector: '#tour-nav-profile',
    mobileSelector: '#tour-nav-profile',
    title: '6. Profile & Streak Dashboard',
    text: 'Manage your reports, see your LeetCode-style contribution grid, and track your daily streak to earn recognition badges.',
    action: 'close-drawer'
  }
];

export default function TourOverlay() {
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [coords, setCoords] = useState(null);
  const [drawerState, setDrawerState] = useState(false); // Track drawer open state to trigger recalculations

  // Check if tour should run (user logged in and tour not completed)
  useEffect(() => {
    if (user) {
      const tourDone = localStorage.getItem('tour_done');
      if (tourDone !== 'true') {
        setIsActive(true);
        setCurrentStepIndex(0);
      }
    } else {
      setIsActive(false);
    }
  }, [user]);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Dispatch events to control drawer state and recalculate coordinates
  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Handle drawer open/close custom events based on the step spec
    if (currentStep.action === 'open-drawer') {
      window.dispatchEvent(new Event('tour:open-drawer'));
      setDrawerState(true);
    } else if (currentStep.action === 'close-drawer') {
      window.dispatchEvent(new Event('tour:close-drawer'));
      setDrawerState(false);
    }

    const updateCoords = () => {
      // Find element (check selector, then mobileSelector, then fallback to document body if neither is found)
      let el = document.querySelector(currentStep.selector);
      
      // If desktop element is not visible or doesn't exist, try mobile selector
      if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) {
        el = document.querySelector(currentStep.mobileSelector);
      }

      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        });
      } else {
        // Fallback: place in the center of the screen
        setCoords({
          top: window.innerHeight / 2 - 40,
          left: window.innerWidth / 2 - 40,
          width: 80,
          height: 80,
          isFallback: true
        });
      }
    };

    // Calculate coordinates immediately
    updateCoords();

    // Re-verify after drawer transitions
    const t1 = setTimeout(updateCoords, 150);
    const t2 = setTimeout(updateCoords, 450);

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, { passive: true });
    
    // Listen for custom events where drawer toggling has finished
    const drawerHandler = () => {
      setTimeout(updateCoords, 250);
    };
    window.addEventListener('tour:drawer-toggled', drawerHandler);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('tour:drawer-toggled', drawerHandler);
    };
  }, [currentStepIndex, isActive, drawerState]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('tour_done', 'true');
    window.dispatchEvent(new Event('tour:close-drawer'));
    setIsActive(false);
  };

  if (!isActive || !coords) return null;

  // Calculate tooltip placement card coordinates
  const tooltipStyle = {};
  if (coords.isFallback) {
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  } else {
    // Standard tooltip layout algorithm
    const spacing = 12;
    const tooltipWidth = 320;
    
    // Determine if it fits better on bottom or top
    if (coords.bottom + 250 < window.innerHeight) {
      // Position below the element
      tooltipStyle.top = `${coords.bottom + spacing}px`;
      tooltipStyle.left = `${Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, coords.left + coords.width / 2 - tooltipWidth / 2))}px`;
    } else {
      // Position above the element
      tooltipStyle.bottom = `${window.innerHeight - coords.top + spacing}px`;
      tooltipStyle.left = `${Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, coords.left + coords.width / 2 - tooltipWidth / 2))}px`;
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dark backdrop with hole cutout (SVG Mask) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{ mixBlendMode: 'multiply' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {coords && (
              <rect
                x={coords.left - 6}
                y={coords.top - 6}
                width={coords.width + 12}
                height={coords.height + 12}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(5, 10, 8, 0.75)"
          mask="url(#spotlight-mask)"
          onClick={handleSkip}
          className="cursor-pointer"
        />
      </svg>

      {/* Spotlight Ring (Animated Glowing Border) */}
      <AnimatePresence>
        {!coords.isFallback && (
          <motion.div
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="absolute border-2 border-teal-400 dark:border-teal-400 rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.5)] z-[10000] pointer-events-none"
            style={{
              top: coords.top - 6,
              left: coords.left - 6,
              width: coords.width + 12,
              height: coords.height + 12
            }}
          />
        )}
      </AnimatePresence>

      {/* Onboarding Tooltip Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute w-[320px] bg-white dark:bg-[#0a120e] border border-slate-200 dark:border-[#14241d] border-l-4 border-l-[#0f766e] dark:border-l-teal-500 rounded-r-2xl rounded-l-md shadow-2xl p-5 pointer-events-auto z-[10001] flex flex-col gap-3.5"
        style={tooltipStyle}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#0f766e] dark:text-teal-400">
            Step {currentStep.step} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-[10px] uppercase font-extrabold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 tracking-wider transition-colors"
          >
            Skip Tour
          </button>
        </div>

        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-[12.5px] leading-relaxed mt-1.5 font-medium">
            {currentStep.text}
          </p>
        </div>

        <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100 dark:border-[#14241d]/50">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-[#0f766e] hover:bg-[#0c5c56] dark:bg-teal-650 dark:hover:bg-teal-700 text-white font-extrabold text-xs rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
