'use client';
import useFetch from '@/utils/fetch';
import React, { JSX, useEffect, useState } from 'react';
import styles from './page.module.scss';
import cx from 'classnames';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useLanguageStore from '@/store/atoms/language';
import HourlyProductsGraph from '@/components/sales/hourlySales';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEye } from 'react-icons/fa';
import { Calendar, ChartNoAxesCombined, ShieldCheck, ShoppingBasket, Waypoints, Cable } from 'lucide-react';
import MonthlySalesBarChart from '@/components/sales/monthlySales';

const Home = () => {
  const { selected } = useSelectedBusinessStore();
  const { language } = useLanguageStore();
  const [selectedHour, setSelectedHour] = useState<any>(null);
  const [fields, setFields] = useState({
    duration: "day",
    start_date: "",
    end_date: "",
    isCustom: false
  });

  const { data, loading } = useFetch(
    'http://62.169.30.105:5000/sales-analytics/sales_analytics',
    {
      duration: fields.duration,
      start_date: fields.start_date,
      end_date: fields.end_date,
      business_id: selected?.id,
    }
  );

  const formatCurrency = (amount: string | number) => {
    return parseFloat(amount?.toString() || '0').toLocaleString('en-US');
  };

  function dayTrans(day: string) {
    if (language === "English") return day;
    const map: any = {
      Monday: "Jumatatu", Tuesday: "Jumanne", Wednesday: "Jumatano",
      Thursday: "Alhamisi", Friday: "Ijumaa", Saturday: "Jumamosi", Sunday: "Jumapili"
    };
    return map[day] || day;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  function handleFields(duration: string) {
    setFields(prev => {
      if (duration === "custom") {
        return { ...prev, duration: "custom", isCustom: true };
      } else {
        return { ...prev, duration, isCustom: false, start_date: "", end_date: "" };
      }
    });
  }

  const t = {
    totalSales: language === "Swahili" ? "Jumla ya Mauzo" : "Total Sales",
    totalProducts: language === "Swahili" ? "Jumla ya Bidhaa" : "Total Products",
    totalRevenue: language === "Swahili" ? "Mapato Yote" : "Total Revenue",
    netProfit: language === "Swahili" ? "Faida Halisi" : "Net Profit",
    damages: language === "Swahili" ? "Uharibifu" : "Damages",
    hourlyBreakdown: language === "Swahili" ? "Mgawanyiko wa Saa" : "Hourly Sales Breakdown",
    hour: language === "Swahili" ? "Saa" : "Hour",
    sales: language === "Swahili" ? "Mauzo" : "Sales",
    revenue: language === "Swahili" ? "Mapato" : "Revenue",
    products: language === "Swahili" ? "Bidhaa" : "Products",
    action: language === "Swahili" ? "Tendo" : "Action",
    dailyTrend: language === "Swahili" ? "Mwelekeo wa Kila Siku" : "Daily Sales Trend",
    monthlyTrend: language === "Swahili" ? "Mwelekeo wa Mauzo ya Kila Mwezi" : "Monthly Sales Trend",
    day: language === "Swahili" ? "Siku" : "Day",
    topProducts: language === "Swahili" ? "Bidhaa Zilizovuma" : "Top Products",
    product: language === "Swahili" ? "Bidhaa" : "Product",
    soldCount: language === "Swahili" ? "Idadi" : "Sold Count",
    quantity: language === "Swahili" ? "Kiasi" : "Quantity",
    noProducts: language === "Swahili" ? "Hakuna bidhaa zilizopatikana" : "No products found",
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const row = { hidden: { opacity: 0, x: -20 }, visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05 } }) };

  const formatMonth = (month: string) => {
    const [y, m] = month.split('-');
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsSw = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"];
    const list = language === "Swahili" ? monthsSw : monthsEn;
    return `${list[parseInt(m) - 1]} ${y}`;
  };

  return (
    <>
      {/* MODAL */}
      <AnimatePresence>
        {selectedHour && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedHour(null)}>
            <motion.div className={styles.modalContent} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
              <motion.button className={styles.closeBtn} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedHour(null)}>
                <FaTimes />
              </motion.button>
              <div className={styles.modalHeader}><h3>{t.hour}: {selectedHour.hour}</h3></div>
              <HourlyProductsGraph topProducts={selectedHour.products} hour={selectedHour.hour} language={language} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className={styles.dashboard} variants={container} initial="hidden" animate="visible">

        {/* HEADER */}
        <motion.div className={styles.header} variants={item}>
          <div className={styles.durations_wrapper}>
            <div className={styles.durations}>
              <div className={cx(styles.duration, fields.duration === 'day' && styles.active)} onClick={() => handleFields('day')}>{language === "English" ? "Day" : "Siku"}</div>
              <div className={cx(styles.duration, fields.duration === 'week' && styles.active)} onClick={() => handleFields('week')}>{language === "English" ? "Week" : "Wiki"}</div>
              <div className={cx(styles.duration, fields.duration === 'month' && styles.active)} onClick={() => handleFields('month')}>{language === "English" ? "Month" : "Mwezi"}</div>
              <div className={cx(styles.duration, fields.duration === 'year' && styles.active)} onClick={() => handleFields('year')}>{language === "English" ? "Year" : "Mwaka"}</div>
              <div className={cx(styles.duration, fields.duration === 'all' && styles.active)} onClick={() => handleFields('all')}>{language === "English" ? "All Time" : "Muda Wote"}</div>
              <div className={cx(styles.duration, fields.isCustom && styles.active)} onClick={() => handleFields('custom')}>{language === "English" ? "Custom" : "Maalum"}</div>
            </div>
            {fields.isCustom && (
              <div className={styles.date_picker}>
                <div className={styles.one}><input type="date" value={fields.start_date} onChange={e => setFields({ ...fields, start_date: e.target.value })} /></div>
                <div className={styles.one}><input type="date" value={fields.end_date} onChange={e => setFields({ ...fields, end_date: e.target.value })} /></div>
              </div>
            )}
          </div>
          <div className={styles.exact_duration}>
            <Calendar className={styles.icon} size={30} />
            {!loading && <p>{formatDate(data.summary.start_date)} - <span>{formatDate(data.summary.end_date)}</span></p>}
          </div>
        </motion.div>

        {/* METRICS GRID */}
        <motion.div className={styles.metricsGrid}>
          {loading ? Array.from({ length: 5 }).map((_, i) => <motion.div key={i} className={cx(styles.card, styles.skeleton)} variants={item} />) : (
            <>
              <div className={styles.card}><div className={styles.title}>{t.totalSales}</div><div className={styles.other}><ChartNoAxesCombined className={styles.icon} size={35}/><p>{data?.summary?.total_orders}</p></div></div>
              <div className={styles.card}><div className={styles.title}>{t.totalProducts}</div><div className={styles.other}><ShoppingBasket className={styles.icon} size={35}/><p>{data?.summary?.total_products}</p></div></div>
              <div className={styles.card}><div className={styles.title}>{t.totalRevenue}</div><div className={styles.other}><ShieldCheck className={styles.icon} size={35}/><p>{formatCurrency(data?.summary?.total_revenue)}</p></div></div>
              <div className={styles.card}><div className={styles.title}>{t.netProfit}</div><div className={styles.other}><Waypoints className={styles.icon} size={35}/><p>{formatCurrency(data?.summary?.net_profit)}</p></div></div>
              <div className={styles.card}><div className={styles.title}>{t.damages}</div><div className={styles.other}><Cable className={styles.icon} size={35}/><p>{formatCurrency(data?.summary?.damages)}</p></div></div>
            </>
          )}
        </motion.div>

        {/* HOURLY BREAKDOWN TABLE */}
        <motion.div className={styles.tableSection} variants={item}>
          <h2>{t.hourlyBreakdown}</h2>
          {loading ? <div className={styles.tableLoading}>Loading...</div> : (
            <Table
              head={[<th key="h">{t.hour}</th>, <th key="s">{t.sales}</th>, <th key="r">{t.revenue}</th>, <th key="p">{t.products}</th>, <th key="a">{t.action}</th>]}
              rows={data?.hourly_sales?.map((item: any, i: number) => (
                <motion.tr key={i} custom={i} variants={row} initial="hidden" animate="visible">
                  <td>{item.hour}</td>
                  <td>{item.total_sales}</td>
                  <td>{formatCurrency(item.total_revenue)}</td>
                  <td>{item.total_products}</td>
                  <td>
                    <motion.div className={styles.eyeIcon} whileHover={{ scale: 1.2, color: '#1d4ed8' }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedHour(item)}>
                      <FaEye />
                    </motion.div>
                  </td>
                </motion.tr>
              )) ?? []}
            />
          )}
        </motion.div>

        {/* DAILY TREND TABLE */}
        <motion.div className={styles.tableSection} variants={item}>
          <h2>{t.dailyTrend}</h2>
          {loading ? <div className={styles.tableLoading}>Loading...</div> : (
            <Table
              head={[<th key="d">{t.day}</th>, <th key="s">{t.sales}</th>, <th key="r">{t.revenue}</th>]}
              rows={data?.daily_sales?.map((item: any, i: number) => (
                <motion.tr key={i} custom={i} variants={row} initial="hidden" animate="visible">
                  <td>{dayTrans(item.day)}</td>
                  <td>{item.total_sales}</td>
                  <td>{formatCurrency(item.total_revenue)}</td>
                </motion.tr>
              )) ?? []}
            />
          )}
        </motion.div>
{/* MONTHLY BAR CHART — ONLY WHEN year OR all */}
{(fields.duration === 'year' || fields.duration === 'all') && (
  <motion.div className={styles.tableSection} variants={item}>
    <MonthlySalesBarChart 
      data={data?.monthly_sales || []} 
      language={language === "Swahili" ? "Swahili" : "English"} 
    />
  </motion.div>
)}

        {/* TOP PRODUCTS */}
        <motion.div className={styles.tableSection} variants={item}>
          <h2>{t.topProducts}</h2>
          {loading ? <div className={styles.tableLoading}>Loading...</div> : (
            <Table
              head={[<th key="p">{t.product}</th>, <th key="c">{t.soldCount}</th>, <th key="q">{t.quantity}</th>, <th key="r">{t.revenue}</th>]}
              rows={data?.top_products?.length ? data.top_products.map((item: any, i: number) => (
                <motion.tr key={i} custom={i} variants={row} initial="hidden" animate="visible">
                  <td>{item.product}</td>
                  <td>{item.count}</td>
                  <td>{item.total_quantity} {item.measurement}</td>
                  <td>{formatCurrency(item.revenue || '0')}</td>
                </motion.tr>
              )) : [<tr key="empty"><td colSpan={4} className={styles.emptyRow}>{t.noProducts}</td></tr>]}
            />
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

const Table = ({ head, rows }: { head: JSX.Element[]; rows: JSX.Element[] }) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <thead><tr>{head}</tr></thead>
      <tbody>{rows.length ? rows : <tr><td colSpan={head.length} className={styles.emptyRow}>—</td></tr>}</tbody>
    </table>
  </div>
);

export default Home;