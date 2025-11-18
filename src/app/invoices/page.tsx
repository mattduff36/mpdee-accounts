'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Toast from '@/components/Toast';
import InvoiceDetailsModal from '@/components/InvoiceDetailsModal';
import { InvoiceWithClient, PaginatedResponse, InvoiceStatus } from '@/lib/types';
import { 
  PencilIcon, 
  PaperAirplaneIcon, 
  ArrowDownTrayIcon, 
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ClientAvatar } from '@/lib/client-avatar';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<InvoiceStatus>>(new Set());
  const [page, setPage] = useState(1);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // Load filters from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('invoiceStatusFilters');
      if (savedFilters) {
        try {
          const filterArray = JSON.parse(savedFilters);
          setStatusFilters(new Set(filterArray));
        } catch (error) {
          console.error('Error loading saved filters:', error);
        }
      }
      setFiltersLoaded(true);
    }
  }, []);

  // Save filters to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && filtersLoaded) {
      localStorage.setItem('invoiceStatusFilters', JSON.stringify(Array.from(statusFilters)));
    }
  }, [statusFilters, filtersLoaded]);
  const [total, setTotal] = useState(0);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const router = useRouter();

  const limit = 10;

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      // Add multiple status filters
      statusFilters.forEach(status => {
        params.append('status', status);
      });

      const response = await fetch(`/api/invoices?${params}`);
      const data: PaginatedResponse<InvoiceWithClient> = await response.json();

      if (response.ok && data.success) {
        setInvoices(data.data);
        setTotal(data.total);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, search, statusFilters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const toggleStatusFilter = (status: InvoiceStatus) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setStatusFilters(newFilters);
    setPage(1); // Reset to first page when filtering
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as paid?')) return;
    
    setUpdatingStatusId(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: InvoiceStatus.PAID }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setToast({ message: 'Invoice marked as paid!', type: 'success' });
        // Refresh the invoices list
        fetchInvoices();
      } else {
        setToast({ message: data.error || 'Failed to update invoice status', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setToast({ message: 'Failed to update invoice status', type: 'error' });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Invoice deleted successfully!', type: 'success' });
        setDeleteInvoiceId(null);
        fetchInvoices(); // Refresh the list
      } else {
        setToast({ message: data.error || 'Failed to delete invoice', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      [InvoiceStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      [InvoiceStatus.SENT]: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      [InvoiceStatus.PAID]: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      [InvoiceStatus.OVERDUE]: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Navigation />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
      
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Invoices
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                                        onClick={() => router.push('/invoices/new')}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Invoice
              </button>
            </div>
          </div>

          <div className="mt-8">
            {/* Filters */}
            <div className="mb-6">
              {/* Desktop Layout: Search and Buttons on same line */}
              <div className="hidden lg:flex lg:items-end lg:gap-6">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={search}
                    onChange={handleSearch}
                  />
                </div>
                
                {/* Status Filter Buttons */}
                <div className="flex-shrink-0">
                  <div className="flex gap-2">
                    {Object.values(InvoiceStatus).map((status) => {
                      const isActive = statusFilters.has(status);
                      const statusColors = {
                        [InvoiceStatus.DRAFT]: {
                          active: 'bg-gray-600 text-white border-gray-600',
                          inactive: 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        },
                        [InvoiceStatus.SENT]: {
                          active: 'bg-blue-600 text-white border-blue-600',
                          inactive: 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                        },
                        [InvoiceStatus.PAID]: {
                          active: 'bg-green-600 text-white border-green-600',
                          inactive: 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                        },
                        [InvoiceStatus.OVERDUE]: {
                          active: 'bg-red-600 text-white border-red-600',
                          inactive: 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                        }
                      };
                      
                      return (
                        <button
                          key={status}
                          onClick={() => toggleStatusFilter(status)}
                          className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            isActive ? statusColors[status].active : statusColors[status].inactive
                          }`}
                        >
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Layout: Stacked */}
              <div className="lg:hidden space-y-4">
                {/* Search */}
                <div>
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={search}
                    onChange={handleSearch}
                  />
                </div>
                
                {/* Status Filter Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(InvoiceStatus).map((status) => {
                      const isActive = statusFilters.has(status);
                      const statusColors = {
                        [InvoiceStatus.DRAFT]: {
                          active: 'bg-gray-600 text-white border-gray-600',
                          inactive: 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        },
                        [InvoiceStatus.SENT]: {
                          active: 'bg-blue-600 text-white border-blue-600',
                          inactive: 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                        },
                        [InvoiceStatus.PAID]: {
                          active: 'bg-green-600 text-white border-green-600',
                          inactive: 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                        },
                        [InvoiceStatus.OVERDUE]: {
                          active: 'bg-red-600 text-white border-red-600',
                          inactive: 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                        }
                      };
                      
                      return (
                        <button
                          key={status}
                          onClick={() => toggleStatusFilter(status)}
                          className={`px-4 py-3 text-sm font-medium border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-center ${
                            isActive ? statusColors[status].active : statusColors[status].inactive
                          }`}
                        >
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Clear all filters button (both layouts) */}
              {statusFilters.size > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setStatusFilters(new Set())}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Invoices Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading invoices...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    {search || statusFilters.size > 0 ? 'No invoices found matching your criteria.' : 'No invoices yet. Create your first invoice!'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <li key={invoice.id}>
                      <div className="px-4 py-4">
                        {/* Desktop layout - horizontal */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div 
                            className="flex items-center flex-1 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg transition-colors"
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                          >
                            <ClientAvatar client={invoice.client} />
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900">
                                  {invoice.invoice_number}
                                </p>
                                <div className="ml-2">
                                  {getStatusBadge(invoice.status)}
                                </div>
                              </div>
                              <div className="flex items-center mt-1">
                                <p className="text-sm text-gray-500">
                                  {invoice.client.name}
                                </p>
                                <span className="mx-2 text-gray-300">•</span>
                                <p className="text-sm text-gray-500">
                                  {formatCurrency(invoice.total_amount)}
                                </p>
                              </div>
                              <div className="flex items-center mt-1 text-xs text-gray-400">
                                <span>Created {formatDate(invoice.created_at.toString())}</span>
                                {invoice.due_date && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>Due {formatDate(invoice.due_date.toString())}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50 transition-colors"
                              title={invoice.status === InvoiceStatus.DRAFT ? 'Edit Invoice' : 'View Invoice'}
                            >
                              <PencilIcon className="h-6 w-6" />
                            </button>
                            {invoice.status === InvoiceStatus.DRAFT && (
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/invoices/${invoice.id}/send`, {
                                      method: 'POST',
                                    });
                                    if (response.ok) {
                                      setToast({ message: 'Invoice sent successfully!', type: 'success' });
                                      fetchInvoices(); // Refresh list
                                    } else {
                                      setToast({ message: 'Failed to send invoice', type: 'error' });
                                    }
                                  } catch (error) {
                                    setToast({ message: 'Failed to send invoice', type: 'error' });
                                  }
                                }}
                                className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors"
                                title="Send Invoice"
                              >
                                <PaperAirplaneIcon className="h-6 w-6" />
                              </button>
                            )}
                            {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
                              <>
                                <button
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                  disabled={updatingStatusId === invoice.id}
                                  className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Mark as Paid"
                                >
                                  {updatingStatusId === invoice.id ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                  ) : (
                                    <CheckCircleIcon className="h-6 w-6" />
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
                                        method: 'POST',
                                      });
                                      if (response.ok) {
                                        setToast({ message: 'Invoice resent successfully!', type: 'success' });
                                        fetchInvoices(); // Refresh list
                                      } else {
                                        setToast({ message: 'Failed to resend invoice', type: 'error' });
                                      }
                                    } catch (error) {
                                      setToast({ message: 'Failed to resend invoice', type: 'error' });
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                                  title="Resend Invoice"
                                >
                                  <PaperAirplaneIcon className="h-6 w-6" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                              title="Download PDF"
                            >
                              <ArrowDownTrayIcon className="h-6 w-6" />
                            </button>
                            {invoice.status === InvoiceStatus.DRAFT && (
                              <button
                                onClick={() => setDeleteInvoiceId(invoice.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                                title="Delete Invoice"
                              >
                                <TrashIcon className="h-6 w-6" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mobile layout - stacked */}
                        <div className="sm:hidden space-y-3">
                          <div 
                            className="cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg transition-colors"
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                          >
                            <div className="flex items-center">
                              <ClientAvatar client={invoice.client} />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">
                                    {invoice.invoice_number}
                                  </p>
                                  {getStatusBadge(invoice.status)}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {invoice.client.name}
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {formatCurrency(invoice.total_amount)}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-gray-400">
                                  <span>Created {formatDate(invoice.created_at.toString())}</span>
                                  {invoice.due_date && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span>Due {formatDate(invoice.due_date.toString())}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons on new line for mobile */}
                          <div className="flex items-center justify-start gap-2 px-2">
                            <button
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title={invoice.status === InvoiceStatus.DRAFT ? 'Edit Invoice' : 'View Invoice'}
                            >
                              <PencilIcon className="h-6 w-6" />
                            </button>
                            {invoice.status === InvoiceStatus.DRAFT && (
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/invoices/${invoice.id}/send`, {
                                      method: 'POST',
                                    });
                                    if (response.ok) {
                                      setToast({ message: 'Invoice sent successfully!', type: 'success' });
                                      fetchInvoices();
                                    } else {
                                      setToast({ message: 'Failed to send invoice', type: 'error' });
                                    }
                                  } catch (error) {
                                    setToast({ message: 'Failed to send invoice', type: 'error' });
                                  }
                                }}
                                className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Send Invoice"
                              >
                                <PaperAirplaneIcon className="h-6 w-6" />
                              </button>
                            )}
                            {(invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) && (
                              <>
                                <button
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                  disabled={updatingStatusId === invoice.id}
                                  className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                                  title="Mark as Paid"
                                >
                                  {updatingStatusId === invoice.id ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                  ) : (
                                    <CheckCircleIcon className="h-6 w-6" />
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
                                        method: 'POST',
                                      });
                                      if (response.ok) {
                                        setToast({ message: 'Invoice resent successfully!', type: 'success' });
                                        fetchInvoices();
                                      } else {
                                        setToast({ message: 'Failed to resend invoice', type: 'error' });
                                      }
                                    } catch (error) {
                                      setToast({ message: 'Failed to resend invoice', type: 'error' });
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                  title="Resend Invoice"
                                >
                                  <PaperAirplaneIcon className="h-6 w-6" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Download PDF"
                            >
                              <ArrowDownTrayIcon className="h-6 w-6" />
                            </button>
                            {invoice.status === InvoiceStatus.DRAFT && (
                              <button
                                onClick={() => setDeleteInvoiceId(invoice.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Delete Invoice"
                              >
                                <TrashIcon className="h-6 w-6" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteInvoiceId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete Invoice</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this invoice? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteInvoiceId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteInvoiceId)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 