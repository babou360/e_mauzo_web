'use client';

import React, { useState, useMemo } from 'react';
import useSelectedBusinessStore from '@/store/atoms/selected_business';
import styles from './style.module.scss';
import useFetch from '@/utils/fetch';
import useLanguageStore from '@/store/atoms/language';

const TIME_FILTERS = [
    {
        swahili: 'Siku',
        english: 'Day',
        value: 'day',
    },
    {
        swahili: 'Wiki',
        english: 'Week',
        value: 'week',
    },
    {
        swahili: 'Mwezi',
        english: 'Month',
        value: 'month',
    },
    {
        swahili: 'Mwaka',
        english: 'Year',
        value: 'year',
    },
    {
        swahili: 'Muda Wote',
        english: 'All',
        value: 'all',
    },
    {
        swahili: 'Muda Maalumu',
        english: 'Custom',
        value: 'custom',
    },
] as const;

const PAYMENT_FILTERS = [
    { swahili: 'Zote', english: 'All', value: 'all' },
    { swahili: 'Pesa', english: 'Cash', value: 'cash' },
    { swahili: 'Deni', english: 'Loan', value: 'loan' },
] as const;

const ROWS_PER_PAGE = [10, 25, 50, 100, -1];

const formatDate = (date: Date, fmt: string) => {
    const map: Record<string, string> = {
        dd: String(date.getDate()).padStart(2, '0'),
        MM: String(date.getMonth() + 1).padStart(2, '0'),
        yyyy: String(date.getFullYear()),
        HH: String(date.getHours()).padStart(2, '0'),
        mm: String(date.getMinutes()).padStart(2, '0'),
        ss: String(date.getSeconds()).padStart(2, '0'),
        a: date.getHours() >= 12 ? 'PM' : 'AM',
    };
    return fmt.replace(/dd|MM|yyyy|HH|mm|ss|a/g, m => map[m]);
};

const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDate(d, 'dd-MM-yyyy HH:mm');
};

const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};

interface Measurement {
    id: number;
    english: string;
    swahili: string;
    short_form: string;
}

interface Product {
    id: number;
    name: string;
    quantity: number;
    buying_price: number;
    selling_price: number;
    measurement?: Measurement;
}

interface Sale {
    id: number;
    order_no: string;
    buyer: string | null | { name?: string };
    createdAt: string;
    discount: number;
    products: Product[];
    seller: string;
    total_price: number;
    sale_total: number;
    sale_profit: number;
    paid: boolean;
    payment_method: string;
}

interface SalesResponse {
    rows: Sale[];
    all: number;
    count: number;
    totalPages: number;
    totals: {
        total_selling: number;
        total_buying: number;
        net_profit: number;
    };
}

interface Attendant {
    id: number;
    name: string;
}

