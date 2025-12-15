'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit3, Trash2, MapPin, Calendar, Globe, Phone, Mail,
  Building2, Map, Navigation, CreditCard, Tag, CheckCircle,
  X, Search, ChevronDown, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import styles from './style.module.scss';
import useSelectedBusinessStore from '@/store/atoms/selected_business';

// Mock controller-like state
interface Business {
  name: string;
  category: string;
  type: string;
  country: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  latlong: string;
  phone: string;
  email: string;
  status: string;
  pricingCategory: string;
  createdAt: string;
}



const categories = ['Tech', 'Duka', 'Saloon', 'M-Pesa'];
const types = ['Tech', 'Duka', 'Saloon', 'M-Pesa'];
const countries = ['Tanzania', 'Kenya', 'Uganda', 'Rwanda'];
const cities = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Mbeya', 'Zanzibar'];

export default function MyBusinessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { selected } = useSelectedBusinessStore();

  // Form state (like TextEditingController)
  const [form, setForm] = useState({
    name: '',
    category: '',
    type: '',
    country: '',
    city: '',
    district: '',
    ward: '',
    street: '',
    latlong: '',
    phone: '',
    email: '',
  });

  const [search, setSearch] = useState({
    category: '', type: '', country: '', city: ''
  });

  useEffect(() => {
    setTimeout(() => {
      setForm({
        name: selected?.name,
        category: selected?.category,
        type: selected?.type,
        country: selected?.country,
        city: selected?.city,
        district: selected?.district,
        ward: selected?.ward,
        street: selected?.street,
        latlong: selected?.latlong,
        phone: selected?.phone,
        email: selected?.email,
      });
      setIsLoading(false);
    }, 800);
  }, []);

  const formatDate = (date: string) => format(new Date(date), 'yyyy-MM-dd HH:mm');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'inactive': return '#fb923c';
      case 'suspended': return '#ef4444';
      default: return '#22c55e';
    }
  };

  const address = [selected?.street, selected?.ward, selected?.district]
    .filter(Boolean)
    .join(', ') + (selected?.city ? `, ${selected?.city}` : '') + (selected?.country ? `, ${selected?.country}` : '');

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>My Business</h1>
        <div className={styles.actions}>
          <button onClick={() => setShowEdit(true)} className={styles.iconBtn} title="Edit">
            <Edit3 size={20} />
          </button>
          <button onClick={() => setShowDelete(true)} className={styles.iconBtn} title="Delete">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* Body */}
      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loader}>
            <Loader2 className={styles.spin} size={25} />
          </div>
        ) : (
          <div className={styles.content}>
            {/* Hero Card */}
            <div className={styles.heroCard}>
              <h2 className={styles.businessName}>{selected?.name}</h2>
              <div className={styles.chips}>
                <span className={styles.chip}>{selected?.category}</span>
                <span className={styles.chip}>{selected?.type}</span>
                <span className={styles.chip}>
                  <span className={styles.statusDot} style={{ backgroundColor: getStatusColor(selected?.status) }} />
                  {selected?.status}
                </span>
                <span className={styles.chip}>Plan: {selected?.pricingCategory}</span>
              </div>
              <div className={styles.address}>
                <MapPin size={18} />
                <span>{address}</span>
              </div>
              <div className={styles.created}>
                <Calendar size={18} />
                <span>{formatDate(selected?.createdAt)}</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className={styles.infoGrid}>
              <GlassTile icon={Globe} label="Country" value={selected?.country} />
              <GlassTile icon={Building2} label="City" value={selected?.city} />
              <GlassTile icon={Map} label="District" value={selected?.district} />
              <GlassTile icon={Navigation} label="Ward" value={selected?.ward} />
              <GlassTile icon={MapPin} label="Street" value={selected?.street} />
              <GlassTile icon={Navigation} label="Lat/Long" value={selected?.latlong} />
              <GlassTile icon={Phone} label="Phone" value={selected?.phone} />
              <GlassTile icon={Mail} label="Email" value={selected?.email} />
              <GlassTile icon={CheckCircle} label="Status" value={selected?.status} />
              <GlassTile icon={CreditCard} label="Pricing" value={selected?.pricingCategory} />
              <GlassTile icon={Tag} label="Type" value={selected?.type} />
              <GlassTile icon={Calendar} label="Created" value={formatDate(selected?.createdAt)} />
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <EditModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        form={form}
        setForm={setForm}
        search={search}
        setSearch={setSearch}
      />

      {/* Delete Dialog */}
      <DeleteDialog show={showDelete} onClose={() => setShowDelete(false)} />
    </div>
  );
}

// Glass Tile
const GlassTile = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className={styles.glassTile}>
    <div className={styles.tileIcon}>
      <Icon size={20} />
    </div>
    <div className={styles.tileText}>
      <p className={styles.tileLabel}>{label}</p>
      <p className={styles.tileValue}>{value}</p>
    </div>
  </div>
);

// Edit Modal
const EditModal = ({ show, onClose, form, setForm, search, setSearch }: any) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Edit {form.name}</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>
        <div className={styles.modalBody}>
          <Input label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Dropdown label="Category" items={categories} value={form.category} search={search.category} setSearch={(v: any) => setSearch({ ...search, category: v })} onSelect={(v: any) => setForm({ ...form, category: v })} />
          <Dropdown label="Type" items={types} value={form.type} search={search.type} setSearch={(v: any) => setSearch({ ...search, type: v })} onSelect={(v: any) => setForm({ ...form, type: v })} />
          <Dropdown label="Country" items={countries} value={form.country} search={search.country} setSearch={(v: any) => setSearch({ ...search, country: v })} onSelect={(v: any) => setForm({ ...form, country: v })} />
          <Dropdown label="City" items={cities} value={form.city} search={search.city} setSearch={(v: any) => setSearch({ ...search, city: v })} onSelect={(v: any) => setForm({ ...form, city: v })} />
          <Input label="District" value={form.district} onChange={v => setForm({ ...form, district: v })} />
          <Input label="Ward" value={form.ward} onChange={v => setForm({ ...form, ward: v })} />
          <Input label="Street" value={form.street} onChange={v => setForm({ ...form, street: v })} />
          <Input label="Latlong" value={form.latlong} onChange={v => setForm({ ...form, latlong: v })} />
          <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>Close</button>
          <button className={styles.submitBtn}>Update</button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className={styles.inputGroup}>
    <label>{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} className={styles.input} placeholder={label} />
  </div>
);

const Dropdown = ({ label, items, value, search, setSearch, onSelect }: any) => {
  const [open, setOpen] = useState(false);
  const filtered = items.filter((i: string) => i.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.dropdown}>
      <label>{label}</label>
      <button type="button" onClick={() => setOpen(!open)} className={styles.dropdownBtn}>
        <span>{value || `Select ${label.toLowerCase()}...`}</span>
        <ChevronDown size={18} className={open ? styles.rotate : ''} />
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          <div className={styles.searchInput}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          {filtered.map((item: string) => (
            <button key={item} type="button" className={styles.dropdownItem} onClick={() => { onSelect(item); setOpen(false); setSearch(''); }}>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DeleteDialog = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  if (!show) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.deleteDialog} onClick={e => e.stopPropagation()}>
        <h3>Delete Business?</h3>
        <p>This action will permanently remove this business. Are you sure?</p>
        <div className={styles.dialogActions}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button className={styles.deleteBtn}>Delete</button>
        </div>
      </div>
    </div>
  );
};