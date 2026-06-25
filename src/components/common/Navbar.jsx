import React, { useState, useEffect, useCallback, useRef } from"react";
import { Link, useNavigate, useLocation } from"react-router";
import { motion, AnimatePresence } from"framer-motion";
import { useAuth } from"../../hooks/useAuth";
import { useRole } from"../../hooks/useRole";
import { getScrollY } from"../../hooks/useLenis";
import NotificationDropdown from"../Notifications/NotificationDropdown";
import MobileNotificationsModal from"../Notifications/MobileNotificationsModal";
import { useQuery } from"@tanstack/react-query";
import useAxiosPublic from"../../hooks/useAxiosPublic";
import useAxiosSecure from"../../hooks/useAxiosSecure";
import ThemeToggle from"./ThemeToggle";
import GlobalSearchModal from "./GlobalSearchModal";

const SCROLL_THRESHOLD = 15;

const navbarStyles =`@keyframes compass-spin-wiggle {
 0% { transform: rotate(0deg); color: var(--compass-idle); }
 20% { transform: rotate(360deg); color: var(--compass-active); }
 35% { transform: rotate(385deg); color: var(--compass-active); }
 50% { transform: rotate(346deg); color: var(--compass-active); }
 65% { transform: rotate(368deg); color: var(--compass-active); }
 80% { transform: rotate(360deg); color: var(--compass-active); }
 100% { transform: rotate(360deg); color: var(--compass-idle); }
}
.animated-compass {
 display: inline-flex !important;
 align-items: center;
 justify-content: center;
 width: 24px;
 height: 24px;
 animation: compass-spin-wiggle 4.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
 transform-origin: center center !important;
 --compass-idle: #64748b;
 --compass-active: #0f766e;
}
.dark .animated-compass {
 --compass-idle: #94a3b8;
 --compass-active: #2dd4bf;
}
.fire-outer { animation: flicker-outer 0.7s ease-in-out infinite; }
.fire-mid   { animation: flicker-mid   0.55s ease-in-out infinite; animation-delay: -0.1s; }
.fire-inner { animation: flicker-inner 0.45s ease-in-out infinite; animation-delay: -0.2s; }
.fire-core  { animation: flicker-core  0.35s ease-in-out infinite; animation-delay: -0.05s; }
.fire-yolk  { animation: flicker-yolk  0.4s ease-in-out infinite; animation-delay: -0.15s; }
.fire-ember-1 { animation: ember1 0.9s ease-out infinite; }
.fire-ember-2 { animation: ember2 1.1s ease-out infinite; animation-delay: 0.3s; }
.fire-ember-3 { animation: ember3 1.0s ease-out infinite; animation-delay: 0.6s; }
.fire-core-group {
  transform-origin: 50px 95px;
  animation: fire-base-wobble 0.9s ease-in-out infinite alternate;
}

@keyframes fire-base-wobble {
  0%   { transform: rotate(-3deg) scale(0.95); }
  100% { transform: rotate(3deg) scale(1.06); }
}
@keyframes flicker-outer {
  0%   { d: path("M50,95 C30,90 10,75 8,55 C6,38 18,25 22,18 C18,30 24,38 28,32 C24,22 30,10 38,5 C34,16 40,24 46,20 C44,12 50,2 50,2 C50,2 56,12 54,20 C60,24 66,16 62,5 C70,10 76,22 72,32 C76,38 82,30 78,18 C82,25 94,38 92,55 C90,75 70,90 50,95Z"); }
  20%  { d: path("M50,95 C28,92 8,76 7,54 C6,36 20,22 25,16 C20,28 27,37 30,30 C26,20 33,8 40,4 C36,15 43,23 48,18 C47,10 50,2 50,2 C50,2 53,10 52,18 C57,23 64,15 60,4 C67,8 74,20 70,30 C73,37 80,28 75,16 C80,22 94,36 93,54 C92,76 72,92 50,95Z"); }
  40%  { d: path("M50,95 C32,88 12,73 10,53 C8,35 22,23 26,15 C22,28 29,36 32,29 C27,18 35,7 42,3 C37,14 44,22 49,17 C47,9 50,2 50,2 C50,2 53,9 51,17 C56,22 63,14 58,3 C65,7 73,18 68,29 C71,36 78,28 74,15 C78,23 92,35 90,53 C88,73 68,88 50,95Z"); }
  60%  { d: path("M50,95 C29,91 9,74 8,52 C7,34 21,21 26,14 C21,27 28,36 31,28 C27,17 34,6 42,2 C37,13 45,21 49,16 C48,8 50,2 50,2 C50,2 52,8 51,16 C55,21 63,13 58,2 C66,6 73,17 69,28 C72,36 79,27 74,14 C79,21 93,34 92,52 C91,74 71,91 50,95Z"); }
  80%  { d: path("M50,95 C31,89 11,74 9,54 C7,36 19,24 24,17 C20,29 26,38 29,31 C25,21 32,9 40,5 C35,16 42,24 47,19 C46,11 50,2 50,2 C50,2 54,11 53,19 C58,24 65,16 60,5 C68,9 75,21 71,31 C74,38 80,29 76,17 C81,24 93,36 91,54 C89,74 69,89 50,95Z"); }
  100% { d: path("M50,95 C30,90 10,75 8,55 C6,38 18,25 22,18 C18,30 24,38 28,32 C24,22 30,10 38,5 C34,16 40,24 46,20 C44,12 50,2 50,2 C50,2 56,12 54,20 C60,24 66,16 62,5 C70,10 76,22 72,32 C76,38 82,30 78,18 C82,25 94,38 92,55 C90,75 70,90 50,95Z"); }
}
@keyframes flicker-mid {
  0%   { d: path("M50,93 C35,88 20,76 18,60 C16,46 26,35 30,27 C28,36 34,43 38,37 C35,28 40,16 47,11 C44,20 48,28 50,23 C52,28 56,20 53,11 C60,16 65,28 62,37 C66,43 72,36 70,27 C74,35 84,46 82,60 C80,76 65,88 50,93Z"); }
  25%  { d: path("M50,93 C33,89 18,77 16,59 C14,44 25,33 29,25 C27,35 33,42 37,35 C34,26 39,14 46,10 C43,19 48,27 50,22 C52,27 57,19 54,10 C61,14 66,26 63,35 C67,42 73,35 71,25 C75,33 86,44 84,59 C82,77 67,89 50,93Z"); }
  50%  { d: path("M50,93 C36,87 21,75 19,58 C17,43 28,32 32,24 C29,34 36,41 39,34 C36,25 41,13 48,9 C44,18 49,26 50,21 C51,26 56,18 52,9 C59,13 64,25 61,34 C64,41 70,34 68,24 C72,32 83,43 81,58 C79,75 64,87 50,93Z"); }
  75%  { d: path("M50,93 C34,88 19,76 17,59 C15,44 26,33 30,26 C27,36 34,43 38,36 C34,27 40,15 47,10 C43,20 48,28 50,22 C52,28 57,20 53,10 C60,15 66,27 62,36 C66,43 72,36 70,26 C74,33 85,44 83,59 C81,76 66,88 50,93Z"); }
  100% { d: path("M50,93 C35,88 20,76 18,60 C16,46 26,35 30,27 C28,36 34,43 38,37 C35,28 40,16 47,11 C44,20 48,28 50,23 C52,28 56,20 53,11 C60,16 65,28 62,37 C66,43 72,36 70,27 C74,35 84,46 82,60 C80,76 65,88 50,93Z"); }
}
@keyframes flicker-inner {
  0%   { d: path("M50,90 C40,85 30,78 28,67 C26,57 33,48 37,42 C36,50 40,55 44,51 C42,43 45,34 50,30 C55,34 58,43 56,51 C60,55 64,50 63,42 C67,48 74,57 72,67 C70,78 60,85 50,90Z"); }
  30%  { d: path("M50,90 C38,86 28,79 26,66 C24,55 32,46 36,40 C35,48 39,54 43,49 C41,41 44,32 50,28 C56,32 59,41 57,49 C61,54 65,48 64,40 C68,46 76,55 74,66 C72,79 62,86 50,90Z"); }
  60%  { d: path("M50,90 C41,84 31,77 29,65 C27,54 35,45 39,39 C37,47 42,53 45,48 C43,40 46,31 50,27 C54,31 57,40 55,48 C58,53 63,47 61,39 C65,45 73,54 71,65 C69,77 59,84 50,90Z"); }
  100% { d: path("M50,90 C40,85 30,78 28,67 C26,57 33,48 37,42 C36,50 40,55 44,51 C42,43 45,34 50,30 C55,34 58,43 56,51 C60,55 64,50 63,42 C67,48 74,57 72,67 C70,78 60,85 50,90Z"); }
}
@keyframes flicker-core {
  0%   { d: path("M50,87 C44,84 38,79 37,72 C36,65 41,59 44,55 C43,61 46,65 49,62 C48,56 50,50 50,47 C50,50 52,56 51,62 C54,65 57,61 56,55 C59,59 64,65 63,72 C62,79 56,84 50,87Z"); }
  35%  { d: path("M50,87 C43,85 37,80 36,71 C35,63 40,57 43,53 C42,59 45,64 48,60 C47,54 50,48 50,45 C50,48 53,54 52,60 C55,64 58,59 57,53 C60,57 65,63 64,71 C63,80 57,85 50,87Z"); }
  65%  { d: path("M50,87 C45,83 39,78 38,70 C37,62 42,56 45,52 C44,58 47,63 50,59 C49,53 50,47 50,44 C50,47 51,53 50,59 C53,63 56,58 55,52 C58,56 63,62 62,70 C61,78 55,83 50,87Z"); }
  100% { d: path("M50,87 C44,84 38,79 37,72 C36,65 41,59 44,55 C43,61 46,65 49,62 C48,56 50,50 50,47 C50,50 52,56 51,62 C54,65 57,61 56,55 C59,59 64,65 63,72 C62,79 56,84 50,87Z"); }
}
@keyframes flicker-yolk {
  0%   { d: path("M50,85 C46,83 43,80 42,76 C41,71 44,67 50,65 C56,67 59,71 58,76 C57,80 54,83 50,85Z"); }
  40%  { d: path("M50,85 C45,84 42,81 41,76 C40,70 43,66 50,64 C57,66 60,70 59,76 C58,81 55,84 50,85Z"); }
  70%  { d: path("M50,85 C47,82 44,79 43,75 C42,70 45,66 50,64 C55,66 58,70 57,75 C56,79 53,82 50,85Z"); }
  100% { d: path("M50,85 C46,83 43,80 42,76 C41,71 44,67 50,65 C56,67 59,71 58,76 C57,80 54,83 50,85Z"); }
}
@keyframes ember1 {
  0%   { transform: translate(50px, 30px) scale(1); opacity: 1; }
  100% { transform: translate(38px, 0px) scale(0); opacity: 0; }
}
@keyframes ember2 {
  0%   { transform: translate(52px, 25px) scale(1); opacity: 1; }
  100% { transform: translate(62px, -4px) scale(0); opacity: 0; }
}
@keyframes ember3 {
  0%   { transform: translate(48px, 20px) scale(1); opacity: 0.8; }
  100% { transform: translate(44px, -6px) scale(0); opacity: 0; }
}`;

