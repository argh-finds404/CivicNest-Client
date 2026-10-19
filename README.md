# CivicNest - Community Cleanliness & Citizen Engagement Portal

**CivicNest** is a comprehensive, full-stack community cleanliness, incident-reporting, and volunteer mobilization portal. The platform empowers citizens to report local hazards (like garbage piles, road damage, waterlogging, or safety hazards), coordinate volunteer cleanup drives, support community initiatives through crowdfunding, and interact in real-time.

*   **Live Web App:** [https://civicnest-client.netlify.app/](https://civicnest-client.netlify.app/)
*   **Client Repository:** [https://github.com/argh-finds404/CivicNest-Client](https://github.com/argh-finds404/CivicNest-Client)
*   **Server Repository:** [https://github.com/argh-finds404/CivicNest-Server](https://github.com/argh-finds404/CivicNest-Server)

---

## Reviewer Access

Three demo accounts are available, one per role. On the login page, the **Reviewing CivicNest?** panel signs you in with one click, or you can type the details yourself:

| Role | Email | Password | What it can do |
| --- | --- | --- | --- |
| Admin | `admin.reviewer@civicnest.app` | `CivicNest@2026` | Everything, including users, membership, NGOs, notices, gallery and donations (role changes are blocked for demo accounts) |
| Moderator | `moderator.reviewer@civicnest.app` | `CivicNest@2026` | Moderation console: issue queue, tickets, cleanup events, forum moderation and rescues |
| Member | `member.reviewer@civicnest.app` | `CivicNest@2026` | A verified resident: report issues, follow tickets, vote, post in threads and join cleanups |

The server's `npm run seed:reviewers` script creates these accounts and resets them to a clean state. Set `VITE_SHOW_REVIEWER_LOGIN=false` to hide the panel, or `VITE_REVIEWER_PASSWORD` if the server was seeded with a different password.

---

## What We Have Implemented & Done

### 1. Robust Authentication & Role-Based Authorization (Firebase & JWT)
*   **Multi-Method Authentication:** Seamless login and register flows using Firebase Authentication, supporting both email/password sign-up (with mandatory email verification checks) and Google One-Tap/Social login.
*   **JWT Verification:** A secure middleware pipeline that generates JSON Web Tokens (JWT) upon successful authentication. JWTs are passed via request headers to secure API endpoints.
*   **Role-Based Access Control (RBAC):** Roles are ranked `guest < member < moderator < admin`:
    *   **Guest:** Can see the home page and the help pages. Every other page sends guests to the login page and brings them back after they sign in.
    *   **Standard User:** Can report issues, follow their tickets, comment, and view profiles.
    *   **Member (Verified Resident):** Earned by submitting address proof (utility bill upload). Unlocks forum posting, cleanup event organization, and issue resolution authority.
    *   **Moderator:** Works the issue queue and ticket desk, reviews cleanup events and rescues, and moderates threads. Cannot manage users, roles, money or site content.
    *   **Admin:** Complete management console over the queue of membership requests, user roles, incident reports, donations, notices, and forums.
*   **Route Guards:** `PrivateRoute` (signed in), `StaffRoute` (moderator or admin) and `AdminRoute` (admin only) mirror the server's checks, so the UI never shows a page the API would refuse.

### 2. Live Incident Reporting & Verification System (MongoDB)
*   **Incident Feed:** Citizens can report issues with detailed descriptions, location categories (Wards), images, and priority flags.
*   **Map Integration:** Interactive OpenStreetMap/Leaflet components visually map out reports based on GPS coordinates.
*   **Reddit-Style Interaction:** Upvoting system and comment threads on reports, allowing the community to democratically decide which hazards require urgent attention.
*   **Verification Loop:** Verified residents inspect solved issues, confirm resolutions on-site, and release points to reporters, closing the trust loop.

### 3. Report Tickets
*   **A ticket for every report:** Each issue gets a code like `CN-2026-000123`, a priority from its urgency and a target date (24 hours for urgent reports, up to 14 days for low priority ones).
*   **My tickets:** Reporters follow progress at `/tickets` and `/tickets/:code`, with a status tracker and a full history. The footer's **Track ticket** box opens any code.
*   **Ticket desk:** Staff filter by status, priority or assignee, pick up tickets, change status or priority and leave notes. Status changes are copied to the issue, so both stay in step.

### 4. Real-Time Interactions (Socket.io)
*   **Live Feed Refreshes:** Real-time updates push status changes (e.g., when an issue is marked as "In Progress" or "Resolved" by admins/volunteers) instantly to all connected clients.
*   **Interactive Forums:** Thread-specific typing indicators and active-user lists in discussion rooms.
*   **Push Notifications:** Instant popups notify users when their posts receive replies, upvotes, or status modifications.

### 5. Smart CivicBot AI Assistant (Gemini API)
*   **Report Drafter:** Assists users in structuring detailed, professional incident descriptions from simple bullet points.
*   **Formal Escalation Letters:** Generates formal complaint templates pre-populated with incident data to send to Ward Commissioners.
*   **Rescue Manual:** Provides immediate, structured step-by-step assistance when users report stray animals in distress.

### 6. Crowdfunding & Financial Integration (Stripe Payments)
*   **Direct Support:** Integrated Stripe checkout flows allowing residents to fund specific neighborhood cleanup events or contribute to the general community cleanliness fund.
*   **Transparency:** Financial logs tracked securely inside MongoDB, displaying progress bars on target goals for each cleanup drive.

### 7. Gamified Leaderboard & Impact Resume
*   **Activity Points:** Users earn points for reporting hazards, upvoting valid issues, checking into volunteer events, and verifying resolved complaints.
*   **Citizen Streaks:** Encourages daily civic engagement through a streak-tracking dashboard.
*   **Impact Resume PDF:** Direct integration with `jspdf` to generate a professional PDF breakdown of a user's contributions, points, verified events attended, and civic status.

### 8. Volunteer Hub & Cleanup Drives
*   **Event Scheduling:** Allows verified residents and NGOs to organize official cleanup events.
*   **Geo-Fenced Check-In:** Volunteers check into cleanup drives on-site using a two-factor validation system (OTP generated by the organizer + GPS verification).

---

## Technical Architecture & Stack Deep-Dive

### 1. Security & Token-Based Authentication Flow
*   **Firebase Authentication:** Handles Google Single-Sign-On and Email/Password credentials securely on the frontend.
*   **Token Handshake:** 
    1. Upon login, the client retrieves the Firebase User IdToken.
    2. The token is sent to the server for verification via the `Firebase Admin SDK` middleware.
    3. Custom Axios request interceptors (`useAxiosSecure.js`) automatically attach the Bearer token as an `Authorization` header on all secure requests.
    4. Token validation ensures that non-verified users, guests, or unauthorized roles are denied access to restricted endpoints.

### 2. Dual Payment Gateways (Stripe & SSLCommerz)
CivicNest features two payment integrations for community cleanup funding and general donations:
*   **Stripe Gateway:** 
    *   Uses `@stripe/stripe-js` and `@stripe/react-stripe-js` to render secure, PCI-compliant card input fields (Stripe Elements).
    *   Initiates `PaymentIntents` on the backend and listens to real-time events via a raw-body `stripe-webhook` endpoint to confirm success.
*   **SSLCommerz Gateway:** 
    *   Uses the official Node.js `sslcommerz-lts` package on the backend.
    *   Initiates sessions via backend redirect URL generation. The user is redirected to the SSLCommerz payment portal, and callbacks (Success, Failure, Cancel) are captured, stored, and verified in MongoDB. A sandbox emulator is written for local development testing.

### 3. Maps & Geospatial Visualizations
*   **Leaflet & React Leaflet:** Configured to map community incident reports and cleanup event coordinates geographically.
*   **Customization:** Utilizes custom Leaflet Marker anchors, interactive popups, dynamic center-coordinate matching, and coordinate selection helpers when creating new reports.

### 4. Design System & 3D Scenes
*   **Type and colour:** Bricolage Grotesque for headings and Plus Jakarta Sans for text, with shared `--cn-*` colour tokens and matching light and dark themes. The theme follows the device setting until you pick one.
*   **Per-page 3D models:** Each section header has its own interactive low-poly model built with React Three Fiber (a traffic cone and pothole for issues, a ballot box for polls, a doghouse for animals, a magnifying glass for lost & found, a trophy for the leaderboard, and so on). Drag to turn them. They load only on desktop screens and stop rendering when scrolled out of view.
*   **City diorama:** The home page welcome banner keeps the CSS 3D city scene.

### 5. Smooth Momentum Scrolling & Sliders
*   **Lenis Scroll:** Configured inside a custom React context (`LenisContext.jsx`) with custom `lerp: 0.15` and `duration: 0.7` values to establish smooth momentum scrolling across the portal.
*   **Swiper:** Powers responsive, high-performance carousel sliding components (e.g. on the homepage).

---

## Deployment Architecture

*   **Frontend Client Hosting:** Deployed on **Netlify** at [https://civicnest-client.netlify.app/](https://civicnest-client.netlify.app/)
*   **Backend Server Hosting:** Deployed on **Render** at [https://civicnest-api.onrender.com](https://civicnest-api.onrender.com)
*   **Database:** Hosted on a high-availability **MongoDB Atlas** cloud cluster.

---

## Dependency & Package Breakdown

### Client-Side Packages
*   **Framework:** React 19, Vite 8
*   **Styles & Theme:** Tailwind CSS v4, DaisyUI v5
*   **State & Fetching:** TanStack Query (React Query) v5, Axios
*   **3D:** three.js, React Three Fiber, Drei
*   **Animations:** Framer Motion, Lottie Player, Canvas Confetti, React Awesome Reveal
*   **Maps:** Leaflet, React Leaflet
*   **Scroll:** Lenis
*   **Charts:** Chart.js, Recharts, React Chartjs 2
*   **PDF Generation:** jsPDF, jsPDF-AutoTable
*   **Icons:** Remix Icons, Lucide React, React Icons

### Server-Side Packages
*   **Server Core:** Node.js, Express.js (v5)
*   **Database & ODM:** MongoDB Native Driver (v7), Mongoose (v9), Prisma (v6) for tickets and users
*   **Realtime Communication:** Socket.io (v4)
*   **Authentication & Security:** Firebase Admin SDK (v13), Express Rate Limit (v8)
*   **Payment Handlers:** Stripe Node SDK, SSLCommerz LTS SDK
*   **AI Integration:** Google Generative AI Node SDK (Gemini API)

---

## Getting Started (Local Setup)

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### Installation Steps

1.  **Clone the client repository:**
    ```bash
    git clone https://github.com/argh-finds404/CivicNest-Client.git
    cd CivicNest-Client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root folder and add the following keys (based on `.env.example`):
    ```env
    VITE_API_URL=http://localhost:3000
    VITE_apiKey=your_firebase_api_key
    VITE_authDomain=your_auth_domain
    VITE_projectId=your_project_id
    VITE_storageBucket=your_storage_bucket
    VITE_messagingSenderId=your_messaging_sender_id
    VITE_appId=your_app_id
    ```

4.  **Run the local development server:**
    ```bash
    npm run dev
    ```
    The application will be live at `http://localhost:5173`.
