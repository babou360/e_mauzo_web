'use client';
import type { Metadata } from "next";
import { Merriweather, Open_Sans } from 'next/font/google';
import { useEffect, useState } from 'react';
import LayoutComponent from '@/components/layout/layout';
import SplashScreen from '@/components/splash/splash';
// import './global.css'

const merriweather = Open_Sans({
  subsets: ['latin'],
  weight: '300',
  display: 'swap',
});

// app/layout.tsx

export const metadata: Metadata = {
  title: "Bazenga-pos",
  description: "Best Business management system in Tanzania",
  keywords: [
    "inventory",
    "POS",
    "stock management",
    "Settlo",
    "Luvanda Pos",
    "Kuza Business",
    "Tawala",
    "Kaunta",
    "SmartBusiness",
    "CodeLab Business ERP",
    "VISION XPOS",
    "Business management",
    "Tanzania"
  ],
  authors: [{ name: "Swahilicodes" }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [resourcesReady, setResourcesReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let startTime = Date.now();

    const loadResources = async () => {
      try {
        // Wait for fonts
        if ('fonts' in document) {
          await document.fonts.ready;
        }

        // DO NOT wait for service worker — EVER in dev
        // It hangs. Remove it.

        if (isMounted) {
          setResourcesReady(true);
        }
      } catch (err) {
        console.warn('Preload failed:', err);
        if (isMounted) setResourcesReady(true);
      }
    };

    // Ensure minimum 5 seconds display
    const minDisplayTime = setTimeout(() => {
      if (isMounted) {
        setMinTimeElapsed(true);
      }
    }, 5000);

    loadResources();

    return () => {
      isMounted = false;
      clearTimeout(minDisplayTime);
    };
  }, []);

  // Show splash until BOTH conditions are met
  const showSplash = !resourcesReady || !minTimeElapsed;

  return (
    <html lang="en" className={merriweather.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>

      <body className="relative overflow-hidden h-screen">
        {/* APP CONTENT - ALWAYS MOUNTED, NEVER UNMOUNTED */}
        <div
          style={{
            visibility: !showSplash ? 'visible' : 'hidden',
            opacity: !showSplash ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
          }}
        >
          <LayoutComponent>{children}</LayoutComponent>
        </div>

        {/* SPLASH OVERLAY - SHOWS FOR MINIMUM 5 SECONDS */}
        {showSplash && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <SplashScreen />
          </div>
        )}
      </body>
    </html>
  );
}