'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Edit3, Trash2, MapPin, Calendar, Globe, Phone, Mail,
  Building2, Map, Navigation, CreditCard, Tag, CheckCircle,
  X, Search, ChevronDown, Loader2, ArrowLeft, Verified,
  Store, TrendingUp, Clock, Package, ShoppingCart,
  Lock, AlertTriangle, ThumbsUp, DollarSign, Calendar as CalendarIcon,
  Briefcase, LocateFixed, Image as ImageIcon, Plus, Camera,
  Check, Heart, Star, Award, Shield, Users, Eye, MessageCircle,
  ArrowRight, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './style.module.scss';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useFetch from '@/utils/fetch';
import useSendMultipartRequest from '@/utils/useSendMultipartRequest';
import Link from 'next/link';

interface BusinessData {
  id: number;
  name: string;
  description: string;
  category: { slug: string; english_name: string; swahili_name: string };
  type: { slug: string; english_name: string; swahili_name: string };
  sales_category: { value: string; english: string; swahili: string };
  country: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  latlong: string;
  phone: string;
  email: string;
  currency: string;
  delivery_available: boolean | null;
  sells_online: boolean | null;
  always_open: boolean | null;
  opening_hours: Record<string, { open: string; close: string }> | null;
  status: string;
  isVerified: boolean;
  pricing_category: string;
  thumbnail: string | null;
  lastPaid: string;
  createdAt: string;
}
interface type {
  id: number,
  slug: string,
  image: string,
  status: string,
  createdAt: string,
  updatedAt: string,
  english_name: string,
  swahili_name: string,
  english_description: string,
  swahili_description: string
}
interface category {
  id: number,
  slug: string,
  image: string,
  status: string,
  createdAt: string,
  updatedAt: string,
  english_name: string,
  swahili_name: string,
  english_description: string,
  swahili_description: string
}
interface salesCategory {
  value: string, 
  english: string, 
  swahili: string
}
interface FormData {
  name: string;
  description: string;
  category: category;
  type: type;
  sales_category: salesCategory;
  country: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  latlong: string;
  phone: string;
  email: string;
  currency: string;
  deliveryAvailable: boolean;
  sellsOnline: boolean;
  alwaysOpen: boolean;
  isTheSameContact: boolean;
  urls: string[];
  openingHours: Record<string, { open: string; close: string }>;
}

const countries = ['Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi', 'Zambia', 'Malawi', 'Mozambique'];
const tanzaniaRegions = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya', 'Zanzibar',
  'Kilimanjaro', 'Tanga', 'Morogoro', 'Iringa', 'Kagera', 'Kigoma',
  'Mtwara', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Tabora', 'Singida'
];
const currencies = ['TZS', 'USD', 'KES', 'UGX', 'RWF', 'BIF', 'ZMW', 'MWK', 'MZN'];

const weekDays = [
  { code: 'mon', en: 'Monday', sw: 'Jumatatu' },
  { code: 'tue', en: 'Tuesday', sw: 'Jumanne' },
  { code: 'wed', en: 'Wednesday', sw: 'Jumatano' },
  { code: 'thu', en: 'Thursday', sw: 'Alhamisi' },
  { code: 'fri', en: 'Friday', sw: 'Ijumaa' },
  { code: 'sat', en: 'Saturday', sw: 'Jumamosi' },
  { code: 'sun', en: 'Sunday', sw: 'Jumapili' },
];

const salesCategories = [
  { value: 'retail', english: 'Retail', swahili: 'Rejareja', icon: '🏪', description: 'Selling directly to customers' },
  { value: 'wholesale', english: 'Wholesale', swahili: 'Jumla', icon: '📦', description: 'Selling in bulk to businesses' },
  { value: 'both', english: 'Both', swahili: 'Vyote', icon: '🔄', description: 'Both retail and wholesale' },
];

