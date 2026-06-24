# Community Cleanup Drives & Event Architecture
*A comprehensive technical breakdown of the entire "Community Cleanup Events" module built for the CivicNest platform.*

---

## 1. Frontend Architecture (React / Vite)

The frontend for the Cleanup Events system is built using React, React Router, TailwindCSS, and Framer Motion for high-fidelity animations.

### A. Core User Interfaces
- **`OrganizeEventForm.jsx`**: A massive, multi-step form allowing users to submit new community drives. It captures cover images, event dates/times, geolocation, max volunteers, and even optional crowdfunding goals. Submitting an event defaults its status to `pending_review`.
- **`CleanupEventsPage.jsx`**: The main directory for discovering upcoming and past events. Features advanced filtering (by area/status) and infinite scroll.
- **`CleanupEventDetails.jsx`**: A dedicated landing page for an individual event. Displays a massive cover image, full description, organizer details, interactive attendee avatars, and a donation UI if funding is enabled.

### B. Premium Homepage Integration (`Home.jsx`)
- **`PremiumEventCard.jsx`**: A custom, Facebook-style event card showcased prominently right below the main hero banner. It features a large hover-zoom cover image, a glassmorphism date badge, floating tags, and interactive "Interested" and "Going" buttons.
- **Sidebar Drawer**: Attached to the Home page. If multiple upcoming events exist, a "View All Events" button appears. Clicking it triggers a smooth off-canvas DaisyUI drawer that slides in from the right, allowing users to scroll through all events without leaving the homepage.
- **Dynamic Community Feed**: The homepage now pulls a live, paginated feed (max 10 posts at a time) representing community activity (e.g., "X neighbours are going to Y drive"). It uses a Framer Motion-powered "Load More" button that gracefully fills with a background color upon hover and scales down upon tap.

### C. Admin Control Center
- **`AdminCleanupEvents.jsx`**: A dedicated moderation dashboard for site admins.
  - **Pending Events**: Admins can view all submitted drives and click **Approve** or **Reject**.
  - **Approved Events**: The panel also lists currently active events. If an active event violates rules or gets cancelled in real life, admins can click **Revoke & Cancel** to instantly pull it down from the public feed.

---

## 2. Backend Architecture (Node.js / Express / MongoDB)

The backend handles complex routing, moderation states, dynamic global notifications, and interactive RSVP logic.

### A. The Core APIs (`routes/cleanupEvents.js`)
- **`POST /`**: Creates a new event (Status: `pending_review`).
- **`GET /`**: Fetches public events. Supports queries like `?upcoming=true`, `?area=X`, and standard pagination.
- **`GET /:id`**: Fetches a single event by ID.
- **`POST /:id/interested`**: Toggles a user's email in the `interested` array and updates the `interestedCount`.
- **`POST /:id/going`**: Handles RSVP logic. Adds the user's details to the `going` array, decrements `interested` if they upgraded, and checks against the `maxVolunteers` capacity limit.

### B. Admin & Moderation (`routes/admin.js`)
- **`PATCH /admin/cleanup-events/:id/status`**: The heart of the moderation engine.
  - When an admin sends `{ approvalStatus: 'approved' }`, this route updates the database and immediately triggers a **Global Notification Workflow**.
  - It fetches every single registered user in the database and mass-inserts a high-priority notification so everyone on the platform instantly knows about the new drive.
  - It also triggers a public feed event (`new_drive`).

### C. Public Feed Engine (`routes/public.js` & `utils/feedHelper.js`)
- **`feedHelper.js`**: A utility that catches milestones (like event approvals, RSVPs, or solved issues) and securely writes them to the `feed_events` collection.
- **`GET /public/feed`**: Exposes the `feed_events` collection to the frontend using strict offset pagination (`?page=1&limit=10`), allowing the frontend to smoothly "Load More" without bogging down the server.

### D. Smart Notification Cleanup (`routes/notifications.js`)
- **Auto-Expiry**: To keep user inboxes clean, the `GET /notifications` route runs a silent pruning operation every time it is called. It scans for notifications that are older than exactly 7 days and automatically deletes them before returning the remaining relevant notifications to the user.

### E. Unrestricted User Edits (`routes/issues.js` & Event Edits)
- **Edit Autonomy**: We bypassed the standard strict-approval loop. If a user owns an approved post, they can send a `PUT` request to update typos, descriptions, or coordinates. The backend will save these updates but deliberately **will not** revert the post's status back to `pending_review`, saving the admins from redundant moderation work.

---

## 3. Database Schema Overview (`models/CleanupEvent.js`)

The `CleanupEvent` Mongoose model handles all fields necessary for a large-scale civic platform:
- **Core Info**: `title`, `description`, `coverImages` (Array), `eventDate`, `eventTime`, `durationHours`.
- **Location**: Structured as an object containing `address`, `area`, `coordinates` (lat/lng for maps), and `meetingPoint`.
- **Capacity & RSVP**: `maxVolunteers`, `going` (Array of objects with user info), `interested` (Array of emails).
- **Crowdfunding (Optional)**: `fundingEnabled`, `fundingGoal`, `currentFunding`.
- **Moderation Tracker**: `approvalStatus` (`pending_review`, `approved`, `rejected`, `cancelled`) and `status` (`upcoming`, `ongoing`, `completed`).