// Helpers for LeetCode-style active streak box layout
const getWeekDays = () => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - currentDayOfWeek + i);
    weekDays.push(day);
  }
  return weekDays;
};

const isDayActive = (dateToCheck, lastActiveDateStr, currentStreak) => {
  if (!lastActiveDateStr || !currentStreak) return false;
  const lastActiveDate = new Date(lastActiveDateStr);
  const d1 = new Date(dateToCheck);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(lastActiveDate);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays < currentStreak;
};

const getContributionGrid = (lastActiveDateStr, currentStreak, userEmail) => {
  const today = new Date();
  const days = [];
  
  const hash = userEmail ? Array.from(userEmail).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0) : 0;
  let seed = hash;
  const seededRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 167; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const isActive = isDayActive(date, lastActiveDateStr, currentStreak);
    let level = 0;
    
    if (isActive) {
      level = Math.floor(seededRandom() * 3) + 2; 
    } else {
      const r = seededRandom();
      if (r > 0.90) level = 1;
      else if (r > 0.96) level = 2;
      else if (r > 0.98) level = 3;
      else if (r > 0.995) level = 4;
    }
    
    days.push({ date, level });
  }

  const columns = [];
  for (let i = 0; i < 24; i++) {
    columns.push(days.slice(i * 7, (i + 1) * 7));
  }
  
  return columns;
};

