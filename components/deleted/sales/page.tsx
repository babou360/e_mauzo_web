'use client';

import React, { useState } from 'react';
import { RotateCcw, AlertCircle, Building2, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useFetch from '@/utils/fetch';
import useLanguageStore from '@/store/atoms/language';
import styles from './style.module.scss';
import useSendRequest from '@/utils/useSendRequest';
import useSelectedBusinessStore from '@/store/atoms/selected_business';

interface Sale {
  id: number;
  name: string;
  products: [],
  createdAt: string;
  deletedAt: string;
}

export default function DeletedSales() {
  const [fields, setFields] = useState({
    id: 0
  })
  const { language } = useLanguageStore();
  const { selected } = useSelectedBusinessStore();
  const { data: products = [], loading: prodLoading } = useFetch<Sale[]>(
    `${process.env.NEXT_PUBLIC_HOST}/sales/get_inactive_sales`,{
      business_id: selected?.id,
    }
  );

  const { sendRequest, loading: restoreLoading } = useSendRequest({
  url: `${process.env.NEXT_PUBLIC_HOST}/sales/enable_disable`,
  method: "POST",
  body: {
    id: fields.id,
  },
});

  const [showConfirmModal, setShowConfirmModal] = useState<Sale | null>(null);

  const t = (en: string, sw: string) => (language === 'Swahili' ? sw : en);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return language === 'sw' ? 'Leo' : 'Today';
    if (days === 1) return language === 'sw' ? 'Jana' : 'Yesterday';
    return language === 'sw' ? `${days} siku zilizopita` : `${days} days ago`;
  };

  const restore = (e: React.FormEvent) => {
    e.preventDefault()
    sendRequest()
  }

  const handleRestore = (business:Sale) => {
    setFields({...fields,id:business.id})
    setShowConfirmModal(business)
  }

  return (
    <div className={styles.deletedBusiness}>
      {/* Loading State */}
      {prodLoading ? (
        <div className={styles.loading}>
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className={styles.shimmerCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.empty}
        >
          <AlertCircle size={56} />
          <h3>{t('No Deleted Sale', 'Hakuna Mauzo Yaliyo futwa')}</h3>
          <p>{t('All your businesses are active.', 'Mauzo Yote yapo hai.')}</p>
        </motion.div>
      ) : (
        /* Business List */
        <motion.div
          className={styles.list}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <AnimatePresence>
            {products.map((business:any, i:number) => (
              <motion.div
                key={business.id}
                className={styles.card}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
              >
                <div className={styles.cardContent}>
                  <div className={styles.header}>
                    <Building2 size={20} className={styles.icon} />
                    <h3 className={styles.name}>{business.products[0].name}{business.products.length - 1 >= 1
                    ? `+${business.products.length - 1}`
                    : ''}</h3>
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.dateRow}>
                      <Calendar size={14} />
                      <span>{t('Created:', 'Iliundwa:')} {formatDate(business.createdAt)}</span>
                    </div>
                    <div className={styles.dateRow}>
                      <Clock size={14} />
                      <span className={styles.timeAgo}>
                        {t('Deleted', 'Ilifutwa')} {timeAgo(business.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className={styles.restoreBtn}
                  onClick={() => handleRestore(business)}
                  aria-label={t(`Restore ${business.name}`, `Rejesha ${business.name}`)}
                >
                  <RotateCcw size={16} />
                  <span>{t('Restore', 'Rejesha')}</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(null)}>
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{t('Restore Product?', 'Kurejesha Bidhaa?')}</h2>
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className={styles.closeBtn}
                  aria-label={t('Close', 'Funga')}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <p>
                  {t(
                    'Are you sure you want to restore',
                    'Je, una uhakika unataka kurejesha'
                  )}{' '}
                  <strong>{showConfirmModal.name}</strong>?
                </p>
                <p className={styles.note}>
                  {t(
                    'It will be active again immediately.',
                    'Itakuwa hai mara moja.'
                  )}
                </p>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className={styles.cancelBtn}
                >
                  {t('Cancel', 'Ghairi')}
                </button>
                <button
                  onClick={restore}
                  className={styles.confirmBtn}
                >
                  {restoreLoading?'loading..':t('Yes, Restore', 'Ndio, Rejesha')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}