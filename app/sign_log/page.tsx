'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './sign_log.module.scss'
import cx from 'classnames'
import useSendRequest from '@/utils/useSendRequest'
import {
  Mail,
  Phone,
  Lock,
  User,
  ShieldCheck,
  Gift,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Search,
  Check,
} from 'lucide-react'
import useErrorStore from '@/store/atoms/error'

const COUNTRIES = [
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
]

function SignLog() {
  const { error, setError, clearError } = useErrorStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email')

  const [language, setLanguage] = useState('English')

  const [countrySearch, setCountrySearch] = useState('')
  const [countryOpen, setCountryOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES[0]
  )

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agree: false,
  })

  useEffect(() => {
    const lang = localStorage.getItem('mauzo_language')

    if (lang) {
      setLanguage(lang)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCountryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(
      (item) =>
        item.country
          .toLowerCase()
          .includes(countrySearch.toLowerCase()) ||
        item.code.includes(countrySearch)
    )
  }, [countrySearch])

  const { sendRequest, loading } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/users/login`,
    params: {},
    body:
      loginMethod === 'email'
        ? {
            email: formData.email,
            password: formData.password,
            language,
          }
        : {
            email: `${selectedCountry.code}${formData.phone}`,
            password: formData.password,
            language,
          },
    method: 'POST',
  })

  const { sendRequest: signUp, loading: signLoading } =
    useSendRequest({
      url: `${process.env.NEXT_PUBLIC_HOST}/users/register`,
      params: {},
      body: {
        name: formData.name,
        email: formData.email,
        phone: `${selectedCountry.code}${formData.phone}`,
        role: 'user',
        password: formData.password,
        language,
        referral_code: formData.referralCode,
        verification_method: otpMethod,
      },
      method: 'POST',
    })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))

      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLogin) {
      if (!formData.agree) {
        setError({type:"error",message: "Please agree to Terms & Conditions"})
        setTimeout(()=> {
          clearError()
        },3000)
        return
      }else if (formData.password !== formData.confirmPassword) {
        setError({type:"error",message: "Passwords do not match"})
        setTimeout(()=> {
          clearError()
        },3000)
        return
      }

      signUp()
    } else {
      sendRequest()
    }
  }

  const CountryPicker = () => (
    <div className={styles.countryPicker} ref={dropdownRef}>
      <button
        type="button"
        className={styles.countryButton}
        onClick={() => setCountryOpen(!countryOpen)}
      >
        <span className={styles.countryButtonLeft}>
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
        </span>

        <ChevronDown
          size={18}
          className={cx(
            styles.chevron,
            countryOpen && styles.rotate
          )}
        />
      </button>

      {countryOpen && (
        <div className={styles.countryDropdown}>
          <div className={styles.searchCountry}>
            <Search size={16} />

            <input
              type="text"
              placeholder="Search country..."
              value={countrySearch}
              onChange={(e) =>
                setCountrySearch(e.target.value)
              }
            />
          </div>

          <div className={styles.countryList}>
            {filteredCountries.map((country, index) => (
              <button
                type="button"
                key={index}
                className={styles.countryItem}
                onClick={() => {
                  setSelectedCountry(country)
                  setCountryOpen(false)
                  setCountrySearch('')
                }}
              >
                <div className={styles.countryItemLeft}>
                  <span>{country.flag}</span>

                  <div>
                    <h4>{country.country}</h4>
                    <p>{country.code}</p>
                  </div>
                </div>

                {selectedCountry.code === country.code && (
                  <Check size={16} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className={styles.authContainer}>
      <div className={styles.leftSection}>
        <div className={styles.overlay}></div>

        {
          language==="Swahili"
          ?<div className={styles.brandContent}>
          <div className={styles.logoBadge}>
            <Sparkles size={20} />
            <span>Bazenga</span>
          </div>

          <h1>
            Usimamizi
            <br />
            Wa Biashara Janja
            <br />
            Huanza Hapa
          </h1>

          <p>
            Dhibiti biashara zako, fuatilia mauzo, simamia wafanyakazi, bidhaa zilizopo na shughuli zote kwa jukwaa moja la kisasa lililotengenezwa kwa ajili ya wajasiriamali wa kisasa.

          </p>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>10K+</h3>
              <span>Biashara</span>
            </div>

            <div className={styles.statCard}>
              <h3>24/7</h3>
              <span>Upatikanaji</span>
            </div>

            <div className={styles.statCard}>
              <h3>99.9%</h3>
              <span>Upatikanaji wa huduma</span>
            </div>
          </div>
        </div>
          :<div className={styles.brandContent}>
          <div className={styles.logoBadge}>
            <Sparkles size={20} />
            <span>Bazenga</span>
          </div>

          <h1>
            Smart Business
            <br />
            Management
            <br />
            Starts Here
          </h1>

          <p>
            Control your businesses, monitor sales,
            manage workers, inventory and operations
            with one premium platform designed for
            modern entrepreneurs.
          </p>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>10K+</h3>
              <span>Businesses</span>
            </div>

            <div className={styles.statCard}>
              <h3>24/7</h3>
              <span>Access</span>
            </div>

            <div className={styles.statCard}>
              <h3>99.9%</h3>
              <span>Uptime</span>
            </div>
          </div>
        </div>
        }
      </div>

      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.logo}>
            <div className={styles.inside_logo}>
              <img src="/white.png" alt="" />
            </div>
          </div>
          <div className={styles.topTabs}>
            <button
              className={cx(
                styles.tabButton,
                isLogin && styles.activeTab
              )}
              onClick={() => setIsLogin(true)}
            >
              {
                language==="Swahili"
                ?"Ingia"
                :"Login"
              }
            </button>

            <button
              className={cx(
                styles.tabButton,
                !isLogin && styles.activeTab
              )}
              onClick={() => setIsLogin(false)}
            >
              {
                language==="Swahili"
                ?"Jisajili"
                :"Sign Up"
              }
            </button>
          </div>

          <div className={styles.formHeader}>
            <h2>
              {isLogin
                ? (language === "Swahili"
                    ? "Karibu Tena 👋"
                    : "Welcome Back 👋")
                : (language === "Swahili"
                    ? "Fungua Akaunti ✨"
                    : "Create Account ✨")}
            </h2>

            <p>
              {isLogin
                ? (language === "Swahili"
                    ? "Ingia ili uendelee kusimamia biashara yako"
                    : "Login to continue managing your business")
                : (language === "Swahili"
                    ? "Fungua akaunti yako na uanze"
                    : "Create your account and get started")}
            </p>
          </div>

          <form
            className={styles.authForm}
            onSubmit={handleSubmit}
          >
            {!isLogin && (
              <>
                <div className={styles.inputWrapper}>
                  <label>
                    {language === "Swahili" ? "Jina Kamili" : "Full Name"}
                  </label>

                  <div className={styles.inputBox}>
                    <User size={18} />

                    <input
                      type="text"
                      name="name"
                      placeholder={language==="Swahili"?"Ingiza Jina Lako":"Enter your full name"}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputWrapper}>
                  <label>
                    {language === "Swahili" ? "Barua Pepe" : "Email Address"}
                  </label>

                  <div className={styles.inputBox}>
                    <Mail size={18} />

                    <input
                      type="email"
                      name="email"
                      placeholder={language==="Swahili"?"Ingiza Barua Pepe":"Enter your email"}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputWrapper}>
                  <label>{language==="Swahili"?"Namba ya Simu":"Phone Number"}</label>

                  <div className={styles.phoneGroup}>
                    <CountryPicker />

                    <div className={styles.inputBox}>
                      <Phone size={18} />

                      <input
                        type="tel"
                        name="phone"
                        placeholder="712345678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.inputWrapper}>
                  <label>{language==="Swahili"?"Njia ya Uthibitisho":"Verification Method"}</label>

                  <div className={styles.selectionGrid}>
                    <button
                      type="button"
                      className={cx(
                        styles.selectButton,
                        otpMethod === 'email' &&
                          styles.selected
                      )}
                      onClick={() =>
                        setOtpMethod('email')
                      }
                    >
                      <Mail size={18} />
                      {language==="Swahili"?"Barua Pepe":"Email"}
                    </button>

                    <button
                      type="button"
                      className={cx(
                        styles.selectButton,
                        otpMethod === 'phone' &&
                          styles.selected
                      )}
                      onClick={() =>
                        setOtpMethod('phone')
                      }
                    >
                      <Phone size={18} />
                      {language==="Swahili"?"Simu":"Phone"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <div className={styles.inputWrapper}>
                <label>{language==="Swahili"?"Njia ya Kuingia":"Login Method"}</label>

                <div className={styles.selectionGrid}>
                  <button
                    type="button"
                    className={cx(
                      styles.selectButton,
                      loginMethod === 'email' &&
                        styles.selected
                    )}
                    onClick={() =>
                      setLoginMethod('email')
                    }
                  >
                    <Mail size={18} />
                    {language==="Swahili"?"Barua Pepe":"Email"}
                  </button>

                  <button
                    type="button"
                    className={cx(
                      styles.selectButton,
                      loginMethod === 'phone' &&
                        styles.selected
                    )}
                    onClick={() =>
                      setLoginMethod('phone')
                    }
                  >
                    <Phone size={18} />
                    {language==="Swahili"?"Simu":"Phone"}
                  </button>
                </div>
              </div>
            )}

            {isLogin ? (
              loginMethod === 'email' ? (
                <div className={styles.inputWrapper}>
                  <label>{language==="Swahili"?"Barua Pepe":"Email"}</label>

                  <div className={styles.inputBox}>
                    <Mail size={18} />

                    <input
                      type="email"
                      name="email"
                      placeholder={language==="Swahili"?"Ingiza Barua pepe":"Enter your email"}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.inputWrapper}>
                  <label>{language==="Swahili"?"Simu":"Phone Number"}</label>

                  <div className={styles.phoneGroup}>
                    <CountryPicker />

                    <div className={styles.inputBox}>
                      <Phone size={18} />

                      <input
                        type="tel"
                        name="phone"
                        placeholder="712345678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className={styles.inputWrapper}>
                <label>
                  {language==="Swahili"?"Msimbo wa Rufaa(sio lazima)":"Referral Code (Optional)"}
                </label>

                <div className={styles.inputBox}>
                  <Gift size={18} />

                  <input
                    type="text"
                    name="referralCode"
                    placeholder={language==="Swahili"?"Ingiza Msimbo wa Rufaa":"Enter referral code"}
                    value={formData.referralCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className={styles.inputWrapper}>
              <label>{language==="Swahili"?"Neno la siri":"Password"}</label>

              <div className={styles.inputBox}>
                <Lock size={18} />

                <input
                  type="password"
                  name="password"
                  placeholder={language==="Swahili"?"Ingiza Neno la siri":"Enter Password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className={styles.inputWrapper}>
                <label>{language==="Swahili"?"Thibitisha Neno la siri":"Confirm Password"}</label>

                <div className={styles.inputBox}>
                  <ShieldCheck size={18} />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder={language==="Swahili"?"Thibitisha Neno la siri":"Confirm Password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <label className={styles.terms}>
                <input
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleInputChange}
                />

                <span>
                  {
                    language==="Swahili"
                    ?"Nakubaliana na "
                    :"I agree to the"
                  }
                  <a href="/terms-and-conditions">
                  {
                    language==="Swahili"
                    ?"Vigezo na Masharti"
                    :"Terms & Conditions"
                  }
                  </a>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                signLoading ||
                (!isLogin && !formData.agree)
              }
              className={cx(
                styles.submitButton,
                (loading || signLoading) &&
                  styles.disabled
              )}
            >
              {isLogin
                ? loading
                  ? `${language==="Swahili"?"ina ingia...":"Login..."}`
                  : `${language==="Swahili"?"Ingia":"Login"}`
                : signLoading
                ? `${language==="Swahili"?"Una jisajili...":"Creating Account..."}`
                : `${language==="Swahili"?"Jisajili":"Create Account"}`}

              <ArrowRight size={18} />
            </button>
          </form>

          <div className={styles.bottomText}>
            {isLogin
              ? `${language==="Swahili"?"Hauja Jisajili?":"Don't have an account?"}`
              :`${language==="Swahili"?"Tayari umejisajili?":"Already have an account?"}`
            }
            <button
              onClick={() =>
                setIsLogin(!isLogin)
              }
            >
              {isLogin ?`${language==="Swahili"?"Jisajili":"Sign Up"}`: `${language==="Swahili"?"Ingia":"Login"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignLog