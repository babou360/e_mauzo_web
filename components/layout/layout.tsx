// "use client";
// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { jwtDecode } from 'jwt-decode';
// import Link from 'next/link';
// import cx from 'classnames';
// import styles from './layout_component.module.scss';
// import { motion, AnimatePresence } from 'framer-motion';
// import useIsAddBusinessStore from '@/store/atoms/isAddBusiness';
// import useFetch from '@/utils/fetch';
// import ErrorMessage from '../errorMessage';
// import AddBusiness from '../business/add_business';
// import { GrUserAdmin } from "react-icons/gr";
// import { FiLogOut } from 'react-icons/fi';
// import { IoSettingsOutline, IoChevronDown, IoMenu, IoClose } from 'react-icons/io5';
// import useSelectedBusinessStore from '@/store/atoms/selected_business';
// import useLanguageStore from '@/store/atoms/language';
// import { 
//   House, SquareActivity, Grape, LampDesk, ShoppingBag, 
//   BrushCleaning, BriefcaseBusiness, Trash, Volleyball, 
//   Anvil
// } from 'lucide-react';

// const LayoutComponent = ({ children }: { children: React.ReactNode }) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [showLabels, setShowLabels] = useState(false);
//   const [hoveredNav, setHoveredNav] = useState<{ label: string; x: number; y: number } | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const { isAddBusiness, addBusiness } = useIsAddBusinessStore();
//   const [selectedBusiness, setSelectedBusiness] = useState('');
//   const [greeting, setGreeting] = useState('');
//   const { setSelected } = useSelectedBusinessStore();
//   const { language, setLanguage } = useLanguageStore();
//   const [isSelectBusiness, setSelectBusiness] = useState(false);
//   const redirectingRef = useRef(false);
//   const isMobile = window.innerWidth <= 768;

//   // Fetch
//   const { data: businesses, loading: bizLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/business/get_user_businesses`, {
//     Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
//   });

//   const { data: user, loading: userLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/users/get_current_user`, {
//     Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
//   });

//   const loading = bizLoading || userLoading;

//   // === Subscription Expired Check ===
//   const isBusinessSubscriptionValid = (
//     businesses: any[],
//     businessId: string
//   ) => {
//     const business = businesses.find(
//       (b: any) =>
//         String(b.id) ===
//         String(businessId)
//     );

//     if (!business) return false;

//     const createdAt = new Date(business.createdAt);
//     const now = new Date();
//     const oneDay = 1000 * 60 * 60 * 24;

//     // Check if business is new (3-day trial)
//     const daysSinceCreation = (now.getTime() - createdAt.getTime()) / oneDay;
//     if (daysSinceCreation <= 3) {
//       return true;
//     }

//     // No payment found
//     if (!business.lastPaid) {
//       return false;
//     }

//     // Check payment validity
//     const lastPaid = new Date(business.lastPaid);
//     const daysSincePayment = (lastPaid.getTime() - now.getTime()) / oneDay;
//     return daysSincePayment >= 0;
//   };

//   // Token expired check
//   const isTokenExpired = (token: string | null): boolean => {
//     if (!token) return true;
//     try {
//       const decoded: { exp: number } = jwtDecode(token);
//       return decoded.exp < Date.now() / 1000;
//     } catch {
//       return true;
//     }
//   };

//   // Safe redirect function to prevent multiple redirects
//   const safeRedirect = (targetPath: string) => {
//     if (pathname !== targetPath && !redirectingRef.current) {
//       redirectingRef.current = true;
//       router.replace(targetPath);
//       setTimeout(() => {
//         redirectingRef.current = false;
//       }, 500);
//     }
//   };

//   const handleLang = () => {
//     if(language==="Swahili"){
//       localStorage.setItem('mauzo_language','English')
//       setLanguage('English')
//     }else {
//       localStorage.setItem('mauzo_language','Swahili')
//       setLanguage('Swahili')
//     }
//   }

//   const token = typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : null;
//   const bazenga_token = typeof window !== 'undefined' ? localStorage.getItem('bazenga_token') : null;
//   const outRoutes = ['/sign_log', '/first_screen', '/terms-and-conditions'];

