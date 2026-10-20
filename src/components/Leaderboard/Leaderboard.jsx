import React from"react";
import SEO from "../common/SEO";
import { useQuery } from"@tanstack/react-query";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import { motion } from"framer-motion";
import MinimalLoader from'../common/MinimalLoader.jsx';
import PageHeader from'../common/PageHeader';
import PageArt from "../common/PageArt";
import Podium from'./Podium';
import { Link } from"react-router";
import { fallbackTo } from "../../utils/imageFallback";
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

const ACTIVITY_META = {
 new_issue: { icon:"ri-error-warning-line", tone:"bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"},
 incident_reported: { icon:"ri-error-warning-line", tone:"bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"},
 issue_solved: { icon:"ri-checkbox-circle-line", tone:"bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"},
 drive_joined: { icon:"ri-group-line", tone:"bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"},
 drive_completed: { icon:"ri-leaf-line", tone:"bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300"},
 new_cleanup_event: { icon:"ri-calendar-event-line", tone:"bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300"},
 cleanup_approved: { icon:"ri-calendar-check-line", tone:"bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300"},
 donation_made: { icon:"ri-hand-heart-line", tone:"bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300"},
 animal_rescued: { icon:"ri-heart-pulse-line", tone:"bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"},
 lostfound_reunited: { icon:"ri-key-2-line", tone:"bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"},
 social_activity: { icon:"ri-chat-3-line", tone:"bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"},
 poll_created: { icon:"ri-bar-chart-box-line", tone:"bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"},
 default: { icon:"ri-sparkling-line", tone:"bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"},
};

/** One-line description of a feed event (same feed as the home page) */
function activityText(item) {
 const d = item.data || {};
 switch (item.type) {
 case"new_issue": return`New report in ${d.area}: ${d.title}`;
 case"incident_reported": return`${d.reporterName ||"A neighbour"} reported "${d.title}" in ${d.area}`;
 case"issue_solved": return`Fixed in ${d.area}: ${d.title}`;
 case"drive_joined": return`${d.count || 1} neighbour(s) joined "${d.driveTitle}"`;
 case"drive_completed": return`"${d.driveTitle}" finished with ${d.count || 0} volunteers`;
 case"new_cleanup_event": return`${d.actorName} organised "${d.driveTitle}" in ${d.area}`;
 case"cleanup_approved": return`Cleanup approved: "${d.title}"`;
 case"donation_made": return`${d.donor} gave ৳${d.amount} to "${d.title}"`;
 case"animal_rescued": return`${d.actorName} helped a ${String(d.animalType ||"animal").toLowerCase()} in ${d.location}`;
 case"lostfound_reunited": return`"${d.itemName}" was returned to its owner`;
 case"social_activity": return`${d.authorName} posted "${d.title}" in the forum`;
 case"poll_created": return`${d.actorName} started a poll: "${d.question}"`;
 default: return"New activity from the community";
 }
}

function timeAgo(date) {
 const mins = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60000));
 if (mins < 60) return`${mins} min ago`;
 const hours = Math.round(mins / 60);
 if (hours < 24) return`${hours} h ago`;
 const days = Math.round(hours / 24);
 return days === 1 ?"yesterday":`${days} days ago`;
}

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

 // Latest real community activity (same feed as the home page)
 const { data: activity = [], isLoading: activityLoading } = useQuery({
 queryKey: ["leaderboard-activity"],
 queryFn: async () => {
 const res = await axiosPublic.get("/public/feed", { params: { page: 1, limit: 6 } });
 return Array.isArray(res.data?.data) ? res.data.data : [];
 },
 staleTime: 60 * 1000,
 });
 const topPoints = Math.max(1, ...users.map((u) => u.points || 0));

 return (
 <div className="min-h-screen bg-[var(--cn-ground)] pb-20">
 <SEO title="Community Champions Leaderboard" />
 <PageHeader
 width="72rem"
 gutter="1.5rem"
 art={<PageArt scene="trophy" />}
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

 {/* Standings + recent activity */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

 <section className="cn-glass-card border overflow-hidden lg:col-span-2" aria-labelledby="standings-title">
 <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-white/10">
 <h3 id="standings-title" className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily:"var(--font-heading)" }}>
 <Trophy className="w-5 h-5 text-amber-500"/> All standings
 </h3>
 <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-300">{users.length} neighbours</span>
 </div>
 <ol className="divide-y divide-slate-100 dark:divide-white/5">
 {users.map((user, index) => {
 const achievement = getAchievement(user.points || 0);
 const pct = Math.round(((user.points || 0) / topPoints) * 100);
 const medal = ["bg-amber-400 text-amber-950","bg-slate-300 text-slate-800","bg-orange-300 text-orange-950"][index];
 return (
 <li key={user._id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
 <span className={`w-8 h-8 shrink-0 rounded-full grid place-items-center text-[12px] font-black ${medal || "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300"}`}>
 {index + 1}
 </span>
 <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 grid place-items-center text-[13px] font-bold text-slate-500">
 {user.photoURL
 ? <img src={user.photoURL} alt="" onError={fallbackTo("/demo/avatar-placeholder.svg")} className="w-full h-full object-cover"/>
 : (user.name?.charAt(0) || "C")}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="font-bold text-[14px] text-slate-900 dark:text-white truncate">{user.name || "Anonymous Citizen"}</span>
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{user.isVolunteer && user.role !== "admin" ? "volunteer" : user.role}</span>
 </div>
 <div className="mt-1.5 h-1.5 w-full max-w-[260px] rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
 <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width:`${pct}%` }}/>
 </div>
 </div>
 <span className={`hidden md:inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${achievement.style}`}>{achievement.label}</span>
 <div className="text-right shrink-0 w-16">
 <span className="block font-black text-[15px] text-slate-900 dark:text-white">{(user.points || 0).toLocaleString()}</span>
 <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">points</span>
 </div>
 </li>
 );
 })}
 </ol>
 </section>

 <aside className="cn-glass-card border p-5 lg:sticky lg:top-24" aria-labelledby="activity-title">
 <h3 id="activity-title" className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4" style={{ fontFamily:"var(--font-heading)" }}>
 <Activity className="w-5 h-5 text-emerald-600"/> Recent activity
 </h3>
 {activityLoading ? (
 <div className="py-8 flex justify-center"><MinimalLoader /></div>
 ) : activity.length === 0 ? (
 <p className="text-[13px] text-slate-500 dark:text-slate-300 py-6 text-center">Nothing yet. Report an issue or join a cleanup to get on the board.</p>
 ) : (
 <ul className="space-y-3.5">
 {activity.map((item) => {
 const meta = ACTIVITY_META[item.type] || ACTIVITY_META.default;
 return (
 <li key={item._id} className="flex gap-3">
 <span className={`w-8 h-8 shrink-0 rounded-lg grid place-items-center ${meta.tone}`}><i className={meta.icon} aria-hidden="true"/></span>
 <div className="min-w-0">
 <p className="text-[13px] leading-snug text-slate-700 dark:text-slate-200">{activityText(item)}</p>
 <span className="text-[11px] text-slate-400">{timeAgo(item.createdAt)}</span>
 </div>
 </li>
 );
 })}
 </ul>
 )}
 <Link to="/recent-activities" className="mt-5 cn-btn cn-btn-ghost cn-btn-sm w-full justify-center">
 See all activity <ArrowUpRight className="w-4 h-4"/>
 </Link>
 </aside>

 </div>

 </div>
 )}

 </div>
 </div>
 );
}
