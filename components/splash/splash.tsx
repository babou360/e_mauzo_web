"use client";
import React from "react";
import styles from "./splash.module.scss";

export default function SplashScreen() {
  return (
    <div className={styles.splash}>
      <div className={styles.logo}>
        <img src="/white.png" alt="" />
      </div>
      <div className={styles.poweredBy}>
        <span>Powered By</span>
        <strong>Swahilicodes</strong>
      </div>
    </div>
  );
}