//   // === MAIN AUTH & REDIRECT LOGIC ===
//   useEffect(() => {
//     if (loading) return;

//     // PRIORITY 1: Check bazenga_token FIRST
//     if (!bazenga_token) {
//       if (pathname !== '/first_screen') {
//         safeRedirect('/first_screen');
//       }
//       return;
//     }

//     const tokenValid = token && !isTokenExpired(token);

//     // PRIORITY 2: No token or expired → go to login
//     if (!tokenValid) {
//       // allow public routes
//       if (outRoutes.includes(pathname)) {
//         return;
//       }
//       safeRedirect('/sign_log');
//       return;
//     }

//     // PRIORITY 3: Check user status
//     if (user?.user?.status === 'inactive') {
//       if (pathname !== '/user/verify') {
//         safeRedirect('/user/verify');
//       }
//       return;
//     }

//     // PRIORITY 4: Business checks (only after auth is confirmed)
//     if (!bizLoading && businesses !== undefined) {
//       const savedBusiness = typeof window !== 'undefined' ? localStorage.getItem('business_id') : null;

//       // User has NO businesses
//       if (businesses && businesses.length === 0) {
//         if (pathname !== '/create_business') {
//           safeRedirect('/create_business');
//         }
//         return;
//       }

//       // User HAS businesses but NONE selected
//       if (businesses && businesses.length > 0 && !savedBusiness) {
//         if (pathname !== '/choose_business') {
//           safeRedirect('/choose_business');
//         }
//         return;
//       }

//       // User HAS businesses AND has one selected
//       if (businesses && businesses.length > 0 && savedBusiness) {
//         const hasValidSubscription = isBusinessSubscriptionValid(businesses, savedBusiness);

//         // Subscription expired
//         if (!hasValidSubscription) {
//           if (pathname !== '/subscription') {
//             safeRedirect('/subscription');
//           }
//           return;
//         }

//         // Valid subscription - redirect from restricted pages to home
//         const restrictedPages = ['/choose_business', '/sign_log', '/create_business', '/subscription'];
//         if (restrictedPages.includes(pathname)) {
//           safeRedirect('/');
//           return;
//         }

//         // Allow navigation to allowed pages only
//         const allowed = ['/', '/sales', '/products', '/attendants', '/clients', '/expenses', '/damages', '/business', '/deleted', '/businesses', '/business-reports'];
//         if (!allowed.includes(pathname)) {
//           safeRedirect('/');
//           return;
//         }
//       }
//     }
//   }, [loading, user, token, pathname, router, bazenga_token, businesses, bizLoading]);

//   // Setup after auth - greetings and business data
//   useEffect(() => {
//     if (!loading && user && bazenga_token) {
//       setGreeting(getGreeting());
//       getCurrentBusiness();
//       getLanguage();
//     }
//   }, [loading, user, bazenga_token, language]);

//   // Reset redirecting flag when pathname changes
//   useEffect(() => {
//     redirectingRef.current = false;
//   }, [pathname]);

//   // Scroll handler
//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 20);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Add this useEffect right after your other useEffects (around line 200)

// // Detect mobile screen and set showLabels accordingly
// // Detect mobile screen and set showLabels automatically
// useEffect(() => {
//   // Function to check if screen is mobile and update showLabels
//   const updateShowLabelsForMobile = () => {
//     const isMobileScreen = window.innerWidth <= 768;
    
//     // Only auto-set if user hasn't manually toggled the labels
//     const hasManuallyToggled = localStorage.getItem('sidebar_labels_manually_toggled');
    
//     if (!hasManuallyToggled) {
//       // Set showLabels to true on mobile, false on desktop
//       setShowLabels(isMobileScreen);
      
//       // Optional: Store the auto-setting preference to avoid conflicts
//       localStorage.setItem('sidebar_labels_auto_set', String(isMobileScreen));
//     }
//   };
  
//   // Initial check on mount
//   updateShowLabelsForMobile();
  
