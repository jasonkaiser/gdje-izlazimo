'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [hover, setHover] = useState(false);
      
  const navigationItems = [
    { label: 'Kategorije', href: '#kategorije' },
    { label: 'Najpopularnije', href: '#najpopularnije' },
    { label: 'Top Dogadjaji', href: '#topdogadjaji' },
    { label: 'Account', href: '#account' }
  ];

  return (
    <div
      className="fixed top-10 left-1/2 transform -translate-x-1/2 w-auto min-w-[200px] max-w-[90vw] rounded-4xl flex flex-col px-5 py-1 shadow-2xl z-20 transition-colors duration-300 bg-white"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2 items-center cursor-pointer hover:animate-pulse">
          <Menu className="h-4 w-4 transition-colors duration-300 text-[#161616]" />
          <span className="text-[15px] font-medium transition-colors duration-300 text-black">
            Navigate
          </span>
        </div>
        
      
        <div className="relative h-10 w-13 bg-black/5 border border-gray-700/60 rounded-4xl">
          <Image
            src="/images/logo3.png" 
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div
        className="flex flex-col gap-2 mt-2 transition-all duration-300 overflow-hidden"
        style={{
          maxHeight: hover ? '200px' : '0px',
        }}
      >
        {navigationItems.map((item, index) => (
          <a
            key={item.label}
            href={item.href}
            className={`text-left font-normal text-[14px] hover:rounded-2xl px-3 py-1 transition-all cursor-pointer text-[#161616] hover:bg-gray-100 ${
              index === navigationItems.length - 1 ? 'mb-2' : ''
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Navbar;