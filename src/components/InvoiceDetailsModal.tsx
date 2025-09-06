'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, CurrencyPoundIcon, UserIcon } from '@heroicons/react/24/outline';
import { InvoiceWithDetails, ApiResponse, BusinessArea } from '@/lib/types';
import { ClientAvatar } from '@/lib/client-avatar';

interface InvoiceDetailsModalProps {
  invoiceId: string | null;
  onClose: () => void;
}

export default function InvoiceDetailsModal({ invoiceId, onClose }: InvoiceDetailsModalProps) {
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    if (!invoiceId) return;
    
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data: ApiResponse<InvoiceWithDetails> = await response.json();

      if (data.success && data.data) {
        setInvoice(data.data);
      } else {
        setError('Failed to load invoice details');
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getBusinessAreaColor = (area: BusinessArea) => {
    const colors = {
      CREATIVE: 'bg-blue-50 text-blue-700 border-blue-200',
      DEVELOPMENT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      SUPPORT: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[area] || colors.CREATIVE;
  };

  if (!invoiceId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-t-lg sm:rounded-lg bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col animate-modal-fade-in">
          {/* Mobile handle indicator */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="bg-white px-4 pb-4 pt-3 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Invoice Details
              </h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading invoice details...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchInvoiceDetails}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Try again
                </button>
              </div>
            ) : invoice ? (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{invoice.invoice_number}</h4>
                      <p className="text-sm text-gray-500">
                        Issued {formatDate(invoice.issue_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(invoice.status)}
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center">
                    <ClientAvatar client={invoice.client} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{invoice.client.name}</p>
                      <p className="text-sm text-gray-500">{invoice.client.email}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Issue Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(invoice.issue_date)}</p>
                    </div>
                  </div>
                  {invoice.due_date && (
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(invoice.due_date)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Items */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Invoice Items</h5>
                  <div className="space-y-3">
                    {invoice.items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">{item.description}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBusinessAreaColor(item.business_area)}`}>
                                {item.business_area.charAt(0) + item.business_area.slice(1).toLowerCase()}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                              <span>Qty: {item.quantity}</span>
                              <span>Rate: {formatCurrency(item.unit_price)}</span>
                              {item.agency_commission > 0 && (
                                <span>Commission: {item.agency_commission}%</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.total_price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Notes</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 flex-shrink-0">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