//   // Add resize listener to update when window size changes
//   const handleResize = () => {
//     const wasMobile = window.innerWidth <= 768;
//     const hasManuallyToggled = localStorage.getItem('sidebar_labels_manually_toggled');
    
//     if (!hasManuallyToggled) {
//       const isNowMobile = window.innerWidth <= 768;
//       setShowLabels(isNowMobile);
      
//       // Update stored auto-setting
//       localStorage.setItem('sidebar_labels_auto_set', String(isNowMobile));
//     }
//   };
  
//   window.addEventListener('resize', handleResize);
  
//   // Cleanup event listener on component unmount
//   return () => window.removeEventListener('resize', handleResize);
// }, []); // Empty dependency array ensures this runs once on mount

//   const getLanguage = () => {
//     const lang = localStorage.getItem('mauzo_language') || 'Swahili';
//     setLanguage(lang);
//   };

//   const getGreeting = (): string => {
//     const hour = new Date().getHours();
//     if (hour < 12) return language === 'Swahili' ? 'Asubuhi Njema' : 'Good Morning';
//     if (hour < 17) return language === 'Swahili' ? 'Mchana Mwema' : 'Good Afternoon';
//     if (hour < 21) return language === 'Swahili' ? 'Jioni Njema' : 'Good Evening';
//     return language === 'Swahili' ? 'Usiku Mwema' : 'Good Night';
//   };

//   const getCurrentBusiness = () => {
//     const savedName = localStorage.getItem('mauzo_selected_business');
//     if (savedName) setSelectedBusiness(savedName);

//     const businessId = localStorage.getItem('business_id');
//     if (businessId && businesses) {
//       const biz = businesses.find((b: any) => b.id == businessId);
//       if (biz) setSelected(biz);
//     }
//   };

//   const handleChangeBusiness = (name: string, id: string) => {
//     if (name === 'add') {
//       setSelectBusiness(false);
//       addBusiness();
//     } else {
//       localStorage.setItem('business_id', id);
//       localStorage.setItem('mauzo_selected_business', name);
//       setSelectedBusiness(name);
//       window.location.reload();
//     }
//   };

//   const signOut = () => {
//     localStorage.removeItem('mauzo_token');
//     localStorage.removeItem('mauzo_selected_business');
//     localStorage.removeItem('business_id');
//     // localStorage.removeItem('bazenga_token');
//     window.location.reload();
//   };

//   // Full-screen pages (no layout)
//   const fullScreenPages = ['/sign_log', '/user/verify', '/subscription', '/first_screen', '/terms-and-conditions', '/choose_business', '/create_business'];
//   const isFullScreen = fullScreenPages.includes(pathname);

//   // Show loading screen until we know where to go
//   if (loading) {
//     return (
//       <div className={styles.layout}>
//         <div className={styles.loadingScreen}>
//           <div className={styles.spinner} />
//         </div>
//       </div>
//     );
//   }

//   const navItems = [
//     { path: '/', icon: <House />, label: language === "Swahili" ? "Mwanzo" : "Home" },
//     { path: '/sales', icon: <SquareActivity />, label: language === "Swahili" ? "Mauzo" : "Sales" },
//     { path: '/products', icon: <Grape />, label: language === "Swahili" ? "Bidhaa" : "Products" },
//     { path: '/attendants', icon: <GrUserAdmin size={20} />, label: language === "Swahili" ? "Wauzaji" : "Attendants" },
//     { path: '/expenses', icon: <LampDesk />, label: language === "Swahili" ? "Matumizi" : "Expenses" },
//     { path: '/clients', icon: <ShoppingBag />, label: language === "Swahili" ? "Wateja" : "Clients" },
//     { path: '/damages', icon: <BrushCleaning />, label: language === "Swahili" ? "Uharibifu" : "Damages" },
//     { path: '/business', icon: <BriefcaseBusiness />, label: language === "Swahili" ? "Biashara Yangu" : "My Business" },
//     { path: '/deleted', icon: <Trash />, label: language === "Swahili" ? "Zilizo Futwa" : "Deleted" },
//     { path: '/businesses', icon: <Volleyball />, label: language === "Swahili" ? "Biashara Zangu" : "My Businesses" },
//     { path: '/business-reports', icon: <Anvil />, label: language === "Swahili" ? "Ripoti" : "Reports" },
//   ];

