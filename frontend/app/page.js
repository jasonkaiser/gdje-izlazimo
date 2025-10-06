// app/page.js
"use client";

import { useState, Fragment, useRef } from "react";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  ArrowLongRightIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/solid";
import { Beer, ForkKnife } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import VenueCarousel from "@/components/VenueCarousel";
import VenueModal from "@/components/VenueModal";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Refs for each section
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const popularRef = useRef(null);
  const eventsRef = useRef(null);

  // InView hooks with optimized settings for mobile
  const heroInView = useInView(heroRef, { once: true, margin: "-50px" });
  const categoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" });
  const popularInView = useInView(popularRef, { once: true, margin: "-100px" });
  const eventsInView = useInView(eventsRef, { once: true, margin: "-100px" });

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const categories = [
    {
      name: "Klubovi",
      icon: <MusicalNoteIcon className="w-12 h-12 text-white" />,
      gradient:
        "radial-gradient(circle at 50% 20%, rgba(0,127,255,0.6) 0%, rgba(0,0,0,0.5) 100%)",
    },
    {
      name: "Pubovi",
      icon: <Beer className="w-12 h-12 text-white" />,
      gradient:
        "radial-gradient(circle at 50% 20%, rgba(255,215,0,0.6) 0%, rgba(0,0,0,0.5) 100%)",
    },
    {
      name: "Restorani",
      icon: <ForkKnife className="w-12 h-12 text-white" />,
      gradient:
        "radial-gradient(circle at 50% 20%, rgba(0,255,128,0.6) 0%, rgba(0,0,0,0.5) 100%)",
    },
    {
      name: "Barovi",
      icon: (
        <Image
          src="/images/hookah.svg"
          alt="Hookah"
          width={48}
          height={48}
          className="text-white"
        />
      ),
      gradient:
        "radial-gradient(circle at 50% 20%, rgba(255,0,0,0.6) 0%, rgba(0,0,0,0.5) 100%)",
    },
  ];

  // Optimized animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <Fragment>
      <div className="w-full h-full bg-[#000A17] overflow-hidden">
        {/* Hero Section */}
        <motion.div 
          ref={heroRef}
          className="relative w-full mt-50 mb-30"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          {/* Gradient Blurs */}
          <div
            className="absolute opacity-10"
            style={{
              width: "1583px",
              height: "1854px",
              left: "-187px",
              top: "-705px",
              background:
                "radial-gradient(50% 50% at 50% 50%, #007FFF 0%, rgba(115, 115, 115, 0) 100%)",
            }}
          />
          <div
            className="absolute opacity-20 blur-[25px]"
            style={{
              width: "1168px",
              height: "957px",
              left: "1305px",
              top: "785px",
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(0, 127, 255, 0.95) 0%, rgba(0, 72, 255, 0) 100%)",
            }}
          />
          <div
            className="absolute blur-[25px]"
            style={{
              width: "440px",
              height: "439px",
              left: "-151px",
              top: "-127px",
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(0, 127, 255, 0.95) 0%, rgba(0, 72, 255, 0) 100%)",
            }}
          />
          <div
            className="absolute opacity-20 blur-[25px]"
            style={{
              width: "440px",
              height: "439px",
              left: "-220px",
              top: "312px",
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(0, 127, 255, 0.95) 0%, rgba(0, 72, 255, 0) 100%)",
            }}
          />
          <div
            className="absolute opacity-30 blur-[25px]"
            style={{
              width: "547px",
              height: "531px",
              left: "236px",
              top: "-368px",
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(0, 127, 255, 0.95) 0%, rgba(0, 72, 255, 0) 100%)",
            }}
          />

          {/* Hero Content */}
          <div className="relative z-10 flex items-center justify-center h-full px-20 max-md:px-5">
            <div className="flex w-full items-center justify-center px-6 max-md:flex-col max-md:gap-10 max-md:px-4">
              {/* Left Column */}
              <motion.div 
                className="w-[50%] max-md:w-full max-md:px-5 flex flex-col justify-start gap-6"
                variants={fadeInUp}
              >
                <motion.div variants={fadeInUp}>
                  <motion.h1 
                    className="text-8xl font-semibold text-white max-md:text-6xl"
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    Gdje Izlazimo
                  </motion.h1>
                  <motion.h2 
                    className="text-8xl font-semibold text-white max-md:text-6xl"
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.3 }}
                  >
                    veceras?
                  </motion.h2>
                  <motion.p 
                    className="text-xl font-extralight text-[#FFFFFF]/39 max-md:text-[15px] mt-3"
                    initial={{ opacity: 0 }}
                    animate={heroInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <i>Najbolji Pubovi, Restorani, Klubovi u Sarajevu</i>
                  </motion.p>

                  {/* Search Input */}
                  <motion.div 
                    className="relative w-full max-w-2xl mt-4"
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Unesi restoran, klub, pub..."
                      className="w-full pl-12 pr-4 py-3 bg-[rgba(217,217,217,0.09)] text-white placeholder-gray-400 rounded-full border border-[rgba(255,255,255,0.14)] outline-none"
                    />
                  </motion.div>
                </motion.div>

                {/* Rezerviši Section */}
                <motion.div 
                  className="flex items-end gap-10 max-sm:flex-col max-sm:gap-2 mt-30"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.7 }}
                >
                  <motion.button
                    onClick={handleOpenModal}
                    className="px-7 py-4 max-sm:mb-4 rounded-2xl text-white font-medium text-2xl flex gap-5 border border-cyan-300/30"
                    style={{
                      background:
                        "radial-gradient(59.39% 586.86% at 57.14% 0%, #0048FF 0%, #002A55 100%)",
                    }}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                  >
                    Rezerviši <ArrowLongRightIcon className="w-6" />
                  </motion.button>
                  <div className="text-4xl text-white flex gap-3">
                    izlazak u <b className="text-[#007FFF]">3 klika!</b>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column — Hero Image */}
              <motion.div 
                className="max-md:hidden flex"
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 50 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative w-130 h-130">
                  <Image
                    src="/images/wine.png"
                    alt="Venue Illustration"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.hr 
          className="border-white/15 w-[90%] mx-auto mb-20"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={heroInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
        />

        {/* Category Section */}
        <motion.section 
          id="kategorije" 
          ref={categoriesRef}
          className="w-full max-w-7xl xl:ml-30"
          initial="hidden"
          animate={categoriesInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.h3 
            className="text-6xl font-extralight text-white mb-16 text-center md:text-left max-sm:text-5xl"
            variants={fadeInUp}
          >
            Kategorije
          </motion.h3>

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 p-5 max-sm:place-self-center"
            variants={staggerContainer}
          >
            {categories.map((cat, index) => (
              <motion.div
                key={cat.name}
                className="flex flex-col w-50 max-sm:w-40 max-sm:h-50 gap-4 items-center justify-center border border-b-gray-800 border-white/14 rounded-3xl cursor-pointer hover:scale-105 transition-transform p-6"
                style={{ background: cat.gradient }}
                variants={scaleIn}
                whileHover={{ 
                  scale: prefersReducedMotion ? 1 : 1.08,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              >
                <motion.div 
                  className="bg-white/8 border border-white/26 rounded-full w-30 h-30 flex items-center justify-center"
                  initial={{ rotate: prefersReducedMotion ? 0 : -10 }}
                  animate={categoriesInView ? { rotate: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {cat.icon}
                </motion.div>
                <h4 className="text-[#A6A6A6] font-medium">{cat.name}</h4>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Popular Section */}
        <motion.section
          id="najpopularnije"
          ref={popularRef}
          className="w-full max-sm:place-self-center md:px-30 mt-30 mb-10"
          initial="hidden"
          animate={popularInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <motion.h3 
            className="text-6xl font-extralight text-white mb-16 text-center md:text-left max-sm:text-5xl"
            variants={fadeInUp}
          >
            Najpopularnije
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
            animate={popularInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VenueCarousel onReserve={handleOpenModal} />
          </motion.div>
        </motion.section>

        {/* Top Dogadjaji Section */}
        <motion.section
          id="topdogadjaji"
          ref={eventsRef}
          className="w-full max-sm:place-self-center md:px-30 mt-30 mb-10"
          initial="hidden"
          animate={eventsInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <motion.h3 
            className="text-6xl font-extralight text-white mb-16 text-center md:text-left max-sm:text-5xl"
            variants={fadeInUp}
          >
            Top Dogadjaji
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
            animate={eventsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VenueCarousel onReserve={handleOpenModal} />
          </motion.div>
        </motion.section>
      </div>

      {/* Modal */}
      <VenueModal isVisible={showModal} onClose={handleCloseModal} />
    </Fragment>
  );
}