"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaRedoAlt,
} from "react-icons/fa";
import styles from "./verify.module.scss";
import useSendRequest from "@/utils/useSendRequest";
import useFetch from "@/utils/fetch";

export default function VerifyPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(120);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [language, setLanguage] = useState<"English" | "Swahili">(
    "English"
  );

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // 🌍 GET LANGUAGE
  useEffect(() => {
    const lang = localStorage.getItem("mauzo_language");

    if (lang === "Swahili") {
      setLanguage("Swahili");
    } else {
      setLanguage("English");
    }
  }, []);

  // 🌍 TRANSLATIONS
  const tr = (en: string, sw: string) => {
    return language === "Swahili" ? sw : en;
  };

  const { data: user, loading: userLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/users/get_current_user`, {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
  });
  // ✅ VERIFY OTP
  const { sendRequest, loading } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/otp/verify_otp`,
    params: {},
    body: {
      email: user?.user?.email,
      code: otp.join(""),
    },
    method: "POST",
  });

  // 📱 RESEND PHONE
  const {
    sendRequest: resendPhone,
    loading: resendPhoneLoading,
  } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/otp/send_otp`,
    params: {},
    body: {
      recipient: user?.user?.phone,
      method: 'phone',
      language: language
    },
    method: "POST",
  });

  // 📧 RESEND EMAIL
  const {
    sendRequest: resendEmail,
    loading: resendEmailLoading,
  } = useSendRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/otp/send_otp`,
    params: {},
    body: {
      recipient: user?.user?.email,
      method: "email",
      language: language
    },
    method: "POST",
  });

  // ⏱ TIMER
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // 🔢 OTP CHANGE
  const handleChange = (
    element: HTMLInputElement,
    index: number
  ) => {
    const value = element.value.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = value.charAt(value.length - 1) || "";

    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ⌫ BACKSPACE
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 🚀 AUTO SUBMIT
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [otp]);

  // ✅ SUBMIT
  const handleSubmit = () => {
    sendRequest();
  };

  // 📱 RESEND PHONE
  const handleResendPhone = () => {
    resendPhone();
    setTimeLeft(120);
    setIsResendDisabled(true);
  };

  // 📧 RESEND EMAIL
  const handleResendEmail = () => {
    resendEmail();
    setTimeLeft(120);
    setIsResendDisabled(true);
  };

  // ⏱ FORMAT TIME
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={styles.page}>
      {/* BACKGROUND DECOR */}
      <div className={styles.topGradient}></div>
      <div className={styles.bottomGradient}></div>

      <div className={styles.card}>
        {/* ICON */}
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>🔐</div>
        </div>

        {/* TITLE */}
        <h1>
          {tr(
            "OTP Verification",
            "Uthibitisho wa OTP"
          )}
        </h1>

        {/* SUBTITLE */}
        <p className={styles.subtitle}>
          {tr(
            "Enter the 6-digit verification code sent to your phone or email.",
            "Ingiza namba ya uthibitisho yenye tarakimu 6 iliyotumwa kwenye simu au barua pepe yako."
          )}
        </p>

        {/* OTP INPUTS */}
        <div className={styles.inputs}>
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={loading}
              onChange={(e) =>
                handleChange(e.target, index)
              }
              onKeyDown={(e) =>
                handleKeyDown(e, index)
              }
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
            />
          ))}
        </div>

        {/* TIMER */}
        <div className={styles.timer}>
          <span>
            {tr(
              "Time Remaining",
              "Muda Uliobaki"
            )}
          </span>

          <strong>{formatTime(timeLeft)}</strong>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          {/* PHONE BUTTON */}
          <button
            onClick={handleResendPhone}
            disabled={
              isResendDisabled ||
              loading ||
              resendPhoneLoading
            }
            className={styles.primaryBtn}
          >
            <FaRedoAlt />

            {tr(
              "Resend using Phone",
              "Tuma tena kupitia Simu"
            )}
          </button>

          {/* EMAIL BUTTON */}
          <button
            onClick={handleResendEmail}
            disabled={
              isResendDisabled ||
              loading ||
              resendEmailLoading
            }
            className={styles.secondaryBtn}
          >
            <FaEnvelope />

            {tr(
              "Resend using Email",
              "Tuma tena kupitia Barua Pepe"
            )}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>

            <span>
              {tr(
                "Verifying...",
                "Inathibitisha..."
              )}
            </span>
          </div>
        )}

        {/* DIVIDER */}
        <div className={styles.divider}></div>

        {/* SUPPORT */}
        <div className={styles.support}>
          <h3>
            {tr(
              "Need Help?",
              "Unahitaji Msaada?"
            )}
          </h3>

          <p>
            {tr(
              "Contact our support team directly.",
              "Wasiliana moja kwa moja na timu yetu ya msaada."
            )}
          </p>

          {/* ICONS */}
          <div className={styles.supportIcons}>
            <a href="tel:+255785008525">
              <FaPhoneAlt />
            </a>

            <a
              href="https://wa.me/255785008525"
              target="_blank"
            >
              <FaWhatsapp />
            </a>
          </div>

          <span>+255 785 008 525</span>
        </div>
      </div>
    </div>
  );
}