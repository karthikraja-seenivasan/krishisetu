import type { Metadata } from "next";
import { Manrope, Inter, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const notoKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  variable: "--font-noto-sans-kannada",
  weight: ["400", "500", "600", "700"],
});

import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "KrishiSetu | From Field to Market",
  description: "Democratized Crop Recommendation and Agri-Marketplace MVP for Smallholder Farmers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${inter.variable} ${notoKannada.variable} font-sans antialiased bg-brand-cream text-brand-textPrimary`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
