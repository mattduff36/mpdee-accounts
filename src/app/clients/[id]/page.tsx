'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ClientForm from '@/components/ClientForm';
import { Client, ApiResponse } from '@/lib/types';

export default function ClientDetailPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/clients/${clientId}`);
        const data: ApiResponse<Client> = await response.json();

        if (data.success && data.data) {
          setClient(data.data);
        } else {
          setError('Client not found');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        setError('Failed to load client');
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const handleSuccess = () => {
    router.push('/clients');
  };

  const handleCancel = () => {
    router.push('/clients');
  };

  if (isLoading) {
    return (
          <>
      <Navigation />
      <div className="pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading client...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !client) {
    return (
      <>
        <Navigation />
        <div className="pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-red-600">{error || 'Client not found'}</p>
              <button
                onClick={() => router.push('/clients')}
                className="mt-4 text-indigo-600 hover:text-indigo-500"
              >
                Back to Clients
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
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClientForm
            client={client}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
} 