import { StarIcon, ArrowLongRightIcon, ClockIcon } from "@heroicons/react/24/solid";
import Image from "next/image";


export default function VenueCard() {
  return (
    <div className="bg-[#D9D9D9]/4 border border-white/14 rounded-tl-3xl rounded-br-3xl w-full min-h-[240px]">
      {/* Top Banner */}
        <img
        src="/images/party.jpg"
        alt="Venue"
        className="h-26 w-full object-cover rounded-tl-3xl"
        />


      {/* Content */}
      <div className="p-3 px-4">
        {/* Address + Rating */}
        <div className="flex justify-between">
          <p className="text-white/33 font-light text-[14px]">
            Hamdije Kresevljakovica 61
          </p>
          <div className="flex gap-2 items-center">
            <StarIcon className="text-yellow-400 w-4 h-4" />
            <b className="text-white">5.0</b>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-white font-bold text-4xl">Viking Pub</h1>

        {/* Actions (Button + Time) */}
        <div className="flex items-center gap-5 mt-5">
          <button
            className="px-4 py-1 rounded-xl text-white font-light text-[14px] flex items-center gap-3 border border-cyan-300/30"
            style={{
              background:
                "radial-gradient(59.39% 586.86% at 57.14% 0%, #0048FF 0%, #002A55 100%)",
            }}
          >
            Rezerviši <ArrowLongRightIcon className="w-5 h-5" />
          </button>

          <div className="bg-[#D9D9D9]/4 border border-white/14 flex items-center gap-2 p-1.5 px-2 rounded-xl text-white">
            <ClockIcon className="w-4 h-4" />
            <p className="text-[12px]">21.03.2025 - 20:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
