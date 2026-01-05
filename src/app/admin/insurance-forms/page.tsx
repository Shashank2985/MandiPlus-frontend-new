'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/features/admin/context/AdminContext';
import { formatDate, formatCurrency } from '@/features/admin/utils/format';
import { adminApi, InvoiceFilterParams } from '@/features/admin/api/admin.api';

// --- Debounce Hook ---
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    supplierName: string;
    supplierAddress: string[];
    billToName: string;
    productName: string[];
    quantity: number;
    amount: number;
    pdfUrl?: string;
    pdfURL?: string;
    createdAt: string;
}

export default function InsuranceFormsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAdmin();

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState<InvoiceFilterParams>({
        invoiceType: '',
        startDate: '',
        endDate: '',
        supplierName: '',
        buyerName: ''
    });

    const debouncedFilters = useDebounce(filters, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const activeFilters = Object.fromEntries(
                Object.entries(debouncedFilters).filter(([_, v]) => v !== '')
            );

            // Logic Updated: Use the full datetime string provided by datetime-local input
            if (activeFilters.startDate) {
                activeFilters.startDate = new Date(activeFilters.startDate as string).toISOString();
            }
            if (activeFilters.endDate) {
                // If user selected a specific time, use it. 
                // Note: If you still want to default to end-of-minute/hour when seconds aren't picked, 
                // standard ISO conversion is usually sufficient for datetime-local
                activeFilters.endDate = new Date(activeFilters.endDate as string).toISOString();
            }

            console.log("Fetching with filters:", activeFilters);
            const response = await adminApi.filterInvoices(activeFilters);

            let data: Invoice[] = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.success && Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response)) {
                data = response as any;
            }

            const sortedData = data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setInvoices(sortedData);

        } catch (err: any) {
            console.error("Fetch error:", err);
            setError('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    }, [debouncedFilters]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/admin/login');
            return;
        }
        fetchInvoices();
    }, [isAuthenticated, router, fetchInvoices]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const body = {
                invoiceType: filters.invoiceType || undefined,
                startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
                endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
            };

            const blob = await adminApi.exportInvoices(body);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export invoices");
        } finally {
            setExporting(false);
        }
    };

    const handleViewPdf = (url: string | undefined) => {
        if (!url) return;
        const fullUrl = url.startsWith('http')
            ? url
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${url}`;
        window.open(fullUrl, '_blank');
    };

    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = invoices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Invoices / Insurance Forms
                    </h1>
                    <button
                        onClick={handleExport}
                        disabled={exporting || loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50 transition-colors"
                    >
                        {exporting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </>
                        ) : 'Export to Excel'}
                    </button>
                </div>

                {/* Filter Section */}
                <div className="bg-white text-black p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select
                        name="invoiceType"
                        value={filters.invoiceType}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">All Types</option>
                        <option value="SUPPLIER_INVOICE">Supplier Invoice</option>
                        <option value="BUYER_INVOICE">Buyer Invoice</option>
                    </select>

                    {/* Updated to datetime-local */}
                    <input
                        type="datetime-local"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="Start Date & Time"
                    />

                    {/* Updated to datetime-local */}
                    <input
                        type="datetime-local"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="End Date & Time"
                    />

                    <input
                        type="text"
                        name="supplierName"
                        placeholder="Search Supplier..."
                        value={filters.supplierName}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    />

                    <input
                        type="text"
                        name="buyerName"
                        placeholder="Search Buyer..."
                        value={filters.buyerName}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-md">
                        <p>{error}</p>
                    </div>
                )}

                {/* Table Section */}
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                    {loading && invoices.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                            {loading ? 'Loading...' : 'No invoices found matching criteria.'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-4 text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">{formatDate(inv.invoiceDate)}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">{inv.supplierName}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">{inv.billToName}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">{inv.quantity}</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">{formatCurrency(inv.amount)}</td>
                                            <td className="px-3 py-4 text-center">
                                                {(inv.pdfUrl || inv.pdfURL) ? (
                                                    <button
                                                        onClick={() => handleViewPdf(inv.pdfUrl || inv.pdfURL)}
                                                        className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-50"
                                                        title="View PDF"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300 text-xs uppercase font-medium">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}