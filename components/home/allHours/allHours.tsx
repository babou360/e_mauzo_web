'use client';

import React, { useEffect } from 'react';
import styles from './allHours.module.scss';

type Product = {
  product_id: string;
  product_name: string;
  count: number;
  quantity: string;
  measurement?: {
    short_form?: string;
  };
};

type HourlySale = {
  hour: string;
  total_sales: number;
  total_revenue: number;
  total_products: number;
  products: Product[];
};

type Props = {
  hourly_sales: HourlySale[];
  language?: string;
};

const AllHoursGraph: React.FC<Props> = ({
  hourly_sales,
  language = 'English',
}) => {
  
  useEffect(()=> {
    console.log('hourly sales are ',hourly_sales,language)
  },[hourly_sales])

  if (!hourly_sales || hourly_sales.length === 0) {
    return (
      <div className={styles.noData}>
        <p>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...hourly_sales.map(
      (h) => Math.max(h.total_sales, h.total_products)
    ),
    1
  );

  const salesColor = '#482691';
  const productsColor = '#FF9800';

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };


  return (
    <div className={styles.graphContainer}>
      <h2 className={styles.title}>
        {language === 'Swahili'
          ? 'Mauzo Kwa Saa'
          : 'Hourly Sales Analysis'}
      </h2>

      <div className={styles.graphArea}>
        <div className={styles.yAxis}>
          {[5, 4, 3, 2, 1, 0].map((i) => (
            <span key={i} className={styles.yLabel}>
              {Math.round((maxValue / 5) * i)}
            </span>
          ))}
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.barRow}>
            {hourly_sales.map((hourData, index) => {
              const salesHeight =
                (hourData.total_sales / maxValue) * 220 + 5;

              const productsHeight =
                (hourData.total_products / maxValue) * 220 + 5;

              return (
                <div key={index} className={styles.barGroup}>
                  <div className={styles.revenueBadge}>
                    {hourData.total_revenue > 0
                      ? `${formatMoney(hourData.total_revenue)} TZS`
                      : '-'}
                  </div>

                  <div className={styles.bars}>
                    <div
                      className={styles.salesBar}
                      style={{
                        height: `${salesHeight}px`,
                        backgroundColor: salesColor,
                      }}
                    >
                      <div className={styles.tooltip}>
                        <strong>
                          {hourData.hour}
                        </strong>

                        <div>
                          Sales: {hourData.total_sales}
                        </div>

                        <div>
                          Products: {hourData.total_products}
                        </div>

                        <div>
                          Revenue:{' '}
                          {formatMoney(
                            hourData.total_revenue
                          )}{' '}
                          TZS
                        </div>

                        {hourData.products !== undefined && hourData.products.length > 0 && (
                          <>
                            <hr />
                            <div className={styles.productsTitle}>
                              Top Products
                            </div>

                            {hourData.products.map(
                              (product, idx) => (
                                <div key={idx}>
                                  {product.product_name}
                                  {' - '}
                                  {product.count}
                                </div>
                              )
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      className={styles.productsBar}
                      style={{
                        height: `${productsHeight}px`,
                        backgroundColor: productsColor,
                      }}
                    />
                  </div>

                  <div className={styles.hourLabel}>
                    {hourData.hour}
                  </div>

                  <div className={styles.bottomValues}>
                    <span>{hourData.total_sales}</span>
                    <span>{hourData.total_products}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span
            className={styles.colorBox}
            style={{ backgroundColor: salesColor }}
          />

          <span>
            {language === 'Swahili'
              ? 'Idadi Ya Mauzo'
              : 'Sales'}
          </span>
        </div>

        <div className={styles.legendItem}>
          <span
            className={styles.colorBox}
            style={{ backgroundColor: productsColor }}
          />

          <span>
            {language === 'Swahili'
              ? 'Bidhaa Zilizouzwa'
              : 'Products'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AllHoursGraph;