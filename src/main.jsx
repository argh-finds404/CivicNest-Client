import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'remixicon/fonts/remixicon.css';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import AuthProvider from './components/contexts/AuthProvider';
import { HelmetProvider } from 'react-helmet-async';

import React, { Suspense, lazy } from 'react';
import ChunkErrorBoundary from './components/common/ChunkErrorBoundary';

import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Layout from './components/Layout/Layout';
import PrivateRoute from './routes/PrivateRoute';

const AllIssues = lazy(() => import('./components/Issues/AllIssues'));
const AddIssue = lazy(() => import('./components/Issues/AddIssue'));
const EditIssue = lazy(() => import('./components/Issues/EditIssue'));
const IssueDetails = lazy(() => import('./components/Issues/IssueDetails'));
const MyIssues = lazy(() => import('./components/Issues/MyIssues'));
const StandaloneVerifyFeedPage = lazy(() => import('./components/Issues/StandaloneVerifyFeedPage'));
const MyContributions = lazy(() => import('./components/Contributions/MyContributions'));

const LostFoundBrowse = lazy(() => import('./components/LostFound/LostFoundBrowse'));
const AddLostFound = lazy(() => import('./components/LostFound/AddLostFound'));
const LostFoundDetails = lazy(() => import('./components/LostFound/LostFoundDetails'));
const MyLostFound = lazy(() => import('./components/LostFound/MyLostFound'));

const Noticeboard = lazy(() => import('./components/Noticeboard/Noticeboard.jsx'));
const NoticeDetails = lazy(() => import('./components/Noticeboard/NoticeDetails.jsx'));
const VolunteerHub = lazy(() => import('./components/Volunteers/VolunteerHub.jsx'));
const VolunteerDashboard = lazy(() => import('./components/Volunteers/VolunteerDashboard.jsx'));
const VolunteerRegister = lazy(() => import('./components/Volunteers/VolunteerRegister.jsx'));
const Forum = lazy(() => import('./components/Forum/Forum.jsx'));
const NewThread = lazy(() => import('./components/Forum/NewThread.jsx'));
const ThreadDetails = lazy(() => import('./components/Forum/ThreadDetails.jsx'));
const CommunityMap = lazy(() => import('./components/Map/CommunityMap.jsx'));
const AnimalsBrowse = lazy(() => import('./components/Animals/AnimalsBrowse'));
const AddAnimal = lazy(() => import('./components/Animals/AddAnimal'));
const AnimalDetails = lazy(() => import('./components/Animals/AnimalDetails'));
const MyAnimals = lazy(() => import('./components/Animals/MyAnimals'));
const FeedingDrives = lazy(() => import('./components/Animals/FeedingDrives'));
const MembershipRequest = lazy(() => import('./components/Membership/MembershipRequest'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const AdminDonations = lazy(() => import('./components/Admin/AdminDonations'));
const AdminStats = lazy(() => import('./components/Admin/AdminStats'));
const IssueQueueTable = lazy(() => import('./components/Admin/IssueQueueTable'));
const AdminUsers = lazy(() => import('./components/Admin/AdminUsers'));
const AdminMembership = lazy(() => import('./components/Admin/AdminMembership'));
const AdminPosts = lazy(() => import('./components/Admin/AdminPosts'));
const AdminForum = lazy(() => import('./components/Admin/AdminForum'));
const AdminNGOs = lazy(() => import('./components/Admin/AdminNGOs'));
const AdminNotices = lazy(() => import('./components/Admin/AdminNotices'));
const AdminGallery = lazy(() => import('./components/Admin/AdminGallery'));

const PaymentSuccess = lazy(() => import('./components/Payment/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./components/Payment/PaymentFailure'));

const NGODirectory = lazy(() => import('./components/NGOs/NGODirectory'));
const NGOProfile = lazy(() => import('./components/NGOs/NGOProfile'));
const NGORegister = lazy(() => import('./components/NGOs/NGORegister'));
const PollsBrowse = lazy(() => import('./components/Polls/PollsBrowse'));
import MemberRoute from './routes/MemberRoute';
import AdminRoute from './routes/AdminRoute';
const CivicBot = lazy(() => import('./components/AI/CivicBot'));
const Profile = lazy(() => import('./components/Profile/Profile'));
const PublicProfile = lazy(() => import('./components/Profile/PublicProfile'));
const Leaderboard = lazy(() => import('./components/Leaderboard/Leaderboard'));
const BeforeAfterGallery = lazy(() => import('./components/Gallery/BeforeAfterGallery'));
const FundCleanup = lazy(() => import('./components/Fund/FundCleanup'));
const DonateCommunity = lazy(() => import('./components/Fund/DonateCommunity'));

const CleanupEventsPage = lazy(() => import('./components/CleanupEvents/CleanupEventsPage'));
const CleanupEventDetails = lazy(() => import('./components/CleanupEvents/CleanupEventDetails'));
const OrganizeEventForm = lazy(() => import('./components/CleanupEvents/OrganizeEventForm.jsx'));
const AdminCleanupEvents = lazy(() => import('./components/Admin/AdminCleanupEvents.jsx'));

const PressKit = lazy(() => import('./components/FooterPages/PressKit'));
const Status = lazy(() => import('./components/FooterPages/Status'));
const CommunityGuidelines = lazy(() => import('./components/FooterPages/CommunityGuidelines'));
const GoalsVision = lazy(() => import('./components/FooterPages/GoalsVision'));
const RecentActivities = lazy(() => import('./components/RecentActivities/RecentActivities'));
const UserManual = lazy(() => import('./components/FooterPages/UserManual'));
const NotFound = lazy(() => import('./components/common/NotFound'));

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    errorElement: <ChunkErrorBoundary />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'home',
        Component: Home,
      },
      {
        path: 'recent-activities',
        Component: RecentActivities,
      },
      {
        path: 'gallery',
        element: <BeforeAfterGallery />,
      },
      {
        path: 'issues',
        element: <AllIssues />,
      },
      {
        path: 'issues/add',
        element: <PrivateRoute><AddIssue /></PrivateRoute>,
      },
      {
        path: 'issues/:id',
        element: <PrivateRoute><IssueDetails /></PrivateRoute>,
      },
      {
        path: 'contributions',
        element: <PrivateRoute><MyContributions /></PrivateRoute>,
      },
      {
        path: 'issues/my',
        element: <PrivateRoute><MyIssues /></PrivateRoute>,
      },
      {
        path: 'issues/verify',
        element: <PrivateRoute><StandaloneVerifyFeedPage /></PrivateRoute>,
      },
      {
        path: 'lost-found',
        element: <LostFoundBrowse />,
      },
      {
        path: 'lost-found/add-lost',
        element: <MemberRoute><AddLostFound /></MemberRoute>,
      },
      {
        path: 'lost-found/add-found',
        element: <MemberRoute><AddLostFound /></MemberRoute>,
      },
      {
        path: 'lost-found/my',
        element: <PrivateRoute><MyLostFound /></PrivateRoute>,
      },
      {
        path: 'lost-found/:id',
        element: <PrivateRoute><LostFoundDetails /></PrivateRoute>,
      },
      {
        path: 'animals',
        element: <AnimalsBrowse />,
      },
      {
        path: 'animals/add',
        element: <MemberRoute><AddAnimal /></MemberRoute>,
      },
      {
        path: 'animals/my',
        element: <PrivateRoute><MyAnimals /></PrivateRoute>,
      },
      {
        path: 'animals/feeding-drives',
        element: <PrivateRoute><FeedingDrives /></PrivateRoute>,
      },
      {
        path: 'animals/:id',
        element: <PrivateRoute><AnimalDetails /></PrivateRoute>,
      },
      {
        path: 'membership/request',
        element: <PrivateRoute><MembershipRequest /></PrivateRoute>,
      },
      {
        path: 'admin',
        element: <AdminRoute><AdminDashboard /></AdminRoute>,
        children: [
          {
            index: true,
            element: <AdminStats />
          },
          {
            path: 'queue',
            element: <IssueQueueTable />
          },
          {
            path: 'users',
            element: <AdminUsers />
          },
          {
            path: 'membership',
            element: <AdminMembership />
          },
          {
            path: 'posts',
            element: <AdminPosts />
          },
          {
            path: 'cleanup-events',
            element: <AdminCleanupEvents />
          },
          {
            path: 'forum',
            element: <AdminForum />
          },
          {
            path: 'ngos',
            element: <AdminNGOs />
          },
          {
            path: 'notices',
            element: <AdminNotices />
          },
          {
            path: 'gallery',
            element: <AdminGallery />
          },
          {
            path: 'donations',
            element: <AdminDonations />
          }
        ]
      },
      {
        path: 'ai-assistant',
        element: <CivicBot />,
      },
      {
        path: 'profile',
        element: <PrivateRoute><Profile /></PrivateRoute>,
      },
      {
        path: 'user/:id',
        element: <PublicProfile />,
      },
      {
        path: '/payment-success',
        element: <PrivateRoute><PaymentSuccess /></PrivateRoute>,
      },
      {
        path: '/payment-failure',
        element: <PrivateRoute><PaymentFailure /></PrivateRoute>,
      },
      {
        path: "/noticeboard",
        element: <Noticeboard />,
      },
      {
        path: "/noticeboard/:id",
        element: <PrivateRoute><NoticeDetails /></PrivateRoute>,
      },
      {
        path: "/volunteers",
        element: <VolunteerHub />,
      },
      {
        path: "/volunteers/register",
        element: <MemberRoute><VolunteerRegister /></MemberRoute>,
      },
      {
        path: "/volunteer-dashboard",
        element: <PrivateRoute><VolunteerDashboard /></PrivateRoute>,
      },
      {
        path: "/forum",
        element: <Forum />,
      },
      {
        path: "/forum/:id",
        element: <Forum />,
      },
      {
        path: "/map",
        element: <CommunityMap />,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/fund",
        element: <PrivateRoute><FundCleanup /></PrivateRoute>,
      },
      {
        path: "/support",
        element: <PrivateRoute><DonateCommunity /></PrivateRoute>,
      },
      {
        path: "/ngos",
        element: <NGODirectory />,
      },
      {
        path: "/ngos/register",
        element: <PrivateRoute><NGORegister /></PrivateRoute>,
      },
      {
        path: "/ngos/:id",
        element: <PrivateRoute><NGOProfile /></PrivateRoute>,
      },
      {
        path: "/polls",
        element: <PollsBrowse />,
      },
      {
        path: "/cleanup-events",
        element: <CleanupEventsPage />,
      },
      {
        path: "/cleanup-events/organize",
        element: <MemberRoute><OrganizeEventForm /></MemberRoute>,
      },
      {
        path: "/cleanup-events/:id",
        element: <PrivateRoute><CleanupEventDetails /></PrivateRoute>,
      },
      {
        path: "/press-kit",
        element: <PressKit />,
      },
      {
        path: "/status",
        element: <Status />,
      },
      {
        path: "/community-guidelines",
        element: <CommunityGuidelines />,
      },
      {
        path: "/goals-and-vision",
        element: <GoalsVision />,
      },
      {
        path: "/user-manual",
        element: <UserManual />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ]
  },
  {
    path: '/Login',
    Component: Login,
  },
  {
    path: '/Register',
    Component: Register,
  },
]);

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/*
        AuthProvider MUST wrap RouterProvider so every route
        can consume useAuth(). The provider handles the initial
        Firebase auth-state check before rendering children.
      */}
      <HelmetProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
);
