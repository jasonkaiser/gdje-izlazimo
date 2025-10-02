"use client";

import { MapPin, Beer, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VenueModal({ isVisible, onClose }) {

  const handleReserve = () => {
    console.log("Reservation made!");
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="p-8 flex flex-col bg-[#09121F] border border-white/14 rounded-3xl w-full md:max-w-[40%] max-md:max-w-sm"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-white font-bold text-5xl">Viking Pub</h1>

            <div className="flex items-center text-white text-xl mt-3 gap-3 flex-wrap">
              <span>Detalji:</span>
              <div className="border border-[#007FFF] text-xs flex gap-2 items-center text-[#007FFF] px-3 py-1 rounded-2xl">
                <MapPin className="w-4 h-4" />
                Hamdije Kresevljakovica 61
              </div>
              <div className="border border-[#FFBB00] text-xs flex gap-2 items-center text-[#FFBB00] px-3 py-1 rounded-2xl">
                <Beer className="w-4 h-4" />
                Pub
              </div>
            </div>

            <hr className="border-white/15 w-full mt-5 mb-10" />

            <div className="flex flex-col gap-4">
              {/* Name Input */}
              <div className="bg-[#0A1929] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 text-white/50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Ime Prezime"
                  className="bg-transparent outline-none flex-1 text-white placeholder:text-white/50"
                />
              </div>

              {/* Phone Input */}
              <div className="bg-[#0A1929] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 text-white/50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <input
                  type="tel"
                  placeholder="Broj Telefona"
                  className="bg-transparent outline-none flex-1 text-white placeholder:text-white/50"
                />
              </div>

              {/* Number of People */}
              <div className="bg-[#0A1929] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 text-white/50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <input
                  type="number"
                  placeholder="Broj Osoba"
                  className="bg-transparent outline-none flex-1 text-white placeholder:text-white/50"
                />
              </div>

              {/* Date & Time */}
              <div className="bg-[#0A1929] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 text-white/50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="datetime-local"
                  placeholder="Datum i Vrijeme"
                  className="bg-transparent outline-none flex-1 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8 justify-end">
              <button
                className="px-8 py-3 bg-transparent border border-white/20 text-white/60 rounded-2xl text-sm font-medium hover:bg-white/5 transition-colors"
                onClick={onClose}
              >
                Odbij
              </button>
              <button
                className="px-6 py-3 rounded-xl text-white font-light text-sm flex items-center gap-3 border border-cyan-300/30 hover:opacity-90 transition-opacity"
                style={{
                  background:
                    "radial-gradient(59.39% 586.86% at 57.14% 0%, #0048FF 0%, #002A55 100%)",
                }}
                onClick={handleReserve}
              >
                Rezerviši <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
