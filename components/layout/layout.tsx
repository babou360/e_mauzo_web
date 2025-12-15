// "use client";

// import React, { useEffect, useState } from 'react';
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
// import { RiHome6Line } from 'react-icons/ri';
// import { FiLogOut } from 'react-icons/fi';
// import { IoSettingsOutline, IoChevronDown, IoMenu, IoClose } from 'react-icons/io5';
// import { MdOutlineInventory2, MdCategory } from 'react-icons/md';
// import { FiPieChart } from 'react-icons/fi';
// import { FaBalanceScale } from 'react-icons/fa';
// import { HiOutlinePlusCircle } from 'react-icons/hi';
// import useSelectedBusinessStore from '@/store/atoms/selected_business';
// import useLanguageStore from '@/store/atoms/language';
// import { GiSlicedSausage } from 'react-icons/gi';
// import { BriefcaseBusiness, BrushCleaning, Grape, House, LampDesk, ShoppingBag, SquareActivity, Trash, Volleyball } from 'lucide-react';

// const LayoutComponent = ({ children }: { children: React.ReactNode }) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [showLabels, setShowLabels] = useState(true); // simple label toggle
//   const [hoveredNav, setHoveredNav] = useState<{ label: string; x: number; y: number } | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const { isAddBusiness, addBusiness, closeBusiness } = useIsAddBusinessStore();
//   const [selectedBusiness, setSelectedBusiness] = useState('');
//   const [greeting, setGreeting] = useState('');
//   const { selected, setSelected, clearBusiness } = useSelectedBusinessStore();
//   const {language,setLanguage} = useLanguageStore()
//   const [isSelectBusiness, setSelectBusiness] = useState(false)

//   // Fetch business data
//   const { data: businesses, loading, error } = useFetch(
//     'http://62.169.30.105:5000/business/get_user_businesses',
//     {
//       Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`,
//     }
//   );
//   const { data: user, loading: userLoading, error: userError } = useFetch(
//     'http://62.169.30.105:5000/users/get_current_user',
//     {
//       Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`,
//     }
//   );

//   // Set initial greeting
//   useEffect(() => {
//     getCurrentBusiness();
//     setGreeting(getGreeting());
//     getLanguage()
//   }, [loading]);

//   // header scroll shrink
//   useEffect(() => {
//     const onScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', onScroll);
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);


//  function expired(
//   targetDate: Date,
//   createdAt: Date
// ) {
//   console.log(targetDate,createdAt)
//   const now = new Date();

//   const oneDayMs = 24 * 60 * 60 * 1000;

//   // How many days have passed since createdAt
//   const createdDiffMs = now.getTime() - createdAt.getTime();
//   const createdAtDays = createdDiffMs / oneDayMs;

//   // How many days until targetDate (can be negative if in the past)
//   const targetDiffMs = targetDate.getTime() - now.getTime();
//   const targetDiffDays = targetDiffMs / oneDayMs;

//   // 1) If createdAt is less than or equal to 7 days ago → false
//   if (createdAtDays <= 7) {
//     return false;
//   }

//   // 2) If createdAt > 7 days ago AND targetDate is less than 1 day away → true
//   if (createdAtDays > 7 && targetDiffDays < 1) {
//     return true;
//   }
// }


//   const getLanguage = () => {
//     const language001 = localStorage.getItem('language')
//     if(!language001){
//       setLanguage('Swahili')
//     }else{
//       setLanguage(language001)
//     }
//   }

//   // Auth and business selection logic
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const business = localStorage.getItem('mauzo_selected_business');
//       const token = localStorage.getItem('mauzo_token');
//       const status = localStorage.getItem('user_status');
      
//       if (business) {
//         setSelectedBusiness(business);
//       }

//       if (!token || (token && isTokenExpired(token))) {
//         if (pathname === '/sign_log' || pathname === '/user/verify') {
//           router.push(pathname);
//         } else {
//           router.push('/sign_log');
//         }
//       } else {
//         if (!userLoading) {
//           if (user.user.status === "inactive") {
//             router.push('/user/verify');
//           } else if(expired(new Date(user.subscription.lastPaid),new Date(user.user.createdAt))) {
//             router.push('/subscription')
//           } else {
//             if (pathname === "/sales" || pathname === "/products" || pathname === "/" || pathname === "/attendants"|| pathname === "/clients"|| pathname === "/expenses"|| pathname === "/damages" || pathname === "/business" || pathname === "/deleted" || pathname === "/businesses") {
//               router.push(pathname);
//             } else {
//               router.push('/');
//             }
//           }
//         }
//       }
//     }
//   }, [businesses, loading, error, userLoading, user]);

