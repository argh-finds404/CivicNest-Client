import React from'react';
import { motion } from'framer-motion';
import { Player } from'@lottiefiles/react-lottie-player';

const GlobalLoader = () => {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center  dark:bg-[#0b1215]/80 /80 backdrop-blur-sm fixed inset-0 z-[9999]">
 <div className="relative flex items-center justify-center w-32 h-32 mb-6">
 <Player
 src="/lottie/loader.json"loop
 autoplay
 style={{ width:'120px', height:'120px'}}
 />
 </div>
 
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="text-center">
 <h2 className="text-[13px] tracking-tight font-black text-slate-800 dark:text-white tracking-tight">Civic<span className="text-[#40826D]">Nest</span></h2>
 <div className="flex items-center justify-center gap-1 mt-2 text-slate-500 dark:text-slate-300 font-medium text-[13px]">
 <span>Loading</span>
 <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
 <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>.</motion.span>
 <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>.</motion.span>
 </div>
 </motion.div>
 </div>
 );
};

export default GlobalLoader;
