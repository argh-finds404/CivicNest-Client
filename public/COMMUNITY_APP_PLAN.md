# 🌍 CivicNest — Community Helping Portal
### Full-Scale App Planning Document
> **For AI Assistants & Collaborators:** This document describes the complete vision, feature set, route architecture, database schema, and folder structure of **CivicNest** — a large-scale, full-stack MERN community web application. Read this top-to-bottom to understand the entire scope before contributing to any part of the codebase.

---

## 📌 Table of Contents

1. [Project Vision](#1-project-vision)
2. [Minimum Requirements (Assignment)](#2-minimum-requirements-assignment)
3. [Extended Feature Set](#3-extended-feature-set)
4. [All Routes & Pages](#4-all-routes--pages)
5. [Community Membership System](#5-community-membership-system)
6. [AI Assistant Integration](#6-ai-assistant-integration)
7. [Database Schema (MongoDB)](#7-database-schema-mongodb)
8. [Folder Structure](#8-folder-structure)
9. [Tech Stack](#9-tech-stack)
10. [Implementation Priority](#10-implementation-priority)

---

## 1. Project Vision

**CivicNest** is a large-scale community web portal designed to empower local residents to:
- Report civic/cleanliness issues (garbage, broken roads, illegal construction, etc.)
- Help lost animals and coordinate feeding drives
- Find and post lost-and-found items in the area
- Communicate community problems and co-fund their solutions
- Interact with an AI assistant for civic guidance, issue summaries, and resource suggestions

The app goes far beyond a basic complaint portal — it is a **digital hub for community life**, bridging citizens, volunteers, and local authorities.

---

## 2. Minimum Requirements (Assignment)

These are the **baseline features** that must be implemented first:

### ✅ Auth (Firebase)
- Email/Password login & registration
- Google OAuth login
- Profile with avatar, name, email, photoURL
- Password validation: uppercase + lowercase + min 6 chars
- Protected/private routes

### ✅ Home Page
- Banner slider (3+ slides — real civic images)
- 4 Category cards: Garbage, Illegal Construction, Broken Public Property, Road Damage
- Recent 6 issues from MongoDB
- Community stats: total users, resolved issues, pending issues
- Volunteer/Join Clean Drive CTA section

### ✅ Issues CRUD
- **Add Issue** (private): title, category, location, description, image, amount, status (default: ongoing), date (auto), email (read-only)
- **All Issues Page**: 3-column grid, filterable by category/status, searchable
- **Issue Details** (private): full details + "Pay Clean-Up Contribution" modal + contributors table
- **My Issues** (private): table with update modal + delete confirmation

### ✅ Contributions
- **My Contribution** (private): table of personal payments with PDF download

### ✅ General UI
- Dynamic page titles per route
- 404 Not Found page
- Loading spinners
- Toast/SweetAlert for all actions
- Fully responsive (mobile, tablet, desktop)
- Dark/Light mode toggle
- No lorem ipsum text

---

## 3. Extended Feature Set

These are the **additional features** that make CivicNest a large-scale app.

---

### 🔐 3.1 — Community Membership System

To ensure only verified, trusted community members can post issues, lost-and-found items, or animal reports, a **membership/verification layer** is added.

**How it works:**
- On registration, users are initially `role: "guest"`.
- To become a `"member"`, a user must submit a **Community Join Request**:
  - Full Name
  - National ID / Student ID / Proof of Residence (image upload)
  - Area / Zone (dropdown: Ward 1, Ward 2, etc.)
  - Short introduction message
- An **Admin** reviews the request and approves/rejects.
- On approval → user's role is updated to `"member"` in MongoDB.
- Members get a **verified badge** on their profile.
- **Posting issues, lost-and-found, and animal help requests requires `role: "member"`.**
- Guests can browse everything, contribute funds, and upvote issues.
- Alternatively (faster path): user can pay a small **symbolic membership fee** (e.g., 10 BDT/month via SSLCommerz or Stripe) to auto-verify — showing they are a real, committed person.

---

### 📋 3.2 — Issues / Complaints Portal (Core, Enhanced)

The core issues system, upgraded:

**Categories (top of issues page as tabs/pills):**
| Category | Icon |
|---|---|
| Utility Problems | ⚡ Power, Water, Gas |
| Road & Infrastructure | 🛣️ Potholes, broken sidewalks |
| Garbage & Waste | 🗑️ Dumping, overflow |
| Illegal Construction | 🏗️ Unauthorized builds |
| Social Problems | 👥 Harassment, noise, conflict |
| Community Norms | 📜 Rules violations |
| Waterlogging & Drainage | 🌊 Flooding, blocked drains |
| Broken Public Property | 🪑 Benches, lights, signs |
| Environmental Issues | 🌿 Deforestation, pollution |
| Safety & Crime | 🚨 Suspicious activity, theft |

**Enhanced Issue Features:**
- **Upvote system**: any user (guest or member) can upvote an issue — higher upvotes = higher priority
- **Status tracker**: Ongoing → In Review → Action Taken → Resolved (admin can update; reporter can mark as ended)
- **Comment thread** on each issue (members only)
- **Share to social media** (Facebook, WhatsApp) button
- **Anonymous reporting** option (hides name but stores email internally)
- **Area/Zone filter** — filter issues by your neighborhood
- **Priority badge**: auto-calculated from upvotes + age + amount raised
- **Report as spam** (3 reports → hidden pending admin review)

---

### 🔍 3.3 — Lost & Found Portal

A dedicated section for community members to post and search for lost or found items.

**Routes:** `/lost-found`, `/lost-found/add`, `/lost-found/:id`

**Post a Lost Item:**
- Item name & description
- Category (Electronics, Pet, Documents, Wallet/Keys, Clothing, Other)
- Last seen location (with optional Google Maps link)
- Date lost
- Contact info (email or phone — member's choice)
- Image upload
- Reward offered (optional)
- Status: `Lost` | `Found` | `Reunited`

**Post a Found Item:**
- Same fields but "Where I found it"
- "Claim this item" button → opens form to verify ownership

**Features:**
- Filter by: category, status, area, date range
- Search by keyword
- Map view of lost/found pins (optional, using Leaflet.js)
- **AI Match Suggestion**: when a user posts a lost item, the AI assistant scans existing found-item posts and suggests possible matches
- Auto-expire after 30 days if not marked as `Reunited`
- Members can DM (simple in-app message) the poster

---

### 🐾 3.4 — Animal Help & Feeding Portal

A brand-new section for community animal welfare.

**Routes:** `/animals`, `/animals/add`, `/animals/:id`, `/animals/feeding-drives`

**Report a Stray Animal in Need:**
- Animal type (Dog, Cat, Cow, Bird, Other)
- Condition description (injured, sick, starving, newborn, etc.)
- Photo
- Location (area + optional map pin)
- Urgency level: Low / Medium / High / Emergency
- Contact info of reporter
- Status: `Needs Help` | `Help Arranged` | `Rescued` | `Adopted`

**Feeding Drive Board:**
- Any member can create a **community feeding drive event**:
  - Date, time, location
  - Food type (dry food, cooked rice, milk, etc.)
  - Volunteers needed (number)
  - "Join Drive" button → adds user to volunteer list
- Past drives shown with photos (members can upload after-drive photos)
- **Donation towards animal food fund**: members can contribute a small amount (stored separately in contributions collection with `type: "animal"`)

**Features:**
- Animals marked `Emergency` appear with a red banner on the Animals homepage
- NGO/Shelter integration section: local shelters can register and list available animals for adoption
- **AI Tip**: on each animal card, an AI-generated brief care tip (e.g., "A dog with a limping leg needs rest and should avoid…")
- Volunteer leaderboard: top 5 most active animal volunteers this month

---

### 📣 3.5 — Community Announcements & Noticeboard

A public bulletin board for community notices.

**Routes:** `/noticeboard`, `/noticeboard/:id`

**Post a Notice (member only):**
- Title
- Type: Announcement | Event | Warning | Maintenance | General
- Description
- Valid until (date)
- Posted by (auto from logged-in user)
- Attachments (PDF or image)
- Priority: Normal | Urgent

**Features:**
- Pinned notices (admin can pin)
- Notices auto-expire on `validUntil` date
- Members can subscribe to noticeboard emails (weekly digest)

---

### 🙋 3.6 — Volunteer Hub

A dedicated place to find and join volunteer activities.

**Routes:** `/volunteers`, `/volunteers/register`, `/volunteers/drives`

**Features:**
- Any member can register as a volunteer with:
  - Skills (Medical, Plumbing, Electrical, Driving, Teaching, General)
  - Availability (Weekdays, Weekends, Anytime)
  - Contact method preference
- **Volunteer Drives Board**: admins or members can post upcoming drives
  - Cleanup drives
  - Animal feeding drives (linked from Animals section)
  - Tree planting events
  - Flood relief coordination
- Volunteer badges on profile after completing 3+ drives
- **Volunteer of the Month** feature on homepage

---

### 🏆 3.7 — Leaderboard & Gamification

A community engagement system.

**Routes:** `/leaderboard`

**Points system:**
| Action | Points |
|---|---|
| Post a valid issue | +10 |
| Issue resolved | +25 bonus |
| Contribute to a cleanup fund | +15 |
| Volunteer in a drive | +30 |
| Found a lost item (reunited) | +20 |
| Animal rescue (marked Rescued) | +25 |
| First post of the month | +5 bonus |

**Leaderboard shows:**
- Top 10 contributors this month
- Top 10 all-time
- User's own rank
- Badges earned (Civic Hero, Animal Friend, Clean Street Champion, etc.)

---

### 💬 3.8 — Community Forum (Light Version)

A simple discussion board for general community topics.

**Routes:** `/forum`, `/forum/:threadId`

**Features:**
- Create a thread (member only): title, body, category tag
- Reply to threads
- Upvote threads and replies
- Categories: General, Safety, Events, Suggestions, Off-Topic
- Pinned threads (admin)
- Thread search

---

### 📊 3.9 — Admin Dashboard

A protected admin-only section.

**Routes:** `/admin`, `/admin/users`, `/admin/issues`, `/admin/membership`, `/admin/animals`, `/admin/lost-found`, `/admin/announcements`, `/admin/stats`

**Features:**
- View & manage all users (change role: guest → member → moderator → admin)
- Review membership join requests (approve/reject with note)
- Manage all issues: change status, pin, feature, delete spam
- Manage all lost-found posts
- Manage all animal posts
- Post/edit/delete announcements
- **Full stats dashboard**:
  - Issues per category (bar chart)
  - Monthly new issues (line chart)
  - Contributions collected (area chart)
  - User growth chart
  - Top areas by issue count (map heatmap or table)
- Export reports as CSV/PDF

---

### 🤖 3.10 — AI Assistant (CivicBot)

An embedded AI chat assistant throughout the app.

**Placement:** Floating chat button (bottom-right) on all pages + dedicated `/ai-assistant` page

**Capabilities:**
- **Issue Helper**: "Describe your problem" → AI suggests the best category, drafts a well-written issue description, recommends suggested budget
- **Lost Item Matcher**: scans lost + found posts and suggests matches based on description similarity (Claude API or OpenAI)
- **Animal First Aid Tips**: user describes an animal's condition → AI gives immediate care advice and nearest shelter info
- **Civic Knowledge Base**: answers questions about local rights, how to escalate issues, government contact info for common problems
- **Issue Summary**: on the Issue Details page, a "Summarize this issue" button gives a concise AI-written summary of the complaint, comments, and resolution status
- **Community Report Generator**: members can ask CivicBot to generate a formal complaint letter for a specific issue (downloadable as PDF)
- **Smart Search**: "Find all waterlogging issues in Khulna this month" → AI interprets natural language and returns filtered results

**Implementation:**
- Frontend: React chat component with message history
- Backend: `/api/ai/chat` endpoint calling Claude API (Anthropic) or OpenAI
- Context sent to AI: user's role, current page, relevant DB data (sanitized)
- Rate limiting: 20 AI requests/day for guests, unlimited for members

---

### 🗺️ 3.11 — Interactive Community Map

**Route:** `/map`

A Leaflet.js-powered map showing:
- 📍 Open issues (color-coded by category)
- 📦 Lost & found item pins
- 🐾 Reported stray animals
- 🧹 Upcoming cleanup drive locations
- 🏥 Nearby shelters / NGOs

**Features:**
- Click a pin → see issue card summary + "See Details" link
- Filter pins by type/category
- "Report near me" button → opens Add Issue form pre-filled with map coordinates
- Heatmap layer toggle: shows density of problems per area

---

### 🔔 3.12 — Notifications System

**Features:**
- In-app notification bell (navbar)
- Notifications for:
  - Your issue status changed
  - Someone commented on your issue
  - Your lost item was claimed
  - A new animal emergency near your area
  - Your membership was approved/rejected
  - You earned a new badge
  - A cleanup drive is happening near you
- Mark as read / clear all
- Email notifications (optional, user preference)

---

### 👤 3.13 — Enhanced Profile Page

**Route:** `/profile`

**Shows:**
- Avatar, name, email, verified badge (if member)
- Points total + badges earned
- My Issues count / My Contributions count / Volunteer drives joined
- Edit profile: name, photoURL, bio, area/zone
- Download my data (GDPR-lite)
- Account settings: notification preferences, dark/light mode preference

---

## 4. All Routes & Pages

```
PUBLIC ROUTES
/                        → Home Page
/issues                  → All Issues (browse, filter, search)
/issues/:id              → Issue Details
/lost-found              → Lost & Found browse
/lost-found/:id          → Lost/Found Item Details
/animals                 → Animals browse
/animals/:id             → Animal Report Details
/animals/feeding-drives  → Feeding Drives board
/noticeboard             → Community Noticeboard
/noticeboard/:id         → Single Notice
/map                     → Community Map
/leaderboard             → Points & Badges Leaderboard
/forum                   → Community Forum
/forum/:threadId         → Single Forum Thread
/volunteers              → Volunteer Hub
/login                   → Login Page
/register                → Register Page
/*                       → 404 Not Found

PRIVATE ROUTES (require login, any role)
/profile                 → My Profile
/notifications           → All Notifications
/ai-assistant            → AI CivicBot Page

MEMBER-ONLY ROUTES (require role: member)
/issues/add              → Add New Issue
/issues/my               → My Issues (CRUD)
/contributions           → My Contributions
/lost-found/add          → Add Lost/Found Post
/lost-found/my           → My Lost/Found Posts
/animals/add             → Add Animal Report
/animals/my              → My Animal Reports
/volunteers/register     → Volunteer Registration
/forum/new               → New Forum Thread
/membership/request      → Community Join Request (for guests)

ADMIN ROUTES (require role: admin)
/admin                   → Admin Dashboard (stats overview)
/admin/users             → User Management
/admin/issues            → All Issues Management
/admin/membership        → Membership Request Review
/admin/animals           → Animals Management
/admin/lost-found        → Lost & Found Management
/admin/announcements     → Noticeboard Management
/admin/stats             → Charts & Analytics
```

---

## 5. Community Membership System

### Roles
```
guest     → registered but unverified; can browse, contribute, upvote
member    → verified community member; can post issues, lost-found, animals
moderator → trusted member; can flag/hide content, manage own ward
admin     → full control; manage users, approve memberships, admin dashboard
```

### Join Request Flow
```
1. Guest registers → role: "guest" stored in DB
2. Guest clicks "Become a Member" → fills membership form
3. Form saved in `membershipRequests` collection (status: "pending")
4. Admin sees request in /admin/membership with approve/reject buttons
5. On approve → user.role updated to "member"; notification sent
6. On reject → notification sent with reason
7. Member gets verified badge on profile
```

### Route Guard Logic (React)
```jsx
// PrivateRoute.jsx  → redirect to /login if not logged in
// MemberRoute.jsx   → redirect to /membership/request if role !== "member"
// AdminRoute.jsx    → redirect to / if role !== "admin"
```

---

## 6. AI Assistant Integration

### Tech Approach
- **API:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Backend endpoint:** `POST /api/ai/chat`
- **Request body:** `{ messages: [], context: { page, userRole, relevantData } }`
- **Streaming:** Use SSE (Server-Sent Events) for real-time token streaming to frontend

### CivicBot System Prompt (summary)
```
You are CivicBot, an AI assistant for CivicNest — a community helping portal.
You help users:
- Write clear civic issue reports
- Match lost/found items
- Give animal first-aid advice
- Draft formal complaint letters
- Answer questions about community rights and processes
- Summarize complex issue threads
Always be concise, friendly, and constructive. You are speaking to real community members.
```

### AI Features Per Page
| Page | AI Feature |
|---|---|
| Add Issue | Auto-suggest category + draft description from keywords |
| Issue Details | Summarize issue + generate formal complaint letter |
| Lost Found Add | Suggest matches from existing found items |
| Animal Add | Care tips based on animal type + condition |
| Forum Thread | "Summarize this thread" button |
| AI Assistant Page | Full chat interface, all features |
| All Issues | Natural language search ("overflowing drain last week") |

---

## 7. Database Schema (MongoDB)

### Collections

#### `users`
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "photoURL": "string",
  "role": "guest | member | moderator | admin",
  "area": "string",
  "bio": "string",
  "points": "number",
  "badges": ["string"],
  "notificationPrefs": { "email": true, "inApp": true },
  "createdAt": "Date",
  "verifiedAt": "Date | null"
}
```

#### `issues`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "category": "string",
  "location": "string",
  "area": "string",
  "description": "string",
  "image": "string (URL)",
  "amount": "number",
  "email": "string",
  "status": "ongoing | in-review | action-taken | resolved",
  "upvotes": ["userId"],
  "upvoteCount": "number",
  "isAnonymous": "boolean",
  "priority": "low | medium | high",
  "spamReports": ["userId"],
  "isHidden": "boolean",
  "coordinates": { "lat": 0, "lng": 0 },
  "date": "Date",
  "updatedAt": "Date"
}
```

#### `contributions`
```json
{
  "_id": "ObjectId",
  "issueId": "string",
  "type": "issue | animal",
  "amount": "number",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "date": "Date",
  "additionalInfo": "string"
}
```

#### `lostFound`
```json
{
  "_id": "ObjectId",
  "type": "lost | found",
  "itemName": "string",
  "category": "Electronics | Pet | Documents | Wallet/Keys | Clothing | Other",
  "description": "string",
  "image": "string",
  "location": "string",
  "coordinates": { "lat": 0, "lng": 0 },
  "dateLostFound": "Date",
  "contactEmail": "string",
  "contactPhone": "string",
  "reward": "number | null",
  "status": "open | claimed | reunited",
  "postedBy": "userId",
  "expiresAt": "Date",
  "date": "Date"
}
```

#### `animals`
```json
{
  "_id": "ObjectId",
  "animalType": "Dog | Cat | Cow | Bird | Other",
  "condition": "string",
  "image": "string",
  "location": "string",
  "coordinates": { "lat": 0, "lng": 0 },
  "urgency": "low | medium | high | emergency",
  "status": "needs-help | help-arranged | rescued | adopted",
  "reportedBy": "userId",
  "volunteers": ["userId"],
  "date": "Date"
}
```

#### `feedingDrives`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "location": "string",
  "date": "Date",
  "time": "string",
  "foodType": "string",
  "volunteersNeeded": "number",
  "volunteers": ["userId"],
  "photos": ["string"],
  "createdBy": "userId",
  "status": "upcoming | completed"
}
```

#### `membershipRequests`
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "name": "string",
  "email": "string",
  "idImage": "string (URL)",
  "area": "string",
  "intro": "string",
  "status": "pending | approved | rejected",
  "adminNote": "string",
  "submittedAt": "Date",
  "reviewedAt": "Date | null"
}
```

#### `announcements`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "type": "Announcement | Event | Warning | Maintenance | General",
  "description": "string",
  "attachment": "string | null",
  "priority": "normal | urgent",
  "isPinned": "boolean",
  "validUntil": "Date",
  "postedBy": "userId",
  "date": "Date"
}
```

#### `notifications`
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "message": "string",
  "type": "issue | lostfound | animal | membership | badge | drive",
  "link": "string",
  "isRead": "boolean",
  "date": "Date"
}
```

#### `forum`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "body": "string",
  "category": "General | Safety | Events | Suggestions | Off-Topic",
  "postedBy": "userId",
  "upvotes": ["userId"],
  "isPinned": "boolean",
  "replies": [
    {
      "_id": "ObjectId",
      "body": "string",
      "postedBy": "userId",
      "upvotes": ["userId"],
      "date": "Date"
    }
  ],
  "date": "Date"
}
```

---

## 8. Folder Structure

```
Community_App/
│
├── 📁 Client/
│   └── 📁 Community Cleanliness Portal/
│       ├── 📁 public/
│       │   ├── favicon.ico
│       │   └── robots.txt
│       │
│       ├── 📁 src/
│       │   │
│       │   ├── 📁 assets/                    # Static images, svgs, lottie files
│       │   │   ├── hero.png
│       │   │   ├── lottie/
│       │   │   └── icons/
│       │   │
│       │   ├── 📁 components/               # Reusable UI components
│       │   │   ├── 📁 common/
│       │   │   │   ├── Navbar.jsx
│       │   │   │   ├── Footer.jsx
│       │   │   │   ├── LoadingSpinner.jsx
│       │   │   │   ├── NotFound.jsx
│       │   │   │   ├── Modal.jsx
│       │   │   │   ├── ConfirmDialog.jsx
│       │   │   │   ├── Badge.jsx
│       │   │   │   ├── CategoryPill.jsx
│       │   │   │   └── PriorityBadge.jsx
│       │   │   │
│       │   │   ├── 📁 cards/
│       │   │   │   ├── IssueCard.jsx
│       │   │   │   ├── LostFoundCard.jsx
│       │   │   │   ├── AnimalCard.jsx
│       │   │   │   ├── DriveCard.jsx
│       │   │   │   └── ForumCard.jsx
│       │   │   │
│       │   │   ├── 📁 forms/
│       │   │   │   ├── IssueForm.jsx
│       │   │   │   ├── LostFoundForm.jsx
│       │   │   │   ├── AnimalForm.jsx
│       │   │   │   ├── ContributionModal.jsx
│       │   │   │   └── MembershipForm.jsx
│       │   │   │
│       │   │   ├── 📁 ai/
│       │   │   │   ├── CivicBot.jsx          # Floating AI chat button
│       │   │   │   ├── ChatWindow.jsx
│       │   │   │   ├── MessageBubble.jsx
│       │   │   │   └── AISuggestionBar.jsx   # Inline AI hints on forms
│       │   │   │
│       │   │   ├── 📁 map/
│       │   │   │   ├── CommunityMap.jsx
│       │   │   │   ├── MapPin.jsx
│       │   │   │   └── MapFilters.jsx
│       │   │   │
│       │   │   └── 📁 charts/
│       │   │       ├── IssueBarChart.jsx
│       │   │       ├── MonthlyLineChart.jsx
│       │   │       └── ContributionAreaChart.jsx
│       │   │
│       │   ├── 📁 pages/                    # One folder per route
│       │   │   ├── 📁 Home/
│       │   │   │   ├── Home.jsx
│       │   │   │   ├── Banner.jsx
│       │   │   │   ├── CategorySection.jsx
│       │   │   │   ├── RecentIssues.jsx
│       │   │   │   ├── CommunityStats.jsx
│       │   │   │   ├── VolunteerCTA.jsx
│       │   │   │   └── VolunteerOfMonth.jsx
│       │   │   │
│       │   │   ├── 📁 Auth/
│       │   │   │   ├── Login.jsx
│       │   │   │   └── Register.jsx
│       │   │   │
│       │   │   ├── 📁 Issues/
│       │   │   │   ├── AllIssues.jsx
│       │   │   │   ├── IssueDetails.jsx
│       │   │   │   ├── AddIssue.jsx
│       │   │   │   └── MyIssues.jsx
│       │   │   │
│       │   │   ├── 📁 LostFound/
│       │   │   │   ├── LostFoundBrowse.jsx
│       │   │   │   ├── LostFoundDetails.jsx
│       │   │   │   ├── AddLostFound.jsx
│       │   │   │   └── MyLostFound.jsx
│       │   │   │
│       │   │   ├── 📁 Animals/
│       │   │   │   ├── AnimalsBrowse.jsx
│       │   │   │   ├── AnimalDetails.jsx
│       │   │   │   ├── AddAnimal.jsx
│       │   │   │   ├── MyAnimals.jsx
│       │   │   │   └── FeedingDrives.jsx
│       │   │   │
│       │   │   ├── 📁 Noticeboard/
│       │   │   │   ├── Noticeboard.jsx
│       │   │   │   └── NoticeDetails.jsx
│       │   │   │
│       │   │   ├── 📁 Map/
│       │   │   │   └── MapPage.jsx
│       │   │   │
│       │   │   ├── 📁 Leaderboard/
│       │   │   │   └── Leaderboard.jsx
│       │   │   │
│       │   │   ├── 📁 Forum/
│       │   │   │   ├── Forum.jsx
│       │   │   │   ├── ThreadDetails.jsx
│       │   │   │   └── NewThread.jsx
│       │   │   │
│       │   │   ├── 📁 Volunteers/
│       │   │   │   ├── VolunteerHub.jsx
│       │   │   │   └── VolunteerRegister.jsx
│       │   │   │
│       │   │   ├── 📁 Contributions/
│       │   │   │   └── MyContributions.jsx
│       │   │   │
│       │   │   ├── 📁 Profile/
│       │   │   │   └── Profile.jsx
│       │   │   │
│       │   │   ├── 📁 Membership/
│       │   │   │   └── MembershipRequest.jsx
│       │   │   │
│       │   │   ├── 📁 Notifications/
│       │   │   │   └── Notifications.jsx
│       │   │   │
│       │   │   ├── 📁 AIAssistant/
│       │   │   │   └── AIAssistantPage.jsx
│       │   │   │
│       │   │   └── 📁 Admin/
│       │   │       ├── AdminDashboard.jsx
│       │   │       ├── AdminUsers.jsx
│       │   │       ├── AdminIssues.jsx
│       │   │       ├── AdminMembership.jsx
│       │   │       ├── AdminAnimals.jsx
│       │   │       ├── AdminLostFound.jsx
│       │   │       ├── AdminAnnouncements.jsx
│       │   │       └── AdminStats.jsx
│       │   │
│       │   ├── 📁 contexts/
│       │   │   ├── AuthContext.jsx
│       │   │   └── AuthProvider.jsx
│       │   │
│       │   ├── 📁 hooks/                    # Custom React hooks
│       │   │   ├── useAuth.js
│       │   │   ├── useRole.js               # returns user role
│       │   │   ├── useAxiosSecure.js        # axios interceptor with token
│       │   │   ├── useNotifications.js
│       │   │   └── useAI.js                 # CivicBot API hook
│       │   │
│       │   ├── 📁 routes/                   # Route guards
│       │   │   ├── PrivateRoute.jsx          # Must be logged in
│       │   │   ├── MemberRoute.jsx           # Must be member
│       │   │   └── AdminRoute.jsx            # Must be admin
│       │   │
│       │   ├── 📁 utils/
│       │   │   ├── formatDate.js
│       │   │   ├── generatePDF.js           # jsPDF report generator
│       │   │   ├── uploadImage.js           # imgbb / cloudinary uploader
│       │   │   ├── calculatePriority.js
│       │   │   └── constants.js             # Categories, zones, etc.
│       │   │
│       │   ├── 📁 firebase/
│       │   │   └── firebase.init.js
│       │   │
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       │
│       ├── index.html
│       ├── vite.config.js
│       ├── eslint.config.js
│       ├── package.json
│       └── README.md
│
└── 📁 Server/
    ├── 📁 config/
    │   ├── firebase.js                      # Firebase Admin SDK
    │   └── db.js                            # MongoDB connection
    │
    ├── 📁 middleware/
    │   ├── auth.js                          # Firebase token verification
    │   ├── memberOnly.js                    # role: member check
    │   ├── adminOnly.js                     # role: admin check
    │   └── rateLimit.js                     # AI request rate limiting
    │
    ├── 📁 routes/
    │   ├── issues.js                        # /api/issues
    │   ├── contributions.js                 # /api/contributions
    │   ├── lostFound.js                     # /api/lost-found
    │   ├── animals.js                       # /api/animals
    │   ├── feedingDrives.js                 # /api/feeding-drives
    │   ├── users.js                         # /api/users
    │   ├── membership.js                    # /api/membership
    │   ├── announcements.js                 # /api/announcements
    │   ├── notifications.js                 # /api/notifications
    │   ├── forum.js                         # /api/forum
    │   ├── volunteers.js                    # /api/volunteers
    │   ├── leaderboard.js                   # /api/leaderboard
    │   ├── admin.js                         # /api/admin
    │   └── ai.js                            # /api/ai/chat
    │
    ├── 📁 controllers/
    │   ├── issueController.js
    │   ├── contributionController.js
    │   ├── lostFoundController.js
    │   ├── animalController.js
    │   ├── userController.js
    │   ├── membershipController.js
    │   ├── aiController.js                  # Anthropic API calls
    │   └── adminController.js
    │
    ├── 📁 models/                           # Optional: Mongoose schemas
    │   ├── Issue.js
    │   ├── User.js
    │   ├── LostFound.js
    │   ├── Animal.js
    │   └── Contribution.js
    │
    ├── 📁 utils/
    │   ├── notificationHelper.js
    │   ├── pointsHelper.js
    │   └── aiPrompts.js                     # System prompts for CivicBot
    │
    ├── index.js                             # Express app entry point
    ├── .env                                 # Environment variables
    ├── .gitignore
    └── package.json
```

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, DaisyUI |
| Routing | React Router v6 |
| Auth | Firebase Auth (email + Google) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Image Upload | imgbb API or Cloudinary |
| HTTP Client | Axios with interceptors |
| AI | Anthropic Claude API (claude-sonnet) |
| Maps | Leaflet.js + React-Leaflet |
| Charts | Recharts |
| PDF | jsPDF + jsPDF-AutoTable |
| Animations | Framer Motion or React-Awesome-Reveal |
| Typewriter | React-Simple-Typewriter |
| Forms | React Hook Form + Zod |
| Notifications | React Hot Toast / SweetAlert2 |
| Hosting (Client) | Firebase Hosting / Netlify |
| Hosting (Server) | Vercel / Railway |
| Env Variables | dotenv |

---

## 10. Implementation Priority

### 🟥 Phase 1 — Assignment Baseline (do first)
1. Firebase auth (login, register, Google)
2. Navbar with conditional rendering
3. Home page (banner, 4 categories, recent 6 issues, stats)
4. All Issues page (grid + filter + search)
5. Issue Details page + contribution modal
6. Add Issue page (private)
7. My Issues page (update + delete)
8. My Contributions page (PDF download)
9. 404, loading spinners, toasts, dark mode
10. Deploy client (Netlify) + server (Vercel)

### 🟧 Phase 2 — Core Extended Features
11. Membership request system + role-based route guards
12. Admin dashboard (basic: user management, membership review)
13. Lost & Found section (all 4 routes)
14. Animal Help section (all routes + feeding drives)
15. Noticeboard / Announcements
16. Notifications system (in-app)
17. Enhanced profile page with points + badges

### 🟨 Phase 3 — Engagement & Community
18. Community Map (Leaflet.js with pins)
19. Volunteer Hub
20. Leaderboard + gamification (points system)
21. Forum (threads + replies)
22. Upvote system on issues

### 🟩 Phase 4 — AI & Advanced Features
23. CivicBot floating chat (Claude API)
24. AI-powered form suggestions (Add Issue, Add Animal)
25. AI lost item matcher
26. Natural language search
27. Formal complaint letter generator
28. Admin analytics charts (Recharts)
29. Email notifications
30. SSE streaming for AI responses

---

*Document last updated: May 2026 | App: CivicNest | Stack: MERN + Firebase + Claude AI*
