'use client';

import React, { useState, useMemo } from 'react';
import styles from './TopProductsModal.module.scss';
import { FaBoxOpen, FaStar, FaTrophy, FaChevronLeft, FaChevronRight, FaChartLine } from 'react-icons/fa';

type Product = {
  product_id: string;
  product_name: string;
  count: number;
  quantity: string;
  measurement?: {
    short_form?: string;
    english?: string;
    swahili?: string;
  };
};

type Props = {
  topProducts: Product[];
  language: string;
  formatCurrency: (amount: any) => string;
};

const ITEMS_PER_PAGE = 10;

const TopProductsModal: React.FC<Props> = ({ topProducts, language, formatCurrency }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [compareMode, setCompareMode] = useState<'count' | 'quantity'>('count');

  // Parse quantity string to number for sorting
  const parseQuantity = (quantityStr: string): number => {
    const parsed = parseFloat(quantityStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Sort products: primary by count (desc), secondary by quantity (desc)
  const sortedProducts = useMemo(() => {
    return [...topProducts].sort((a, b) => {
      // First by count
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      // Then by parsed quantity
      const aQuantity = parseQuantity(a.quantity);
      const bQuantity = parseQuantity(b.quantity);
      return bQuantity - aQuantity;
    });
  }, [topProducts]);

  // Get best selling product (first after sorting)
  const bestSellingProduct = sortedProducts[0] || null;

  // Summary stats
  const totalProducts = sortedProducts.length;
  const totalSalesCount = sortedProducts.reduce((sum, p) => sum + p.count, 0);
  const totalQuantity = sortedProducts.reduce((sum, p) => sum + parseQuantity(p.quantity), 0);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getMedalColor = (index: number) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (globalIndex === 0) return '#FFD700';
    if (globalIndex === 1) return '#C0C0C0';
    if (globalIndex === 2) return '#CD7F32';
    return '#482691';
  };

  const getMedalIcon = (index: number) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    if (globalIndex === 0) return <FaTrophy />;
    if (globalIndex === 1) return <FaTrophy />;
    if (globalIndex === 2) return <FaTrophy />;
    return <FaStar />;
  };

  // Get max values for progress bars
  const maxCount = sortedProducts[0]?.count || 1;
  const maxQuantity = Math.max(...sortedProducts.map(p => parseQuantity(p.quantity)), 1);

  return (
    <div className={styles.topProductsModal}>
      {/* Header */}
      <div className={styles.modalHeader}>
        <div className={styles.headerIcon}>
          <FaBoxOpen size={32} />
        </div>
        <h2 className={styles.modalTitle}>
          {language === "Swahili" ? "Bidhaa Zilizouzwa Zaidi" : "Top Products"}
        </h2>
        <p className={styles.modalSubtitle}>
          {language === "Swahili" 
            ? "Bidhaa zilizo na mauzo makubwa zaidi" 
            : "Products with the highest sales volume"}
        </p>
      </div>

      {/* Summary Section */}
      <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📦</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>
              {language === "Swahili" ? "Jumla ya Bidhaa" : "Total Products"}
            </span>
            <span className={styles.summaryValue}>{totalProducts}</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>🏆</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>
              {language === "Swahili" ? "Bidhaa Inayouza Zaidi" : "Best Selling"}
            </span>
            <span className={styles.summaryValue}>
              {bestSellingProduct ? bestSellingProduct.product_name : '-'}
            </span>
            {bestSellingProduct && (
              <span className={styles.summarySubValue}>
                {bestSellingProduct.count} {language === "Swahili" ? "mauzo" : "sales"}
              </span>
            )}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📊</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>
              {language === "Swahili" ? "Jumla ya Mauzo" : "Total Sales"}
            </span>
            <span className={styles.summaryValue}>{totalSalesCount}</span>
          </div>
        </div>
      </div>

      {/* Compare Mode Toggle */}
      <div className={styles.compareToggle}>
        <button
          className={`${styles.compareBtn} ${compareMode === 'count' ? styles.active : ''}`}
          onClick={() => setCompareMode('count')}
        >
          <FaChartLine /> {language === "Swahili" ? "Linganisha kwa Mauzo" : "Compare by Sales Count"}
        </button>
        <button
          className={`${styles.compareBtn} ${compareMode === 'quantity' ? styles.active : ''}`}
          onClick={() => setCompareMode('quantity')}
        >
          <FaChartLine /> {language === "Swahili" ? "Linganisha kwa Kiasi" : "Compare by Quantity"}
        </button>
      </div>

      {/* Products List */}
      <div className={styles.productsList}>
        {paginatedProducts.map((product, idx) => {
          const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx;
          const compareValue = compareMode === 'count' 
            ? product.count 
            : parseQuantity(product.quantity);
          const maxCompareValue = compareMode === 'count' ? maxCount : maxQuantity;
          const progressPercent = (compareValue / maxCompareValue) * 100;

          return (
            <div key={product.product_id} className={styles.productCard}>
              <div className={styles.productRank} style={{ background: getMedalColor(idx) }}>
                <span className={styles.rankNumber}>{globalIndex + 1}</span>
                <span className={styles.rankIcon}>{getMedalIcon(idx)}</span>
              </div>
              
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.product_name}</h3>
                <div className={styles.productStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>
                      {language === "Swahili" ? "Mauzo" : "Sales"}:
                    </span>
                    <span className={styles.statValue}>{product.count}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>
                      {language === "Swahili" ? "Kiasi" : "Quantity"}:
                    </span>
                    <span className={styles.statValue}>
                      {product.quantity}
                      {product.measurement?.short_form && ` ${product.measurement.short_form}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={styles.productProgress}>
                <div 
                  className={styles.progressBar}
                  style={{ 
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, #482691, #8E44AD)`
                  }}
                />
              </div>

              {/* Comparison highlight */}
              {compareMode === 'quantity' && product.measurement?.short_form && (
                <div className={styles.measurementBadge}>
                  {product.measurement.short_form}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >
            <FaChevronLeft />
          </button>
          
          <span className={styles.pageInfo}>
            {language === "Swahili" ? "Ukurasa" : "Page"} {currentPage} {language === "Swahili" ? "ya" : "of"} {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Footer note */}
      <div className={styles.modalFooter}>
        <p>
          {language === "Swahili" 
            ? `Kuonyesha ${paginatedProducts.length} kati ya ${totalProducts} bidhaa` 
            : `Showing ${paginatedProducts.length} of ${totalProducts} products`}
        </p>
      </div>
    </div>
  );
};

export default TopProductsModal;