//   return (
//     <div className={styles.layout}>
//       <ErrorMessage />

//       <div className={cx(styles.container, { [styles.fullWidth]: isFullScreen })}>
//         {/* Sidebar & Header only when fully authenticated AND not on full-screen pages */}
//         {!isFullScreen && (
//           <>
//             <button className={styles.hamburger} onClick={() => setIsMobileMenuOpen(v => !v)}>
//               {isMobileMenuOpen ? <IoClose size={24} style={{color:"black"}} /> : <IoMenu size={24} style={{color:"black"}}/>}
//             </button>

//             <motion.aside
//               className={cx(styles.sidebar, { [styles.sidebarOpen]: isMobileMenuOpen })}
//               animate={{ width: showLabels ? 280 : 84 }}
//               transition={{ type: 'tween', duration: 0.25 }}
//             >
//               <div className={styles.sidebarHeader}>
//                 {showLabels ? <h2 className={styles.logo}>Bazenga</h2> : <div className={styles.logoMini}>
//                   <img src="/white.png" alt="" />
//                 </div>}
//               </div>

//               <nav className={styles.navigation}>
//                 <ul>
//                   {navItems.map(item => (
//                     <li key={item.path} className={cx({ [styles.active]: pathname === item.path })} onClick={() => setIsMobileMenuOpen(false)}>
//                       <Link
//                         href={item.path}
//                         className={cx(styles.navLink, { [styles.compact]: !showLabels })}
//                         onMouseEnter={(e) => !showLabels && setHoveredNav({
//                           label: item.label,
//                           x: e.currentTarget.getBoundingClientRect().right + 10,
//                           y: e.currentTarget.getBoundingClientRect().top + 16
//                         })}
//                         onMouseLeave={() => setHoveredNav(null)}
//                       >
//                         <span className={styles.navIcon}>{item.icon}</span>
//                         <AnimatePresence>
//                           {showLabels && (
//                             <motion.span className={styles.navLabel} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
//                               {item.label}
//                             </motion.span>
//                           )}
//                         </AnimatePresence>
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </nav>
//             </motion.aside>
//           </>
//         )}

//         <main className={cx(styles.content, { [styles.fullWidth]: isFullScreen })}>
//           {isAddBusiness && (
//             <div className={styles.modalOverlay}>
//               <div className={styles.modalContent}>
//                 <AddBusiness />
//               </div>
//             </div>
//           )}

//           {/* Header only on dashboard pages */}
//           {!isFullScreen && (
//             <header className={cx(styles.header, { [styles.scrolled]: isScrolled })}>
//               <motion.div className={styles.headerContent} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
//                 <div className={styles.headerLeft}>
//                   <button onClick={() => setShowLabels(v => !v)} className={styles.sidebarToggleInHeader}>
//                     <motion.span animate={{ rotate: showLabels ? 0 : 180 }}>
//                       {showLabels ? '⟨⟨' : '⟩⟩'}
//                     </motion.span>
//                   </button>
//                   <div className={styles.businessSelector} onClick={() => setSelectBusiness(v => !v)}>
//                     <p>{selectedBusiness || (language === "Swahili" ? "Chagua Biashara" : "Select Business")}</p>
//                     <span className={styles.arrow} />
//                   </div>
//                 </div>

//                 <div className={styles.headerRight}>
//                   <div className={styles.userMenu}>
//                     <div className={styles.userGreeting}>
//                       <span className={styles.greeting}>{greeting}</span>
//                       <span className={styles.userName}>{user?.user?.name || "Bazenga"}</span>
//                     </div>
//                     <div
//                       className={styles.avatar}
//                       style={{ backgroundImage: `url(${language === "Swahili" ? './tanzania.png' : './usa.svg'})` }}
//                       onClick={() => handleLang()}
//                     />
//                     <button onClick={() => setIsMenuOpen(v => !v)} className={cx(styles.menuToggle, { [styles.active]: isMenuOpen })}>
//                       <IoChevronDown size={18} />
//                     </button>

