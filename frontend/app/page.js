// app/page.js
import Image from "next/image";
import { MagnifyingGlassIcon, ArrowLongRightIcon, MusicalNoteIcon, BeakerIcon } from "@heroicons/react/24/solid";
import { Beer, ForkKnife } from "lucide-react"; 

import VenueCarousel from "@/components/VenueCarousel";


export default function Home() {
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

  return (
    <div className="w-full h-full bg-[#000A17] overflow-hidden">

      {/* Hero Section */}
      <div className="relative w-full mt-50 mb-30">
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
            <div className="w-[50%] max-md:w-full max-md:px-5 flex flex-col justify-start gap-6">
              <div>
                <h1 className="text-8xl font-semibold text-white max-md:text-6xl">
                  Gdje Izlazimo
                </h1>
                <h2 className="text-8xl font-semibold text-white max-md:text-6xl">
                  veceras?
                </h2>
                <p className="text-xl font-extralight text-[#FFFFFF]/39 max-md:text-[15px] mt-3">
                  <i>Najbolji Pubovi, Restorani, Klubovi u Sarajevu</i>
                </p>

                {/* Search Input */}
                <div className="relative w-full max-w-2xl mt-4">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Unesi restoran, klub, pub..."
                    className="w-full pl-12 pr-4 py-3 bg-[rgba(217,217,217,0.09)] text-white placeholder-gray-400 rounded-full border border-[rgba(255,255,255,0.14)] outline-none"
                  />
                </div>
              </div>

              {/* Rezerviši Section */}
              <div className="flex items-end gap-10 max-sm:flex-col max-sm:gap-2 mt-30 ">
                <button
                  className="px-7 py-4 max-sm:mb-4 rounded-2xl text-white font-medium text-2xl flex gap-5 border border-cyan-300/30"
                  style={{
                    background:
                      "radial-gradient(59.39% 586.86% at 57.14% 0%, #0048FF 0%, #002A55 100%)",
                  }}
                >
                  Rezerviši <ArrowLongRightIcon className="w-6" />
                </button>
                <div className="text-4xl text-white flex gap-3">
                  izlazak u <b className="text-[#007FFF]">3 klika!</b>
                </div>
              </div>
            </div>

            {/* Right Column — Hero Image */}
            <div className="max-md:hidden flex">
              <div className="relative w-130 h-130">
                <Image
                  src="/images/wine.png"
                  alt="Venue Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    
      <hr className="border-white/15 w-[90%] mx-auto mb-20"></hr>

      {/* Category Section */}
      <section className="w-full max-w-7xl xl:ml-30">
        <h3 className="text-6xl font-extralight text-white mb-16 text-center md:text-left max-sm:text-5xl">
          Kategorije
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 p-5 max-sm:place-self-center">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col w-50 max-sm:w-40 max-sm:h-50 gap-4 items-center justify-center border border-b-gray-800 border-white/14 rounded-3xl cursor-pointer hover:scale-105 transition-transform p-6"
              style={{
                background: cat.gradient,
              }}
            >
              <div className="bg-white/8 border border-white/26 rounded-full w-30 h-30 flex items-center justify-center">
                {cat.icon}
              </div>
              <h4 className="text-[#A6A6A6] font-medium">{cat.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Section */}
    <section className="w-full max-sm:place-self-center max-w-7xl xl:ml-30 mt-30 mb-10">
      <h3 className="text-6xl font-extralight text-white mb-16 text-center md:text-left max-sm:text-5xl">
        Najpopularnije
      </h3>
    <VenueCarousel />


    
    </section>

      {/* Popular Section */}
    <section className="w-full max-sm:place-self-center max-w-7xl xl:ml-30 mt-30 mb-10">
      <h3 className="text-6xl font-extralight text-white mb-16 text-center md:text-left max-sm:text-5xl">
        Top Dogadjaji
      </h3>
      <VenueCarousel />

    
    </section>

    </div>
  );
}
