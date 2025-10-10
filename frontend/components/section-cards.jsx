"use client";
import React, { useRef } from "react";
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export function SectionCards() {
  const prefersReducedMotion = useReducedMotion();

  // Ref and view tracking for scroll animation
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  const cards = [
    {
      title: "Today Reservations",
      value: "32",
      gradient: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.07) 100%)",
      bgColor: "#021226",
      icon: Calendar,
      footerText: "Active bookings for today",
      trend: "+8 from yesterday"
    },
    {
      title: "Weekly Reservations",
      value: "124",
      gradient: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.07) 100%)",
      bgColor: "#021226",
      icon: TrendingUp,
      footerText: "Total bookings this week",
      trend: "+15% vs last week"
    },
    {
      title: "Pending Reservations",
      value: "12",
      gradient: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.13) 100%)",
      bgColor: "#261802",
      icon: Clock,
      footerText: "Awaiting confirmation",
      trend: "Requires attention"
    },
    {
      title: "Accepted Reservations",
      value: "97",
      gradient: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.13) 100%)",
      bgColor: "#022602",
      icon: CheckCircle,
      footerText: "Confirmed bookings",
      trend: "78% acceptance rate"
    },
    {
      title: "Declined Reservations",
      value: "42",
      gradient: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.13) 100%)",
      bgColor: "#260202",
      icon: XCircle,
      footerText: "Rejected bookings",
      trend: "22% decline rate"
    }
  ];

  return (
    <motion.div 
      ref={sectionRef}
      initial="hidden"
      animate={sectionInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="space-y-4 px-4 lg:px-6"
    >
      {/* First Row */}
      <motion.div 
        className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2"
        variants={staggerContainer}
      >
        {cards.slice(0, 2).map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
              className="relative overflow-hidden transition-all duration-300"
              style={{
                background: card.gradient + ", " + card.bgColor,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "17px",
                padding: "20px",
                minHeight: "133px"
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h2 className="text-5xl font-bold text-white tabular-nums">
                    {card.value}
                  </h2>
                </div>
                <div 
                  className="p-2 rounded-lg bg-white/5"
                >
                  <Icon className="w-5 h-5 text-white opacity-60" />
                </div>
              </div>

              <motion.div 
                className="mt-auto pt-3 border-t border-white/10"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-xs font-medium">{card.trend}</span>
                </div>
                <p className="text-gray-500 text-xs">{card.footerText}</p>
              </motion.div>

              {/* Subtle glow */}
              <div 
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: card.bgColor }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Second Row */}
      <motion.div 
        className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3"
        variants={staggerContainer}
      >
        {cards.slice(2, 5).map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
              className="relative overflow-hidden transition-all duration-300"
              style={{
                background: card.gradient + ", " + card.bgColor,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "17px",
                padding: "20px",
                minHeight: "133px"
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h2 className="text-5xl font-bold text-white tabular-nums">
                    {card.value}
                  </h2>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <Icon className="w-5 h-5 text-white opacity-60" />
                </div>
              </div>

              <motion.div 
                className="mt-auto pt-3 border-t border-white/10"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-xs font-medium">{card.trend}</span>
                </div>
                <p className="text-gray-500 text-xs">{card.footerText}</p>
              </motion.div>

              <div 
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: card.bgColor }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
