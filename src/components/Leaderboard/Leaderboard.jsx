import React from"react";
import SEO from "../common/SEO";
import { useQuery } from"@tanstack/react-query";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import { motion } from"framer-motion";
import MinimalLoader from'../common/MinimalLoader.jsx';
import PageHeader from'../common/PageHeader';
import PageArt3D from'../three/PageArt3D';
import Podium from'./Podium';
import { 
 Trophy, Crown, Medal, Award, Activity, 
 TrendingUp, Users, Star, ArrowUpRight, CheckCircle2 
} from'lucide-react';
import { 
 ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
 Tooltip, Cell, PieChart, Pie, Legend 
} from'recharts';
import { useTheme } from'../../hooks/useTheme';

const COLORS = {
 volunteer:'#10b981', // Emerald
 member:'#3b82f6', // Blue
 admin:'#f59e0b', // Amber
 guest:'#6b7280', // Gray
};

const ROLE_COLORS = ['#3b82f6','#10b981','#f59e0b','#6b7280'];

export default function Leaderboard() {
 const axiosPublic = useAxiosPublic();
 const { isDark } = useTheme();

 const { data: users = [], isLoading } = useQuery({
 queryKey: ["leaderboard"],
 queryFn: async () => {
 const res = await axiosPublic.get("/users/leaderboard");
 // Anything but a list (e.g. an error body) would crash the charts below
 return Array.isArray(res.data) ? res.data : [];
 },
 staleTime: 5 * 60 * 1000,
 });

 // Calculate dynamic stats
 const totalPoints = users.reduce((acc, curr) => acc + (curr.points || 0), 0);
 const avgPoints = users.length ? Math.round(totalPoints / users.length) : 0;
 const volunteerCount = users.filter(u => u.isVolunteer || u.role ==='volunteer').length;

 // Prepare Bar Chart Data (Top 5 earners)
 const topEarnersData = users.slice(0, 5).map(u => ({
 name: (u.name ||"Citizen").split('')[0], // First name for layout
 Points: u.points || 0
 }));

 // Prepare Pie Chart Data (Points by Role)
 const rolePointsMap = {};
 users.forEach(u => {
 const role = u.isVolunteer ?'volunteer': (u.role ||'guest');
 rolePointsMap[role] = (rolePointsMap[role] || 0) + (u.points || 0);
 });
 const pointsByRoleData = Object.keys(rolePointsMap).map(role => ({
 name: role.charAt(0).toUpperCase() + role.slice(1),
 value: rolePointsMap[role]
 }));

 const firstPlace = users[0];

 const getAchievement = (points) => {
 if (points >= 1000) return { label:"Elite Legend", style:"bg-purple-50 text-purple-700 border-purple-200"};
 if (points >= 500) return { label:"High Contributor", style:"bg-indigo-50 text-indigo-700 border-indigo-200"};
 if (points >= 200) return { label:"Active Citizen", style:"bg-emerald-50 text-emerald-700 border-emerald-200"};
 return { label:"Civic Explorer", style:"bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]"};
 };

 // Real activity/achievement log computed from users'badges & roles in DB
 const rawActivities = [];
 users.slice(0, 8).forEach((u) => {
 if (u.badges && u.badges.length > 0) {
 u.badges.forEach((badgeId) => {
 const badgeLabels = {
 first_reporter:"First Reporter badge",
 resolver:"Resolver badge",
 cleanup_crew:"Cleanup Crew badge",
 verified_volunteer:"Verified Volunteer badge",
 civic_hero:"Civic Hero status",
 guardian:"Community Guardian status",
 champion:"Champion status",
 };
 const label = badgeLabels[badgeId] ||`${badgeId.replace(/_/g,'')} badge`;
 rawActivities.push({
 id:`${u._id}-${badgeId}`,
 name: u.name ||"Anonymous Citizen",
 action:`unlocked the ${label}`,
 points: 25,
 photo: u.photoURL
 });
 });
 }
 
  if (u.isVolunteer || u.role === 'volunteer') {
    rawActivities.push({
      id: `${u._id}-volstatus`,
      name: u.name || "Anonymous Citizen",
      action: "registered as an active Community Volunteer",
      points: 10,
      photo: u.photoURL
    });
  } else if (u.role === 'guest') {
    rawActivities.push({
      id: `${u._id}-gueststatus`,
      name: u.name || "Anonymous Citizen",
      action: "joined the platform as a Guest",
      points: 0,
      photo: u.photoURL
    });
  } else {
    rawActivities.push({
      id: `${u._id}-memstatus`,
      name: u.name || "Anonymous Citizen",
      action: "joined the platform as a Community Member",
      points: 25,
      photo: u.photoURL
    });
  }
  });

 const activityLog = rawActivities.slice(0, 5);

 return (
 <div className="min-h-screen bg-[var(--cn-ground)] pb-20">
 <SEO title="Community Champions Leaderboard" />
 <PageHeader
 width="72rem"
 gutter="1.5rem"
 art={<PageArt3D model="trophy" label="A gold trophy" />}
 title="Leaderboard"
 description="Points go to neighbours who report problems, verify fixes and turn up to cleanups. Here's who's doing the most."
 meta={users.length > 0 && (
 <>
 <span><strong>{users.length}</strong> neighbours ranked</span>
 <span><strong>{totalPoints.toLocaleString()}</strong> points earned</span>
 </>
 )}
 />
 <div className="max-w-6xl mx-auto px-6 pt-10">

 {isLoading ? (
 <div className="flex justify-center py-12">
 <MinimalLoader />
 </div>
 ) : (
 <div className="space-y-12">

 {firstPlace && <Podium users={users} />}

 {/* Quick Metrics Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-4 shadow-sm">
 <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
 <Star className="w-6 h-6"/>
 </div>
 <div className="text-left">
 <span className="text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">Total Active Points</span>
 <h4 className="text-2xl tracking-tight font-black text-slate-800 dark:text-white mt-1">{totalPoints}</h4>
 </div>
 </div>
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-4 shadow-sm">
 <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
 <TrendingUp className="w-6 h-6"/>
 </div>
 <div className="text-left">
 <span className="text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">Average Points</span>
 <h4 className="text-2xl tracking-tight font-black text-slate-800 dark:text-white mt-1">{avgPoints}</h4>
 </div>
 </div>
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] flex items-center gap-4 shadow-sm">
 <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
 <Users className="w-6 h-6"/>
 </div>
 <div className="text-left">
 <span className="text-xs text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">Active Volunteers</span>
 <h4 className="text-2xl tracking-tight font-black text-slate-800 dark:text-white mt-1">{volunteerCount}</h4>
 </div>
 </div>
 </div>

 {/* Charts Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {/* Chart 1: Top Contributors Bar Chart */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 md:p-5 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm flex flex-col">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
 <Activity className="w-5 h-5 text-teal-600"/>
 Top Contributors Points
 </h3>
 <div className="w-full h-72">
 {topEarnersData.length > 0 ? (
 <ResponsiveContainer width="100%"height="100%">
 <BarChart data={topEarnersData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
 <XAxis dataKey="name"stroke="#64748b"fontSize={12} tickLine={false} />
 <YAxis stroke="#64748b"fontSize={12} tickLine={false} />
 <Tooltip 
 cursor={{ fill: isDark ?'#1e3040':'#f1f5f9', opacity: 0.5 }} 
 contentStyle={{ background: isDark ?'#111c21':'#0f172a', borderRadius:'12px', border: isDark ?'1px solid #1e3040':'none', color:'#fff'}}
 />
 <Bar dataKey="Points"radius={[6, 6, 0, 0]}>
 {topEarnersData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-300 text-[13px]">No data available</div>
 )}
 </div>
 </div>

 {/* Chart 2: Points Contribution by Role Pie Chart */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 md:p-5 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm flex flex-col">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
 <Users className="w-5 h-5 text-blue-600"/>
 Point Distribution by Role
 </h3>
 <div className="w-full h-72 flex items-center justify-center relative">
 {pointsByRoleData.length > 0 ? (
 <ResponsiveContainer width="100%"height="100%">
 <PieChart>
 <Pie
 data={pointsByRoleData}
 cx="50%"cy="50%"innerRadius={60}
 outerRadius={85}
 paddingAngle={5}
 dataKey="value">
 {pointsByRoleData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ background: isDark ?'#111c21':'#0f172a', borderRadius:'12px', border: isDark ?'1px solid #1e3040':'none', color:'#fff'}} />
 <Legend verticalAlign="bottom"height={36} iconType="circle"/>
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-300 text-[13px]">No data available</div>
 )}
 </div>
 </div>
 </div>

 {/* Standings Table & Activity Log Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 
 {/* Standings Table (Takes 2/3 space) */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm overflow-hidden lg:col-span-2 flex flex-col justify-between">
 <div>
 <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
 <span className="font-bold uppercase tracking-wider text-xs">Rank</span>
 <span className="font-bold uppercase tracking-wider text-xs flex-1 text-left pl-14">Citizen</span>
 <span className="font-bold uppercase tracking-wider text-xs text-right pr-6">Achievement</span>
 <span className="font-bold uppercase tracking-wider text-xs text-right">Points</span>
 </div>
 
 <div className="divide-y divide-slate-100">
 {users.map((user, index) => {
 const achievement = getAchievement(user.points || 0);
 return (
 <div 
 key={user._id} 
 className={`flex items-center justify-between p-5 transition-colors hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] ${
 index === 0 ?"bg-amber-50/20":
 index === 1 ?"bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/40":
 index === 2 ?"bg-orange-50/10":""}`}
 >
 <div className="flex items-center gap-4 pl-1">
 <span className={`text-[13px] font-black w-6 text-center ${
 index === 0 ?"text-amber-500":
 index === 1 ?"text-slate-400":
 index === 2 ?"text-orange-500":"text-slate-400"}`}>
 #{index + 1}
 </span>
 
 <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${
 index === 0 ?"border-amber-400":
 index === 1 ?"border-slate-300 dark:border-[#1e3040] dark:border-[#1e3040]":
 index === 2 ?"border-orange-300":"border-transparent bg-slate-200"}`}>
 {user.photoURL ? (
 <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover"/>
 ) : (
 <span className="flex items-center justify-center h-full text-slate-500 dark:text-slate-300 font-bold bg-slate-200 text-[13px]">
 {user.name?.charAt(0) || user.email?.charAt(0) ||"C"}
 </span>
 )}
 </div>
 
 <div className="text-left">
 <h4 className="font-bold text-slate-800 dark:text-white text-[13px] md:text-[13px] flex items-center gap-1.5">
 {user.name ||"Anonymous Citizen"}
 {user.isVolunteer && (
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"title="Volunteer"></span>
 )}
 </h4>
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{user.role}</span>
 </div>
 </div>
 
 <div className="hidden sm:block text-right">
 <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${achievement.style}`}>
 {achievement.label}
 </span>
 </div>
 
 <div className="text-right pr-1">
 <span className="font-black text-slate-800 dark:text-white text-[13px] md:text-[13px]">
 {user.points || 0}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Contributor Activity Log (Takes 1/3 space) */}
 <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm p-4 flex flex-col">
 <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 pb-4 flex items-center gap-2 tracking-tight">
 <Activity className="w-5 h-5 text-emerald-600"/>
 Recent Contributor Actions
 </h3>
 
 <div className="space-y-6 flex-1 overflow-y-auto">
 {activityLog.map((log) => (
 <div key={log.id} className="flex gap-3 text-left">
 <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 {log.photo ? (
 <img src={log.photo} alt={log.name} className="w-full h-full object-cover"/>
 ) : (
 <span className="flex items-center justify-center h-full text-xs text-slate-500 dark:text-slate-300 font-bold bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]">
 {log.name?.charAt(0)}
 </span>
 )}
 </div>
 <div>
 <p className="text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-snug">
 <span className="font-extrabold text-slate-900 dark:text-white">{log.name}</span> {log.action}
 </p>
 <span className={`text-xs font-bold flex items-center gap-1 mt-1 ${log.points > 0 ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`}>
 <CheckCircle2 className="w-3.5 h-3.5"/>
 {log.points > 0 ? `+${log.points} Points Credited` : '0 Points Credited'}
 </span>
 </div>
 </div>
 ))}
 
 {activityLog.length === 0 && (
 <div className="text-center text-slate-500 dark:text-slate-300 text-[13px] py-10">No recent activity</div>
 )}
 </div>
 </div>

 </div>

 </div>
 )}

 </div>
 </div>
 );
}