export default function MyBusinessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isSwahili, setIsSwahili] = useState(false);
  const { selected, setSelected } = useSelectedBusinessStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [editSuccess, setEditSuccess] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // Fetch categories and types from API
  const { data: categoriesData, loading: categoriesLoading } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/business-categories/get_business_categories`
  );
  const { data: user, loading: userLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/users/get_current_user`, {
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mauzo_token') : ''}`
  });

  const { data: typesData, loading: typesLoading } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/business-types/get_business_types`
  );

  const categories = categoriesData?.data || [];
  const types = typesData?.data || [];

  // Initialize form with default values
  const defaultForm: FormData = {
    name: '',
    description: '',
    category: {
      id: 0,
      slug: '',
      image: '',
      status: '',
      createdAt: '',
      updatedAt: '',
      english_name: '',
      swahili_name: '',
      english_description: '',
      swahili_description: ''
    },
    type: {
      id: 0,
      slug: '',
      image: '',
      status: '',
      createdAt: '',
      updatedAt: '',
      english_name: '',
      swahili_name: '',
      english_description: '',
      swahili_description: ''
    },
    sales_category: {
      value: '',
      english: '',
      swahili: ''
    },
    country: '',
    city: '',
    district: '',
    ward: '',
    street: '',
    latlong: '',
    phone: '',
    email: '',
    currency: 'TZS',
    deliveryAvailable: false,
    sellsOnline: false,
    alwaysOpen: false,
    isTheSameContact: false,
    urls: [],
    openingHours: {
      mon: { open: '09:00', close: '17:00' },
      tue: { open: '09:00', close: '17:00' },
      wed: { open: '09:00', close: '17:00' },
      thu: { open: '09:00', close: '17:00' },
      fri: { open: '09:00', close: '17:00' },
      sat: { open: '10:00', close: '14:00' },
      sun: { open: '', close: '' },
    },
  };

  const [form, setForm] = useState<FormData>(defaultForm);

  const { sendRequest: editBusiness, loading: editLoading, error: editError, data: editResponse } =
    useSendMultipartRequest({
      url: `${process.env.NEXT_PUBLIC_HOST}/business/edit_business`,
      method: 'POST',
      body: {
        business_id: selected?.id,
        always_open: form.alwaysOpen,
        name: form.name,
        category: JSON.stringify(categories.find((item: any) => item.slug === form.category.slug)),
        type: JSON.stringify(types.find((item: any) => item.slug === form.type.slug)),
        country: form.country,
        city: form.city,
        district: form.district,
        ward: form.ward,
        street: form.street,
        latlong: form.latlong,
        phone: form.phone,
        email: form.email,
        sales_category: JSON.stringify(salesCategories.find((item) => item.value === form.sales_category.value)),
        currency: form.currency,
        opening_hours: JSON.stringify(form.openingHours),
        delivery_available: form.deliveryAvailable,
        description: form.description,
        sells_online: form.sellsOnline,
        thumbnail: thumbnail
      }
    });

  const t = (en: string, sw: string) => {
    if (typeof window === 'undefined') return en;
    const language = localStorage.getItem('mauzo_language');
    return language === 'Swahili' ? sw : en;
  };

  // Initialize form with selected business data
  useEffect(() => {
    console.log('selected business is ', selected);
    const language = localStorage.getItem('mauzo_language');
    setIsSwahili(language === 'Swahili');
    
    if (selected) {
      setSelectedBusiness(selected as unknown as BusinessData);
      
      // Find the full category object
      const selectedCategory = categories.find(
        (cat: any) => cat.slug === (selected.category as any)?.slug
      );
      
      // Find the full type object
      const selectedType = types.find(
        (type: any) => type.slug === (selected.type as any)?.slug
      );
      
      // Find the full sales category object
      const selectedSalesCategory = salesCategories.find(
        (sc: any) => sc.value === (selected.sales_category as any)?.value
      );
      
      // Map the business data correctly to form fields
      setForm({
        name: selected.name || '',
        description: selected.description || '',
        category: selectedCategory || defaultForm.category,
        type: selectedType || defaultForm.type,
        sales_category: selectedSalesCategory || defaultForm.sales_category,
        country: selected.country || '',
        city: selected.city || '',
        district: selected.district || '',
        ward: selected.ward || '',
        street: selected.street || '',
        latlong: selected.latlong || '',
        phone: selected.phone || '',
        email: selected.email || '',
        currency: selected.currency || 'TZS',
        deliveryAvailable: selected.delivery_available === true,
        sellsOnline: selected.sells_online === true,
        alwaysOpen: selected.always_open === true,
        isTheSameContact: false,
        urls: [],
        openingHours: selected.opening_hours || defaultForm.openingHours,
      });
      
      if (selected.thumbnail) {
        setThumbnailPreview(selected.thumbnail);
      }
    }
    setIsLoading(false);
  }, [selected, categories, types]);

  // Helper function to update category
  const updateCategory = (slug: string) => {
    const category = categories.find((c: any) => c.slug === slug);
    if (category) {
      setForm({ ...form, category });
    }
  };

  // Helper function to update type
  const updateType = (slug: string) => {
    const type = types.find((t: any) => t.slug === slug);
    if (type) {
      setForm({ ...form, type });
    }
  };

  // Helper function to update sales category
  const updateSalesCategory = (value: string) => {
    const salesCategory = salesCategories.find((sc) => sc.value === value);
    if (salesCategory) {
      setForm({ ...form, sales_category: salesCategory });
    }
  };


  const getDisplayValue = (obj: any) => {
    if (!obj) return '—';
    if (typeof obj === 'string') return obj;
    if (isSwahili) {
      return obj.swahili_name || obj.swahili || obj.english_name || obj.name || obj.english;
    }
    return obj.english_name || obj.english || obj.name || obj.swahili_name;
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'inactive': return '#fb923c';
      case 'suspended': return '#ef4444';
      case 'deleted': return '#ef4444';
      default: return '#22c55e';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { en: string; sw: string }> = {
      active: { en: 'Active', sw: 'Inafanya Kazi' },
      inactive: { en: 'Inactive', sw: 'Haifanyi Kazi' },
      suspended: { en: 'Suspended', sw: 'Imesimamishwa' },
      deleted: { en: 'Deleted', sw: 'Imefutwa' },
    };
    const s = statusMap[status?.toLowerCase()];
    return s ? (isSwahili ? s.sw : s.en) : status;
  };

  const buildFullAddress = () => {
    const parts = [
      selectedBusiness?.street,
      selectedBusiness?.ward,
      selectedBusiness?.district,
      selectedBusiness?.city,
      selectedBusiness?.country,
    ].filter(Boolean);
    if (parts.length === 0) return t('No address set', 'Hakuna anwani iliyowekwa');
    return parts.join(', ');
  };

  const formatOpeningHours = () => {
    if (selectedBusiness?.always_open) {
      return t('Open 24/7', 'Funguliwa Masaa 24 kila siku');
    }
    
    const hours = selectedBusiness?.opening_hours || form.openingHours;
    const lines = weekDays
      .filter(day => hours[day.code]?.open && hours[day.code]?.close)
      .slice(0, 3)
      .map(day => {
        const dayName = t(day.en, day.sw);
        const h = hours[day.code];
        return `${dayName}: ${h.open} – ${h.close}`;
      });
    
    if (lines.length === 0) return t('Not set', 'Haijawekwa');
    if (lines.length === 7) return lines.join(' • ');
    return lines.join(' • ') + (lines.length < 7 ? '...' : '');
  };

  const calculateDaysRemaining = () => {
    if (!selected?.lastPaid) return 0;
    const lastPaid = new Date(selected.lastPaid);
    const now = new Date();
    console.log('last paid ',lastPaid)
    const diffDays = Math.round((lastPaid.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays;
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || categoriesLoading || typesLoading || userLoading) {
    return (
      <div className={styles.loaderContainer}>
        <motion.div 
          className={styles.loader}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.loaderRing}></div>
          <Store size={40} />
        </motion.div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <motion.div 
        className={styles.emptyContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Store size={80} />
        <h3>{t('No Business Found', 'Hakuna Biashara Ilyepatikana')}</h3>
        <p>{t('Please register a business first', 'Tafadhali sajili biashara kwanza')}</p>
        <button className={styles.registerBtn}>Register Business</button>
      </motion.div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGradient} />
      
      <div className={styles.contentWrapper}>
        {/* Premium Header */}
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <button className={styles.backBtn} onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
          </button>
          
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{t('My Business', 'Biashara Yangu')}</h1>
            <p className={styles.subtitle}>{t('Manage your business profile', 'Simamia wasifu wa biashara yako')}</p>
          </div>
          
          <div className={styles.headerActions}>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEdit(true)} 
              className={styles.actionBtn}
            >
              <Edit3 size={18} />
              <span>{t('Edit', 'Hariri')}</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDelete(true)} 
              className={`${styles.actionBtn} ${styles.danger}`}
            >
              <Trash2 size={18} />
              <span>{t('Delete', 'Futa')}</span>
            </motion.button>
          </div>
        </motion.header>

        {/* Hero Section - Premium Redesign */}
        <motion.div 
          className={styles.heroSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.heroBackground}>
            <div className={styles.heroPattern}>
              <div className={styles.patternDot} />
              <div className={styles.patternDot} />
              <div className={styles.patternDot} />
              <div className={styles.patternDot} />
            </div>
          </div>
          
          <div className={styles.heroContent}>
            <div className={styles.heroMain}>
              <div className={styles.businessAvatar}>
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt={selectedBusiness.name} />
                ) : (
                  <Store size={48} />
                )}
                <button className={styles.changePhotoBtn} onClick={() => setShowEdit(true)}>
                  <Camera size={12} />
                </button>
              </div>
              
              <div className={styles.businessInfo}>
                <div className={styles.businessNameRow}>
                  <h2>{selectedBusiness.name}</h2>
                  {selectedBusiness.isVerified && (
                    <motion.span 
                      className={styles.verifiedBadge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Verified size={14} />
                      {t('Verified', 'Imehakikishwa')}
                    </motion.span>
                  )}
                </div>
                
                <div className={styles.businessMeta}>
                  <motion.span 
                    className={`${styles.statusBadge} ${styles[selectedBusiness.status?.toLowerCase() || 'active']}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className={styles.statusDot} style={{ backgroundColor: getStatusColor(selectedBusiness.status) }} />
                    {getStatusText(selectedBusiness.status)}
                  </motion.span>
                  <span className={styles.metaBadge}>
                    <Award size={12} />
                    {selectedBusiness.pricing_category === 'premium' ? 'Premium' : 'Basic'}
                  </span>
                  <span className={styles.metaBadge}>
                    <Tag size={12} />
                    {getDisplayValue(selectedBusiness.category)}
                  </span>
                </div>
                
                <div className={styles.businessAddress}>
                  <MapPin size={14} />
                  <span>{buildFullAddress()}</span>
                </div>
                
                <div className={styles.businessMetrics}>
                  <div className={styles.metricItem}>
                    <div className={styles.metricValue}>⭐ 4.8</div>
                    <div className={styles.metricLabel}>Rating</div>
                  </div>
                  <div className={styles.metricDivider} />
                  <div className={styles.metricItem}>
                    <div className={styles.metricValue}>1,234</div>
                    <div className={styles.metricLabel}>Customers</div>
                  </div>
                  <div className={styles.metricDivider} />
                  <div className={styles.metricItem}>
                    <div className={styles.metricValue}>342</div>
                    <div className={styles.metricLabel}>Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation - Premium */}
        <div className={styles.tabNav}>
          {[
            { id: 'overview', icon: <Eye size={16} />, labelEn: 'Overview', labelSw: 'Muhtasari' },
            { id: 'details', icon: <Building2 size={16} />, labelEn: 'Details', labelSw: 'Maelezo' },
            { id: 'hours', icon: <Clock size={16} />, labelEn: 'Hours', labelSw: 'Saa' },
            { id: 'analytics', icon: <TrendingUp size={16} />, labelEn: 'Analytics', labelSw: 'Takwimu' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              <span>{t(tab.labelEn, tab.labelSw)}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.tabContent}
            >
              {/* Stats Grid */}
              <div className={styles.statsGrid}>
                <motion.div 
                  className={styles.statCard}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, rgba(72, 38, 145, 0.1), rgba(72, 38, 145, 0.05))' }}>
                    <Users size={20} />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>1,234</span>
                    <span className={styles.statLabel}>{t('Total Customers', 'Wateja Jumla')}</span>
                  </div>
                  <div className={styles.statTrend}>↑ 12%</div>
                </motion.div>
                <motion.div 
                  className={styles.statCard}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>+23%</span>
                    <span className={styles.statLabel}>{t('Growth', 'Ukuaji')}</span>
                  </div>
                  <div className={styles.statTrend}>↑ This month</div>
                </motion.div>
                <motion.div 
                  className={styles.statCard}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(251, 146, 60, 0.05))' }}>
                    <Package size={20} />
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>342</span>
                    <span className={styles.statLabel}>{t('Orders', 'Maagizo')}</span>
                  </div>
                  <div className={styles.statTrend}>↑ 8%</div>
                </motion.div>
              </div>

              {/* Contact Information Card */}
              <div className={styles.infoSection}>
                <h3>
                  <Phone size={18} />
                  {t('Contact Information', 'Taarifa za Mawasiliano')}
                </h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <Phone size={16} />
                    <div>
                      <span className={styles.infoLabel}>{t('Phone', 'Simu')}</span>
                      <span className={styles.infoValue}>{selectedBusiness.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Mail size={16} />
                    <div>
                      <span className={styles.infoLabel}>{t('Email', 'Barua Pepe')}</span>
                      <span className={styles.infoValue}>{selectedBusiness.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Globe size={16} />
                    <div>
                      <span className={styles.infoLabel}>{t('Country', 'Nchi')}</span>
                      <span className={styles.infoValue}>{selectedBusiness.country || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <DollarSign size={16} />
                    <div>
                      <span className={styles.infoLabel}>{t('Currency', 'Sarafu')}</span>
                      <span className={styles.infoValue}>{selectedBusiness.currency || 'TZS'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Card */}
              <div className={styles.featuresSection}>
                <h3>{t('Business Features', 'Vipengele vya Biashara')}</h3>
                <div className={styles.featuresGrid}>
                  <div className={`${styles.featureCard} ${selectedBusiness.delivery_available ? styles.active : ''}`}>
                    <div className={styles.featureIcon}>
                      {selectedBusiness.delivery_available ? <CheckCircle size={20} /> : <Package size={20} />}
                    </div>
                    <span>{t('Delivery Available', 'Uwasilishaji Inapatikana')}</span>
                    {selectedBusiness.delivery_available && <Check size={14} className={styles.featureCheck} />}
                  </div>
                  <div className={`${styles.featureCard} ${selectedBusiness.sells_online ? styles.active : ''}`}>
                    <div className={styles.featureIcon}>
                      {selectedBusiness.sells_online ? <CheckCircle size={20} /> : <ShoppingCart size={20} />}
                    </div>
                    <span>{t('Sells Online', 'Inauza Mtandaoni')}</span>
                    {selectedBusiness.sells_online && <Check size={14} className={styles.featureCheck} />}
                  </div>
                  <div className={`${styles.featureCard} ${selectedBusiness.always_open ? styles.active : ''}`}>
                    <div className={styles.featureIcon}>
                      {selectedBusiness.always_open ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <span>{t('24/7 Operation', 'Uendeshaji Saa 24')}</span>
                    {selectedBusiness.always_open && <Check size={14} className={styles.featureCheck} />}
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className={styles.paymentSection}>
                <div className={styles.paymentCard}>
                  <div className={styles.paymentIcon}>
                    <Shield size={24} />
                  </div>
                  <div className={styles.paymentInfo}>
                    <h4>{t('Subscription Status', 'Hali ya Usajili')}</h4>
                    <p>
                      {t('Your plan renews in', 'Mpango wako utasasishwa baada ya')} 
                      <strong> {calculateDaysRemaining()} {t('days', 'siku')}</strong>
                    </p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={styles.payBtn}
                  >
                    <Link href="/subscription" style={{textDecoration:"none"}}>
                      {t('Renew Now', 'Sasisha Sasa')}
                    </Link>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.tabContent}
            >
              <div className={styles.detailsGrid}>
                <DetailCard 
                  icon={Building2} 
                  label={t('Business Name', 'Jina la Biashara')} 
                  value={selectedBusiness.name}
                />
                <DetailCard 
                  icon={Tag} 
                  label={t('Category', 'Kipengele')} 
                  value={getDisplayValue(selectedBusiness.category)}
                />
                <DetailCard 
                  icon={Briefcase} 
                  label={t('Type', 'Aina')} 
                  value={getDisplayValue(selectedBusiness.type)}
                />
                <DetailCard 
                  icon={TrendingUp} 
                  label={t('Sales Category', 'Aina ya Mauzo')} 
                  value={getDisplayValue(selectedBusiness.sales_category)}
                />
                <DetailCard 
                  icon={MapPin} 
                  label={t('Location', 'Mahali')} 
                  value={buildFullAddress()}
                />
                <DetailCard 
                  icon={Calendar} 
                  label={t('Joined', 'Alijiunga')} 
                  value={formatDate(selectedBusiness.createdAt)}
                />
              </div>
              
              {selectedBusiness.description && (
                <motion.div 
                  className={styles.descriptionCard}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4>{t('Description', 'Maelezo')}</h4>
                  <p>{selectedBusiness.description}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'hours' && (
            <motion.div
              key="hours"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.tabContent}
            >
              <div className={styles.hoursCard}>
                <div className={styles.hoursHeader}>
                  <Clock size={20} />
                  <h3>{t('Business Hours', 'Saa za Kufungua')}</h3>
                </div>
                <div className={styles.hoursList}>
                  {weekDays.map(day => (
                    <div key={day.code} className={styles.hourItem}>
                      <span className={styles.dayName}>{t(day.en, day.sw)}</span>
                      {selectedBusiness.always_open ? (
                        <span className={styles.hourValue}>24/7</span>
                      ) : (
                        <span className={styles.hourValue}>
                          {(() => {
                            const hours = selectedBusiness.opening_hours || form.openingHours;
                            return hours[day.code]?.open && hours[day.code]?.close
                              ? `${hours[day.code].open} - ${hours[day.code].close}`
                              : t('Closed', 'Imefungwa');
                          })()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.tabContent}
            >
              <div className={styles.analyticsCard}>
                <div className={styles.comingSoon}>
                  <Sparkles size={48} />
                  <h3>{t('Coming Soon', 'Inakuja Hivi Karibuni')}</h3>
                  <p>{t('Advanced analytics will be available in the next update', 'Takwimu za kina zitapatikana katika sasisho lijalo')}</p>
                  <div className={styles.comingSoonProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: '65%' }} />
                    </div>
                    <span>65% Complete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <EditModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        form={form}
        setForm={setForm}
        categories={categories}
        types={types}
        thumbnailPreview={thumbnailPreview}
        onThumbnailChange={handleThumbnailChange}
        onSave={editBusiness}
        updateLoading={editLoading}
        editSuccess={editSuccess}
        editError={editError}
        isSwahili={isSwahili}
        t={t}
        user={user}
        updateCategory={updateCategory}
        updateType={updateType}
        updateSalesCategory={updateSalesCategory}
      />

      {/* Delete Dialog */}
      <DeleteDialog 
        show={showDelete} 
        onClose={() => setShowDelete(false)} 
        onConfirm={() => setShowDelete(false)}
        isSwahili={isSwahili}
        t={t}
      />
    </div>
  );
}

// Detail Card Component
const DetailCard = ({ icon: Icon, label, value }: any) => (
  <motion.div 
    className={styles.detailCard}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
  >
    <div className={styles.detailIcon}>
      <Icon size={18} />
    </div>
    <div className={styles.detailContent}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value || '—'}</span>
    </div>
  </motion.div>
);

// Edit Modal Component
const EditModal = ({ 
  show, onClose, form, setForm, categories, types,
  thumbnailPreview, onThumbnailChange, onSave, updateLoading, editSuccess, editError, isSwahili, t, user,
  updateCategory, updateType, updateSalesCategory
}: any) => {
  const [step, setStep] = useState(1);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div 
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2>{t('Edit Business', 'Hariri Biashara')}</h2>
            <p>{t('Update your business information', 'Sasisha taarifa za biashara yako')}</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {editSuccess && (
            <motion.div 
              className={styles.successMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CheckCircle size={20} />
              <span>{t('Business updated successfully!', 'Biashara imesasishwa kikamilifu!')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {editError && (
          <motion.div 
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle size={20} />
            <span>{t('Failed to update business', 'Imeshindwa kusasisha biashara')}</span>
          </motion.div>
        )}

        {/* Step Indicators */}
        <div className={styles.modalSteps}>
          {[
            { step: 1, label: t('Basic', 'Msingi') },
            { step: 2, label: t('Location', 'Mahali') },
            { step: 3, label: t('Hours', 'Saa') },
          ].map((s) => (
            <div key={s.step} className={styles.modalStep}>
              <div className={`${styles.stepCircle} ${step >= s.step ? styles.active : ''}`}>
                {step > s.step ? <Check size={14} /> : s.step}
              </div>
              <span>{s.label}</span>
              {s.step < 3 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        <div className={styles.modalBody}>
          {step === 1 && (
            <div className={styles.modalStepContent}>
              <div className={styles.formField}>
                <label>{t('Business Name', 'Jina la Biashara')} *</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={t('Enter business name', 'Ingiza jina la biashara')}
                />
              </div>

              <div className={styles.formField}>
                <label>{t('Category', 'Kipengele')} *</label>
                <SearchableDropdown
                  items={categories.map((c: any) => isSwahili ? c.swahili_name : c.english_name)}
                  value={form.category ? (isSwahili ? form.category.swahili_name : form.category.english_name) : ''}
                  onSelect={(val: string) => {
                    const selected = categories.find((c: any) => 
                      (isSwahili ? c.swahili_name : c.english_name) === val
                    );
                    if (selected) {
                      updateCategory(selected.slug);
                    }
                  }}
                  placeholder={t('Select category', 'Chagua kipengele')}
                  t={t}
                />
              </div>

              <div className={styles.formField}>
                <label>{t('Type', 'Aina')} *</label>
                <SearchableDropdown
                  items={types.map((t: any) => isSwahili ? t.swahili_name : t.english_name)}
                  value={form.type ? (isSwahili ? form.type.swahili_name : form.type.english_name) : ''}
                  onSelect={(val: string) => {
                    const selected = types.find((t: any) => 
                      (isSwahili ? t.swahili_name : t.english_name) === val
                    );
                    if (selected) {
                      updateType(selected.slug);
                    }
                  }}
                  placeholder={t('Select type', 'Chagua aina')}
                  t={t}
                />
              </div>

              <div className={styles.formField}>
                <label>{t('Sales Category', 'Aina ya Mauzo')} *</label>
                <div className={styles.salesCategoryGrid}>
                  {salesCategories.map(cat => (
                    <div 
                      key={cat.value}
                      className={`${styles.salesCategoryCard} ${form.sales_category?.value === cat.value ? styles.selected : ''}`}
                      onClick={() => updateSalesCategory(cat.value)}
                    >
                      <div className={styles.salesCategoryIcon}>{cat.icon}</div>
                      <div className={styles.salesCategoryInfo}>
                        <strong>{isSwahili ? cat.swahili : cat.english}</strong>
                        <small>{cat.description}</small>
                      </div>
                      {form.sales_category?.value === cat.value && <Check size={16} className={styles.salesCategoryCheck} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formField}>
                <label>{t('Description', 'Maelezo')}</label>
                <textarea 
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder={t('Describe your business', 'Elezea biashara yako')}
                />
              </div>

              <div className={styles.formField}>
                <label>{t('Thumbnail', 'Picha ya Kichwa')}</label>
                <div className={styles.thumbnailUpload} onClick={() => document.getElementById('edit-thumbnail')?.click()}>
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Preview" />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <Camera size={40} />
                      <span>{t('Click to upload', 'Bonyeza kupakia')}</span>
                      <small>{t('PNG, JPG up to 5MB', 'PNG, JPG hadi 5MB')}</small>
                    </div>
                  )}
                  <input id="edit-thumbnail" type="file" accept="image/*" hidden onChange={onThumbnailChange} />
                </div>
              </div>

              {/* Use Same Contact Info Toggle */}
              {user?.user && (
                <div className={styles.sameContactToggle}>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox"
                      checked={form.isTheSameContact}
                      onChange={e => setForm({ ...form, isTheSameContact: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <div>
                    <strong>{t('Use my contact info', 'Tumia mawasiliano yangu')}</strong>
                    <p>{t('Use phone and email from your profile', 'Tumia simu na barua pepe kutoka kwa wasifu wako')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className={styles.modalStepContent}>
              <div className={styles.formField}>
                <label>{t('Country', 'Nchi')} *</label>
                <SearchableDropdown
                  items={countries}
                  value={form.country}
                  onSelect={(val: string) => setForm({ ...form, country: val })}
                  placeholder={t('Select country', 'Chagua nchi')}
                  t={t}
                />
              </div>

              <div className={styles.formField}>
                <label>{t('City/Region', 'Mji/Mkoa')} *</label>
                {form.country === 'Tanzania' ? (
                  <SearchableDropdown
                    items={tanzaniaRegions}
                    value={form.city}
                    onSelect={(val: string) => setForm({ ...form, city: val })}
                    placeholder={t('Select region', 'Chagua mkoa')}
                    t={t}
                  />
                ) : (
                  <input 
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder={t('Enter city', 'Ingiza mji')}
                  />
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>{t('District', 'Wilaya')}</label>
                  <input 
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    placeholder={t('District', 'Wilaya')}
                  />
                </div>
                <div className={styles.formField}>
                  <label>{t('Ward', 'Kata')}</label>
                  <input 
                    value={form.ward}
                    onChange={e => setForm({ ...form, ward: e.target.value })}
                    placeholder={t('Ward', 'Kata')}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label>{t('Street', 'Mtaa')}</label>
                <input 
                  value={form.street}
                  onChange={e => setForm({ ...form, street: e.target.value })}
                  placeholder={t('Street name', 'Jina la mtaa')}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>{t('Phone', 'Simu')} *</label>
                  <input 
                    value={form.isTheSameContact ? user?.user?.phone : form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder={t('Phone number', 'Namba ya simu')}
                    disabled={form.isTheSameContact}
                  />
                </div>
                <div className={styles.formField}>
                  <label>{t('Email', 'Barua Pepe')} *</label>
                  <input 
                    value={form.isTheSameContact ? user?.user?.email : form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder={t('Email address', 'Barua pepe')}
                    type="email"
                    disabled={form.isTheSameContact}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.modalStepContent}>
              <div className={styles.alwaysOpenToggle}>
                <label className={styles.switch}>
                  <input 
                    type="checkbox"
                    checked={form.alwaysOpen}
                    onChange={e => setForm({ ...form, alwaysOpen: e.target.checked })}
                  />
                  <span className={styles.slider}></span>
                </label>
                <div>
                  <strong>{t('24/7 Operation', 'Uendeshaji Saa 24')}</strong>
                  <p>{t('Business never closes', 'Biashara haifungi kamwe')}</p>
                </div>
              </div>

              {!form.alwaysOpen && (
                <div className={styles.hoursGrid}>
                  {weekDays.map(day => (
                    <div key={day.code} className={styles.hourRow}>
                      <span className={styles.dayName}>{t(day.en, day.sw)}</span>
                      <input 
                        type="time"
                        value={form.openingHours[day.code]?.open || ''}
                        onChange={e => setForm({
                          ...form,
                          openingHours: {
                            ...form.openingHours,
                            [day.code]: { ...form.openingHours[day.code], open: e.target.value }
                          }
                        })}
                      />
                      <span>–</span>
                      <input 
                        type="time"
                        value={form.openingHours[day.code]?.close || ''}
                        onChange={e => setForm({
                          ...form,
                          openingHours: {
                            ...form.openingHours,
                            [day.code]: { ...form.openingHours[day.code], close: e.target.value }
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.formField}>
                <label>{t('Currency', 'Sarafu')}</label>
                <select 
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div className={styles.featureToggles}>
                <label className={styles.featureToggle}>
                  <input 
                    type="checkbox"
                    checked={form.sellsOnline}
                    onChange={e => setForm({ ...form, sellsOnline: e.target.checked })}
                  />
                  <span>{t('Sells Online', 'Inauza Mtandaoni')}</span>
                </label>
                <label className={styles.featureToggle}>
                  <input 
                    type="checkbox"
                    checked={form.deliveryAvailable}
                    onChange={e => setForm({ ...form, deliveryAvailable: e.target.checked })}
                  />
                  <span>{t('Delivery Available', 'Uwasilishaji Inapatikana')}</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className={styles.backBtn} disabled={updateLoading}>
              <ArrowLeft size={16} />
              {t('Back', 'Rudi')}
            </button>
          )}
          <div className={styles.spacer} />
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className={styles.nextBtn}>
              {t('Continue', 'Endelea')}
              <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={onSave} className={styles.saveBtn} disabled={updateLoading}>
              {updateLoading ? <Loader2 size={16} className={styles.spin} /> : <Check size={16} />}
              {t('Save Changes', 'Hifadhi Mabadiliko')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Searchable Dropdown Component
const SearchableDropdown = ({ items, value, onSelect, placeholder, t }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter((item: string) => 
    item?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.searchableDropdown} ref={dropdownRef}>
      <div className={styles.dropdownTrigger} onClick={() => setIsOpen(!isOpen)}>
        <span className={value ? styles.selected : styles.placeholder}>
          {value || placeholder || 'Select...'}
        </span>
        <ChevronDown size={16} className={isOpen ? styles.rotated : ''} />
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.searchBox}>
            <Search size={14} />
            <input 
              type="text" 
              placeholder={t?.('Search...', 'Tafuta...') || 'Search...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.dropdownItems}>
            {filtered.map((item: string) => (
              <div 
                key={item}
                className={styles.dropdownItem}
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {item}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className={styles.noResults}>{t?.('No results', 'Hakuna matokeo')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Delete Dialog Component
const DeleteDialog = ({ show, onClose, onConfirm, t }: any) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div 
        className={styles.deleteDialog}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.deleteIcon}>
          <AlertTriangle size={56} />
        </div>
        <h3>{t('Delete Business?', 'Futa Biashara?')}</h3>
        <p>
          {t(
            'This action cannot be undone. All data will be permanently removed.',
            'Hatua hii haiwezi kutenduliwa. Taarifa zote zitafutwa kabisa.'
          )}
        </p>
        <div className={styles.dialogActions}>
          <button onClick={onClose} className={styles.cancelBtn}>{t('Cancel', 'Ghairi')}</button>
          <button onClick={onConfirm} className={styles.deleteBtn}>{t('Delete', 'Futa')}</button>
        </div>
      </motion.div>
    </div>
  );
};