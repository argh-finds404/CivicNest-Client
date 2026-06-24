import React, { useState, useEffect, useRef, useMemo } from'react';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import { Link } from'react-router';
import useAxiosPublic from'../../hooks/useAxiosPublic';
import useAxiosSecure from'../../hooks/useAxiosSecure';
import { useAuth } from'../../hooks/useAuth';
import { useRole } from'../../hooks/useRole';
import { socket } from'../../hooks/useSocket';
import MinimalLoader from'../common/MinimalLoader';
import toast from'react-hot-toast';
import { formatDistanceToNow, format } from'date-fns';
import PageTitle from'../common/PageTitle';


// Parse links and highlight mentions as premium badges
function parseMentionsAndLinks(text, participants = [], searchResults = [], knownNames = new Set()) {
 if (!text) return"";
 
 // 1. Safe HTML-protected link parsing
 const urlRegex = /https?:\/\/[^\s<>"']+/g;
 let html = text.replace(urlRegex, (url) => {
 if (!/^https?:\/\//i.test(url)) return url;
 const safe = encodeURI(decodeURI(url));
 return`<a href="${safe}"target="_blank"rel="noopener noreferrer"class="text-emerald-600 dark:text-emerald-400 font-bold underline break-all hover:text-emerald-700 transition-colors">${url}</a>`;
 });

 // 2. Gather names/emails to match
 const names = new Set(["everyone","Everyone"]);
 participants.forEach(p => {
 if (p.name) names.add(p.name);
 if (p.email) names.add(p.email);
 });
 searchResults.forEach(u => {
 if (u.name) names.add(u.name);
 if (u.email) names.add(u.email);
 });
 knownNames.forEach(name => {
 if (name) names.add(name);
 });

 const sortedNames = Array.from(names).sort((a, b) => b.length - a.length);
 const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

 sortedNames.forEach(name => {
 const regex = new RegExp(`(^|\\s)@(${escapeRegExp(name)})(?=\\s|$|[.,!?;])`,'g');
 html = html.replace(regex, (match, space, matchedName) => {
 const isEveryone = matchedName.toLowerCase() ==='everyone';
 const badgeClass = isEveryone
 ?"bg-amber-100 text-amber-800 border border-amber-250/30 font-bold px-1.5 py-0.5 rounded-md text-[11px] select-none inline-flex items-center gap-0.5":"bg-emerald-100 text-emerald-800 border border-emerald-250/30 font-bold px-1.5 py-0.5 rounded-md text-[11px] select-none inline-flex items-center gap-0.5";
 return`${space}<span class="${badgeClass}">@${matchedName}</span>`;
 });
 });

 return html;
}

export default function ThreadDetails({ id, onBack }) {
 const axiosPublic = useAxiosPublic();
 const axiosSecure = useAxiosSecure();
 const { user } = useAuth();
 const [role] = useRole();
 const queryClient = useQueryClient();

 const listRef = useRef(null);
 const inputRef = useRef(null);
 const typingTimeoutRef = useRef(null);

 const [messages, setMessages] = useState([]);
 const [hasMore, setHasMore] = useState(false);
 const [isLoadingOlder, setIsLoadingOlder] = useState(false);
 const [messageText, setMessageText] = useState("");
 const [replyingTo, setReplyingTo] = useState(null);
 const [sending, setSending] = useState(false);
 const [typingUsers, setTypingUsers] = useState(new Map());
 const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
 const [isTypingLocal, setIsTypingLocal] = useState(false);
 const [hoveredMessageId, setHoveredMessageId] = useState(null);

 // Online Presence & Autocomplete States
 const [onlineUsers, setOnlineUsers] = useState([]);
 const [mentionQuery, setMentionQuery] = useState(null);
 const [mentionSuggestions, setMentionSuggestions] = useState([]);
 const [mentionIndex, setMentionIndex] = useState(-1);
 const [focusedMentionIdx, setFocusedMentionIdx] = useState(0);
 const [showInfoPanel, setShowInfoPanel] = useState(false);
 const [knownNames, setKnownNames] = useState(new Set());

 // Fetch initial thread details
 const { data: thread, isLoading } = useQuery({
 queryKey: ['thread', id],
 queryFn: async () => {
 const res = await axiosPublic.get(`/forum/${id}`);
 return res.data;
 }
 });

 // Sync query data with local state
 useEffect(() => {
 if (thread && thread._id === id) {
 setMessages(thread.replies || []);
 setHasMore(thread.hasMore || false);
 // Scroll to bottom on load
 setTimeout(() => {
 if (listRef.current) {
 listRef.current.scrollTop = listRef.current.scrollHeight;
 }
 }, 50);
 }
 }, [id, thread]);

 // Compute unique participants: starter + repliers
 const participants = useMemo(() => {
 const unique = new Map();
 if (thread) {
 const starterEmail = thread.postedBy ||'starter-email';
 unique.set(starterEmail, {
 email: starterEmail,
 name: thread.posterName ||'Thread Starter',
 photo: thread.posterPhoto || null,
 isStarter: true
 });
 messages.forEach(m => {
 if (m.postedBy) {
 if (!unique.has(m.postedBy)) {
 unique.set(m.postedBy, {
 email: m.postedBy,
 name: m.posterName || m.postedBy,
 photo: m.posterPhoto || null,
 isStarter: false
 });
 }
 }
 });
 }
 return Array.from(unique.values());
 }, [thread, messages]);

 // Sync knownNames Set with current participants to format mentions
 useEffect(() => {
 if (thread) {
 const names = new Set();
 if (thread.posterName) names.add(thread.posterName);
 if (thread.postedBy) names.add(thread.postedBy);
 if (thread.replies) {
 thread.replies.forEach(r => {
 if (r.posterName) names.add(r.posterName);
 if (r.postedBy) names.add(r.postedBy);
 });
 }
 setKnownNames(names);
 }
 }, [thread]);

 // Search user query for autocomplete
 useEffect(() => {
 if (mentionQuery === null) {
 setMentionSuggestions([]);
 return;
 }

 const localMatches = [];
 if ('everyone'.startsWith(mentionQuery.toLowerCase())) {
 localMatches.push({ email:'everyone', name:'everyone', isEveryone: true });
 }

 participants.forEach(p => {
 if (p.name?.toLowerCase().includes(mentionQuery.toLowerCase()) || 
 p.email?.toLowerCase().includes(mentionQuery.toLowerCase())) {
 if (!localMatches.some(m => m.email === p.email)) {
 localMatches.push(p);
 }
 }
 });

 if (mentionQuery.trim().length >= 1) {
 const delayDebounce = setTimeout(async () => {
 try {
 const res = await axiosSecure.get(`/forum/users/search?q=${encodeURIComponent(mentionQuery)}`);
 const dbUsers = res.data || [];
 setMentionSuggestions(prev => {
 const combined = [...localMatches];
 dbUsers.forEach(dbU => {
 if (!combined.some(c => c.email === dbU.email)) {
 combined.push(dbU);
 }
 });
 return combined;
 });
 } catch (err) {
 console.error("Error searching user mentions:", err);
 }
 }, 200);

 return () => clearTimeout(delayDebounce);
 } else {
 setMentionSuggestions(localMatches);
 }
 }, [mentionQuery, participants, axiosSecure]);

 useEffect(() => {
 setFocusedMentionIdx(0);
 }, [mentionSuggestions]);

 // Handle room joining, leaving, and real-time socket events
 useEffect(() => {
 // Join room with identity payload to enable real-time active status tracking
 if (user) {
 socket.emit("join_thread", {
 threadId: id,
 userEmail: user.email,
 userName: user.displayName || user.email,
 userPhoto: user.photoURL || null
 });
 } else {
 socket.emit("join_thread", { threadId: id });
 }

 setTypingUsers(new Map());
 setShowNewMessageIndicator(false);

 const handleNewMessage = ({ threadId, reply }) => {
 if (threadId === id) {
 setMessages(prev => {
 if (prev.some(m => m._id === reply._id)) return prev;
 return [...prev, reply];
 });

 const container = listRef.current;
 if (container) {
 const isAtBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 180;
 if (isAtBottom) {
 setTimeout(() => {
 container.scrollTop = container.scrollHeight;
 }, 30);
 } else {
 setShowNewMessageIndicator(true);
 }
 }
 }
 };

 const handleReplyDeleted = ({ threadId, replyId }) => {
 if (threadId === id) {
 setMessages(prev => prev.filter(m => m._id !== replyId));
 }
 };

 const handleUserTyping = ({ userEmail, userName, isTyping }) => {
 if (userEmail === user?.email) return;
 setTypingUsers(prev => {
 const next = new Map(prev);
 if (isTyping) {
 next.set(userEmail, userName);
 } else {
 next.delete(userEmail);
 }
 return next;
 });
 };

 const handleRoomUsers = (users) => {
 setOnlineUsers(users || []);
 };

 const handleThreadUpdated = ({ isPinned, isLocked }) => {
 queryClient.setQueryData(['thread', id], old => {
 if (!old) return old;
 return { ...old, isPinned, isLocked };
 });
 };

 const handleThreadDeleted = () => {
 onBack();
 };

 const handleReconnect = () => {
 if (user) {
 socket.emit("join_thread", {
 threadId: id,
 userEmail: user.email,
 userName: user.displayName || user.email,
 userPhoto: user.photoURL || null
 });
 } else {
 socket.emit("join_thread", { threadId: id });
 }
 queryClient.invalidateQueries({ queryKey: ['thread', id] });
 toast.success('Reconnected successfully', { duration: 2000 });
 };

 socket.on("message_received", handleNewMessage);
 socket.on("reply_deleted", handleReplyDeleted);
 socket.on("user_typing", handleUserTyping);
 socket.on("room_users", handleRoomUsers);
 socket.on("thread_updated", handleThreadUpdated);
 socket.on("thread_deleted", handleThreadDeleted);
 socket.on("reconnect", handleReconnect);

 return () => {
 socket.emit("leave_thread", id);
 socket.off("message_received", handleNewMessage);
 socket.off("reply_deleted", handleReplyDeleted);
 socket.off("user_typing", handleUserTyping);
 socket.off("room_users", handleRoomUsers);
 socket.off("thread_updated", handleThreadUpdated);
 socket.off("thread_deleted", handleThreadDeleted);
 socket.off("reconnect", handleReconnect);
 };
 }, [id, user, queryClient, onBack]);

 const handleScrollToBottom = () => {
 setShowNewMessageIndicator(false);
 if (listRef.current) {
 listRef.current.scrollTop = listRef.current.scrollHeight;
 }
 };

 // Scroll pagination: load older replies on top scroll
 const handleScroll = async () => {
 const container = listRef.current;
 if (!container || isLoadingOlder || !hasMore) return;

 // Hide float indicator if scrolled to bottom
 const isAtBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 60;
 if (isAtBottom) {
 setShowNewMessageIndicator(false);
 }

 if (container.scrollTop < 60 && messages.length > 0) {
 setIsLoadingOlder(true);
 const oldestId = messages[0]._id;

 try {
 const res = await axiosPublic.get(`/forum/${id}?before=${oldestId}&limit=50`);
 const olderReplies = res.data.replies || [];

 if (olderReplies.length > 0) {
 const prevScrollHeight = container.scrollHeight;
 const prevScrollTop = container.scrollTop;

 setMessages(prev => [...olderReplies, ...prev]);
 setHasMore(res.data.hasMore || false);

 // Maintain scroll position offset
 setTimeout(() => {
 container.scrollTop = container.scrollHeight - prevScrollHeight + prevScrollTop;
 }, 0);
 } else {
 setHasMore(false);
 }
 } catch (err) {
 console.error("Failed to load older messages", err);
 } finally {
 setIsLoadingOlder(false);
 }
 }
 };

 // Keyboard typing relay
 const handleTyping = (e) => {
 const val = e.target.value;
 setMessageText(val);

 // Check cursor position for"@"symbol to display autocomplete
 const cursor = e.target.selectionStart;
 const textBefore = val.substring(0, cursor);
 const mentionMatch = textBefore.match(/@([a-zA-Z0-9\s.-]*)$/);
 
 if (mentionMatch) {
 const query = mentionMatch[1];
 if (!query.startsWith('') && !query.includes('\n')) {
 setMentionQuery(query);
 setMentionIndex(textBefore.length - query.length - 1);
 } else {
 setMentionQuery(null);
 }
 } else {
 setMentionQuery(null);
 }

 if (!isTypingLocal && user) {
 setIsTypingLocal(true);
 socket.emit("typing", {
 threadId: id,
 userEmail: user.email,
 userName: user.displayName || user.email,
 isTyping: true
 });
 }

 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

 typingTimeoutRef.current = setTimeout(() => {
 setIsTypingLocal(false);
 socket.emit("typing", {
 threadId: id,
 userEmail: user.email,
 userName: user.displayName || user.email,
 isTyping: false
 });
 }, 1500);
 };

 const clearTyping = () => {
 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
 setIsTypingLocal(false);
 socket.emit("typing", {
 threadId: id,
 userEmail: user.email,
 userName: user.displayName || user.email,
 isTyping: false
 });
 };

 const handleSelectMention = (suggestedUser) => {
 if (mentionIndex === -1) return;

 const mentionText =`@${suggestedUser.name}`;
 const before = messageText.substring(0, mentionIndex);
 const after = messageText.substring(inputRef.current.selectionStart || messageText.length);

 const newText = before + mentionText + after;
 setMessageText(newText);

 // Save to knownNames
 if (!suggestedUser.isEveryone) {
 setKnownNames(prev => {
 const next = new Set(prev);
 if (suggestedUser.name) next.add(suggestedUser.name);
 if (suggestedUser.email) next.add(suggestedUser.email);
 return next;
 });
 }

 setMentionQuery(null);
 setMentionSuggestions([]);

 // Focus back on text area and position cursor after inserted mention
 setTimeout(() => {
 if (inputRef.current) {
 inputRef.current.focus();
 const cursorPosition = mentionIndex + mentionText.length;
 inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
 }
 }, 50);
 };

 // Upvote Mutation
 const upvoteMutation = useMutation({
 mutationFn: () => axiosSecure.post(`/forum/${id}/upvote`),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['thread', id] });
 },
 onError: () => toast.error('Failed to upvote.')
 });

 // Admin Pin Mutation
 const pinMutation = useMutation({
 mutationFn: () => axiosSecure.patch(`/admin/forum/${id}/pin`),
 onSuccess: (res) => {
 toast.success(res.data.isPinned ?'Thread pinned.':'Thread unpinned.');
 },
 onError: () => toast.error('Failed to update pin status.')
 });

 // Admin Lock Mutation
 const lockMutation = useMutation({
 mutationFn: () => axiosSecure.patch(`/admin/forum/${id}/lock`),
 onSuccess: (res) => {
 toast.success(res.data.isLocked ?'Thread locked.':'Thread unlocked.');
 },
 onError: () => toast.error('Failed to update lock status.')
 });

 // Admin Delete Mutation
 const deleteMutation = useMutation({
 mutationFn: () => axiosSecure.delete(`/admin/forum/${id}`),
 onSuccess: () => {
 toast.success('Thread deleted.');
 onBack();
 },
 onError: () => toast.error('Failed to delete thread.')
 });

 // Reply Delete Mutation
 const deleteReplyMutation = useMutation({
 mutationFn: (replyId) => axiosSecure.delete(`/forum/${id}/reply/${replyId}`),
 onSuccess: () => {
 toast.success('Reply deleted.');
 },
 onError: (err) => {
 toast.error(err.response?.data?.message ||'Failed to delete reply.');
 }
 });

 // Clipboard Paste & Drag & Drop Interceptors for media prevention
 const handlePaste = (e) => {
 const items = Array.from(e.clipboardData?.items || []);
 const hasFile = items.some(item => item.kind ==='file');
 if (hasFile) {
 e.preventDefault();
 toast.error('Media uploads are not allowed in Threads. Share a link instead!', { id:'media-block'});
 }
 };

 const handleDrop = (e) => {
 e.preventDefault();
 toast.error('Drag & drop files are not allowed in Threads. Share a link instead!', { id:'media-block'});
 };

 // Send Message
 const handleSend = async (e) => {
 if (e) e.preventDefault();
 if (!messageText.trim() || sending || thread?.isLocked) return;

 setSending(true);
 clearTyping();

 try {
 const payload = {
 body: messageText,
 ...(replyingTo ? {
 replyTo: {
 messageId: replyingTo._id,
 text: replyingTo.body.substring(0, 100),
 senderName: replyingTo.posterName
 }
 } : {})
 };

 await axiosSecure.post(`/forum/${id}/reply`, payload);
 setMessageText("");
 setReplyingTo(null);

 // Auto-resize input height back to default
 if (inputRef.current) {
 inputRef.current.style.height ='auto';
 }
 } catch (err) {
 toast.error(err.response?.data?.message ||"Failed to post message.");
 } finally {
 setSending(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex-1 flex justify-center items-center bg-[#f0f4f2]">
 <MinimalLoader size="lg"color="#0d9488"/>
 </div>
 );
 }

 if (!thread) {
 return (
 <div className="flex-1 flex flex-col items-center justify-center p-5 text-center bg-[#f0f4f2] select-none">
 <h3 className="text-[13px] tracking-tight font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Thread not found</h3>
 <p className="text-xs text-slate-500 dark:text-slate-300 mb-6 font-medium">This discussion may have been removed or locked by a moderator.</p>
 <button onClick={onBack} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md">
 Back to sidebar
 </button>
 </div>
 );
 }

 const hasUpvoted = user && thread.upvotes?.includes(user.email);
 const isAdmin = role ==='admin';

 // Group messages logic (consecutive from same user within 5 minutes)
 const isMessageGrouped = (index) => {
 if (index === 0) return false;
 const prev = messages[index - 1];
 const curr = messages[index];
 if (curr.replyTo) return false; // Don't group if it's a quoted reply
 return (
 prev.postedBy === curr.postedBy &&
 new Date(curr.date) - new Date(prev.date) < 5 * 60 * 1000
 );
 };

 // Helper to check if a user email is online
 const isUserOnline = (email) => {
 return onlineUsers.some(u => u.email === email);
 };

 return (
 <div className="flex-grow flex h-full overflow-hidden bg-[#f0f4f2]">
 <PageTitle title={thread?.title ?`${thread.title} - Forum Discussion`:"Forum Discussion"} />
 
 {/* Left Chat Viewport */}
 <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
 
 {/* A. HEADER (Clean bright emerald container) */}
 <header className="px-5 py-3.5 border-b border-emerald-100 flex items-center justify-between bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] flex-shrink-0 select-none shadow-sm z-10">
 <div className="flex items-center gap-3 min-w-0">
 <button 
 onClick={onBack}
 className="lg:hidden p-1.5 hover:bg-emerald-50 rounded-xl transition-colors text-emerald-700 hover:text-emerald-900">
 <i className="ri-arrow-left-line text-[13px] font-bold"></i>
 </button>
 
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-emerald-600 font-bold text-[13px] select-none">#</span>
 <h2 className="text-[13px] font-semibold text-slate-900 dark:text-white truncate tracking-tight font-sans">
 {thread.title}
 </h2>
 </div>
 <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
 Topic: <span className="font-semibold text-emerald-600">{thread.category}</span> · Started by {thread.posterName}
 </p>
 </div>
 </div>

 {/* Action Toolbar */}
 <div className="flex items-center gap-2">
 {/* Members Toggle Button */}
 <button
 onClick={() => setShowInfoPanel(prev => !prev)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer
 ${showInfoPanel
 ?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:border-slate-350'}`}
 title="Thread Members & Online Users">
 <i className="ri-group-line text-[13px]"></i>
 <span className="hidden sm:inline">Members ({onlineUsers.length})</span>
 </button>

 {/* Upvote Button */}
 <button
 onClick={() => {
 if (!user) toast.error("Please login to upvote");
 else upvoteMutation.mutate();
 }}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer
 ${hasUpvoted
 ?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:border-slate-350'}`}
 >
 <i className="ri-arrow-up-line text-[13px]"></i>
 <span>{thread.upvoteCount || 0}</span>
 </button>

 {/* Admin Exclusive Controls */}
 {isAdmin && (
 <div className="flex items-center gap-1 border-l border-emerald-100 pl-2">
 {/* Pin/Unpin */}
 <button
 onClick={() => pinMutation.mutate()}
 disabled={pinMutation.isPending}
 className={`p-1.5 rounded-xl transition-all cursor-pointer
 ${thread.isPinned
 ?'text-amber-600 bg-amber-50':'text-slate-400 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]'}`}
 title={thread.isPinned ?"Unpin Thread":"Pin Thread"}
 >
 <i className={`${thread.isPinned ?'ri-pushpin-fill':'ri-pushpin-line'} text-[13px]`}></i>
 </button>

 {/* Lock/Unlock */}
 <button
 onClick={() => lockMutation.mutate()}
 disabled={lockMutation.isPending}
 className={`p-1.5 rounded-xl transition-all cursor-pointer
 ${thread.isLocked
 ?'text-red-600 bg-red-50':'text-slate-400 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] hover:text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1]'}`}
 title={thread.isLocked ?"Unlock Thread":"Lock Thread"}
 >
 <i className={`${thread.isLocked ?'ri-lock-fill':'ri-lock-unlock-line'} text-[13px]`}></i>
 </button>

 {/* Delete */}
 <button
 onClick={() => {
 if (window.confirm("Are you sure you want to permanently delete this thread?")) {
 deleteMutation.mutate();
 }
 }}
 disabled={deleteMutation.isPending}
 className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"title="Delete Thread">
 <i className="ri-delete-bin-line text-[13px]"></i>
 </button>
 </div>
 )}
 </div>
 </header>

 {/* B. CHAT MESSAGES DISPLAY */}
 <div 
 ref={listRef}
 onScroll={handleScroll}
 data-lenis-prevent="true"className="flex-1 overflow-y-auto custom-scrollbar p-4 relative bg-[#f0f4f2] space-y-4">
 {/* Loading Spinner for older messages */}
 {isLoadingOlder && (
 <div className="flex justify-center items-center py-4">
 <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 )}

 {/* Clean minimal separator/header at the top */}
 <div className="flex flex-col items-center justify-center py-6 select-none text-center">
 <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-2 text-emerald-600 border border-emerald-100/50">
 <i className="ri-leaf-line text-[13px]"></i>
 </div>
 <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-widest font-sans">
 Beginning of # {thread.title}
 </span>
 </div>

 {/* Chronological Starter Message Bubble */}
 <div className="max-w-2xl mx-auto w-full px-3 py-1.5">
 <div className="flex gap-3 w-full">
 {/* Avatar */}
 <div className="w-8 flex-shrink-0 flex justify-center">
 {thread.posterPhoto ? (
 <img 
 src={thread.posterPhoto} 
 className="w-8 h-8 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border border-emerald-100"alt=""/>
 ) : (
 <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-sm select-none">
 {(thread.posterName ||'U')[0].toUpperCase()}
 </div>
 )}
 </div>

 {/* Message Bubble Body */}
 <div className="flex-grow min-w-0 max-w-[85%]">
 {/* Header Info */}
 <div className="flex items-center gap-2 mb-1.5 select-none text-[10px]">
 <span className="font-semibold text-slate-800 dark:text-white">
 {thread.posterName}
 </span>
 <span className="text-slate-400 font-medium">
 {formatDistanceToNow(new Date(thread.date || thread.createdAt || new Date()), { addSuffix: true })}
 </span>
 <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded-full text-[8px] uppercase tracking-wider font-sans">
 Topic Starter
 </span>
 </div>

 {/* Message Bubble Card */}
 <div className="p-4 rounded-lg rounded-tl-none bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100 text-slate-800 dark:text-white shadow-sm leading-relaxed text-xs">
 <p className="font-bold text-slate-900 dark:text-white mb-1 font-sans text-xs">
 {thread.title}
 </p>
 <div 
 className="text-xs font-normal text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] font-sans leading-relaxed break-words whitespace-pre-wrap"dangerouslySetInnerHTML={{ __html: parseMentionsAndLinks(thread.body, participants, mentionSuggestions, knownNames) }}
 />
 </div>
 </div>
 </div>
 </div>

 {/* Message Bubble List */}
 {messages.length === 0 ? (
 <div className="max-w-lg mx-auto p-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/60 backdrop-blur-sm rounded-lg border border-emerald-100 text-center select-none mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
 <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 border border-emerald-100">
 <i className="ri-chat-smile-line text-[13px]"></i>
 </div>
 <h5 className="text-xs font-bold text-slate-800 dark:text-white">No updates or replies yet</h5>
 <p className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold leading-relaxed mt-1">
 Be the first to share an update, coordinate a cleanup, or ask a question in this thread.
 </p>
 </div>
 ) : (
 <div className="space-y-2 max-w-4xl mx-auto w-full">
 {messages.map((reply, idx) => {
 const isGrouped = isMessageGrouped(idx);
 const isOwn = user && reply.postedBy === user.email;
 const hovered = hoveredMessageId === (reply._id || idx);

 return (
 <div
 key={reply._id || idx}
 className={`flex gap-3 px-3 py-1.5 rounded-lg transition-all relative group w-full max-w-2xl
 ${isOwn ?'ml-auto flex-row-reverse':'mr-auto'}`}
 onMouseEnter={() => setHoveredMessageId(reply._id || idx)}
 onMouseLeave={() => setHoveredMessageId(null)}
 >
 {/* Left/Right Side Avatar */}
 <div className="w-8 flex-shrink-0 flex justify-center">
 {!isGrouped ? (
 reply.posterPhoto ? (
 <img 
 src={reply.posterPhoto} 
 className="w-8 h-8 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]"alt=""/>
 ) : (
 <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-sm select-none">
 {(reply.posterName ||'U')[0].toUpperCase()}
 </div>
 )
 ) : (
 hovered && (
 <span className="text-[8px] text-slate-400 font-bold mt-1 block select-none">
 {format(new Date(reply.date),'HH:mm')}
 </span>
 )
 )}
 </div>

 {/* Message Bubble Body */}
 <div className="flex-grow min-w-0 max-w-[85%]">
 
 {/* Header info (User & Time) */}
 {!isGrouped && (
 <div className={`flex items-baseline gap-2 mb-1 select-none text-[10px] ${isOwn ?'justify-end':''}`}>
 <span className="font-semibold text-slate-800 dark:text-white">
 {reply.posterName}
 </span>
 <span className="text-slate-400 font-medium">
 {formatDistanceToNow(new Date(reply.date), { addSuffix: true })}
 </span>
 </div>
 )}

 {/* Quoted Quote Preview */}
 {reply.replyTo && (
 <div className="border-l-2 border-emerald-500/70 pl-2.5 py-1 mb-1.5 bg-emerald-50/40 rounded-r-lg max-w-md select-none opacity-80">
 <p className="text-[9px] font-semibold text-emerald-700">
 @{reply.replyTo.senderName}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-300 truncate leading-snug">
 {reply.replyTo.text}
 </p>
 </div>
 )}

 {/* Message Bubble Card */}
 <div className={`p-3 rounded-lg shadow-sm border text-xs font-medium leading-relaxed break-words relative group/bubble
 ${isOwn 
 ?'bg-emerald-50/80 border-emerald-200/80 text-emerald-950 rounded-tr-none':'bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border-emerald-100/50 text-slate-800 dark:text-white rounded-tl-none'}`}>
 <p dangerouslySetInnerHTML={{ __html: parseMentionsAndLinks(reply.body, participants, mentionSuggestions, knownNames) }} />

 {/* Floating actions in the bubble */}
 {user && (
 <div className={`absolute -top-3.5 right-3 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 select-none z-10 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/80 shadow-md rounded-lg p-0.5
 ${hovered ?'opacity-100':''}`}>
 <button
 onClick={() => setReplyingTo(reply)}
 className="p-1 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded text-slate-500 dark:text-slate-300 hover:text-emerald-600 transition-colors flex items-center justify-center cursor-pointer"title="Reply">
 <i className="ri-reply-line text-[11px] font-bold"></i>
 </button>
 {(isOwn || isAdmin) && (
 <button
 onClick={() => {
 if (window.confirm("Delete this message?")) {
 deleteReplyMutation.mutate(reply._id);
 }
 }}
 disabled={deleteReplyMutation.isPending}
 className="p-1 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded text-slate-500 dark:text-slate-300 hover:text-red-500 transition-colors flex items-center justify-center cursor-pointer"title="Delete">
 <i className="ri-delete-bin-line text-[11px] font-bold"></i>
 </button>
 )}
 </div>
 )}
 </div>

 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Live Typing bubble list */}
 {typingUsers.size > 0 && (
 <div className="flex items-center gap-2 px-3 py-1.5 mt-2 select-none animate-pulse max-w-md mx-auto">
 <div className="flex gap-0.5">
 {[0, 1, 2].map(i => (
 <div 
 key={i}
 className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"style={{ animationDelay:`${i * 0.15}s`}} 
 />
 ))}
 </div>
 <span className="text-[10px] text-slate-400 font-bold">
 {[...typingUsers.values()].join(',')} {typingUsers.size === 1 ?'is':'are'} typing...
 </span>
 </div>
 )}
 </div>

 {/* Floating indicator: new messages below */}
 {showNewMessageIndicator && (
 <button
 onClick={handleScrollToBottom}
 className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-semibold shadow-lg transition-all animate-bounce flex items-center gap-1 z-20 cursor-pointer">
 New updates below <i className="ri-arrow-down-line text-xs"></i>
 </button>
 )}

 {/* C. BOTTOM CHAT INPUT BAR */}
 <div className="border-t border-emerald-100 p-4 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] flex-shrink-0 select-none shadow-md z-10 relative">
 
 {/* Mentions Autocomplete Suggestions Dropdown */}
 {mentionSuggestions.length > 0 && (
 <div 
 data-lenis-prevent="true"className="absolute bottom-full left-4 right-4 mb-2 max-h-48 overflow-y-auto bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] border border-[#dbe6df] rounded-lg shadow-xl z-30 divide-y divide-slate-100 animate-in slide-in-from-bottom-3 duration-250 custom-scrollbar max-w-lg mx-auto">
 <div className="px-3.5 py-2 bg-emerald-50/70 text-[10px] font-bold text-emerald-800 select-none flex items-center justify-between">
 <span>Mention User...</span>
 <span className="text-slate-400 font-medium text-[9px]">Use ↑↓ to navigate, Enter/Tab to select</span>
 </div>
 {mentionSuggestions.map((s, idx) => {
 const isFocused = idx === focusedMentionIdx;
 return (
 <button
 key={s.email}
 type="button"onClick={() => handleSelectMention(s)}
 className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors cursor-pointer text-xs ${
 isFocused 
 ?'bg-emerald-50 text-emerald-900 font-semibold border-l-4 border-emerald-600':'hover:bg-emerald-50/50'}`}
 >
 {s.isEveryone ? (
 <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
 <i className="ri-team-fill"></i>
 </div>
 ) : s.photo ? (
 <img src={s.photo} className="w-6 h-6 rounded-full object-cover border border-emerald-100 flex-shrink-0"alt=""/>
 ) : (
 <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
 {s.name[0].toUpperCase()}
 </div>
 )}
 <div className="flex flex-col min-w-0">
 <span className="font-semibold text-slate-800 dark:text-white truncate">{s.name}</span>
 {!s.isEveryone && <span className="text-[9px] text-slate-400 truncate">{s.email}</span>}
 </div>
 </button>
 );
 })}
 </div>
 )}

 {/* Reply To banner quote */}
 {replyingTo && (
 <div className="flex items-center justify-between gap-3 mb-2 px-3 py-1.5 bg-emerald-50/60 rounded-xl border-l-4 border-emerald-500 shadow-sm">
 <div className="min-w-0">
 <p className="text-[9px] font-semibold text-emerald-700">
 Replying to @{replyingTo.posterName}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-300 truncate leading-snug">
 {replyingTo.body}
 </p>
 </div>
 <button 
 onClick={() => setReplyingTo(null)}
 className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-full transition-colors flex-shrink-0 flex items-center justify-center cursor-pointer">
 <i className="ri-close-line text-[13px]"></i>
 </button>
 </div>
 )}

 {/* Input box form */}
 {!user ? (
 <div className="bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] p-3 rounded-lg border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] text-center">
 <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold mb-2">You must be logged in to participate in the conversation.</p>
 <Link to="/login"className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
 Log In
 </Link>
 </div>
 ) : thread.isLocked ? (
 <div className="bg-red-50 py-3 px-4 rounded-lg border border-red-100 text-center flex items-center justify-center gap-1.5 text-xs text-red-600 font-bold">
 <i className="ri-lock-fill"></i>
 This discussion thread has been locked. You cannot send messages.
 </div>
 ) : (
 <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto w-full">
 <textarea
 ref={inputRef}
 value={messageText}
 onChange={handleTyping}
 onPaste={handlePaste}
 onDragOver={(e) => e.preventDefault()}
 onDrop={handleDrop}
 onKeyDown={(e) => {
 if (mentionSuggestions.length > 0) {
 if (e.key ==='ArrowDown') {
 e.preventDefault();
 setFocusedMentionIdx(prev => (prev + 1) % mentionSuggestions.length);
 } else if (e.key ==='ArrowUp') {
 e.preventDefault();
 setFocusedMentionIdx(prev => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
 } else if (e.key ==='Enter'|| e.key ==='Tab') {
 e.preventDefault();
 handleSelectMention(mentionSuggestions[focusedMentionIdx]);
 } else if (e.key ==='Escape') {
 e.preventDefault();
 setMentionQuery(null);
 setMentionSuggestions([]);
 }
 } else {
 // Submit message on enter key without shift key
 if (e.key ==='Enter'&& !e.shiftKey) {
 e.preventDefault();
 handleSend();
 }
 }
 }}
 disabled={sending}
 placeholder={`Message #${thread.title} — Enter to send, Shift+Enter for new line`}
 rows={1}
 data-lenis-prevent="true"className="flex-grow resize-none max-h-32 overflow-y-auto px-4 py-2.5 bg-emerald-50/20 text-[13px] text-slate-900 dark:text-white rounded-lg border border-emerald-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400 transition-all font-medium leading-relaxed shadow-sm"style={{ height:'auto'}}
 onInput={(e) => {
 e.target.style.height ='auto';
 e.target.style.height = Math.min(e.target.scrollHeight, 128) +'px';
 }}
 />
 
 <button
 type="submit"disabled={!messageText.trim() || sending}
 className="w-10 h-10 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:cursor-not-allowed cursor-pointer">
 {sending ? (
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <i className="ri-send-plane-fill text-[13px]"></i>
 )}
 </button>
 </form>
 )}
 </div>

 </div>

 {/* Right Drawer: Thread Members Info Panel */}
 {showInfoPanel && (
 <aside className="w-64 border-l border-[#dbe6df] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] h-full flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-200 select-none">
 <div className="p-4 border-b border-slate-100 flex items-center justify-between">
 <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Thread Members</h3>
 <button 
 onClick={() => setShowInfoPanel(false)}
 className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-lg transition-colors cursor-pointer">
 <i className="ri-close-line text-[13px]"></i>
 </button>
 </div>

 <div 
 data-lenis-prevent="true"className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
 {/* Online Members */}
 <div>
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
 Online ({onlineUsers.length})
 </h4>
 {onlineUsers.length === 0 ? (
 <p className="text-[10px] text-slate-400 italic pl-1">No members online.</p>
 ) : (
 <div className="space-y-2.5">
 {onlineUsers.map(u => (
 <div key={u.email} className="flex items-center gap-2.5">
 <div className="relative flex-shrink-0">
 {u.photo ? (
 <img src={u.photo} className="w-6 h-6 rounded-full object-cover border border-slate-100"alt=""/>
 ) : (
 <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold border border-emerald-100">
 {u.name[0].toUpperCase()}
 </div>
 )}
 <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full ring-1 ring-white bg-emerald-400"/>
 </div>
 <div className="flex flex-col min-w-0">
 <span className="text-xs font-semibold text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] truncate">{u.name}</span>
 <span className="text-[8px] text-slate-400 truncate">{u.email}</span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Historical Thread Participants */}
 <div>
 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
 <i className="ri-history-line text-[11px]"></i>
 Thread Participants ({participants.length})
 </h4>
 <div className="space-y-2.5">
 {participants.map(p => {
 const online = isUserOnline(p.email);
 return (
 <div key={p.email} className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity">
 <div className="relative flex-shrink-0">
 {p.photo ? (
 <img src={p.photo} className="w-6 h-6 rounded-full object-cover border border-slate-150"alt=""/>
 ) : (
 <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white text-[10px] font-bold border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]">
 {p.name[0].toUpperCase()}
 </div>
 )}
 {online && (
 <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full ring-1 ring-white bg-emerald-400"/>
 )}
 </div>
 <div className="flex flex-col min-w-0">
 <div className="flex items-center gap-1">
 <span className="text-xs font-semibold text-slate-750 truncate">{p.name}</span>
 {p.isStarter && (
 <span className="text-[7px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-1 rounded font-bold uppercase select-none">OP</span>
 )}
 </div>
 <span className="text-[8px] text-slate-400 truncate">{p.email}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </aside>
 )}

 </div>
 );
}
