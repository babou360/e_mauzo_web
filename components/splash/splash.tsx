"use client";
import React from "react";
import styles from "./splash.module.scss";

export default function SplashScreen() {
  return (
    <div className={styles.splash}>
      <div className={styles.logo}>
        <img src="/mauzo_logo.png" alt="" />
      </div>
    </div>
  );
}
