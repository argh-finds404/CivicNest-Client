import React from'react';

const categoryConfig = {"Garbage & Waste": { color:"bg-amber-100 text-amber-800", icon:"ri-delete-bin-line"},"Road Damage": { color:"bg-red-100 text-red-800", icon:"ri-road-map-line"},"Waterlogging": { color:"bg-blue-100 text-blue-800", icon:"ri-water-flash-line"},"Illegal Construction": { color:"bg-orange-100 text-orange-800", icon:"ri-building-line"},"Broken Public Property": { color:"bg-purple-100 text-purple-800", icon:"ri-hammer-line"},"Utility Problems": { color:"bg-yellow-100 text-yellow-800", icon:"ri-lightbulb-flash-line"},"Social Problems": { color:"bg-pink-100 text-pink-800", icon:"ri-group-line"},"Environmental Issues": { color:"bg-green-100 text-green-800", icon:"ri-leaf-line"},"Safety & Crime": { color:"bg-gray-200 text-gray-900 dark:text-white", icon:"ri-shield-keyhole-line"},"Community Norms": { color:"bg-indigo-100 text-indigo-800", icon:"ri-file-list-3-line"},"Custom": { color:"bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]", icon:"ri-price-tag-3-line"}
};

const FlairPill = ({ category, customFlair }) => {
 const config = categoryConfig[category] || categoryConfig["Custom"];
 const displayLabel = category ==="Custom"&& customFlair ? customFlair : category;

 return (
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
 <i className={config.icon}></i>
 {displayLabel}
 </span>
 );
};

export default FlairPill;
