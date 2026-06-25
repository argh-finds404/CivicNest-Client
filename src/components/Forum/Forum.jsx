import React, { useState, useEffect } from"react";
import SEO from "../common/SEO";
import { useParams, useNavigate } from"react-router";
import { useQuery, useQueryClient } from"@tanstack/react-query";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import { useAuth } from"../../hooks/useAuth";
import { useRole } from"../../hooks/useRole";
import { socket } from"../../hooks/useSocket";
import toast from"react-hot-toast";
import ThreadDetails from"./ThreadDetails";
import NewThreadModal from"./NewThreadModal";
import BackButton from"../common/BackButton";

const CATEGORIES = [
 { key:"All", label:"All Topics"},
 { key:"General", label:"General"},
 { key:"Safety", label:"Safety"},
 { key:"Suggestions", label:"Suggestions"},
 { key:"Events", label:"Events"},
 { key:"Off-Topic", label:"Off-Topic"}
];

export default function Forum() {
 const { id } = useParams(); // Selected thread ID from URL
 const { user } = useAuth();
 const [role, isRoleLoading, isVolunteer] = useRole();
 const axiosSecure = useAxiosSecure();
 const queryClient = useQueryClient();
 const navigate = useNavigate();

 const [activeCategory, setActiveCategory] = useState("All");
 const [searchQuery, setSearchQuery] = useState("");
 const [mobilePanelView, setMobilePanelView] = useState(id ?"chat":"sidebar");
 const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);

 // Redirect unauthorized guest users
 useEffect(() => {
 if (!isRoleLoading && user) {
 const isAuthorized = role ==="member"|| role ==="admin"|| isVolunteer;
 if (!isAuthorized) {
 toast.error("Access Denied: Only members and volunteers are allowed to access community threads.", { id:"forum-access-denied"});
 navigate("/membership/request");
 }
 }
 }, [user, role, isRoleLoading, isVolunteer, navigate]);

 // Sync mobilePanelView with URL ID changes
 useEffect(() => {
 if (id) {
 setMobilePanelView("chat");
 } else {
 setMobilePanelView("sidebar");
 }
 }, [id]);

 // Fetch thread list for sidebar
 const { data = {}, isLoading } = useQuery({
 queryKey: ["forum", activeCategory],
 queryFn: async () => {
 const res = await axiosSecure.get(`/forum?category=${activeCategory}&limit=100`);
 return res.data; // { threads: [...], total: N }
 },
 enabled: !!user?.email,
 staleTime: 60000 // Cache category lists for 60 seconds. Sockets invalidate this automatically.
 });

 const threads = data.threads || [];

 // Filter threads by search query locally for speed
 const filteredThreads = threads.filter(t =>
 t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.body.toLowerCase().includes(searchQuery.toLowerCase())
 );

 // Real-time socket listeners for list synchronization
 useEffect(() => {
 const handleThreadCreated = () => {
 queryClient.invalidateQueries({ queryKey: ["forum"] });
 };

 const handleThreadUpdated = () => {
 queryClient.invalidateQueries({ queryKey: ["forum"] });
 };

 const handleReplyCountUpdated = () => {
 queryClient.invalidateQueries({ queryKey: ["forum"] });
 };

 const handleThreadDeleted = ({ threadId }) => {
 queryClient.invalidateQueries({ queryKey: ["forum"] });
 if (id === threadId) {
 navigate("/forum");
 setMobilePanelView("sidebar");
 toast("This thread was removed by a moderator.", { icon:"🗑"});
 }
 };

 socket.on("thread_created", handleThreadCreated);
 socket.on("thread_updated_global", handleThreadUpdated);
 socket.on("thread_reply_count_updated", handleReplyCountUpdated);
 socket.on("thread_deleted_global", handleThreadDeleted);

 return () => {
 socket.off("thread_created", handleThreadCreated);
 socket.off("thread_updated_global", handleThreadUpdated);
 socket.off("thread_reply_count_updated", handleReplyCountUpdated);
 socket.off("thread_deleted_global", handleThreadDeleted);
 };
 }, [id, queryClient, navigate]);

 const handleSelectThread = (threadId) => {
 navigate(`/forum/${threadId}`);
 setMobilePanelView("chat");
 };

 if (isRoleLoading) {
 return (
 <div className="flex h-screen w-full items-center justify-center bg-[#f0f4f2]">
 <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 return (
 <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-[#f0f4f2] font-sans">
 <SEO title="Community Discussions" />
 
 {/* 1. SIDEBAR PANEL (Clean bright mint-white layout) */}
 <aside className={`w-full lg:w-80 flex-shrink-0 flex flex-col bg-[#f9fbf9] border-r border-[#dbe6df] h-full select-none shadow-[6px_0_24px_rgba(0,0,0,0.03)] z-20
 ${mobilePanelView ==="sidebar"?"flex":"hidden lg:flex"}`}>
 {/* Brand/App Title with + Action Button */}
 <div className="px-5 py-4 border-b border-[#e6eee9] flex flex-col gap-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/60 backdrop-blur-sm">
 <div className="flex items-center justify-between">
 <BackButton variant="dark"className="w-fit"/>
 <button 
 onClick={() => setIsNewThreadOpen(true)}
 className="p-1.5 hover:bg-emerald-50 rounded-xl text-emerald-600 hover:text-emerald-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"title="Start a Topic Thread">
 <i className="ri-add-line text-[13px] font-black"></i>
 </button>
 </div>
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-md shadow-emerald-500/10 select-none">
 C
 </div>
 <span className="text-slate-800 dark:text-white font-bold text-[13px] tracking-tight select-none">
 Community Threads
 </span>
 </div>
 </div>

 {/* Search Input */}
 <div className="p-4 border-b border-[#e6eee9]/80">
 <div className="relative w-full">
 <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]"></i>
 <input
 type="text"placeholder="Search threads..."value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-semibold shadow-sm"/>
 </div>
 </div>

 {/* Categories (Topics) List */}
 <div 
 data-lenis-prevent="true"className="p-3.5 space-y-1 border-b border-[#e6eee9]/80 max-h-[220px] overflow-y-auto custom-scrollbar flex-shrink-0">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 mb-2">
 Topics
 </p>
 {CATEGORIES.map(cat => (
 <button
 key={cat.key}
 onClick={() => setActiveCategory(cat.key)}
 className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer
 ${activeCategory === cat.key
 ?"bg-emerald-50 text-emerald-700 border-l-4 border-l-emerald-600 shadow-sm":"text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50/45 hover:translate-x-0.5"}`}
 >
 <i className="ri-hashtag text-slate-400 mr-2 text-[13px] font-normal"></i>
 <span>{cat.label}</span>
 </button>
 ))}
 </div>

 {/* Thread Items Stream */}
 <div 
 data-lenis-prevent="true"className="flex-1 overflow-y-auto p-3.5 custom-scrollbar bg-transparent">
 <p className="text-[9px] font-bold text-slate-400/80 uppercase tracking-widest px-2 mb-2.5">
 Active Threads ({filteredThreads.length})
 </p>

 {isLoading ? (
 <div className="flex justify-center items-center py-12">
 <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 ) : filteredThreads.length === 0 ? (
 <div className="text-center py-12 px-4 select-none">
 <p className="text-xs text-slate-400/80 font-semibold">No discussions in #{activeCategory}</p>
 </div>
 ) : (
 <div className="space-y-2">
 {filteredThreads.map(thread => {
 const isSelected = id === thread._id;
 const initials = (thread.posterName ||'U')[0].toUpperCase();
 return (
 <button
 key={thread._id}
 onClick={() => handleSelectThread(thread._id)}
 className={`w-full p-3 rounded-xl text-left transition-all duration-200 flex gap-2.5 border group items-start cursor-pointer
 ${isSelected
 ?"bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-emerald-500 text-emerald-900 shadow-md":"bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-slate-100 hover:bg-emerald-50/20 hover:border-emerald-200 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:text-emerald-800 shadow-sm hover:translate-y-[-1px]"}`}
 >
 {/* Initials Badge */}
 <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold select-none flex-shrink-0 mt-0.5 border ${
 isSelected 
 ?'bg-emerald-100 border-emerald-200 text-emerald-700':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-slate-500 dark:text-slate-300'}`}>
 {initials}
 </div>

 {/* Content Area */}
 <div className="flex-grow min-w-0">
 <div className="flex items-center gap-1.5 w-full">
 {thread.isPinned && <i className="ri-pushpin-2-fill text-amber-500 text-[10px] flex-shrink-0"title="Pinned"></i>}
 {thread.isLocked && <i className="ri-lock-fill text-slate-400 text-[10px] flex-shrink-0"title="Locked"></i>}
 <p className={`text-xs font-semibold truncate flex-grow leading-tight transition-colors ${isSelected ?'text-emerald-950':'text-slate-800 dark:text-white group-hover:text-emerald-900'}`}>
 {thread.title}
 </p>
 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 border transition-all ${
 isSelected 
 ?'bg-emerald-500/10 text-emerald-600 border-emerald-500/20':'bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] text-slate-450 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] group-hover:bg-slate-200 group-hover:text-slate-600 dark:text-slate-300'}`}>
 {thread.replyCount || 0}
 </span>
 </div>

 {thread.lastReply ? (
 <p className={`text-[9px] truncate mt-1 w-full font-semibold transition-colors ${isSelected ?'text-emerald-800/80':'text-slate-500 dark:text-slate-300 group-hover:text-slate-600 dark:text-slate-300'}`}>
 <span className="font-extrabold">{thread.lastReply.senderName}</span>: {thread.lastReply.preview}
 </p>
 ) : (
 <p className={`text-[9px] truncate mt-1 w-full font-bold italic transition-colors ${isSelected ?'text-emerald-600/60':'text-slate-400/60 group-hover:text-slate-500 dark:text-slate-300 /60'}`}>
 No replies yet.
 </p>
 )}
 </div>
 </button>
 );
 })}
 </div>
 )}
 </div>

 {/* Sidebar Footer Action */}
 <div className="p-3.5 border-t border-[#e6eee9] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] flex-shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
 <button
 onClick={() => setIsNewThreadOpen(true)}
 className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md text-xs hover:shadow-lg hover:shadow-emerald-600/15 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
 <i className="ri-add-line text-[13px] font-bold"></i>
 <span>Start a Topic Thread</span>
 </button>
 </div>
 </aside>

 {/* 2. MAIN ACTIVE CHAT VIEWPORT (Bright and clean green-tinted area) */}
 <main className={`flex-1 flex flex-col h-full bg-[#f0f4f2] relative z-10
 ${mobilePanelView ==="chat"?"flex":"hidden lg:flex"}`}>
 {id ? (
 <ThreadDetails
 id={id}
 onBack={() => {
 navigate("/forum");
 setMobilePanelView("sidebar");
 }}
 />
 ) : (
 /* Welcome Panel when no thread is selected */
 <div className="flex-1 flex flex-col items-center justify-center p-5 text-center bg-[#f0f4f2]/70 select-none">
 <div className="w-16 h-16 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
 <i className="ri-chat-3-line text-3xl tracking-tight text-emerald-600"></i>
 </div>
 <h2 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight"style={{ fontFamily:'Outfit, sans-serif'}}>
 Welcome to CivicNest Chats
 </h2>
 <p className="text-slate-500 dark:text-slate-300 max-w-xs text-xs leading-relaxed mb-6 font-medium">
 Pick a topic thread from the sidebar to join active neighbourhood conversations, or start a new thread to raise a concern.
 </p>

 <div className="flex flex-col gap-2.5 text-left w-full max-w-xs">
 {[
 { icon:'ri-team-line', text:'Be helpful and respect neighbours'},
 { icon:'ri-map-pin-line', text:'Discuss local cleanliness and urban issue topics'},
 ].map((r, i) => (
 <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg border border-emerald-100/50 shadow-sm transition-all hover:translate-x-1 duration-200">
 <i className={`${r.icon} text-[13px] text-emerald-600 flex-shrink-0`}></i>
 <span className="text-xs font-bold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] leading-snug">{r.text}</span>
 </div>
 ))}
 </div>

 <button
 onClick={() => setIsNewThreadOpen(true)}
 className="mt-8 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md text-xs hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5">
 <i className="ri-add-line text-[13px]"></i>
 <span>Start a New Thread</span>
 </button>
 </div>
 )}
 </main>

 {/* 3. NEW THREAD POPUP MODAL */}
 <NewThreadModal
 isOpen={isNewThreadOpen}
 onClose={() => setIsNewThreadOpen(false)}
 onThreadCreated={(newId) => handleSelectThread(newId)}
 />

 </div>
 );
}
