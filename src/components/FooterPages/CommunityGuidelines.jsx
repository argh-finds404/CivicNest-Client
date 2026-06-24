import React, { useState, useEffect } from'react';
import { Link } from'react-router';
import { motion } from'framer-motion';
import { PublicInfoHero, SectionIcon, SectionNav } from'./PublicInfoLayout';

const SECTIONS = [
 {
 id:'purpose',
 shortLabel:'Purpose',
 icon:'ri-book-open-line',
 tone:'teal',
 title:'Purpose of these guidelines',
 body:'CivicNest is a civic platform for reporting issues, organising cleanups, and collaborating respectfully. These rules help keep content accurate, safe, and useful for every resident.',
 },
 {
 id:'posting',
 shortLabel:'Posting',
 icon:'ri-edit-line',
 tone:'teal',
 title:'Posting standards',
 items: ['Use clear titles and accurate locations. Do not mislabel areas or duplicate the same issue without reason.','Upload original photos where possible. Stock images or unrelated media may be removed.','Describe what you observed factually. Avoid naming private individuals in public posts unless required for safety.','Cleanup events must include a real date, meeting point, and organiser contact reachable through the platform.','Lost & found and animal posts must follow category-specific fields; incomplete listings may be returned for revision.',
 ],
 },
 {
 id:'rejection',
 shortLabel:'Rejection',
 icon:'ri-close-circle-line',
 tone:'amber',
 title:'When content may be rejected',
 items: ['Spam, scams, or repeated low-effort submissions.','Hate speech, harassment, threats, or discriminatory language.','False or misleading reports intended to harm a person, business, or neighbourhood.','Graphic, violent, or sexually explicit material unrelated to civic safety.','Commercial advertising without community value or admin approval.','Personal data published without consent (phone numbers, home addresses, ID documents).','Events that encourage unsafe or illegal activity.',
 ],
 },
 {
 id:'moderation',
 shortLabel:'Moderation',
 icon:'ri-shield-check-line',
 tone:'slate',
 title:'Moderation process',
 body:'Volunteer moderators and administrators review flagged and queued items. You will receive an in-app notice when a post is approved, needs edits, or is rejected—with a short reason when applicable. Repeated violations may limit posting privileges.',
 },
 {
 id:'conduct',
 shortLabel:'Conduct',
 icon:'ri-hand-heart-line',
 tone:'teal',
 title:'Community conduct',
 items: ['Treat neighbours, organisers, and moderators with respect—even when you disagree.','Debate ideas, not people. No bullying in comments, forums, or direct outreach.','RSVP responsibly: update your status if you cannot attend a drive you marked as “going”.','Do not coordinate retaliation or “pile-on” campaigns against individuals.','Report concerns through official channels instead of public call-outs when safety is involved.',
 ],
 },
 {
 id:'safety',
 shortLabel:'Safety',
 icon:'ri-lock-line',
 tone:'rose',
 title:'Safety & privacy',
 items: ['Meet in public places for handovers and community events when possible.','Never share passwords or payment details in posts or chats.','Use the platform’s reporting tools for urgent hazards; contact local emergency services when life is at risk.',
 ],
 },
];

export default function CommunityGuidelines() {
 const [activeSection, setActiveSection] = useState('purpose');

 useEffect(() => {
 const ids = SECTIONS.map((s) => s.id);
 const observer = new IntersectionObserver(
 (entries) => {
 const visible = entries
 .filter((e) => e.isIntersecting)
 .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
 if (visible?.target?.id) setActiveSection(visible.target.id);
 },
 { rootMargin:'-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
 );
 ids.forEach((id) => {
 const el = document.getElementById(id);
 if (el) observer.observe(el);
 });
 return () => observer.disconnect();
 }, []);

 return (
 <div className="min-h-screen w-full bg-[#f8fafc] font-body pb-20">
 <PublicInfoHero
 badge="Public resource"badgeIcon="ri-file-list-3-line"title={
 <>
 Civic<span className="text-emerald-400">Nest</span> guidelines
 </>
 }
 subtitle="How to post responsibly, what moderators expect, and how we keep the community safe for everyone."/>

 <div className="mx-auto max-w-3xl px-6 pt-8">
 <SectionNav
 sections={SECTIONS}
 activeId={activeSection}
 onSelect={setActiveSection}
 />

 <div className="space-y-5">
 {SECTIONS.map((section, i) => (
 <motion.section
 key={section.id}
 id={section.id}
 initial={{ opacity: 0, y: 12 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:'-40px'}}
 transition={{ delay: i * 0.03 }}
 className="scroll-mt-28 rounded-lg border border-slate-100 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 shadow-sm md:p-5">
 <div className="mb-4 flex items-start gap-4">
 <SectionIcon icon={section.icon} tone={section.tone} />
 <h2 className="pt-2 text-[13px] tracking-tight font-bold text-slate-900 dark:text-white tracking-tight">{section.title}</h2>
 </div>
 {section.body && (
 <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-0 md:pl-[3.75rem]">{section.body}</p>
 )}
 {section.items && (
 <ul className="mt-1 space-y-3 md:pl-[3.75rem]">
 {section.items.map((item) => (
 <li key={item} className="flex gap-3 text-slate-600 dark:text-slate-300 leading-relaxed">
 <i className="ri-checkbox-circle-line shrink-0 text-teal-600 text-[13px] mt-0.5"/>
 <span>{item}</span>
 </li>
 ))}
 </ul>
 )}
 </motion.section>
 ))}
 </div>

 <div className="mt-10 rounded-lg border border-teal-100 bg-teal-50/60 p-4 text-center">
 <i className="ri-question-line mb-2 block text-2xl tracking-tight text-teal-700"/>
 <p className="text-[13px] text-slate-600 dark:text-slate-300">
 Questions?{' '}
 <Link to="/goals-and-vision"className="font-semibold text-teal-700 hover:underline">
 Read our goals &amp; vision
 </Link>{' '}
 or contact your city moderator through the app.
 </p>
 </div>
 </div>
 </div>
 );
}
