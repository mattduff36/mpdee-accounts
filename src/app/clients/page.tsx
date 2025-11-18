'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Client, PaginatedResponse } from '@/lib/types';
import { 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { ClientAvatar } from '@/lib/client-avatar';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const limit = 10;

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/clients?${params}`);
      const data: PaginatedResponse<Client> = await response.json();

      if (response.ok && data.success) {
        setClients(data.data);
        setTotal(data.total);
      } else {
        setError('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleDelete = async (clientId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setDeleteClientId(null);
        fetchClients(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Navigation />
      
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Clients
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                                        onClick={() => router.push('/clients/new')}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Client
              </button>
            </div>
          </div>

          <div className="mt-8">
            {/* Search */}
            <div className="mb-6">
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Clients Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    {search ? 'No clients found matching your search.' : 'No clients yet. Add your first client!'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <li key={client.id}>
                      <div className="px-4 py-4">
                        {/* Desktop layout - horizontal */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div className="flex items-center">
                            <ClientAvatar client={client} />
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {client.name}
                                </p>
                              </div>
                              <div className="flex items-center mt-1">
                                <p className="text-sm text-gray-500 truncate">
                                  {client.email}
                                </p>
                                {client.phone && (
                                  <>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <p className="text-sm text-gray-500 truncate">
                                      {client.phone}
                                    </p>
                                  </>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                Created {formatDate(client.created_at.toString())}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => router.push(`/clients/${client.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50 transition-colors border border-indigo-300"
                              title="Edit Client"
                            >
                              <PencilIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => setDeleteClientId(client.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors border border-red-300"
                              title="Delete Client"
                            >
                              <TrashIcon className="h-6 w-6" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile layout - stacked */}
                        <div className="sm:hidden space-y-3">
                          <div className="flex items-center">
                            <ClientAvatar client={client} />
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {client.name}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {client.email}
                              </p>
                              {client.phone && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {client.phone}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Created {formatDate(client.created_at.toString())}
                              </p>
                            </div>
                          </div>

                          {/* Action buttons on new line for mobile */}
                          <div className="flex items-center justify-between px-1">
                            <button
                              onClick={() => router.push(`/clients/${client.id}`)}
                              className="flex-1 text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50 transition-colors min-h-[44px] flex items-center justify-center border border-indigo-300 mx-0.5"
                              title="Edit Client"
                            >
                              <PencilIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => setDeleteClientId(client.id)}
                              className="flex-1 text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors min-h-[44px] flex items-center justify-center border border-red-300 mx-0.5"
                              title="Delete Client"
                            >
                              <TrashIcon className="h-6 w-6" />
                            </button>
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
      {deleteClientId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Delete Client</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this client? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteClientId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteClientId)}
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