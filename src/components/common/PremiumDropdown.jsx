import React, { useState, useRef, useEffect } from'react';
import { motion, AnimatePresence } from'framer-motion';

const PremiumDropdown = ({ options, value, onChange, placeholder, icon, menuClassName =''}) => {
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef(null);

 const selectedOption = options.find(opt => opt.value === value);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 return (
 <div className="relative"ref={dropdownRef}>
 <button 
 type="button"onClick={() => setIsOpen(!isOpen)}
 className={`flex items-center justify-between w-full h-12 px-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border rounded-lg transition-all duration-200 outline-none ${isOpen ?'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-[#40826D] ring-2 ring-[#9FE2BF]/40':'border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]'}`}
 >
 <div className="flex items-center gap-2 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-medium text-[13px] min-w-0">
 {(selectedOption?.icon || icon) && (
 <i className={`${selectedOption?.icon || icon} text-[#0f766e] shrink-0 text-[13px]`} />
 )}
 <span className="truncate">
 {selectedOption ? selectedOption.label : placeholder}
 </span>
 </div>
 <motion.i 
 animate={{ rotate: isOpen ? 180 : 0 }} 
 className="ri-arrow-down-s-line text-slate-400 ml-2 text-[13px] leading-none"></motion.i>
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -10, scale: 0.95 }}
 transition={{ duration: 0.15, ease:"easeOut"}}
 className={`absolute z-50 w-full mt-2 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/95 backdrop-blur-md border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] rounded-lg shadow-xl py-1 overflow-hidden ${menuClassName}`}
 >
 <div className="max-h-64 overflow-y-auto custom-scrollbar"data-lenis-prevent="true">
 {options.map((option) => (
 <button
 key={option.value}
 type="button"onClick={() => {
 onChange(option.value);
 setIsOpen(false);
 }}
 className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors flex items-center justify-between gap-2 ${value === option.value ?'text-[#0f766e] font-bold bg-emerald-50/80':'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] hover:text-slate-900 dark:text-white font-medium'}`}
 >
 <span className="flex items-center gap-2 min-w-0">
 {option.icon && (
 <i className={`${option.icon} text-[13px] shrink-0 ${value === option.value ?'text-[#0f766e]':'text-slate-400'}`} />
 )}
 {option.label}
 </span>
 {value === option.value && <i className="ri-check-line text-[#0f766e] text-[13px] leading-none shrink-0"></i>}
 </button>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
};

export default PremiumDropdown;
