import React from"react";
import { useQuery } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import MinimalLoader from'../common/MinimalLoader.jsx';
import { jsPDF } from'jspdf';
import autoTable from'jspdf-autotable';
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 BarElement,
 Title,
 Tooltip,
 Legend as ChartLegend,
 ArcElement,
 PointElement,
 LineElement,
 Filler
} from'chart.js';
import { Bar, Doughnut, Line } from'react-chartjs-2';

ChartJS.register(
 CategoryScale,
 LinearScale,
 BarElement,
 Title,
 Tooltip,
 ChartLegend,
 ArcElement,
 PointElement,
 LineElement,
 Filler
);

ChartJS.defaults.font.family ="'HKGrotesk', sans-serif";
ChartJS.defaults.color ="#64748b";

export default function AdminStats() {
 const axiosSecure = useAxiosSecure();

 const { data: stats, isLoading: statsLoading } = useQuery({
 queryKey: ["admin-stats"],
 queryFn: async () => {
 const res = await axiosSecure.get("/admin/stats");
 return res.data;
 },
 });

 const COLORS = ['#0f766e','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#ec4899'];

 // Inject dummy data if database is empty for visual preview
 const displayTrend = (stats?.issueTrend && stats.issueTrend.length > 0) ? stats.issueTrend : [
 { name:'OPEN', Issues: 24 },
 { name:'ACTION TAKEN', Issues: 13 },
 { name:'PENDING VERIFICATION', Issues: 8 },
 { name:'SOLVED', Issues: 35 },
 { name:'REJECTED', Issues: 5 }
 ];

 const displayCategory = (stats?.categoryBreakdown && stats.categoryBreakdown.length > 0) ? stats.categoryBreakdown : [
 { name:'Waste Management', value: 45 },
 { name:'Roads & Infrastructure', value: 25 },
 { name:'Water & Sanitation', value: 15 },
 { name:'Public Safety', value: 10 },
 { name:'Other', value: 5 }
 ];

 const displayTransactions = (stats?.transactionTrend && stats.transactionTrend.length > 0) ? stats.transactionTrend : [
 { day:'Mon', amount: 1200 },
 { day:'Tue', amount: 1900 },
 { day:'Wed', amount: 1500 },
 { day:'Thu', amount: 2800 },
 { day:'Fri', amount: 2400 },
 { day:'Sat', amount: 3800 },
 { day:'Sun', amount: 4200 }
 ];

 const downloadReport = () => {
 if (!stats) return;
 const doc = new jsPDF();
 
 // Header
 doc.setFontSize(22);
 doc.setTextColor(15, 118, 110);
 doc.text("CivicNest Admin Report", 14, 20);
 doc.setFontSize(10);
 doc.setTextColor(100);
 doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
 
 // Summary Metrics
 autoTable(doc, {
 startY: 35,
 head: [['Metric','Value']],
 body: [
 ['Total Users', stats.totalUsers],
 ['Total Issues', stats.totalIssues],
 ['Open Issues', stats.openIssues],
 ['Solved Issues', stats.solvedIssues],
 ['Pending Memberships', stats.pendingRequests],
 ],
 theme:'grid',
 headStyles: { fillColor: [15, 118, 110] }
 });
 
 // Category Breakdown
 if (stats.categoryBreakdown && stats.categoryBreakdown.length > 0) {
 doc.text("Issues by Category", 14, doc.lastAutoTable.finalY + 15);
 autoTable(doc, {
 startY: doc.lastAutoTable.finalY + 20,
 head: [['Category','Count']],
 body: stats.categoryBreakdown.map(c => [c.name, c.value]),
 theme:'striped',
 headStyles: { fillColor: [59, 130, 246] }
 });
 }

 doc.save(`Admin_Report_${new Date().getTime()}.pdf`);
 };

 if (statsLoading) {
 return (
 <div className="flex justify-center items-center py-12">
 <MinimalLoader size="lg"color="#0f766e"/>
 </div>
 );
 }

 return (
 <div>
 {/* Premium Page Header */}
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-teal-500/30 border border-teal-400">
 <i className="ri-line-chart-fill text-3xl tracking-tight drop-shadow-md"></i>
 </div>
 <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-black text-slate-900 dark:text-white tracking-tight"style={{ fontFamily:'HKGrotesk'}}>Platform Overview</h1>
 <p className="text-[13px] md:text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1">Live metrics and platform health statistics.</p>
 </div>
 <button 
 onClick={downloadReport}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 w-full md:w-auto">
 <i className="ri-download-cloud-2-line text-[13px] text-teal-600"></i> Export Report
 </button>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
 {/* Total Users */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
 <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
 <i className="ri-group-fill text-3xl tracking-tight"></i>
 </div>
 <div className="flex flex-col justify-center">
 <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-300 tracking-tight mb-1">Total Users</h3>
 <p className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.totalUsers || 0}</p>
 </div>
 </div>

 {/* Total Issues */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
 <div className="w-16 h-16 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
 <i className="ri-error-warning-fill text-3xl tracking-tight"></i>
 </div>
 <div className="flex flex-col justify-center">
 <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-300 tracking-tight mb-1">Total Issues</h3>
 <p className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.totalIssues || 0}</p>
 </div>
 </div>

 {/* Pending Memberships */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
 <div className="w-16 h-16 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
 <i className="ri-user-add-fill text-3xl tracking-tight"></i>
 </div>
 <div className="flex flex-col justify-center">
 <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-300 tracking-tight mb-1">Pending Memberships</h3>
 <p className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.pendingRequests || 0}</p>
 </div>
 </div>

 {/* Money Collected */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
 <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
 <i className="ri-bank-card-fill text-3xl tracking-tight"></i>
 </div>
 <div className="flex flex-col justify-center">
 <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-300 tracking-tight mb-1">Total Funds Raised</h3>
 <p className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight">৳{stats?.totalDonations || 0}</p>
 </div>
 </div>

 {/* Total Community Events */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
 <div className="w-16 h-16 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
 <i className="ri-leaf-fill text-3xl tracking-tight"></i>
 </div>
 <div className="flex flex-col justify-center">
 <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-300 tracking-tight mb-1">Community Events</h3>
 <p className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.totalEvents || 0}</p>
 </div>
 </div>

 {/* Total Volunteers */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
 <div className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
 <i className="ri-user-heart-fill text-3xl tracking-tight"></i>
 </div>
 <div className="flex flex-col justify-center">
 <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-300 tracking-tight mb-1">Total Volunteers</h3>
 <p className="text-3xl tracking-tight font-extrabold text-slate-800 dark:text-white tracking-tight">{stats?.totalVolunteers || 0}</p>
 </div>
 </div>
 </div>

 {/* Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4 flex flex-col min-h-[350px]">
 <h4 className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-6 font-display">Issue Volume by Status <span className="text-xs font-normal text-slate-400 ml-2 font-body">(Live / Demo)</span></h4>
 <div className="flex-1 w-full h-[250px] relative">
 <Bar 
 data={{
 labels: displayTrend.map(d => d.name),
 datasets: [
 {
 label:'Issues',
 data: displayTrend.map(d => d.Issues),
 backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#14b8a6'],
 borderWidth: 0,
 borderRadius: 8,
 barPercentage: 0.6,
 hoverBackgroundColor: ['#2563eb','#059669','#d97706','#7c3aed','#dc2626','#0d9488']
 }
 ]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 animation: { duration: 1500, easing:'easeOutQuart'},
 plugins: {
 legend: { display: false },
 tooltip: {
 backgroundColor:'rgba(15, 23, 42, 0.95)',
 titleFont: { size: 12, family:"'HKGrotesk', sans-serif", weight:'normal'},
 bodyFont: { size: 15, weight:'bold', family:"'HKGrotesk', sans-serif"},
 padding: 14,
 cornerRadius: 12,
 displayColors: true,
 boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'}
 },
 scales: {
 x: { 
 grid: { display: false }, 
 ticks: { font: { family:"'HKGrotesk', sans-serif", size: 12, weight:'bold'}, color:'#475569'}, 
 border: { display: false } 
 },
 y: { 
 grid: { color:'#e2e8f0', drawBorder: false, borderDash: [5, 5] }, 
 ticks: { font: { family:"'HKGrotesk', sans-serif", size: 12, weight:'bold'}, color:'#475569', padding: 10 }, 
 border: { display: false } 
 }
 }
 }}
 />
 </div>
 </div>

 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4 flex flex-col min-h-[350px]">
 <h4 className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-6 font-display">Category Breakdown <span className="text-xs font-normal text-slate-400 ml-2 font-body">(Live / Demo)</span></h4>
 <div className="flex-1 w-full h-[250px] relative flex justify-center">
 <div className="w-[300px] h-[250px]">
 <Doughnut 
 data={{
 labels: displayCategory.map(c => c.name),
 datasets: [
 {
 data: displayCategory.map(c => c.value),
 backgroundColor: ['#0f766e','#f59e0b','#3b82f6','#ef4444','#8b5cf6'],
 borderColor:'#ffffff',
 borderWidth: 3,
 hoverOffset: 8,
 borderRadius: 4
 }
 ]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 cutout:'75%',
 animation: { duration: 1500, easing:'easeOutQuart'},
 plugins: {
 legend: {
 position:'right',
 labels: {
 usePointStyle: true,
 pointStyle:'circle',
 padding: 24,
 font: { family:"'HKGrotesk', sans-serif", size: 12, weight:'500'},
 color:'#64748b'}
 },
 tooltip: {
 backgroundColor:'rgba(15, 23, 42, 0.95)',
 titleFont: { size: 12, family:"'HKGrotesk', sans-serif", weight:'normal'},
 bodyFont: { size: 15, weight:'bold', family:"'HKGrotesk', sans-serif"},
 padding: 14,
 cornerRadius: 12,
 boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1)'}
 }
 }}
 />
 </div>
 </div>
 </div>

 {/* Transactions Line Chart */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl shadow-sm border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] p-4 flex flex-col min-h-[350px] lg:col-span-2">
 <h4 className="text-[13px] font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] mb-6 font-display">Donations & Transactions Trend <span className="text-xs font-normal text-slate-400 ml-2 font-body">(Live / Demo)</span></h4>
 <div className="flex-1 w-full h-[250px] relative">
 <Line 
 data={{
 labels: displayTransactions.map(t => t.day),
 datasets: [
 {
 label:'Transactions (৳)',
 data: displayTransactions.map(t => t.amount),
 borderColor:'#10b981',
 backgroundColor:'rgba(16, 185, 129, 0.1)',
 borderWidth: 3,
 pointBackgroundColor:'#ffffff',
 pointBorderColor:'#10b981',
 pointBorderWidth: 2,
 pointRadius: 4,
 pointHoverRadius: 6,
 fill: true,
 tension: 0.4
 }
 ]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 animation: { duration: 1500, easing:'easeOutQuart'},
 plugins: {
 legend: { display: false },
 tooltip: {
 backgroundColor:'rgba(15, 23, 42, 0.95)',
 titleFont: { size: 12, family:"'HKGrotesk', sans-serif", weight:'normal'},
 bodyFont: { size: 15, weight:'bold', family:"'HKGrotesk', sans-serif"},
 padding: 14,
 cornerRadius: 12,
 displayColors: false,
 callbacks: {
 label: function(context) {
 let label = context.dataset.label ||'';
 if (label) {
 label +=':';
 }
 if (context.parsed.y !== null) {
 label += new Intl.NumberFormat('en-US', { style:'currency', currency:'BDT'}).format(context.parsed.y);
 }
 return label;
 }
 }
 }
 },
 scales: {
 x: { 
 grid: { display: false }, 
 ticks: { font: { family:"'HKGrotesk', sans-serif", size: 12, weight:'bold'}, color:'#475569'}, 
 border: { display: false } 
 },
 y: { 
 grid: { color:'#e2e8f0', drawBorder: false, borderDash: [5, 5] }, 
 ticks: { 
 font: { family:"'HKGrotesk', sans-serif", size: 12, weight:'bold'}, 
 color:'#475569', 
 padding: 10,
 callback: function(value) {
 return'৳'+ value;
 }
 }, 
 border: { display: false } 
 }
 }
 }}
 />
 </div>
 </div>

 </div>
 </div>
 );
}
