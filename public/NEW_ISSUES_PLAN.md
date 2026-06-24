# 📋 CivicNest — Issues Module: Full Feature Specification
### Implementation Brief for Antigravity
> **Read this entire document before writing a single line of code.** This document specifies the complete behavior, data model, API endpoints, UI states, and business logic for the Issues module of CivicNest. Every edge case, state transition, and field requirement is documented here.

---

## 📌 Table of Contents

1. [Mental Model — How Issues Work](#1-mental-model--how-issues-work)
2. [Flair (Badge) System](#2-flair-badge-system)
3. [Issue Post Form — Full Field Spec](#3-issue-post-form--full-field-spec)
4. [Issue Lifecycle & Status System](#4-issue-lifecycle--status-system)
5. [Admin Approval Gate](#5-admin-approval-gate)
6. [Main Feed & Sectional Category Feed](#6-main-feed--sectional-category-feed)
7. [Issue Card — Visual States](#7-issue-card--visual-states)
8. [Comments, Upvotes & Downvotes](#8-comments-upvotes--downvotes)
9. [Crowdfunding / Charity Toggle](#9-crowdfunding--charity-toggle)
10. [Anonymous Posts (Premium Feature)](#10-anonymous-posts-premium-feature)
11. [Full Track Record — Audit Trail](#11-full-track-record--audit-trail)
12. [Database Schema](#12-database-schema)
13. [API Endpoints — Complete Reference](#13-api-endpoints--complete-reference)
14. [Frontend Component Map](#14-frontend-component-map)
15. [Business Rules Summary](#15-business-rules-summary)

---

## 1. Mental Model — How Issues Work

Think of the Issues module like a **Reddit-meets-Facebook-feed-meets-city-hall complaint desk**.

Here is the complete lifecycle of a single issue post, from creation to resolution:

```
User photographs a problem
        ↓
Fills the Issue Form (member only)
        ↓
Post saved to DB — status: "in_queue" — visible only to the poster
        ↓
Admin reviews the post in Admin Panel
        ↓
        ├── Admin REJECTS → poster gets notification, post stays private, can be edited + resubmitted
        └── Admin APPROVES → post becomes public in Main Feed + its Category Section
                                ↓
                         Status: "pending" (problem exists, not yet solved)
                                ↓
                   Community interacts: comments, upvotes/downvotes, crowd funds
                                ↓
                   Admin OR original poster marks as "solved"
                                ↓
                         Status: "solved" (flair turns green)
```

**Key principle:** Until admin approval, the post is completely invisible to everyone except the poster. It is locked, dimmed, and non-interactive.

---

## 2. Flair (Badge) System

Flair in CivicNest works like Reddit's post flair — a colored tag on the card that tells viewers the category and status of the issue at a glance.

### 2.1 — Predefined Category Flairs

These are the built-in issue categories. Rendered as colored pill badges on the card header.

| Flair Label | Color | Description |
|---|---|---|
| Garbage & Waste | 🟤 Amber-800 | Dumping, overflow, uncollected trash |
| Road Damage | 🔴 Red-600 | Potholes, broken asphalt, collapsed roads |
| Waterlogging | 🔵 Blue-600 | Flooding, blocked drains |
| Illegal Construction | 🟠 Orange-600 | Unauthorized builds, encroachments |
| Broken Public Property | 🟣 Purple-600 | Streetlights, benches, signs, parks |
| Utility Problems | 🟡 Yellow-600 | Power outages, water/gas supply issues |
| Social Problems | 🩷 Pink-600 | Noise complaints, harassment, conflict |
| Environmental Issues | 🟢 Green-700 | Pollution, deforestation, air quality |
| Safety & Crime | ⚫ Gray-900 | Suspicious activity, theft reports |
| Community Norms | 🔷 Indigo-600 | Rules violations, parking, encroachments |

### 2.2 — Custom Flair (User-Defined)

If a user cannot find a matching predefined flair, they may type a custom flair.

**Rules for custom flair:**
- Must be between **1 and 7 words** (enforced with word count validation, not character count).
- Must not be an empty string.
- Must not duplicate an existing predefined flair name (case-insensitive check).
- Stored in the DB as `customFlair: "string"` alongside `category: "Custom"`.
- Displayed on the card exactly as the user typed it, with a neutral gray color to visually distinguish it from official flairs.
- Admin can see all custom flairs in use and may retroactively reclassify them to a standard category (this updates `category` and clears `customFlair`).

**Validation message to show user:**
> "Custom flair must be 1–7 words that describe your issue clearly. Example: 'Open manhole near bus stop'"

### 2.3 — Status Flairs

Status flairs are separate from category flairs. Both appear on the card simultaneously.

| Status | Flair Label | Color | Who Can Set |
|---|---|---|---|
| `in_queue` | 🔒 In Queue | Gray-400 | System (auto on submit) |
| `pending` | 🟡 Pending | Yellow-500 | System (auto on admin approval) |
| `in_review` | 🔵 In Review | Blue-500 | Admin only |
| `action_taken` | 🟠 Action Taken | Orange-500 | Admin only |
| `solved` | ✅ Solved | Green-500 | Admin OR original poster |
| `rejected` | ❌ Rejected | Red-400 | Admin only (only visible to poster) |

---

## 3. Issue Post Form — Full Field Spec

### 3.1 — Who Can Post

- Only users with `role: "member"` or higher can access the form.
- Guests (`role: "guest"`) are redirected to the Membership Request page when they attempt to post.
- The "Report an Issue" button in the navbar/feed should show a tooltip for guests: *"Become a verified member to post issues."*

### 3.2 — Form Fields (in display order)

---

#### Field 1: Title
- **Type:** Text input
- **Required:** Yes
- **Max length:** 120 characters
- **Placeholder:** "Describe your issue in one clear sentence"
- **Validation:** Min 10 characters. Must not be all-caps. Show character count.
- **Example:** "Large pile of garbage dumped near Ward 3 school gate"

---

#### Field 2: Category Flair
- **Type:** Segmented select / searchable dropdown with predefined options
- **Required:** Yes
- **Options:** All predefined flairs listed in Section 2.1 + a final option: **"None of these — I'll write my own"**
- **Behavior:** If the user selects "None of these — I'll write my own", a text input appears below for custom flair entry (see Section 2.2).
- **Stored as:** `category: "Garbage & Waste"` OR `category: "Custom"` + `customFlair: "user text"`

---

#### Field 3: Description
- **Type:** Textarea (rich text not needed — plain text is fine)
- **Required:** Yes
- **Min length:** 30 characters
- **Max length:** 2000 characters
- **Placeholder:** "Describe the problem in detail. When did it start? How bad is it? Who or what is affected?"
- **Show character count** (remaining, e.g., "1,847 characters remaining")
- **AI Assist Button (Phase 4):** A small "✨ Help me write this" button below the field that opens a CivicBot prompt pre-seeded with the title. For now, render the button but mark it `disabled` with a tooltip "Coming soon".

---

#### Field 4: Location
- **Type:** Text input + optional map pin button
- **Required:** Yes
- **Placeholder:** "Street name, landmark, or area description"
- **Example:** "In front of Al-Amin Supermarket, Road 7, Banasree"
- **Optional map pin:** A small map icon button opens a Leaflet modal where the user can click to drop a pin. The coordinates `{ lat, lng }` are saved silently. The text input is not replaced — coordinates supplement it.
- **Stored as:** `location: "string"` + `coordinates: { lat, lng }` (null if not pinned)

---

#### Field 5: Area / Zone
- **Type:** Dropdown (predefined list)
- **Required:** Yes
- **Options:** Ward 1 through Ward 6 (or whatever zone list is configured in `constants.js`)
- **Purpose:** Enables area-based filtering in the feed

---

#### Field 6: Image Attachments
- **Type:** Multi-file image upload (using imgbb or Cloudinary)
- **Required:** At least 1 image required
- **Max images:** 5
- **Allowed formats:** JPG, PNG, WEBP
- **Max size per image:** 5MB
- **UI:** Drag-and-drop zone + click to browse. Show thumbnails with a remove (×) button on each. Show upload progress bar per image.
- **Stored as:** `images: ["url1", "url2", ...]` — array of hosted image URLs
- **Validation:** If no image is attached and user tries to submit, show: "Please attach at least one photo of the issue."

---

#### Field 7: Date of Incident
- **Type:** Date picker
- **Required:** Yes
- **Default:** Today's date (auto-filled)
- **Constraint:** Cannot be a future date. Must be within the last 90 days (older reports may not be actionable — show a warning, not an error, for reports older than 30 days).
- **Stored as:** `incidentDate: Date`
- **Note:** Separate from `submittedAt` which is auto-set by the server.

---

#### Field 8: Email (Auto-filled, Read-Only)
- **Type:** Text input — disabled/read-only
- **Value:** Pulled automatically from Firebase Auth (`currentUser.email`)
- **Display:** Shows the email with a lock icon and tooltip: "This is auto-filled from your account and cannot be changed."
- **Stored as:** `email: "string"`

---

#### Field 9: Anonymous Post Toggle (Premium Feature)
- **Type:** Toggle switch
- **Default:** OFF
- **Label:** "Post Anonymously 🔒"
- **Sublabel:** "Your name and profile photo will be hidden from the public. Your identity is known only to admins."
- **Availability:** Only visible if `user.isPremium === true`. For non-premium members, the toggle is replaced by a locked UI element:
  > 🔒 *Anonymous posting is a Premium feature. [Upgrade your membership]*
- **Behavior when ON:** `isAnonymous: true` stored in DB. On the public card, author shown as "Anonymous Member" with a generic avatar.
- **Admin visibility:** Admins always see the real name, email, and member ID regardless of anonymous flag.
- **Stored as:** `isAnonymous: boolean`

---

#### Field 10: Enable Crowd Funding / Charity Toggle
- **Type:** Toggle switch
- **Default:** OFF
- **Label:** "Enable Community Funding 💚"
- **Sublabel:** "Let community members contribute money toward solving this issue (e.g., hiring cleaners, buying materials)."
- **When toggled ON:** Reveals two sub-fields:
  - **Funding Goal (BDT):** Number input. Required if toggle is ON. Min: 100, Max: 500,000.
  - **Funding Purpose:** Short text explaining what the money will be used for. Max 200 characters.
- **Stored as:** `crowdfunding: { enabled: boolean, goal: number, purpose: "string", raised: 0 }`
- **Post-approval behavior:** Once the post is approved, a "Contribute" button appears on the card and in the issue detail page.

---

#### Submit Button
- Label: **"Submit Issue Report"**
- While loading: spinner + "Submitting…" text, button disabled.
- On success: toast "Your issue has been submitted and is awaiting admin review." + redirect to `MyIssues` page.
- On error: toast with specific error message. Form data preserved (do not reset on error).

---

### 3.3 — Edit After Submission

- The poster can edit their issue ONLY while it is in `in_queue` or `rejected` status.
- Once `pending` (admin-approved), editing is locked. An "Edit" button is replaced with: *"This post is live and cannot be edited."*
- Re-submitting after a rejection resets the status to `in_queue` and sends a new admin notification.
- Edits are tracked in the `editHistory` array (see schema in Section 12).

---

## 4. Issue Lifecycle & Status System

```
                    ┌─────────────────┐
                    │   SUBMITTED     │
                    │  status:        │
                    │  "in_queue"     │
                    │  visible: poster│
                    │  only           │
                    └────────┬────────┘
                             │
               ┌─────────────┴──────────────┐
               │ Admin reviews               │
               │                             │
        ┌──────▼──────┐             ┌────────▼────────┐
        │   REJECTED   │             │    APPROVED      │
        │ status:      │             │  status:         │
        │ "rejected"   │             │  "pending"       │
        │              │             │  visible: PUBLIC  │
        │ poster can   │             │                  │
        │ edit and     │             └────────┬─────────┘
        │ resubmit     │                      │
        └─────────────┘                       │
                                   ┌──────────▼──────────┐
                                   │ Community interacts  │
                                   │ (comments, upvotes,  │
                                   │ crowdfunding)        │
                                   └──────────┬──────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                     ┌────────▼──────┐ ┌──────▼──────┐ ┌────▼───────┐
                     │  IN REVIEW    │ │ACTION TAKEN │ │  SOLVED    │
                     │ (admin sets)  │ │ (admin sets)│ │(admin OR   │
                     └──────────────┘ └─────────────┘ │ poster sets)│
                                                       └────────────┘
```

### Status Definitions

| Status | Who Sees It | Who Can Set It | What It Means |
|---|---|---|---|
| `in_queue` | Poster only (dimmed card) | System auto | Post submitted, awaiting admin review |
| `rejected` | Poster only (dimmed card) | Admin | Admin rejected — poster notified with reason |
| `pending` | Everyone | System auto on approval | Approved and live — problem not yet solved |
| `in_review` | Everyone | Admin only | Authorities are investigating |
| `action_taken` | Everyone | Admin only | Physical steps are being taken |
| `solved` | Everyone | Admin OR poster | Problem has been resolved |

### Notifications Triggered by Status Changes

| Transition | Who Gets Notified | Notification Message |
|---|---|---|
| Submitted → in_queue | (no notification, they submitted it) | — |
| in_queue → rejected | Poster | "Your issue '[title]' was not approved. Reason: [adminNote]. You can edit and resubmit." |
| in_queue → pending | Poster | "Your issue '[title]' has been approved and is now live!" |
| pending → in_review | Poster | "Your issue '[title]' is now being reviewed by authorities." |
| in_review → action_taken | Poster | "Action is being taken on your issue '[title]'!" |
| action_taken → solved | Poster | "Your issue '[title]' has been marked as solved. Thank you!" |
| Any → solved | All upvoters | "An issue you supported has been resolved: '[title]'" |

---

## 5. Admin Approval Gate

### Admin View: Pending Review Queue

Route: `/admin/issues`

The admin sees a list of all posts with `approvalStatus: "pending_review"` at the top of the queue, ordered by submission date (oldest first — FIFO).

Each row in the admin table shows:
- Thumbnail of first image
- Issue title
- Category flair (or custom flair)
- Submitter name + email + member ID
- Submission date/time
- Is Anonymous toggle status
- Is Crowdfunding enabled
- Actions: **Approve** | **Reject**

### Approve Action

1. Admin clicks **Approve**.
2. Backend:
   - Sets `approvalStatus: "approved"` and `status: "pending"`.
   - Sets `approvedAt: Date.now()`.
   - Sets `approvedBy: adminEmail`.
   - Issue becomes publicly visible in Feed and Category Section.
3. Poster receives notification (see Section 4).
4. Admin audit log entry created (see Section 11).

### Reject Action

1. Admin clicks **Reject**.
2. A modal opens asking for a reject reason (required text field, max 300 characters).
3. Backend:
   - Sets `approvalStatus: "rejected"` and `status: "rejected"`.
   - Sets `rejectedAt`, `rejectedBy`, `rejectReason`.
4. Poster receives notification with the reason.
5. Post remains in the poster's `MyIssues` list, editable.
6. Admin audit log entry created.

### Admin Notes Field

Admins can leave an internal note on any post (visible only to admins, not to the poster or public). Stored in `adminNotes: "string"`.

---

## 6. Main Feed & Sectional Category Feed

### 6.1 — Main Feed (`/issues`)

The main feed shows all approved issues from all categories, ordered by default: **newest first**.

**Sorting options (user-selectable):**
- Newest First (default)
- Most Upvoted
- Highest Funded (if crowdfunding enabled)
- Closest to Me (requires location permission — uses coordinates)

**Filter options (sidebar or top filter bar):**
- By Category Flair (multi-select pills)
- By Status (Pending / In Review / Action Taken / Solved)
- By Area/Zone (dropdown)
- By Date Range (date pickers)
- Crowdfunding only toggle

**Search bar:** Full-text search across title and description. Debounced at 400ms. Hits the API with `?search=` query param.

**Pagination:** Load 12 cards per page. DaisyUI pagination component at the bottom.

**Anonymous posts in feed:** Shown with "Anonymous Member" as author name and a generic avatar icon. No name, no photo, no member ID visible.

### 6.2 — Category Section Feed (`/issues?category=Garbage+%26+Waste`)

Each category has its own filtered view. Accessed by clicking a category pill on the homepage or the category tabs on the issues page. Functionally the same as the main feed but pre-filtered to one category. Same sorting and secondary filter options apply.

### 6.3 — What the Poster Sees Before Approval

The poster's own `MyIssues` page shows all their posts regardless of status. A `in_queue` or `rejected` post shows:
- A **dimmed gray overlay** on the card.
- A lock icon (🔒) in the top-right corner.
- The status flair: "In Queue" (gray) or "Rejected" (red).
- An **Edit** button (only while in_queue or rejected).
- For rejected posts: the reject reason is shown in a collapsible alert below the card.
- No comment section, no upvote bar, no crowdfunding widget visible on locked cards.

---

## 7. Issue Card — Visual States

### Approved / Public Card

```
┌──────────────────────────────────────────────┐
│ [Image thumbnail — full width, 16:9]          │
├──────────────────────────────────────────────┤
│ 🟤 Garbage & Waste     🟡 Pending            │  ← Category flair + Status flair
│                                              │
│ Large garbage dump near Ward 3 school gate   │  ← Title
│                                              │
│ 📍 Road 7, Banasree, Ward 3                 │  ← Location
│ 🕒 Submitted: May 28, 2026, 4:23 PM         │  ← submittedAt (formatted)
│ 👤 Rahul Ahmed  (Member #1042)              │  ← Author (hidden if anonymous)
│                                              │
│ [💚 Crowd Fund: ৳ 1,200 / ৳ 5,000 raised]  │  ← Shown only if crowdfunding enabled
│                                              │
│ ▲ 47  ▼ 3   💬 12 comments   🔗 Share       │  ← Action bar
│                                              │
│                   [ See Full Issue → ]       │
└──────────────────────────────────────────────┘
```

### Locked / In-Queue Card (only poster sees this)

```
┌──────────────────────────────────────────────┐
│ [Image thumbnail — DIMMED / 40% opacity]      │
├──────────────────────────────────────────────┤
│ 🔒 In Queue                                  │  ← Only status flair shown
│                                              │
│ Large garbage dump near Ward 3 school gate   │  ← Title (normal)
│                                              │
│ 📍 Road 7, Banasree, Ward 3                 │
│ 🕒 Submitted: May 28, 2026, 4:23 PM         │
│                                              │
│ ⚠️ This post is pending admin review.        │
│    No activity until approved.               │
│                                              │
│ [ ✏️ Edit Post ]                             │  ← Only active button
└──────────────────────────────────────────────┘
```

### Rejected Card (only poster sees this)

```
┌──────────────────────────────────────────────┐
│ [Image thumbnail — RED-tinted / 30% opacity]  │
├──────────────────────────────────────────────┤
│ ❌ Rejected                                  │
│                                              │
│ Large garbage dump near Ward 3 school gate   │
│                                              │
│ 📍 Road 7, Banasree, Ward 3                 │
│ 🕒 Submitted: May 28, 2026, 4:23 PM         │
│                                              │
│ ▼ Admin Feedback (click to expand)           │
│   "Image quality too low to verify the       │
│    reported location. Please retake."        │
│                                              │
│ [ ✏️ Edit & Resubmit ]                       │
└──────────────────────────────────────────────┘
```

---

## 8. Comments, Upvotes & Downvotes

### 8.1 — Upvote / Downvote

- **Who can vote:** Any logged-in user (member or guest with account).
- **Toggle behavior:** Clicking ▲ again removes the upvote (neutral). Cannot upvote and downvote simultaneously.
- **One vote per user per issue.** Enforced on the backend.
- **Stored as:** `upvotes: [userId, ...]` and `downvotes: [userId, ...]`.
- **Net score displayed:** `upvotes.length - downvotes.length`. Shown as a number between the ▲ and ▼ buttons.
- **Effect on priority:** Net score feeds into the priority calculation (`calculatePriority.js`).
- **Anonymous posts:** Voting is still possible. The poster's identity is not revealed by vote counts.

### 8.2 — Comments

- **Who can comment:** Only `role: "member"` or higher.
- **Guests see:** Comment thread visible but greyed-out "Join as a member to comment" prompt instead of input.
- **Comment fields:**
  - `body`: string, required, max 1000 characters
  - `userId`: auto from auth
  - `userName`: auto from auth (or "Anonymous Member" if post is anonymous — but commenter's own name always shows)
  - `userAvatar`: auto from auth
  - `createdAt`: server timestamp
- **Replies:** One level of reply only. A reply button on each comment opens an inline reply input. Replies nested visually beneath the parent comment (indented).
- **Edit/Delete:** A user can edit or delete their own comment within 15 minutes. After 15 minutes, edit is locked (delete still allowed).
- **Admin moderation:** Admins can delete any comment. Deleted comments show "[Comment removed by admin]" placeholder.
- **Comment count:** Shown on card. Updates in real time (or on page refresh).

### 8.3 — Report / Flag

- Any logged-in user can report a comment or a post as inappropriate (one report per user per item).
- 3 distinct user reports → post/comment is auto-hidden pending admin review.
- Admins see flagged content highlighted in the admin panel.

---

## 9. Crowdfunding / Charity Toggle

### How It Works

When a poster enables crowdfunding:
- The issue card shows a funding progress bar once approved.
- A **"Contribute ৳"** button opens the `ContributionModal`.
- Contributions are stored in the `contributions` collection linked to the `issueId`.

### ContributionModal Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Amount (BDT) | Number | Yes | Min: 10 BDT |
| Contributor Name | Text | Yes | Auto-filled from auth, editable |
| Email | Text | Yes | Auto-filled from auth, read-only |
| Phone | Text | No | Optional contact |
| Message | Textarea | No | Optional note, max 200 chars |

### Funding Display on Card

```
💚 Community Fund: ৳ 1,200 raised of ৳ 5,000 goal
█████████░░░░░░░░░░░░ 24%
[Contribute Now]
```

### Funding Rules

- Crowdfunding can only be contributed to once the post is **approved and public**.
- If a post is rejected, any contributions already made are refunded (admin triggers this manually or the system holds them for 48h).
- Goal can be set between ৳ 100 and ৳ 500,000.
- Once `raised >= goal`, the button changes to "Goal Reached! Thank you 🎉" (disabled).
- Fund destination and disbursement are managed by admin — outside the app's current scope.

---

## 10. Anonymous Posts (Premium Feature)

### What "Anonymous" Means

- The poster's real name, avatar, and member ID are hidden from the public card and detail page.
- Author is shown as **"Anonymous Member"** with a generic icon.
- Comments from the post author (replying in their own thread) are shown as **"OP (Anonymous)"**.

### What Is NOT Hidden

- Admins always see real identity (name, email, memberId) in the admin panel.
- The audit trail always records the real user regardless of anonymous flag.
- Upvote/downvote attribution is tracked internally (not shown publicly).

### Use Cases

Anonymous posting is designed for sensitive reports that members may fear retaliation for:
- Sexual harassment
- Corruption by local officials
- Domestic violence or abuse in communal spaces
- Drug activity
- Threats from local gangs or groups

### Premium Gating

- Non-premium members see the toggle but it is locked with an upgrade prompt.
- `isPremium` is a boolean field on the `users` document.
- For now, set `isPremium: true` manually for test users. Membership payment system is a future phase.
- Premium badge shown on profile: **⭐ Premium Member**

### Anonymous Post in Admin Panel

In the admin issues list:
- Anonymous posts are flagged with a 🔒 icon.
- A "Reveal Identity" expandable section shows: Real Name, Email, Member ID.
- This reveal is logged in the audit trail (who revealed, when).

---

## 11. Full Track Record — Audit Trail

Every issue and every significant action on it must be fully traceable. This is not just for debugging — it is a core feature for community trust and accountability.

### 11.1 — Issue Document Tracking Fields

Every issue document in MongoDB must include:

```json
{
  "submittedBy": {
    "userId": "firebase_uid",
    "name": "Rahul Ahmed",
    "email": "rahul@email.com",
    "memberId": "MEM-1042",
    "photoURL": "https://..."
  },
  "submittedAt": "2026-05-28T10:23:44.000Z",
  "incidentDate": "2026-05-27",

  "approvalStatus": "pending_review | approved | rejected",
  "approvedAt": "2026-05-28T14:05:00.000Z",
  "approvedBy": "admin@civicnest.com",
  "rejectedAt": null,
  "rejectedBy": null,
  "rejectReason": null,

  "lastEditedAt": null,
  "editHistory": [
    {
      "editedAt": "2026-05-28T11:00:00.000Z",
      "editedBy": "rahul@email.com",
      "fieldChanged": ["description", "images"],
      "previousValues": {
        "description": "old text...",
        "images": ["old_url"]
      }
    }
  ],

  "adminNotes": "Verified via satellite view. Legitimate report.",
  "identityRevealLog": []
}
```

### 11.2 — Comment Track Record

Each comment stores:
```json
{
  "_id": "ObjectId",
  "issueId": "string",
  "userId": "firebase_uid",
  "userName": "Rahul Ahmed",
  "userEmail": "rahul@email.com",
  "userAvatar": "https://...",
  "memberId": "MEM-1042",
  "body": "This has been a problem for months!",
  "isAnonymousPost": false,
  "parentCommentId": null,
  "createdAt": "2026-05-28T15:30:00.000Z",
  "editedAt": null,
  "isDeleted": false,
  "deletedBy": null,
  "deletedAt": null,
  "flaggedBy": ["userId1"],
  "isHidden": false
}
```

### 11.3 — Contribution Track Record

Each contribution stores:
```json
{
  "_id": "ObjectId",
  "issueId": "string",
  "contributorName": "Fatema Khatun",
  "contributorEmail": "fatema@email.com",
  "contributorPhone": "+880...",
  "memberId": "MEM-2017",
  "amount": 500,
  "message": "Hope this gets fixed soon!",
  "paidAt": "2026-05-28T16:45:00.000Z",
  "paymentMethod": "manual | stripe | sslcommerz",
  "transactionId": "TXN_12345",
  "type": "issue"
}
```

### 11.4 — Admin Audit Log

A separate `auditLogs` collection. One document per admin action.

```json
{
  "_id": "ObjectId",
  "action": "APPROVE_ISSUE | REJECT_ISSUE | CHANGE_STATUS | DELETE_COMMENT | REVEAL_IDENTITY | CHANGE_USER_ROLE",
  "targetType": "issue | comment | user",
  "targetId": "ObjectId reference",
  "performedBy": {
    "adminEmail": "admin@civicnest.com",
    "adminName": "Site Admin",
    "adminId": "firebase_uid"
  },
  "detail": "Approved issue #XYZ — garbage report at Ward 3",
  "previousValue": "in_queue",
  "newValue": "pending",
  "timestamp": "2026-05-28T14:05:00.000Z",
  "ipAddress": "optional"
}
```

---

## 12. Database Schema

### `issues` Collection — Complete Schema

```json
{
  "_id": "ObjectId",

  "title": "string (required, 10–120 chars)",
  "description": "string (required, 30–2000 chars)",

  "category": "string (predefined | 'Custom')",
  "customFlair": "string | null (1–7 words, only if category === 'Custom')",

  "location": "string (required)",
  "area": "string (required, e.g. 'Ward 3')",
  "coordinates": {
    "lat": "number | null",
    "lng": "number | null"
  },

  "images": ["url1", "url2"],

  "incidentDate": "Date (required, not future, max 90 days ago)",
  "submittedAt": "Date (server timestamp, auto)",
  "updatedAt": "Date (auto on any update)",

  "submittedBy": {
    "userId": "firebase_uid",
    "name": "string",
    "email": "string",
    "memberId": "string (e.g. MEM-1042)",
    "photoURL": "string"
  },

  "isAnonymous": "boolean (default: false)",
  "isPremiumFeature": "boolean (same as isAnonymous — denotes premium gating)",

  "approvalStatus": "pending_review | approved | rejected",
  "approvedAt": "Date | null",
  "approvedBy": "string (admin email) | null",
  "rejectedAt": "Date | null",
  "rejectedBy": "string | null",
  "rejectReason": "string | null",
  "adminNotes": "string | null",

  "status": "in_queue | pending | in_review | action_taken | solved | rejected",
  "statusChangedAt": "Date",
  "statusChangedBy": "string (email)",

  "upvotes": ["userId"],
  "downvotes": ["userId"],
  "netScore": "number (computed: upvotes.length - downvotes.length)",

  "commentCount": "number (cached count, updated on comment add/delete)",

  "crowdfunding": {
    "enabled": "boolean (default: false)",
    "goal": "number | null",
    "purpose": "string | null",
    "raised": "number (default: 0)"
  },

  "priority": "low | medium | high (auto-calculated)",

  "spamFlags": ["userId"],
  "isHidden": "boolean (default: false)",

  "editHistory": [
    {
      "editedAt": "Date",
      "editedBy": "email",
      "fieldsChanged": ["string"],
      "previousValues": {}
    }
  ],

  "identityRevealLog": [
    {
      "revealedBy": "admin email",
      "revealedAt": "Date"
    }
  ]
}
```

### `comments` Collection — Complete Schema

```json
{
  "_id": "ObjectId",
  "issueId": "ObjectId (ref: issues)",
  "parentCommentId": "ObjectId | null (null = top-level, ObjectId = reply)",
  "userId": "string (firebase_uid)",
  "userName": "string",
  "userEmail": "string",
  "userAvatar": "string",
  "memberId": "string",
  "body": "string (required, max 1000 chars)",
  "createdAt": "Date",
  "editedAt": "Date | null",
  "editWindow": "15 minutes from createdAt",
  "isDeleted": "boolean (default: false)",
  "deletedBy": "string | null",
  "deletedAt": "Date | null",
  "flaggedBy": ["userId"],
  "isHidden": "boolean (default: false)"
}
```

---

## 13. API Endpoints — Complete Reference

**Base URL:** `/api/issues`

All protected routes require: `Authorization: Bearer <Firebase ID Token>`

---

### Issues CRUD

#### `GET /api/issues`
**Auth:** Public
**Query params:**
```
?category=Garbage+%26+Waste
&status=pending
&area=Ward+3
&search=garbage
&crowdfunding=true
&sort=newest | most_upvoted | most_funded
&page=1
&limit=12
```
**Returns:** Array of approved issues (`approvalStatus: "approved"`) with pagination metadata.
**Note:** Never returns `in_queue` or `rejected` posts to non-owner, non-admin callers.

---

#### `GET /api/issues/:id`
**Auth:** Public (for approved posts). Token required to see own in_queue/rejected post.
**Returns:** Full issue document + comment count + funding progress. If `isAnonymous: true`, strip real identity fields before sending to public callers. Admin callers receive full document.

---

#### `POST /api/issues`
**Auth:** Member only (`verifyToken` + `memberOnly` middleware)
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "customFlair": "string | null",
  "location": "string",
  "area": "string",
  "coordinates": { "lat": 0, "lng": 0 },
  "images": ["url1", "url2"],
  "incidentDate": "ISO date string",
  "isAnonymous": false,
  "crowdfunding": {
    "enabled": false,
    "goal": null,
    "purpose": null
  }
}
```
**Server adds automatically:**
- `submittedBy` (from token + DB lookup: userId, name, email, memberId, photoURL)
- `submittedAt: Date.now()`
- `approvalStatus: "pending_review"`
- `status: "in_queue"`
- `upvotes: []`, `downvotes: []`, `netScore: 0`
- `commentCount: 0`
- `crowdfunding.raised: 0`
- `priority: "low"` (recalculated later)

**Returns:** `{ success: true, issueId: "..." }`

**Side effects:**
- Creates a notification for all admins: "New issue submitted for review by [name]"
- Awards +5 points to poster (for submitting — full +10 on approval)

---

#### `PATCH /api/issues/:id`
**Auth:** Token required. Only callable by original poster. Only works if `approvalStatus` is `pending_review` or `rejected`.
**Body:** Any subset of editable fields (title, description, category, customFlair, location, area, coordinates, images, incidentDate, isAnonymous, crowdfunding)
**Server adds:**
- Pushes to `editHistory` with previous values and `editedAt`
- If status was `rejected`, resets `approvalStatus: "pending_review"`, `status: "in_queue"`, clears `rejectedAt`, `rejectedBy`, `rejectReason`
- Sends new admin notification for resubmitted posts

**Returns:** `{ success: true }`

---

#### `DELETE /api/issues/:id`
**Auth:** Token required. Only callable by original poster OR admin.
**Behavior:** Soft-delete — sets `isDeleted: true`, `deletedAt`, `deletedBy`. Not actually removed from DB.
**Returns:** `{ success: true }`

---

### Upvote / Downvote

#### `PATCH /api/issues/:id/upvote`
**Auth:** Token required (any logged-in user)
**Logic:**
- If userId in `upvotes[]` → remove from upvotes (toggle off)
- Else → add to upvotes, remove from downvotes if present
- Recalculate `netScore`
- Recalculate `priority`
**Returns:** `{ netScore: 44, userVote: "up | null" }`

#### `PATCH /api/issues/:id/downvote`
**Auth:** Token required
**Logic:** Mirror of upvote, operating on `downvotes[]`
**Returns:** `{ netScore: 44, userVote: "down | null" }`

---

### Admin Approval

#### `GET /api/issues/admin/queue`
**Auth:** Admin only
**Returns:** All issues with `approvalStatus: "pending_review"`, ordered by `submittedAt` ascending (oldest first). Includes full submittedBy fields (real identity, regardless of isAnonymous).

#### `PATCH /api/issues/:id/approve`
**Auth:** Admin only
**Server actions:**
- Sets `approvalStatus: "approved"`, `status: "pending"`, `approvedAt`, `approvedBy`
- Awards +10 points to poster
- Sends notification to poster
- Creates audit log entry
**Returns:** `{ success: true }`

#### `PATCH /api/issues/:id/reject`
**Auth:** Admin only
**Body:** `{ "reason": "string (required, max 300 chars)" }`
**Server actions:**
- Sets `approvalStatus: "rejected"`, `status: "rejected"`, `rejectedAt`, `rejectedBy`, `rejectReason`
- Sends notification to poster with reason
- Creates audit log entry
**Returns:** `{ success: true }`

#### `PATCH /api/issues/:id/status`
**Auth:** Admin only
**Body:** `{ "status": "in_review | action_taken | solved" }`
**Also callable by poster** for `solved` only
**Server actions:**
- Updates status, `statusChangedAt`, `statusChangedBy`
- Sends notifications per Section 4 table
- If solved: award points (poster +25, all upvoters notified)
- Creates audit log entry
**Returns:** `{ success: true }`

---

### Comments

#### `GET /api/issues/:id/comments`
**Auth:** Public
**Query:** `?page=1&limit=20`
**Returns:** Paginated comments array. For deleted comments: returns `{ isDeleted: true, body: null }`. Strips real identity if parent issue is anonymous (comment author identity still shown — only issue poster's identity is anonymous).

#### `POST /api/issues/:id/comments`
**Auth:** Member only
**Body:** `{ "body": "string", "parentCommentId": "ObjectId | null" }`
**Server adds:** userId, userName, userEmail, userAvatar, memberId, createdAt, editWindow
**Side effects:** Increments `commentCount` on issue. Sends notification to issue poster.
**Returns:** Full comment object

#### `PATCH /api/comments/:commentId`
**Auth:** Token — own comment only, within 15-minute edit window
**Body:** `{ "body": "string" }`
**Returns:** `{ success: true, editedAt: "..." }`

#### `DELETE /api/comments/:commentId`
**Auth:** Token — own comment OR admin
**Behavior:** Sets `isDeleted: true`, `deletedBy`, `deletedAt`. Does NOT remove from DB. Decrements `commentCount`.
**Returns:** `{ success: true }`

#### `PATCH /api/comments/:commentId/flag`
**Auth:** Token
**Behavior:** Adds userId to `flaggedBy[]`. If count reaches 3, sets `isHidden: true`. Sends admin notification.
**Returns:** `{ success: true, flagCount: 3 }`

---

### Spam / Flagging Issues

#### `PATCH /api/issues/:id/flag`
**Auth:** Token
**Behavior:** Adds userId to `spamFlags[]`. At 3 flags → sets `isHidden: true`. Admin notified.
**Returns:** `{ success: true }`

---

### My Issues

#### `GET /api/issues/my`
**Auth:** Token (any logged-in user)
**Returns:** All issues where `submittedBy.userId === req.user.uid`, including `in_queue` and `rejected` posts. Full document for each (no identity stripping — it's their own posts).

---

### Admin Identity Reveal

#### `GET /api/issues/:id/reveal-identity`
**Auth:** Admin only
**Returns:** `{ name, email, memberId, photoURL }` of the real poster
**Side effect:** Logs to `identityRevealLog` on the issue document + audit log

---

### Contributions (Crowdfunding)

#### `POST /api/contributions`
**Auth:** Token (any logged-in user)
**Body:**
```json
{
  "issueId": "string",
  "amount": 500,
  "name": "Fatema Khatun",
  "phone": "+880...",
  "message": "Hope this helps!"
}
```
**Email auto-read from token.** `memberId` resolved from DB.
**Validations:** Issue must exist + be approved + have `crowdfunding.enabled: true`. Amount must be ≥ 10.
**Side effects:** Increments `crowdfunding.raised` on issue. Awards +15 points to contributor. Sends thank-you notification.

#### `GET /api/contributions/issue/:issueId`
**Auth:** Public
**Returns:** List of contributions for that issue (name, amount, message, paidAt). Email and phone NOT returned publicly.

#### `GET /api/contributions/my`
**Auth:** Token
**Returns:** All contributions by the logged-in user across all issues.

---

## 14. Frontend Component Map

```
src/
├── pages/Issues/
│   ├── AllIssues.jsx              ← Feed + filters + search + pagination
│   ├── IssueDetails.jsx           ← Full post view + comments + funding
│   ├── AddIssue.jsx               ← Post form (member only)
│   └── MyIssues.jsx               ← Poster's own posts (all statuses)
│
├── components/
│   ├── cards/
│   │   └── IssueCard.jsx          ← Handles all 3 visual states (locked, dimmed, public)
│   │
│   ├── forms/
│   │   ├── IssueForm.jsx          ← Reused by AddIssue and Edit modal
│   │   ├── ContributionModal.jsx  ← Crowdfunding modal
│   │   └── CommentBox.jsx         ← Comment input + reply thread
│   │
│   ├── common/
│   │   ├── FlairPill.jsx          ← Category flair pill (accepts color prop)
│   │   ├── StatusBadge.jsx        ← Status badge (accepts status string)
│   │   ├── FundingProgress.jsx    ← Progress bar + raised/goal display
│   │   ├── VoteBar.jsx            ← ▲ count ▼ buttons with toggle logic
│   │   └── LockedCardOverlay.jsx  ← Dimmed overlay + lock icon for in_queue cards
│   │
│   └── admin/
│       ├── IssueQueueTable.jsx    ← Admin approval queue
│       └── IssueStatusControl.jsx ← Admin status dropdown per issue
```

---

## 15. Business Rules Summary

A quick reference for implementers. If any of these rules are violated, it is a bug.

| Rule | Detail |
|---|---|
| Only members can post | `role: member/moderator/admin` required for `POST /api/issues` |
| Post starts invisible | `approvalStatus: "pending_review"` — not in any public feed |
| Only poster sees own in_queue post | Filter on `submittedBy.userId` server-side |
| Locked card = no interactions | No comments, no votes, no crowdfunding until `approved` |
| Edit only before approval | Edit locked once `approvalStatus === "approved"` |
| Reject → poster can edit and resubmit | Resubmit resets status to `pending_review` |
| Anonymous = identity hidden from public | Admin always sees real identity |
| Anonymous = premium only | Non-premium users cannot toggle isAnonymous to true |
| Custom flair = 1–7 words | Enforce on client AND server |
| Crowdfunding requires approval first | Cannot accept contributions on in_queue posts |
| 3 spam flags → auto-hide | Admin receives notification; can restore or permanently delete |
| Upvote/downvote mutually exclusive | Adding one removes the other |
| Comment edit window = 15 minutes | After 15 min, edit locked; delete still allowed forever |
| Admin actions are always logged | Every approve, reject, status change → audit log entry |
| Identity reveals are logged | Per-reveal log on issue + audit log |
| Solved → points awarded | +25 to poster, notification to all upvoters |

---

*Document: NEW_ISSUES_PLAN.md | Module: Issues | App: CivicNest | Prepared for: Antigravity | Date: May 2026*
