import React from'react';
import { motion } from'framer-motion';

const MinimalLoader = ({ size ="md", color ="#40826D"}) => {
 const sizes = {
 sm:"w-1.5 h-1.5",
 md:"w-2.5 h-2.5",
 lg:"w-4 h-4",
 xl:"w-5 h-5"};

 const dotSize = sizes[size] || sizes.md;

 const containerVariants = {
 start: {
 transition: { staggerChildren: 0.15 }
 },
 end: {
 transition: { staggerChildren: 0.15 }
 }
 };

 const dotVariants = {
 start: { y:"0%"},
 end: { y:"-100%"}
 };

 const dotTransition = {
 duration: 0.4,
 repeat: Infinity,
 repeatType:"reverse",
 ease:"easeInOut"};

 return (
 <div className="flex items-center justify-center">
 <motion.div 
 className="flex gap-2"variants={containerVariants}
 initial="start"animate="end">
 <motion.span 
 className={`${dotSize} rounded-full`} 
 style={{ backgroundColor: color }} 
 variants={dotVariants} 
 transition={dotTransition} 
 />
 <motion.span 
 className={`${dotSize} rounded-full`} 
 style={{ backgroundColor: color }} 
 variants={dotVariants} 
 transition={dotTransition} 
 />
 <motion.span 
 className={`${dotSize} rounded-full`} 
 style={{ backgroundColor: color }} 
 variants={dotVariants} 
 transition={dotTransition} 
 />
 </motion.div>
 </div>
 );
};

export default MinimalLoader;
