"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import { motion } from "framer-motion";

type MonthlyData = {
  month: string; // "2025-12"
  total_orders: number | string;
  total_revenue: number | string;
  total_cost: number | string;
  profit: number | string;
};

type Props = {
  data: MonthlyData[];
  language?: "English" | "Swahili";
};

type Metric = "total_orders" | "total_revenue" | "profit";

const MonthlySalesBarChart: React.FC<Props> = ({ data, language = "English" }) => {
  const [selectedMetric, setSelectedMetric] = useState<Metric>("total_revenue");

  if (!data || data.length === 0) {
    return (
      <div className={styles.noData}>
        <p>{language === "Swahili" ? "Hakuna data" : "No data available"}</p>
      </div>
    );
  }

  const toNum = (val: any): number => {
    const n = parseFloat(val as string);
    return isNaN(n) ? 0 : n;
  };

  // Extract values for the selected metric
  const values = data.map((m) => toNum(m[selectedMetric]));
  const maxValue = Math.max(...values, 1);

  // Format month
  const formatMonth = (month: string) => {
    const [year, m] = month.split("-");
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsSw = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"];
    const list = language === "Swahili" ? monthsSw : monthsEn;
    return `${list[parseInt(m) - 1]} ${year.slice(-2)}`;
  };

  const formatValue = (amount: number) => {
    return selectedMetric === "total_orders" ? amount.toLocaleString("en-US") : amount.toLocaleString("en-US");
  };

  const getMetricLabel = (metric: Metric) => {
    if (language === "Swahili") {
      return metric === "total_orders" ? "Jumla ya Mauzo" : metric === "total_revenue" ? "Mapato" : "Faida";
    }
    return metric === "total_orders" ? "Total Orders" : metric === "total_revenue" ? "Revenue" : "Profit";
  };

  const getBarColor = (metric: Metric) => {
    return metric === "total_orders" ? "#3b82f6" : metric === "total_revenue" ? "#10b981" : "#f59e0b";
  };

  return (
    <div className={styles.graphContainer}>
      {/* Title */}
      <h2 className={styles.chartTitle}>
        {language === "Swahili" ? "Mwelekeo wa Mauzo ya Kila Mwezi" : "Monthly Sales Trend"}
      </h2>

      {/* Filters */}
      <div className={styles.filters}>
        {(["total_orders", "total_revenue", "profit"] as Metric[]).map((metric) => (
          <motion.button
            key={metric}
            className={`${styles.filterBtn} ${selectedMetric === metric ? styles.active : ""}`}
            onClick={() => setSelectedMetric(metric)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getMetricLabel(metric)}
          </motion.button>
        ))}
      </div>

      <div className={styles.graphArea}>
        {/* Y-Axis */}
        <div className={styles.yAxis}>
          {[5, 4, 3, 2, 1, 0].map((i) => {
            const value = ((maxValue / 5) * i).toFixed(0);
            return (
              <span key={i} className={styles.yLabel}>
                {formatValue(Number(value))}
              </span>
            );
          })}
        </div>

        {/* Horizontal Scrollable Bars */}
        <div className={styles.scrollArea}>
          <div className={styles.barRow}>
            {data.map((month, i) => {
              const value = toNum(month[selectedMetric]);
              const barHeight = Math.max((value / maxValue) * 300, 20); // Increased max height to 300px, min 20px for visibility

              return (
                <motion.div
                  key={month.month}
                  className={styles.barGroup}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {/* Top Label: Value */}
                  <div className={styles.labelTop}>
                    {formatValue(value)}
                  </div>

                  {/* Single Bar for selected metric */}
                  <div className={styles.bars}>
                    <motion.div
                      className={styles.metricBar}
                      style={{
                        height: `${barHeight}px`,
                        background: `linear-gradient(to top, ${getBarColor(selectedMetric)}aa, ${getBarColor(selectedMetric)})`,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}px` }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      whileHover={{ scaleY: 1.05 }}
                      title={`${getMetricLabel(selectedMetric)}: ${formatValue(value)}`}
                    />
                  </div>

                  {/* Month Label */}
                  <div className={styles.monthLabel}>{formatMonth(month.month)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend (for current metric) */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.colorBox} style={{ backgroundColor: getBarColor(selectedMetric) }}></span>
          <span>{getMetricLabel(selectedMetric)}</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesBarChart;