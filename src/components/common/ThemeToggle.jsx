import { motion } from'framer-motion';
import { useTheme } from'../../hooks/useTheme';

export default function ThemeToggle({ className =''}) {
 const { isDark, toggle } = useTheme();

 return (
 <button
 onClick={toggle}
 aria-label={isDark ?'Switch to light mode':'Switch to dark mode'}
 className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 ${
 isDark ?'bg-[#0f766e]':'bg-slate-200'} ${className}`}
 >
 <motion.div
 layout
 transition={{ type:'spring', stiffness: 700, damping: 30 }}
 className="w-6 h-6 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-full flex items-center justify-center shadow-md overflow-hidden"style={{ x: isDark ? 24 : 0 }}
 >
 <motion.span
 initial={false}
 animate={{
 rotate: isDark ? 0 : -90,
 opacity: isDark ? 1 : 0,
 scale: isDark ? 1 : 0.5,
 }}
 transition={{ duration: 0.2 }}
 className="material-symbols-outlined text-[14px] text-[#0f766e] absolute">
 dark_mode
 </motion.span>
 
 <motion.span
 initial={false}
 animate={{
 rotate: isDark ? 90 : 0,
 opacity: isDark ? 0 : 1,
 scale: isDark ? 0.5 : 1,
 }}
 transition={{ duration: 0.2 }}
 className="material-symbols-outlined text-[14px] text-amber-500 absolute">
 light_mode
 </motion.span>
 </motion.div>
 </button>
 );
}