//                     <AnimatePresence>
//                       {isMenuOpen && (
//                         <motion.div className={styles.dropdownMenu} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
//                           <ul>
//                             <li><IoSettingsOutline size={18} /> <span>Settings</span></li>
//                             <li onClick={signOut}><FiLogOut size={18} /> <span>Sign Out</span></li>
//                           </ul>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.div>
//             </header>
//           )}

//           <div className={styles.pageContent}>
//             {isSelectBusiness && !isFullScreen && (
//               <div className={styles.businessSelection}>
//                 <div className={styles.container}>
//                   <div className={styles.close} onClick={() => setSelectBusiness(false)}>×</div>
//                   <div className={styles.selections}>
//                     <h3 className={styles.title}>{language === "Swahili" ? "Chagua Biashara" : "Select Business"}</h3>
//                     <div className={styles.list}>
//                       {businesses?.map((item: any) => (
//                         <label key={item.id} className={styles.option}>
//                           <input type="radio" name="business" checked={selectedBusiness === item.name} onChange={() => handleChangeBusiness(item.name, item.id)} />
//                           <span>{item.name}</span>
//                         </label>
//                       ))}
//                       <label className={`${styles.option} ${styles.addOption}`}>
//                         <input type="radio" name="business" onChange={() => handleChangeBusiness('add', '0')} />
//                         <span>{language === "Swahili" ? "Ongeza Biashara" : "Add Business"}</span>
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {children}
//           </div>
//         </main>
//       </div>

//       {/* Global tooltip */}
//       <AnimatePresence>
//         {!showLabels && hoveredNav && (
//           <motion.div className={styles.globalTooltip} style={{ top: hoveredNav.y, left: hoveredNav.x }}>
//             <span className={styles.globalTooltipArrow} />
//             <span className={styles.globalTooltipText}>{hoveredNav.label}</span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default LayoutComponent;


"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import cx from 'classnames';
import styles from './layout_component.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import useIsAddBusinessStore from '@/store/atoms/isAddBusiness';
import useFetch from '@/utils/fetch';
import ErrorMessage from '../errorMessage';
import AddBusiness from '../business/add_business';
import { GrUserAdmin } from "react-icons/gr";
import { FiLogOut } from 'react-icons/fi';
import { IoSettingsOutline, IoChevronDown, IoMenu, IoClose } from 'react-icons/io5';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useLanguageStore from '@/store/atoms/language';
import { 
  House, SquareActivity, Grape, LampDesk, ShoppingBag, 
  BrushCleaning, BriefcaseBusiness, Trash, Volleyball, 
  Anvil
} from 'lucide-react';

