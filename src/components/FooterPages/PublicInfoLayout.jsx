import React, { useState } from'react';

/** Local assets — always available from /public */
export const PUBLIC_PAGE_IMAGES = {
 story:'/banner2.jpg',
 program1:'/banner3.jpg',
 program2:'/banner2.jpg',
 program3:'/banner4.png',
 program4:'/banner3.jpg',
 gallery: ['/banner2.jpg','/banner3.jpg','/banner4.png','/banner2.jpg'],
};

export function SafeImage({ src, alt, className, fallback ='/banner2.jpg'}) {
 const [current, setCurrent] = useState(src);
 return (
 <img
 src={current}
 alt={alt}
 className={className}
 loading="lazy"onError={() => {
 if (current !== fallback) setCurrent(fallback);
 }}
 />
 );
}

export function PublicInfoHero({ badge, badgeIcon, title, subtitle, children }) {
 return (
 <header className="relative bg-[#0f172a] text-white pt-32 pb-24 px-6 overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
 <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-500/40 blur-[100px]"/>
 <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal-400/40 blur-[100px]"/>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/30 blur-[120px]"/>
 </div>
 <div className="relative z-10 mx-auto max-w-3xl text-center">
 {badge && (
 <span className="mb-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-[13px] font-bold tracking-[0.1em] uppercase shadow-2xl text-emerald-300">
 {badgeIcon && <i className={`${badgeIcon} text-[13px]`} />}
 {badge}
 </span>
 )}
 <h1 className="text-4xl tracking-tight font-black tracking-tight text-white md:text-5xl tracking-tight lg:text-6xl mb-6">
 {title}
 </h1>
 {subtitle && (
 <p className="mx-auto mt-4 max-w-2xl text-[13px] leading-relaxed text-slate-300 md:text-[13px] tracking-tight font-medium">
 {subtitle}
 </p>
 )}
 {children}
 </div>
 </header>
 );
}

export function SectionIcon({ icon, tone ='teal'}) {
 const tones = {
 teal:'bg-teal-100 text-teal-700 border-teal-200/60',
 amber:'bg-amber-50 text-amber-700 border-amber-200/60',
 slate:'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60',
 rose:'bg-rose-50 text-rose-700 border-rose-200/60',
 };
 return (
 <span
 className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tones[tone] || tones.teal}`}
 >
 <i className={`${icon} text-[13px] tracking-tight`} />
 </span>
 );
}

export function SectionNav({ sections, activeId, onSelect }) {
 return (
 <nav
 className="mb-8 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-3 shadow-sm"aria-label="Page sections">
 <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
 On this page
 </p>
 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
 {sections.map((s) => {
 const isActive = activeId === s.id;
 return (
 <a
 key={s.id}
 href={`#${s.id}`}
 onClick={() => onSelect?.(s.id)}
 className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
 isActive
 ?'bg-teal-600 text-white shadow-sm':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-800'}`}
 >
 {s.icon && <i className={`${s.icon} text-[13px]`} />}
 <span className="whitespace-nowrap">{s.shortLabel || s.title}</span>
 </a>
 );
 })}
 </div>
 </nav>
 );
}
