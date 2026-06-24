import React from'react';
import { Swiper, SwiperSlide } from'swiper/react';
import { Autoplay, EffectFade } from'swiper/modules';
import'swiper/css';
import'swiper/css/effect-fade';
import { Fade, Slide } from'react-awesome-reveal';
import { Typewriter } from'react-simple-typewriter';

const Banner = () => {
 const images = ["https://www.watsonsreach.com.au/app/uploads/2026/02/About-Banner-1-scaled.png","/banner2.jpg","/banner3.jpg","/banner4.png"];

 return (
 <section className="relative w-full overflow-hidden min-h-[450px] flex items-center justify-center">
 {/* Background Image Slider */}
 <div className="absolute inset-0 z-0">
 <Swiper
 modules={[Autoplay, EffectFade]}
 effect="fade"autoplay={{ delay: 4000, disableOnInteraction: false }}
 loop={true}
 className="w-full h-full">
 {images.map((img, index) => (
 <SwiperSlide key={index}>
 <img alt={`Banner ${index + 1}`} className="w-full h-full object-cover"src={img} />
 </SwiperSlide>
 ))}
 </Swiper>
 {/* Overlay to ensure text readability */}
 <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10 pointer-events-none"></div>
 <div className="absolute inset-0 bg-gradient-to-t from-[#0f766e]/80 to-transparent z-10 pointer-events-none"></div>
 </div>

 <div className="relative z-20 w-full max-w-5xl mx-auto px-6 py-12 lg:py-12 flex flex-col items-start justify-end h-full text-white">
 <div className="w-full">
 <Fade direction="down"duration={800}>
 <p className="font-label text-[13px] uppercase tracking-widest font-bold mb-4 text-[#9FE2BF]">The Movement</p>
 </Fade>
 
 <Slide direction="up"duration={800} delay={200}>
 <h2 className="font-display text-4xl tracking-tight md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-white uppercase min-h-[80px]"style={{ letterSpacing:"-0.04em"}}>
 <Typewriter
 words={['Join The Nest','Make An Impact','Unite The City']}
 loop={0}
 cursor
 cursorStyle='_'typeSpeed={80}
 deleteSpeed={50}
 delaySpeed={2000}
 />
 </h2>
 </Slide>

 <Fade delay={600} duration={1000}>
 <div className="flex flex-wrap items-center gap-4 mb-8">
 <span className="font-bold text-[13px] text-white/80">I'm interested in:</span>
 <button className="px-5 py-2 rounded-full border border-white/40 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 transition-colors backdrop-blur-sm text-[13px] font-bold shadow-sm">Cleanups</button>
 <button className="px-5 py-2 rounded-full border border-white/40 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 transition-colors backdrop-blur-sm text-[13px] font-bold shadow-sm">Funding</button>
 <button className="px-5 py-2 rounded-full border border-white/40 hover:bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d]/20 transition-colors backdrop-blur-sm text-[13px] font-bold shadow-sm">Community Events</button>
 </div>
 </Fade>

 <Fade delay={800} duration={1000}>
 <form className="w-full relative group max-w-2xl">
 <input className="w-full bg-transparent border-b-2 border-white/40 focus:border-white text-2xl tracking-tight md:text-4xl tracking-tight font-display font-bold py-4 px-0 placeholder-white/50 focus:outline-none focus:ring-0 transition-colors uppercase tracking-tight"placeholder="ENTER YOUR EMAIL"required type="email"/>
 <button className="absolute right-0 bottom-4 w-12 h-12 bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] text-[#0f766e] rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-300 shadow-lg"type="submit">
 <i className="ri-arrow-right-line text-[13px] tracking-tight font-bold"></i>
 </button>
 </form>
 </Fade>
 </div>
 </div>
 </section>
 );
};

export default Banner;
