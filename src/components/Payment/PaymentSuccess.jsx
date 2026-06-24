import React from'react';
import { useNavigate, useLocation } from'react-router';
import { motion } from'framer-motion';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const state = location.state || {};

 React.useEffect(() => {
   window.scrollTo(0, 0);
   if (window.lenis) {
     window.lenis.scrollTo(0, { immediate: true });
   }

   // 1. Initial immediate satisfying center burst
   confetti({
     particleCount: 120,
     spread: 70,
     origin: { y: 0.6 },
     colors: ['#0f766e', '#14b8a6', '#34d399', '#60a5fa', '#f59e0b']
   });

   // 2. Continuous premium side-cannons for a few seconds
   const duration = 2 * 1000;
   const end = Date.now() + duration;

   const frame = () => {
     // Left cannon
     confetti({
       particleCount: 3,
       angle: 60,
       spread: 55,
       origin: { x: 0, y: 0.85 },
       colors: ['#0f766e', '#14b8a6', '#34d399']
     });
     // Right cannon
     confetti({
       particleCount: 3,
       angle: 120,
       spread: 55,
       origin: { x: 1, y: 0.85 },
       colors: ['#0f766e', '#14b8a6', '#60a5fa']
     });

     if (Date.now() < end) {
       requestAnimationFrame(frame);
     }
   };

   const timer = setTimeout(() => {
     frame();
   }, 400);

   return () => clearTimeout(timer);
 }, []);

 return (
 <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="max-w-md w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl p-5 sm:p-10 shadow-xl shadow-slate-200/50 text-center border border-slate-100">
 <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
 <i className="ri-check-line text-5xl tracking-tight"></i>
 </div>
 
 <h1 className="text-3xl tracking-tight font-black text-slate-800 dark:text-white mb-2 tracking-tight">Thank You!</h1>
 <p className="text-slate-500 dark:text-slate-300 font-medium mb-8">
 Your donation has been successfully recorded. Your support makes a real difference in our community.
 </p>

 <div className="space-y-3">
 <button 
 onClick={() => navigate('/')}
 className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-slate-900/20">
 Return to Dashboard
 </button>
 <button 
 onClick={() => navigate(-1)}
 className="w-full py-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors">
 Go Back
 </button>
 </div>
 </motion.div>
 </div>
 );
};

export default PaymentSuccess;
