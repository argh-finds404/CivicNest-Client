# CivicNest

**CivicNest is a neighbourhood civic platform.** Residents report street problems (garbage, potholes, waterlogging, broken lights), and every report becomes a trackable ticket. Neighbours claim the fix, upload proof, and the community verifies it before the issue closes. Around that core sit cleanup drives, lost & found, animal rescue, polls, a forum, NGOs, donations and an AI assistant.

* **Live app:** [https://civic-nest-client.vercel.app/](https://civic-nest-client.vercel.app/) (mirror: [civicnest-client.netlify.app](https://civicnest-client.netlify.app/))
* **Client repository:** [argh-finds404/CivicNest-Client](https://github.com/argh-finds404/CivicNest-Client) (this repo)
* **Server repository:** [argh-finds404/CivicNest-Server](https://github.com/argh-finds404/CivicNest-Server)

---

## Demo logins

On the [sign-in page](https://civic-nest-client.vercel.app/Login) the **Reviewer demo** buttons sign you in with one click, or type the details yourself.

| Role | Email | Password |
| --- | --- | --- |
| **Admin** | `admin.reviewer@civicnest.app` | `CivicNest@2026` |
| **Moderator** | `moderator.reviewer@civicnest.app` | `CivicNest@2026` |
| **Member** (general user) | `member.reviewer@civicnest.app` | `CivicNest@2026` |

**Continue with Google** also works. It creates a regular new account, which starts as a *guest* until its residency is approved.

> These are demo accounts. They are flagged `isDemo`: their roles can't be changed, and they can't change anyone else's role.
> An admin creates or resets them from **Admin → Users → Set up reviewer logins**, or with `npm run seed:reviewers` on the server.

### Demo content (dummy data)

> **Note:** the members, issues, drives, animals, lost & found posts and activity you see on the live app are **dummy demo data**, created so reviewers can try every feature. Real users' posts appear alongside them.

The app opens on a lived-in neighbourhood around Dhaka, so there is something to look at straight away:
* **10 community members** on the leaderboard, with avatars, points and streaks.
* **12 issues at every stage:** open, being fixed, awaiting verification, solved and one waiting in the moderator queue. They come with tickets, comments, votes, crowdfunding and proof photos.
* **5 cleanup drives** (3 upcoming, 1 completed, 1 awaiting approval), **5 animal rescues** and **5 lost & found posts**.
* **A recent-activity feed** (RSVPs, donations, rescues, new reports, fixes) on the home page and the leaderboard.

Demo records are flagged `isDemo` and never touch real users' content. The server adds anything missing on startup. An admin can put everything back to its starting state with **Admin → Users → Reset demo content** (or `npm run seed:demo` on the server). All demo pictures are illustrations bundled with the app in `public/demo/`, so they always load.

### Five-minute demo

1. **Member:** open **Report issue**. Write a description, and the AI suggests the category and urgency. Add a photo and submit. You get a ticket code such as `CN-2026-000123`; follow it under **My tickets**.
2. **Moderator:** open **Moderation → Issue queue**, approve the report, then open the **Ticket desk** to set priority, assign it or add a note. The member's ticket timeline updates.
3. **Member:** on an approved issue, **Claim issue**, upload proof photos, and the issue moves to *awaiting verification*.
4. **Other members** press **Verify now**. After three verifications the issue is **solved**, points are paid and the ticket is **resolved**.
5. **Admin:** users and roles, membership requests, NGOs, notices, donations, the gallery and live stats.
6. Also try the **Community Map**, CivicBot (bottom-right), the complaint letter on an issue page, lost & found, animal rescue, polls, cleanup drives and the light/dark switch.

---

## What each role can do

Roles are ranked `guest < member < moderator < admin`. The client mirrors the server rules (`src/utils/roles.js`), so the UI never offers an action the API would refuse.

| | Guest | Member | Moderator | Admin |
| --- | :---: | :---: | :---: | :---: |
| Browse the home page and help pages | ✓ | ✓ | ✓ | ✓ |
| Report issues, follow tickets, comment, vote, donate | ✓ | ✓ | ✓ | ✓ |
| Claim and fix issues, verify fixes, post in the forum, create polls, organise cleanups | | ✓ | ✓ | ✓ |
| Issue queue (approve/reject), ticket desk, review cleanup events, rescues and lost & found | | | ✓ | ✓ |
| Pin, lock and moderate threads; approve polls | | | ✓ | ✓ |
| Users and roles, membership requests, NGOs, volunteers, notices, gallery, donations | | | | ✓ |

A guest becomes a **member** by sending a residency request (address plus a utility bill photo) that an admin approves. Signed-in guests see a **Become a member** button in the navbar and the user menu; signed-out visitors see **Join** next to **Log in**. To try it, sign in with Google (new accounts start as guests).
Volunteers approved by an admin can post in the forum too.

Route guards: `PrivateRoute` (signed in), `StaffRoute` (moderator or admin) and `AdminRoute` (admin only). A signed-out visitor who opens a private page is sent to sign in and brought back afterwards.

---

## How an issue gets solved

```
Report ──► Pending review ──► Open ──► Action taken ──► Awaiting verification ──► Solved
 (member)   (moderator           (member    (resolver uploads     (3 neighbours verify)
            approves/rejects)     claims)    proof photos)
```

1. **Report:** title, description, category, urgency, location (pin on the map), date and up to 5 photos. Photos upload straight from the browser to ImgBB, and only the image links are sent to the API. The server stores the issue as `pending_review` and creates a ticket (`OPEN`). Reports cost credits, which refill over 72 hours, so the feed can't be spammed.
2. **Review:** a moderator approves it (the ticket becomes `TRIAGED` and the reporter earns points) or rejects it with a reason. An item can only be reviewed once; a second reviewer gets a clear "already reviewed" message.
3. **Claim:** a member claims the issue. It moves to `action_taken`, gets a 7-day deadline, and the ticket becomes `IN_PROGRESS`. Staff can also assign someone from the ticket desk. Claim points are paid once per person per issue, so claiming and unclaiming can't farm points.
4. **Proof:** the resolver uploads after photos (with an optional GPS check) and the issue becomes `pending_verification`.
5. **Verify:** three other members confirm the fix (not the reporter or the resolver). The issue becomes `solved`: the resolver gets +50, the reporter +25, each verifier +5, any crowdfunding held in escrow is released, and the ticket becomes `RESOLVED`.

Extras on every issue page: upvotes, witnesses, comments, an **AI summary**, share buttons, an **AI complaint letter** to the ward office, an RTI request PDF, and **crowdfunding** (card payment by Stripe or SSLCommerz, held until the fix is verified).

**Tickets:** every report has a code such as `CN-2026-000123`, a priority from its urgency (emergency 24 h, high 3 days, normal 7 days, low 14 days) and a full history. Reporters follow them at `/tickets`, and staff work them at **Admin → Tickets**. Changing a ticket's status updates the issue too, so the two always agree.

---

## AI features (Google Gemini)

| Feature | Where | Endpoint |
| --- | --- | --- |
| **CivicBot** chat assistant that remembers the conversation | Floating button on every page, and `/ai-assistant` | `POST /ai/chat` |
| **Report helper:** suggests category and urgency, and offers a polished description | Report issue form | `POST /ai/suggest-issue` |
| **Discussion summary** of an issue and its comments | Issue page | `POST /ai/summarize` |
| **Formal complaint letter** to the ward office, including the ticket code | Issue page → Escalate Government Complaint | `POST /ai/complaint-letter` |
| **Animal first-aid tip** | Animal rescue page | `POST /ai/animal-tip` |

The server holds the Gemini key (`GEMINI_API_KEY`). It tries `gemini-2.5-flash` first (override with `GEMINI_MODEL`) and moves on to other Flash models if one is retired, out of quota or overloaded.

**The AI buttons never fail.** If Gemini can't answer (no key, quota used up, outage), the server answers with built-in help instead: a guide in the chat, a keyword-based category and urgency, a first-aid checklist, a formal letter template and a short summary. Open `https://civicnest-api.onrender.com/ai/status` to see whether Gemini is configured and the last error it returned (the key itself is never shown).

---

## Images

* **Uploads** (issue photos, proofs, animals, lost & found, events, avatars) go from the browser to **ImgBB** with `VITE_IMGBB_API_KEY`. ImgBB links don't expire.
* **Every photo has a fallback.** If a link is missing or broken, cards and galleries show a matching illustration (a paw, a trash can, a key…) instead of a broken image. Default and placeholder pictures are bundled in `public/demo/`, and the logo falls back to the bundled `/favicon.png`.
* Page artwork (section emblems, the home city scene) is SVG/CSS, so it always loads.

---

## How a request travels (frontend → backend)

```
React page
  └─ TanStack Query (cache, retries, refetch)
       └─ useAxiosSecure ── adds "Authorization: Bearer <Firebase ID token>"
            │                (401 → sign out, 403 → toast)
            ▼
Express API (Render)
  cors → compression → JSON body parser → router
       └─ verifyToken   (Firebase Admin checks the token, loads the user's role from MongoDB)
       └─ role guard    (memberOnly / adminOrMod / adminOnly / creditCheck)
       └─ handler       (Mongoose + MongoDB, Prisma for tickets)
            └─ audit log, notifications, Socket.io broadcast
            ▼
JSON response → React Query cache → UI updates
Socket.io (same server) → live feed, forum typing indicators and notifications on every open tab
```

1. **Sign-in:** Firebase Auth (email/password with email verification, or Google). The client never stores passwords or its own tokens; Firebase refreshes the ID token.
2. **Every secure call** goes through `src/hooks/useAxiosSecure.js`, which attaches the current Firebase ID token. Public pages use `useAxiosPublic`.
3. **The server** verifies the token with the Firebase Admin SDK, looks up the user's role in MongoDB, and only then runs the route's role check and handler.
4. **Live updates:** after a change the server emits Socket.io events (`issueStatusUpdated`, notifications), and open pages refresh themselves.

---

## Features at a glance

* **Issues and tickets:** report, review, claim, prove, verify, escalate, crowdfund; priority queue for staff.
* **Live maps (Leaflet):** a real street map on the home page and a full Community Map with every issue, upcoming cleanup and animal in need as coloured pins with photo previews and filters. Street tiles come from CARTO, with automatic fallback to OpenStreetMap and then Esri World Street Map (all free, no API key).
* **Cleanup drives:** organise an event (staff approve it), RSVP, organiser check-in code with optional GPS, attendance points, funding goal.
* **Lost & found:** lost and found posts, claims and "I found it" reports, with points when an item is reunited.
* **Animal rescue:** report an animal in need, volunteers join, AI first-aid tip, adoption requests, feeding drives, donations.
* **Community:** forum with live typing indicators, polls (staff approve them), notice board, gallery, NGO directory and NGO registration, volunteer hub.
* **Gamification:** points, streaks, leaderboard, badges, and a downloadable **Civic Impact Resume** PDF on the profile.
* **Payments:** Stripe (card, BDT) and SSLCommerz for issue funds, animals, events, NGOs and the community fund.
* **Admin console:** live stats (issues by status and category, 7-day donations), issue queue, ticket desk, users and roles, membership, volunteers, NGOs, notices, posts, donations, and reviewer-account setup.
* **Design:** glass cards, light mode by default with a dark mode you can switch on (the choice is remembered), smooth eased scrolling for mouse and trackpad (Lenis; touch devices keep native scrolling), Bricolage Grotesque and Plus Jakarta Sans fonts, 2D page emblems, respects reduced motion.

---

## Tech stack

**Client:** React 19 · Vite 8 · React Router 7 · Tailwind CSS 4 + daisyUI 5 · TanStack Query 5 · Axios · Firebase Auth · Socket.io client · Framer Motion · Lenis · Leaflet / React Leaflet · Chart.js + Recharts · jsPDF · Stripe Elements · React Hook Form · SweetAlert2 · Remix Icons + Lucide.

**Server:** Node.js · Express 5 · MongoDB (native driver + Mongoose) · Prisma 6 (tickets) · Firebase Admin · Socket.io · Stripe · SSLCommerz · Google Gemini (`@google/generative-ai`) · express-rate-limit.

**Hosting:** client on Vercel (Netlify mirror), API on Render ([civicnest-api.onrender.com](https://civicnest-api.onrender.com)), database on MongoDB Atlas, images on ImgBB.

---

## Run it locally

Prerequisites: Node.js 18+ and the [server](https://github.com/argh-finds404/CivicNest-Server) running (default `http://localhost:3000`).

```bash
git clone https://github.com/argh-finds404/CivicNest-Client.git
cd CivicNest-Client
npm install
cp .env.example .env    # then fill in the values below
npm run dev             # http://localhost:5173
```

| Variable | What it is |
| --- | --- |
| `VITE_API_URL` | The API base URL, e.g. `http://localhost:3000` |
| `VITE_apiKey`, `VITE_authDomain`, `VITE_projectId`, `VITE_storageBucket`, `VITE_messagingSenderId`, `VITE_appId` | Firebase web app config |
| `VITE_IMGBB_API_KEY` | ImgBB key for photo uploads |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_SHOW_REVIEWER_LOGIN` | Optional. `false` hides the reviewer demo buttons |
| `VITE_REVIEWER_PASSWORD` | Optional. Set it if the server uses a different reviewer password |

For Google sign-in on a new domain, add the domain under **Firebase console → Authentication → Settings → Authorized domains**.

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
