"use client";

import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";


export default function Footer() {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });

  const navigationLinks = [
    { name: "Kategorije", href: "#kategorije" },
    { name: "Najpopularnije", href: "#najpopularnije" },
    { name: "Top Dogadjaji", href: "#topdogadjaji" },
    { name: "Account", href: "#account" },
  ];

  const socialLinks = [
    { name: "LinkedIn", href: "https://www.linkedin.com/in/jason-kaiser-1922022b8/", icon: Linkedin },
    { name: "Instagram", href: "https://www.instagram.com/kajzer_jason/", icon: Instagram },
    { name: "Email", href: "mailto:jasonkaiser126@gmail.com", icon: Mail },
  ];

  return (
    <motion.footer
      ref={footerRef}
      className="py-12 px-6 bg-black text-white"
      initial={{ y: 80, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className="w-full mx-auto px-20 max-md:px-5">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Left Side - Your Name */}
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">
              Gdje Izlazimo
            </h2>
            <p className="mt-2 text-sm text-[#636363]">
              www.gdje-izlazimo.ba
            </p>
          </div>

          {/* Right Side - Navigation and Socials */}
          <div className="flex sm:flex-row gap-20 md:gap-52 max-md:mt-10">
            {/* Navigation Section */}
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold mb-4 font-montserrat text-[#636363]">
                Navigacija
              </h3>
              <ul className="space-y-2">
                {navigationLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ y: 20, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    <a
                      href={link.href}
                      className="font-poppins font-medium text-sm text-white hover:opacity-80 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Socials Section */}
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold mb-4 font-montserrat text-[#636363]">
                CONNECT
              </h3>
              <ul className="space-y-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.li
                      key={social.name}
                      initial={{ y: 20, opacity: 0 }}
                      animate={isInView ? { y: 0, opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <a
                        target="_blank"
                        href={social.href}
                        className="flex items-center font-medium font-poppins gap-2 text-sm text-white hover:opacity-80 transition-colors duration-200"
                      >
                        <IconComponent className="w-4 h-4" />
                        {social.name}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Border and Copyright */}
        <motion.div
          className="border-t mt-8 pt-6 border-[#636363]"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center max-md:items-start gap-4">
            <p className="text-sm text-[#636363]">
              © 2025 www.gdje-izlazimo.ba - All rights reserved.
            </p>
            <p className="text-sm text-[#636363]">
              Made with ❤️ by jasonkaiser
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}