const FireIcon = ({ size = 16, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Fire"
      role="img"
      style={{ overflow: 'visible' }}
    >
      <g className="fire-core-group">
        <path
          className="fire-outer"
          fill="#D94030"
          d="M50,95 C30,90 10,75 8,55 C6,38 18,25 22,18 C18,30 24,38 28,32 C24,22 30,10 38,5 C34,16 40,24 46,20 C44,12 50,2 50,2 C50,2 56,12 54,20 C60,24 66,16 62,5 C70,10 76,22 72,32 C76,38 82,30 78,18 C82,25 94,38 92,55 C90,75 70,90 50,95Z"
        />
        <path
          className="fire-mid"
          fill="#F05A28"
          d="M50,93 C35,88 20,76 18,60 C16,46 26,35 30,27 C28,36 34,43 38,37 C35,28 40,16 47,11 C44,20 48,28 50,23 C52,28 56,20 53,11 C60,16 65,28 62,37 C66,43 72,36 70,27 C74,35 84,46 82,60 C80,76 65,88 50,93Z"
        />
        <path
          className="fire-inner"
          fill="#F5891A"
          d="M50,90 C40,85 30,78 28,67 C26,57 33,48 37,42 C36,50 40,55 44,51 C42,43 45,34 50,30 C55,34 58,43 56,51 C60,55 64,50 63,42 C67,48 74,57 72,67 C70,78 60,85 50,90Z"
        />
        <path
          className="fire-core"
          fill="#FBBB10"
          d="M50,87 C44,84 38,79 37,72 C36,65 41,59 44,55 C43,61 46,65 49,62 C48,56 50,50 50,47 C50,50 52,56 51,62 C54,65 57,61 56,55 C59,59 64,65 63,72 C62,79 56,84 50,87Z"
        />
        <path
          className="fire-yolk"
          fill="#FDE97A"
          d="M50,85 C46,83 43,80 42,76 C41,71 44,67 50,65 C56,67 59,71 58,76 C57,80 54,83 50,85Z"
        />
      </g>
      <circle className="fire-ember-1" cx="0" cy="0" r="1.5" fill="#FBBB10" />
      <circle className="fire-ember-2" cx="0" cy="0" r="1.2" fill="#F5891A" />
      <circle className="fire-ember-3" cx="0" cy="0" r="1.0" fill="#FDE97A" />
    </svg>
  );
};

