import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RAAS NIRVANA — Navratri 2026 | Official Ticket & Pass Booking",
  description: "Gujarat's celebrated heritage arena transforms into an acoustic sanctum of organic Garba, folk-fusion orchestras, and midnight culinary art. October 09-18, 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakartaSans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#1c0f18] text-[#f4dce8] selection:bg-[#e87920] selection:text-white">
        {children}
      </body>
    </html>
  );
}