const LayoutComponent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<{ label: string; x: number; y: number } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAddBusiness, addBusiness } = useIsAddBusinessStore();
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [greeting, setGreeting] = useState('');
  const { setSelected } = useSelectedBusinessStore();
  const { language, setLanguage } = useLanguageStore();
  const [isSelectBusiness, setSelectBusiness] = useState(false);
  const redirectingRef = useRef(false);

  // Fetch
  const { data: businesses, loading: bizLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/business/get_user_businesses`, {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
  });

  const { data: user, loading: userLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/users/get_current_user`, {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
  });

  const loading = bizLoading || userLoading;

  // === Subscription Expired Check ===
  const isBusinessSubscriptionValid = (
    businesses: any[],
    businessId: string
  ) => {
    const business = businesses.find(
      (b: any) =>
        String(b.id) ===
        String(businessId)
    );

    if (!business) return false;

    const createdAt = new Date(business.createdAt);
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;

    // Check if business is new (3-day trial)
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / oneDay;
    if (daysSinceCreation <= 3) {
      return true;
    }

    // No payment found
    if (!business.lastPaid) {
      return false;
    }

    // Check payment validity
    const lastPaid = new Date(business.lastPaid);
    const daysSincePayment = (lastPaid.getTime() - now.getTime()) / oneDay;
    return daysSincePayment >= 0;
  };

  // Token expired check
  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  // Safe redirect function to prevent multiple redirects
  const safeRedirect = (targetPath: string) => {
    if (pathname !== targetPath && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace(targetPath);
      setTimeout(() => {
        redirectingRef.current = false;
      }, 500);
    }
  };

  const handleLang = () => {
    if(language==="Swahili"){
      localStorage.setItem('mauzo_language','English')
      setLanguage('English')
    }else {
      localStorage.setItem('mauzo_language','Swahili')
      setLanguage('Swahili')
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : null;
  const bazenga_token = typeof window !== 'undefined' ? localStorage.getItem('bazenga_token') : null;
  const outRoutes = ['/sign_log', '/first_screen', '/terms-and-conditions'];

  // === MAIN AUTH & REDIRECT LOGIC ===
  useEffect(() => {
    if (loading) return;

    // PRIORITY 1: Check bazenga_token FIRST
    if (!bazenga_token) {
      if (pathname !== '/first_screen') {
        safeRedirect('/first_screen');
      }
      return;
    }

    const tokenValid = token && !isTokenExpired(token);

    // PRIORITY 2: No token or expired → go to login
    if (!tokenValid) {
      // allow public routes
      if (outRoutes.includes(pathname)) {
        return;
      }
      safeRedirect('/sign_log');
      return;
    }

    // PRIORITY 3: Check user status
    if (user?.user?.status === 'inactive') {
      if (pathname !== '/user/verify') {
        safeRedirect('/user/verify');
      }
      return;
    }

    // PRIORITY 4: Business checks (only after auth is confirmed)
    if (!bizLoading && businesses !== undefined) {
      const savedBusiness = typeof window !== 'undefined' ? localStorage.getItem('business_id') : null;

      // User has NO businesses
      if (businesses && businesses.length === 0) {
        if (pathname !== '/create_business') {
          safeRedirect('/create_business');
        }
        return;
      }

      // User HAS businesses but NONE selected
      if (businesses && businesses.length > 0 && !savedBusiness) {
        if (pathname !== '/choose_business') {
          safeRedirect('/choose_business');
        }
        return;
      }

      // User HAS businesses AND has one selected
      if (businesses && businesses.length > 0 && savedBusiness) {
        const hasValidSubscription = isBusinessSubscriptionValid(businesses, savedBusiness);

        // Subscription expired
        if (!hasValidSubscription) {
          if (pathname !== '/subscription') {
            safeRedirect('/subscription');
          }
          return;
        }

        // Valid subscription - redirect from restricted pages to home
        const restrictedPages = ['/choose_business', '/sign_log', '/create_business', '/subscription'];
        if (restrictedPages.includes(pathname)) {
          safeRedirect('/');
          return;
        }

        // Allow navigation to allowed pages only
        const allowed = ['/', '/sales', '/products', '/attendants', '/clients', '/expenses', '/damages', '/business', '/deleted', '/businesses', '/business-reports'];
        if (!allowed.includes(pathname)) {
          safeRedirect('/');
          return;
        }
      }
    }
  }, [loading, user, token, pathname, router, bazenga_token, businesses, bizLoading]);

  // Setup after auth - greetings and business data
  useEffect(() => {
    if (!loading && user && bazenga_token) {
      setGreeting(getGreeting());
      getCurrentBusiness();
      getLanguage();
    }
  }, [loading, user, bazenga_token, language]);

  // Reset redirecting flag when pathname changes
  useEffect(() => {
    redirectingRef.current = false;
  }, [pathname]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // WORKING MOBILE/DESKTOP LABELS EFFECT
  // Mobile: show labels by default | Desktop: hide labels by default
  useEffect(() => {
    const updateLabelsBasedOnScreen = () => {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // On mobile: show labels by default
        setShowLabels(true);
      } else {
        // On desktop: hide labels by default
        setShowLabels(false);
      }
    };
    
    // Run on mount
    updateLabelsBasedOnScreen();
    
    // Listen for window resize
    const handleResize = () => {
      updateLabelsBasedOnScreen();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array - runs once on mount

  const getLanguage = () => {
    const lang = localStorage.getItem('mauzo_language') || 'Swahili';
    setLanguage(lang);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'Swahili' ? 'Asubuhi Njema' : 'Good Morning';
    if (hour < 17) return language === 'Swahili' ? 'Mchana Mwema' : 'Good Afternoon';
    if (hour < 21) return language === 'Swahili' ? 'Jioni Njema' : 'Good Evening';
    return language === 'Swahili' ? 'Usiku Mwema' : 'Good Night';
  };

  const getCurrentBusiness = () => {
    const savedName = localStorage.getItem('mauzo_selected_business');
    if (savedName) setSelectedBusiness(savedName);

    const businessId = localStorage.getItem('business_id');
    if (businessId && businesses) {
      const biz = businesses.find((b: any) => b.id == businessId);
      if (biz) setSelected(biz);
    }
  };

  const handleChangeBusiness = (name: string, id: string) => {
    if (name === 'add') {
      setSelectBusiness(false);
      addBusiness();
    } else {
      localStorage.setItem('business_id', id);
      localStorage.setItem('mauzo_selected_business', name);
      setSelectedBusiness(name);
      window.location.reload();
    }
  };

  const signOut = () => {
    localStorage.removeItem('mauzo_token');
    localStorage.removeItem('mauzo_selected_business');
    localStorage.removeItem('business_id');
    // localStorage.removeItem('bazenga_token');
    window.location.reload();
  };

  // Full-screen pages (no layout)
  const fullScreenPages = ['/sign_log', '/user/verify', '/subscription', '/first_screen', '/terms-and-conditions', '/choose_business', '/create_business'];
  const isFullScreen = fullScreenPages.includes(pathname);

  // Show loading screen until we know where to go
  if (loading) {
    return (
      <div className={styles.layout}>
        <div className={styles.loadingScreen}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/', icon: <House />, label: language === "Swahili" ? "Mwanzo" : "Home" },
    { path: '/sales', icon: <SquareActivity />, label: language === "Swahili" ? "Mauzo" : "Sales" },
    { path: '/products', icon: <Grape />, label: language === "Swahili" ? "Bidhaa" : "Products" },
    { path: '/attendants', icon: <GrUserAdmin size={20} />, label: language === "Swahili" ? "Wauzaji" : "Attendants" },
    { path: '/expenses', icon: <LampDesk />, label: language === "Swahili" ? "Matumizi" : "Expenses" },
    { path: '/clients', icon: <ShoppingBag />, label: language === "Swahili" ? "Wateja" : "Clients" },
    { path: '/damages', icon: <BrushCleaning />, label: language === "Swahili" ? "Uharibifu" : "Damages" },
    { path: '/business', icon: <BriefcaseBusiness />, label: language === "Swahili" ? "Biashara Yangu" : "My Business" },
    { path: '/deleted', icon: <Trash />, label: language === "Swahili" ? "Zilizo Futwa" : "Deleted" },
    { path: '/businesses', icon: <Volleyball />, label: language === "Swahili" ? "Biashara Zangu" : "My Businesses" },
    { path: '/business-reports', icon: <Anvil />, label: language === "Swahili" ? "Ripoti" : "Reports" },
  ];

  return (
    <div className={styles.layout}>
      <ErrorMessage />

      <div className={cx(styles.container, { [styles.fullWidth]: isFullScreen })}>
        {/* Sidebar & Header only when fully authenticated AND not on full-screen pages */}
        {!isFullScreen && (
          <>
            <button className={styles.hamburger} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <IoClose size={24} style={{color:"black"}} /> : <IoMenu size={24} style={{color:"black"}}/>}
            </button>

            <motion.aside
              className={cx(styles.sidebar, { [styles.sidebarOpen]: isMobileMenuOpen })}
              animate={{ width: showLabels ? 280 : 84 }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className={styles.sidebarHeader}>
                {showLabels ? <h2 className={styles.logo}>Bazenga</h2> : <div className={styles.logoMini}>
                  <img src="/white.png" alt="" />
                </div>}
              </div>

              <nav className={styles.navigation}>
                <ul>
                  {navItems.map(item => (
                    <li key={item.path} className={cx({ [styles.active]: pathname === item.path })} onClick={() => setIsMobileMenuOpen(false)}>
                      <Link
                        href={item.path}
                        className={cx(styles.navLink, { [styles.compact]: !showLabels })}
                        onMouseEnter={(e) => !showLabels && setHoveredNav({
                          label: item.label,
                          x: e.currentTarget.getBoundingClientRect().right + 10,
                          y: e.currentTarget.getBoundingClientRect().top + 16
                        })}
                        onMouseLeave={() => setHoveredNav(null)}
                      >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <AnimatePresence>
                          {showLabels && (
                            <motion.span className={styles.navLabel} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}

        <main className={cx(styles.content, { [styles.fullWidth]: isFullScreen })}>
          {isAddBusiness && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <AddBusiness />
              </div>
            </div>
          )}

          {/* Header only on dashboard pages */}
          {!isFullScreen && (
            <header className={cx(styles.header, { [styles.scrolled]: isScrolled })}>
              <motion.div className={styles.headerContent} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <div className={styles.headerLeft}>
                  <button onClick={() => setShowLabels(!showLabels)} className={styles.sidebarToggleInHeader}>
                    <motion.span animate={{ rotate: showLabels ? 0 : 180 }}>
                      {showLabels ? '⟨⟨' : '⟩⟩'}
                    </motion.span>
                  </button>
                  <div className={styles.businessSelector} onClick={() => setSelectBusiness(v => !v)}>
                    <p>{selectedBusiness || (language === "Swahili" ? "Chagua Biashara" : "Select Business")}</p>
                    <span className={styles.arrow} />
                  </div>
                </div>

                <div className={styles.headerRight}>
                  <div className={styles.userMenu}>
                    <div className={styles.userGreeting}>
                      <span className={styles.greeting}>{greeting}</span>
                      <span className={styles.userName}>{user?.user?.name || "Bazenga"}</span>
                    </div>
                    <div
                      className={styles.avatar}
                      style={{ backgroundImage: `url(${language === "Swahili" ? './tanzania.png' : './usa.svg'})` }}
                      onClick={() => handleLang()}
                    />
                    <button onClick={() => setIsMenuOpen(v => !v)} className={cx(styles.menuToggle, { [styles.active]: isMenuOpen })}>
                      <IoChevronDown size={18} />
                    </button>

                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div className={styles.dropdownMenu} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                          <ul>
                            <li><IoSettingsOutline size={18} /> <span>Settings</span></li>
                            <li onClick={signOut}><FiLogOut size={18} /> <span>Sign Out</span></li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </header>
          )}

          <div className={styles.pageContent}>
            {isSelectBusiness && !isFullScreen && (
              <div className={styles.businessSelection}>
                <div className={styles.container}>
                  <div className={styles.close} onClick={() => setSelectBusiness(false)}>×</div>
                  <div className={styles.selections}>
                    <h3 className={styles.title}>{language === "Swahili" ? "Chagua Biashara" : "Select Business"}</h3>
                    <div className={styles.list}>
                      {businesses?.map((item: any) => (
                        <label key={item.id} className={styles.option}>
                          <input type="radio" name="business" checked={selectedBusiness === item.name} onChange={() => handleChangeBusiness(item.name, item.id)} />
                          <span>{item.name}</span>
                        </label>
                      ))}
                      <label className={`${styles.option} ${styles.addOption}`}>
                        <input type="radio" name="business" onChange={() => handleChangeBusiness('add', '0')} />
                        <span>{language === "Swahili" ? "Ongeza Biashara" : "Add Business"}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {children}
            <div className={styles.footer} style={{display:"none",padding:"100px"}}>This is footer</div>
          </div>
        </main>
      </div>
      {/* Global tooltip */}
      <AnimatePresence>
        {!showLabels && hoveredNav && (
          <motion.div className={styles.globalTooltip} style={{ top: hoveredNav.y, left: hoveredNav.x }}>
            <span className={styles.globalTooltipArrow} />
            <span className={styles.globalTooltipText}>{hoveredNav.label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LayoutComponent;