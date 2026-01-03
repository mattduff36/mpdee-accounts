'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';
import { Client, InvoiceWithDetails, InvoiceFormData, InvoiceItemFormData, PaginatedResponse } from '@/lib/types';
import { AdjustmentsHorizontalIcon, TrashIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface InvoiceFormProps {
  invoice?: InvoiceWithDetails;
  onSuccess?: (invoice: InvoiceWithDetails) => void;
  onCancel?: () => void;
}

export default function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    due_date: '',
    items: [{ description: '', quantity: '', rate: '', agency_commission: 0, business_area: 'CREATIVE' }],
  });
  const [dueDateOption, setDueDateOption] = useState<'end_of_month' | '30_days' | 'other'>('end_of_month');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate due date based on selected option
  const calculateDueDate = useCallback((option: 'end_of_month' | '30_days' | 'other', customDate?: string) => {
    const today = new Date();
    
    switch (option) {
      case 'end_of_month':
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return endOfMonth.toISOString().split('T')[0];
      case '30_days':
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        return thirtyDaysFromNow.toISOString().split('T')[0];
      case 'other':
        return customDate || '';
      default:
        return '';
    }
  }, []);

  // Handle due date option change
  const handleDueDateOptionChange = (option: 'end_of_month' | '30_days' | 'other') => {
    setDueDateOption(option);
    if (option !== 'other') {
      const newDueDate = calculateDueDate(option);
      setFormData(prev => ({ ...prev, due_date: newDueDate }));
    }
  };
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [error, setError] = useState('');
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const router = useRouter();

  // Initialize default due date
  useEffect(() => {
    if (!invoice) {
      // Set default due date to end of month for new invoices
      const defaultDueDate = calculateDueDate('end_of_month');
      setFormData(prev => ({ ...prev, due_date: defaultDueDate }));
    }
  }, [calculateDueDate, invoice]);

  // Fetch clients for selection
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        const response = await fetch('/api/clients?limit=100'); // Get more clients for selection
        const data: PaginatedResponse<Client> = await response.json();
        
        if (response.ok) {
          setClients(data.data);
        } else {
          setError('Failed to load clients');
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients');
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Populate form with existing invoice data if editing
  useEffect(() => {
    if (invoice) {
      const dueDate = invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '';
      setFormData({
        client_id: invoice.client_id,
        due_date: dueDate,
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate || item.unit_price || '',
          agency_commission: item.agency_commission || 0,
          business_area: item.business_area || 'CREATIVE',
        })),
      });
      
      // Set due date option to 'other' when editing existing invoice
      if (dueDate) {
        setDueDateOption('other');
      }
    }
  }, [invoice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '', rate: '', agency_commission: 0, business_area: 'CREATIVE' }],
    }));
  };

  const openAgencyModal = (itemIndex: number) => {
    setSelectedItemIndex(itemIndex);
    setShowAgencyModal(true);
  };

  const handleAgencyCommissionSave = (percentage: number) => {
    if (selectedItemIndex !== null) {
      handleItemChange(selectedItemIndex, 'agency_commission', percentage);
    }
    setShowAgencyModal(false);
    setSelectedItemIndex(null);
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateItemTotal = (item: InvoiceItemFormData) => {
    const qty = typeof item.quantity === 'number' ? item.quantity : 0;
    const rate = typeof item.rate === 'number' ? item.rate : 0;
    const commissionPct = typeof item.agency_commission === 'number' ? item.agency_commission : 0;
    const baseTotal = qty * rate;
    const commissionAmount = (baseTotal * commissionPct) / 100;
    return baseTotal - commissionAmount;
  };

  const calculateInvoiceTotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices';
      const method = invoice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.data);
        } else {
          router.push('/invoices');
        }
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Invoice form error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/invoices');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (isLoadingClients) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {invoice ? 'Edit Invoice' : 'New Invoice'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {invoice ? 'Update invoice information' : 'Create a new invoice for a client'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
                Client *
              </label>
              <select
                id="client_id"
                name="client_id"
                required
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.client_id}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Due Date
              </label>
              
              {/* Due Date Option Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleDueDateOptionChange('end_of_month')}
                    disabled={isLoading}
                    className={`px-4 py-3 text-sm font-medium border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-center ${
                      dueDateOption === 'end_of_month'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    End of Month
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleDueDateOptionChange('30_days')}
                    disabled={isLoading}
                    className={`px-4 py-3 text-sm font-medium border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-center ${
                      dueDateOption === '30_days'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    30 Days
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleDueDateOptionChange('other')}
                    disabled={isLoading}
                    className={`px-4 py-3 text-sm font-medium border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-center ${
                      dueDateOption === 'other'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Other
                  </button>
                </div>
                
                {/* Custom Date Input - Only show when "Other" is selected */}
                {dueDateOption === 'other' && (
                  <div className="mt-3">
                    <input
                      type="date"
                      id="due_date"
                      name="due_date"
                      className="block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.due_date}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                )}
                
                {/* Display calculated due date for End of Month and 30 Days */}
                {dueDateOption !== 'other' && formData.due_date && (
                  <div className="mt-2 text-sm text-gray-600">
                    Due: {new Date(formData.due_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-5 min-w-0">
                      <label className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Service description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        className="mt-1 block w-full px-2 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                        value={item.quantity === '' ? '' : item.quantity}
                        onChange={(e) => {
                          const v = e.target.value;
                          // Only allow integers
                          if (v === '' || /^\d+$/.test(v)) {
                            handleItemChange(index, 'quantity', v === '' ? '' : parseInt(v));
                          }
                        }}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Rate *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        className="mt-1 block w-full px-2 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                        placeholder="0.00"
                        value={item.rate === '' ? '' : item.rate}
                        onChange={(e) => {
                          const v = e.target.value;
                          // Allow empty, negative sign, integers, or numbers with up to 2 decimal places
                          if (v === '' || v === '-' || /^-?\d*\.?\d{0,2}$/.test(v)) {
                            handleItemChange(index, 'rate', v === '' || v === '-' ? '' : parseFloat(v) || 0);
                          }
                        }}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Business Area
                      </label>
                      <select
                        className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={item.business_area}
                        onChange={(e) => handleItemChange(index, 'business_area', e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="CREATIVE">Creative</option>
                        <option value="DEVELOPMENT">Development</option>
                        <option value="SUPPORT">Support</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Total
                      </label>
                      <div className="mt-1 px-2 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-900 text-right">
                        {((typeof item.agency_commission === 'number' ? item.agency_commission : 0) > 0) ? (
                          <div>
                            <div className="text-xs text-gray-500 line-through">
                              {formatCurrency((typeof item.quantity === 'number' ? item.quantity : 0) * (typeof item.rate === 'number' ? item.rate : 0))}
                            </div>
                            <div className="text-xs text-orange-600">
                              -{item.agency_commission}% agency commission
                            </div>
                            <div className="font-medium">
                              {formatCurrency(calculateItemTotal(item))}
                            </div>
                          </div>
                        ) : (
                          formatCurrency(calculateItemTotal(item))
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex items-end">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openAgencyModal(index)}
                          disabled={isLoading}
                          className="p-2 rounded text-blue-600 hover:text-blue-900 hover:bg-blue-50 disabled:opacity-50"
                          title="Set agency commission"
                          aria-label="Set agency commission"
                        >
                          <AdjustmentsHorizontalIcon className="h-5 w-5" />
                          <span className="sr-only">Set agency commission</span>
                        </button>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={isLoading}
                            className="p-2 rounded text-red-600 hover:text-red-900 hover:bg-red-50 disabled:opacity-50"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <TrashIcon className="h-5 w-5" />
                            <span className="sr-only">Remove item</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Invoice Total */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(calculateInvoiceTotal())}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            {invoice && (invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
              <button
                type="button"
                                 onClick={async () => {
                   try {
                     const response = await fetch(`/api/invoices/${invoice.id}/send`, {
                       method: 'POST',
                     });
                     if (response.ok) {
                       setToast({ message: 'Invoice resent successfully!', type: 'success' });
                     } else {
                       setToast({ message: 'Failed to resend invoice', type: 'error' });
                     }
                   } catch (error) {
                     setToast({ message: 'Failed to resend invoice', type: 'error' });
                   }
                 }}
                disabled={isLoading}
                className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <div className="flex items-center">
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Resend Invoice
                </div>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !formData.client_id || formData.items.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {invoice ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                invoice ? 'Update Invoice' : 'Create Invoice'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Agency Commission Modal */}
      {showAgencyModal && (
        <AgencyCommissionModal
          currentPercentage={selectedItemIndex !== null
            ? (typeof formData.items[selectedItemIndex].agency_commission === 'number'
                ? formData.items[selectedItemIndex].agency_commission
                : 0)
            : 0}
          onSave={handleAgencyCommissionSave}
          onCancel={() => {
            setShowAgencyModal(false);
            setSelectedItemIndex(null);
          }}
        />
      )}
    </div>
  );
}

// Agency Commission Modal Component
interface AgencyCommissionModalProps {
  currentPercentage: number;
  onSave: (percentage: number) => void;
  onCancel: () => void;
}

function AgencyCommissionModal({ currentPercentage, onSave, onCancel }: AgencyCommissionModalProps) {
  const [percentage, setPercentage] = useState<number | string>(currentPercentage === 0 ? '' : currentPercentage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(typeof percentage === 'string' && percentage === '' ? 0 : Number(percentage));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Set Agency Commission
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={percentage}
                onChange={(e) => {
                  const v = e.target.value;
                  // Allow empty, integers, or numbers with up to 2 decimal places
                  if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
                    if (v === '') {
                      setPercentage('');
                    } else {
                      const numValue = parseFloat(v);
                      if (numValue <= 100) {
                        setPercentage(numValue);
                      }
                    }
                  }
                }}
                className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter percentage"
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 