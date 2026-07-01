'use client';
import React, { useEffect, useState } from 'react';
import styles from './sales.module.scss';
import cx from 'classnames';
import useFetch from '@/utils/fetch';
import useSendRequest from '@/utils/useSendRequest';
import useErrorStore from '@/store/atoms/error';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { IoPrintOutline } from 'react-icons/io5';
import { BsEye } from 'react-icons/bs';
import { MdQrCodeScanner } from 'react-icons/md';
import useLanguageStore from '@/store/atoms/language';
import { Layers, NotebookPen, PackageOpen } from 'lucide-react';

export const metadata = {
  title: "Sales",
  description: "Browse all about sales information",
};

interface Product {
  id: number;
  name: string;
  quantity: number;
  selling_price: number;
  buying_price: number;
  measurement: any
}

interface Sale {
  id: number;
  products: Product[];
  total_price: number;
  discount: number;
  seller: any;
  buyer?: any;
  paid: boolean;
  payment_method?: string;
  createdAt?: string;
}

interface Attendant {
  id: number;
  name: string;
}

interface Totals {
  total_sales: number;
  total_buying: number;
  total_selling: number;
  net_profit: number;
}

interface Fields {
  isAdd: boolean;
  page: number;
  pageSize: number;
  products: Product[];
  isProducts: boolean;
  discount: number;
  saleId?: number;
  clientType: string;
  isPaid: string;
  paymentMethod: string;
  order_no: string;
  toggleType: number;
  paidAmount: number;
}

interface Duration {
  swahili: string;
  english: string;
  id: number;
  value: string;
}

const durations: Duration[] = [
  { swahili: 'Siku', english: 'Day', id: 1, value: 'day' },
  { swahili: 'Wiki', english: 'Week', id: 2, value: 'week' },
  { swahili: 'Mwezi', english: 'Month', id: 3, value: 'month' },
  { swahili: 'Mwaka', english: 'Year', id: 4, value: 'year' },
  { swahili: 'Muda Wote', english: 'All', id: 5, value: 'all' },
  { swahili: 'Maalumu', english: 'Custom', id: 6, value: 'custom' },
];

