"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./verify.module.scss";
import useSendRequest from "@/utils/useSendRequest";

export default function VerifyPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { sendRequest, loading } = useSendRequest({
    url: "http://62.169.30.105:5000/otp/verify_otp",
    params: {},
    body: { email: "leebabou@gmail.com", code: otp.join("") },
    method: "POST"
  });
  const { sendRequest: resend, loading: resendLoading } = useSendRequest({
    url: "http://62.169.30.105:5000/otp/send_otp",
    params: {},
    body: { recipient: "leebabou@gmail.com" },
    method: "POST"
  });

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    let value = element.value.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = value.charAt(value.length - 1) || "";
    setOtp(newOtp);

    // Focus next input if a digit was entered
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    // Auto submit when all digits are filled
    if (otp.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [otp]);

  const handleSubmit = () => {
    const code = otp.join("");
    sendRequest();
  };

  const handleResend = () => {
    resend()
    // Reset timer and disable resend button
    // setTimeLeft(300);
    // setIsResendDisabled(true);
    // // Add your resend logic here
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>OTP Verification</h2>
        <p>Please enter the 6-digit code sent to your email or phone.</p>
        <div className={styles.inputs}>
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              disabled={loading}
            />
          ))}
        </div>
        
        <div className={styles.timer}>
        <p>
          Time remaining: <span style={{color:"#6e8efb",fontWeight:"600"}}>{formatTime(timeLeft)}</span>
        </p>
        </div>
        
        <button 
          onClick={handleResend} 
          disabled={isResendDisabled || loading}
          className={styles.resendButton}
        >
          Resend OTP
        </button>
        
        {loading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner}></div>
            Verifying...
          </div>
        )}
      </div>
    </div>
  );
}