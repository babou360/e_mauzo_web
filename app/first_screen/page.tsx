// language.module.tsx
'use client'
import useLanguageStore from '@/store/atoms/language'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipForward, 
  Check, 
  Star, 
  TrendingUp, 
  Package, 
  Users, 
  BarChart3, 
  ShoppingCart,
  Sparkles,
  Shield,
  Zap,
  Crown,
  Globe
} from 'lucide-react'
import styles from './language.module.scss'

export const metadata = {
  title: "First-Screen",
  description: "Browse all about first screen information",
};

function FirstScreen() {
  const { language, setLanguage } = useLanguageStore()
  const [isLanguageSelected, setIsLanguageSelected] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const slides = [
    {
      id: 1,
      swahili: 'Usimamizi Bora wa Bidhaa',
      english: 'Smart Stock Management',
      swahili_description: 'Dhibiti bidhaa zako kwa urahisi na kuepuka upungufu au ziada ya bidhaa',
      english_description: 'Control your inventory effortlessly and avoid stockouts or overstocking',
      icon: Package,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.12)'
    },
    {
      id: 2,
      swahili: 'Ripoti za Kina',
      english: 'Advanced Analytics',
      swahili_description: 'Fuatilia mauzo yako, mapato na mwenendo wa biashara kwa muda halisi',
      english_description: 'Track your sales, revenue, and business trends in real-time',
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#f5576c',
      bgColor: 'rgba(245, 87, 108, 0.12)'
    },
    {
      id: 3,
      swahili: 'Wateja na Wauzaji',
      english: 'Customers & Staff',
      swahili_description: 'Dhibiti wateja wako na wafanyakazi kwa mfumo mmoja rahisi',
      english_description: 'Manage your customers and employees in one simple system',
      icon: Users,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: '#4facfe',
      bgColor: 'rgba(79, 172, 254, 0.12)'
    },
    {
      id: 4,
      swahili: 'Mauzo ya Haraka',
      english: 'Fast Checkout',
      swahili_description: 'Kamilisha mauzo kwa sekunde chache na ongeza tija yako',
      english_description: 'Complete sales in seconds and boost your productivity',
      icon: ShoppingCart,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      color: '#fa709a',
      bgColor: 'rgba(250, 112, 154, 0.12)'
    },
    {
      id: 5,
      swahili: 'Kukua na Mauzo',
      english: 'Grow with Mauzo',
      swahili_description: 'Jiunge na maelfu ya wafanyabiashara wanaokua na biashara zao',
      english_description: 'Join thousands of merchants growing their businesses',
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      color: '#43e97b',
      bgColor: 'rgba(67, 233, 123, 0.12)'
    }
  ]

  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const skipSlides = () => {
    window.location.href = '/sign_log'
  }

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('mauzo_language', lang)
    localStorage.setItem('bazenga_token', "bazenga_token")
    setTimeout(() => {
      setIsLanguageSelected(true)
    }, 500)
  }

  useEffect(() => {
    if (isLanguageSelected && !isHovering) {
      const timer = setInterval(() => {
        nextSlide()
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [isLanguageSelected, currentSlide, isHovering])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8
    })
  }

  const CurrentIcon = slides[currentSlide].icon

  // Language Selection UI
  if (!isLanguageSelected) {
    return (
      <div className={styles.firstScreen}>
        <div className={styles.backgroundOverlay}>
          <div className={styles.glowOrb1} />
          <div className={styles.glowOrb2} />
          <div className={styles.glowOrb3} />
        </div>
        
        <div className={styles.floatingShapes}>
          <div className={styles.shape1} />
          <div className={styles.shape2} />
          <div className={styles.shape3} />
          <div className={styles.shape4} />
        </div>

        <div className={styles.languageContainer}>
          <motion.div 
            className={styles.languageCard}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              type: 'spring',
              stiffness: 100,
              damping: 20
            }}
          >
            <div className={styles.cardGlow} />
            
            <div className={styles.logoSection}>
              <motion.div 
                className={styles.logoWrapper}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.8, 
                  type: 'spring',
                  stiffness: 150,
                  delay: 0.2
                }}
              >
                <div className={styles.logoIcon}>
                  <img src="/white.png" alt="Bazenga" />
                </div>
                <div className={styles.logoBadge}>
                  <Sparkles size={12} />
                  <span>Premium</span>
                </div>
              </motion.div>

              <motion.h1 
                className={styles.logoText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Bazenga
              </motion.h1>
              
              <motion.p 
                className={styles.tagline}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {language === 'Swahili' 
                  ? 'Teknolojia ya kisasa kwa biashara yako' 
                  : 'Modern technology for your business'}
              </motion.p>
            </div>

            <div className={styles.divider} />

            <motion.div 
              className={styles.languageOptions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                className={styles.languageBtn}
                onClick={() => handleLanguageSelect('English')}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={styles.btnGlow} />
                <div className={styles.flagIcon}>🇺🇸</div>
                <div className={styles.languageInfo}>
                  <span className={styles.languageName}>English</span>
                  <span className={styles.languageSub}>International</span>
                </div>
                <div className={styles.checkWrapper}>
                  <Check className={styles.checkIcon} />
                </div>
              </motion.button>

              <motion.button
                className={styles.languageBtn}
                onClick={() => handleLanguageSelect('Swahili')}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={styles.btnGlow} />
                <div className={styles.flagIcon}>🇹🇿</div>
                <div className={styles.languageInfo}>
                  <span className={styles.languageName}>Kiswahili</span>
                  <span className={styles.languageSub}>Tanzania, Kenya, Uganda</span>
                </div>
                <div className={styles.checkWrapper}>
                  <Check className={styles.checkIcon} />
                </div>
              </motion.button>
            </motion.div>

            <motion.div 
              className={styles.footerNote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className={styles.footerLine} />
              <div className={styles.footerContent}>
                <Globe size={14} />
                <span>Choose your preferred language</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Slider UI
  return (
    <div className={styles.firstScreen}>
      <div className={styles.backgroundOverlay}>
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.glowOrb3} />
      </div>

      <div className={styles.floatingShapes}>
        <div className={styles.shape1} />
        <div className={styles.shape2} />
        <div className={styles.shape3} />
        <div className={styles.shape4} />
      </div>

      <div 
        className={styles.sliderContainer}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsHovering(true)}
        onTouchEnd={() => setIsHovering(false)}
      >
        <motion.button 
          className={styles.skipBtn}
          onClick={skipSlides}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SkipForward size={16} />
          {language === 'Swahili' ? 'Ruka' : 'Skip'}
        </motion.button>

        <motion.button 
          className={styles.prevBtn}
          onClick={prevSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={20} />
        </motion.button>

        <motion.button 
          className={styles.nextBtn}
          onClick={nextSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={20} />
        </motion.button>

        <div className={styles.sliderContent}>
          <div className={styles.progressBar}>
            <motion.div 
              className={styles.progressFill}
              initial={{ width: '0%' }}
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                duration: 0.7, 
                type: 'spring',
                stiffness: 120,
                damping: 25
              }}
              className={styles.slide}
            >
              <div className={styles.slideInner}>
                <motion.div 
                  className={styles.iconWrapper}
                  style={{ 
                    background: slides[currentSlide].bgColor,
                    borderColor: slides[currentSlide].color
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    type: 'spring',
                    stiffness: 150,
                    delay: 0.1
                  }}
                >
                  <CurrentIcon 
                    size={48} 
                    style={{ 
                      color: slides[currentSlide].color,
                      strokeWidth: 1.5
                    }} 
                  />
                  <div className={styles.iconPulse} />
                </motion.div>
                
                <motion.div 
                  className={styles.slideNumber}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span>0{currentSlide + 1}</span>
                  <span>/</span>
                  <span>0{slides.length}</span>
                </motion.div>

                <motion.h2 
                  className={styles.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {language === 'Swahili' ? slides[currentSlide].swahili : slides[currentSlide].english}
                </motion.h2>
                
                <motion.p 
                  className={styles.description}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {language === 'Swahili' ? slides[currentSlide].swahili_description : slides[currentSlide].english_description}
                </motion.p>

                <motion.div 
                  className={styles.features}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className={styles.featureItem}>
                    <Shield size={14} />
                    <span>Secure</span>
                  </div>
                  <div className={styles.featureItem}>
                    <Zap size={14} />
                    <span>Fast</span>
                  </div>
                  <div className={styles.featureItem}>
                    <Crown size={14} />
                    <span>Premium</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.dots}>
            {slides.map((_, index) => (
              <motion.button
                key={index}
                className={`${styles.dot} ${currentSlide === index ? styles.activeDot : ''}`}
                onClick={() => {
                  setDirection(index > currentSlide ? 1 : -1)
                  setCurrentSlide(index)
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              >
                {currentSlide === index && (
                  <motion.div 
                    className={styles.dotPulse}
                    layoutId="dotPulse"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button 
          className={styles.getStartedBtn}
          onClick={skipSlides}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>{language === 'Swahili' ? 'Anza Sasa' : 'Get Started'}</span>
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  )
}

export default FirstScreen