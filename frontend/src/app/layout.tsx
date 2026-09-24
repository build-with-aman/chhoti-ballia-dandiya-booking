import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHHOTI BALLIA DANDIYA NIGHTS 2026 | Official Ticket Booking",
  description: "Join the biggest Dandiya festival in Begusarai. October 13, 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --font-playfair: 'Playfair Display', serif;
            --font-sans: 'Plus Jakarta Sans', sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#1c0f18] text-[#f4dce8] selection:bg-[#e87920] selection:text-white">
        {children}
      </body>
    </html>
  );
}