//   const handleLanguage = (languageItem:string) => {
//     const language1 = localStorage.getItem('language')
//     if(language1){
//       localStorage.removeItem('language')
//       localStorage.setItem('language',languageItem)
//       setLanguage(languageItem)
//     }else{
//       localStorage.setItem('language',languageItem)
//       setLanguage(languageItem)
//     }
//   }

//   const getGreeting = (): string => {
//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) return language==="Swahili"?"Asubuhi Njema":'Good Morning';
//     if (hour >= 12 && hour < 17) return language==="Swahili"?"Mchana Mwema":'Good Afternoon';
//     if (hour >= 17 && hour < 21) return language==="Swahili"?"Jioni Njema":'Good Evening';
//     return language==="Swahili"?"Usiku Mwema":'Good Night';
//   };

//   const isTokenExpired = (token: string): boolean => {
//     if (!token) {
//       localStorage.removeItem('mauzo_token');
//       return true;
//     }
//     try {
//       const decodedToken: { exp: number } = jwtDecode(token);
//       return decodedToken.exp < Date.now() / 1000;
//     } catch (error) {
//       console.error('Error decoding token:', error);
//       return true;
//     }
//   };

//   const handleChangeBusiness = (value: string,id:string) => {
//     if (value === 'add') {
//       setSelectBusiness(false)
//       addBusiness();
//     } else {
//       localStorage.setItem('business_id', id);
//       localStorage.setItem('mauzo_selected_business', value);
//       setSelectedBusiness(id);
//       window.location.reload();
//     }
//   };

//   const getCurrentBusiness = () => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem("mauzo_token");
//       const business_id = localStorage.getItem('business_id');
//       if (business_id && !loading && !isTokenExpired(token!)) {
//         const bizi = businesses.find((item: any) => item.id == business_id);
//         setSelected(bizi);
//       }
//     }
//   };

//   const signOut = () => {
//     const token = localStorage.getItem('mauzo_token');
//     if (token) {
//       localStorage.removeItem('mauzo_token');
//       location.reload();
//     }
//   };

//   const isSignLog = pathname === '/sign_log';
//   const isVerify = pathname === '/user/verify';
//   const isFullWidth = isSignLog || isVerify;

//   const navItems = [
//     { path: '/', icon: <House />, label: language==="Swahili"?"Mwanzo":'Home' },
//     { path: '/sales', icon: <SquareActivity />, label: language==="Swahili"?"Mauzo":'Sales' },
//     { path: '/products', icon: <Grape />, label: language==="Swahili"?"Bidhaa":'Products' },
//     // { path: '/ms_cats', icon: <MdCategory size={22} />, label: 'Measure Categories' },
//     // { path: '/measurements', icon: <FaBalanceScale size={20} />, label: 'Measurements' },
//     { path: '/attendants', icon: <GrUserAdmin size={20} />, label: language==="Swahili"?"Wauzaji":'Attendants' },
//     { path: '/expenses', icon: <LampDesk />, label: language==="Swahili"?"Matumizi":"Expenes" },
//     { path: '/clients', icon: <ShoppingBag />, label: language==="Swahili"?"Wateja":"Clients" },
//     { path: '/damages', icon: <BrushCleaning />, label: language==="Swahili"?"Uharibifu":"Damages" },
//     { path: '/business', icon: <BriefcaseBusiness />, label: language==="Swahili"?"Biashara Yangu":"My Business" },
//     { path: '/deleted', icon: <Trash />, label: language==="Swahili"?"Zilizo Futwa":"Deleted" },
//     { path: '/businesses', icon: <Volleyball />, label: language==="Swahili"?"Biashara Zangu":"My Businesses" },
//   ];

//   return (
//     <div className={styles.layout}>
//       <ErrorMessage />
      
//       <div className={cx(styles.container, { [styles.fullWidth]: isFullWidth })}>
//         {!isFullWidth && (
//           <>
//             <button 
//               className={styles.hamburger}
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             >
//               {isMobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
//             </button>
//             <motion.aside className={cx(styles.sidebar, { [styles.sidebarOpen]: isMobileMenuOpen })}
//               animate={{ width: showLabels ? 280 : 84 }}
//               transition={{ type: 'tween', duration: 0.25 }}
//             >
//               <div className={styles.sidebarHeader}>
//                 {showLabels ? (
//                   <h2 className={styles.logo}>Mauzo</h2>
//                 ) : (
//                   <div className={styles.logoMini} aria-label="Mauzo">M</div>
//                 )}
//               </div>
              
