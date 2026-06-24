import React from'react';
import { Link } from'react-router';
import { motion } from'framer-motion';
import {
 PublicInfoHero,
 SectionIcon,
 SafeImage,
 PUBLIC_PAGE_IMAGES,
} from'./PublicInfoLayout';
import FieldMomentsCarousel from'./FieldMomentsCarousel';
import { Swiper, SwiperSlide } from'swiper/react';
import { Autoplay, EffectFade } from'swiper/modules';

import'swiper/css';
import'swiper/css/effect-fade';

const FEATURES = [
 { icon:'ri-map-pin-line', color:'bg-teal-50 text-teal-700', title:'Issue reporting', desc:'Geo-tagged reports with photos, status tracking, and resolver updates.'},
 { icon:'ri-calendar-event-line', color:'bg-emerald-50 text-emerald-700', title:'Cleanup drives', desc:'Organise and join neighbourhood cleanups with RSVP and volunteer counts.'},
 { icon:'ri-hand-heart-line', color:'bg-amber-50 text-amber-700', title:'Micro-funding', desc:'Support approved drives with transparent contribution goals.'},
 { icon:'ri-group-line', color:'bg-violet-50 text-violet-700', title:'Volunteer hub', desc:'Register skills, join programmes, and earn recognition on the leaderboard.'},
 { icon:'ri-chat-3-line', color:'bg-sky-50 text-sky-700', title:'Community forum', desc:'Discuss local priorities, share tips, and coordinate with neighbours.'},
 { icon:'ri-building-4-line', color:'bg-rose-50 text-rose-700', title:'NGO directory', desc:'Connect with partners who run feeding, shelter, and environmental programmes.'},
];

const PROGRAMS = [
 {
 year:'2019',
 title:'CivicNest foundation',
 desc:'Pilot launched in Dhaka with ward-level litter reporting and weekend park cleanups.',
 image: PUBLIC_PAGE_IMAGES.program1,
 },
 {
 year:'2021',
 title:'Neighbourhood drive network',
 desc:'Expanded to Chittagong and Khulna; 200+ volunteer-led drives documented on-platform.',
 image: PUBLIC_PAGE_IMAGES.program2,
 },
 {
 year:'2023',
 title:'Digital stewardship programme',
 desc:'Introduced moderation queue, NGO partnerships, and civic points for contributors.',
 image: PUBLIC_PAGE_IMAGES.program3,
 },
 {
 year:'2025',
 title:'Integrated civic platform',
 desc:'Unified issues, animals, lost & found, polls, and cleanup funding in one resident portal.',
 image: PUBLIC_PAGE_IMAGES.program4,
 },
];

const VISION = [
 {
 period:'2026–2027',
 icon:'ri-road-map-line',
 text:'City-wide moderation SLAs, multilingual guides, and open data exports for partner municipalities.',
 },
 {
 period:'2028–2030',
 icon:'ri-rocket-line',
 text:'Regional federation of “Nests”, predictive hotspot mapping, and youth stewardship curricula in schools.',
 },
];

