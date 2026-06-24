import React from'react';
import { motion } from'framer-motion';
import { useQuery } from'@tanstack/react-query';
import useAxiosPublic from'../../hooks/useAxiosPublic';

export default function PressKit() {
 const axiosPublic = useAxiosPublic();

 const { data: statsData } = useQuery({
 queryKey: ['publicStats'],
 queryFn: async () => {
 const res = await axiosPublic.get('/public/stats');
 return res.data.data;
 }
 });

 const assets = [
 { title:'Primary Logo', format:'PNG', size:'1.2 MB', bg:'bg-emerald-500'},
 { title:'Secondary Logo', format:'SVG', size:'45 KB', bg:'bg-[#0f766e]'},
 { title:'Brand Guidelines', format:'PDF', size:'3.4 MB', bg:'bg-slate-800'},
 { title:'Campaign Assets', format:'ZIP', size:'12 MB', bg:'bg-blue-600'},
 ];

 return (
 <div className="min-h-screen w-full bg-[#f8fafc] font-body pb-24">
 {/* Hero Section */}
 <div className="bg-[#0f172a] text-white pt-32 pb-24 px-6 relative overflow-hidden">
 {/* Abstract Background Elements */}
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
 <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-gradient-to-r from-emerald-900/40 to-transparent blur-3xl transform rotate-12"></div>
 <div className="absolute top-[20%] -right-[10%] w-[60%] h-[120%] bg-gradient-to-l from-teal-900/40 to-transparent blur-3xl transform -rotate-12"></div>
 </div>

 <div className="max-w-4xl mx-auto relative z-10 text-center">
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.6, ease:"easeOut"}}
 className="inline-block bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase text-emerald-400 mb-8 shadow-2xl">
 Media & Resources
 </motion.div>
 <motion.h1
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.1, ease:"easeOut"}}
 className="text-5xl tracking-tight md:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
 CivicNest <br className="md:hidden"/>
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Press Kit</span>
 </motion.h1>
 <motion.p
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2, ease:"easeOut"}}
 className="text-[13px] md:text-2xl tracking-tight text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
 Everything you need to write about, feature, or partner with CivicNest. Discover our story and download official brand assets.
 </motion.p>
 </div>
 </div>

 <div className="max-w-6xl mx-auto px-6 mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-5">
 
 {/* Main Content Area */}
 <div className="lg:col-span-8 space-y-8">
 
 {/* Mission Block */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] p-10 md:p-14 shadow-xl shadow-slate-200/40 border border-slate-100">
 <h2 className="text-[13px] font-bold tracking-widest uppercase text-emerald-600 mb-6">Our Mission</h2>
 <p className="text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-relaxed text-[13px] tracking-tight md:text-2xl tracking-tight font-medium">
 CivicNest was founded on a simple principle: communities thrive when citizens are empowered to take care of their shared spaces. 
 <br /><br />
 <span className="text-slate-500 dark:text-slate-300 text-[13px] md:text-[13px] tracking-tight font-normal">We provide a digital sanctuary that connects local governments, NGOs, and passionate individuals to tackle urban cleanliness, environmental sustainability, and community well-being.</span>
 </p>
 </motion.div>

 {/* Brand Assets */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] p-10 md:p-14 shadow-xl shadow-slate-200/40 border border-slate-100">
 <h2 className="text-[13px] font-bold tracking-widest uppercase text-emerald-600 mb-8">Brand Assets</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {assets.map((asset, i) => (
 <div key={asset.title} className="group relative bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] rounded-lg p-4 border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
 <div className={`w-12 h-12 rounded-xl ${asset.bg} mb-6 flex items-center justify-center text-white shadow-inner`}>
 <span className="material-symbols-outlined text-[24px]">folder_zip</span>
 </div>
 <h3 className="font-bold text-slate-900 dark:text-white text-[13px] mb-1 tracking-tight">{asset.title}</h3>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mb-6 font-medium">{asset.format} • {asset.size}</p>
 
 <button className="flex items-center gap-2 text-[13px] font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors w-full justify-between">
 Download Asset
 <span className="material-symbols-outlined text-[20px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
 </button>
 </div>
 ))}
 </div>
 </motion.div>
 </div>

 {/* Sidebar */}
 <div className="lg:col-span-4 space-y-8">
 
 {/* Quick Facts Dashboard Widget */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="bg-slate-900 rounded-[2rem] p-5 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
 <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
 
 <h3 className="text-[13px] font-bold tracking-widest uppercase text-emerald-400 mb-8">At a Glance</h3>
 
 <div className="space-y-6">
 <div>
 <p className="text-slate-400 text-[13px] font-medium mb-1">Active Members</p>
 <p className="text-4xl tracking-tight font-black tracking-tight">{statsData ? statsData.activeMembers.toLocaleString() :'...'}</p>
 </div>
 <div className="h-px w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10"></div>
 <div>
 <p className="text-slate-400 text-[13px] font-medium mb-1">Total Issues Solved</p>
 <p className="text-4xl tracking-tight font-black tracking-tight">{statsData ? statsData.issuesResolved.toLocaleString() :'...'}</p>
 </div>
 <div className="h-px w-full bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/10"></div>
 <div>
 <p className="text-slate-400 text-[13px] font-medium mb-1">Founded & HQ</p>
 <p className="text-[13px] tracking-tight font-bold tracking-tight">2024 • Dhaka, BD</p>
 </div>
 </div>
 </motion.div>

 {/* Contact Section */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] p-5 shadow-xl shadow-slate-200/40 border border-slate-100">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Media Contact</h3>
 <p className="text-[13px] text-slate-500 dark:text-slate-300 mb-8 leading-relaxed font-medium">
 For press inquiries, interviews, or additional materials, reach out directly.
 </p>
 
 <div className="flex flex-col gap-3">
 <a href="mailto:press@civicnest.com"className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-sm text-orange-500 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-rose-500 group-hover:text-white transition-all">
 <span className="material-symbols-outlined text-[22px]">mail</span>
 </div>
 <div>
 <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-orange-700 transition-colors">Email Us</p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-300">press@civicnest.com</p>
 </div>
 </div>
 <span className="material-symbols-outlined text-slate-400 group-hover:text-orange-500 transition-colors">chevron_right</span>
 </a>

 <a href="https://wa.me/01304305261"target="_blank"rel="noopener noreferrer"className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-sm text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
 <span className="material-symbols-outlined text-[22px]">chat</span>
 </div>
 <div>
 <p className="text-[13px] font-bold text-slate-900 dark:text-white">WhatsApp</p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Connect instantly</p>
 </div>
 </div>
 <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 transition-colors">chevron_right</span>
 </a>

 <a href="tel:01304305261"className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border border-slate-100 rounded-lg hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] transition-all cursor-pointer">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] shadow-sm text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
 <span className="material-symbols-outlined text-[22px]">call</span>
 </div>
 <div>
 <p className="text-[13px] font-bold text-slate-900 dark:text-white">Call Us</p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Direct phone line</p>
 </div>
 </div>
 <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-800 dark:text-white transition-colors">chevron_right</span>
 </a>
 </div>
 </motion.div>

 </div>
 </div>
 </div>
 );
}
