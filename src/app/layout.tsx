import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Visitor counts go to the same GoatCounter site as the GitHub Pages quizzes;
// prefix the host so this app's paths are distinguishable in the dashboard.
const GOATCOUNTER_CONFIG = `window.goatcounter={path:function(p){return location.host+p}};`;

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Algo 2 — Interactive Notes",
  description:
    "סיכומים אינטראקטיביים לקורס אלגוריתמים 2: אלגוריתמי גרפים, ניתוח סיבוכיות, ומה שחשוב לדעת למבחן.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: GOATCOUNTER_CONFIG }} />
        {children}
        <Script
          data-goatcounter="https://adirbuskila.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
        />
      </body>
    </html>
  );
}
