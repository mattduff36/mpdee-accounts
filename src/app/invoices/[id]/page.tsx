'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import InvoiceForm from '@/components/InvoiceForm';
import { InvoiceWithDetails, ApiResponse } from '@/lib/types';

export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        const data: ApiResponse<InvoiceWithDetails> = await response.json();

        if (data.success && data.data) {
          setInvoice(data.data);
        } else {
          setError('Invoice not found');
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleSuccess = () => {
    router.push('/invoices');
  };

  const handleCancel = () => {
    router.push('/invoices');
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading invoice...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !invoice) {
    return (
      <>
        <Navigation />
        <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-red-600">{error || 'Invoice not found'}</p>
              <button
                onClick={() => router.push('/invoices')}
                className="mt-4 text-indigo-600 hover:text-indigo-500"
              >
                Back to Invoices
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InvoiceForm
            invoice={invoice}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
} 