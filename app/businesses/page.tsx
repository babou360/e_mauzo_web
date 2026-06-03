'use client';

import React, { useState } from 'react';
import useFetch from '@/utils/fetch';
import {
  Plus, MapPin, Phone, Mail, Edit2, Trash2, X, Check,
  AlertCircle, Loader2, Navigation
} from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from './style.module.scss';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useLanguageStore from '@/store/atoms/language';
import useSendRequest from '@/utils/useSendRequest';

interface Business {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
  district?: string;
  ward?: string;
  street?: string;
  latlong?: string;
  user_id: string[];
  type: string;
  status: string;
  phone?: string;
  email?: string;
  pricing_category: string;
}

interface FormData {
  id: number,
  name: string;
  category: string;
  country: string;
  city: string;
  district?: string;
  ward?: string;
  street?: string;
  latlong?: string;
  user_id: string;
  type: string;
  phone?: string;
  email?: string;
}

const CATEGORIES = [
  'Restaurant', 'Hotel', 'Shop', 'Clinic', 'School', 'Gym',
  'Salon', 'Transport', 'Real Estate', 'Other'
];
const COUNTRIES = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'];
const CITIES_TANZANIA = [
  'Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Zanzibar',
  'Mbeya', 'Moshi', 'Tanga', 'Morogoro', 'Kilimanjaro'
];
const BUSINESS_TYPES = ['Sole Proprietor', 'Partnership', 'Limited Company', 'NGO', 'Other'];

