import { Manrope } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Gdje Izlazimo",
  description: "Najboli klubovi, restorani, pubovi u Sarajevu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
