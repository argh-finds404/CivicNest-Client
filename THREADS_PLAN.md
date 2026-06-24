# Forum Threads — Review, Corrections & Design Guide

> Plan is architecturally sound. Eight corrections + full design spec below.
> Key insight: Discord confuses people because of its server/channel hierarchy.
> This implementation must feel like WhatsApp Groups with topic labels, not Discord.

---

## Answer the Open Questions First

**Default view:** Show the welcome panel. Do not auto-load a thread. Reason: auto-loading means a socket join fires immediately for every user who navigates to `/forum`, even if they only came to browse. Load on deliberate click only.

**Typing indicator:** Yes, show it. 1.5s debounce is correct. One addition: clear the typing state immediately on message submit, not just on 1.5s timeout.

---

## Eight Corrections

**1. Mobile is completely missing from the plan.**
Discord's split-pane fails on phones because 300px sidebar + chat = unusable. Implement three states:

```
Mobile  (<768px):  full-screen sidebar OR full-screen chat — never both
Tablet  (768-1023): sidebar hidden by default, slide-in via hamburger
Desktop (≥1024px): permanent split pane
```

State variable: `const [mobilePanelView, setMobilePanelView] = useState('sidebar')` → `'sidebar' | 'chat'`

When user taps a thread on mobile: `setMobilePanelView('chat')`. Back arrow in chat header: `setMobilePanelView('sidebar')`.

---

**2. Loading 500 messages will lag. Paginate from the bottom.**

Don't load all replies. Load the last 50. On scroll to top, load the previous 50.

```js
// GET /api/forum/:id — add pagination params
// ?limit=50&before=<oldest_reply_id>
// Backend: find replies before that _id, sort descending, reverse for display
```

Frontend: `useRef` on the scroll container. When `scrollTop < 100`, trigger "load older messages" fetch. Prepend to list. Maintain scroll position (save scroll height before prepend, restore after).

---

**3. "Kicking participants" on thread delete is wrong wording and wrong UX.**

Don't "kick" — redirect gracefully. When `thread_deleted` socket event fires:
```js
socket.on('thread_deleted', ({ threadId }) => {
  if (activeThreadId === threadId) {
    setActiveThreadId(null);
    toast('This thread was removed by a moderator.', { icon: '🗑' });
  }
});
```
No aggressive language. No boot animation. Just return to welcome panel silently with a soft toast.

---

**4. URL parsing needs XSS protection.**

Block `javascript:` and `data:` URLs before rendering as anchor tags:

