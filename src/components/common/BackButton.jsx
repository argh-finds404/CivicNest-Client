import React from'react';
import { useNavigate } from'react-router';

export default function BackButton({ className ='', variant ='dark', children }) {
 const navigate = useNavigate();

 const baseStyles ="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-[13px] transition-all duration-300 shadow-sm select-none cursor-pointer z-50 active:scale-[0.97] hover:shadow-md w-max";
 
 const variants = {
  light:"bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 backdrop-blur-md",
  dark:"bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] hover:border-[#40826D] hover:text-[#40826D] dark:hover:border-emerald-500 dark:hover:text-emerald-400"};

 return (
 <button
 type="button"onClick={() => navigate(-1)}
 className={`${baseStyles} ${variants[variant]} ${className}`}
 title="Go Back">
 <i className="ri-arrow-left-line text-[15px] group-hover:-translate-x-1.5 transition-transform duration-300 ease-out"></i>
 {children || <span className="tracking-tight">Return to Previous</span>}
 </button>
 );
}
