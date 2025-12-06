'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ClientForm from '@/components/ClientForm';

export default function NewClientPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/clients');
  };

  const handleCancel = () => {
    router.push('/clients');
  };

  return (
    <>
      <Navigation />
      <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClientForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
} 