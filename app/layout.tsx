import "./globals.css";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from "react";

export const metadata = {
  title: "Dr. AI",
  description: "A first-time AI helper",
};

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

const myFont = localFont({
  src: "../public/fonts/suit/SUIT-Variable.woff2",
  display: "swap",
  variable: "--font-suite",
});

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en" className={myFont.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="h-screen">
        {/* <Provider> */}
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            {modal}
            <SpeedInsights/>
          </Suspense>
        {/* </Provider> */}
        <Analytics></Analytics>
      </body>
    </html>
  );
}