const Navbar = () => {
 const { user, logOut } = useAuth();
 const [role, isRoleLoading, isVolunteer] = useRole();
 const navigate = useNavigate();
 const location = useLocation();
 const [menuOpen, setMenuOpen] = useState(false);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
 const [searchModalOpen, setSearchModalOpen] = useState(false);
 const menuRef = useRef(null);

 useEffect(() => {
    const handleOpen = () => setDrawerOpen(true);
    const handleClose = () => setDrawerOpen(false);
    window.addEventListener("tour:open-drawer", handleOpen);
    window.addEventListener("tour:close-drawer", handleClose);
    return () => {
      window.removeEventListener("tour:open-drawer", handleOpen);
      window.removeEventListener("tour:close-drawer", handleClose);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("tour:drawer-toggled"));
    }, 300);
    return () => clearTimeout(timer);
  }, [drawerOpen]);

 const [unreadCount, setUnreadCount] = useState(0);
 const [hasUrgent, setHasUrgent] = useState(false);
 const [activePollsCount, setActivePollsCount] = useState(0);
 const axiosPublic = useAxiosPublic();
 const axiosSecure = useAxiosSecure();

 const { data: notices = [] } = useQuery({
 queryKey: ["announcements"],
 queryFn: () => axiosPublic.get("/announcements").then((r) => r.data),
 staleTime: 5 * 60 * 1000,
 });

 const { data: notifications = [] } = useQuery({
 queryKey: ["notifications"],
 queryFn: () => axiosSecure.get("/notifications").then((r) => r.data),
 enabled: !!user,
 refetchInterval: 10000,
 });
 const userUnreadCount = notifications.filter(n => !n.isRead).length;

  const streakQuery = useQuery({
  queryKey: ['streak', user?.email],
  queryFn: () => axiosSecure.get('/users/my/streak').then(r => r.data),
  enabled: !!user,
  staleTime: 5 * 60 * 1000, // fetch every 5 minutes only
  });
  const streak = streakQuery.data ? streakQuery.data : (user ? { current: 0, best: 0, lastActiveDate: null } : null);

 const { data: pollStats } = useQuery({
 queryKey: ["polls-stats"],
 queryFn: () => axiosPublic.get("/polls/stats").then((r) => r.data),
 refetchInterval: 5000,
 });

 useEffect(() => {
 if (pollStats) {
 setActivePollsCount(pollStats.active || 0);
 }
 }, [pollStats]);

 useEffect(() => {
 if (!notices || notices.length === 0) {
 setUnreadCount(0);
 setHasUrgent(false);
 return;
 }

 try {
 const readIds = JSON.parse(localStorage.getItem("readNoticeIds") ||"[]");
 const unread = notices.filter(n => !readIds.includes(n._id));
 setUnreadCount(unread.length);
 setHasUrgent(unread.some(n => n.priority?.toLowerCase() ==='urgent'));
 } catch (e) {
 console.error("Failed to parse readNoticeIds:", e);
 }
 }, [notices, location.pathname]);

 // When visiting noticeboard, mark all as read
 useEffect(() => {
 if (location.pathname ==="/noticeboard"&& notices.length > 0) {
 const ids = notices.map(n => n._id);
 localStorage.setItem("readNoticeIds", JSON.stringify(ids));
 setUnreadCount(0);
 setHasUrgent(false);
 }
 }, [location.pathname, notices]);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (menuRef.current && !menuRef.current.contains(event.target)) {
 setMenuOpen(false);
 }
 };
 if (menuOpen) {
 document.addEventListener("mousedown", handleClickOutside);
 }
 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 };
 }, [menuOpen]);

 const mainNavItems = [
 { name:"Home", path:"/"},
 { name:"Issues", path:"/issues"},
 { name:"Notices", path:"/noticeboard"},
 { name:"Volunteers", path:"/volunteers"},
 { name:"Polls", path:"/polls", badge: activePollsCount },
 ];
 
 if (role ==='admin') {
 mainNavItems.push({ name:"Admin", path:"/admin"});
 }

 const handlePrefetch = (name) => {
 try {
 if (name ==='Issues') import('../Issues/AllIssues');
 if (name ==='Notices') import('../Noticeboard/Noticeboard');
 if (name ==='Volunteers') import('../Volunteers/VolunteerHub');
 if (name ==='Polls') import('../Polls/PollsBrowse');
 if (name ==='Admin') import('../Admin/AdminDashboard');
 } catch (e) {
 // Ignore prefetch errors
 }
 };

 const drawerNavItems = [
 { name:"Map", path:"/map", icon:"map"},
 { name:"Animals", path:"/animals", icon:"pets"},
 { name:"Lost & Found", path:"/lost-found", icon:"find_in_page"},
 { name:"Threads", path:"/forum", icon:"forum"},
 { name:"NGOs", path:"/ngos", icon:"diversity_3"},
 { name:"Leaderboard", path:"/leaderboard", icon:"leaderboard"},
 { name:"Gallery", path:"/gallery", icon:"photo_library"},
 { name:"User Manual", path:"/user-manual", icon:"help"},
 ];

 const updateScrolled = useCallback(() => {
 setScrolled(getScrollY() > SCROLL_THRESHOLD);
 }, []);

 useEffect(() => {
 updateScrolled();

 const lenis = window.lenis;
 if (lenis) {
 return lenis.on("scroll", updateScrolled);
 }

 window.addEventListener("scroll", updateScrolled, { passive: true });
 return () => window.removeEventListener("scroll", updateScrolled);
 }, [updateScrolled, location.pathname]);

 useEffect(() => {
 const lenis = window.lenis;
 if (!lenis) return undefined;

 if (drawerOpen) {
 lenis.stop();
 document.body.style.overflow ="hidden";
 } else {
 lenis.start();
 document.body.style.overflow ="";
 }

 return () => {
 lenis.start();
 document.body.style.overflow ="";
 };
 }, [drawerOpen]);

 // Close drawer on route change
 useEffect(() => {
 setDrawerOpen(false);
 }, [location.pathname]);

 const handleLogOut = async () => {
 try {
 await logOut();
 navigate("/Login");
 } catch (err) {
 console.error("Logout error:", err);
 }
 };

 const displayName = user?.displayName || user?.email?.split("@")[0] ||"Neighbour";
 const initials = displayName
 .split("")
 .map((w) => w[0])
 .join("")
 .toUpperCase()
 .slice(0, 2);

 const activeIndex = mainNavItems.findIndex(
 (item) => item.path === location.pathname || (item.path !=="/"&& location.pathname.startsWith(item.path))
 );

 return (
 <>
 <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
 <motion.div
  animate={{
  width: scrolled ?"95%":"100%",
  maxWidth: scrolled ?"64rem":"100%",
  borderRadius: scrolled ?"9999px":"0px",
  marginTop: scrolled ?"0.75rem": 0,
  paddingTop: scrolled ?"0.5rem":"0.75rem",
  paddingBottom: scrolled ?"0.5rem":"0.75rem",
  paddingLeft: scrolled ?"1.5rem":"2rem",
  paddingRight: scrolled ?"1.5rem":"2rem",
  boxShadow: scrolled
  ?"0 0.75rem 2.5rem -0.625rem rgba(0,0,0,0.08)":"0 1px 0 rgba(226, 232, 240, 0.6)",
  borderWidth: scrolled ?"1px":"0 0 1px 0",
  borderColor:"rgba(226, 232, 240, 0.6)",
  }}
  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
  className="pointer-events-auto flex items-center justify-between bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/85 dark:bg-[#0b1215]/85 backdrop-blur-xl border-solid border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040]/60 dark:border-[#1e3040]/60">
 {/* Left Area: Drawer Toggle + Logo */}
 <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
 <button
 onClick={() => setDrawerOpen(true)}
 id="tour-nav-drawer-toggle"
 className="p-2 -ml-2 text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] rounded-full transition-colors focus:outline-none flex items-center justify-center">
 <span className="material-symbols-outlined text-[26px]">menu</span>
 </button>
 
 {/* Logo */}
 <Link to="/"target="_self"className="flex items-center gap-2.5 group">
 <motion.div
  animate={{
  width: scrolled ? "2.25rem" : "2.5rem",
  height: scrolled ? "2.25rem" : "2.5rem",
  }}
  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
  className="hidden sm:flex rounded-[12px] bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] border-2 border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105">
 <img
 src="https://i.ibb.co/LD7Xxdky/Gemini-Generated-Image-wmnkxewmnkxewmnk.png"alt="CivicNest"className="w-full h-full object-cover"/>
 </motion.div>
 <div>
 <motion.span
  animate={{ fontSize: scrolled ?"1.125rem":"1.375rem"}}
  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
  className="block text-slate-900 dark:text-white tracking-tight leading-none"style={{ fontFamily:"'Montserrat', sans-serif", fontWeight: 900 }}
 >
 Civic<span className="text-[#0f766e]">Nest</span>
 </motion.span>
 <motion.span
  animate={{
  opacity: scrolled ? 0 : 1,
  maxHeight: scrolled ? 0 : 12,
  marginTop: scrolled ? 0 : 1,
  }}
  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
  className="hidden sm:block overflow-hidden text-[7px] font-bold uppercase tracking-widest text-[#0f766e]">
 Sustainable Urban Living
 </motion.span>
 </div>
 </Link>
 </div>

 {/* Nav Links with Rolling/Flipping Text */}
 <nav className="hidden lg:flex items-center gap-1 md:gap-2 relative">
 {mainNavItems.map((item, index) => {
 const isActive = activeIndex === index;
 const isNotices = item.name ==="Notices";
 const isPolls = item.name ==="Polls";
 return (
 <Link
 key={item.name}
 to={item.path}
 id={`tour-nav-${item.name.toLowerCase()}`}
 onMouseEnter={() => handlePrefetch(item.name)}
 className="relative inline-flex items-center px-3 py-2 text-[14.5px] font-bold group z-10">
 <span className="relative flex flex-col overflow-hidden h-[22px] justify-start items-center">
 <span
 className={`flex items-center justify-center h-[22px] transition-all duration-300 ease-out ${
 isActive 
 ?"text-[#0f766e]":"text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] group-hover:-translate-y-full"}`}
 >
 {item.name}
 </span>
 {!isActive && (
 <span
 className="absolute top-full left-0 flex items-center justify-center h-[22px] w-full text-[#0f766e] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-full">
 {item.name}
 </span>
 )}
 </span>

 {/* Absolute positioned notifications count badges in the top right corner */}
 {isPolls && activePollsCount > 0 && (
 <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center bg-emerald-600 text-white text-[9px] font-bold rounded-full border border-white shadow-sm select-none">
 {activePollsCount}
 </span>
 )}

 {isNotices && unreadCount > 0 && (
 <span className="absolute top-0.5 right-0.5 flex h-2 w-2 rounded-full border border-white bg-emerald-500">
 {hasUrgent && (
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
 )}
 <span className={`relative inline-flex rounded-full h-full w-full ${hasUrgent ?'bg-rose-500':'bg-emerald-500'}`}></span>
 </span>
 )}

 {isActive && (
 <motion.div
 layoutId="activeTabBackground"className="absolute inset-0 bg-[#0f766e]/10 rounded-full z-0"transition={{ type:"spring", stiffness: 350, damping: 30 }}
 />
 )}
 </Link>
 );
 })}
 </nav>

 {/* Right Area: Notification + User Menu */}
 <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
 <button 
  onClick={() => setSearchModalOpen(true)}
  className="p-1.5 text-slate-555 hover:bg-slate-100 dark:bg-[#1e3040] dark:hover:bg-[#1e3040] dark:text-[#cbd5e1] rounded-full transition-colors flex items-center justify-center focus:outline-none"
  >
  <i className="ri-search-line text-[20px]"></i>
  </button>
  <Link 
  to="/user-manual" 
  title="Help & User Manual"
  className="p-1.5 text-slate-555 hover:bg-slate-100 dark:bg-[#1e3040] dark:hover:bg-[#1e3040] dark:text-[#cbd5e1] rounded-full transition-colors flex items-center justify-center focus:outline-none shrink-0"
  >
  <i className="ri-question-line text-[20px]"></i>
  </Link>
 {user && (
 <>
 <div className="hidden lg:block">
 <NotificationDropdown />
 </div>
 <button
 onClick={() => setMobileNotifOpen(true)}
 className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] transition-colors text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:text-white shrink-0">
 <span className="material-symbols-outlined text-2xl tracking-tight">notifications</span>
 {userUnreadCount > 0 && (
 <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
 {userUnreadCount > 9 ?"9+": userUnreadCount}
 </span>
 )}
 </button>
 </>
 )}

 {user ? (
 <div className="relative"ref={menuRef}>
 <button
 onClick={() => setMenuOpen(!menuOpen)}
 id="tour-nav-profile"
 className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 dark:border-[#1e3040] dark:border-[#1e3040] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20">
 <div className="w-7 h-7 rounded-full overflow-hidden bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center text-xs font-bold shrink-0">
 {user.photoURL ? (
 <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover"/>
 ) : (
 initials
 )}
 </div>
 <svg
 width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"className={`text-slate-500 dark:text-slate-300 transition-transform duration-200 ${
 menuOpen ?"rotate-180":""}`}
 >
 <polyline points="6 9 12 15 18 9"/>
 </svg>
 </button>

 <AnimatePresence>
 {menuOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15, ease:"easeOut"}}
 className="absolute right-0 top-12 w-56 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-lg shadow-xl border border-slate-100 overflow-hidden origin-top-right z-50">
 <div className="px-4 py-3 bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215]/50">
 <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
 {displayName}
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{user.email}</p>
  {streak?.current > 0 && (
  <div className="mt-2 flex items-center gap-1.5 py-1 px-3 bg-orange-500/8 dark:bg-orange-500/15 rounded-full select-none w-fit hover:scale-105 transition-all duration-300">
  <FireIcon size={18} className="shrink-0" />
  <span className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
  Streak: {streak.current} {streak.current === 1 ?'day':'days'}
  </span>
  </div>
  )}
 </div>
 <div className="h-px bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]"/>
 <div className="py-2">
 <Link 
 to="/profile"target="_self"onClick={() => setMenuOpen(false)}
 className="block w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 Dashboard
 </Link>
 <Link 
 to="/issues/my"target="_self"onClick={() => setMenuOpen(false)}
 className="block w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 My Reports
 </Link>
 <Link 
 to="/user-manual"target="_self"onClick={() => setMenuOpen(false)}
 className="block w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors">
 User Manual
 </Link>
 </div>
 <div className="h-px bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040]"/>
 <div className="py-2">
 <button
 onClick={handleLogOut}
 className="w-full px-4 py-2 text-[13px] text-red-650 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2">
 <span className="material-symbols-outlined text-[18px] text-red-600 leading-none">logout</span>
 Sign out
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ) : (
 <Link
 to="/Login"target="_self"className="px-5 py-2 text-[13px] font-semibold text-white bg-[#0f766e] rounded-full hover:bg-[#0d645d] transition-all shadow-sm">
 Log in
 </Link>
 )}
 </div>
 </motion.div>
 </header>

 {/* Side Drawer */}
 <AnimatePresence>
 {drawerOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setDrawerOpen(false)}
 className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"/>
 <motion.div
 initial={{ x:"-100%"}}
 animate={{ x: 0 }}
 exit={{ x:"-100%"}}
 transition={{ type:"spring", damping: 25, stiffness: 200 }}
 className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] z-[70] shadow-2xl flex flex-col">
 <div className="p-5 border-b border-teal-500/15 flex items-center justify-between bg-teal-50/50 dark:bg-[#0d1d18]/60 shrink-0">
 <span className="text-[17px] font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
 <span
 className="animated-compass material-symbols-outlined text-[#0f766e] dark:text-[#2dd4bf] text-[24px]">
 explore
 </span>
 Explore
 </span>
 <button 
 onClick={() => setDrawerOpen(false)}
 className="p-1.5 text-slate-550 hover:bg-teal-600/10 hover:text-[#0f766e] dark:hover:bg-teal-500/15 dark:hover:text-[#2dd4bf] rounded-full transition-colors flex items-center justify-center">
 <span className="material-symbols-outlined text-[20px]">close</span>
 </button>
 </div>
 <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-1.5"data-lenis-prevent>
 {/* Mobile Main Nav Fallback (shows only on smaller screens) */}
 <div className="lg:hidden flex flex-col gap-1.5 mb-2 pb-2 border-b border-slate-100 shrink-0">
 {mainNavItems.map(item => {
 const isNotices = item.name ==="Notices";
 return (
 <Link
 key={item.name}
 to={item.path}
 onClick={() => setDrawerOpen(false)}
 className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
 location.pathname === item.path || (item.path !=="/"&& location.pathname.startsWith(item.path))
 ?"bg-[#0f766e]/10 text-[#0f766e] dark:bg-[#2dd4bf]/10 dark:text-[#2dd4bf]":"text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] dark:hover:bg-slate-800/50"}`}
 >
 <span>{item.name}</span>
 {isNotices && unreadCount > 0 && (
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${hasUrgent ?'bg-rose-100 text-rose-700 animate-pulse':'bg-[#0f766e]/10 text-[#0f766e]'}`}>
 {unreadCount} {hasUrgent ?'URGENT':'new'}
 </span>
 )}
 </Link>
 );
 })}
 </div>

 <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2 mb-1 shrink-0">Discover</span>
 
 {drawerNavItems
 .filter(item => item.name !=="Threads"|| (user && (role ==="member"|| role ==="admin"|| isVolunteer)))
 .map(item => (
 <Link
 key={item.name}
 to={item.path}
 onClick={() => setDrawerOpen(false)}
 id={`tour-drawer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
 className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#0f766e]/10 dark:hover:bg-[#2dd4bf]/10 hover:text-[#0f766e] dark:hover:text-[#2dd4bf] transition-colors font-bold text-[13px] shrink-0">
 <span className="material-symbols-outlined text-[20px] opacity-70">{item.icon}</span>
 {item.name}
 </Link>
 ))}
 
 <button
 onClick={() => {
 setDrawerOpen(false);
 setTimeout(() => {
 window.dispatchEvent(new Event('open-civic-bot'));
 }, 300);
 }}
 className="flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#0f766e]/10 dark:hover:bg-[#2dd4bf]/10 hover:text-[#0f766e] dark:hover:text-[#2dd4bf] transition-all font-bold text-[13px] group relative overflow-hidden cursor-pointer mt-1 text-left w-full shrink-0">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-[20px] opacity-70 group-hover:opacity-100 transition-opacity">smart_toy</span>
 <span>CivicBot AI Assistant</span>
 </div>
 <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm border border-indigo-400/20 shrink-0 flex items-center gap-0.5">
 AI <i className="ri-sparkling-fill text-[9px] animate-pulse"/>
 </span>
 </button>

 {user && (
 <>
 <div className="h-px bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] my-4 shrink-0"/>
 <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block shrink-0">Your Space</span>
 <Link
 to="/issues/my"target="_self"onClick={() => setDrawerOpen(false)}
 className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#0f766e]/10 hover:text-[#0f766e] transition-colors font-bold text-[13px] text-left shrink-0">
 <span className="material-symbols-outlined text-[20px] opacity-70">description</span>
 My Reports
 </Link>
 <Link
 to="/lost-found/my"target="_self"onClick={() => setDrawerOpen(false)}
 className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] hover:bg-[#0f766e]/10 hover:text-[#0f766e] transition-colors font-bold text-[13px] text-left shrink-0">
 <span className="material-symbols-outlined text-[20px] opacity-70">find_in_page</span>
 My Lost & Found
 </Link>
 <Link
 to="/profile"target="_self"onClick={() => setDrawerOpen(false)}
 className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#0f766e] bg-[#0f766e]/10 hover:bg-[#0f766e]/20 transition-all font-bold border border-[#0f766e]/20 shadow-sm text-[13px] group backdrop-blur-md mt-1 shrink-0">
 <span className="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
 Dashboard
 </Link>
 </>
 )}

  <Link
    to="/support"
    target="_self"
    onClick={() => setDrawerOpen(false)}
    className="relative flex items-center justify-between px-4 py-3.5 rounded-xl bg-gradient-to-r from-teal-600/10 to-emerald-600/10 hover:from-teal-600/20 hover:to-emerald-600/20 dark:from-teal-500/5 dark:to-emerald-500/5 dark:hover:from-teal-500/15 dark:hover:to-emerald-500/15 border border-teal-500/20 dark:border-teal-400/20 transition-all font-bold text-[13px] my-4 shrink-0 shadow-sm overflow-hidden group cursor-pointer"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    <div className="flex items-center gap-3 relative z-10">
      <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400 animate-pulse">
        volunteer_activism
      </span>
      <span className="text-slate-700 dark:text-[#cbd5e1] group-hover:text-[#0f766e] dark:group-hover:text-teal-300 transition-colors font-bold">
        Support CivicNest
      </span>
    </div>
    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold uppercase bg-teal-500/10 border border-teal-500/20 rounded px-2 py-0.5 tracking-wider relative z-10 shrink-0 group-hover:scale-105 transition-transform">
      Donate
    </span>
  </Link>

 {/* Preferences Section */}
 <div className="h-px bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] my-4 shrink-0"/>
 <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0">Preferences</span>
   {user && streak && (() => {
     const columns = getContributionGrid(streak.lastActiveDate, streak.current, user?.email);
     const allCells = columns.flat();
     const totalActiveDays = allCells.filter(c => c.level > 0).length;
     const totalSubmissions = allCells.reduce((acc, c) => acc + (c.level > 0 ? Math.floor(c.level * 1.5 + 1) : 0), 0);
     const maxStreak = Math.max(streak.best || 0, streak.current || 0);

     return (
       <div className="flex flex-col gap-3.5 px-4 py-4 rounded-2xl bg-white dark:bg-[#0a120e] transition-colors mb-2 select-none shrink-0 border border-slate-100 dark:border-slate-800/40 shadow-sm">
         {/* Header */}
         <div className="flex flex-col gap-0.5">
           <div className="flex items-center justify-between">
             <span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200">Contribution Calendar</span>
              <div className="flex items-center gap-1">
                <FireIcon size={18} className="shrink-0" />
                <span className="text-[11px] font-bold text-orange-500">{streak.current} day streak</span>
              </div>
           </div>
           <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
             {totalSubmissions} submissions in the past 24 weeks
           </span>
         </div>

         {/* LeetCode Contribution Grid */}
         <div className="flex justify-center py-1">
           <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[3px]">
             {columns.map((col, cIdx) => (
               <div key={cIdx} className="flex flex-col gap-[3px]">
                 {col.map((cell, rIdx) => (
                   <div
                     key={rIdx}
                     className={`w-2 h-2 rounded-[1.5px] transition-all hover:scale-125 cursor-pointer ${
                       cell.level === 0 ? 'bg-slate-100 dark:bg-slate-800/60' :
                       cell.level === 1 ? 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300/20' :
                       cell.level === 2 ? 'bg-emerald-300 dark:bg-emerald-800/60' :
                       cell.level === 3 ? 'bg-emerald-500 dark:bg-emerald-600' :
                       'bg-emerald-600 dark:bg-emerald-400'
                     }`}
                     title={`${cell.date.toLocaleDateString()}: ${cell.level === 0 ? 'No' : cell.level * 2} contributions`}
                   />
                 ))}
               </div>
             ))}
           </div>
         </div>

         {/* Footer Stats */}
         <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/40">
           <span>Active Days: <strong className="text-slate-650 dark:text-slate-350">{totalActiveDays}</strong></span>
           <span>Max Streak: <strong className="text-slate-650 dark:text-slate-350">{maxStreak}</strong></span>
         </div>
       </div>
     );
   })()}
 <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-700 dark:text-[#cbd5e1] dark:text-[#cbd5e1] bg-slate-50 dark:bg-[#0b1215] dark:bg-[#0b1215] transition-colors font-bold text-[13px] shrink-0">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-[20px] opacity-70">dark_mode</span>
 Dark Mode
 </div>
 <ThemeToggle />
 </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>

 <MobileNotificationsModal 
 isOpen={mobileNotifOpen} 
 onClose={() => setMobileNotifOpen(false)} 
 />
 <GlobalSearchModal 
  isOpen={searchModalOpen} 
  onClose={() => setSearchModalOpen(false)} 
  />
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}>
    <defs>
      <filter id="fire-turbulence">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.85" numOctaves="3" result="noise">
          <animate attributeName="baseFrequency" values="0.04 0.85; 0.04 0.95; 0.04 0.85" dur="1.2s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
 <style>{navbarStyles}</style>
 </>
 );
};

export default Navbar;
