import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '400', '500', '600', '700'], 
});

export const metadata = {
  title: "Gdje Izlazimo",
  description: "Najboli klubovi, restorani, pubovi u Sarajevu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <Navbar /> {/* Add Navbar here */}
        {children}
        <Footer />
      </body>
    </html>
  );
}