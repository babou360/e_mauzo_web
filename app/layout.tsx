// 'use client';
// import { Merriweather } from 'next/font/google';
// import { useEffect, useState } from 'react';
// import LayoutComponent from '@/components/layout/layout';
// import './globals.css';
// import SplashScreen from '@/components/splash/splash';

// const merriweather = Merriweather({
//   subsets: ['latin'],
//   weight: '300',
//   display: 'swap',
// });

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [resourcesReady, setResourcesReady] = useState(false);

//   useEffect(() => {
//     let isMounted = true;

//     const loadResources = async () => {
//       try {
//         // Wait for fonts
//         if ('fonts' in document) {
//           await document.fonts.ready;
//         }

//         // DO NOT wait for service worker — EVER in dev
//         // It hangs. Remove it.

//         if (isMounted) {
//           setResourcesReady(true);
//         }
//       } catch (err) {
//         console.warn('Preload failed:', err);
//         if (isMounted) setResourcesReady(true);
//       }
//     };

//     loadResources();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   return (
//     <html lang="en" className={merriweather.className}>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
//         <meta name="theme-color" content="#4f46e5" />
//         <link rel="manifest" href="/manifest.json" />
//         <link rel="apple-touch-icon" href="/icons/icon-192.png" />
//         <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
//       </head>

//       <body className="relative overflow-hidden h-screen">
//         {/* APP IS ALWAYS MOUNTED — NEVER UNMOUNTED */}
//         <div
//           style={{
//             visibility: resourcesReady ? 'visible' : 'hidden',
//             opacity: resourcesReady ? 1 : 0,
//             transition: 'opacity 0.3s ease',
//             position: 'absolute',
//             inset: 0,
//             overflow: 'hidden',
//           }}
//         >
//           <LayoutComponent>{children}</LayoutComponent>
//         </div>

//         {/* SPLASH OVERLAY — ONLY VISUAL */}
//         {!resourcesReady && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
//             <SplashScreen />
//           </div>
//         )}
//       </body>
//     </html>
//   );
// }


'use client';
import { Merriweather } from 'next/font/google';
import { useEffect, useState } from 'react';
import LayoutComponent from '@/components/layout/layout';
import SplashScreen from '@/components/splash/splash';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: '300',
  display: 'swap',
});

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