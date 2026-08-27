import type { Metadata } from "next";
import { Capriola, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
});

const capriola = Capriola({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-capriola",
});

export const metadata: Metadata = {
  title: "Vinter",
  description: "Build. Explain. Contribute. Earn.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${capriola.variable}`} suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-[#EFEFEF] text-neutral-900 antialiased dark:bg-[#000000] dark:text-neutral-100`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