export default function Businesses() {
  const { selected, setSelected, clearBusiness } = useSelectedBusinessStore();
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>({
    id: 0,
    name: '',
    category: '',
    country: '',
    city: '',
    district: '',
    ward: '',
    street: '',
    latlong: '',
    user_id: '',
    type: '',
    phone: '',
    email: ''
  });
  const { data: businesses, loading } = useFetch<Business[]>(
    `${process.env.NEXT_PUBLIC_HOST}/business/get_user_businesses`
  );

  const { sendRequest: addBusiness, loading: addLoading } = useSendRequest({
      url: `${process.env.NEXT_PUBLIC_HOST}/business/register`,
      method: 'POST',
      body: {
        business_id: selected?.id,
        name: formData.name,
        category: formData.category,
        country: formData.country,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        street: formData.street,
        latlong: formData.latlong,
        type: formData.type,
        phone: formData.phone,
        email: formData.email 
      },
    });
  const { sendRequest: editBusiness, loading: editLoading } = useSendRequest({
      url: `${process.env.NEXT_PUBLIC_HOST}/business/edit_business`,
      method: 'POST',
      body: {
        business_id: formData?.id,
        name: formData.name,
        category: formData.category,
        country: formData.country,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        street: formData.street,
        latlong: formData.latlong,
        type: formData.type,
        phone: formData.phone,
        email: formData.email 
      },
    });
  const { sendRequest: deleteBusiness, loading: deleteLoading } = useSendRequest({
      url: `${process.env.NEXT_PUBLIC_HOST}/business/deactivate_business`,
      method: 'POST',
      body: {
        business_id: formData?.id
      },
    });

  const t = (en: string, sw: string) => (language === 'Swahili' ? sw : en);

  /* ----------  Modals & Form State  ---------- */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deletingBusiness, setDeletingBusiness] = useState<Business | null>(null);
  const [detailBusiness, setDetailBusiness] = useState<Business | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  /* ----------  Helpers  ---------- */
  const resetForm = () => {
    setFormData({
      id: 0,
      name: '', category: '', country: '', city: '',
      district: '', ward: '', street: '', latlong: '',
      user_id: '', type: '', phone: '', email: ''
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const fetchGeolocation = () => {
    if (!navigator.geolocation) {
      alert(t('Geolocation not supported', 'Geolocation haipatikani'));
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setFormData(p => ({
          ...p,
          latlong: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setGettingLocation(false);
      },
      () => {
        alert(t('Failed to get location', 'Imeshindwa kupata eneo'));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const openEditModal = (business: Business) => {
    setFormData({
      id: Number(business.id),
      name: business.name,
      category: business.category,
      country: business.country,
      city: business.city,
      district: business.district || '',
      ward: business.ward || '',
      street: business.street || '',
      latlong: business.latlong || '',
      user_id: business.user_id[0] || '',
      type: business.type,
      phone: business.phone || '',
      email: business.email || ''
    });
    setShowEditModal(true);
  };

  /* ----------  CRUD  ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addBusiness()
      // setShowAddModal(false);
      // resetForm();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    editBusiness()
  };

  const handleDelete = async () => {
    if (!deletingBusiness) return;
    deleteBusiness()
  };

  /* ----------  UI  ---------- */
  return (
    <>
      {/* ======================  MAIN PAGE  ====================== */}
      <div className={styles.businesses}>
        <div className={styles.businesses__header}>
          <div className={styles.businesses__header__content}>
            <h1 className={styles.businesses__header__title}>
              {t('Your Businesses', 'Biashara Zako')}
            </h1>
            <p className={styles.businesses__header__slogan}>
              {t('Manage and grow your network', 'Dhibiti na kukuza mtandao wako')}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles.businesses__header__addBtn}
          >
            <Plus size={20} />
            {t('Add Business', 'Ongeza Biashara')}
          </button>
        </div>

        <div className={styles.businesses__list}>
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className={styles.businessCard__skeleton}>
                  <div className={styles.businessCard__skeleton__avatar} />
                  <div className={styles.businessCard__skeleton__line} />
                  <div
                    className={styles.businessCard__skeleton__line}
                    style={{ width: '60%' }}
                  />
                </div>
              ))
          ) : businesses?.length === 0 ? (
            <div className={styles.businesses__empty}>
              <div className={styles.businesses__empty__icon}>Location</div>
              <h3>{t('No businesses yet', 'Hakuna biashara bado')}</h3>
              <p>{t('Start by adding your first', 'Anza kwa kuongeza ya kwanza')}</p>
            </div>
          ) : (
            businesses?.map((business:any) => {
              const isSelected = selected?.id === business.id;
              return (
                <div
                  key={business.id}
                  className={`${styles.businessCard} ${isSelected ? styles['businessCard--selected'] : ''}`}
                  onClick={() => setSelected(business)}
                >
                  {/* Header */}
                  <div className={styles.businessCard__header}>
                    <div className={styles.businessCard__avatar}>
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.businessCard__actions}>
                      {/* Edit */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(business);
                        }}
                        className={styles.businessCard__actionBtn}
                        title={t('Edit', 'Hariri')}
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Detail */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailBusiness(business);
                          setShowDetailModal(true);
                        }}
                        className={styles.businessCard__actionBtn}
                        title={t('View details', 'Angalia maelezo')}
                      >
                        <Navigation size={16} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          //e.stopPropagation();
                          setFormData({...formData,id: Number(business.id)})
                          setDeletingBusiness(business);
                          setShowDeleteModal(true);
                        }}
                        className={`${styles.businessCard__actionBtn} ${styles['businessCard__actionBtn--danger']}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className={styles.businessCard__name}>{business.name}</h3>
                  <p className={styles.businessCard__category}>{business.category}</p>

                  <div className={styles.businessCard__location}>
                    <MapPin size={14} />
                    <span>
                      {business.city}, {business.country}
                      {business.district && ` • ${business.district}`}
                    </span>
                  </div>

                  <div className={styles.businessCard__contacts}>
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className={styles.businessCard__contact}>
                        <Phone size={14} /> {business.phone}
                      </a>
                    )}
                    {business.email && (
                      <a href={`mailto:${business.email}`} className={styles.businessCard__contact}>
                        <Mail size={14} /> {business.email}
                      </a>
                    )}
                  </div>

                  <div className={styles.businessCard__footer}>
                    <span
                      className={`${styles.businessCard__status} ${styles[`businessCard__status--${business.status}`]}`}
                    >
                      ● {business.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================  ADD MODAL  ====================== */}
      {showAddModal && (
        <div className={styles.modal__overlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modal__header}>
              <h2>{t('Add New Business', 'Ongeza Biashara Mpya')}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.modal__close}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modal__form}>
              <div className={styles.modal__formGrid}>
                {/* Name */}
                <div className={styles.modal__field}>
                  <label>{t('Business Name *', 'Jina la Biashara *')}</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t('e.g., Sunset Café', 'mfano, Sunset Café')}
                  />
                </div>

                {/* Category */}
                <div className={styles.modal__field}>
                  <label>{t('Category *', 'Aina *')}</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">{t('Select...', 'Chagua...')}</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className={styles.modal__field}>
                  <label>{t('Country *', 'Nchi *')}</label>
                  <select name="country" value={formData.country} onChange={handleInputChange} required>
                    <option value="">{t('Select...', 'Chagua...')}</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className={styles.modal__field}>
                  <label>{t('City *', 'Mji *')}</label>
                  {formData.country === 'Tanzania' ? (
                    <select name="city" value={formData.city} onChange={handleInputChange} required>
                      <option value="">{t('Select...', 'Chagua...')}</option>
                      {CITIES_TANZANIA.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder={t('e.g., Dar-es-salaam', 'mfano, Dar-es-salaam')}
                    />
                  )}
                </div>

                {/* District / Ward / Street */}
                {['district', 'ward', 'street'].map(field => (
                  <div key={field} className={styles.modal__field}>
                    <label>{t(
                      field === 'district' ? 'District' :
                      field === 'ward' ? 'Ward (optional)' : 'Street (optional)',
                      field === 'district' ? 'Wilaya' :
                      field === 'ward' ? 'Kata (hiari)' : 'Mtaa (hiari)'
                    )}</label>
                    <input
                      name={field}
                      value={formData[field as keyof FormData] as string}
                      onChange={handleInputChange}
                      placeholder={field === 'district' ? t('e.g., Westlands', 'mfano, Westlands') : ''}
                    />
                  </div>
                ))}

                {/* Geolocation */}
                <div className={styles.modal__field}>
                  <label>{t('Lat/Long', 'Lat/Long')}</label>
                  <div className={styles.geoField}>
                    <input
                      name="latlong"
                      value={formData.latlong}
                      readOnly
                      placeholder={t('Click to fetch', 'Bonyeza kupata')}
                      className={styles.geoInput}
                    />
                    <button
                      type="button"
                      onClick={fetchGeolocation}
                      disabled={gettingLocation}
                      className={styles.geoBtn}
                    >
                      {gettingLocation ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Navigation size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Business Type */}
                <div className={styles.modal__field}>
                  <label>{t('Business Type *', 'Aina ya Biashara *')}</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} required>
                    <option value="">{t('Select...', 'Chagua...')}</option>
                    {BUSINESS_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div className={styles.modal__field}>
                  <label>{t('Phone (optional)', 'Simu (hiari)')}</label>
                  <PhoneInput
                    international
                    defaultCountry="TZ"
                    value={formData.phone}
                    onChange={v => setFormData(p => ({ ...p, phone: v || '' }))}
                    className={styles.phoneInput}
                  />
                </div>

                {/* Email */}
                <div className={styles.modal__field}>
                  <label>{t('Email (optional)', 'Barua pepe (hiari)')}</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className={styles.modal__actions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.modal__cancel}>
                  {t('Cancel', 'Ghairi')}
                </button>
                <button type="submit" disabled={submitting} className={styles.modal__submit}>
                  {addLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {addLoading ?'loading..':t('Submit', 'Wasilisha')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================  EDIT MODAL  ====================== */}
      {showEditModal && selected && (
        <div className={styles.modal__overlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modal__header}>
              <h2>{t('Edit Business', 'Hariri Biashara')}</h2>
              <button onClick={() => setShowEditModal(false)} className={styles.modal__close}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} className={styles.modal__form}>
              <div className={styles.modal__formGrid}>
                {/* Same fields as Add – pre-filled */}
                <div className={styles.modal__field}>
                  <label>{t('Business Name *', 'Jina la Biashara *')}</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className={styles.modal__field}>
                  <label>{t('Category *', 'Aina *')}</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">{t('Select...', 'Chagua...')}</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className={styles.modal__field}>
                  <label>{t('Country *', 'Nchi *')}</label>
                  <select name="country" value={formData.country} onChange={handleInputChange} required>
                    <option value="">{t('Select...', 'Chagua...')}</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className={styles.modal__field}>
                  <label>{t('City *', 'Mji *')}</label>
                  {formData.country === 'Tanzania' ? (
                    <select name="city" value={formData.city} onChange={handleInputChange} required>
                      <option value="">{t('Select...', 'Chagua...')}</option>
                      {CITIES_TANZANIA.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input name="city" value={formData.city} onChange={handleInputChange} required />
                  )}
                </div>

                {['district', 'ward', 'street'].map(field => (
                  <div key={field} className={styles.modal__field}>
                    <label>{t(
                      field === 'district' ? 'District' :
                      field === 'ward' ? 'Ward (optional)' : 'Street (optional)',
                      field === 'district' ? 'Wilaya' :
                      field === 'ward' ? 'Kata (hiari)' : 'Mtaa (hiari)'
                    )}</label>
                    <input
                      name={field}
                      value={formData[field as keyof FormData] as string}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}

                <div className={styles.modal__field}>
                  <label>{t('Lat/Long', 'Lat/Long')}</label>
                  <div className={styles.geoField}>
                    <input name="latlong" value={formData.latlong} readOnly className={styles.geoInput} />
                    <button
                      type="button"
                      onClick={fetchGeolocation}
                      disabled={gettingLocation}
                      className={styles.geoBtn}
                    >
                      {gettingLocation ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.modal__field}>
                  <label>{t('Business Type *', 'Aina ya Biashara *')}</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} required>
                    <option value="">{t('Select...', 'Chagua...')}</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className={styles.modal__field}>
                  <label>{t('Phone (optional)', 'Simu (hiari)')}</label>
                  <PhoneInput
                    international
                    defaultCountry="KE"
                    value={formData.phone}
                    onChange={v => setFormData(p => ({ ...p, phone: v || '' }))}
                    className={styles.phoneInput}
                  />
                </div>

                <div className={styles.modal__field}>
                  <label>{t('Email (optional)', 'Barua pepe (hiari)')}</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
              </div>

              <div className={styles.modal__actions}>
                <button type="button" onClick={() => setShowEditModal(false)} className={styles.modal__cancel}>
                  {t('Cancel', 'Ghairi')}
                </button>
                <button type="submit" disabled={submitting} className={styles.modal__submit}>
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {t('Update', 'Sasisha')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================  DELETE CONFIRM  ====================== */}
      {showDeleteModal && deletingBusiness && (
        <div className={styles.modal__overlay} onClick={() => setShowDeleteModal(false)}>
          <div className={`${styles.modal} ${styles['modal--sm']}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modal__icon}>
              <AlertCircle size={48} />
            </div>
            <h3>{t('Delete Business?', 'Futa Biashara?')}</h3>
            <p>
              {t('Are you sure you want to delete', 'Una uhakika unataka kufuta')}{' '}
              <strong>{deletingBusiness.name}</strong>?{' '}
              {t('This action cannot be undone.', 'Hatua hii haiwezi kurudishwa.')}
            </p>
            <div className={styles.modal__actions}>
              <button onClick={() => setShowDeleteModal(false)} className={styles.modal__cancel}>
                {t('Cancel', 'Ghairi')}
              </button>
              <button onClick={handleDelete} className={styles.modal__delete}>
                <Trash2 size={18} />
                {t('Delete', 'Futa')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================  DETAIL MODAL  ====================== */}
      {showDetailModal && detailBusiness && (
        <div className={styles.modal__overlay} onClick={() => setShowDetailModal(false)}>
          <div className={`${styles.modal} ${styles['modal--lg']}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modal__header}>
              <h2>{t('Business Details', 'Maelezo ya Biashara')}</h2>
              <button onClick={() => setShowDetailModal(false)} className={styles.modal__close}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.detailHero}>
                <div className={styles.detailAvatar}>
                  {detailBusiness.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={styles.detailName}>{detailBusiness.name}</h3>
                  <p className={styles.detailCategory}>{detailBusiness.category}</p>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{t('Country', 'Nchi')}:</span>
                  <span>{detailBusiness.country}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{t('City', 'Mji')}:</span>
                  <span>{detailBusiness.city}</span>
                </div>
                {detailBusiness.district && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t('District', 'Wilaya')}:</span>
                    <span>{detailBusiness.district}</span>
                  </div>
                )}
                {detailBusiness.ward && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t('Ward', 'Kata')}:</span>
                    <span>{detailBusiness.ward}</span>
                  </div>
                )}
                {detailBusiness.street && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t('Street', 'Mtaa')}:</span>
                    <span>{detailBusiness.street}</span>
                  </div>
                )}
                {detailBusiness.latlong && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t('Coordinates', 'Kurugenzi')}:</span>
                    <span>{detailBusiness.latlong}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{t('Type', 'Aina')}:</span>
                  <span>{detailBusiness.type}</span>
                </div>
                {detailBusiness.phone && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t('Phone', 'Simu')}:</span>
                    <a href={`tel:${detailBusiness.phone}`}>{detailBusiness.phone}</a>
                  </div>
                )}
                {detailBusiness.email && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t('Email', 'Barua pepe')}:</span>
                    <a href={`mailto:${detailBusiness.email}`}>{detailBusiness.email}</a>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{t('Status', 'Hali')}:</span>
                  <span className={styles[`detailStatus--${detailBusiness.status}`]}>
                    ● {detailBusiness.status}
                  </span>
                </div>
              </div>

              <div className={styles.modal__actions} style={{ marginTop: '2rem' }}>
                <button onClick={() => setShowDetailModal(false)} className={styles.modal__cancel}>
                  {t('Close', 'Funga')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}