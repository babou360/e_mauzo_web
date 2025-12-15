'use client';

import React, { useState } from 'react';
import { AlertCircle, RotateCcw, Package, ShoppingCart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './style.module.scss';
import DeletedBusiness from '@/components/deleted/business/page';
import DeletedProducts from '@/components/deleted/products/page';
import DeletedSales from '@/components/deleted/sales/page';
import useLanguageStore from '@/store/atoms/language';
import DeletedAttendants from '@/components/deleted/attendants/page';

export default function DeletedHomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const {language} = useLanguageStore()

  const tabs = [
    { label: language==="Swahili"?'Biashara':'Businesses', icon: Package, content: <DeletedBusiness/> },
    { label: language==="Swahili"?'Bidhaa':'Products', icon: Package, content: <DeletedProducts/> },
    { label: language==="Swahili"?'Mauzo':'Sales', icon: ShoppingCart, content: <DeletedSales/> },
    { label: language==="Swahili"?'Wauzaji':'Attendants', icon: Users, content: <DeletedAttendants /> },
  ];

  return (
    <div className={styles.container}>
      {/* App Bar */}
      <header className={styles.appBar}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{language==="Swahili"?'Zilizo Futwa':'Deleted Items'}</h1>
          <p className={styles.subtitle}>
            {
            language==="Swahili"?'Rejesha au Acha Bidhaa zifutwe kabisa baada ya siku saba.':'Restore or let items be permanently removed after 7 days.'
            }
          </p>
        </div>
      </header>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          return (
            <button
              key={i}
              className={`${styles.tab} ${activeTab === i ? styles.active : ''}`}
              onClick={() => setActiveTab(i)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <motion.div
          className={styles.indicator}
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ width: `${100 / tabs.length}%`, left: `${activeTab * (100 / tabs.length)}%` }}
        />
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.banner}
      >
        <AlertCircle size={18} />
        <span>{language==="Swahili"?'Zitafutwa kabisa baada ya siku saba.':'Items will be permanently deleted after 7 days.'}</span>
      </motion.div>

      {/* Tab Content */}
      <main className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {tabs[activeTab].content}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Reusable Deleted List
const DeletedList = ({ category }: { category: string }) => {
  const items = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `${category} #${1000 + i}`,
    deletedDate: new Date(Date.now() - (i + 1) * 86400000 * (i % 3 + 1))
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    timeAgo: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i + 1} days ago`,
  }));

  return (
    <div className={styles.list}>
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -4 }}
        >
          <div className={styles.cardContent}>
            <h3 className={styles.itemName}>{item.name}</h3>
            <div className={styles.meta}>
              <span className={styles.deletedDate}>Deleted: {item.deletedDate}</span>
              <span className={styles.timeAgo}>{item.timeAgo}</span>
            </div>
          </div>
          <button
            className={styles.restoreBtn}
            onClick={() => alert(`${item.name} restored!`)}
            aria-label={`Restore ${item.name}`}
          >
            <RotateCcw size={16} />
            <span>Restore</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
};