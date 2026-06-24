import React from'react';

// Used on both card and profile page
export default function VerifiedBadge({ status }) {
 if (status ==='verified') return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider rounded-full border border-teal-200 dark:border-teal-800">
 <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
 Verified
 </span>
 );
 if (status ==='pending') return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200 dark:border-amber-800">
 <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
 ⏳ Pending
 </span>
 );
 return null;
}