//               <nav className={styles.navigation}>
//                 <ul>
//                   {navItems.map((item) => (
//                     <li
//                       key={item.path}
//                       className={cx({ [styles.active]: pathname === item.path })}
//                       onClick={() => setIsMobileMenuOpen(false)}
//                     >
//                       <Link href={item.path} className={cx(styles.navLink, { [styles.compact]: !showLabels })}
//                         onMouseEnter={(e) => {
//                           const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//                           setHoveredNav({ label: item.label, x: rect.right + 10, y: rect.top + rect.height / 2 });
//                         }}
//                         onMouseLeave={() => setHoveredNav(null)}
//                       >
//                         <span className={styles.navIcon}>{item.icon}</span>
//                         <AnimatePresence initial={false}>
//                           {showLabels && (
//                             <motion.span key="label" className={styles.navLabel}
//                               initial={{ opacity: 0, x: -6 }}
//                               animate={{ opacity: 1, x: 0 }}
//                               exit={{ opacity: 0, x: -6 }}
//                             >{item.label}</motion.span>
//                           )}
//                         </AnimatePresence>
//                         {/* Local tooltip removed; using global fixed tooltip */}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               </nav>
//             </motion.aside>
//           </>
//         )}
//         <main className={cx(styles.content, { [styles.fullWidth]: isFullWidth })}>
//           {isAddBusiness && (
//             <div className={styles.modalOverlay}>
//               <div className={styles.modalContent}>
//                 <AddBusiness />
//               </div>
//             </div>
//           )}

