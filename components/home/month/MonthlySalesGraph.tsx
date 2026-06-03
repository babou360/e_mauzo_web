'use client';

import React, { useEffect, useState } from 'react';
import styles from './MonthlySalesGraph.module.scss';
import { 
  FaChartBar, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaTrophy
} from 'react-icons/fa';

type MonthlySale = {
  month: string;
  total_orders: number;
  total_revenue: number;
  profit: number;
};

type Props = {
  monthlySales: MonthlySale[];
  language: string;
  formatCurrency: (amount: any) => string;
};

const MonthlySalesGraph: React.FC<Props> = ({ monthlySales, language, formatCurrency }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(language);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  const maxOrders = Math.max(...monthlySales.map(m => m.total_orders), 1);
  const maxRevenue = Math.max(...monthlySales.map(m => m.total_revenue), 1);
  const totalOrders = monthlySales.reduce((sum, m) => sum + m.total_orders, 0);
  const totalRevenue = monthlySales.reduce((sum, m) => sum + m.total_revenue, 0);
  const totalProfit = monthlySales.reduce((sum, m) => sum + m.profit, 0);
  const avgProfitMargin = (totalProfit / totalRevenue) * 100;
  
  // Calculate trend (comparing last 3 months with previous 3 months)
  const recentOrders = monthlySales.slice(-3).reduce((sum, m) => sum + m.total_orders, 0);
  const previousOrders = monthlySales.slice(-6, -3).reduce((sum, m) => sum + m.total_orders, 0);
  const trend = previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0;

  // Generate proper Y-axis ticks
  const generateYAxisTicks = (maxValue: number) => {
    const ticks = [];
    const step = Math.ceil(maxValue / 5);
    for (let i = 0; i <= 5; i++) {
      ticks.push(i * step);
    }
    return ticks.reverse();
  };

  const ordersTicks = generateYAxisTicks(maxOrders);
  const revenueTicks = generateYAxisTicks(maxRevenue);

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString(currentLanguage === "Swahili" ? 'sw-TZ' : 'en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const translations = {
    title: currentLanguage === "Swahili" ? "Mauzo Kwa Mwezi" : "Monthly Sales Analysis",
    orders: currentLanguage === "Swahili" ? "Mauzo" : "Orders",
    revenue: currentLanguage === "Swahili" ? "Mapato" : "Revenue",
    profit: currentLanguage === "Swahili" ? "Faida" : "Profit",
    totalOrders: currentLanguage === "Swahili" ? "Jumla ya Mauzo" : "Total Orders",
    totalRevenue: currentLanguage === "Swahili" ? "Jumla ya Mapato" : "Total Revenue",
    totalProfit: currentLanguage === "Swahili" ? "Jumla ya Faida" : "Total Profit",
    avgMargin: currentLanguage === "Swahili" ? "Wastani wa Faida" : "Avg Profit Margin",
    trend: currentLanguage === "Swahili" ? "Mwenendo" : "Trend",
    vsLastQuarter: currentLanguage === "Swahili" ? "vs robo mwaka iliyopita" : "vs last quarter",
    ordersUnit: currentLanguage === "Swahili" ? "Mauzo (Vipande)" : "Orders (Units)",
    revenueAmount: currentLanguage === "Swahili" ? "Mapato (TSh)" : "Revenue (TSh)"
  };

  const getBarHeight = (value: number, max: number) => {
    return Math.max((value / max) * 280, 4);
  };

  const getProfitColor = (profitPercent: number) => {
    if (profitPercent > 20) return styles.highProfit;
    if (profitPercent > 10) return styles.mediumProfit;
    return styles.lowProfit;
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
          <FaChartBar className={styles.headerIcon} />
        </div>
        <h2 className={styles.title}>{translations.title}</h2>
        <div className={`${styles.trendBadge} ${trend >= 0 ? styles.positive : styles.negative}`}>
          {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span>{Math.abs(trend).toFixed(1)}% {translations.vsLastQuarter}</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className={styles.chartContainer}>
        {/* Y-Axis for Orders */}
        <div className={styles.yAxisSection}>
          <div className={styles.yAxisLabel}>{translations.ordersUnit}</div>
          <div className={styles.yAxis}>
            {ordersTicks.map((tick, index) => (
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
            {monthlySales.map((month, index) => {
              const ordersHeight = getBarHeight(month.total_orders, maxOrders);
              const revenueHeight = getBarHeight(month.total_revenue, maxRevenue);
              const isHighestOrders = month.total_orders === maxOrders;
              const isHighestRevenue = month.total_revenue === maxRevenue;
              const profitPercent = (month.profit / month.total_revenue) * 100;
              
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
                          <span className={styles.tooltipValue}>{formatCurrency(month.total_revenue)}</span>
                        </div>
                      </div>
                      
                      {/* Orders Bar (front) */}
                      <div 
                        className={`${styles.ordersBar} ${isHighestOrders ? styles.highest : ''}`}
                        style={{ height: `${ordersHeight}px` }}
                      >
                        <div className={styles.barTooltip}>
                          <span className={styles.tooltipLabel}>{translations.orders}</span>
                          <span className={styles.tooltipValue}>{month.total_orders.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bar Labels */}
                    <div className={styles.barLabels}>
                      <span className={styles.ordersLabel}>{month.total_orders.toLocaleString()}</span>
                      <span className={styles.revenueLabel}>{formatCurrency(month.total_revenue)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.monthInfo}>
                    <div className={styles.monthLabel}>{formatMonth(month.month)}</div>
                    <div className={`${styles.profitBadge} ${getProfitColor(profitPercent)}`}>
                      {translations.profit}: {formatCurrency(month.profit)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* X-Axis Label */}
          <div className={styles.xAxisLabel}>
            <FaCalendarAlt />
            <span>{currentLanguage === "Swahili" ? "Miezi ya Mwaka" : "Months"}</span>
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
            <div className={styles.legendColorOrders} />
          </div>
          <div className={styles.legendContent}>
            <span className={styles.legendLabel}>{translations.orders}</span>
            <span className={styles.legendValue}>{totalOrders.toLocaleString()}</span>
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
        <div className={styles.legendItem}>
          <div className={styles.legendIcon}>
            <div className={styles.legendColorProfit} />
          </div>
          <div className={styles.legendContent}>
            <span className={styles.legendLabel}>{translations.profit}</span>
            <span className={styles.legendValue}>{formatCurrency(totalProfit)}</span>
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
            <div className={styles.statLabel}>{translations.totalOrders}</div>
            <div className={styles.statValue}>{totalOrders.toLocaleString()}</div>
            <div className={styles.statSubtext}>{translations.ordersUnit.split('(')[0]}</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaMoneyBillWave />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>{translations.totalRevenue}</div>
            <div className={styles.statValue}>{formatCurrency(totalRevenue)}</div>
            <div className={styles.statSubtext}>{translations.profit}: {formatCurrency(totalProfit)}</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartBar />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>{translations.avgMargin}</div>
            <div className={styles.statValue}>{avgProfitMargin.toFixed(1)}%</div>
            <div className={`${styles.statTrend} ${trend >= 0 ? styles.positive : styles.negative}`}>
              {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              <span>{Math.abs(trend).toFixed(1)}% {translations.trend}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesGraph;