"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideLayoutRoutes = ["/dashboard/venue", "/auth/login", "/auth/signup"];
  const showLayout = !hideLayoutRoutes.includes(pathname);

  return (
    <>
      {showLayout && <Navbar />}
      {children}
      {showLayout && <Footer />}
    </>
  );
}