export default function SalesReport() {
    const { selected } = useSelectedBusinessStore();
    const { language } = useLanguageStore();

    const isSwahili = language === 'Swahili';

    const [filters, setFilters] = useState({
        duration: 'month',
        seller_id: '',
        payment_filter: 'all',
        start: '',
        end: '',
        page: 1,
        pageSize: 10,
    });

    const { data: salesData, loading: salesLoading, error: salesError } = useFetch<SalesResponse>(
        `${process.env.NEXT_PUBLIC_HOST}/sales/get_sales`,
        {
            page: filters.page,
            pageSize: filters.pageSize,
            business_id: selected?.id,
            seller_id: filters.seller_id,
            duration: filters.duration,
            payment_filter: filters.payment_filter,
            order_no: '',
            start: filters.start,
            end: filters.end,
        }
    );

    const { data: attendData, loading: attendLoading } = useFetch<{ data: Attendant[] }>(
        `${process.env.NEXT_PUBLIC_HOST}/attendant/get_attendants`,
        {
            page: 1,
            pageSize: 100,
            name: '',
            business_id: selected?.id
        }
    );

    const summary = useMemo(() => {
        if (!salesData) {
            return {
                totalRevenue: 0,
                totalCost: 0,
                totalProfit: 0,
                totalDiscount: 0,
                totalProductsSold: 0,
                totalTransactions: 0,
                uniqueProducts: 0,
            };
        }

        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;
        let totalDiscount = 0;
        let totalProductsSold = 0;
        const uniqueProductIds = new Set<number>();

        salesData.rows.forEach((sale: any) => {
            totalRevenue += Number(sale.sale_total) || 0;
            totalDiscount += Number(sale.discount) || 0;
            totalProfit += Number(sale.sale_profit) || 0;

            sale.products?.forEach((product: Product) => {
                const qty = Number(product.quantity) || 0;
                totalCost += (Number(product.buying_price) || 0) * qty;
                totalProductsSold += qty;
                uniqueProductIds.add(product.id);
            });
        });

        return {
            totalRevenue,
            totalCost,
            totalProfit,
            totalDiscount,
            totalProductsSold,
            totalTransactions: salesData.rows.length,
            uniqueProducts: uniqueProductIds.size,
        };
    }, [salesData]);

    const getBuyerName = (buyer: any): string => {
        if (!buyer) return 'N/A';
        if (typeof buyer === 'string') return buyer;
        if (typeof buyer === 'object' && buyer.name) return buyer.name;
        return 'N/A';
    };

    const getMeasurementDisplay = (product: Product): string => {
        if (product.measurement) {
            const unit = isSwahili ? product.measurement.swahili : product.measurement.english;
            const short = product.measurement.short_form;
            return short || unit || '';
        }
        return '';
    };

    const getPeriodText = useMemo(() => {
        if (filters.duration === 'custom' && filters.start && filters.end) {
            return `${formatDate(new Date(filters.start), 'dd MMM yyyy')} → ${formatDate(new Date(filters.end), 'dd MMM yyyy')}`;
        }
        const filter = TIME_FILTERS.find(f => f.value === filters.duration);
        return filter ? (isSwahili ? filter.swahili : filter.english) : filters.duration;
    }, [filters.duration, filters.start, filters.end, isSwahili]);

    const getSellerName = useMemo(() => {
        if (!filters.seller_id) return isSwahili ? 'Wauzaji Wote' : 'All Sellers';
        const attendant = attendData?.data?.find((a: Attendant) => a.id === Number(filters.seller_id));
        return attendant?.name || 'N/A';
    }, [filters.seller_id, attendData, isSwahili]);

    const getPaymentFilterLabel = useMemo(() => {
        const filter = PAYMENT_FILTERS.find(f => f.value === filters.payment_filter);
        return filter ? (isSwahili ? filter.swahili : filter.english) : 'All';
    }, [filters.payment_filter, isSwahili]);

    const handleDurationChange = (value: string) => {
        setFilters(prev => ({
            ...prev,
            duration: value,
            page: 1,
            start: value === 'custom' ? prev.start : '',
            end: value === 'custom' ? prev.end : '',
        }));
    };

    const handleSellerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({
            ...prev,
            seller_id: e.target.value,
            page: 1,
        }));
    };

    const handlePaymentFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({...filters,payment_filter: e.target.value})
        // setFilters(prev => ({
        //     ...prev,
        //     payment_filter: e.target.value,
        //     page: 1,
        // }));
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({
            ...prev,
            pageSize: Number(e.target.value),
            page: 1,
        }));
    };

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyCustomRange = () => {
        if (filters.start && filters.end) {
            setFilters(prev => ({ ...prev, page: 1 }));
        }
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const exportAsExcel = () => {
        if (!salesData) return;

        const headers = isSwahili 
            ? ['Namba', 'Namba ya Agizo', 'Mnunuzi', 'Bidhaa', 'Jumla ya Kiasi', 'Punguzo', 'Mbinu ya Malipo', 'Tarehe']
            : ['S/N', 'Order No', 'Buyer', 'Products', 'Total Qty', 'Total Amount', 'Discount', 'Payment Method', 'Date'];

        const rows = salesData.rows.map((sale: any, i: number) => {
            const productDetails = sale.products.map((p: Product) => 
                `${p.name} (${p.quantity} × ${formatNumber(p.selling_price)})`
            ).join('; ');

            return [
                i + 1,
                sale.order_no,
                getBuyerName(sale.buyer),
                productDetails,
                sale.products.reduce((sum: number, p: Product) => sum + p.quantity, 0),
                formatNumber(sale.total_price),
                formatNumber(sale.discount),
                sale.payment_method || 'N/A',
                formatDateTime(sale.createdAt),
            ];
        });

        const address = [selected?.street, selected?.ward, selected?.district, selected?.city]
            .filter(Boolean).join(', ') || 'N/A';

        const csvContent = [
            [isSwahili ? 'RIPOTI YA MAUZO' : 'SALES REPORT'],
            [isSwahili ? 'Biashara' : 'Business', selected?.name || 'N/A'],
            [isSwahili ? 'Anwani' : 'Address', address],
            [isSwahili ? 'Simu' : 'Phone', selected?.phone || 'N/A'],
            [isSwahili ? 'Kipindi' : 'Period', getPeriodText],
            [isSwahili ? 'Muuzaji' : 'Seller', getSellerName],
            [isSwahili ? 'Hali ya Malipo' : 'Payment Status', getPaymentFilterLabel],
            [isSwahili ? 'Imetolewa' : 'Generated', formatDateTime(new Date())],
            [],
            [isSwahili ? 'MUHTASARI' : 'SUMMARY'],
            [isSwahili ? 'Mapato Jumla' : 'Total Revenue', formatNumber(summary.totalRevenue)],
            [isSwahili ? 'Gharama Jumla' : 'Total Cost', formatNumber(summary.totalCost)],
            [isSwahili ? 'Faida Jumla' : 'Total Profit', formatNumber(summary.totalProfit)],
            [isSwahili ? 'Punguzo Jumla' : 'Total Discount', formatNumber(summary.totalDiscount)],
            [isSwahili ? 'Bidhaa Zilizouzwa' : 'Products Sold', summary.totalProductsSold],
            [isSwahili ? 'Bidhaa za Kipekee' : 'Unique Products', summary.uniqueProducts],
            [isSwahili ? 'Miamala' : 'Transactions', summary.totalTransactions],
            [],
            headers.join(','),
            ...rows.map((row: any) => row.join(',')),
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sales_report_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportAsPDF = () => {
    if (!salesData) return;

    // Create a temporary container
    const printContainer = document.createElement('div');
    printContainer.style.position = 'fixed';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '100%';
    printContainer.style.background = 'white';
    printContainer.style.zIndex = '9999';
    document.body.appendChild(printContainer);

    const address = [selected?.street, selected?.ward, selected?.district, selected?.city]
        .filter(Boolean).join(', ') || 'N/A';

    const tableHeaders = isSwahili
        ? ['#', 'Namba Agizo', 'Mnunuzi', 'Bidhaa', 'Kiasi', 'Jumla', 'Punguzo', 'Malipo', 'Tarehe']
        : ['#', 'Order No', 'Buyer', 'Products', 'Qty', 'Total', 'Discount', 'Payment', 'Date'];

    const tableRows = salesData.rows.map((sale: any, i: number) => `
        <tr>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; text-align: center; font-weight: 500; font-size: 10px;">${i + 1}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; font-family: monospace; color: #4a5a72; font-size: 10px;">${sale.order_no}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; font-size: 10px;">${getBuyerName(sale.buyer)}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; font-size: 10px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                    ${sale.products.map((p: Product) => `
                        <tr>
                            <td style="padding: 2px 4px; border-bottom: 1px solid #f0f4fa; font-weight: 500;">${p.name}</td>
                            <td style="padding: 2px 4px; border-bottom: 1px solid #f0f4fa; text-align: center;">${p.quantity}</td>
                            <td style="padding: 2px 4px; border-bottom: 1px solid #f0f4fa; text-align: right;">${formatNumber(p.selling_price)}</td>
                            <td style="padding: 2px 4px; border-bottom: 1px solid #f0f4fa; text-align: right; font-weight: 500;">${formatNumber(p.selling_price * p.quantity)}</td>
                        </tr>
                    `).join('')}
                </table>
            </td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; text-align: center; font-weight: 600; font-size: 10px;">${sale.products.reduce((sum: number, p: Product) => sum + p.quantity, 0)}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; text-align: right; font-weight: 700; color: #28a745; font-size: 10px;">${formatNumber(sale.total_price)}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; text-align: right; font-size: 10px;">${formatNumber(sale.discount)}</td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; font-size: 10px;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${sale.payment_method?.toLowerCase() === 'loan' ? '#fff3e0' : '#e8f5e9'}; color: ${sale.payment_method?.toLowerCase() === 'loan' ? '#e65100' : '#2e7d32'}; font-size: 9px; font-weight: 600;">${sale.payment_method || 'N/A'}</span>
            </td>
            <td style="padding: 6px 8px; border-bottom: 1px solid #e8edf5; font-size: 9px; color: #6b7a8f; white-space: nowrap;">${formatDateTime(sale.createdAt)}</td>
        </tr>
    `).join('');

    printContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${isSwahili ? 'Ripoti ya Mauzo' : 'Sales Report'} - ${selected?.name}</title>
                <style>
                    * { 
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box; 
                    }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        padding: 20px; 
                        color: #1a2332; 
                        line-height: 1.5; 
                        background: white; 
                        max-width: 100%;
                        overflow: hidden;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 10px;
                    }
                    .header { 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 25px 30px;
                        border-radius: 12px;
                        margin-bottom: 20px;
                        color: white;
                        page-break-inside: avoid;
                    }
                    .logo { 
                        font-size: 24px; 
                        font-weight: 700; 
                        letter-spacing: -0.5px; 
                        margin-bottom: 5px; 
                    }
                    .shop { 
                        font-size: 16px; 
                        font-weight: 500; 
                        margin: 3px 0; 
                        opacity: 0.95; 
                    }
                    .info { 
                        font-size: 12px; 
                        opacity: 0.9; 
                        margin: 2px 0; 
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 10px;
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 1px solid rgba(255,255,255,0.2);
                    }
                    .info-item { 
                        font-size: 11px; 
                    }
                    .info-item strong { 
                        font-weight: 600; 
                    }
                    .summary { 
                        background: #f8f9ff; 
                        padding: 15px 20px; 
                        border-radius: 12px; 
                        margin: 15px 0 20px; 
                        border: 1px solid #e8edf5;
                        page-break-inside: avoid;
                    }
                    .summary-title {
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 12px;
                        color: #1a2332;
                        text-align: center;
                    }
                    .summary-grid { 
                        display: grid; 
                        grid-template-columns: repeat(4, 1fr); 
                        gap: 10px; 
                    }
                    .summary-card { 
                        background: white; 
                        padding: 10px 12px; 
                        border-radius: 8px; 
                        text-align: center; 
                        box-shadow: 0 2px 4px rgba(0,0,0,0.04);
                        border: 1px solid #eef0ff;
                    }
                    .summary-label { 
                        font-size: 9px; 
                        color: #6b7a8f; 
                        font-weight: 600; 
                        text-transform: uppercase; 
                        letter-spacing: 0.5px; 
                    }
                    .summary-value { 
                        font-size: 16px; 
                        font-weight: 700; 
                        color: #1a2332; 
                        margin-top: 2px; 
                    }
                    .profit { color: #28a745; }
                    .table-container {
                        overflow: hidden;
                        border-radius: 12px;
                        border: 1px solid #e8edf5;
                        page-break-inside: auto;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        font-size: 10px;
                        table-layout: fixed;
                    }
                    thead {
                        background: #f0f4fa;
                    }
                    th { 
                        padding: 8px 8px; 
                        text-align: left; 
                        font-weight: 600;
                        font-size: 9px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                        color: #4a5a72;
                        border-bottom: 2px solid #dce2ec;
                    }
                    th:nth-child(1) { width: 4%; }
                    th:nth-child(2) { width: 10%; }
                    th:nth-child(3) { width: 10%; }
                    th:nth-child(4) { width: 28%; }
                    th:nth-child(5) { width: 8%; }
                    th:nth-child(6) { width: 12%; }
                    th:nth-child(7) { width: 10%; }
                    th:nth-child(8) { width: 10%; }
                    th:nth-child(9) { width: 8%; }
                    td { 
                        padding: 6px 8px; 
                        border-bottom: 1px solid #e8edf5; 
                        vertical-align: top;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                    tr:hover { background: #f8faff; }
                    .product-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .product-table td {
                        padding: 2px 4px;
                        border-bottom: 1px solid #f0f4fa;
                        font-size: 9px;
                    }
                    .product-table tr:last-child td {
                        border-bottom: none;
                    }
                    .product-table td:first-child { width: 40%; }
                    .product-table td:nth-child(2) { width: 20%; text-align: center; }
                    .product-table td:nth-child(3) { width: 20%; text-align: right; }
                    .product-table td:nth-child(4) { width: 20%; text-align: right; font-weight: 500; }
                    .footer { 
                        margin-top: 20px; 
                        text-align: center; 
                        color: #6b7a8f; 
                        font-size: 10px; 
                        padding-top: 15px;
                        border-top: 1px solid #e8edf5;
                        page-break-inside: avoid;
                    }
                    
                    @media print {
                        body { 
                            padding: 10px; 
                            margin: 0;
                        }
                        .container {
                            max-width: 100%;
                            padding: 5px;
                        }
                        .header { 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                        }
                        thead { 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                        }
                        .summary-card { 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                        }
                        .summary-grid { 
                            grid-template-columns: repeat(4, 1fr); 
                        }
                        .table-container {
                            overflow: visible;
                        }
                        table {
                            page-break-inside: auto;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                        tbody {
                            display: table-row-group;
                        }
                        .info-grid {
                            grid-template-columns: 1fr 1fr 1fr;
                        }
                    }

                    @page {
                        size: A4;
                        margin: 10mm 8mm;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">${isSwahili ? '📊 Ripoti ya Mauzo' : '📊 Sales Report'}</div>
                        <div class="shop">${selected?.name || 'Business Name'}</div>
                        <div class="info">${address}</div>
                        <div class="info">${isSwahili ? '📞 Simu' : '📞 Phone'}: ${selected?.phone || 'N/A'}</div>
                        <div class="info-grid">
                            <div class="info-item"><strong>${isSwahili ? 'Kipindi' : 'Period'}:</strong> ${getPeriodText}</div>
                            <div class="info-item"><strong>${isSwahili ? 'Muuzaji' : 'Seller'}:</strong> ${getSellerName}</div>
                            <div class="info-item"><strong>${isSwahili ? 'Hali ya Malipo' : 'Payment Status'}:</strong> ${getPaymentFilterLabel}</div>
                        </div>
                    </div>

                    <div class="summary">
                        <div class="summary-title">${isSwahili ? '📈 Muhtasari wa Fedha' : '📈 Financial Summary'}</div>
                        <div class="summary-grid">
                            <div class="summary-card">
                                <div class="summary-label">${isSwahili ? 'Mapato' : 'Revenue'}</div>
                                <div class="summary-value">${formatNumber(summary.totalRevenue)}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">${isSwahili ? 'Gharama' : 'Cost'}</div>
                                <div class="summary-value">${formatNumber(summary.totalCost)}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">${isSwahili ? 'Faida' : 'Profit'}</div>
                                <div class="summary-value profit">${formatNumber(summary.totalProfit)}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">${isSwahili ? 'Punguzo' : 'Discount'}</div>
                                <div class="summary-value">${formatNumber(summary.totalDiscount)}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">${isSwahili ? 'Bidhaa Zilizouzwa' : 'Products Sold'}</div>
                                <div class="summary-value">${summary.totalProductsSold}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">${isSwahili ? 'Bidhaa za Kipekee' : 'Unique Products'}</div>
                                <div class="summary-value">${summary.uniqueProducts}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">${isSwahili ? 'Miamala' : 'Transactions'}</div>
                                <div class="summary-value">${summary.totalTransactions}</div>
                            </div>
                        </div>
                    </div>

                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    ${tableHeaders.map(h => `<th>${h}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>

                    <div class="footer">
                        ${isSwahili ? '📋 Ripoti imetolewa na Bazenga • Asante kwa Kutuamini' : '📋 Report generated by Bazenga • Thank you for Trusting Us'}
                        <br>
                        <span style="font-size: 9px; color: #a0aec0;">${formatDateTime(new Date())}</span>
                    </div>
                </div>
            </body>
        </html>
    `;

    // Trigger print and cleanup
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (printWindow) {
        printWindow.document.write(printContainer.innerHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            // Clean up after print
            setTimeout(() => {
                printWindow.close();
                if (document.body.contains(printContainer)) {
                    document.body.removeChild(printContainer);
                }
            }, 1000);
        }, 500);
    } else {
        // Fallback: print the container directly
        const originalTitle = document.title;
        document.title = `${isSwahili ? 'Ripoti ya Mauzo' : 'Sales Report'} - ${selected?.name}`;
        printContainer.style.position = 'relative';
        printContainer.style.left = '0';
        printContainer.style.top = '0';
        printContainer.style.padding = '10px';
        printContainer.style.maxWidth = '1200px';
        printContainer.style.margin = '0 auto';
        document.body.innerHTML = '';
        document.body.appendChild(printContainer);
        
        setTimeout(() => {
            window.print();
            // Restore after print
            setTimeout(() => {
                if (document.body.contains(printContainer)) {
                    document.body.removeChild(printContainer);
                }
                document.title = originalTitle;
            }, 1000);
        }, 500);
    }
};

    if (salesLoading || attendLoading) {
        return (
            <div className={styles.salesReport}>
                <div className={styles.loader}>
                    <div className={styles.spinner}></div>
                    <p>{isSwahili ? "Inaandaa ripoti..." : "Generating report..."}</p>
                </div>
            </div>
        );
    }

    if (salesError) {
        return (
            <div className={styles.salesReport}>
                <div className={styles.error}>
                    <p>⚠️ {isSwahili ? "Imeshindwa kupakia ripoti" : "Failed to load report"}</p>
                    <p className={styles.errorDetail}>{String(salesError)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.salesReport}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isSwahili ? '📊 Ripoti ya Mauzo' : '📊 Sales Report'}</h1>
                    <p className={styles.subtitle}>{isSwahili ? 'Muhtasari kamili wa fedha' : 'Complete financial performance overview'}</p>
                </div>
                <div className={styles.exportButtons}>
                    <button onClick={exportAsExcel} className={styles.excelBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="M9 15h6M9 12h6M9 18h3" />
                        </svg>
                        {isSwahili ? 'Hamisha Excel' : 'Export Excel'}
                    </button>
                    <button onClick={exportAsPDF} className={styles.pdfBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        {isSwahili ? 'Hamisha PDF' : 'Export PDF'}
                    </button>
                </div>
            </div>

            <div className={styles.filtersCard}>
                <div className={styles.filterChips}>
                    {TIME_FILTERS.map(filter => (
                        <button
                            key={filter.value}
                            className={`${styles.chip} ${filters.duration === filter.value ? styles.chipActive : ''}`}
                            onClick={() => handleDurationChange(filter.value)}
                        >
                            {isSwahili ? filter.swahili : filter.english}
                        </button>
                    ))}
                </div>

                {filters.duration === 'custom' && (
                    <div className={styles.dateRangePicker}>
                        <div className={styles.dateField}>
                            <label>{isSwahili ? "Tarehe ya Mwanzo" : "Start Date"}</label>
                            <input 
                                type="date" 
                                value={filters.start} 
                                onChange={e => handleDateChange('start', e.target.value)} 
                            />
                        </div>
                        <div className={styles.dateField}>
                            <label>{isSwahili ? "Tarehe ya Mwisho" : "End Date"}</label>
                            <input 
                                type="date" 
                                value={filters.end} 
                                onChange={e => handleDateChange('end', e.target.value)} 
                            />
                        </div>
                        <button
                            onClick={handleApplyCustomRange}
                            className={styles.applyBtn}
                            disabled={!filters.start || !filters.end}
                        >
                            {isSwahili ? "Thibitisha" : "Apply Range"}
                        </button>
                    </div>
                )}

                <div className={styles.selectGroup}>
                    <div className={styles.selectWrapper}>
                        <label className={styles.selectLabel}>
                            {isSwahili ? "Muuzaji" : "Seller"}
                        </label>
                        <select 
                            value={filters.seller_id} 
                            onChange={handleSellerChange} 
                            className={styles.select}
                        >
                            <option value="">{isSwahili ? "Wauzaji Wote" : "All Sellers"}</option>
                            {attendData?.data?.map((item: Attendant) => (
                                <option value={item.id} key={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <label className={styles.selectLabel}>
                            {isSwahili ? "Hali ya Malipo" : "Payment Status"}
                        </label>
                        <select 
                            value={filters.payment_filter} 
                            onChange={handlePaymentFilterChange} 
                            //onChange={()=> setFilters({...filters,payment_filter: e.target.value})} 
                            className={styles.select}
                        >
                            {PAYMENT_FILTERS.map(filter => (
                                <option key={filter.value} value={filter.value}>
                                    {isSwahili ? filter.swahili : filter.english}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <label className={styles.selectLabel}>
                            {isSwahili ? "Safu kwa Ukurasa" : "Rows per Page"}
                        </label>
                        <select 
                            value={filters.pageSize} 
                            onChange={handlePageSizeChange} 
                            className={styles.select}
                        >
                            {ROWS_PER_PAGE.map(size => (
                                <option key={size} value={size}>
                                    {size === -1 ? (isSwahili ? "Zote" : "All") : `${size}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.reportInfo}>
                    <span className={styles.infoBadge}>
                        📊 {salesData?.count || 0} {isSwahili ? "mauzo" : "sales"}
                    </span>
                    <span className={styles.infoBadge}>📅 {getPeriodText}</span>
                    <span className={styles.infoBadge}>👤 {getSellerName}</span>
                    <span className={styles.infoBadge}>
                        💳 {getPaymentFilterLabel}
                    </span>
                    <span className={styles.infoBadge}>
                        🔢 {summary.uniqueProducts} {isSwahili ? 'bidhaa za kipekee' : 'unique products'}
                    </span>
                </div>
            </div>

            {!salesData || salesData.rows.length === 0 ? (
                <div className={styles.empty}>
                    <p>📭 {isSwahili ? "Hakuna mauzo yaliyopatikana" : "No sales found"}</p>
                    <p className={styles.emptySub}>
                        {isSwahili ? "Jaribu kubadilisha vichujio" : "Try changing the filters"}
                    </p>
                </div>
            ) : (
                <div className={styles.reportCard}>
                    <div className={styles.summarySection}>
                        <div className={styles.shopInfo}>
                            <h3>{selected?.name || 'N/A'}</h3>
                            <p className={styles.address}>
                                {[selected?.street, selected?.ward, selected?.district, selected?.city]
                                    .filter(Boolean).join(', ')}
                            </p>
                            <p>{isSwahili ? 'Simu' : 'Phone'}: {selected?.phone || 'N/A'}</p>
                            <div className={styles.reportMeta}>
                                <span>{isSwahili ? 'Kipindi' : 'Period'}: {getPeriodText}</span>
                                <span>{isSwahili ? 'Muuzaji' : 'Seller'}: {getSellerName}</span>
                                <span>{isSwahili ? 'Hali ya Malipo' : 'Payment'}: {getPaymentFilterLabel}</span>
                            </div>
                        </div>

                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <span className={styles.icon}>💰</span>
                                <div>
                                    <p>{isSwahili ? 'Mapato Jumla' : 'Total Revenue'}</p>
                                    <strong>{formatNumber(summary.totalRevenue)}</strong>
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.icon}>📦</span>
                                <div>
                                    <p>{isSwahili ? 'Gharama Jumla' : 'Total Cost'}</p>
                                    <strong>{formatNumber(summary.totalCost)}</strong>
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={`${styles.icon} ${styles.profitIcon}`}>📈</span>
                                <div>
                                    <p>{isSwahili ? 'Faida Jumla' : 'Net Profit'}</p>
                                    <strong className={styles.profit}>{formatNumber(summary.totalProfit)}</strong>
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.icon}>🏷️</span>
                                <div>
                                    <p>{isSwahili ? 'Punguzo Jumla' : 'Total Discount'}</p>
                                    <strong>{formatNumber(summary.totalDiscount)}</strong>
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.icon}>📦</span>
                                <div>
                                    <p>{isSwahili ? 'Bidhaa Zilizouzwa' : 'Products Sold'}</p>
                                    <strong>{summary.totalProductsSold}</strong>
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.icon}>🔢</span>
                                <div>
                                    <p>{isSwahili ? 'Bidhaa za Kipekee' : 'Unique Products'}</p>
                                    <strong>{summary.uniqueProducts}</strong>
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <span className={styles.icon}>📋</span>
                                <div>
                                    <p>{isSwahili ? 'Miamala' : 'Transactions'}</p>
                                    <strong>{summary.totalTransactions}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{isSwahili ? 'Namba ya Agizo' : 'Order No'}</th>
                                    <th>{isSwahili ? 'Mnunuzi' : 'Buyer'}</th>
                                    <th>{isSwahili ? 'Bidhaa' : 'Products'}</th>
                                    <th>{isSwahili ? 'Jumla' : 'Total Qty'}</th>
                                    <th>{isSwahili ? 'Kiasi' : 'Total Amount'}</th>
                                    <th>{isSwahili ? 'Punguzo' : 'Discount'}</th>
                                    <th>{isSwahili ? 'Njia ya Malipo' : 'Payment'}</th>
                                    <th>{isSwahili ? 'Tarehe' : 'Date'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.rows.map((sale: Sale, index: number) => (
                                    <tr key={sale.id}>
                                        <td className={styles.rowNumber}>{index + 1}</td>
                                        <td className={styles.orderNo}>{sale.order_no}</td>
                                        <td>{getBuyerName(sale.buyer)}</td>
                                        <td>
                                            <table className={styles.productTable}>
                                                <thead>
                                                    <tr>
                                                        <th>{isSwahili ? 'Bidhaa' : 'Product'}</th>
                                                        <th>{isSwahili ? 'Kiasi' : 'Qty'}</th>
                                                        <th>{isSwahili ? 'Bei' : 'Price'}</th>
                                                        <th>{isSwahili ? 'Jumla' : 'Total'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sale.products.map((product: Product, idx: number) => (
                                                        <tr key={idx}>
                                                            <td className={styles.productName}>
                                                                {product.name}
                                                                {product.measurement && (
                                                                    <span className={styles.measurement}>
                                                                        ({getMeasurementDisplay(product)})
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className={styles.productQty}>{product.quantity}</td>
                                                            <td className={styles.productPrice}>{formatNumber(product.selling_price)}</td>
                                                            <td className={styles.productTotal}>{formatNumber(product.selling_price * product.quantity)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </td>
                                        <td className={styles.totalQty}>
                                            {sale.products.reduce((sum: number, p: Product) => sum + p.quantity, 0)}
                                        </td>
                                        <td className={styles.totalAmount}>{formatNumber(sale.total_price)}</td>
                                        <td className={styles.discount}>{formatNumber(sale.discount)}</td>
                                        <td>
                                            <span className={`${styles.paymentBadge} ${sale.paid !== true ? styles.paymentLoan : styles.paymentCash}`}>
                                                {sale.paid===true?language==="Swahili"?"Taslimu":"Paid":language==="Swahili"?"Mkopo":"Loan"}
                                            </span>
                                        </td>
                                        <td className={styles.dateCell}>{formatDateTime(sale.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {salesData.totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button 
                                    onClick={() => handlePageChange(Math.max(filters.page - 1, 1))}
                                    disabled={filters.page === 1}
                                    className={styles.pageBtn}
                                >
                                    ← {isSwahili ? "Iliyopita" : "Previous"}
                                </button>
                                <span className={styles.pageInfo}>
                                    {isSwahili ? "Ukurasa" : "Page"} {filters.page} {isSwahili ? "ya" : "of"} {salesData.totalPages}
                                </span>
                                <button 
                                    onClick={() => handlePageChange(Math.min(filters.page + 1, salesData.totalPages))}
                                    disabled={filters.page === salesData.totalPages}
                                    className={styles.pageBtn}
                                >
                                    {isSwahili ? "Ijayo" : "Next"} →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}