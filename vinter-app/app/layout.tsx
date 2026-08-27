import type { Metadata } from "next";
import { Capriola, Inter } from "next/font/google";
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
    <html lang="en" className={`${inter.variable} ${capriola.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
