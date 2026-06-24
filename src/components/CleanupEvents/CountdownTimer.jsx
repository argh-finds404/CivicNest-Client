import React, { useState, useEffect } from'react';

export default function CountdownTimer({ targetDate, compact = false }) {
 const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

 useEffect(() => {
 const interval = setInterval(() => {
 setTimeLeft(getTimeLeft(targetDate));
 }, 1000);
 return () => clearInterval(interval);
 }, [targetDate]);

 if (timeLeft.total <= 0) {
 return (
 <div className="text-xs font-bold text-green-600 dark:text-green-400">
 🟢 Happening Now
 </div>
 );
 }

 if (compact) {
 // Card version — 4 numbers in a row
 return (
 <div className="flex gap-2">
 {[
 { value: timeLeft.days, label:'days'},
 { value: timeLeft.hours, label:'hrs'},
 { value: timeLeft.minutes, label:'min'},
 { value: timeLeft.seconds, label:'sec'},
 ].map(({ value, label }) => (
 <div key={label} className="flex flex-col items-center">
 <span
 className="text-[13px] tracking-tight font-bold text-teal-600 dark:text-teal-400 tabular-nums leading-none"style={{ fontFamily:'ArenaTitle, monospace'}}
 >
 {String(value).padStart(2,'0')}
 </span>
 <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
 {label}
 </span>
 </div>
 ))}
 </div>
 );
 }

 // Full version — for event detail page hero
 return (
 <div className="flex gap-4 justify-center">
 {[
 { value: timeLeft.days, label:'Days'},
 { value: timeLeft.hours, label:'Hours'},
 { value: timeLeft.minutes, label:'Minutes'},
 { value: timeLeft.seconds, label:'Seconds'},
 ].map(({ value, label }, i) => (
 <div key={label} className="flex flex-col items-center">
 <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center">
 <span
 className="text-4xl tracking-tight font-bold text-white tabular-nums"style={{ fontFamily:'ArenaTitle, monospace'}}
 >
 {String(value).padStart(2,'0')}
 </span>
 </div>
 <span className="text-xs text-white/70 uppercase tracking-wider mt-2">{label}</span>
 </div>
 ))}
 </div>
 );
}

function getTimeLeft(targetDate) {
 const total = new Date(targetDate) - new Date();
 if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

 return {
 total,
 days: Math.floor(total / (1000 * 60 * 60 * 24)),
 hours: Math.floor((total / (1000 * 60 * 60)) % 24),
 minutes: Math.floor((total / (1000 * 60)) % 60),
 seconds: Math.floor((total / 1000) % 60),
 };
}
