'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Wallet, CheckCircle, User, Phone, Package, CreditCard } from 'lucide-react';
import styles from './Debts.module.scss';
import useFetch from '@/utils/fetch';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useLanguageStore from '@/store/atoms/language';

export const metadata = {
  title: "Debts",
  description: "Browse all about debts information",
};

const DebtsPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const { selected } = useSelectedBusinessStore();
  const { language } = useLanguageStore(); // 'en' or 'sw'
  const [fields, setFields] = useState({
    page: 1,
    pageSize: 10,
    order_no: '',
    payment_filter: 'all',
    duration: 'day',
    repayAmount: 0,
    selectedDebt: {
        business_id: 0,
        order_no: '',
        buyer: {
            name: '',
            phone: ''
        },
        createdAt: '',
        discount: 0,
        id: 0,
        products: [],
        seller: null,
        total_price: 0,
        paid_amount: 0,
        sale_total: 0,
        sale_profit: 0,
        paid: false,
        payment_method: ''
    }
  });

  // Translations
  const t = {
    en: {
      search: 'Search debts(Order Number, Phone, Seller',
      noDebts: 'No debts found',
      totalDebt: 'Total Debt',
      paid: 'Paid',
      paymentProgress: 'Payment Progress',
      remaining: 'Remaining',
      day: 'Day',
      week: 'Week',
      month: 'Month',
      year: 'Year',
      all: 'All',
      custom: 'Custom',
      startDate: 'Start Date',
      endDate: 'End Date',
      completed: 'Completed',
      pending: 'Pending',
      repay: 'Repay',
      repayDebt: 'Repay Debt',
      total: 'Total',
      alreadyPaid: 'Already Paid',
      enterAmount: 'Enter Amount',
      cancel: 'Cancel',
      confirmPayment: 'Confirm Payment',
      order: 'Order',
      buyer: 'Buyer',
      phone: 'Phone',
      products: 'Products',
      qty: 'Qty',
      paidStatus: 'Paid',
      partialStatus: 'Partial',
      extra: 'Extra',
      remainingAfter: 'Remaining'
    },
    sw: {
      search: 'Tafuta madeni(namba ya oda, namba ya simu, muuzaji)',
      noDebts: 'Hakuna madeni yaliyopatikana',
      totalDebt: 'Jumla ya Deni',
      paid: 'Imelipwa',
      paymentProgress: 'Maendeleo ya Malipo',
      remaining: 'Inabakia',
      day: 'Siku',
      week: 'Wiki',
      month: 'Mwezi',
      year: 'Mwaka',
      all: 'Zote',
      custom: 'Maalum',
      startDate: 'Tarehe ya Kuanza',
      endDate: 'Tarehe ya Mwisho',
      completed: 'Imekamilika',
      pending: 'Inasubiri',
      repay: 'Lipia',
      repayDebt: 'Lipia Deni',
      total: 'Jumla',
      alreadyPaid: 'Umelipia',
      enterAmount: 'Weka Kiasi',
      cancel: 'Ghairi',
      confirmPayment: 'Thibitisha Malipo',
      order: 'Oda',
      buyer: 'Mnunuzi',
      phone: 'Simu',
      products: 'Bidhaa',
      qty: 'Idadi',
      paidStatus: 'Imelipwa',
      partialStatus: 'Sehemu',
      extra: 'Ziada',
      remainingAfter: 'Inabakia'
    }
  };

  const text = language === 'Swahili' ? t.sw : t.en;

  // Fetch debts with debounced search
  const [debouncedOrderNo, setDebouncedOrderNo] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOrderNo(fields.order_no);
    }, 500);
    return () => clearTimeout(timer);
  }, [fields.order_no]);

  const fetchUrl = `${process.env.NEXT_PUBLIC_HOST}/sales/get_debts`;
  const fetchParams = {
    page: fields.page,
    pageSize: fields.pageSize,
    business_id: selected?.id,
    payment_filter: fields.payment_filter,
    duration: fields.duration,
    search_query: debouncedOrderNo,
    start: startDate,
    end: endDate
  };

  const { data, loading, error } = useFetch<any>(fetchUrl, fetchParams);

  const debts = data?.rows || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil((data?.count || 0) / fields.pageSize);

  // Reset page when filters change
  useEffect(() => {
    setFields(prev => ({ ...prev, page: 1 }));
  }, [fields.duration, startDate, endDate, debouncedOrderNo]);

  // Helper functions
  const formatMoney = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculatePaid = (debt: any): number => {
    return typeof debt.paid_amount === 'string' 
      ? parseFloat(debt.paid_amount) 
      : debt.paid_amount;
  };

  const calculateRemaining = (debt: any): number => {
    return debt.sale_total - calculatePaid(debt);
  };

  const calculatePercent = (debt: any): number => {
    if (debt.sale_total === 0) return 0;
    return calculatePaid(debt) / debt.sale_total;
  };

  const getTotalDebt = (): number => {
    return debts.reduce((sum: number, debt: any) => sum + debt.sale_total, 0);
  };

  const getTotalPaid = (): number => {
    return debts.reduce((sum: number, debt: any) => sum + calculatePaid(debt), 0);
  };

  const handleRepay = async () => {
    if (!fields.selectedDebt || !fields.repayAmount) return;
    
    const amount = fields.repayAmount;
    if (isNaN(amount) || amount <= 0) return;
    
    setIsRepaying(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/sales/repay_debt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paid_amount: fields.repayAmount,
          id: fields.selectedDebt?.id
        })
      });
      
      if (response.ok) {
        // Close modal and reset
        setShowRepayModal(false);
        setFields(prev => ({ ...prev, repayAmount: 0 }));
        window.location.reload()
        // Refetch debts to update the list
      }
    } catch (error) {
      console.error('Repayment failed:', error);
    } finally {
      setIsRepaying(false);
    }
  };

  const handleFilterByDuration = (value: string) => {
    setFields(prev => ({ ...prev, duration: value }));
    if (value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Loading state only for initial load
  if (loading && debts.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* App Bar */}
      <div className={styles.appBar}>
        <div className={styles.appBarContent}>
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              value={fields.order_no}
              onChange={(e) => setFields(prev => ({ ...prev, order_no: e.target.value }))}
              placeholder={text.search}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.countBadge}>
            <span className={styles.countText}>
              {loading ? totalCount : totalCount}
            </span>
            {loading && <span className={styles.loader} />}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className={styles.content}>
        {/* Duration Selector - Always visible */}
        <div className={styles.durationSection}>
          <div className={styles.durationChips}>
            {['day', 'week', 'month', 'year', 'all', 'custom'].map((d) => (
              <button
                key={d}
                onClick={() => handleFilterByDuration(d)}
                className={`${styles.durationChip} ${fields.duration === d ? styles.activeChip : ''}`}
              >
                {d === 'day' ? text.day : 
                 d === 'week' ? text.week : 
                 d === 'month' ? text.month : 
                 d === 'year' ? text.year : 
                 d === 'all' ? text.all : text.custom}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        {fields.duration === 'custom' && (
          <div className={styles.dateRange}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
              placeholder={text.startDate}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
              placeholder={text.endDate}
            />
          </div>
        )}

        {debts.length === 0 ? (
          <div className={styles.emptyState}>
            <CreditCard size={64} className={styles.emptyIcon} />
            <p className={styles.emptyText}>{text.noDebts}</p>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className={styles.overviewSection}>
              <div className={styles.overviewGrid}>
                {/* Total Debt Card */}
                <div className={`${styles.card} ${styles.totalCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{text.totalDebt}</span>
                    <Wallet size={18} className={styles.cardIcon} />
                  </div>
                  <div className={styles.cardValue}>TZS {formatMoney(getTotalDebt())}</div>
                </div>

                {/* Paid Card */}
                <div className={`${styles.card} ${styles.paidCard}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{text.paid}</span>
                    <CheckCircle size={18} className={styles.cardIcon} />
                  </div>
                  <div className={styles.cardValue}>TZS {formatMoney(getTotalPaid())}</div>
                </div>
              </div>

              {/* Progress Card */}
              <div className={styles.progressCard}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressTitle}>{text.paymentProgress}</span>
                  <span className={styles.progressPercent}>
                    {((getTotalPaid() / getTotalDebt()) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${(getTotalPaid() / getTotalDebt()) * 100}%` }}
                  />
                </div>
                <div className={styles.progressStats}>
                  <div>
                    <div className={styles.statLabel}>{text.paid}</div>
                    <div className={styles.statValuePaid}>TZS {formatMoney(getTotalPaid())}</div>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.statRight}>
                    <div className={styles.statLabel}>{text.remaining}</div>
                    <div className={styles.statValueRemaining}>
                      TZS {formatMoney(getTotalDebt() - getTotalPaid())}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debts List */}
            <div className={styles.debtsList}>
              {debts.map((debt: any) => {
                const remaining = calculateRemaining(debt);
                const percent = calculatePercent(debt);
                const paid = calculatePaid(debt);
                const isCompleted = remaining <= 0;

                return (
                  <div
                    key={debt.id}
                    className={styles.debtCard}
                    onClick={() => {
                      setFields(prev => ({ ...prev, selectedDebt: debt }));
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className={styles.debtCardHeader}>
                      <div className={styles.orderBadge}>#{debt.order_no}</div>
                      <div className={`${styles.statusBadge} ${isCompleted ? styles.completed : styles.pending}`}>
                        {isCompleted ? text.completed : text.pending}
                      </div>
                    </div>

                    <div className={styles.buyerInfo}>
                      <div className={styles.avatar}>
                        <User size={18} />
                      </div>
                      <div>
                        <div className={styles.buyerName}>{debt.buyer?.name || 'Unknown'}</div>
                        <div className={styles.buyerPhone}>{debt.buyer?.phone || 'No phone'}</div>
                      </div>
                    </div>

                    <div className={styles.progressBarSmall}>
                      <div className={styles.progressFillSmall} style={{ width: `${percent * 100}%` }} />
                    </div>

                    <div className={styles.amountSection}>
                      <div>
                        <div className={styles.amountLabel}>{text.total}</div>
                        <div className={styles.amountValue}>TZS {formatMoney(debt.sale_total)}</div>
                      </div>
                      <div className={styles.amountRight}>
                        <div className={styles.amountLabel}>{text.remaining}</div>
                        <div className={`${styles.amountValue} ${remaining > 0 ? styles.remainingNegative : styles.remainingPositive}`}>
                          TZS {formatMoney(remaining)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFields(prev => ({ ...prev, selectedDebt: debt, repayAmount: 0 }));
                        setShowRepayModal(true);
                      }}
                      className={styles.repayButton}
                    >
                      {text.repay}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setFields(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={fields.page === 1}
                  className={`${styles.pageButton} ${fields.page === 1 ? styles.disabled : ''}`}
                >
                  <ChevronLeft size={18} />
                </button>
                
                {(() => {
                  const pages = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (fields.page <= 3) {
                      for (let i = 1; i <= 5; i++) pages.push(i);
                      pages.push('...');
                      pages.push(totalPages);
                    } else if (fields.page >= totalPages - 2) {
                      pages.push(1);
                      pages.push('...');
                      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      pages.push('...');
                      for (let i = fields.page - 1; i <= fields.page + 1; i++) pages.push(i);
                      pages.push('...');
                      pages.push(totalPages);
                    }
                  }
                  return pages.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof p === 'number' && setFields(prev => ({ ...prev, page: p }))}
                      className={`${styles.pageNumber} ${p === fields.page ? styles.activePage : ''}`}
                      disabled={typeof p !== 'number'}
                    >
                      {p}
                    </button>
                  ));
                })()}
                
                <button
                  onClick={() => setFields(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                  disabled={fields.page === totalPages}
                  className={`${styles.pageButton} ${fields.page === totalPages ? styles.disabled : ''}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Repay Modal */}
      {showRepayModal && fields.selectedDebt && (
        <div className={styles.modalOverlay} onClick={() => !isRepaying && setShowRepayModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHandle} />
            
            <h2 className={styles.modalTitle}>{text.repayDebt}</h2>
            <p className={styles.modalSubtitle}>
              #{fields.selectedDebt.order_no} - {fields.selectedDebt.buyer?.name}
            </p>
            
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span>{text.total}</span>
                <span className={styles.summaryValue}>TZS {formatMoney(fields.selectedDebt.sale_total)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{text.alreadyPaid}</span>
                <span className={styles.summaryPaid}>TZS {formatMoney(calculatePaid(fields.selectedDebt))}</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span className={styles.summaryBold}>{text.remaining}</span>
                <div className={styles.summaryRight}>
                  <span className={styles.summaryRemaining}>
                    TZS {formatMoney(calculateRemaining(fields.selectedDebt))}
                  </span>
                  {fields.repayAmount > 0 && (
                    <div className={`${styles.remainingPreview} ${
                      calculateRemaining(fields.selectedDebt) - fields.repayAmount >= 0 
                        ? styles.remainingPreviewPositive 
                        : styles.remainingPreviewNegative
                    }`}>
                      {calculateRemaining(fields.selectedDebt) - fields.repayAmount >= 0 
                        ? `${text.remainingAfter}: TZS ${formatMoney(calculateRemaining(fields.selectedDebt) - fields.repayAmount)}`
                        : `${text.extra}: TZS ${formatMoney(Math.abs(calculateRemaining(fields.selectedDebt) - fields.repayAmount))}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <label className={styles.inputLabel}>{text.enterAmount}</label>
            <div className={styles.amountInput}>
              <input
                type="number"
                value={fields.repayAmount}
                onChange={(e) => setFields(prev => ({ ...prev, repayAmount: Number(e.target.value) }))}
                placeholder="0"
                className={styles.input}
                disabled={isRepaying}
              />
            </div>
            
            <div className={styles.modalButtons}>
              <button 
                onClick={() => setShowRepayModal(false)} 
                className={styles.cancelButton}
                disabled={isRepaying}
              >
                {text.cancel}
              </button>
              <button
                onClick={handleRepay}
                disabled={!fields.repayAmount || fields.repayAmount <= 0 || isRepaying}
                className={styles.confirmButton}
              >
                {isRepaying ? <div className={styles.buttonSpinner} /> : text.confirmPayment}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && fields.selectedDebt && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHandle} />
            
            <div className={styles.detailsHeader}>
              <div>
                <div className={styles.detailsOrderLabel}>{text.order}</div>
                <div className={styles.detailsOrderNo}>#{fields.selectedDebt.order_no}</div>
              </div>
              <div className={`${styles.detailsStatus} ${
                calculateRemaining(fields.selectedDebt) <= 0 ? styles.detailsStatusPaid : styles.detailsStatusPartial
              }`}>
                {calculateRemaining(fields.selectedDebt) <= 0 ? text.paidStatus : text.partialStatus}
              </div>
            </div>
            
            <div className={styles.detailsBuyerCard}>
              <div className={styles.detailsBuyerRow}>
                <span className={styles.detailsLabel}>{text.buyer}</span>
                <span className={styles.detailsValue}>{fields.selectedDebt.buyer?.name || 'Unknown'}</span>
              </div>
              <div className={styles.detailsBuyerRow}>
                <span className={styles.detailsLabel}>{text.phone}</span>
                <span className={styles.detailsValue}>{fields.selectedDebt.buyer?.phone || 'No phone'}</span>
              </div>
            </div>
            
            {fields.selectedDebt.products && fields.selectedDebt.products.length > 0 && (
              <>
                <div className={styles.productsTitle}>{text.products}</div>
                <div className={styles.productsList}>
                  {fields.selectedDebt.products.map((product: any, idx: number) => {
                    const productTotal = product.quantity * product.selling_price;
                    return (
                      <div key={idx} className={styles.productRow}>
                        <div>
                          <div className={styles.productName}>{product.name}</div>
                          <div className={styles.productQty}>
                            {text.qty}: {product.quantity} × TZS {formatMoney(product.selling_price)}
                          </div>
                        </div>
                        <div className={styles.productTotal}>TZS {formatMoney(productTotal)}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            <div className={styles.detailsDivider} />
            
            <div className={styles.detailsTotals}>
              <div className={styles.detailsTotalRow}>
                <span>{text.total}</span>
                <span className={styles.detailsTotalValue}>TZS {formatMoney(fields.selectedDebt.sale_total)}</span>
              </div>
              <div className={styles.detailsTotalRow}>
                <span>{text.paid}</span>
                <span className={styles.detailsPaidValue}>TZS {formatMoney(calculatePaid(fields.selectedDebt))}</span>
              </div>
              {calculateRemaining(fields.selectedDebt) > 0 && (
                <div className={styles.detailsTotalRow}>
                  <span>{text.remaining}</span>
                  <span className={styles.detailsRemainingValue}>
                    TZS {formatMoney(calculateRemaining(fields.selectedDebt))}
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setShowRepayModal(true);
              }}
              className={styles.detailsRepayButton}
            >
              {text.repayDebt}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsPage;