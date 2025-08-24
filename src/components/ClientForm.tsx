'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, ClientFormData } from '@/lib/types';

interface ClientFormProps {
  client?: Client;
  onSuccess?: (client: Client) => void;
  onCancel?: () => void;
}

export default function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    billing_address: '',
    notes: '',
    image_url: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Populate form with existing client data if editing
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        billing_address: client.billing_address || '',
        notes: client.notes || '',
        image_url: client.image_url || '',
      });
      if (client.image_url) {
        setImagePreview(client.image_url);
      }
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      image_url: url,
    }));
    setImagePreview(url);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image_url: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = client ? `/api/clients/${client.id}` : '/api/clients';
      const method = client ? 'PUT' : 'POST';

      // Prepare the data to send
      const dataToSend = {
        ...formData,
        image_url: formData.image_url || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess(data.data);
        } else {
          router.push('/clients');
        }
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Client form error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/clients');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {client ? 'Edit Client' : 'New Client'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {client ? 'Update client information' : 'Add a new client to your system'}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Client name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="client@example.co.uk"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Client Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
              Client Image URL
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Client preview"
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com/client-image.jpg"
                  value={formData.image_url}
                  onChange={handleImageUrlChange}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Paste a URL to an image online. Will be used as avatar in lists.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="07700 900123"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="billing_address" className="block text-sm font-medium text-gray-700">
              Billing Address
            </label>
            <textarea
              id="billing_address"
              name="billing_address"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="123 High Street&#10;London&#10;SW1A 1AA"
              value={formData.billing_address}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Additional notes about this client..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
            />
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
              disabled={isLoading || !formData.name || !formData.email}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {client ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                client ? 'Update Client' : 'Create Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 