```js
function parseLinks(text) {
  const urlRegex = /https?:\/\/[^\s<>"']+/g;
  return text.replace(urlRegex, (url) => {
    // Block dangerous protocols
    if (!/^https?:\/\//i.test(url)) return url;
    const safe = encodeURI(decodeURI(url));
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="text-teal-600 underline break-all">${url}</a>`;
  });
}
// Render with dangerouslySetInnerHTML ONLY after this parse
// Never pass raw user input directly
```

---

**5. Message grouping is missing — critical for readability.**

Consecutive messages from the same user should visually group. Show avatar + name only on the first message of a group. Following messages from the same person show only the time on hover.

```js
// In message list render:
const isGrouped = (index) => {
  if (index === 0) return false;
  const prev = messages[index - 1];
  const curr = messages[index];
  return (
    prev.postedBy === curr.postedBy &&
    new Date(curr.date) - new Date(prev.date) < 5 * 60 * 1000  // within 5 min
  );
};
```

This is what makes it feel like WhatsApp/Telegram rather than a comment thread.

---

**6. Add "reply-to" quoting — the most important missing feature.**

Without this, multi-person conversations become unreadable. When user taps a message, show a small "↩ Reply" button. Clicking it sets a `replyingTo` state. The input bar shows a preview of the quoted message. The sent reply stores `{ replyTo: { messageId, text, senderName } }`.

```jsx
// Reply preview above input bar:
{replyingTo && (
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-l-4 border-teal-500 mx-4 rounded-lg mb-2">
    <div className="flex-grow min-w-0">
      <p className="text-xs font-semibold text-teal-600">{replyingTo.senderName}</p>
      <p className="text-xs text-gray-500 truncate">{replyingTo.text}</p>
    </div>
    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
  </div>
)}
```

In the message bubble, if `reply.replyTo` exists, show a small quoted block above the message body.

---

**7. Socket reconnection is not handled.**

If the user's internet drops for 3 seconds, the socket disconnects. When it reconnects, they've missed messages. Handle gracefully:

```js
socket.on('reconnect', () => {
  // Re-join the current room
  if (activeThreadId) socket.emit('join_thread', activeThreadId);
  // Fetch missed messages since last received message timestamp
  queryClient.invalidateQueries(['thread', activeThreadId]);
  toast('Reconnected ✓', { icon: '🔄', duration: 2000 });
});
```

---

**8. Admin moderation in chat header — not AdminForum.jsx.**

The plan says modify `AdminForum.jsx`. Wrong location. Admin tools should live inside the `ThreadDetails.jsx` header, conditionally rendered for admin users. `AdminForum.jsx` remains the full management table. The in-chat header just has three icons: 📌 Pin / 🔒 Lock / 🗑 Delete — visible only when `userRole === 'admin'`.

---

## Layout Design Spec

### Split Pane Structure

```
DESKTOP (≥1024px):
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (w-72)              │ CHAT AREA (flex-1)                    │
│ bg-gray-950                 │ bg-gray-50 dark:bg-gray-900           │
│                             │                                       │
│ ┌─ Brand bar ─────────────┐ │ ┌─ Thread Header ────────────────────┐│
│ │ 💬 Threads              │ │ │ # Thread Title  [📌] [🔒] [🗑]    ││
│ └─────────────────────────┘ │ │ Category pill · N members active    ││
│                             │ └────────────────────────────────────┘│
│ ┌─ Search ────────────────┐ │                                       │
│ │ 🔍 Search threads...    │ │ ┌─ Message area (overflow-y-auto) ───┐│
│ └─────────────────────────┘ │ │                                     ││
│                             │ │ [messages scroll here]              ││
│ CATEGORIES                  │ │                                     ││
│ # General         (12)      │ │ "New messages below ▾" float btn   ││
│ # Safety           (3)      │ └─────────────────────────────────────┘│
│ # Suggestions      (7)      │                                       │
│ # Events           (2)      │ ┌─ Typing indicator ─────────────────┐│
│ # Off-Topic        (5)      │ │ Jane is typing...                   ││
│                             │ └─────────────────────────────────────┘│
│ THREADS (filtered)          │                                       │
│ ┌─────────────────────────┐ │ ┌─ Input bar ────────────────────────┐│
│ │ 📌 Thread title         │ │ │ [Reply quote preview — if replying] ││
│ │ Last message preview    │ │ │ [textarea] [Send →]                 ││
│ └─────────────────────────┘ │ └─────────────────────────────────────┘│
│ ┌─────────────────────────┐ │                                       │
│ │ Thread title            │ │                                       │
│ │ Last: Ahmed: "check..." │ │                                       │
│ └─────────────────────────┘ │                                       │
│                             │                                       │
│ [+ New Thread]              │                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Sidebar Colors

```jsx
<aside className="
  w-72 flex-shrink-0 flex flex-col
  bg-gray-950
  border-r border-gray-800
">
  {/* Brand bar */}
  <div className="px-4 py-3 border-b border-gray-800">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-black">C</div>
      <span className="text-white font-bold text-sm" style={{ fontFamily: 'HKGrotesk' }}>Community Threads</span>
    </div>
  </div>
```

### Category / Channel Items

```jsx
// Category item in sidebar
<button onClick={() => setCategory(cat.key)}
        className={`
          w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors
          ${activeCategory === cat.key
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }
        `}>
  <span className="flex items-center gap-2">
    <span className="text-gray-500 text-xs font-bold">#</span>
    {cat.label}
  </span>
  {cat.unread > 0 && (
    <span className="bg-teal-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
      {cat.unread}
    </span>
  )}
</button>
```

### Thread List Items in Sidebar