//           {!isFullWidth && (
//             <header className={cx(styles.header, { [styles.scrolled]: isScrolled })}>
//               <motion.div className={styles.headerContent}
//                 initial={{ y: -12, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ duration: 0.25 }}
//               >
//                 <div className={styles.headerLeft}>
//                   <button
//                     onClick={() => setShowLabels(prev => !prev)}
//                     className={styles.sidebarToggleInHeader}
//                     aria-label="Toggle sidebar labels"
//                     title={showLabels ? 'Collapse sidebar' : 'Expand sidebar'}
//                   >
//                     <motion.span initial={false} animate={{ rotate: showLabels ? 0 : 180, scale: 1 }} transition={{ duration: 0.2 }}>
//                       {showLabels ? '⟨⟨' : '⟩⟩'}
//                     </motion.span>
//                   </button>
//                   <div
//                     className={styles.businessSelector}
//                     onClick={() => setSelectBusiness(!isSelectBusiness)}
//                   >
//                     <p>{!selectedBusiness ? "Select Business" : selectedBusiness}</p>
//                     <span className={styles.arrow}></span>
//                   </div>
//                 </div>
//                 <div className={styles.headerRight}>
//                   <div className={styles.userMenu}>
//                     <div className={styles.userGreeting}>
//                       <span className={styles.greeting}>{greeting}</span>
//                       <span className={styles.userName}>
//                         {typeof window !== "undefined" && !isTokenExpired(localStorage.getItem("mauzo_token")!)}
//                         {!userLoading && user.user.name}
//                       </span>
//                     </div>
//                     <div className={styles.avatar} style={{ backgroundImage: `url(./${language==="Swahili"?'tanzania.png':'usa.svg'})` }} onClick={()=> handleLanguage(language==="Swahili"?"English":"Swahili")} />
//                     <button
//                       onClick={() => setIsMenuOpen(!isMenuOpen)}
//                       className={cx(styles.menuToggle, { [styles.active]: isMenuOpen })}
//                       aria-haspopup="menu"
//                       aria-expanded={isMenuOpen}
//                     >
//                       <IoChevronDown size={18} />
//                     </button>
//                     <AnimatePresence>
//                       {isMenuOpen && (
//                         <motion.div className={styles.dropdownMenu} role="menu"
//                           initial={{ opacity: 0, y: -6 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -6 }}
//                         >
//                           <ul>
//                             <li>
//                               <IoSettingsOutline size={18} />
//                               <span>Settings</span>
//                             </li>
//                             <li onClick={signOut}>
//                               <FiLogOut size={18} />
//                               <span>Sign Out</span>
//                             </li>
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
//             {
//               isSelectBusiness && <div className={styles.businessSelection}>
//                 <div className={styles.container}>
//                   <div className={styles.close} onClick={()=> setSelectBusiness(!isSelectBusiness)}>close</div>
//                   <div className={styles.selections}>
//                     <h3 className={styles.title}>Select Business</h3>
//                     {!loading && (
//                       <div className={styles.list}>
//                         {businesses?.map((item: any, index: number) => (
//                           <label key={index} className={styles.option}>
//                             <input 
//                             type="radio" 
//                             name="business" 
//                             checked={selectedBusiness == item.id}
//                             value={item.id} onChange={e => handleChangeBusiness(item.name,item.id)}/>
//                             <span>{item.name}</span>
//                           </label>
//                         ))}
//                         <label className={`${styles.option} ${styles.addOption}`}>
//                           <input type="radio" name="business" value="add"  onChange={e => handleChangeBusiness('add','0')}/>
//                           <span>{language==="Swahili"?"Ongeza Biashara":"Add Business"}</span>
//                         </label>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             }
//             {children}
//           </div>
//         </main>
//       </div>
//       <AnimatePresence>
//         {!showLabels && hoveredNav && (
//           <motion.div className={styles.globalTooltip}
//             style={{ top: hoveredNav.y, left: hoveredNav.x }}
//             initial={{ opacity: 0, x: -6 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -6 }}
//             transition={{ duration: 0.18 }}
//           >
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
import React, { useEffect, useState } from 'react';
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
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredNav, setHoveredNav] = useState<{ label: string; x: number; y: number } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAddBusiness, addBusiness } = useIsAddBusinessStore();
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [greeting, setGreeting] = useState('');
  const { setSelected } = useSelectedBusinessStore();
  const { language, setLanguage } = useLanguageStore();
  const [isSelectBusiness, setSelectBusiness] = useState(false);

  // Fetch
  const { data: businesses, loading: bizLoading } = useFetch('http://62.169.30.105:5000/business/get_user_businesses', {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
  });

  const { data: user, loading: userLoading } = useFetch('http://62.169.30.105:5000/users/get_current_user', {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
  });

  const loading = bizLoading || userLoading;

  // === Subscription Expired Check ===
  const isSubscriptionExpired = () => {
    if (!user?.subscription?.lastPaid || !user?.user?.createdAt) return false;
    const lastPaid = new Date(user.subscription.lastPaid);
    const createdAt = new Date(user.user.createdAt);
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / oneDay;
    const daysUntilExpiry = (lastPaid.getTime() - now.getTime()) / oneDay;

    if (daysSinceCreation <= 7) return false; // Still in trial
    return daysUntilExpiry < 1; // Expired
  };

  // Token expired?
  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : null;

  // === AUTH & REDIRECT LOGIC (This is the key part you wanted back) ===
  useEffect(() => {
    if (loading) return;

    const tokenValid = token && !isTokenExpired(token);

    // 1. No token or expired → go to login
    if (!tokenValid) {
      if (pathname !== '/sign_log') {
        router.replace('/sign_log');
      }
      return;
    }

    // 2. Not verified → force verify
    if (user?.user?.status === 'inactive') {
      if (pathname !== '/user/verify') {
        router.replace('/user/verify');
      }
      return;
    }

    // 3. Subscription expired → force /subscription
    if (isSubscriptionExpired()) {
      if (pathname !== '/subscription') {
        router.replace('/subscription');
      }
      return;
    }

    // 4. All good → restrict to allowed pages only
    const allowed = ['/', '/sales', '/products', '/attendants', '/clients', '/expenses', '/damages', '/business', '/deleted', '/businesses','/business-reports'];
    if (!allowed.includes(pathname)) {
      router.replace('/');
    }
  }, [loading, user, token, pathname, router]);

  // Setup after auth
  useEffect(() => {
    if (!loading && user) {
      setGreeting(getGreeting());
      getCurrentBusiness();
      getLanguage();
    }
  }, [loading, user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLanguage = () => {
    const lang = localStorage.getItem('language') || 'Swahili';
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
    window.location.reload();
  };

  // Full-screen pages (no layout)
  const fullScreenPages = ['/sign_log', '/user/verify', '/subscription'];
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
            <button className={styles.hamburger} onClick={() => setIsMobileMenuOpen(v => !v)}>
              {isMobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>

            <motion.aside
              className={cx(styles.sidebar, { [styles.sidebarOpen]: isMobileMenuOpen })}
              animate={{ width: showLabels ? 280 : 84 }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className={styles.sidebarHeader}>
                {showLabels ? <h2 className={styles.logo}>Mauzo</h2> : <div className={styles.logoMini}>M</div>}
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
                  <button onClick={() => setShowLabels(v => !v)} className={styles.sidebarToggleInHeader}>
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
                      <span className={styles.userName}>{user?.user?.name}</span>
                    </div>
                    <div
                      className={styles.avatar}
                      style={{ backgroundImage: `url(${language === "Swahili" ? './tanzania.png' : './usa.svg'})` }}
                      onClick={() => setLanguage(language === "Swahili" ? "English" : "Swahili")}
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