export default function GoalsVision() {
 return (
 <div className="min-h-screen w-full bg-[#f8fafc] font-body pb-24">
 <PublicInfoHero
 badge="About CivicNest"badgeIcon="ri-plant-line"title={
 <>
 Building a cleaner, <br className="md:hidden"/><span className="text-emerald-400">greener tomorrow</span>
 </>
 }
 subtitle="Discover the story behind CivicNest, our core community programmes, and our bold vision for the future of urban stewardship."/>

 <div className="mx-auto max-w-6xl space-y-12 px-6 pt-10">
 <motion.section
 id="story"initial={{ opacity: 0, y: 16 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="scroll-mt-24 grid items-center gap-5 rounded-[1.75rem] border border-teal-100/80 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-5 shadow-sm md:grid-cols-2 md:p-10">
 <div>
 <div className="mb-4 flex items-center gap-3">
 <SectionIcon icon="ri-seedling-line"tone="teal"/>
 <h2 className="text-[13px] font-bold uppercase tracking-widest text-teal-700">Our foundation</h2>
 </div>
 <p className="mb-4 text-2xl tracking-tight font-bold leading-snug text-slate-900 dark:text-white">
 Built by residents who believed cleaner streets start with shared accountability.
 </p>
 <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
 CivicNest began as a volunteer project to replace scattered social-media posts with one trusted place to report problems, celebrate fixes, and organise action. Today we partner with NGOs, student groups, and local administrators—without replacing official city services.
 </p>
 <Link
 to="/community-guidelines"className="inline-flex items-center gap-2 text-[13px] font-bold text-teal-700 hover:text-teal-900">
 <i className="ri-file-list-3-line"/>
 Read CivicNest guidelines
 <i className="ri-arrow-right-line"/>
 </Link>
 </div>
 <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-100 bg-teal-50 shadow-md relative">
 <Swiper
 modules={[Autoplay, EffectFade]}
 effect="fade"loop={true}
 autoplay={{ delay: 2000, disableOnInteraction: false }}
 className="w-full h-full absolute inset-0">
 {PUBLIC_PAGE_IMAGES.gallery.map((imgSrc, idx) => (
 <SwiperSlide key={idx} className="w-full h-full">
 <SafeImage
 src={imgSrc}
 alt={`Community volunteers at a neighbourhood cleanup - slide ${idx + 1}`}
 className="h-full w-full object-cover"/>
 </SwiperSlide>
 ))}
 </Swiper>
 </div>
 </motion.section>

 <section>
 <div className="mb-8 flex flex-col items-center text-center">
 <SectionIcon icon="ri-apps-line"tone="teal"/>
 <h2 className="mt-3 text-2xl tracking-tight font-bold text-slate-900 dark:text-white tracking-tight">What we offer</h2>
 <p className="mx-auto mt-2 max-w-xl text-[13px] text-slate-500 dark:text-slate-300">
 Tools designed for everyday civic participation—not just one-off campaigns.
 </p>
 </div>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {FEATURES.map((f) => (
 <div
 key={f.title}
 className="rounded-lg border border-slate-100 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] p-4 transition-colors hover:border-teal-200 hover:shadow-sm">
 <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}>
 <i className={`${f.icon} text-[13px] tracking-tight`} />
 </span>
 <h3 className="mb-1 font-bold text-slate-900 dark:text-white tracking-tight">{f.title}</h3>
 <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{f.desc}</p>
 </div>
 ))}
 </div>
 </section>

 <section>
 <div className="mb-10 text-center">
 <h2 className="text-2xl tracking-tight font-bold text-slate-900 dark:text-white tracking-tight">Programmes over the years</h2>
 <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-300">Selected milestones from our community work.</p>
 </div>
 <div className="space-y-8">
 {PROGRAMS.map((prog, i) => (
 <motion.article
 key={prog.year}
 initial={{ opacity: 0, y: 12 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className={`flex flex-col items-center gap-4 md:flex-row ${i % 2 === 1 ?'md:flex-row-reverse':''}`}
 >
 <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-100 dark:bg-[#1e3040] dark:bg-[#1e3040] shadow-sm md:w-1/2">
 <SafeImage src={prog.image} alt={prog.title} className="h-full w-full object-cover"/>
 </div>
 <div className="md:w-1/2">
 <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
 <i className="ri-calendar-line"/>
 {prog.year}
 </span>
 <h3 className="mt-2 mb-2 text-[13px] tracking-tight font-bold text-slate-900 dark:text-white tracking-tight">{prog.title}</h3>
 <p className="leading-relaxed text-slate-600 dark:text-slate-300">{prog.desc}</p>
 </div>
 </motion.article>
 ))}
 </div>
 </section>

 <section className="relative overflow-hidden rounded-[1.75rem] bg-[#0f172a] p-5 md:p-12 shadow-2xl border border-slate-800">
 {/* Abstract Background Elements */}
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
 <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-500/40 blur-[90px]"/>
 <div className="absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-teal-400/40 blur-[90px]"/>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/30 blur-[100px]"/>
 </div>
 
 <div className="relative z-10">
 <div className="mb-10 flex flex-col items-center justify-center text-center">
 <span className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2.5 text-[13px] font-bold tracking-[0.1em] uppercase shadow-xl text-emerald-300">
 <i className="ri-eye-line text-[13px]"/>
 Vision for the years ahead
 </span>
 </div>
 <div className="grid gap-5 md:grid-cols-2">
 {VISION.map((v) => (
 <div
 key={v.period}
 className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-white/20">
 <span className="mb-4 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-emerald-400">
 <i className={`${v.icon} text-[13px] tracking-tight`} />
 {v.period}
 </span>
 <p className="leading-relaxed text-slate-300 font-medium text-[13px]">{v.text}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section className="pb-4">
 <h2 className="mb-6 flex items-center justify-center gap-2 text-[13px] font-bold text-slate-900 dark:text-white md:text-[13px] tracking-tight">
 <i className="ri-gallery-line text-teal-600"/>
 Moments from the field
 </h2>
 <FieldMomentsCarousel />
 </section>
 </div>
 </div>
 );
}
