import React, { useRef, useEffect } from'react';
import { Swiper, SwiperSlide } from'swiper/react';
import { EffectCoverflow, Pagination } from'swiper/modules';
import { SafeImage } from'./PublicInfoLayout';

import'swiper/css';
import'swiper/css/effect-coverflow';
import'swiper/css/pagination';
import'./FieldMomentsCarousel.css';

const AUTO_DELAY_MS = 2000;

const SLIDES = [
 { src:'https://images.unsplash.com/photo-1743950674501-1faf707eacaa?q=80&w=1112&auto=format&fit=crop', caption:'Weekend park restoration'},
 { src:'https://images.unsplash.com/photo-1622037022630-9fd9c076e565?w=600&auto=format&fit=crop&q=60', caption:'Community togetherness'},
 { src:'https://plus.unsplash.com/premium_photo-1723568500817-d4f4fbb4ca81?q=80&w=1125&auto=format&fit=crop', caption:'Neighborhood volunteering'},
];

export default function FieldMomentsCarousel() {
 const swiperRef = useRef(null);

 useEffect(() => {
 const timer = setInterval(() => {
 if (swiperRef.current && !swiperRef.current.destroyed) {
 swiperRef.current.slideNext();
 }
 }, AUTO_DELAY_MS);

 return () => clearInterval(timer);
 }, []);

 return (
 <div
 className="field-moments-carousel relative mx-auto max-w-4xl px-2">
 <button
 type="button"className="field-moments-nav field-moments-nav--prev"aria-label="Previous slide"onClick={() => swiperRef.current?.slidePrev()}
 >
 <i className="ri-arrow-left-line"aria-hidden="true"/>
 </button>

 <button
 type="button"className="field-moments-nav field-moments-nav--next"aria-label="Next slide"onClick={() => swiperRef.current?.slideNext()}
 >
 <i className="ri-arrow-right-line"aria-hidden="true"/>
 </button>

 <Swiper
 modules={[EffectCoverflow, Pagination]}
 effect="coverflow"grabCursor
 centeredSlides
 loop
 loopAdditionalSlides={SLIDES.length}
 watchSlidesProgress
 slidesPerView="auto"speed={700}
 coverflowEffect={{
 rotate: 0,
 stretch: 0,
 depth: 140,
 modifier: 2.4,
 slideShadows: false,
 }}
 pagination={{ clickable: true, dynamicBullets: true }}
 className="field-moments-swiper"onSwiper={(swiper) => { swiperRef.current = swiper; }}
 >
 {SLIDES.map((slide, i) => (
 <SwiperSlide key={i} className="field-moments-slide">
 <figure className="field-moments-card">
 <SafeImage
 src={slide.src}
 alt={slide.caption}
 className="field-moments-img"/>
 <figcaption className="field-moments-caption">
 <i className="ri-camera-line text-teal-600"/>
 {slide.caption}
 </figcaption>
 </figure>
 </SwiperSlide>
 ))}
 </Swiper>
 </div>
 );
}
