'use client';

import React, { useState, useEffect } from 'react';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import styles from './style.module.scss';
import useFetch from '@/utils/fetch';
import useLanguageStore from '@/store/atoms/language';

//const TIME_FILTERS = ['Day', 'Week', 'Month', 'Year', 'All', 'Custom'] as const;
const TIME_FILTERS = [
    {
        swahili: 'Siku',
        english: 'Day',
        value: 'day',
    },
    {
        swahili: 'Wiki',
        english: 'Week',
        value: 'week',
    },
    {
        swahili: 'Mwezi',
        english: 'Month',
        value: 'month',
    },
    {
        swahili: 'Mwaka',
        english: 'Year',
        value: 'year',
    },
    {
        swahili: 'Muda Wote',
        english: 'All',
        value: 'all',
    },
    {
        swahili: 'Muda Maalumu',
        english: 'Custom',
        value: 'custom',
    },
] as const;
const ROWS_PER_PAGE = [10, 25, 50, 100, -1];

const formatDate = (date: Date, fmt: string) => {
  const map: Record<string, string> = {
    dd: String(date.getDate()).padStart(2, '0'),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    yyyy: String(date.getFullYear()),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
    a: date.getHours() >= 12 ? 'PM' : 'AM',
  };
  return fmt.replace(/dd|MM|yyyy|HH|mm|ss|a/g, m => map[m]);
};

