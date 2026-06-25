import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../common/SEO';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Flatten all content into searchable items at the top of the file
const ALL_MANUAL_ITEMS = [
  // Guests Tab
  {
    tab: 'Guests',
    title: 'Browse without an account',
    anchor: 'guest-browse',
    content: `What you can do without an account:
✓ Browse all approved cleanliness issues on the interactive map and list view.
✓ View community announcements and critical safety warnings on the Noticeboard.
✓ See the Leaderboard to check who's helping most and see active neighborhood cleanups.
✓ Browse upcoming community cleanup events and volunteer opportunities.
✓ View the Before & After Gallery showcasing successful local cleanup transformations.`
  },
  {
    tab: 'Guests',
    title: 'Actions requiring registration',
    anchor: 'guest-account',
    content: `What requires an account to interact:
✗ Reporting new civic issues, animal care needs, or lost & found listings.
✗ Upvoting issues, commenting on posts, or verifying resolved issues.
✗ Joining volunteer cleanup drives or RSVPing to stray feeding events.
✗ Accessing the CivicBot AI assistant for smart guidance.`
  },
  {
    tab: 'Guests',
    title: 'How to register a new account',
    anchor: 'guest-register',
    content: `To join our civic nest:
1. Click the "Log in" or "Register" button in the top right of the navigation bar.
2. Enter your name, email address, and select a strong password.
3. Verify password rules: must contain uppercase, lowercase, and be at least 6 characters long.
4. Note: You start as a Guest role — you will need to apply for Residency Verification / Membership to unlock posting new reports.`
  },

  // Members Tab
  {
    tab: 'Members',
    title: 'The Credit System (Read This First)',
    anchor: 'credits',
    content: `Credits protect the community feed and prevent spam:
• You receive 3 issue credits per 72 hours (not per calendar day).
• Each credit unlocks exactly 72 hours after the post that consumed it.
• Rejected posts do NOT consume your credits (credits are refunded). Pending posts DO hold a credit.
• Registered Volunteers receive 5 credits. Users with 500+ contribution points receive a +1 bonus credit.`
  },
  {
    tab: 'Members',
    title: 'How to Report a Cleanliness Issue',
    anchor: 'report-issue',
    content: `Reporting a new cleanup task step-by-step:
1. Click "Report Issue" from the navbar or Homepage quick action cards.
2. Write a clear title and detailed description (our AI assistant will analyze and suggest improvements).
3. Select the correct category (trash, street light, pothole, etc. - AI auto-detects this from your text).
4. Drop a precise pin on the interactive map for the exact location coordinates.
5. Upload a clear, original photo of the issue (required for admin approval).
6. Submit - your issue goes directly to the admin review queue.
7. You'll receive a notification immediately once your report is approved and goes live.`
  },
  {
    tab: 'Members',
    title: 'Why your post isn\'t immediately visible',
    anchor: 'review-time',
    content: `All posts go through admin review before appearing publicly on the map or feed.
This prevents spam, fake reports, and duplicate issues.
The typical review time is a few hours, depending on moderator activity.`
  },
  {
    tab: 'Members',
    title: 'How the Resolution System Works',
    anchor: 'resolution',
    content: `Resolving and verifying issues:
1. An admin or an active community member "claims" your reported issue to go fix it.
2. They upload before/after proof photos once the site is clean.
3. THREE community members must click "Verify Fix" to confirm the resolution.
4. Once all 3 verifications are submitted, the status shifts to "Solved", points are awarded, and escrow is released.
5. You earn +25 contribution points when your reported issue is successfully resolved.`
  },
  {
    tab: 'Members',
    title: 'Lost & Found Guidelines',
    anchor: 'lost-found',
    content: `Reuniting items in public spaces:
• Lost Item: You post details of a lost item. Finders click "I Found This" and describe where/when they retrieved it.
• Found Item: You post a found item. Owners click "I Think This Is Mine" and provide unique identifying proof.
• Note: Only the ORIGINAL POSTER of the lost/found item can mark the listing as Reunited.`
  },

  // Volunteers Tab
  {
    tab: 'Volunteers',
    title: 'Registering as a Volunteer',
    anchor: 'volunteer-register',
    content: `To step up as a community volunteer:
1. Navigate to the Volunteer Hub in the side menu.
2. Click "Join as Volunteer" to register.
3. Select your specialized skills, availability times, and target neighborhood/area.
4. Once approved, you gain access to the Volunteer Dashboard and automatically receive a 2x points multiplier on all civic actions!`
  },
  {
    tab: 'Volunteers',
    title: 'The 2x Points Multiplier',
    anchor: 'volunteer-multiplier',
    content: `As a volunteer, your engagement is rewarded double:
• Reporting civic issues
• Verifying reported fixes
• RSVPing & attending cleanup events
• Making financial contributions
• Adding eyewitness/witness reports`
  },
  {
    tab: 'Volunteers',
    title: 'Event Check-in Code & GPS Verification',
    anchor: 'event-checkin',
    content: `Checking in at volunteer events:
1. You must RSVP to the cleanup event first (click "Going").
2. At the event location, ask the event organizer for the 6-digit check-in code.
3. Enter the code in your Volunteer Dashboard → Active Events panel.
4. GPS verification is requested to confirm your presence (optional but awards extra bonus points).
5. Checking in awards 30 points to standard members and 60 points to registered volunteers.`
  },
  {
    tab: 'Volunteers',
    title: 'Stray Animal Rescue Verification',
    anchor: 'animal-rescue',
    content: `Managing stray animal care reports:
1. A stray animal in distress is reported. Community volunteers offer assistance.
2. When the rescue is complete, upload a proof photo and note directly inside your report.
3. An admin reviews the uploaded proof and approves the rescue.
4. Once approved: you earn 50 points, and helping volunteers earn 30 points each.
5. The reporter selects which volunteers actually showed up on-site - honest attestation only.`
  },
  {
    tab: 'Volunteers',
    title: 'Stray Animal Feeding Drives',
    anchor: 'feeding-drives',
    content: `Fostering stray care through feeding:
• Create a feeding drive by navigating to Volunteer Hub → Organize a Drive.
• Set the target date, food types, specific location, and available volunteer slots.
• Attendees join the drive, RSVP, and check in on-site.
• Upload post-drive photos to complete the record and reward participants.`
  },

  // Common Mistakes Tab
  {
    tab: 'Common Mistakes',
    title: 'Using all 3 credits on the same issue',
    anchor: 'mistake-credits',
    content: `If your first report isn't approved immediately, do NOT submit the same issue twice more.
Wait for admin review feedback. Re-submitting uses up your credits and delays actual resolution.`
  },
  {
    tab: 'Common Mistakes',
    title: 'Vague location descriptions',
    content: `Providing descriptions like "Near the local market" fails quality checks.
Always use the map pin to mark exact coordinates, and add clear landmarks in the address field.
Correct: "Opposite Shohid Minar, Road 7, Mirpur 10".`,
    anchor: 'mistake-location'
  },
  {
    tab: 'Common Mistakes',
    title: 'Claiming a Lost & Found item without proof',
    anchor: 'mistake-claim',
    content: `Admins can permanently dismiss fake or unverified claims.
If dismissed, you cannot re-claim that item.
Prepare your proof (photos, receipt, unique identifiers) before clicking "I Think This Is Mine".`
  },
  {
    tab: 'Common Mistakes',
    title: 'Posting the same issue multiple times',
    anchor: 'mistake-duplicate',
    content: `Duplicate reports of the same garbage site or issue are auto-detected and merged.
You do NOT earn extra points for duplicates, and you waste a valuable posting credit.`
  },
  {
    tab: 'Common Mistakes',
    title: 'Sharing the event check-in code before/outside the event',
    anchor: 'mistake-checkin',
    content: `The 6-digit event check-in code is only valid during the actual event window.
Sharing the code so others can fake attendance is heavily monitored and leads to permanent bans.`
  },
  {
    tab: 'Common Mistakes',
    title: 'Marking an animal as rescued without proof',
    anchor: 'mistake-rescue',
    content: `Stray animal rescue points require an uploaded photo and admin verification.
Faking rescues to farm points will be flagged in the system audit log and results in account suspension.`
  },
  {
    tab: 'Common Mistakes',
    title: 'Ignoring the Streak reset rules',
    anchor: 'mistake-streak',
    content: `Missing one day of community participation resets your contribution streak.
Qualifying daily actions include: casting a poll vote, upvoting an issue, writing a comment, or verifying a fix.
You do NOT need to post a new issue every day to maintain a streak.`
  }
];

