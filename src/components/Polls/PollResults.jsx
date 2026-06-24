import React from'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from'recharts';
import { useTheme } from'../../hooks/useTheme';

const COLORS = ['#0f766e','#10b981','#14b8a6','#059669','#047857'];

export default function PollResults({ poll }) {
 const { isDark } = useTheme();
 const chartData = poll.options
 .map(option => ({
 name: option.text,
 votes: option.votes,
 percentage: poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
 }))
 .sort((a, b) => b.votes - a.votes); // Sort by votes descending

 return (
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] overflow-hidden">
 <div className="p-4 border-b border-slate-100">
 <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Poll Results</h3>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mb-4">{poll.question}</p>
 <div className="text-xs font-semibold text-slate-400">
 Total Votes: {poll.totalVotes}
 </div>
 </div>

 <div className="p-4">
 <div className="h-64">
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
 <CartesianGrid strokeDasharray="3 3"stroke={isDark ?"#1e3040":"#e2e8f0"} vertical={false} />
 <XAxis 
 dataKey="name"tick={{ fontSize: 11, fill:'#64748b', width: 100 }}
 tickLine={false}
 axisLine={false}
 angle={-45}
 textAnchor="end"height={60}
 interval={0}
 />
 <YAxis 
 tick={{ fontSize: 12, fill:'#64748b'}}
 tickLine={false}
 axisLine={false}
 width={40}
 />
 <Tooltip 
 formatter={(value, name) => [`${value} votes (${chartData.find(d => d.name === name)?.percentage || 0}%)`,
 name
 ]}
 contentStyle={{
 backgroundColor: isDark ?'#111c21':'#1e293b',
 border: isDark ?'1px solid #1e3040':'none',
 borderRadius:'8px',
 color:'#fff',
 fontSize:'12px',
 padding:'8px 12px'}}
 />
 <Bar dataKey="votes"radius={[4, 4, 0, 0]}>
 {chartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>

 {/* Vote Breakdown Table */}
 <div className="mt-6 space-y-3">
 {chartData.map((option, index) => (
 <div key={option.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg">
 <div className="flex items-center gap-3 flex-1">
 <div 
 className="w-3 h-3 rounded-full"style={{ backgroundColor: COLORS[index % COLORS.length] }}
 />
 <span className="text-[13px] font-medium text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] line-clamp-1">
 {option.name}
 </span>
 </div>
 <div className="flex items-center gap-4">
 <span className="text-[13px] font-bold text-slate-900 dark:text-white">
 {option.votes}
 </span>
 <span className="text-[13px] font-semibold text-[--g-600]">
 {option.percentage}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}