export default function SalesReport() {
  const { selected } = useSelectedBusinessStore();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState<string>('month');
  const [sellerId, setSellerId] = useState('all');
  const [limit, setLimit] = useState(50);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const {language} = useLanguageStore()
  const [fields, setFields] = useState({
    page: 1,
    pageSize: 10,
    business_id: selected?.id,
    seller_id: '',
    duration: 'day',
    start: '',
    end: '',
    name: '',
  })
  const { data:salesData, loading: salesLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/sales/get_sales`, {
    page: fields.page,
    pageSize: fields.pageSize,
    business_id: selected?.id,
    seller_id: fields.seller_id,
    duration: fields.duration,
    start: fields.start,
    end: fields.end,
  });
  const { data:attendData, loading: attendLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/attendant/get_attendants`, {
    page: 1,
    pageSize: 10,
    name: '',
    business_id: selected?.id
  });

  // Simulate data
  useEffect(() => {
    setTimeout(() => {
      setSales([
        { total_price: 425000, discount: 20000, createdAt: new Date().toISOString(), products: [{ buying_price: 280000, quantity: 3 }], seller: 'Babou' },
        { total_price: 298000, discount: 12000, createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), products: [{ buying_price: 180000, quantity: 2 }, { buying_price: 50000, quantity: 3 }], seller: 'Amri Mkilanya' },
        { total_price: 156000, discount: 0, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), products: [{ buying_price: 110000, quantity: 1 }], seller: 'Babou' },
      ]);
      setLoading(false);
    }, 900);
  }, [duration, sellerId, limit,attendLoading,selected]);

  const calculateSummary = () => {
    let totalPrice = 0;
    let totalCost = 0;
    let discount = 0;
    let productsSold = 0;

    sales.forEach(sale => {
      totalPrice += Number(sale.total_price) || 0;
      discount += Number(sale.discount) || 0;
      sale.products?.forEach((p: any) => {
        const qty = Number(p.quantity) || 0;
        totalCost += (Number(p.buying_price) || 0) * qty;
        productsSold += qty;
      });
    });

    const profit = totalPrice - totalCost - discount;

    return {
      totalPrice: totalPrice.toFixed(2),
      totalCost: totalCost.toFixed(2),
      discount: discount.toFixed(2),
      profit: profit.toFixed(2),
      productsSold,
      transactions: sales.length,
    };
  };

  const summary = calculateSummary();

  // Export as Excel (CSV)
  const exportAsExcel = () => {
    const headers = ['No', 'Seller', 'Items', 'Discount', 'Total', 'Date'];
    const rows = sales.map((s, i) => [
      i + 1,
      s.seller || '—',
      s.products?.length || 0,
      Number(s.discount || 0).toFixed(2),
      Number(s.total_price || 0).toFixed(2),
      new Date(s.createdAt).toLocaleString(),
    ]);

    const period = duration === 'custom'
      ? `${startDate || 'N/A'} to ${endDate || 'N/A'}`
      : duration.toUpperCase();

    const csvContent = [
      ['SALES REPORT'],
      [`Business: ${selected?.name || 'N/A'}`],
      [`Period: ${period}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      headers,
      ...rows,
      [],
      ['SUMMARY'],
      ['Total Revenue,TZS ' + summary.totalPrice],
      ['Total Cost,TZS ' + summary.totalCost],
      ['Discount,TZS ' + summary.discount],
      ['Net Profit,TZS ' + summary.profit],
      ['Products Sold,' + summary.productsSold],
      ['Transactions,' + summary.transactions],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_report_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as PDF
  const exportAsPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    const address = [selected?.street, selected?.ward, selected?.district, selected?.city, selected?.country]
      .filter(Boolean).join(', ') || 'N/A';

    const period = duration === 'custom' && startDate && endDate
      ? `${formatDate(new Date(startDate), 'dd MMM yyyy')} → ${formatDate(new Date(endDate), 'dd MMM yyyy')}`
      : duration.charAt(0).toUpperCase() + duration.slice(1);

    win.document.write(`
      <html>
        <head>
          <title>Sales Report - ${selected?.name}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 50px; color: #222; line-height: 1.7; background: white; }
            .header { text-align: center; margin-bottom: 40px; padding: 35px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 18px; }
            .logo { font-size: 34px; font-weight: bold; }
            .shop { font-size: 24px; margin: 12px 0; }
            .info { font-size: 16px; opacity: 0.95; }
            .summary { background: #f8f9ff; padding: 30px; border-radius: 18px; margin: 40px 0; border: 2px solid #eef0ff; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-top: 25px; }
            .card { background: white; padding: 20px; border-radius: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
            .label { font-size: 14px; color: #666; }
            .value { font-size: 22px; font-weight: bold; margin-top: 8px; }
            .profit { color: #27ae60 !important; }
            table { width: 100%; border-collapse: collapse; margin-top: 40px; font-size: 15px; }
            th { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 18px; text-align: left; }
            td { padding: 16px 18px; border-bottom: 1px solid #eee; }
            tr:hover { background: #f8f9ff; }
            .total { font-weight: bold; color: #27ae60; }
            .footer { margin-top: 70px; text-align: center; color: #888; font-size: 14px; }
            @page { margin: 1.2cm; }
            @media print { body { padding: 20px; } .header { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Sales Report</div>
            <div class="shop">${selected?.name || 'Business Name'}</div>
            <div class="info">${address}</div>
            <div class="info">Phone: ${selected?.phone || 'N/A'}</div>
            <div class="info">Report: ${new Date().toLocaleString()} • Period: ${period}</div>
          </div>

          <div class="summary">
            <h2 style="text-align:center; margin:0 0 25px; color:#333;">Financial Summary</h2>
            <div class="grid">
              <div class="card"><div class="label">Revenue</div><div class="value">TZS ${summary.totalPrice}</div></div>
              <div class="card"><div class="label">Cost</div><div class="value">TZS ${summary.totalCost}</div></div>
              <div class="card"><div class="label">Discount</div><div class="value">TZS ${summary.discount}</div></div>
              <div class="card"><div class="label">Net Profit</div><div class="value profit">TZS ${summary.profit}</div></div>
              <div class="card"><div class="label">Items Sold</div><div class="value">${summary.productsSold}</div></div>
              <div class="card"><div class="label">Transactions</div><div class="value">${summary.transactions}</div></div>
            </div>
          </div>

          <table>
            <thead><tr>
              <th>#</th><th>Seller</th><th>Items</th><th>Discount</th><th>Total</th><th>Date & Time</th>
            </tr></thead>
            <tbody>
              ${sales.map((s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${s.seller || '—'}</td>
                  <td>${s.products?.length || 0}</td>
                  <td>TZS ${Number(s.discount || 0).toFixed(2)}</td>
                  <td class="total">TZS ${Number(s.total_price || 0).toFixed(2)}</td>
                  <td>${new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">Thank you for your business • Report generated by Your POS System</div>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 1000);
  };

  return (
    <div className={styles.salesReport}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sales Report</h1>
          <p className={styles.subtitle}>Complete financial performance</p>
        </div>
        <div className={styles.exportButtons}>
          <button onClick={exportAsExcel} className={styles.excelBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 15h6M9 12h6M9 18h3" />
            </svg>
            Export Excel
          </button>
          <button onClick={exportAsPDF} className={styles.pdfBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filterChips}>
          {TIME_FILTERS.map(filter => (
            <button
              key={filter.value}
              className={`${styles.chip} ${fields.duration === filter.value.toLowerCase() ? styles.chipActive : ''}`}
              onClick={() => setFields({...fields,duration:filter.value.toLowerCase()})}
            >
              {language=="Swahili"?filter.swahili:filter.english}
            </button>
          ))}
        </div>

        {/* Custom Date Picker - Only shows when "Custom" is active */}
        {fields.duration === 'custom' && (
          <div className={styles.dateRangePicker}>
            <div className={styles.dateField}>
              <label>{language=="Swahili"?"Mwanzo":"Start Date"}</label>
              <input type="date" value={fields.start} onChange={e => setFields({...fields,start:e.target.value})} />
            </div>
            <div className={styles.dateField}>
              <label>{language=="Swahili"?"Mwisho":"End Date"}</label>
              <input type="date" value={fields.end} onChange={e => setFields({...fields,end:e.target.value})} />
            </div>
            <button
              onClick={() => {
                if (startDate && endDate) {
                  // Trigger re-fetch or filter logic here in real app
                }
              }}
              className={styles.applyBtn}
              disabled={!startDate || !endDate}
            >
              {language=="Swahili"?"Thibitisha":"Apply Range"}
            </button>
          </div>
        )}

        {duration === 'custom' && startDate && endDate && (
          <div className={styles.selectedRange}>
            Custom Range Applied: {formatDate(new Date(startDate), 'dd MMM yyyy')} → {formatDate(new Date(endDate), 'dd MMM yyyy')}
          </div>
        )}

        <div className={styles.selectGroup}>
            {
                attendLoading
                ?<label htmlFor="">loading..</label>
                :<select value={sellerId} onChange={e => setSellerId(e.target.value)} className={styles.select}>
                    <option value="all">All Sellers</option>
                    {
                        attendData.data.map((item:any,index:number)=> (
                            <option value={item.id} key={index}>{item.name}</option>
                        ))
                    }
                </select>
            }
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} className={styles.select}>
            {ROWS_PER_PAGE.map(size => (
              <option key={size} value={size}>{size === -1 ? 'All' : `${size} rows`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rest of your UI (loader, table, etc.) remains the same */}
      {salesLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Generating report...</p>
        </div>
      ) : salesData.length === 0 ? (
        <div className={styles.empty}>No sales found</div>
      ) : (
        <div className={styles.reportCard}>
          <div className={styles.summarySection}>
            <div className={styles.shopInfo}>
              <h3>Business Overview</h3>
              <p className={styles.shopName}>{selected?.name || 'N/A'}</p>
              <p className={styles.address}>
                {[selected?.street, selected?.ward, selected?.district, selected?.city].filter(Boolean).join(', ')}
              </p>
              <p>Phone: {selected?.phone || 'N/A'}</p>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.icon}>Revenue</span>
                <div><p>Total Revenue</p><strong>TZS {summary.totalPrice}</strong></div>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.icon}>Cost</span>
                <div><p>Total Cost</p><strong>TZS {summary.totalCost}</strong></div>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.icon}>Profit</span>
                <div><p>Net Profit</p><strong className={styles.profit}>TZS {summary.profit}</strong></div>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.icon}>Items</span>
                <div><p>Products Sold</p><strong>{summary.productsSold}</strong></div>
              </div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Seller</th>
                  <th>Items</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {salesData.rows.map((sale:any, i:number) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{sale.seller || '—'}</td>
                    <td>{sale.products[0].name}+{sale.products.length-1}</td>
                    <td>TZS {Number(sale.discount || 0).toFixed(2)}</td>
                    <td className={styles.total}> {Number(sale.total_price || 0).toFixed(2)}</td>
                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}