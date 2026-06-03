'use client';

import React from "react";
import styles from "./HourlyProductsGraph.module.scss";

type Product = {
  product_name: string;
  count: number | string;
  quantity: number | string;
  measurement?: {
    short_form?: string;
    english?: string;
    swahili?: string;
  };
};

type Props = {
  topProducts: Product[];
  hour: string | number;
  language?: string;
};

const HourlyProductsGraph: React.FC<Props> = ({ topProducts, hour, language = "English" }) => {
  if (!topProducts || topProducts.length === 0) {
    return (
      <div className={styles.noData}>
        <p>No data available</p>
      </div>
    );
  }

  const toDouble = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  };

  const counts = topProducts.map((p) => toDouble(p.count));
  const quantities = topProducts.map((p) => toDouble(p.quantity));

  const maxCount = Math.max(...counts, ...quantities, 1);

  const countColor = "#482691";
  const quantityColor = "#FF9800";

  return (
    <div className={styles.graphContainer}>
      <h2 className={styles.hourTitle}>
        {language === "English" ? "Hour:" : "Saa:"} {hour}
      </h2>

      <div className={styles.graphArea}>
        <div className={styles.yAxis}>
          {[5, 4, 3, 2, 1, 0].map((i) => {
            const value = ((maxCount / 5) * i).toFixed(0);
            return (
              <span key={i} className={styles.yLabel}>
                {value}
              </span>
            );
          })}
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.barRow}>
            {topProducts.map((p: any, i) => {
              const countHeight = (toDouble(p.count) / maxCount) * 200 + 5;
              const quantityHeight = (toDouble(p.quantity) / maxCount) * 200 + 5;

              return (
                <div key={i} className={styles.barGroup}>
                  <div className={styles.labelTop}>
                    {toDouble(p.count)} / {toDouble(p.quantity)}{" "}
                    {p.measurement?.short_form ?? (language === "Swahili" ? "N/A" : "N/A")}
                  </div>

                  <div className={styles.bars}>
                    <div
                      className={styles.countBar}
                      style={{
                        height: `${countHeight}px`,
                        backgroundColor: countColor,
                      }}
                    ></div>
                    <div
                      className={styles.quantityBar}
                      style={{
                        height: `${quantityHeight}px`,
                        backgroundColor: quantityColor,
                      }}
                    ></div>
                  </div>

                  <div className={styles.productLabel}>
                    {p.product_name}
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
            style={{ backgroundColor: countColor }}
          ></span>
          <span>
            {language === "Swahili" ? "Idadi Ya Mauzo" : "Count"}
          </span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={styles.colorBox}
            style={{ backgroundColor: quantityColor }}
          ></span>
          <span>{language === "Swahili" ? "Kiasi" : "Quantity"}</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyProductsGraph;