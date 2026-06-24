import React, { useEffect, useState } from'react';
import { useNavigation } from'react-router';
import { motion, AnimatePresence } from'framer-motion';

const TopProgressBar = () => {
 const navigation = useNavigation();
 const [progress, setProgress] = useState(0);

 const isLoading = navigation.state ==='loading';

 useEffect(() => {
 let interval;
 if (isLoading) {
 setProgress(10);
 interval = setInterval(() => {
 setProgress((prev) => {
 if (prev >= 90) {
 clearInterval(interval);
 return 90;
 }
 return prev + Math.random() * 10;
 });
 }, 200);
 } else {
 setProgress(100);
 const timeout = setTimeout(() => setProgress(0), 400);
 return () => clearTimeout(timeout);
 }

 return () => {
 if (interval) clearInterval(interval);
 };
 }, [isLoading]);

 return (
 <AnimatePresence>
 {progress > 0 && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
 <motion.div
 className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.7)]"initial={{ width:'0%'}}
 animate={{ width:`${progress}%`}}
 transition={{ ease:'easeInOut', duration: 0.2 }}
 />
 </motion.div>
 )}
 </AnimatePresence>
 );
};

export default TopProgressBar;
