import React, { useEffect, Suspense } from 'react';
import { useLocation, useOutlet, ScrollRestoration } from 'react-router';
import Navbar from '../common/Navbar';
import Footer from '../Footer/Footer';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { socket } from '../../hooks/useSocket';
import { useIsFetching } from '@tanstack/react-query';
import TopProgressBar from '../common/TopProgressBar';
import { useTheme } from '../../hooks/useTheme';
import FloatingCivicBot from '../AI/FloatingCivicBot';
import PageTitle from '../common/PageTitle';
import TourOverlay from '../common/TourOverlay';
import HelpNotification from '../common/HelpNotification';
import ConnectionStatusBanner from '../common/ConnectionStatusBanner';
import ScrollProgressButton from '../common/ScrollProgressButton';
import AuthPrompt from '../common/AuthPrompt';

const getPageTitle = (pathname) => {
 if (pathname ==='/'|| pathname ==='/home') return'Home';
 if (pathname ==='/recent-activities') return'Recent Activities';
 if (pathname ==='/gallery') return'Before & After Gallery';
 if (pathname ==='/issues') return'Active Incident Reports';
 if (pathname ==='/issues/add') return'Report an Incident';
 if (pathname ==='/issues/my') return'My Reported Incidents';
 if (pathname ==='/issues/verify') return'Verify Incident Reports';
 if (pathname ==='/lost-found') return'Lost & Found Bulletin';
 if (pathname ==='/lost-found/add-lost') return'Report Lost Item';
 if (pathname ==='/lost-found/add-found') return'Report Found Item';
 if (pathname ==='/lost-found/my') return'My Lost & Found Items';
 if (pathname ==='/animals') return'Stray Animal Care';
 if (pathname ==='/animals/add') return'Report Animal in Need';
 if (pathname ==='/animals/my') return'My Animal Reports';
 if (pathname ==='/animals/feeding-drives') return'Stray Feeding Drives';
 if (pathname ==='/membership/request') return'Residency Verification';
 if (pathname ==='/ai-assistant') return'CivicBot AI Assistant';
 if (pathname ==='/profile') return'My Profile';
 if (pathname ==='/payment-success') return'Payment Success';
 if (pathname ==='/payment-failure') return'Payment Failure';
 if (pathname ==='/noticeboard') return'Community Notices';
 if (pathname ==='/volunteers') return'Volunteer Hub';
 if (pathname ==='/volunteers/register') return'Register as Volunteer';
 if (pathname ==='/volunteer-dashboard') return'Volunteer Dashboard';
 if (pathname ==='/forum') return'Discussion Forum';
 if (pathname ==='/map') return'Community Cleanliness Map';
 if (pathname ==='/leaderboard') return'Leaderboard';
 if (pathname ==='/fund') return'Fund Cleanup Projects';
 if (pathname ==='/ngos') return'NGO Directory';
 if (pathname ==='/ngos/register') return'Register NGO';
 if (pathname ==='/polls') return'Community Polls';
 if (pathname ==='/cleanup-events') return'Cleanup Events';
 if (pathname ==='/cleanup-events/organize') return'Organize Cleanup Event';
 if (pathname ==='/press-kit') return'Press Kit';
 if (pathname ==='/status') return'System Status';
 if (pathname ==='/community-guidelines') return'Community Guidelines';
 if (pathname ==='/goals-and-vision') return'Goals & Vision';
 if (pathname ==='/user-manual') return'User Manual & Help Center';

 // Admin routes
 if (pathname ==='/admin') return'Admin Stats - Dashboard';
 if (pathname ==='/admin/queue') return'Incident Queue - Admin';
 if (pathname ==='/admin/users') return'User Management - Admin';
 if (pathname ==='/admin/membership') return'Verification Requests - Admin';
 if (pathname ==='/admin/posts') return'Forum Moderation - Admin';
 if (pathname ==='/admin/cleanup-events') return'Event Moderation - Admin';
 if (pathname ==='/admin/forum') return'Forum Channels - Admin';
 if (pathname ==='/admin/ngos') return'NGO Approvals - Admin';
 if (pathname ==='/admin/notices') return'Notices Management - Admin';

 // Dynamic routes (fallback titles before dynamic content loads)
 if (pathname.startsWith('/issues/')) return'Incident Details';
 if (pathname.startsWith('/lost-found/')) return'Lost & Found Details';
 if (pathname.startsWith('/animals/')) return'Animal Details';
 if (pathname.startsWith('/user/')) return'User Public Profile';
 if (pathname.startsWith('/noticeboard/')) return'Notice Details';
 if (pathname.startsWith('/forum/')) return'Thread Discussion';
 if (pathname.startsWith('/ngos/')) return'NGO Profile';
 if (pathname.startsWith('/cleanup-events/')) return'Cleanup Event Details';

 return'Community Cleanliness & Care';
};

const PageLoader = () => (
  <div className="flex-grow w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-[#050a08]/50">
    <div className="w-12 h-12 rounded-[14px] bg-slate-100 dark:bg-[#1e3040] border-2 border-slate-200 dark:border-[#14241d] shadow-sm flex items-center justify-center mb-2 animate-bounce">
      <i className="ri-leaf-fill text-2xl text-emerald-500"></i>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <p className="text-xs font-bold text-[#0f766e] dark:text-teal-400 uppercase tracking-widest">Loading nest...</p>
  </div>
);

const Layout = () => {
 const location = useLocation();
 const outlet = useOutlet();
 const { isDark } = useTheme();

 useEffect(() => {
 socket.connect();
 return () => socket.disconnect();
 }, []);


 return (
 <div className="min-h-screen w-full flex flex-col font-body antialiased selection:bg-teal-500/30 selection:text-teal-900 dark:selection:text-teal-100">
 <PageTitle title={getPageTitle(location.pathname)} />
 <TopProgressBar />
 <Navbar />
 {/* Spacer for fixed navbar */}
 <div className="h-[4rem] shrink-0"aria-hidden="true"/>
  
 {/* Main content: a short fade-in on route change. No exit animation, so
     the next page never waits for the previous one to leave. */}
 <motion.main
 key={location.pathname}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className="flex-grow flex flex-col w-full">
 <Suspense fallback={<PageLoader />}>
 <div className="flex-grow flex flex-col w-full">
 {React.cloneElement(outlet, { key: location.pathname })}
 {/* Persistent Footer wrapped inside Suspense & main motion container */}
 {!location.pathname.startsWith('/forum') && <Footer />}
 </div>
 </Suspense>
 </motion.main>

 <FloatingCivicBot />
 <ScrollProgressButton />
 <ConnectionStatusBanner />
 <TourOverlay />
 <HelpNotification />
 <AuthPrompt />
 {/* New pages start at the top; Back/Forward restore where you were */}
 <ScrollRestoration />
 <Toaster 
 position="bottom-right"containerStyle={{ zIndex: 99999 }}
 toastOptions={{
 style: {
 zIndex: 99999,
 background: isDark ?'#111c21':'#0f172a',
 color: isDark ?'#e2e8f0':'#f1f5f9',
 border:`1px solid ${isDark ?'#1e3040':'#1e293b'}`,
 borderRadius:'12px',
 fontSize:'14px',
 }
 }}
 />
 </div>
 );
};

export default Layout;
