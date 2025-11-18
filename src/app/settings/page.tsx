'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { 
  CogIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CircleStackIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { InvoiceStatus, InvoiceWithDetails, ApiResponse } from '@/lib/types';

interface InvoiceStatusUpdate {
  id: string;
  invoice_number: string;
  client_name: string;
  current_status: InvoiceStatus;
  total_amount: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'database' | 'system'>('workflow');
  const [invoices, setInvoices] = useState<InvoiceStatusUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch invoices for workflow management
  useEffect(() => {
    if (activeTab === 'workflow') {
      fetchInvoicesForWorkflow();
    }
  }, [activeTab]);

  const fetchInvoicesForWorkflow = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/invoices?limit=50');
      const data = await response.json();
      
      if (response.ok && data.success) {
        const invoiceUpdates = data.data.map((invoice: any) => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          client_name: invoice.client?.name || 'Unknown Client',
          current_status: invoice.status,
          total_amount: invoice.total_amount
        }));
        setInvoices(invoiceUpdates);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setToast({ message: 'Failed to load invoices', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToast({ message: `Invoice status updated to ${newStatus}`, type: 'success' });
        // Update local state
        setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId ? { ...inv, current_status: newStatus } : inv
        ));
      } else {
        setToast({ message: data.error || 'Failed to update status', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      setToast({ message: 'Network error occurred', type: 'error' });
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT: return 'bg-gray-100 text-gray-800';
      case InvoiceStatus.SENT: return 'bg-blue-100 text-blue-800';
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-800';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navigation />
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setToast(null)}></div>
          <div className={`relative max-w-md w-full ${toast.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg shadow-xl pointer-events-auto animate-modal-fade-in`}>
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-base font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {toast.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center">
              <CogIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 mr-2 sm:mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Manage system settings and administrative tools</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6 sm:mb-8">
            {/* Mobile tab navigation - equal width */}
            <nav className="-mb-px flex sm:hidden justify-between px-1">
              <button
                onClick={() => setActiveTab('workflow')}
                className={`flex-1 py-3 px-2 border-b-2 font-medium text-xs whitespace-nowrap min-h-[44px] flex items-center justify-center mx-0.5 ${
                  activeTab === 'workflow'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentTextIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`flex-1 py-3 px-2 border-b-2 font-medium text-xs whitespace-nowrap min-h-[44px] flex items-center justify-center mx-0.5 ${
                  activeTab === 'database'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CircleStackIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`flex-1 py-3 px-2 border-b-2 font-medium text-xs whitespace-nowrap min-h-[44px] flex items-center justify-center mx-0.5 ${
                  activeTab === 'system'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClockIcon className="h-6 w-6" />
              </button>
            </nav>

            {/* Desktop tab navigation - text with icons */}
            <nav className="-mb-px hidden sm:flex space-x-8">
              <button
                onClick={() => setActiveTab('workflow')}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap min-h-[44px] flex items-center ${
                  activeTab === 'workflow'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 inline mr-2" />
                Invoice Workflow
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap min-h-[44px] flex items-center ${
                  activeTab === 'database'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CircleStackIcon className="h-5 w-5 inline mr-2" />
                Database Tools
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap min-h-[44px] flex items-center ${
                  activeTab === 'system'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClockIcon className="h-5 w-5 inline mr-2" />
                System Info
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Invoice Status Management</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manually update invoice statuses for workflow management
                  </p>
                </div>

                <div className="p-6">
                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search invoices by number or client name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Invoice List */}
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading invoices...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInvoices.map((invoice) => (
                        <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                          {/* Desktop layout - horizontal */}
                          <div className="hidden sm:flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {invoice.invoice_number}
                                  </h3>
                                  <p className="text-sm text-gray-500">{invoice.client_name}</p>
                                </div>
                                <div>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.current_status)}`}>
                                    {invoice.current_status}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency(invoice.total_amount)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {Object.values(InvoiceStatus).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateInvoiceStatus(invoice.id, status)}
                                  disabled={invoice.current_status === status}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    invoice.current_status === status
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Mobile layout - stacked */}
                          <div className="sm:hidden space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {invoice.invoice_number}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.current_status)}`}>
                                  {invoice.current_status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{invoice.client_name}</p>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatCurrency(invoice.total_amount)}
                              </p>
                            </div>
                            
                            {/* Status buttons on new line for mobile */}
                            <div className="grid grid-cols-2 gap-2">
                              {Object.values(InvoiceStatus).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateInvoiceStatus(invoice.id, status)}
                                  disabled={invoice.current_status === status}
                                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px] ${
                                    invoice.current_status === status
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredInvoices.length === 0 && !isLoading && (
                        <div className="text-center py-8">
                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No invoices found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Database Tools</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Advanced database access and debugging tools
                  </p>
                </div>

                <div className="p-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Advanced Tools
                        </h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          These tools provide direct database access. Use with caution.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Database Statistics</h3>
                      <p className="text-sm text-gray-600 mb-4">View database table statistics and record counts</p>
                      <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium min-h-[44px]">
                        View Stats
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Data Export</h3>
                      <p className="text-sm text-gray-600 mb-4">Export data for backup or analysis</p>
                      <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium min-h-[44px]">
                        Export Data
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Query Console</h3>
                      <p className="text-sm text-gray-600 mb-4">Execute custom database queries</p>
                      <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium min-h-[44px]">
                        Open Console
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">System Logs</h3>
                      <p className="text-sm text-gray-600 mb-4">View application and error logs</p>
                      <button className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium min-h-[44px]">
                        View Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">System Information</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Application and environment details
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Application Info</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Version:</dt>
                          <dd className="text-sm font-medium text-gray-900">1.0.0</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Environment:</dt>
                          <dd className="text-sm font-medium text-gray-900">Production</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Last Updated:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {new Date().toLocaleDateString('en-GB')}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Database Info</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Status:</dt>
                          <dd className="text-sm font-medium text-green-600">Connected</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Type:</dt>
                          <dd className="text-sm font-medium text-gray-900">PostgreSQL</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Last Backup:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {new Date().toLocaleDateString('en-GB')}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