const Sales: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [fields, setFields] = useState<Fields>({
    isAdd: false,
    page: 1,
    pageSize: 10,
    products: [],
    isProducts: true,
    discount: 0,
    clientType: 'old',
    isPaid: 'Cash',
    paymentMethod: 'Cash',
    order_no: '',
    toggleType: 1,
    paidAmount: 0
  });
  const [sellerId, setSellerId] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'loan'>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('day');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showProductsModal, setShowProductsModal] = useState<boolean>(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { setError } = useErrorStore();
  const { selected } = useSelectedBusinessStore();
  const { language } = useLanguageStore();

  // Fetch parameters for sales
  const salesFetchParams = {
    page: fields.page,
    pageSize: fields.pageSize,
    business_id: selected?.id,
    seller_id: sellerId !== 'all' ? sellerId : undefined,
    payment_filter: paymentFilter,
    duration: selectedDuration,
    start: selectedDuration === 'custom' ? customStartDate : undefined,
    end: selectedDuration === 'custom' ? customEndDate : undefined,
    order_no: fields.order_no
  };

  // Fetch parameters for products in the modal
  const productsFetchParams = {
    page: fields.page,
    pageSize: fields.pageSize,
    business_id: selected?.id,
    name,
  };

  const { data: productsData, loading: productsLoading } = useFetch<{
    data: Product[];
    totalItems: number;
  }>(`${process.env.NEXT_PUBLIC_HOST}/products/get_products`, productsFetchParams);

  const { data: salesData, loading: salesLoading } = useFetch<{
    rows: Sale[];
    count: number;
  }>(`${process.env.NEXT_PUBLIC_HOST}/sales/get_sales`, salesFetchParams);

  const { data: totalsData } = useFetch<Totals>(`${process.env.NEXT_PUBLIC_HOST}/sales/get_totals`, salesFetchParams);

  const { data: attendantsData, loading: attendantsLoading } = useFetch<{
    data: Attendant[];
  }>(`${process.env.NEXT_PUBLIC_HOST}/attendant/get_attendants`, { business_id: selected?.id });

  const { sendRequest: sell, loading: sellLoading } = useSendRequest({
    url: fields.saleId ? `${process.env.NEXT_PUBLIC_HOST}/sales/update_sale/${fields.saleId}` : `${process.env.NEXT_PUBLIC_HOST}/sales/sale`,
    method: fields.saleId ? 'PUT' : 'POST',
    body: {
      products: fields.products,
      discount: fields.discount,
      business_id: selected?.id,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      isPaid: fields.isPaid === 'Cash' ? true : false,
      payment_method: fields.paymentMethod,
      paid_amount: fields.paidAmount
    },
  });

  useEffect(()=> {
    console.log('sales data ',salesData)
  },[salesData])

  const handleSelect = (item: Product) => {
    setFields((prev) => {
      const updatedProducts = [...prev.products];
      const index = updatedProducts.findIndex((p) => p.id === item.id);

      if (index !== -1) {
        updatedProducts.splice(index, 1);
      } else {
        updatedProducts.push({
          id: item.id,
          name: item.name,
          quantity: 1,
          selling_price: item.selling_price,
          buying_price: item.buying_price,
          measurement: item.measurement
        });
      }

      return { ...prev, products: updatedProducts };
    });
  };

  const handleToggle = () => {
    if(fields.toggleType===1){
      setFields({...fields,toggleType: 0.25})
    }else{
      setFields({...fields,toggleType: 1})
    }
  }

  const handleQuantityChange = (isIncrease: boolean, item: Product) => {
  setFields((prev) => ({
    ...prev,
    products: prev.products.map((product) => {
      if (product.id !== item.id) return product;

      const maxQuantity = productsData?.data.find((p: { id: number }) => p.id === item.id)?.quantity || 0;
      let newQuantity = product.quantity;
      
      // Determine the step value based on toggleType
      const step = prev.toggleType === 0.25 ? 0.25 : 1;

      if (isIncrease) {
        if (newQuantity + step <= maxQuantity) {
          newQuantity += step;
        } else {
          setError({ message: 'Cannot exceed available quantity', title: 'Error' });
        }
      } else {
        const minQuantity = step === 0.25 ? 0.25 : 1;
        if (newQuantity - step >= minQuantity) {
          newQuantity -= step;
        } else {
          setError({ message: `Quantity cannot be less than ${minQuantity}`, title: 'Error' });
        }
      }

      return { ...product, quantity: newQuantity };
    }),
  }));
};

  const handleNext = () => {
    if (fields.products.length > 0) {
      setFields({ ...fields, isProducts: false });
    } else {
      setError({ message: 'Please select at least one product', title: 'Error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sell();
    //setFields({ ...fields, isAdd: false, products: [], discount: 0, page: 1 });
    setBuyerName('');
    setBuyerPhone('');
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setShowProductsModal(true);
  };

  const handlePrint = (sale: Sale) => {
    const total = sale.products.reduce((acc, p) => acc + p.quantity * p.selling_price, 0);
    const change = total - sale.discount;
    const receiptContent = `
      <html>
        <head><title>Receipt</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center;">Receipt</h1>
          <p><strong>Customer:</strong> ${sale.buyer.name || 'N/A'} - ${sale.buyer.phone || 'N/A'}</p>
          <p><strong>Shop:</strong> ${selected?.name || 'Shop'}</p>
          <p><strong>Address:</strong> Address</p>
          <p><strong>Phone:</strong> 1 012 345 67 89</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 8px;">ID</th>
                <th style="padding: 8px;">Name</th>
                <th style="padding: 8px;">Quantity</th>
                <th style="padding: 8px;">Price</th>
                <th style="padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.products
                .map(
                  (p) =>
                    `<tr><td style="padding: 8px;">${p.id}</td><td style="padding: 8px;">${p.name}</td><td style="padding: 8px;">${p.quantity}</td><td style="padding: 8px;">${p.selling_price.toLocaleString()}</td><td style="padding: 8px;">${(
                      p.quantity * p.selling_price
                    ).toLocaleString()}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
          <p><strong>Total:</strong> ${total.toLocaleString()} TZS</p>
          <p><strong>Discount:</strong> ${sale.discount.toLocaleString()} TZS</p>
          <p><strong>Change:</strong> ${change.toLocaleString()} TZS</p>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow?.document.write(receiptContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalProductPages) {
      setFields((prev) => ({ ...prev, page }));
    }
  };

  const handleDurationChange = (value: string,start:string,end:string) => {
    if(value=='custom'){
      setSelectedDuration(value)
      if(start.trim() !=="" || end.trim()!==''){
        setCustomStartDate(start)
        setCustomEndDate(end)
        setSelectedDuration(value)
      }
    }else{
      setSelectedDuration(value);
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  // Reset page to 1 when search term changes
  useEffect(() => {
    setFields((prev) => ({ ...prev, page: 1 }));
  }, [name,customEndDate,customStartDate]);

  const totalSelling = fields.products.reduce((acc, p) => acc + p.selling_price * p.quantity, 0);
  const totalSalesPages = salesData?.count ? Math.ceil(salesData.count / fields.pageSize) : 0;
  const totalProductPages = productsData?.totalItems ? Math.ceil(productsData.totalItems / fields.pageSize) : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleString();
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3); // Adjust for timezone as in Flutter code
    return date.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const formatDate1 = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleString();
    const date = new Date(dateString);
    date.setHours(date.getHours()); // Adjust for timezone as in Flutter code
    return date.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    // <Head>
    <div className={styles.sales}>
      {/* <title>Sales Page | {selected.name}</title> */}
      <div className={styles.header}>
        <div className={styles.title_container}>
          <h1>{language === 'Swahili' ? 'Mauzo' : 'Sales'}</h1>
          <p className={styles.subtitle}>
            {language === 'Swahili' ? 'Fuatilia na simamia mauzo yako kwa urahisi' : 'Track and manage your sales with ease'}
          </p>
        </div>
        <div className={styles.right}>
          <div className={styles.seller_dropdown}>
            {attendantsLoading ? (
              <p>{language === 'Swahili' ? 'Inapakia wauzaji...' : 'Loading sellers...'}</p>
            ) : (
              <select value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
                <option value="all">{language === 'Swahili' ? 'Wauzaji Wote' : 'All Sellers'}</option>
                {attendantsData?.data.map((attendant: any, index: number) => (
                  <option key={index} value={attendant.id}>
                    {attendant.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className={styles.order_no}>
            <input 
              type="text" 
              value={fields.order_no}
              onChange={e => setFields({...fields,order_no: e.target.value})}
              placeholder={language==="Swahili"?"Ingiza Namba ya oda":"Enter Order Number"}
            />
          </div>
          <button
            className={styles.add_btn}
            onClick={() => setFields({ ...fields, isAdd: true, saleId: undefined })}
          >
            <span>{language === 'Swahili' ? '+ Ongeza Mauzo' : '+ Add Sale'}</span>
          </button>
          <button
            className={styles.qr_btn}
            onClick={() => alert(language === 'Swahili' ? 'Skana ya QR haijatekelezwa kwa wavuti' : 'QR Scanner not implemented for web')}
          >
            <MdQrCodeScanner size={24} />
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div
          className={cx(styles.filter_btn, paymentFilter === 'all' && styles.active_all)}
          onClick={() => setPaymentFilter('all')}
        >
          {language === 'Swahili' ? 'Yote' : 'All'}
        </div>
        <div
          className={cx(styles.filter_btn, paymentFilter === 'cash' && styles.active_cash)}
          onClick={() => setPaymentFilter('cash')}
        >
          {language === 'Swahili' ? 'Pesa' : 'Cash'}
        </div>
        <div
          className={cx(styles.filter_btn, paymentFilter === 'loan' && styles.active_loan)}
          onClick={() => setPaymentFilter('loan')}
        >
          {language === 'Swahili' ? 'Mkopo' : 'Loan'}
        </div>
      </div>

      <div className={styles.durations}>
        {durations.map((dur) => (
          <div
            key={dur.id}
            className={cx(styles.duration_chip, selectedDuration === dur.value && styles.active_duration)}
            onClick={() => handleDurationChange(dur.value,customStartDate,customEndDate)}
          >
            {language === 'Swahili' ? dur.swahili : dur.english}
          </div>
        ))}
      </div>

      {selectedDuration === 'custom' && (
        <div className={styles.custom_dates}>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            placeholder={language === 'Swahili' ? 'Tarehe ya Mwanzo' : 'Start Date'}
          />
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            placeholder={language === 'Swahili' ? 'Tarehe ya Mwisho' : 'End Date'}
          />
        </div>
      )}

      <div className={styles.analytics}>
        <div className={styles.card}>
          <div className={styles.card_icon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3h18v18H3z"></path>
              <path d="M7 7h10v10H7z"></path>
            </svg>
          </div>
          <h2>{language === 'Swahili' ? 'Jumla ya Mauzo' : 'Total Sales'}</h2>
          {!salesLoading && <p>{salesData.all.toLocaleString()}</p>}
        </div>
        <div className={styles.card}>
          <div className={styles.card_icon}>
            <Layers className={styles.icon}/>
          </div>
          <h2>{language === 'Swahili' ? 'Jumla ya Ununuzi' : 'Total Buying'}</h2>
          {!salesLoading && <p>{salesData.totals.total_buying.toLocaleString()}</p>}
        </div>
        <div className={styles.card}>
          <div className={styles.card_icon}>
            <NotebookPen className={styles.icon}/>
          </div>
          <h2>{language === 'Swahili' ? 'Jumla ya Uuzaji' : 'Total Selling'}</h2>
          {!salesLoading && <p>{salesData.totals.total_selling.toLocaleString()}</p>}
        </div>
        <div className={styles.card}>
          <div className={styles.card_icon}>
            <PackageOpen className={styles.icon}/>
          </div>
          <h2>{language === 'Swahili' ? 'Faida Halisi' : 'Net Profit'}</h2>
          {!salesLoading && <p>{salesData.totals.net_profit.toLocaleString()}</p>}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {salesLoading ? (
          <div className={styles.loading_state}>
            <div className={styles.spinner}></div>
            <p>{language === 'Swahili' ? 'Inapakia mauzo...' : 'Loading sales...'}</p>
          </div>
        ) : !salesData?.rows.length ? (
          <div className={styles.empty_state}>
            <svg
              className={styles.empty_icon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3h18v18H3z"></path>
              <path d="M7 7h10v10H7z"></path>
            </svg>
            <h3>{language === 'Swahili' ? 'Hakuna Mauzo' : 'No Sales'}</h3>
            <p>{language === 'Swahili' ? 'Ongeza mauzo ili uanze' : 'Add a sale to get started'}</p>
            <button
              className={styles.add_btn}
              onClick={() => setFields({ ...fields, isAdd: true, saleId: undefined })}
            >
              {language === 'Swahili' ? '+ Uza' : '+ Sell'}
            </button>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{language === 'Swahili' ? 'Bidhaa' : 'Products'}</th>
                  <th>{language === 'Swahili' ? 'Bei' : 'Price'}</th>
                  <th>{language === 'Swahili' ? 'Tarehe' : 'Date'}</th>
                  <th>{language === 'Swahili' ? 'Tendo' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {salesData.rows.map((sale: Sale, index: number) => (
                  <tr key={sale.id}>
                    <td>{index + 1}</td>
                    <td>
                      {sale.products[0]?.name}
                      {sale.products.length > 1 && ` +${sale.products.length - 1}`}
                    </td>
                    <td className={cx(sale.paid ? styles.price_paid : styles.price_unpaid)}>
                      {sale.total_price.toLocaleString()}
                    </td>
                    <td className={styles.price_paid}>
                      {formatDate1(sale.createdAt)}
                    </td>
                    <td className={styles.actions}>
                      <div className={styles.action}>
                        <BsEye className={styles.icon} size={20} onClick={() => handleView(sale)} />
                      </div>
                      <div className={styles.action}>
                        <IoPrintOutline className={styles.icon} size={20} onClick={() => handlePrint(sale)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalSalesPages > 0 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(fields.page - 1)}
                  disabled={fields.page === 1}
                  className={styles.pagination_arrow}
                >
                  <FaChevronLeft />
                </button>
                {fields.page > 1 && (
                  <button onClick={() => handlePageChange(fields.page - 1)}>{fields.page - 1}</button>
                )}
                <button className={styles.active}>{fields.page}</button>
                {fields.page < totalSalesPages && (
                  <button onClick={() => handlePageChange(fields.page + 1)}>{fields.page + 1}</button>
                )}
                <button
                  onClick={() => handlePageChange(fields.page + 1)}
                  disabled={fields.page === totalSalesPages}
                  className={styles.pagination_arrow}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className={cx(styles.modal, fields.isAdd && styles.active)}>
        <div className={styles.modal_content}>
          <div className={styles.modal_header}>
            <h2>
              {language === 'Swahili'
                ? fields.saleId
                  ? 'Hariri Mauzo'
                  : 'Ongeza Mauzo Mapya'
                : fields.saleId
                ? 'Edit Sale'
                : 'Add New Sale'}
            </h2>
            <button
              className={styles.close_button}
              onClick={() => setFields({ ...fields, isAdd: false, saleId: undefined })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          {fields.isProducts ? (
            <div className={styles.prods}>
              <div className={styles.search}>
                <div className={styles.search_container}>
                  <input
                    type="text"
                    placeholder={language === 'Swahili' ? 'Tafuta bidhaa...' : 'Search products...'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <svg
                    className={styles.search_icon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <div className={styles.second}>
                   <div 
                    className={styles.toggleSwitch} 
                    onClick={handleToggle}
                  >
                    <div className={styles.valueDisplay}>
                      {fields.toggleType}
                    </div>

                    <div className={`${styles.switch} ${fields.toggleType === 0.25 ? styles.active : ''}`}>
                      <div className={styles.knob} />
                    </div>
                  </div>
                {fields.products.length > 0 && (
                  <button className={styles.submit} onClick={handleNext}>
                    {sellLoading ? (language === 'Swahili' ? 'Inapakia...' : 'Loading...') : (language === 'Swahili' ? 'Endelea' : 'Next')}
                  </button>
                )}
                </div>
              </div>
              {fields.products.length > 0 && (
                <div className={styles.selected_list}>
                  <h3 className={styles.title}>{language === 'Swahili' ? 'Bidhaa Zilizochaguliwa' : 'Selected Products'}</h3>
                  <div className={styles.heading}>
                    <div className={styles.heading_item}>{language === 'Swahili' ? 'Chagua' : 'Select'}</div>
                    <div className={styles.heading_item}>#</div>
                    <div className={styles.heading_item}>{language === 'Swahili' ? 'Jina' : 'Name'}</div>
                    <div className={styles.heading_item}>{language === 'Swahili' ? 'Inapatikana' : 'Available'}</div>
                    <div className={styles.heading_item}>{language === 'Swahili' ? 'Bei' : 'Price'}</div>
                    <div className={styles.heading_item}>{language === 'Swahili' ? 'Idadi' : 'Quantity'}</div>
                  </div>
                  {productsLoading ? (
                    <div className={styles.loading_state}>
                      <div className={styles.spinner}></div>
                      <p>{language === 'Swahili' ? 'Inapakia bidhaa...' : 'Loading products...'}</p>
                    </div>
                  ) : (
                    productsData?.all
                      .filter((p: { id: number }) => fields.products.some((item) => item.id === p.id))
                      .map((item: Product, index: number) => (
                        <div className={styles.list_item} key={item.id}>
                          <div className={styles.inside_item}>
                            <input
                              type="checkbox"
                              checked={fields.products.some((p) => p.id === item.id)}
                              onChange={() => handleSelect(item)}
                            />
                          </div>
                          <div className={styles.inside_item}>{index + 1}</div>
                          <div className={styles.inside_item}>{item.name}</div>
                          <div className={styles.inside_item}>
                            {(item.quantity - (fields.products.find((p) => p.id === item.id)?.quantity || 0)).toFixed(2)}
                          </div>
                          <div className={styles.inside_item}>{item.selling_price.toLocaleString()} TZS</div>
                          <div className={styles.inside_item}>
                            <div className={styles.item_button}>
                              <button className={cx(styles.button,styles.decrease)} onClick={() => handleQuantityChange(false, item)}>
                                -
                              </button>
                              <p>{fields.products.find((p) => p.id === item.id)?.quantity.toFixed(2) || '0.00'}</p>
                              <button className={cx(styles.button,styles.increase)} onClick={() => handleQuantityChange(true, item)}>
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
              <div className={styles.list}>
                <div className={styles.heading}>
                  <div className={styles.heading_item}>{language === 'Swahili' ? 'Chagua' : 'Select'}</div>
                  <div className={styles.heading_item}>#</div>
                  <div className={styles.heading_item}>{language === 'Swahili' ? 'Jina' : 'Name'}</div>
                  <div className={styles.heading_item}>{language === 'Swahili' ? 'Inapatikana' : 'Available'}</div>
                  <div className={styles.heading_item}>{language === 'Swahili' ? 'Bei' : 'Price'}</div>
                  <div className={styles.heading_item}>{language === 'Swahili' ? 'Idadi' : 'Quantity'}</div>
                </div>
                {productsLoading ? (
                  <div className={styles.loading_state}>
                    <div className={styles.spinner}></div>
                    <p>{language === 'Swahili' ? 'Inapakia bidhaa...' : 'Loading products...'}</p>
                  </div>
                ) : !productsData?.data.length ? (
                  <div className={styles.empty_state}>
                    <h3>{language === 'Swahili' ? 'Hakuna bidhaa zilizopatikana' : 'No products found'}</h3>
                    <p>
                      {language === 'Swahili'
                        ? 'Jaribu kurekebisha utafutaji wako au ongeza bidhaa kwenye ukurasa wa Bidhaa'
                        : 'Try adjusting your search or adding products in the Products page'}
                    </p>
                  </div>
                ) : (
                  productsData?.data.map((item: Product, index: number) => (
                    <div className={styles.list_item} key={item.id}>
                      <div className={styles.inside_item}>
                        <input
                          type="checkbox"
                          checked={fields.products.some((p) => p.id === item.id)}
                          onChange={() => handleSelect(item)}
                        />
                      </div>
                      <div className={styles.inside_item}>{index + 1}</div>
                      <div className={styles.inside_item}>{item.name}</div>
                      <div className={styles.inside_item}>
                        {(item.quantity - (fields.products.find((p) => p.id === item.id)?.quantity || 0)).toFixed(2)}
                      </div>
                      <div className={styles.inside_item}>{item.selling_price.toLocaleString()} TZS</div>
                      <div className={styles.inside_item}>
                        <div className={styles.item_button}>
                          <button className={styles.button} onClick={() => handleQuantityChange(false, item)}>
                            -
                          </button>
                          <p>{fields.products.find((p) => p.id === item.id)?.quantity.toFixed(2) || '0.00'}</p>
                          <button className={styles.button} onClick={() => handleQuantityChange(true, item)}>
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {totalProductPages > 0 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(fields.page - 1)}
                    disabled={fields.page === 1}
                  >
                    <FaChevronLeft />
                  </button>
                  {fields.page > 1 && (
                    <button onClick={() => handlePageChange(fields.page - 1)}>
                      {fields.page - 1}
                    </button>
                  )}
                  <button className={styles.active}>{fields.page}</button>
                  {fields.page < totalProductPages && (
                    <button onClick={() => handlePageChange(fields.page + 1)}>
                      {fields.page + 1}
                    </button>
                  )}
                  <button
                    onClick={() => handlePageChange(fields.page + 1)}
                    disabled={fields.page === totalProductPages}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form
              className={styles.modal_form}
              onSubmit={handleSubmit}
            >
              <div className={styles.personal_information}>
                <h3 className={styles.title}>{language === 'Swahili' ? 'Taarifa za Mteja' : 'Client Details'}</h3>
                <div className={styles.input_group}>
                  <label className={styles.radio_group}>
                    <span>{language === 'Swahili' ? 'Aina ya Mteja' : 'Client Type'}</span>
                    <div className={styles.radio_buttons}>
                      <label>
                        <input
                          type="radio"
                          value="old"
                          checked={fields.clientType === 'old'}
                          onChange={(e) => setFields({ ...fields, clientType: e.target.value })}
                        />
                        {language === 'Swahili' ? 'Aliyepo' : 'Existing'}
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="new"
                          checked={fields.clientType === 'new'}
                          onChange={(e) => setFields({ ...fields, clientType: e.target.value })}
                        />
                        {language === 'Swahili' ? 'Mpya' : 'New'}
                      </label>
                    </div>
                  </label>
                </div>
                {fields.clientType === 'new' && (
                  <div className={styles.input_group}>
                    <label>
                      {language === 'Swahili' ? 'Jina la Mteja' : 'Client Name'}
                      <input
                        type="text"
                        placeholder={language === 'Swahili' ? 'Jina la Mteja' : 'Client Name'}
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                      />
                    </label>
                    <label>
                      {language === 'Swahili' ? 'Namba ya Simu' : 'Phone Number'}
                      <input
                        type="text"
                        placeholder={language === 'Swahili' ? 'Namba ya Simu' : 'Phone Number'}
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className={styles.personal_information}>
                <h3 className={styles.title}>{language === 'Swahili' ? 'Punguzo' : 'Discount'}</h3>
                <div className={styles.input_group}>
                  <label>
                    {language === 'Swahili' ? 'Ingiza Punguzo' : 'Enter Discount'}
                    <div className={styles.price_input}>
                      <span className={styles.currency}>TZS</span>
                      <input
                        type="number"
                        value={fields.discount}
                        onChange={(e) => setFields({ ...fields, discount: Number(e.target.value) })}
                        placeholder={language === 'Swahili' ? 'Punguzo' : 'Discount'}
                        min="0"
                      />
                    </div>
                  </label>
                  <label>
                    {language === 'Swahili' ? 'Bei ya Uuzaji' : 'Selling Price'}
                    <p>{totalSelling.toLocaleString()} TZS</p>
                  </label>
                </div>
                <label>
                  {language === 'Swahili' ? 'Jumla Baada ya Punguzo' : 'Total After Discount'}
                  <p>{(totalSelling - fields.discount).toLocaleString()} TZS</p>
                </label>
              </div>
              <div className={styles.personal_information}>
                <h3 className={styles.title}>{language === 'Swahili' ? 'Hali ya Malipo' : 'Payment Status'}</h3>
                <div className={styles.input_group}>
                  <label className={styles.radio_group}>
                    <span>{language === 'Swahili' ? 'Aina ya Malipo' : 'Payment Type'}</span>
                    <div className={styles.radio_buttons}>
                      <label>
                        <input
                          type="radio"
                          value="Cash"
                          checked={fields.isPaid === 'Cash'}
                          onChange={(e) => setFields({ ...fields, isPaid: e.target.value })}
                        />
                        {language === 'Swahili' ? 'Taslimu' : 'Cash'}
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="Loan"
                          checked={fields.isPaid === 'Loan'}
                          onChange={(e) => setFields({ ...fields, isPaid: e.target.value })}
                        />
                        {language === 'Swahili' ? 'Mkopo' : 'Loan'}
                      </label>
                    </div>
                  </label>
                </div>
                {
                  fields.isPaid==="Loan" && 
                  <div className={styles.initial_pay}>
                    <div className={styles.label}>
                      <p>{language === 'Swahili' ? 'Kiasi Kilicho Lipwa' : 'Initial Payment'}</p>
                      <span>{language === 'Swahili' ? '(Hiari)' : '(Optional)'}</span>
                    </div>
                    <input
                        type="number"
                        value={fields.paidAmount}
                        onChange={(e) => setFields({ ...fields, paidAmount: Number(e.target.value) })}
                        placeholder={language === 'Swahili' ? 'Kiasi Kilicho Lipwa' : 'Initial Payment'}
                        min="0"
                      />
                  </div>
                }
                  <label>
                    {language === 'Swahili' ? 'Njia ya Malipo' : 'Payment Method'}
                    <select
                      value={fields.paymentMethod}
                      onChange={(e) => setFields({ ...fields, paymentMethod: e.target.value })}
                      className={styles.select}
                    >
                      {[
                        { swahili: 'Taslimu', english: 'Cash', value: 'cash' },
                        { swahili: 'Simu', english: 'Mobile', value: 'mobile' },
                        { swahili: 'Benki', english: 'Bank', value: 'bank' },
                        { swahili: 'Nyingine', english: 'Other', value: 'other' },
                      ].map((method) => (
                        <option key={method.value} value={method.value}>
                          {language === 'Swahili' ? method.swahili : method.english}
                        </option>
                      ))}
                    </select>
                  </label>
              </div>
              <div className={styles.modal_actions}>
                <button
                  type="button"
                  className={styles.cancel_btn}
                  onClick={() => setFields({ ...fields, isProducts: true })}
                >
                  {language === 'Swahili' ? 'Rudi' : 'Back'}
                </button>
                <button type="submit" className={styles.submit_button} disabled={sellLoading}>
                  {sellLoading ? (
                    <span className={styles.spinner}></span>
                  ) : language === 'Swahili' ? (
                    'Wasilisha'
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showProductsModal && selectedSale && (
        <div className={cx(styles.modal, styles.active)}>
          <div className={styles.sale_modal_content}>
            <div className={styles.sale_modal_header}>
              <h2>{language === 'Swahili' ? 'Maelezo ya Mauzo' : 'Sale Description'}</h2>
              <button className={styles.close_button} onClick={() => setShowProductsModal(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className={styles.sale_modal_body}>
              <div className={styles.info_card}>
                <h3>{language === 'Swahili' ? 'Taarifa za Mnunuzi' : 'Buyer Information'}</h3>
                <div className={styles.divider}></div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Jina' : 'Name'}</span>
                  <span className={styles.info_value}>{selectedSale.buyer !== null ?selectedSale.buyer.name : 'N/A'}</span>
                </div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Simu' : 'Phone'}</span>
                  <span className={styles.info_value}>{selectedSale.buyer !==null?selectedSale.buyer.phone : 'N/A'}</span>
                </div>
              </div>
              <div className={styles.info_card}>
                <h3>{language === 'Swahili' ? 'Taarifa za Mauzo' : 'Sale Information'}</h3>
                <div className={styles.divider}></div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Muuzaji' : 'Seller'}</span>
                  <span className={styles.info_value}>
                    {selectedSale.seller || 'N/A'}
                  </span>
                </div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Tarehe' : 'Date'}</span>
                  <span className={styles.info_value}>{formatDate(selectedSale.createdAt)}</span>
                </div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Njia ya Malipo' : 'Payment Method'}</span>
                  <span className={styles.info_value}>{selectedSale.payment_method?.toUpperCase() || 'N/A'}</span>
                </div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Hali ya Malipo' : 'Payment Status'}</span>
                  <span className={cx(styles.info_value, !selectedSale.paid && styles.unpaid)}>
                    {selectedSale.paid
                      ? `${language === 'Swahili' ? 'Imelipwa' : 'Paid'} ✅`
                      : `${language === 'Swahili' ? 'Inasubiri' : 'Pending'} ❌`}
                  </span>
                </div>
              </div>
              <div className={styles.info_card}>
                <h3>{language === 'Swahili' ? 'Bidhaa' : 'Products'}</h3>
                <div className={styles.divider}></div>
                <table className={styles.product_table}>
                  <thead>
                    <tr>
                      <th>{language === 'Swahili' ? 'Bidhaa' : 'Product'}</th>
                      <th>{language === 'Swahili' ? 'Kiasi' : 'Qty'}</th>
                      <th>{language === 'Swahili' ? 'Bei' : 'Price'}</th>
                      <th>{language === 'Swahili' ? 'Jumla' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.products.map((product, index) => (
                      <tr key={product.id} className={index % 2 === 0 ? styles.even_row : styles.odd_row}>
                        <td>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td className={cx(!selectedSale.paid && styles.unpaid)}>
                          {formatCurrency(product.selling_price)} TZS
                        </td>
                        <td className={cx(!selectedSale.paid && styles.unpaid)}>
                          {formatCurrency(product.quantity * product.selling_price)} TZS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.info_card}>
                <h3>{language === 'Swahili' ? 'Muhtasari' : 'Summary'}</h3>
                <div className={styles.divider}></div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Jumla ya Bei' : 'Total Price'}</span>
                  <span className={cx(styles.info_value, !selectedSale.paid && styles.unpaid)}>
                    {formatCurrency(selectedSale.total_price)} TZS
                  </span>
                </div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Punguzo' : 'Discount'}</span>
                  <span className={cx(styles.info_value, !selectedSale.paid && styles.unpaid)}>
                    {formatCurrency(selectedSale.discount)} TZS
                  </span>
                </div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Mauzo ya Mwisho' : 'Final Sale'}</span>
                  <span className={cx(styles.info_value, !selectedSale.paid && styles.unpaid)}>
                    {formatCurrency(selectedSale.total_price - selectedSale.discount)} TZS
                  </span>
                </div>
                <div className={styles.info_row}>
                  <span className={styles.info_label}>{language === 'Swahili' ? 'Faida' : 'Profit'}</span>
                  <span className={cx(styles.info_value, !selectedSale.paid && styles.unpaid)}>
                    {formatCurrency(
                      selectedSale.products.reduce((acc, p) => acc + (p.selling_price - p.buying_price) * p.quantity, 0)
                    )} TZS
                  </span>
                </div>
              </div>
              {!selectedSale.paid && (
                <div className={styles.mark_paid_button}>
                  <button>
                    {language === 'Swahili' ? 'Thibitisha Malipo' : 'Mark as Paid'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    // </Head>
  );
};

export default Sales;