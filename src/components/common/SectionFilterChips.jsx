import React from'react';
import { motion } from'framer-motion';

// props: chips (array of {label, value, icon}), value, onChange
export default function SectionFilterChips({ chips, value, onChange }) {
 // Use a stable, unique layoutId key per component instance to avoid sharing the animation across multiple filters on the same page
 const layoutIdRef = React.useRef(`activeChip-${Math.random().toString(36).substr(2, 9)}`);

 return (
 <div className="flex flex-wrap gap-2 relative">
 {chips.map(chip => {
 const isActive = value === chip.value;
 return (
 <button
 key={chip.value ||'all'}
 onClick={() => onChange(chip.value)}
 className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold
 border transition-all duration-300 cursor-pointer shadow-sm select-none z-10
 ${isActive
 ?'text-white border-transparent':'bg-emerald-50/50 border-emerald-100 text-emerald-800/85 hover:border-[var(--g-200)] hover:bg-emerald-100/40 hover:text-emerald-950'}`}
 >
 {isActive && (
 <motion.div
 layoutId={layoutIdRef.current}
 className="absolute inset-0 bg-[var(--g-600)] rounded-full shadow-md shadow-emerald-500/10 -z-10"transition={{ type:'spring', stiffness: 380, damping: 30 }}
 />
 )}
 <span className="relative z-20 flex items-center gap-1.5">
 {chip.icon && <span className="flex items-center justify-center text-[13px] flex-shrink-0">{chip.icon}</span>}
 <span>{chip.label}</span>
 </span>
 </button>
 );
 })}
 </div>
 );
}