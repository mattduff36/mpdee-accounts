'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import InvoiceForm from '@/components/InvoiceForm';

export default function NewInvoicePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/invoices');
  };

  const handleCancel = () => {
    router.push('/invoices');
  };

  return (
    <>
      <Navigation />
      <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InvoiceForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
} 