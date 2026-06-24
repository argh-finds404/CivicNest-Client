import React from'react';

const statusConfig = {"open": { label:"Open", color:"bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-500 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]", icon:"ri-lock-unlock-line"},"pending": { label:"Pending", color:"bg-yellow-50 text-yellow-600 border-yellow-200", icon:"ri-time-line"},"in_review": { label:"In Review", color:"bg-blue-50 text-blue-600 border-blue-200", icon:"ri-search-eye-line"},"action_taken": { label:"Action Taken", color:"bg-orange-50 text-orange-600 border-orange-200", icon:"ri-tools-line"},"solved": { label:"Solved", color:"bg-green-50 text-green-600 border-green-200", icon:"ri-check-line"},"rejected": { label:"Rejected", color:"bg-red-50 text-red-600 border-red-200", icon:"ri-close-line"}
};

const StatusBadge = ({ status }) => {
 const config = statusConfig[status] || statusConfig["open"];

 return (
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color} uppercase tracking-wider`}>
 <i className={config.icon}></i>
 {config.label}
 </span>
 );
};

export default StatusBadge;
