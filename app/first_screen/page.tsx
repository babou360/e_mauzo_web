'use client'
import useLanguageStore from '@/store/atoms/language'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, SkipForward, Globe, Check, Star, TrendingUp, Package, Users, BarChart3, ShoppingCart } from 'lucide-react'
import styles from './language.module.scss'

function FirstScreen() {
  const { language, setLanguage } = useLanguageStore()
  const [isLanguageSelected, setIsLanguageSelected] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const slides = [
    {
      id: 1,
      swahili: 'Usimamizi Bora wa Bidhaa',
      english: 'Smart Stock Management',
      swahili_description: 'Dhibiti bidhaa zako kwa urahisi na kuepuka upungufu au ziada ya bidhaa',
      english_description: 'Control your inventory effortlessly and avoid stockouts or overstocking',
      image: '📦',
      icon: Package,
      color: '#6366f1'
    },
    {
      id: 2,
      swahili: 'Ripoti za Kina',
      english: 'Advanced Analytics',
      swahili_description: 'Fuatilia mauzo yako, mapato na mwenendo wa biashara kwa muda halisi',
      english_description: 'Track your sales, revenue, and business trends in real-time',
      image: '📊',
      icon: BarChart3,
      color: '#ec4899'
    },
    {
      id: 3,
      swahili: 'Wateja na Wauzaji',
      english: 'Customers & Staff',
      swahili_description: 'Dhibiti wateja wako na wafanyakazi kwa mfumo mmoja rahisi',
      english_description: 'Manage your customers and employees in one simple system',
      image: '👥',
      icon: Users,
      color: '#06b6d4'
    },
    {
      id: 4,
      swahili: 'Mauzo ya Haraka',
      english: 'Fast Checkout',
      swahili_description: 'Kamilisha mauzo kwa sekunde chache na ongeza tija yako',
      english_description: 'Complete sales in seconds and boost your productivity',
      image: '🛒',
      icon: ShoppingCart,
      color: '#f59e0b'
    },
    {
      id: 5,
      swahili: 'Kukua na Mauzo',
      english: 'Grow with Mauzo',
      swahili_description: 'Jiunge na maelfu ya wafanyabiashara wanaokua na biashara zao',
      english_description: 'Join thousands of merchants growing their businesses',
      image: '🚀',
      icon: TrendingUp,
      color: '#10b981'
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
    const timer = setInterval(() => {
      if (isLanguageSelected) {
        nextSlide()
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [isLanguageSelected, currentSlide])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }

  const CurrentIcon = slides[currentSlide].icon

  // Language Selection UI
  if (!isLanguageSelected) {
    return (
      <div className={styles.firstScreen}>
        <div className={styles.backgroundOverlay} />
        <div className={styles.languageContainer}>
          <motion.div 
            className={styles.languageCard}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <div className={styles.logoSection}>
              <div className={styles.logoIcon}>
                <img src="/white.png" alt="" />
              </div>
              <h1 className={styles.logoText}>Bazenga</h1>
              <p className={styles.tagline}>
                {language === 'Swahili' 
                  ? 'Teknolojia ya kisasa kwa biashara yako' 
                  : 'Modern technology for your business'}
              </p>
            </div>

            <div className={styles.languageOptions}>
              <motion.button
                className={styles.languageBtn}
                onClick={() => handleLanguageSelect('English')}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.flagIcon}>🇺🇸</div>
                <div className={styles.languageInfo}>
                  <span className={styles.languageName}>English</span>
                  <span className={styles.languageSub}>International</span>
                </div>
                <Check className={styles.checkIcon} />
              </motion.button>

              <motion.button
                className={styles.languageBtn}
                onClick={() => handleLanguageSelect('Swahili')}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.flagIcon}>🇹🇿</div>
                <div className={styles.languageInfo}>
                  <span className={styles.languageName}>Kiswahili</span>
                  <span className={styles.languageSub}>Tanzania, Kenya, Uganda</span>
                </div>
                <Check className={styles.checkIcon} />
              </motion.button>
            </div>

            <motion.div 
              className={styles.footerNote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Globe size={16} />
              <span>Choose your preferred language</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Slider UI
  return (
    <div className={styles.firstScreen}>
      <div className={styles.backgroundOverlay} />
      <div className={styles.sliderContainer}>
        <motion.button 
          className={styles.skipBtn}
          onClick={skipSlides}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SkipForward size={18} />
          {language === 'Swahili' ? 'Ruka' : 'Skip'}
        </motion.button>

        <motion.button 
          className={styles.prevBtn}
          onClick={prevSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </motion.button>

        <motion.button 
          className={styles.nextBtn}
          onClick={nextSlide}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={24} />
        </motion.button>

        <div className={styles.sliderContent}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
              className={styles.slide}
            >
              <div className={styles.slideInner}>
                <motion.div 
                  className={styles.iconWrapper}
                  style={{ backgroundColor: slides[currentSlide].color + '20' }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                >
                  <CurrentIcon size={64} style={{ color: slides[currentSlide].color }} />
                </motion.div>
                
                <motion.h2 
                  className={styles.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {language === 'Swahili' ? slides[currentSlide].swahili : slides[currentSlide].english}
                </motion.h2>
                
                <motion.p 
                  className={styles.description}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {language === 'Swahili' ? slides[currentSlide].swahili_description : slides[currentSlide].english_description}
                </motion.p>

                <motion.div 
                  className={styles.slideIndicator}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                />
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
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
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
          transition={{ delay: 0.5 }}
        >
          {language === 'Swahili' ? 'Anza Sasa' : 'Get Started'}
        </motion.button>
      </div>
    </div>
  )
}

export default FirstScreen