'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, InvoiceWithDetails, InvoiceFormData, InvoiceItemFormData, PaginatedResponse } from '../../../lib/types';

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
    items: [{ description: '', quantity: 1, rate: 0, agency_commission: 0 }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [error, setError] = useState('');
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const router = useRouter();

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
          rate: item.rate,
          agency_commission: item.agency_commission || 0,
        })),
      });
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
      items: [...prev.items, { description: '', quantity: 1, rate: 0, agency_commission: 0 }],
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
    const baseTotal = item.quantity * item.rate;
    const commissionAmount = (baseTotal * item.agency_commission) / 100;
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
          router.push('/accounts/invoices');
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
      router.push('/accounts/invoices');
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
    <div className="max-w-4xl mx-auto">
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
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.due_date}
                onChange={handleChange}
                disabled={isLoading}
              />
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
                    <div className="sm:col-span-5">
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

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Rate *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0.00"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Total
                      </label>
                      <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-900">
                        {item.agency_commission > 0 ? (
                          <div>
                            <div className="text-xs text-gray-500 line-through">
                              {formatCurrency(item.quantity * item.rate)}
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
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => openAgencyModal(index)}
                          disabled={isLoading}
                          className="block text-blue-600 hover:text-blue-900 text-xs font-medium disabled:opacity-50"
                        >
                          agency?
                        </button>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={isLoading}
                            className="block text-red-600 hover:text-red-900 text-xs font-medium disabled:opacity-50"
                          >
                            Remove
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
          currentPercentage={selectedItemIndex !== null ? formData.items[selectedItemIndex].agency_commission : 0}
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
  const [percentage, setPercentage] = useState(currentPercentage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(percentage);
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
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0"
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