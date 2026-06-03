'use client';

import React, { useEffect, useState } from 'react';
import styles from './DailySalesGraph.module.scss';
import { 
  FaChartLine, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

type DailySale = {
  day: string;
  total_sales: number;
  total_revenue: number;
};

type Props = {
  dailySales: DailySale[];
  formatCurrency: (amount: any) => string;
  dayTrans: (day: string) => string;
};

const DailySalesGraph: React.FC<Props> = ({ dailySales, formatCurrency, dayTrans }) => {
  const [language, setLanguage] = useState<string>('English');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('mauzo_language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const maxSales = Math.max(...dailySales.map(d => d.total_sales), 1);
  const maxRevenue = Math.max(...dailySales.map(d => d.total_revenue), 1);
  const totalSales = dailySales.reduce((sum, d) => sum + d.total_sales, 0);
  const totalRevenue = dailySales.reduce((sum, d) => sum + d.total_revenue, 0);
  const dailyAverage = Math.ceil(totalSales / dailySales.length);
  
  // Calculate trend (comparing last 3 days with previous 3 days)
  const recentSales = dailySales.slice(-3).reduce((sum, d) => sum + d.total_sales, 0);
  const previousSales = dailySales.slice(-6, -3).reduce((sum, d) => sum + d.total_sales, 0);
  const trend = previousSales > 0 ? ((recentSales - previousSales) / previousSales) * 100 : 0;

  // Generate proper Y-axis ticks
  const generateYAxisTicks = (maxValue: number) => {
    const ticks = [];
    const step = Math.ceil(maxValue / 5);
    for (let i = 0; i <= 5; i++) {
      ticks.push(i * step);
    }
    return ticks.reverse();
  };

  const salesTicks = generateYAxisTicks(maxSales);
  const revenueTicks = generateYAxisTicks(maxRevenue);

  const translations = {
    title: language === "Swahili" ? "Mauzo Kwa Siku" : "Daily Sales Analysis",
    sales: language === "Swahili" ? "Mauzo" : "Sales",
    revenue: language === "Swahili" ? "Mapato" : "Revenue",
    totalSales: language === "Swahili" ? "Jumla ya Mauzo" : "Total Sales",
    totalRevenue: language === "Swahili" ? "Jumla ya Mapato" : "Total Revenue",
    dailyAverage: language === "Swahili" ? "Wastani wa Siku" : "Daily Average",
    units: language === "Swahili" ? "Vipande" : "Units",
    trend: language === "Swahili" ? "Mwenendo" : "Trend",
    vsLastWeek: language === "Swahili" ? "vs wiki iliyopita" : "vs last week",
    salesUnits: language === "Swahili" ? "Mauzo (Vipande)" : "Sales (Units)",
    revenueAmount: language === "Swahili" ? "Mapato (TSh)" : "Revenue (TSh)"
  };

  const getBarHeight = (value: number, max: number) => {
    return Math.max((value / max) * 280, 4);
  };

  return (
    <div className={styles.graphContainer}>
      {/* Decorative Background Elements */}
      <div className={styles.decorativeBlob1} />
      <div className={styles.decorativeBlob2} />
      <div className={styles.decorativeBlob3} />

      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FaChartLine className={styles.headerIcon} />
        </div>
        <h2 className={styles.title}>{translations.title}</h2>
        <div className={`${styles.trendBadge} ${trend >= 0 ? styles.positive : styles.negative}`}>
          {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span>{Math.abs(trend).toFixed(1)}% {translations.vsLastWeek}</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className={styles.chartContainer}>
        {/* Y-Axis for Sales */}
        <div className={styles.yAxisSection}>
          <div className={styles.yAxisLabel}>{translations.salesUnits}</div>
          <div className={styles.yAxis}>
            {salesTicks.map((tick, index) => (
              <div key={index} className={styles.yTick}>
                <span className={styles.yTickValue}>{tick.toLocaleString()}</span>
                <div className={styles.yTickLine} />
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className={styles.barChartWrapper}>
          <div className={styles.barChart}>
            {dailySales.map((day, index) => {
              const salesHeight = getBarHeight(day.total_sales, maxSales);
              const revenueHeight = getBarHeight(day.total_revenue, maxRevenue);
              const isHighestSale = day.total_sales === maxSales;
              const isHighestRevenue = day.total_revenue === maxRevenue;
              
              return (
                <div key={index} className={styles.barColumn}>
                  <div className={styles.barContainer}>
                    <div className={styles.bars}>
                      {/* Revenue Bar (back) */}
                      <div 
                        className={`${styles.revenueBar} ${isHighestRevenue ? styles.highest : ''}`}
                        style={{ height: `${revenueHeight}px` }}
                      >
                        <div className={styles.barTooltip}>
                          <span className={styles.tooltipLabel}>{translations.revenue}</span>
                          <span className={styles.tooltipValue}>{formatCurrency(day.total_revenue)}</span>
                        </div>
                      </div>
                      
                      {/* Sales Bar (front) */}
                      <div 
                        className={`${styles.salesBar} ${isHighestSale ? styles.highest : ''}`}
                        style={{ height: `${salesHeight}px` }}
                      >
                        <div className={styles.barTooltip}>
                          <span className={styles.tooltipLabel}>{translations.sales}</span>
                          <span className={styles.tooltipValue}>{day.total_sales.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bar Labels */}
                    <div className={styles.barLabels}>
                      <span className={styles.salesLabel}>{day.total_sales.toLocaleString()}</span>
                      <span className={styles.revenueLabel}>{formatCurrency(day.total_revenue)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.dayInfo}>
                    <div className={styles.dayLabel}>{dayTrans(day.day)}</div>
                    {day.total_sales > 0 && (
                      <div className={styles.activeIndicator}>
                        <span className={styles.pulseDot} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* X-Axis Label */}
          <div className={styles.xAxisLabel}>
            <FaCalendarAlt />
            <span>{language === "Swahili" ? "Siku za Wiki" : "Days of Week"}</span>
          </div>
        </div>

        {/* Y-Axis for Revenue */}
        <div className={styles.yAxisSection}>
          <div className={styles.yAxisLabel}>{translations.revenueAmount}</div>
          <div className={styles.yAxis}>
            {revenueTicks.map((tick, index) => (
              <div key={index} className={styles.yTick}>
                <span className={styles.yTickValue}>{formatCurrency(tick)}</span>
                <div className={styles.yTickLine} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Section */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendIcon}>
            <div className={styles.legendColorSales} />
          </div>
          <div className={styles.legendContent}>
            <span className={styles.legendLabel}>{translations.sales}</span>
            <span className={styles.legendValue}>{totalSales.toLocaleString()} {translations.units}</span>
          </div>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendIcon}>
            <div className={styles.legendColorRevenue} />
          </div>
          <div className={styles.legendContent}>
            <span className={styles.legendLabel}>{translations.revenue}</span>
            <span className={styles.legendValue}>{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaShoppingCart />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>{translations.totalSales}</div>
            <div className={styles.statValue}>{totalSales.toLocaleString()}</div>
            <div className={styles.statSubtext}>{translations.units}</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaMoneyBillWave />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>{translations.totalRevenue}</div>
            <div className={styles.statValue}>{formatCurrency(totalRevenue)}</div>
            <div className={styles.statSubtext}>{translations.dailyAverage}: {formatCurrency(totalRevenue / dailySales.length)}</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>{translations.dailyAverage}</div>
            <div className={styles.statValue}>{dailyAverage.toLocaleString()}</div>
            <div className={`${styles.statTrend} ${trend >= 0 ? styles.positive : styles.negative}`}>
              {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySalesGraph;