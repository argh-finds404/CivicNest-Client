import React from'react';

// The three stats that appear in every banner. Fetched from respective /stats endpoints
export default function SectionStats({ stats }) {
  return (
    <div className="flex items-center gap-4 flex-wrap mt-6">
      {stats.map(s => (
        <div 
          key={s.label} 
          className="bg-white/10 dark:bg-white/5 border border-white/20 rounded-xl px-6 py-4 flex flex-col gap-1 min-w-[140px] backdrop-blur-md shadow-lg shadow-black/10 hover:bg-white/15 transition-all duration-300 select-none cursor-pointer"
        >
          <p className="text-3xl tracking-tight font-extrabold text-white tabular-nums font-display">
            {s.value ?? '0'}
          </p>
          <p className="text-[10px] font-extrabold text-emerald-200 dark:text-emerald-300 uppercase tracking-wider leading-none">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