export default function UserManual() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Guests');
  const [openSection, setOpenSection] = useState(null);

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(handler);
  }, [search]);

  // Filter items based on search query
  const searchResults = ALL_MANUAL_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.content.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Custom Teal Palette
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 118, 110); // #0f766e
    doc.text('CivicNest — Quick Reference Guide', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // #475569
    doc.text(`Generated ${new Date().toLocaleDateString()} | Fostering Clean Communal Living`, 14, 28);

    // Credit system table
    autoTable(doc, {
      startY: 35,
      head: [['User Role', 'Issue Credits', 'Points Multiplier', 'Core Actions Available']],
      body: [
        ['Guest', '1 Credit (limited)', '1x Multiplier', 'Browse map, view notices, see leaderboards'],
        ['Member', '3 Credits per 72h', '1x Multiplier', 'Report cleanliness issues, lost & found, stray care'],
        ['Volunteer', '5 Credits per 72h', '2x Multiplier', 'Organize cleanups/feeding drives, earn double points'],
      ],
      headStyles: { fillColor: [15, 118, 110] }, // Teal color
      theme: 'striped',
      styles: { fontSize: 9, font: 'helvetica' }
    });

    // Key Rules blocks
    const sections = [
      { title: 'Credit Reset Policy', body: 'Each credit returns exactly 72 hours after the post that consumed it. Rejected posts refund credits; pending posts hold them. Not a daily reset.' },
      { title: 'Resolution & Proof', body: '3 community member verifications are required. Resolvers earn 50 points; original reporter earns 25 points. Photos are audited.' },
      { title: 'Streaks Preservation', body: 'Streak is reset if a day goes by without any action. To maintain your streak, perform at least one action: upvote, comment, or verify.' },
      { title: 'Prohibited Actions (Bans)', body: 'Fake check-ins, duplicate posts, and claiming lost & found items without proof are logged and lead to account bans.' },
    ];

    let y = doc.lastAutoTable.finalY + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 118, 110);
    doc.text('Key Platform Guidelines', 14, y);
    y += 8;

    sections.forEach((s) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 118, 110);
      doc.text(s.title, 14, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      
      // Text wrapping
      const splitText = doc.splitTextToSize(s.body, 180);
      doc.text(splitText, 14, y + 4.5);
      y += 6 + (splitText.length * 4.5);
    });

    doc.save('civicnest-quick-guide.pdf');
  };

  const handleAskCivicBot = (prompt) => {
    // Dispatch a custom event that CivicBot.jsx or FloatingCivicBot.jsx will listen for
    window.dispatchEvent(new CustomEvent('civicbot:open', { detail: { prompt } }));
  };

  const tabs = ['Guests', 'Members', 'Volunteers', 'Common Mistakes'];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050a08] font-body pb-20">
      <SEO 
        title="User Manual & Help Center" 
        description="Learn how to navigate CivicNest effectively. Read guidelines for guests, member credits, volunteer multipliers, and how to avoid duplicate posts." 
      />

      {/* Hero Section (No Glassmorphism) */}
      <div className="bg-gradient-to-br from-teal-800 to-teal-700 pt-32 pb-16 px-6 md:px-12 text-center text-white relative">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 uppercase">
            CivicNest Help Center
          </h1>
          <p className="text-slate-100 max-w-xl mx-auto text-sm md:text-base font-medium mb-8">
            Learn the rules of the nest, master the credit system, and understand how to earn contribution points.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <i className="ri-search-line text-lg" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the manual... e.g. 'credits', 'verify', 'streak'"
              className="w-full pl-12 pr-6 py-3.5 rounded-full bg-white dark:bg-[#0b1215] text-slate-800 dark:text-slate-200 border-none shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold placeholder-slate-400 text-sm md:text-base"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="ri-close-circle-fill text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="sticky top-[4rem] z-20 bg-white dark:bg-[#0a120e] border-b border-slate-200 dark:border-[#14241d]/60 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none px-4">
          <div className="flex gap-1 md:gap-2 py-3 mx-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab && !debouncedSearch;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearch(''); // Clear search when user switches tab explicitly
                  }}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all relative shrink-0 ${
                    isActive
                      ? 'text-[#0f766e] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20'
                      : 'text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  {tab}
                  {isActive && (
                    <motion.div
                      layoutId="activeManualTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f766e] dark:bg-teal-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {debouncedSearch ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Search Results ({searchResults.length})
              </h2>
              <button 
                onClick={() => setSearch('')}
                className="text-xs font-bold text-[#0f766e] dark:text-teal-400 hover:underline"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((item, index) => (
                  <ManualSection
                    key={item.anchor}
                    title={item.title}
                    isOpen={openSection === item.anchor || searchResults.length === 1}
                    onToggle={() => setOpenSection(openSection === item.anchor ? null : item.anchor)}
                    badge={item.tab}
                  >
                    <div className="whitespace-pre-line text-slate-700 dark:text-slate-350 text-sm md:text-base leading-relaxed pl-1 md:pl-2">
                      {item.content}
                    </div>
                  </ManualSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-[#0a120e] rounded-2xl border border-slate-200 dark:border-[#14241d] p-6 shadow-sm">
                <i className="ri-find-replace-line text-4xl text-slate-450 dark:text-slate-550 mb-3 block" />
                <p className="text-slate-750 dark:text-slate-350 font-bold mb-1">No matching manual items found</p>
                <p className="text-xs text-slate-450 dark:text-slate-550 max-w-md mx-auto">
                  Try searching for words like "credit", "streak", "verify", "code", or "mistake".
                </p>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-[#14241d]/30 pb-3">
                <h2 className="text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {activeTab} Guide
                </h2>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-full">
                  {ALL_MANUAL_ITEMS.filter(i => i.tab === activeTab).length} Topics
                </span>
              </div>

              {ALL_MANUAL_ITEMS.filter(i => i.tab === activeTab).map((item) => (
                <ManualSection
                  key={item.anchor}
                  title={item.title}
                  isOpen={openSection === item.anchor}
                  onToggle={() => setOpenSection(openSection === item.anchor ? null : item.anchor)}
                >
                  <div className="whitespace-pre-line text-slate-750 dark:text-slate-300 text-sm md:text-[14.5px] leading-relaxed pl-1">
                    {item.content}
                  </div>
                </ManualSection>
              ))}

              {/* Contextual Ask CivicBot Callout */}
              <div className="pt-6">
                <AskCivicBot 
                  prompt={
                    activeTab === 'Guests' ? 'What can I do on CivicNest as a guest?' :
                    activeTab === 'Members' ? 'How do I write a good issue report?' :
                    activeTab === 'Volunteers' ? 'How do volunteer points work?' :
                    'Tell me about the member credit system.'
                  } 
                  onClick={handleAskCivicBot}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Cheat Sheet PDF Button */}
        <div className="mt-16 text-center border-t border-slate-200 dark:border-[#14241d]/60 pt-10">
          <h3 className="text-slate-850 dark:text-slate-250 font-bold mb-2 text-base">
            Need a Quick Reference Handbook?
          </h3>
          <p className="text-slate-500 dark:text-slate-450 text-xs md:text-sm max-w-md mx-auto mb-6">
            Generate and download a clean cheat sheet containing all essential rules, limits, multipliers, and guidelines.
          </p>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#0f766e] hover:bg-[#0c5c56] dark:bg-teal-650 dark:hover:bg-teal-700 text-white rounded-xl text-sm font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <i className="ri-file-pdf-2-line text-lg" />
            📄 Download Cheat Sheet (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Manual Section Accordion with teal left-border accent
function ManualSection({ title, children, isOpen, onToggle, badge }) {
  return (
    <div className="bg-white dark:bg-[#0a120e] border border-slate-200 dark:border-[#14241d] border-l-4 border-l-[#0f766e] dark:border-l-teal-500 rounded-r-2xl rounded-l-md overflow-hidden shadow-sm transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors focus:outline-none"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm md:text-base leading-snug">
            {title}
          </span>
          {badge && (
            <span className="inline-block w-fit text-[10px] uppercase font-bold tracking-widest bg-teal-50 dark:bg-teal-950/30 text-[#0f766e] dark:text-teal-400 px-2 py-0.5 rounded border border-teal-200/40">
              {badge}
            </span>
          )}
        </div>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          transition={{ duration: 0.2 }}
          className="text-slate-400 dark:text-slate-550 shrink-0 ml-4 flex items-center justify-center"
        >
          <i className="ri-arrow-down-s-line text-xl leading-none" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-slate-650 dark:text-slate-300 border-t border-slate-100 dark:border-[#14241d]/50 bg-slate-50/20 dark:bg-slate-950/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component: CivicBot Quick Help Button
function AskCivicBot({ prompt, onClick }) {
  return (
    <div className="bg-teal-50/30 dark:bg-[#071410] border border-teal-200/50 dark:border-teal-900/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-[#0f766e] dark:text-teal-400 shrink-0">
          <i className="ri-robot-line text-lg" />
        </span>
        <div>
          <h4 className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-slate-200">
            Ask CivicBot AI Assistant
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Get instant replies about this topic from our AI agent.
          </p>
        </div>
      </div>
      <button
        onClick={() => onClick(prompt)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 border border-teal-250 dark:border-teal-850 text-teal-800 dark:text-teal-400 rounded-xl text-xs md:text-sm font-extrabold transition-colors cursor-pointer"
      >
        <i className="ri-sparkling-line animate-pulse" />
        <span>Ask: "{prompt}"</span>
      </button>
    </div>
  );
}
