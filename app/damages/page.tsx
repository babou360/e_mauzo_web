'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ChangeEvent,
  MouseEvent,
  useRef,
} from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Camera,
  X,
  Eye,
  Package,
  DollarSign,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles.module.scss';
import useFetch from '@/utils/fetch';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useSendMultipartRequest from '@/utils/useSendMultipartRequest';

interface Product {
  id: number;
  name: string;
  quantity: number;
}

interface Damage {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  reason: string;
  images: string[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data (now typed)                                            */
/* ------------------------------------------------------------------ */
const mockProducts: Product[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: ['Mchele', 'Mafuta', 'Sukari', 'Maziwa', 'Mkate', 'Mayai'][i % 6] + ` ${i + 1}`,
  quantity: Math.floor(Math.random() * 50) + 1,
}));

const mockDamages: Damage[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  product_id: (i % 5) + 1,
  name: mockProducts[(i % 5)].name,
  quantity: Math.floor(Math.random() * 10) + 1,
  reason: ['Imevunjika', 'Imepasuka', 'Imepotea', 'Imeoza', 'Imeharibika'][i % 5],
  images:
    i % 3 === 0
      ? []
      : Array.from({ length: (i % 4) + 1 }, () => `https://picsum.photos/seed/damage${i}/400/400`),
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

/* ------------------------------------------------------------------ */
/*  Component                                                        */
/* ------------------------------------------------------------------ */
const DamagedProducts: React.FC = () => {
  /* --------------------------- Form state -------------------------- */
  const [fields, setFields] = useState({
    product: { id: 0, name: '' },
    images: [] as File[],
    quantity: 0,
    reason: '',
    duration: 'day',
    start: '',
    end: '',
  });

  const { selected } = useSelectedBusinessStore();

  const { data: allProducts = [], loading: prodLoading } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/products/get_all_products`,
    { business_id: selected?.id ?? '' }
  );

  /* -------------------------- Table state ------------------------- */
  const [damages, setDamages] = useState<Damage[]>([]);
  const [allDamages, setAllDamages] = useState<Damage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('day');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  /* ----------------------- Image‑gallery state -------------------- */
  const [showImageModal, setShowImageModal] = useState<{
    images: string[];
    current: number;
    loading: boolean[];
    full: boolean;
  } | null>(null);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [showTitle, setShowTitle] = useState(false);

  const { data: damagas, loading: damLoading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/damages/get_damages`, {
    page,
    pageSize: 10,
    duration: fields.duration,
    start: fields.start,
    end: fields.end,
    business_id: selected?.id ?? '',
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = useCallback((en: string, sw: string) => sw, []);

  /* -------------------------- Pagination -------------------------- */
  const totalPages = useMemo(() => Math.ceil(damages.length / 10), [damages]);

  const paginatedDamages = useMemo(
    () => damages.slice((page - 1) * 10, page * 10),
    [damages, page]
  );

  const totals = useMemo(
    () => ({
      total_damage: damages.reduce((acc, d) => acc + d.quantity, 0),
    }),
    [damages]
  );

  const filteredProducts = useMemo(() => {
    if (!searchProduct.trim()) return allProducts;
    return allProducts.filter((p: any) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase())
    );
  }, [allProducts, searchProduct]);

  /* --------------------------- Load mock -------------------------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // ---- these are now typed correctly ----
    setProducts(mockProducts);
    setAllDamages(mockDamages);
    setDamages(mockDamages);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, fields.duration, fields.start, fields.end]);

  /* -------------------------- Duration filter --------------------- */
  useEffect(() => {
    const filtered =
      duration === 'all'
        ? mockDamages
        : mockDamages.filter(d => {
            const daysAgo =
              (Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return duration === 'day'
              ? daysAgo <= 1
              : duration === 'week'
              ? daysAgo <= 7
              : duration === 'month'
              ? daysAgo <= 30
              : duration === 'year'
              ? daysAgo <= 365
              : true;
          });
    setDamages(filtered);
    setPage(1);
  }, [duration]);

  /* -------------------------- Multipart request ------------------- */
  const { sendRequest, loading: createLoading } = useSendMultipartRequest({
    url: `${process.env.NEXT_PUBLIC_HOST}/damages/register_damage`,
    method: 'POST',
    body: {
      product_id: fields.product.id,
      images: fields.images,
      quantity: fields.quantity,
      reason: fields.reason,
      business_id: selected?.id,
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fields.product.id || fields.quantity <= 0 || !fields.reason || fields.images.length === 0) {
      alert('Tafadhali jaza sehemu zote, pamoja na picha');
      return;
    }

    try {
      await sendRequest();

      const newDamage: Damage = {
        id: Math.max(...damages.map(d => d.id), 0) + 1,
        product_id: fields.product.id,
        name: fields.product.name,
        quantity: fields.quantity,
        reason: fields.reason,
        images: selectedImages,
        createdAt: new Date().toISOString(),
      };

      setAllDamages(prev => [newDamage, ...prev]);
      setDamages(prev => [newDamage, ...prev]);

      setFields({
        product: { id: 0, name: '' },
        images: [],
        quantity: 0,
        reason: '',
        start: '',
        end: '',
        duration: '',
      });
      setSelectedImages([]);
      setSearchProduct('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Imeshindwa kuwasilisha. Tafadhali jaribu tena.');
    }
  };

  /* -------------------------- Image handling ---------------------- */
  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews: string[] = [];

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setSelectedImages(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setFields(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setFields(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /* -------------------------- Dropdown outside click -------------- */
  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  /* -------------------------- Keyboard navigation for gallery ----- */
  useEffect(() => {
    if (!showImageModal) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')
        setShowImageModal(prev =>
          prev ? { ...prev, current: (prev.current - 1 + prev.images.length) % prev.images.length } : null
        );
      if (e.key === 'ArrowRight')
        setShowImageModal(prev =>
          prev ? { ...prev, current: (prev.current + 1) % prev.images.length } : null
        );
      if (e.key === 'Escape') setShowImageModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showImageModal]);

  /* ---------------------------------------------------------------- */
  return (
    <div className={styles.damaged}>
      {/* ──────────────────────── Header & Stats ─────────────────────── */}
      <div
        className={styles.scrollContainer}
        onScroll={(e: any) => setShowTitle(e.currentTarget.scrollTop > 80)}
      >
        <div className={styles.header}>
          <div className={styles.title_container}>
            <h1>{t('Damaged Products', 'Bidhaa Zilizoharibika')}</h1>
            <p className={styles.subtitle}>
              {t('Track all damaged items in your store', 'Fuatilia bidhaa zote zilizoharibika dukani')}
            </p>
          </div>
          <button className={styles.add_btn} onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            <span>{t('Add Damage', 'Ongeza Uharibifu')}</span>
          </button>
        </div>

        {/* Duration chips */}
        <div className={styles.durations}>
          {[
            { swahili: 'Siku', english: 'Day', value: 'day' },
            { swahili: 'Wiki', english: 'Week', value: 'week' },
            { swahili: 'Mwezi', english: 'Month', value: 'month' },
            { swahili: 'Mwaka', english: 'Year', value: 'year' },
            { swahili: 'Muda Wote', english: 'All', value: 'all' },
          ].map(dur => (
            <div
              key={dur.value}
              className={`${styles.chip} ${fields.duration === dur.value ? styles.active : ''}`}
              onClick={() => setFields({ ...fields, duration: dur.value })}
            >
              {t(dur.english, dur.swahili)}
            </div>
          ))}
        </div>

        {/* Stats cards */}
        <div className={styles.stats}>
          <div className={styles.card}>
            <div className={styles.card_icon}>
              {damLoading ? <Loader2 className={styles.spin} size={24} /> : <Package size={24} />}
            </div>
            <h2>{t('Total Damaged', 'Jumla Iliyoharibika')}</h2>
            <p>{damLoading ? '—' : damagas.all?.length ?? 0}</p>
          </div>
          <div className={styles.card}>
            <div className={styles.card_icon}>
              {damLoading ? <Loader2 className={styles.spin} size={24} /> : <DollarSign size={24} />}
            </div>
            <h2>{t('Value', 'Thamani')}</h2>
            <p>{damLoading ? '—' : (damagas.net_price ?? 0).toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {damLoading ? (
            <div className={styles.loading}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.shimmer} />
              ))}
            </div>
          ) : damagas.rows?.length === 0 ? (
            <div className={styles.empty}>
              <AlertCircle size={48} />
              <h3>{t('No Damaged Products', 'Hakuna Bidhaa Zilizoharibika')}</h3>
              <p>{t('Add damaged items to get started', 'Ongeza bidhaa zilizoharibika kuanza')}</p>
            </div>
          ) : (
            <>
              <div className={styles.tableHeader}>
                <div style={{ width: '25%' }}>{t('Product', 'Bidhaa')}</div>
                <div style={{ width: '10%' }}>#</div>
                <div style={{ width: '25%' }}>{t('Reason', 'Sababu')}</div>
                <div style={{ width: '10%' }}>{t('Images', 'Picha')}</div>
              </div>

              <AnimatePresence>
                {damagas.rows.map((damage: Damage, i: number) => (
                  <motion.div
                    key={damage.id}
                    className={styles.row}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div style={{ width: '25%' }}>
                      <strong>{damage.name}</strong>
                    </div>
                    <div style={{ width: '10%' }}>{damage.quantity}</div>
                    <div style={{ width: '25%' }}>{damage.reason}</div>
                    <div style={{ width: '10%' }}>
                      <button
                        className={styles.eye_btn}
                        onClick={() =>
                          setShowImageModal({
                            images: damage.images,
                            current: 0,
                            loading: damage.images.map(() => true),
                            full: false,
                          })
                        }
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {damagas.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft />
                  </button>
                  <span>{page}</span>
                  <button
                    onClick={() => setPage(p => Math.min(damagas.totalPages, p + 1))}
                    disabled={page === damagas.totalPages}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ──────────────────────── Add Damage Modal ─────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className={styles.modal} onClick={() => setShowAddModal(false)}>
            <motion.div
              className={styles.modal_content}
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className={styles.modal_header}>
                <h2>{t('Register Damage', 'Sajili Uharibifu')}</h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Images */}
              <div className={styles.image_grid}>
                {selectedImages.map((img, i) => (
                  <div key={i} className={styles.image_wrapper}>
                    <img src={img} alt="" />
                    <button onClick={() => removeImage(i)} className={styles.remove}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <label className={styles.image_picker}>
                  <Camera size={24} />
                  <input type="file" accept="image/*" multiple onChange={handleImagePick} />
                </label>
              </div>

              {/* Product dropdown */}
              <div className={styles.dropdown} ref={dropdownRef}>
                <input
                  type="text"
                  placeholder={t('Search product...', 'Tafuta bidhaa...')}
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className={styles.dropdown_input}
                />
                {showDropdown && (
                  <div className={styles.dropdown_list}>
                    {prodLoading ? (
                      <div className={styles.dropdown_item}>Loading...</div>
                    ) : filteredProducts.length === 0 ? (
                      <div className={styles.dropdown_item}>No products found</div>
                    ) : (
                      filteredProducts.map((p: any) => (
                        <div
                          key={p.id}
                          className={`${styles.dropdown_item} ${
                            fields.product.id === p.id ? styles.selected : ''
                          }`}
                          onClick={() => {
                            setFields(prev => ({
                              ...prev,
                              product: { id: p.id, name: p.name },
                            }));
                            setSearchProduct(p.name);
                            setShowDropdown(false);
                          }}
                        >
                          {p.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <input
                type="number"
                placeholder={t('Quantity', 'Idadi')}
                value={fields.quantity || ''}
                onChange={e =>
                  setFields(prev => ({ ...prev, quantity: Number(e.target.value) || 0 }))
                }
                className={styles.input}
                min="1"
              />

              {/* Reason */}
              <textarea
                placeholder={t('Reason', 'Sababu')}
                value={fields.reason}
                onChange={e => setFields(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
                className={styles.textarea}
              />

              <div className={styles.modal_actions}>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={styles.cancel}
                  disabled={createLoading}
                >
                  {t('Cancel', 'Ghairi')}
                </button>
                <button onClick={submit} className={styles.submit} disabled={createLoading}>
                  {createLoading ? (
                    <>
                      <Loader2 size={16} className={styles.spin} />
                      {t('Submitting...', 'Inawasilisha...')}
                    </>
                  ) : (
                    t('Submit', 'Wasilisha')
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────── Image Gallery Modal ─────────────────────── */}
      <AnimatePresence>
        {showImageModal && (
          <div
            className={styles.gallery_modal}
            role="dialog"
            aria-modal="true"
            onClick={() => setShowImageModal(null)}
          >
            <motion.div
              className={styles.gallery_content}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {showImageModal.images.length === 0 ? (
                <p>{t('No images available', 'Hakuna picha zilizopatikana')}</p>
              ) : (
                <>
                  <h3>{t('Damage Images', 'Picha za Uharibifu')}</h3>

                  {/* Main image + shimmer */}
                  <div className={styles.image_frame}>
                    <div className={styles.mainImageWrapper}>
                      {showImageModal.loading[showImageModal.current] && (
                        <div className={styles.shimmer} />
                      )}
                      <img
                        src={showImageModal.images[showImageModal.current]}
                        alt={`Damage ${showImageModal.current + 1}`}
                        className={styles.mainImage}
                        onClick={() =>
                          setShowImageModal(prev => prev && { ...prev, full: true })
                        }
                        onLoad={() =>
                          setShowImageModal(prev =>
                            prev
                              ? {
                                  ...prev,
                                  loading: prev.loading.map((v, i) =>
                                    i === prev.current ? false : v
                                  ),
                                }
                              : null
                          )
                        }
                        loading="lazy"
                      />
                    </div>

                    {/* Navigation arrows */}
                    {showImageModal.images.length > 1 && (
                      <>
                        <button
                          className={styles.prev}
                          onClick={() =>
                            setShowImageModal(prev =>
                              prev
                                ? {
                                    ...prev,
                                    current:
                                      (prev.current - 1 + prev.images.length) %
                                      prev.images.length,
                                  }
                                : null
                            )
                          }
                          aria-label={t('Previous image', 'Picha iliyotangulia')}
                        >
                          <ChevronLeft />
                        </button>
                        <button
                          className={styles.next}
                          onClick={() =>
                            setShowImageModal(prev =>
                              prev
                                ? {
                                    ...prev,
                                    current: (prev.current + 1) % prev.images.length,
                                  }
                                : null
                            )
                          }
                          aria-label={t('Next image', 'Picha inayofuata')}
                        >
                          <ChevronRight />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  <div className={styles.thumbnailWrapper}>
                    {showImageModal.images.map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.thumbItem} ${
                          idx === showImageModal.current ? styles.active : ''
                        }`}
                        onClick={() =>
                          setShowImageModal(prev => prev && { ...prev, current: idx })
                        }
                        aria-label={t(`Show image ${idx + 1}`, `Onyesha picha ${idx + 1}`)}
                      >
                        <div className={styles.thumbInner}>
                          {showImageModal.loading[idx] && (
                            <div className={styles.thumbShimmer} />
                          )}
                          <img
                            src={src}
                            alt={`thumb-${idx}`}
                            className={styles.thumbnail}
                            onLoad={() =>
                              setShowImageModal(prev =>
                                prev
                                  ? {
                                      ...prev,
                                      loading: prev.loading.map((v, i) =>
                                        i === idx ? false : v
                                      ),
                                    }
                                  : null
                              )
                            }
                            loading="lazy"
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setShowImageModal(null)}
                    className={styles.close_gallery}
                  >
                    {t('Close', 'Funga')}
                  </button>

                  {/* Full‑screen overlay */}
                  {showImageModal.full && (
                    <div
                      className={styles.fullView}
                      onClick={() =>
                        setShowImageModal(prev => prev && { ...prev, full: false })
                      }
                      role="button"
                      tabIndex={-1}
                      aria-label={t('Close full view', 'Funga mwonekano kamili')}
                    >
                      <img
                        src={showImageModal.images[showImageModal.current]}
                        alt={`Damage ${showImageModal.current + 1}`}
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DamagedProducts;