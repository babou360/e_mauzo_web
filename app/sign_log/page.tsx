'use client'
import React, { useEffect, useState } from 'react'
import styles from './sign_log.module.scss'
import cx from 'classnames'
import useSendRequest from '@/utils/useSendRequest'

function SignLog() {
  const [isSign, setSign] = useState(true)
  const [currentIndex, setIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const scrolls = [
    {
      id: 1,
      title: "Simplify Work, Amplify Growth",
      description: "Manage your business with ease—track sales, workers, and inventory in one place",
      image: "/01.svg"
    },
    {
      id: 2,
      title: "Every Business, One System",
      description: "From shops to restaurants, run all your businesses under one smart, user-friendly platform.",
      image: "/02.svg"
    },
    {
      id: 3,
      title: "Local Power, Digital Control",
      description: "Empower everyday business owners with tools to grow, stay organized, and serve better.",
      image: "/03.svg"
    },
  ]
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const { sendRequest, loading } = useSendRequest({
    url: "http://62.169.30.105:5000/users/login",
    params: {},
    body: { email: formData.email, password: formData.password,phone: formData.phone },
    method: "POST"
  })
  const { sendRequest: signUp, loading: signLoading } = useSendRequest({
    url: "http://62.169.30.105:5000/users/register",
    params: {},
    body: { name: formData.name,phone: formData.phone,email: formData.email,role: 'user',password: formData.password,language:"English"},
    method: "POST"
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setIndex(prevIndex => (prevIndex + 1) % scrolls.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSign) {
      sendRequest()
    } else {
      signUp()
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.heroSection}>
        <div className={cx(styles.contentWrapper, { [styles.fadeOut]: isAnimating })}>
          <div className={styles.textContent}>
            <h1 className={styles.heroTitle}>{scrolls[currentIndex].title}</h1>
            <p className={styles.heroDescription}>{scrolls[currentIndex].description}</p>
          </div>
          <div className={styles.illustration}>
            <img 
              src={scrolls[currentIndex].image} 
              alt={scrolls[currentIndex].title} 
              className={styles.heroImage}
            />
          </div>
          <div className={styles.indicators}>
            {scrolls.map((_, index) => (
              <button
                key={index}
                className={cx(styles.indicator, { [styles.active]: currentIndex === index })}
                onClick={() => setIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.authFormSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>{isSign ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isSign ? 'Sign in to continue' : 'Join us today'}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {!isSign && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.inputLabel}>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.inputLabel}>Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.inputLabel}>Email/Phone</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="email/phone"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputLabel}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {!isSign && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            )}

            {isSign && (
              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgotPassword}>Forgot password?</a>
              </div>
            )}
            <button type="submit" className={cx(styles.submitButton,(loading || signLoading) && styles.disabled)} disabled={loading}>
              {isSign ? loading?'loading..':'Sign In' : signLoading?'loading..':'Sign Up'}
            </button>

            {isSign && (
              <div className={styles.socialAuth}>
                <p className={styles.socialDivider}>or continue with</p>
                <div className={styles.socialButtons}>
                  <button type="button" className={cx(styles.socialButton, styles.google)}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" className={cx(styles.socialButton, styles.apple)}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000"/>
                    </svg>
                    Apple
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className={styles.authToggle}>
            {isSign ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setSign(!isSign)} 
              className={styles.toggleButton}
            >
              {isSign ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignLog