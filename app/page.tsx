'use client';

import useFetch from '@/utils/fetch';
import React, { useState } from 'react';
import styles from './page.module.scss';
import cx from 'classnames';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useLanguageStore from '@/store/atoms/language';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaEye, 
  FaShoppingCart, 
  FaBoxes, 
  FaBusinessTime, 
  FaFigma, 
  FaHandSparkles, 
  FaLayerGroup, 
  FaShopify, 
  FaSlack,
  FaCalendarAlt,
  FaArrowRight,
  FaChartBar,
  FaChartLine,
  FaArrowCircleRight
} from 'react-icons/fa';
import HourlyProductsGraph from '../components/home/hour/HourlyProductsGraph';
import TopProductsModal from '../components/home/top/TopProductsModal';
import DailySalesGraph from '../components/home/day/DailySalesGraph';
import MonthlySalesGraph from '../components/home/month/MonthlySalesGraph';
import AllHours from '../components/home/allHours/allHours';
import AllHoursGraph from '../components/home/allHours/allHours';

const Home = () => {
  const { selected } = useSelectedBusinessStore();
  const { language } = useLanguageStore();
  const [selectedHour, setSelectedHour] = useState<any>(null);
  const [showHourlyGraph, setShowHourlyGraph] = useState<any>(null);
  const [showTopProductsModal, setShowTopProductsModal] = useState(false);
  const [showDailyGraph, setShowDailyGraph] = useState(false);
  const [showMonthlyGraph, setShowMonthlyGraph] = useState(false);
  const [fields, setFields] = useState({
    duration: "day",
    start_date: "",
    end_date: "",
    isCustom: false
  });

  const { data, loading } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/sales-analytics/sales_analytics`,
    {
      duration: fields.duration,
      start_date: fields.start_date,
      end_date: fields.end_date,
      business_id: selected?.id,
    }
  );

  const formatCurrency = (amount: any): string => {
    const num = parseFloat(amount?.toString() || '0');
    return num.toLocaleString('en-US');
  };

  const formatNumber = (amount: any): string => {
    const num = parseFloat(amount?.toString() || '0');
    return num.toLocaleString('en-US');
  };

  function dayTrans(day: string) {
    if (language === "English") return day;
    const map: any = {
      Monday: "Jumatatu", Tuesday: "Jumanne", Wednesday: "Jumatano",
      Thursday: "Alhamisi", Friday: "Ijumaa", Saturday: "Jumamosi", Sunday: "Jumapili"
    };
    return map[day] || day;
  }

  function formatDisplayDate(dateString: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "Swahili" ? 'sw-TZ' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function handleFields(duration: string) {
    if (duration === "custom") {
      setFields(prev => ({ ...prev, duration: "custom", isCustom: true }));
    } else {
      setFields(prev => ({ 
        ...prev, 
        duration, 
        isCustom: false, 
        start_date: "", 
        end_date: "" 
      }));
    }
  }

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    setFields(prev => ({ ...prev, [type === 'start' ? 'start_date' : 'end_date']: value }));
  };

  const t = {
    totalSales: language === "Swahili" ? "Mauzo" : "Total Sales",
    totalProducts: language === "Swahili" ? "Bidhaa" : "Total Products",
    totalRevenue: language === "Swahili" ? "Mapato" : "Total Revenue",
    netProfit: language === "Swahili" ? "Faida" : "Profit",
    damages: language === "Swahili" ? "Uharibifu" : "Damages",
    avgOrderValue: language === "Swahili" ? "Wastani wa Oda" : "Avg Order Value",
    profitMargin: language === "Swahili" ? "Uwiano wa Faida" : "Profit Margin",
    expenses: language === "Swahili" ? "Matumizi" : "Expenses",
    hourlyBreakdown: language === "Swahili" ? "Mauzo Kwa Saa" : "Hourly Sales",
    hour: language === "Swahili" ? "Saa" : "Hour",
    sales: language === "Swahili" ? "Mauzo" : "Sales",
    revenue: language === "Swahili" ? "Mapato" : "Revenue",
    products: language === "Swahili" ? "Bidhaa" : "Products",
    action: language === "Swahili" ? "Tazama" : "View",
    dailyTrend: language === "Swahili" ? "Mauzo Kwa Siku" : "Daily Sales",
    monthlyTrend: language === "Swahili" ? "Mauzo Kwa Mwezi" : "Monthly Sales",
    day: language === "Swahili" ? "Siku" : "Day",
    month: language === "Swahili" ? "Mwezi" : "Month",
    topProducts: language === "Swahili" ? "Bidhaa Zilizouzwa" : "Products Sold",
    product: language === "Swahili" ? "Bidhaa" : "Product",
    quantity: language === "Swahili" ? "Idadi" : "Quantity",
    unit: language === "Swahili" ? "Kiasi" : "Quantity",
    reportPeriod: language === "Swahili" ? "Muda wa Ripoti" : "Report Period",
    viewChart: language === "Swahili" ? "Tazama Chati" : "View Chart",
    viewAll: language === "Swahili" ? "Tazama Zote" : "View All",
    profit: language === "Swahili" ? "Faida" : "Profit",
    freeTrial: language === "Swahili" ? "Jaribio Bure" : "Free Trial",
    subscriptionActive: language === "Swahili" ? "Usajili Upo Hai" : "Subscription Active",
    subscriptionExpired: language === "Swahili" ? "Usajili Umeisha" : "Subscription Expired",
    noSubscription: language === "Swahili" ? "Hakuna Usajili" : "No Subscription",
    upgrade: language === "Swahili" ? "Boresha" : "Upgrade",
    trialEndsIn: language === "Swahili" ? "Jaribio linaisha baada ya siku" : "Your trial ends in",
    nextPaymentIn: language === "Swahili" ? "Malipo yajayo baada ya siku" : "Next payment in",
    days: language === "Swahili" ? "siku" : "day(s)",
    pleaseRenew: language === "Swahili" ? "Tafadhali fanya malipo upya" : "Please renew your subscription",
    pleaseSubscribe: language === "Swahili" ? "Tafadhali jiunge ili kuendelea" : "Please subscribe to continue",
    hourlySalesChart: language === "Swahili" ? "Chati ya Mauzo Kwa Saa" : "Hourly Sales Chart",
    dailySalesChart: language === "Swahili" ? "Chati ya Mauzo Kwa Siku" : "Daily Sales Chart",
    monthlySalesChart: language === "Swahili" ? "Chati ya Mauzo Kwa Mwezi" : "Monthly Sales Chart",
  };

  const primaryColor = "#482691";
  const secondaryColor = "#6C4AB6";
  const accentColor = "#8E44AD";
  const backgroundColor = "#F8F9FF";

  const summary = data?.summary || {};
  const hourlySales = data?.hourly_sales || [];
  const dailySales = data?.daily_sales || [];
  const monthlySales = data?.monthly_sales || [];
  const displayProducts = summary.display_products || [];
  const topProducts = summary.top_products || [];

  const metrics = [
    { 
      title: t.totalSales, 
      value: formatNumber(summary.total_orders),
      icon: FaShoppingCart,
      gradient: ["#6C4AB6", "#8E44AD"],
    },
    { 
      title: t.totalProducts, 
      value: formatNumber(summary.total_products),
      icon: FaBoxes,
      gradient: ["#3498DB", "#2ECC71"],
    },
    { 
      title: t.totalRevenue, 
      value: formatCurrency(summary.total_revenue),
      icon: FaBusinessTime,
      gradient: ["#E74C3C", "#F39C12"],
    },
    { 
      title: t.expenses, 
      value: formatCurrency(summary.total_expenses),
      icon: FaFigma,
      gradient: ["#1DA1A4", "#F39C12"],
    },
    { 
      title: t.damages, 
      value: formatCurrency(summary.damages),
      icon: FaHandSparkles,
      gradient: ["#A83CE7", "#F39C12"],
    },
    { 
      title: t.netProfit, 
      value: formatCurrency(summary.net_profit),
      icon: FaLayerGroup,
      gradient: ["#1ABC9C", "#4B0B4E"],
    },
    { 
      title: t.avgOrderValue, 
      value: formatCurrency(summary.average_order_value),
      icon: FaShopify,
      gradient: ["#325B53", "#16A085"],
    },
    { 
      title: t.profitMargin, 
      value: `${summary.profit_margin || 0}%`,
      icon: FaSlack,
      gradient: ["#1ABC9C", "#FF6F01"],
    },
  ];

  const durations = [
    { value: 'day', english: 'Day', swahili: 'Siku' },
    { value: 'week', english: 'Week', swahili: 'Wiki' },
    { value: 'month', english: 'Month', swahili: 'Mwezi' },
    { value: 'year', english: 'Year', swahili: 'Mwaka' },
    { value: 'all', english: 'All Time', swahili: 'Muda Wote' },
    { value: 'custom', english: 'Custom', swahili: 'Maalum' },
  ];

  // Calculate subscription status (mock - replace with actual logic)
  const getSubscriptionStatus = () => {
    // Mock data - replace with actual business subscription data
    const createdAt = selected?.createdAt ? new Date(selected.createdAt) : new Date();
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const isTrial = daysSinceCreation <= 3;
    const lastPaid = selected?.lastPaid ? new Date(selected.lastPaid) : null;
    
    if (isTrial) {
      const remainingDays = Math.max(0, 3 - daysSinceCreation);
      return {
        title: t.freeTrial,
        subtitle: `${t.trialEndsIn} ${remainingDays} ${t.days}`,
        color: "#FF9800"
      };
    }
    
    if (lastPaid) {
      const remainingDays = Math.floor((lastPaid.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (remainingDays > 0) {
        return {
          title: t.subscriptionActive,
          subtitle: `${t.nextPaymentIn} ${remainingDays} ${t.days}`,
          color: "#4CAF50"
        };
      } else {
        return {
          title: t.subscriptionExpired,
          subtitle: t.pleaseRenew,
          color: "#F44336"
        };
      }
    }
    
    return {
      title: t.noSubscription,
      subtitle: t.pleaseSubscribe,
      color: "#F44336"
    };
  };

  const subscription = getSubscriptionStatus();

  if (loading) {
    return (
      <div className={styles.loadingContainer} style={{ backgroundColor }}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerInner}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {selectedHour && (
          <motion.div 
            className={styles.modalOverlay} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSelectedHour(null)}
          >
            <motion.div 
              className={styles.modalContent} 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }} 
              onClick={e => e.stopPropagation()}
            >
              <motion.button 
                className={styles.closeBtn} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setSelectedHour(null)}
              >
                <FaTimes />
              </motion.button>
              <HourlyProductsGraph topProducts={selectedHour.products} hour={selectedHour.hour}/>
            </motion.div>
          </motion.div>
        )}

        {/* Hourly Products Graph Modal */}
        {showHourlyGraph && (
          <motion.div 
            className={styles.modalOverlay} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowHourlyGraph(null)}
          >
            <motion.div 
              className={styles.graphModalContent} 
              initial={{ scale: 0.8, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.8, opacity: 0, y: 50 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }} 
              onClick={e => e.stopPropagation()}
            >
              <motion.button 
                className={styles.closeBtn} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowHourlyGraph(null)}
              >
                <FaTimes />
              </motion.button>
              <AllHoursGraph 
                hourly_sales={showHourlyGraph}
                language={language}
              />
              {/* <HourlyProductsGraph 
                topProducts={showHourlyGraph.products} 
                hour={showHourlyGraph.hour}
                language={language}
              /> */}
            </motion.div>
          </motion.div>
        )}

        {/* Top Products Modal */}
        {showTopProductsModal && (
          <motion.div 
            className={styles.modalOverlay} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowTopProductsModal(false)}
          >
            <motion.div 
              className={styles.fullModalContent} 
              initial={{ scale: 0.8, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.8, opacity: 0, y: 50 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }} 
              onClick={e => e.stopPropagation()}
            >
              <motion.button 
                className={styles.closeBtn} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowTopProductsModal(false)}
              >
                <FaTimes />
              </motion.button>
              <TopProductsModal 
                topProducts={data?.summary.display_products}
                language={language}
                formatCurrency={formatCurrency}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Daily Sales Graph Modal */}
        {showDailyGraph && (
          <motion.div 
            className={styles.modalOverlay} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowDailyGraph(false)}
          >
            <motion.div 
              className={styles.graphModalContent} 
              initial={{ scale: 0.8, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.8, opacity: 0, y: 50 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }} 
              onClick={e => e.stopPropagation()}
            >
              <motion.button 
                className={styles.closeBtn} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowDailyGraph(false)}
              >
                <FaTimes />
              </motion.button>
              <DailySalesGraph 
                dailySales={dailySales}
                formatCurrency={formatCurrency}
                dayTrans={dayTrans}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Monthly Sales Graph Modal */}
        {showMonthlyGraph && (
          <motion.div 
            className={styles.modalOverlay} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowMonthlyGraph(false)}
          >
            <motion.div 
              className={styles.graphModalContent} 
              initial={{ scale: 0.8, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.8, opacity: 0, y: 50 }} 
              transition={{ type: "spring", stiffness: 300, damping: 30 }} 
              onClick={e => e.stopPropagation()}
            >
              <motion.button 
                className={styles.closeBtn} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowMonthlyGraph(false)}
              >
                <FaTimes />
              </motion.button>
              <MonthlySalesGraph 
                monthlySales={monthlySales}
                language={language}
                formatCurrency={formatCurrency}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.dashboard} style={{ backgroundColor }}>
        {/* Duration Selector */}
        <div className={styles.durationSelector}>
          <div className={styles.durationWrapper}>
            <div className={styles.durations}>
              {durations.map((item) => {
                const isSelected = fields.duration === item.value;
                const isCustom = item.value === 'custom';
                return (
                  <motion.div
                    key={item.value}
                    className={cx(styles.duration, isSelected && styles.active)}
                    style={{
                      background: isSelected ? `linear-gradient(135deg, ${primaryColor}, ${accentColor})` : 'transparent',
                      border: isSelected ? 'none' : `1.5px solid ${primaryColor}20`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFields(item.value)}
                  >
                    <span style={{ color: isSelected ? '#fff' : '#666' }}>
                      {language === "English" ? item.english : item.swahili}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            
            {fields.isCustom && (
              <div className={styles.datePicker}>
                <input 
                  type="date" 
                  value={fields.start_date} 
                  onChange={e => handleCustomDateChange('start', e.target.value)}
                  className={styles.dateInput}
                />
                <FaArrowRight className={styles.dateArrow} />
                <input 
                  type="date" 
                  value={fields.end_date} 
                  onChange={e => handleCustomDateChange('end', e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            )}
          </div>

          {/* Date Range Card */}
          <div className={styles.dateRangeCard}>
            <div className={styles.dateRangeIcon}>
              <FaCalendarAlt size={24} color="#fff" />
            </div>
            <div className={styles.dateRangeInfo}>
              <span className={styles.dateRangeLabel}>{t.reportPeriod}</span>
              <div className={styles.dateRangeDates}>
                <span>{formatDisplayDate(summary.start_date)}</span>
                <FaArrowRight size={14} color={primaryColor} />
                <span>{formatDisplayDate(summary.end_date)}</span>
              </div>
            </div>
            <FaArrowCircleRight size={18} color={primaryColor} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              className={styles.metricCard}
              style={{
                background: `linear-gradient(135deg, ${metric.gradient[0]}, ${metric.gradient[1]})`,
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={styles.metricIconBg}>
                <metric.icon size={20} color="#fff" />
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricTitle}>{metric.title}</span>
                <span className={styles.metricValue}>{metric.value}</span>
              </div>
              <div className={styles.metricBgIcon}>
                <metric.icon size={50} opacity={0.1} color="#fff" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscription Status Card */}
        <div className={styles.subscriptionCard} style={{ background: `linear-gradient(135deg, ${subscription.color}CC, ${subscription.color})` }}>
          <div className={styles.subscriptionIcon}>
            <div className={styles.subscriptionIconInner}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" fill="white" fillOpacity="0.2" stroke="white"/>
              </svg>
            </div>
          </div>
          <div className={styles.subscriptionInfo}>
            <div className={styles.subscriptionTitle}>{subscription.title}</div>
            <div className={styles.subscriptionSubtitle}>{subscription.subtitle}</div>
          </div>
          <button className={styles.subscriptionButton} style={{ color: subscription.color }}>
            {t.upgrade}
          </button>
        </div>

        {/* Products Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.topProducts}</h2>
            <motion.button 
              className={styles.viewAllBtn}
              style={{ background: primaryColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTopProductsModal(true)}
            >
              {t.viewAll}
            </motion.button>
          </div>
          
          <div className={styles.productsCard}>
            <div className={styles.productsHeader}>
              <div className={styles.productCol}>{t.product}</div>
              <div className={styles.quantityCol}>{t.quantity}</div>
              <div className={styles.unitCol}>{t.unit}</div>
            </div>
            <div className={styles.productsBody}>
              {[...displayProducts]
              .sort((a: any, b: any) => Number(b.count) - Number(a.count))
              .slice(0, 10)
              .map((product: any, idx: number) => {
                const measurement = product.measurement || {};
                const measurementText = `${product.quantity} ${measurement.short_form}`
                return (
                  <div key={idx} className={cx(styles.productRow, idx % 2 === 0 ? styles.even : styles.odd)}>
                    <div className={styles.productInfo}>
                      <div className={styles.productRank} style={{ background: `${primaryColor}20`, color: primaryColor }}>
                        {idx + 1}
                      </div>
                      <span className={styles.productName}>{product.product_name}</span>
                    </div>
                    <div className={styles.productQuantity}>{product.count || 0}</div>
                    <div className={styles.productUnit}>{measurementText || (language === "Swahili" ? "Kipande" : "Piece")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hourly Sales Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.hourlyBreakdown}</h2>
            <motion.button 
              className={styles.viewChartBtn}
              style={{ background: primaryColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const nonZeroHours = hourlySales.filter((h: any) => h.total_sales > 0);
                if (nonZeroHours.length > 0) {
                  setShowHourlyGraph(hourlySales);
                }
              }}
            >
              <FaChartBar size={14} />
              {t.viewChart}
            </motion.button>
          </div>
          
          <div className={styles.hourlyCard}>
            <div className={styles.hourlyHeader}>
              <div className={styles.hourCol}>{t.hour}</div>
              <div className={styles.salesCol}>{t.sales}</div>
              <div className={styles.revenueCol}>{t.revenue}</div>
              <div className={styles.productsCol}>{t.products}</div>
            </div>
            <div className={styles.hourlyBody}>
              {hourlySales.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  className={cx(styles.hourlyRow, idx % 2 === 0 ? styles.even : styles.odd)}
                  onClick={() => setSelectedHour(item)}
                >
                  <div className={styles.hourBadge}>
                    {item.hour}
                  </div>
                  <div className={styles.hourSales}>{item.total_sales || 0}</div>
                  <div className={styles.hourRevenue}>{formatCurrency(item.total_revenue)}</div>
                  <div className={styles.hourProducts}>
                    <span>{item.total_products || 0}</span>
                    <FaEye className={styles.viewIcon} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Sales Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.dailyTrend}</h2>
            <motion.button 
              className={styles.viewChartBtn}
              style={{ background: primaryColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDailyGraph(true)}
            >
              <FaChartLine size={14} />
              {t.viewChart}
            </motion.button>
          </div>
          
          <div className={styles.dailyCard}>
            <div className={styles.dailyHeader}>
              <div className={styles.dayCol}>{t.day}</div>
              <div className={styles.dailySalesCol}>{t.sales}</div>
              <div className={styles.dailyRevenueCol}>{t.revenue}</div>
            </div>
            <div className={styles.dailyBody}>
              {dailySales.map((item: any, idx: number) => (
                <div key={idx} className={cx(styles.dailyRow, idx % 2 === 0 ? styles.even : styles.odd)}>
                  <div className={styles.dayInfo}>
                    <div className={styles.dayNumber} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                      {idx + 1}
                    </div>
                    <span className={styles.dayName}>{dayTrans(item.day)}</span>
                  </div>
                  <div className={styles.dailySales}>{item.total_sales || 0}</div>
                  <div className={styles.dailyRevenue}>{formatCurrency(item.total_revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Sales Section */}
        {monthlySales.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t.monthlyTrend}</h2>
              <motion.button 
                className={styles.viewChartBtn}
                style={{ background: primaryColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMonthlyGraph(true)}
              >
                <FaChartLine size={14} />
                {t.viewChart}
              </motion.button>
            </div>
            <div className={styles.monthlyCard}>
              <div className={styles.monthlyHeader}>
                <div className={styles.monthCol}>{t.month}</div>
                <div className={styles.monthSalesCol}>{t.sales}</div>
                <div className={styles.monthRevenueCol}>{t.revenue}</div>
                <div className={styles.monthProfitCol}>{t.profit}</div>
              </div>
              <div className={styles.monthlyBody}>
                {monthlySales.map((item: any, idx: number) => {
                  const profit = item.profit || 0;
                  return (
                    <div key={idx} className={cx(styles.monthlyRow, idx % 2 === 0 ? styles.even : styles.odd)}>
                      <div className={styles.monthName}>{item.month}</div>
                      <div className={styles.monthSales}>{item.total_orders || 0}</div>
                      <div className={styles.monthRevenue}>{formatCurrency(item.total_revenue)}</div>
                      <div className={cx(styles.monthProfit, profit > 0 ? styles.positive : styles.negative)}>
                        {formatCurrency(profit)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
// here are the changes come and see there is nothing here 

export default Home;