```jsx
<button onClick={() => handleSelectThread(thread._id)}
        className={`
          w-full px-3 py-2.5 rounded-xl text-left transition-colors mb-1
          ${activeThreadId === thread._id
            ? 'bg-gray-700'
            : 'hover:bg-gray-800/60'
          }
        `}>
  <div className="flex items-center gap-2">
    {thread.isPinned && <span className="text-amber-400 text-xs">📌</span>}
    {thread.isLocked && <span className="text-gray-500 text-xs">🔒</span>}
    <p className="text-sm font-semibold text-gray-200 truncate flex-grow">
      {thread.title}
    </p>
    <span className="text-gray-500 text-xs flex-shrink-0">{thread.replyCount}</span>
  </div>
  <p className="text-xs text-gray-500 truncate mt-0.5 ml-4">
    {thread.lastReply?.senderName}: "{thread.lastReply?.preview}"
  </p>
</button>
```

---

## Message Bubble Design

The right panel uses message bubbles, NOT the old card-list format.

```jsx
function MessageBubble({ reply, isGrouped, isOwn }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`flex gap-3 px-4 ${isGrouped ? 'mt-0.5' : 'mt-4'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar — only on first of group */}
      <div className="w-9 flex-shrink-0">
        {!isGrouped ? (
          reply.posterPhoto
            ? <img src={reply.posterPhoto} className="w-9 h-9 rounded-full object-cover" alt="" />
            : <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {(reply.posterName || 'U')[0].toUpperCase()}
              </div>
        ) : (
          /* timestamp on hover for grouped messages */
          showActions && (
            <span className="text-[10px] text-gray-500 mt-1 block text-right">
              {formatTime(reply.date)}
            </span>
          )
        )}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        {/* Name + time — only on first of group */}
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {reply.posterName}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatDistanceToNow(new Date(reply.date), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Quote — if replying to a message */}
        {reply.replyTo && (
          <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-2 mb-1 opacity-70">
            <p className="text-xs font-semibold text-gray-500">{reply.replyTo.senderName}</p>
            <p className="text-xs text-gray-500 truncate">{reply.replyTo.text}</p>
          </div>
        )}

        {/* Message body */}
        <p
          className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed break-words"
          dangerouslySetInnerHTML={{ __html: parseLinks(reply.body) }}
        />

        {/* Hover action row */}
        {showActions && (
          <div className="flex items-center gap-1 mt-1">
            <button onClick={() => onReply(reply)}
                    className="text-xs text-gray-400 hover:text-teal-500 transition-colors px-1">
              ↩ Reply
            </button>
            {isOwn && (
              <button onClick={() => onDelete(reply._id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Chat Input Bar

```jsx
<div className="border-t border-gray-200 dark:border-gray-800 p-4">

  {/* Reply quote preview */}
  {replyingTo && (
    <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-teal-500">
      <div className="flex-grow min-w-0">
        <p className="text-xs font-semibold text-teal-600">{replyingTo.posterName}</p>
        <p className="text-xs text-gray-500 truncate">{replyingTo.body}</p>
      </div>
      <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-sm">✕</button>
    </div>
  )}

  <div className="flex items-end gap-3">
    <textarea
      ref={inputRef}
      value={message}
      onChange={handleTyping}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }}
      onPaste={(e) => {
        const items = Array.from(e.clipboardData.items);
        const hasFile = items.some(i => i.kind === 'file');
        if (hasFile) {
          e.preventDefault();
          toast.error('Media uploads are not allowed. Share a link instead.');
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        toast.error('Drag & drop files are not allowed in Threads.');
      }}
      disabled={thread?.isLocked}
      placeholder={
        thread?.isLocked
          ? '🔒 This thread is locked'
          : `Message #${thread?.title || '...'} — Press Enter to send, Shift+Enter for new line`
      }
      rows={1}
      className="
        flex-grow resize-none
        bg-gray-100 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl px-4 py-2.5 text-sm
        text-gray-900 dark:text-white
        placeholder:text-gray-400
        focus:outline-none focus:border-teal-500
        disabled:cursor-not-allowed disabled:opacity-50
        max-h-32 overflow-y-auto
        transition-all
      "
      style={{ height: 'auto' }}
      onInput={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
      }}
    />
    <button
      onClick={handleSend}
      disabled={!message.trim() || thread?.isLocked || sending}
      className="
        w-10 h-10 flex-shrink-0
        bg-teal-600 hover:bg-teal-700
        disabled:bg-gray-300 dark:disabled:bg-gray-700
        text-white rounded-xl flex items-center justify-center
        transition-colors disabled:cursor-not-allowed
      "
    >
      <i className="ri-send-plane-fill text-sm" />
    </button>
  </div>
</div>
```

---

## Welcome Panel (no thread selected)

```jsx
<div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
  <div className="w-20 h-20 bg-teal-100 dark:bg-teal-950/40 rounded-3xl flex items-center justify-center mb-6">
    <span className="text-4xl">💬</span>
  </div>
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
      style={{ fontFamily: 'HKGrotesk, sans-serif' }}>
    Welcome to Community Threads
  </h2>
  <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm leading-relaxed mb-6">
    Pick a thread from the sidebar to join the conversation, or start a new one about an issue in your area.
  </p>

  {/* Quick rules — 3 pills */}
  <div className="flex flex-col gap-2 text-left w-full max-w-xs">
    {[
      { icon: '🔗', text: 'Share links, not files' },
      { icon: '🤝', text: 'Be respectful to neighbours' },
      { icon: '📍', text: 'Keep topics local and relevant' },
    ].map(r => (
      <div key={r.text} className="flex items-center gap-3 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <span>{r.icon}</span>
        <span className="text-sm text-gray-600 dark:text-gray-300">{r.text}</span>
      </div>
    ))}
  </div>

  <button
    onClick={() => setShowNewThread(true)}
    className="mt-6 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm"
  >
    + Start a Thread
  </button>
</div>
```

---

## Typing Indicator

```jsx
// State: Map<userEmail, userName>
const [typingUsers, setTypingUsers] = useState(new Map());

socket.on('user_typing', ({ userEmail, userName, isTyping }) => {
  setTypingUsers(prev => {
    const next = new Map(prev);
    if (isTyping) next.set(userEmail, userName);
    else next.delete(userEmail);
    return next;
  });
});

// Render at bottom of message list:
{typingUsers.size > 0 && (
  <div className="flex items-center gap-2 px-4 py-2">
    <div className="flex gap-0.5">
      {[0, 1, 2].map(i => (
        <div key={i}
             className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
             style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
    <span className="text-xs text-gray-400">
      {[...typingUsers.values()].join(', ')}
      {typingUsers.size === 1 ? ' is' : ' are'} typing...
    </span>
  </div>
)}
```

---

## Performance Checklist

```
[ ] Paginate replies: load last 50, load older on scroll-to-top
[ ] Group messages by sender (same person < 5 min apart)
[ ] Auto-resize textarea (onInput height calculation)
[ ] Scroll-to-bottom only when user is < 150px from bottom
[ ] Show "N new messages ▾" floating button when scrolled up
[ ] Socket reconnect: re-join room + invalidate query
[ ] Debounce typing event: emit after 400ms, clear on send
[ ] Never dangerouslySetInnerHTML without parseLinks() sanitization
[ ] Mobile: full-screen sidebar or chat, never both
[ ] Thread list: use scrollable overflow-y-auto, not window scroll
```

---

## Socket Events Reference (server + client)

| Event | Direction | Payload | When |
|---|---|---|---|
| `join_thread` | client → server | `threadId` | Thread selected |
| `leave_thread` | client → server | `threadId` | Thread changed / unmount |
| `typing` | client → server | `{ threadId, userEmail, userName, isTyping }` | On input change |
| `message_received` | server → client | `{ threadId, reply }` | Reply saved to DB |
| `user_typing` | server → client | `{ userEmail, userName, isTyping }` | Relayed typing event |
| `thread_updated` | server → client | `{ threadId, isPinned, isLocked }` | Admin pin/lock |
| `thread_deleted` | server → client | `{ threadId }` | Admin or author delete |
| `thread_created` | server → all | `{ thread }` | New thread created |

---

## Files to Touch

```
Server/index.js          — add socket event handlers for join/leave/typing
Server/routes/forum.js   — emit message_received + thread_created after DB writes
Server/routes/admin.js   — emit thread_updated + thread_deleted after admin actions

src/components/Forum/Forum.jsx          — full split-pane layout rebuild
src/components/Forum/ThreadDetails.jsx  — message bubbles, sockets, reply-to, scroll
src/components/Forum/NewThread.jsx      — modal version (no separate page navigation)
src/components/Admin/AdminForum.jsx     — keep as management table, not in-chat
```
