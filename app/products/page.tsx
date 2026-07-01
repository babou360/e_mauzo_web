'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './products.module.scss';
import useSendRequest from '@/utils/useSendRequest';
import useFetch from '@/utils/fetch';
import { MdOutlineDelete } from 'react-icons/md';
import { FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa6';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import useLanguageStore from '@/store/atoms/language';
import useSendMultipartRequest from '@/utils/useSendMultipartRequest';
import { Download, Plus, Search, X } from 'lucide-react';
import cx from 'classnames'

interface Measurement {
  id: number;
  name: string;
  short_form: string;
  value: string;
}
interface Category {
  id: number;
  swahili: string;
  english: string;
  examples_swahili: [];
  examples_english: [];
  value: string;
}

interface Product {
  id: number;
  name: string;
  images: string[];
  urls: File[];
  quantity: number;
  selling_price: number;
  buying_price: number;
  category: Category;
  sub_category?: string;
  status: string;
  min_stock: number;
  expire_date: string;
  measurement: Measurement;
  description?: string;
  business_id: string;
  page: number;
  pageSize: number;
}

interface SearchableSelectProps {
  options: any[];
  value: any;
  onChange: (value: any) => void;
  placeholder: string;
  language: string;
  label?: string;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  language,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    const name = language === 'Swahili' ? option.swahili : option.english;
    return name?.toLowerCase().includes(searchLower);
  });

  const selectedOption = options.find(opt => opt.id === value);
  const displayValue = selectedOption
    ? (language === 'Swahili' ? selectedOption.swahili : selectedOption.english)
    : '';

  return (
    <div className={styles.searchableSelect} ref={dropdownRef}>
      {label && <label>{label}</label>}
      <div
        className={styles.selectTrigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={displayValue ? styles.selectedValue : styles.placeholder}>
          {displayValue || placeholder}
        </span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className={styles.selectDropdown}>
          <div className={styles.searchInputWrapper}>
            <Search size={14} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={styles.searchInput}
              autoFocus
            />
            {searchTerm && (
              <X 
                size={14} 
                className={styles.clearIcon} 
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>
          <div className={styles.optionsList}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className={cx(styles.option, { [styles.selectedOption]: option.id === value })}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {language === 'Swahili' ? option.swahili : option.english}
                </div>
              ))
            ) : (
              <div className={styles.noOptions}>No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default function ProductsPage() {
  const [fields, setFields] = useState({
    isAddStock: false,
    isDelete: false,
    showDownload: false,
    item: {
      selling_price: '',
      buying_price: '',
      quantity: '',
      id: ''
    },
    new_selling: '',
    new_buying: '',
    new_quantity: ''
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { language } = useLanguageStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    images: [],
    urls: [],
    quantity: 0,
    selling_price: 0,
    buying_price: 0,
    status: '',
    min_stock: 0,
    expire_date: new Date().toISOString(),
    measurement: { id: 0, name: '',  short_form: '', value: '' },
    category: { id: 0, swahili: '',  english: '', value: '',examples_swahili: [],examples_english:[] },
    description: '',
    business_id: '',
    page: 1,
    pageSize: 10,
  });
  const { selected } = useSelectedBusinessStore();
  const { data, loading } = useFetch(`${process.env.NEXT_PUBLIC_HOST}/products/get_products`, {
    page: formData.page,
    pageSize: formData.pageSize,
    name,
    business_id: selected?.id ?? '',
  });

  const { data: categories, loading: catLoading } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/ms-cats/get_ms_cats`,
    { page: 1, pageSize: 100 }
  );
  const { data: measurements, loading: measureLoading } = useFetch(
    `${process.env.NEXT_PUBLIC_HOST}/ms-cats/get_measurements`,
    { page: 1, pageSize: 100 }
  );
  
  const { sendRequest, loading: createLoading } = useSendMultipartRequest({
  url: `${process.env.NEXT_PUBLIC_HOST}/products/create_product`,
  method: "POST",
  body: {
    business_id: selected?.id,
    name: formData.name,
    quantity: formData.quantity,
    selling_price: formData.selling_price,
    buying_price: formData.buying_price,
    measurement: !measureLoading && measurements.all.find((item:any)=> item.id == formData.measurement.id)? JSON.stringify(
          measurements.all.find(
            (item: any) => item.id == formData.measurement.id
          )
        )
      : null,
    category: !catLoading && categories.all.find((item:any)=> item.id == formData.category.id)? JSON.stringify(
          categories.all.find(
            (item: any) => item.id == formData.category.id
          )
        )
      : null,
    description: formData.description,
    images: formData.urls,
    min_stock: formData.min_stock,
    expire_date: formData.expire_date,
  },
});
  const { sendRequest: addStock, loading: stockLoading } = useSendRequest({
  url: `${process.env.NEXT_PUBLIC_HOST}/products/add_stock`,
  method: "POST",
  body: {
    product_id: fields.item.id,
    new_selling: fields.new_selling,
    new_buying: fields.new_buying,
    new_quantity: fields.new_quantity
  },
});
  const { sendRequest: deleteProduct, loading: deleteLoading } = useSendRequest({
  url: `${process.env.NEXT_PUBLIC_HOST}/products/disable_product`,
  method: "POST",
  body: {
    id: fields.item.id
  },
});
const categoriesList = !catLoading && categories?.all ? categories.all : [];
const measurementsList = !measureLoading && measurements?.all ? measurements.all : [];

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setFormData((prev) => ({ ...prev, page }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequest();
  };

  const nambaComma = (number: number) => number.toLocaleString('en-US');

  const totalBuying = !loading
    ? data?.all?.reduce((acc: number, p: Product) => acc + p.buying_price * p.quantity, 0)
    : 0;

  const totalSelling = !loading
    ? data?.all?.reduce((acc: number, p: Product) => acc + p.selling_price * p.quantity, 0)
    : 0;

  const totalPages = data?.totalItems ? Math.ceil(data.totalItems / formData.pageSize) : 0;

  // Image slider state
  const [currentImage, setCurrentImage] = useState(0);
  const [fullView, setFullView] = useState(false);

  // image loading shimmer state for selectedProduct images
  const [imgLoading, setImgLoading] = useState<boolean[]>([]);

  useEffect(() => {
    if (selectedProduct) {
      setCurrentImage(0);
      setFullView(false);
      setImgLoading(selectedProduct.images.map(() => true));
    } else {
      setImgLoading([]);
    }
  }, [selectedProduct]);
  

  const nextImage = () => {
    if (!selectedProduct) return;
    setCurrentImage((prev) => (prev + 1) % selectedProduct.images.length);
  };

  const prevImage = () => {
    if (!selectedProduct) return;
    setCurrentImage((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
  };

  const handleMainImageLoad = (idx: number) => {
    setImgLoading((prev) => {
      const copy = [...prev];
      copy[idx] = false;
      return copy;
    });
  };

  const handleStock = (item:any) => {
    setFields({...fields,isAddStock:true,item:item,new_buying: item.buying_price,new_selling: item.selling_price,new_quantity: item.quantity})
  }
  const handleDelete = (item:any) => {
    setFields({...fields,isDelete:true,item:item})
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
      urls: [...prev.urls, ...files],
    }));

    e.target.value = ""; // allow re-uploading same file
  };


  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newUrls = formData.urls.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages, urls: newUrls });
  };

  useEffect(()=> {
    if(!measureLoading && formData.measurement.id !== null ){
      const data = measurements.all.find((item:any)=> item.id == formData.measurement.id)
    }
  },[catLoading,measureLoading,formData])


  const handleDownloadPDF = () => {
  // Create the complete HTML document with all content
  const printContents = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Bazenga - ${selected.name}</title>
        <style>
          @page {
            margin: 15mm 20mm;
            size: A4;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            color: #1e293b;
          }
          .document-wrapper {
            max-width: 100%;
            padding: 10px 0;
          }
          
          /* Top Purple Line */
          .top-line {
            height: 4px;
            background: linear-gradient(to right, #7c3aed, #8b5cf6, #a78bfa);
            margin-bottom: 25px;
            border-radius: 2px;
          }

          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo {
            width: 65px;
            height: 65px;
            object-fit: contain;
          }
          .brand {
            display: flex;
            flex-direction: column;
          }
          .brand-name {
            font-size: 22px;
            font-weight: 700;
            color: #7c3aed;
            letter-spacing: -0.5px;
          }
          .brand-tagline {
            font-size: 11px;
            color: #6b7280;
            font-weight: 400;
          }
          .header-right {
            text-align: right;
            font-size: 11px;
            color: #4b5563;
            line-height: 1.6;
          }
          .header-right .biz-name {
            font-weight: 600;
            color: #7c3aed;
            font-size: 13px;
          }
          .header-right .generated {
            margin-top: 4px;
            font-size: 10px;
            color: #9ca3af;
          }

          /* Content */
          .content {
            min-height: 60vh;
          }

          /* Title Section */
          .title-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
          }
          .title-section h1 {
            font-size: 24px;
            color: #0b1a33;
            font-weight: 600;
          }
          .title-section .generated-date {
            font-size: 12px;
            color: #94a3b8;
          }

          /* Table */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          table thead th {
            background: #f8fafc;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            text-transform: uppercase;
            font-size: 11px;
          }
          table tbody td {
            padding: 12px 16px;
            border-bottom: 1px solid #ecf1f7;
            color: #1e293b;
          }
          table tbody tr:last-child td {
            border-bottom: 2px solid #e2e8f0;
          }

          /* Footer */
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-left {
            font-size: 12px;
            color: #94a3b8;
          }
          .footer-left .business-detail {
            color: #7c3aed;
            font-weight: 500;
          }
          .footer-right {
            text-align: right;
            font-size: 12px;
            color: #94a3b8;
          }
          .footer-right .entries {
            color: #7c3aed;
            font-weight: 600;
          }

          /* Bottom Purple Line */
          .bottom-line {
            height: 4px;
            background: linear-gradient(to right, #7c3aed, #8b5cf6, #a78bfa);
            margin-top: 25px;
            border-radius: 2px;
          }

          /* Print styles */
          @media print {
            body { background: white; }
            .logo { display: block; }
          }
        </style>
      </head>
      <body>
        <div class="document-wrapper">
          <!-- Top Line -->
          <div class="top-line"></div>

          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <img src="/gradient.png" alt="Bazenga Logo" class="logo" />
              <div class="brand">
                <div class="brand-name">Bazenga</div>
                <div class="brand-tagline">Business Management System</div>
              </div>
            </div>
            <div class="header-right">
              <div class="biz-name">Bazenga Business Management System</div>
              <div>Kibamba, Ubungo Dar-es-salaam, Tanzania</div>
              <div>https://bazenga-pos.swahilicodes.com</div>
              <div class="generated">Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Title -->
            <div class="title-section">
              <h1>${selected.name}</h1>
              <span class="generated-date">Generated: ${new Date().toLocaleString()}</span>
            </div>

            <!-- Table -->
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>${language === "Swahili" ? "Jina" : "Name"}</th>
                  <th>${language === "Swahili" ? "Bei ya Kununua" : "Buying Price"}</th>
                  <th>${language === "Swahili" ? "Bei ya Kuuza" : "Selling Price"}</th>
                  <th>${language === "Swahili" ? "Kiasi" : "Quantity"}</th>
                </tr>
              </thead>
              <tbody>
                ${data.all && data.all.length > 0 ? data.all.map((item: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.name || ''}</td>
                    <td>${item.buying_price?.toFixed(2) || item.buying_price || '0.00'}</td>
                    <td>${item.selling_price?.toFixed(2) || item.selling_price || '0.00'}</td>
                    <td>${item.quantity || 0} ${item.measurement?.short_form || ''}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">
                      No items to display
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-left">
              <span class="business-detail">${selected.name || 'Business'}</span>
              ${selected.street ? `• ${selected.ward}` : ''}
              ${selected.phone ? `• ${selected.phone}` : ''}
            </div>
            <div class="footer-right">
              <span class="entries">✦ ${data.all?.length || 0}</span> entries • Bazenga
            </div>
          </div>

          <!-- Bottom Line -->
          <div class="bottom-line"></div>
        </div>
      </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (printWindow) {
    printWindow.document.write(printContents);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    // Fallback if popup is blocked
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  }
};

  return (
    <div className={styles.products_page}>
      {
        fields.isAddStock && (
          <div className={styles.stockOverlay} role="dialog" aria-modal="true">
            <div className={styles.content}>
              <button className={styles.close} onClick={() => setFields({...fields,isAddStock:false})} aria-label="Close product details">
              ✕
            </button>
            <div className={styles.stock_content}>
              <div className={styles.stock_item}>
                <label>{language==="Swahili"?'Bei ya Kununua':"Buying Price"}</label>
                <input 
              type="text"
              value={fields.new_buying} 
              onChange={e => setFields({...fields,new_buying: e.target.value})}
              placeholder={language==="Swahili"?'Bei ya Kununua':"Buying Price"}
              />
              </div>
              <div className={styles.stock_item}>
                <label>{language==="Swahili"?'Bei ya Kuuza':"Selling Price"}</label>
                <input 
              type="text"
              value={fields.new_selling} 
              onChange={e => setFields({...fields,new_selling: e.target.value})}
              placeholder={language==="Swahili"?'Idadi':"Quantity"}
              />
              </div>
              <div className={styles.stock_item}>
                <label>{language==="Swahili"?'Idadi':"Quantity"}</label>
                <input 
              type="text"
              value={fields.new_quantity} 
              onChange={e => setFields({...fields,new_quantity: e.target.value})}
              placeholder={language==="Swahili"?'Idadi':"Quantity"}
              />
              </div>
              <button onClick={addStock}>{stockLoading?'loading..':language==="Swahili"?'Ongeza Akiba':'Add Stock'}</button>
            </div>
            </div>
          </div>
        )
      }
      {fields.isDelete && (
  <div className={styles.stockOverlay} role="dialog" aria-modal="true">
    <div className={styles.content}>
      
      <button
        className={styles.close}
        onClick={() => setFields({ ...fields, isDelete: false })}
        aria-label="Close dialog"
      >
        ✕
      </button>

      <div className={styles.stock_content}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>
          {language === "Swahili"
            ? "Je, una uhakika unataka kufuta bidhaa hii?"
            : "Are you sure you want to delete this product?"}
        </p>

        <div className={styles.delete_buttons}>
          <button
            onClick={() => setFields({ ...fields, isDelete: false })}
            style={{ background: "#aaa" }}
          >
            {language === "Swahili" ? "Ghairi" : "Cancel"}
          </button>

          <button
            onClick={deleteProduct}
            style={{ background: "red" }}
          >
            {deleteLoading?'loading...':language === "Swahili" ? "Futa" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.content}>
            <button className={styles.close} onClick={() => setSelectedProduct(null)} aria-label="Close product details">
              ✕
            </button>

            <div className={styles.detail_inner}>
              {/* Left: Image column */}
              <div className={styles.imagesColumn}>
                <div className={styles.image_frame}>
                  {/* main image with shimmer */}
                  <div className={styles.mainImageWrapper}>
                    {imgLoading[currentImage] && (
                      <div className={styles.shimmer} />
                    )}
                    <img
                      src={selectedProduct.images[currentImage]}
                      alt={selectedProduct.name}
                      onClick={() => setFullView(true)}
                      className={styles.mainImage}
                      onLoad={() => handleMainImageLoad(currentImage)}
                      loading="lazy"
                    />
                  </div>

                  {/* arrows */}
                  {selectedProduct.images.length > 1 && (
                    <>
                      <button className={styles.prev} onClick={prevImage} aria-label="Previous image">‹</button>
                      <button className={styles.next} onClick={nextImage} aria-label="Next image">›</button>
                    </>
                  )}
                </div>

                {/* thumbnails */}
                <div className={styles.thumbnailWrapper}>
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumbItem} ${idx === currentImage ? styles.active : ''}`}
                      onClick={() => setCurrentImage(idx)}
                      aria-label={`Show image ${idx + 1}`}
                      type="button"
                    >
                      <div className={styles.thumbInner}>
                        {imgLoading[idx] && <div className={styles.thumbShimmer} />}
                        <img
                          src={img}
                          alt={`thumb-${idx}`}
                          className={styles.thumbnail}
                          onLoad={() => handleMainImageLoad(idx)}
                          loading="lazy"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Info column (table) */}
              <div className={styles.infoColumn}>
                <h2 className={styles.productTitle}>{selectedProduct.name}</h2>

                <table className={styles.infoTable} aria-label="Product information">
                  <tbody>
                    <tr>
                      <th>{language === 'Swahili' ? 'Kundi' : 'Category'}</th>
                      <td>{language === 'Swahili' ? selectedProduct.category.swahili : selectedProduct.category.english}</td>
                    </tr>
                    {selectedProduct.sub_category && (
                      <tr>
                        <th>{language === 'Swahili' ? 'Kund. Ndogo' : 'Sub Category'}</th>
                        <td>{selectedProduct.sub_category}</td>
                      </tr>
                    )}
                    <tr>
                      <th>{language === 'Swahili' ? 'Kiasi' : 'Quantity'}</th>
                      <td>{selectedProduct.quantity} {selectedProduct.measurement.short_form}</td>
                    </tr>
                    <tr>
                      <th>{language === 'Swahili' ? 'Bei ya Kununua' : 'Buying Price'}</th>
                      <td>{selectedProduct.buying_price.toLocaleString()} TZS</td>
                    </tr>
                    <tr>
                      <th>{language === 'Swahili' ? 'Bei ya Kuuza' : 'Selling Price'}</th>
                      <td>{selectedProduct.selling_price.toLocaleString()} TZS</td>
                    </tr>
                    <tr>
                      <th>{language === 'Swahili' ? 'Hali' : 'Status'}</th>
                      <td>{selectedProduct.status}</td>
                    </tr>
                    <tr>
                      <th>{language === 'Swahili' ? 'Kiw. Chini' : 'Min Stock'}</th>
                      <td>{selectedProduct.min_stock}</td>
                    </tr>
                    <tr>
                      <th>{language === 'Swahili' ? 'Mwisho wa Matumizi' : 'Expires On'}</th>
                      <td>{new Date(selectedProduct.expire_date).toLocaleDateString()}</td>
                    </tr>
                    {selectedProduct.description && (
                      <tr>
                        <th>{language === 'Swahili' ? 'Maelezo' : 'Description'}</th>
                        <td className={styles.descCell}>{selectedProduct.description}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full Image View */}
            {fullView && (
              <div className={styles.fullView} onClick={() => setFullView(false)}>
                <img src={selectedProduct.images[currentImage]} alt={selectedProduct.name} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ... rest of the component unchanged (header, analytics, table, pagination) ... */}
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.title_container}>
          <h1>{language === 'Swahili' ? 'Usimamizi wa Bidhaa' : 'Product Management'}</h1>
          <p className={styles.subtitle}>
            {language === 'Swahili'
              ? 'Simamia orodha ya bidhaa zako kwa ufanisi na ustadi'
              : 'Efficiently manage your inventory with elegance'}
          </p>
        </div>
        <div className={styles.right}>
          <div className={styles.search_add}>
            <input
              type="text"
              placeholder={language === 'Swahili' ? 'Tafuta Bidhaa..' : 'Search Products..'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button className={styles.add_btn} onClick={() => setShowModal(true)}>
            <span>{language === 'Swahili' ? 'Ongeza Bidhaa' : 'Add Product'}</span>
          </button>
          <button className={styles.add_btn} onClick={handleDownloadPDF} style={{marginLeft:"5px"}}>
            <Download />
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className={styles.analytics}>
        <div className={styles.card}>
          <h2>{language === 'Swahili' ? 'Bidhaa Zote' : 'Total Products'}</h2>
          <p>{!loading && data?.totalItems ? data.totalItems : 0}</p>
        </div>
        <div className={styles.card}>
          <h2>{language === 'Swahili' ? 'Bei ya Kununua' : 'Total Buying Price'}</h2>
          <p>{nambaComma(totalBuying)}</p>
        </div>
        <div className={styles.card}>
          <h2>{language === 'Swahili' ? 'Bei ya Kuuza' : 'Total Selling Price'}</h2>
          <p>{nambaComma(totalSelling)}</p>
        </div>
        <div className={styles.card}>
          <h2>{language === 'Swahili' ? 'Matarajio ya Faida' : 'Expected Profit'}</h2>
          <p>{nambaComma(totalSelling - totalBuying)}</p>
        </div>
      </div>

      {/* Product Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loading_state}>
            <div className={styles.spinner}></div>
            <p>{language === 'Swahili' ? 'Inapakia bidhaa...' : 'Loading products...'}</p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className={styles.empty_state}>
            <h3>{language === 'Swahili' ? 'Hakuna Bidhaa' : 'No products found'}</h3>
            <button className={styles.add_btn} onClick={() => setShowModal(true)}>
              {language === 'Swahili' ? '+ Ongeza Bidhaa' : '+ Add Product'}
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>{language === 'Swahili' ? 'Jina' : 'Name'}</th>
                <th>{language === 'Swahili' ? 'Picha' : 'Images'}</th>
                <th>{language === 'Swahili' ? 'Idadi' : 'Quantity'}</th>
                <th>{language === 'Swahili' ? 'Bei ya Kununua' : 'Buying Price'}</th>
                <th>{language === 'Swahili' ? 'Bei ya Kuuza' : 'Selling Price'}</th>
                <th>{language === 'Swahili' ? 'Kundi' : 'Category'}</th>
                <th>{language === 'Swahili' ? 'Tendo' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((item: Product, idx: number) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td className={styles.product_name}>{item.name}</td>
                  <td>
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className={styles.image}
                      />
                    ) : (
                      <span className={styles.noImage}>No image</span>
                    )}
                  </td>
                  <td style={{color: `${item.quantity<=item.min_stock && 'red'}`}}>
                    {item.quantity} {item.measurement.short_form || item.measurement.short_form}
                  </td>
                  <td>{nambaComma(item.buying_price)}</td>
                  <td>{nambaComma(item.selling_price)}</td>
                  <td>{language==="Swahili"?item.category.swahili:item.category.english}</td>
                  <td className={styles.actions}>
                    <button 
                      className={cx(styles.actionBtn, styles.deleteBtn)}
                      onClick={() => handleDelete(item)}
                      aria-label="Delete product"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: '#fee2e2',
                        color: '#e74c3c',
                        margin: '2px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e74c3c';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.color = '#e74c3c';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <MdOutlineDelete size={18} />
                    </button>
                    
                    <button 
                      className={cx(styles.actionBtn, styles.viewBtn)}
                      onClick={() => setSelectedProduct(item)}
                      aria-label="View product"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: '#ede7f6',
                        color: '#482691',
                        margin: '2px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#482691';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 38, 145, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ede7f6';
                        e.currentTarget.style.color = '#482691';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <FaEye size={18} />
                    </button>
                    
                    <button 
                      className={cx(styles.actionBtn, styles.stockBtn)}
                      onClick={() => handleStock(item)}
                      aria-label="Add stock"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: '#e0f2e9',
                        color: '#27ae60',
                        margin: '2px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#27ae60';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#e0f2e9';
                        e.currentTarget.style.color = '#27ae60';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(formData.page - 1)}
              disabled={formData.page === 1}
            >
              <FaChevronLeft />
            </button>
            {formData.page > 1 && (
              <button onClick={() => handlePageChange(formData.page - 1)}>
                {formData.page - 1}
              </button>
            )}
            <button className={styles.active}>{formData.page}</button>
            {formData.page < totalPages && (
              <button onClick={() => handlePageChange(formData.page + 1)}>
                {formData.page + 1}
              </button>
            )}
            <button
              onClick={() => handlePageChange(formData.page + 1)}
              disabled={formData.page === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal (redesigned) */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modal_content}>
            <div className={styles.modal_header}>
              <h2>{language === 'Swahili' ? 'Ongeza Bidhaa Mpya' : 'Add New Product'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => submit(e)} className={styles.modal_form}>
              <div className={styles.formGrid}>
                <div className={styles.images_section}>
                  <label className={styles.image_upload}>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                    <div className={styles.uploadInner}>
                      <strong>{language === 'Swahili' ? 'Chagua Picha' : 'Select Images'}</strong>
                      <span className={styles.smallText}>{language === 'Swahili' ? 'Tumia picha za uzito wa chini' : 'Use lightweight images'}</span>
                    </div>
                  </label>
                  <div className={styles.images_preview}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={styles.image_box}>
                        <img src={img} alt={`Preview ${idx}`} />
                        <button type="button" onClick={() => removeImage(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.inputsColumn}>
                  <div className={styles.rowTwo}>
                    <label>
                      {language === 'Swahili' ? 'Jina' : 'Name'}
                      <input type="text" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </label>
                    <label>
                      {language === 'Swahili' ? 'Kiasi' : 'Quantity'}
                      <input type="number" name="quantity" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
                    </label>
                  </div>
                  <div className={styles.rowTwo}>
                    <label>
                      {language === 'Swahili' ? 'Kiwango Cha Chini' : 'Minimum Stock'}
                      <input type="number" name="min_stock" value={formData.min_stock} onChange={e => setFormData({ ...formData, min_stock: Number(e.target.value) })} required />
                    </label>
                    <SearchableSelect
                      options={measurementsList}
                      value={formData.measurement.id}
                      onChange={(id) => setFormData({
                        ...formData,
                        measurement: { ...formData.measurement, id }
                      })}
                      placeholder={language === 'Swahili' ? 'Chagua Kipimo' : 'Select Measurement'}
                      language={language}
                      label={language === 'Swahili' ? 'Kipimo' : 'Measurement'}
                      required
                    />
                  </div>
                  <div className={styles.rowTwo}>
                    <label>
                      {language === 'Swahili' ? 'Bei ya Kununua' : 'Buying Price'}
                      <input type="number" name="buying_price" value={formData.buying_price} onChange={e => setFormData({ ...formData, buying_price: Number(e.target.value) })} required />
                    </label>
                    <label>
                      {language === 'Swahili' ? 'Bei ya Kuuza' : 'Selling Price'}
                      <input type="number" name="selling_price" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: Number(e.target.value) })} required />
                    </label>
                  </div>
                  <div className={styles.rowTwo}>
                    <SearchableSelect
                      options={categoriesList}
                      value={formData.category.id}
                      onChange={(id) => setFormData({
                        ...formData,
                        category: { ...formData.category, id }
                      })}
                      placeholder={language === 'Swahili' ? 'Chagua Kundi' : 'Select Category'}
                      language={language}
                      label={language === 'Swahili' ? 'Kundi' : 'Category'}
                      required
                    />
                    <label>
                      {language === 'Swahili' ? 'Mwisho wa Matumizi (Sio Lazima)' : 'Expire Date (optional)'}
                      <input type="date" name="expire_date" value={formData.expire_date} onChange={e => setFormData({ ...formData, expire_date: e.target.value })} />
                    </label>
                  </div>
                  <label>
                    {language === 'Swahili' ? 'Maelezo (Sio Lazima)' : 'Description (optional)'}
                    <textarea name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </label>
                </div>
              </div>
              <div className={styles.modal_actions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  {language === 'Swahili' ? 'Ghairi' : 'Cancel'}
                </button>
                <button type="submit" className={styles.submitBtn} disabled={createLoading}>
                  {createLoading ? <span className={styles.spinner}></span> : (language === 'Swahili' ? 'Ongeza' : 'Submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
