"use client";

import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VenueCard from "./VenueCard";

import "swiper/css";
import "swiper/css/navigation";

export default function VenueCarousel({ onReserve }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [prevClicked, setPrevClicked] = useState(false);
  const [nextClicked, setNextClicked] = useState(false);

  useEffect(() => {
    if (swiperInstance && prevRef.current && nextRef.current) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;
      swiperInstance.navigation.destroy();
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance]);

  const handlePrevClick = () => {
    setPrevClicked(true);
    setTimeout(() => setPrevClicked(false), 300);
    if (swiperInstance) {
      swiperInstance.slidePrev();
    }
  };

  const handleNextClick = () => {
    setNextClicked(true);
    setTimeout(() => setNextClicked(false), 300);
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  return (
    <div className="w-full max-sm:px-7">
      {/* Navigation Buttons */}
      <div className="flex justify-start md:justify-end items-center mb-5 px-2 gap-3">
        <button
          ref={prevRef}
          onClick={handlePrevClick}
          className="group relative px-10 py-2 rounded-full border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
          <ChevronLeft 
            className={`w-6 h-6 text-white relative z-10 transition-transform duration-300 ${
              prevClicked ? 'scale-75 -translate-x-1' : 'group-hover:-translate-x-0.5'
            }`} 
          />
        </button>
        <button
          ref={nextRef}
          onClick={handleNextClick}
          className="group relative px-10 py-2 rounded-full border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 translate-x-[100%] group-hover:translate-x-0 transition-transform duration-300"></div>
          <ChevronRight 
            className={`w-6 h-6 text-white relative z-10 transition-transform duration-300 ${
              nextClicked ? 'scale-75 translate-x-1' : 'group-hover:translate-x-0.5'
            }`} 
          />
        </button>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        onSwiper={(swiper) => setSwiperInstance(swiper)}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        breakpoints={{
          320: { slidesPerView: 1 }, // mobile
          768: { slidesPerView: 2 }, // tablet
          1024: { slidesPerView: 3 }, // desktop
        }}
      >
        <SwiperSlide><VenueCard onReserve={onReserve} /></SwiperSlide>
        <SwiperSlide><VenueCard onReserve={onReserve} /></SwiperSlide>
        <SwiperSlide><VenueCard onReserve={onReserve} /></SwiperSlide>
        <SwiperSlide><VenueCard onReserve={onReserve} /></SwiperSlide>
      </Swiper>
    </div>
  );
}
