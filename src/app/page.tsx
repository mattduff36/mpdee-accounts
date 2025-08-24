'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import { UsersIcon, DocumentTextIcon, CurrencyPoundIcon, PlusCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  outstandingAmount: number;
}

export default function AccountsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has valid session by calling a protected API endpoint
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          setIsAuthenticated(true);
          // Fetch stats after authentication is confirmed
          fetchStats();
        } else {
          // Not authenticated, redirect to login
          router.push('/login');
          return;
        }
      } catch (error) {
        // Error checking auth, redirect to login
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Navigation />
      
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dashboard
              </h2>
            </div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Quick Stats Cards */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center">
                        <UsersIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          Total Clients
                        </dt>
                        <dd className="text-base sm:text-lg font-medium text-gray-900">
                          {statsLoading ? (
                            <div className="animate-pulse h-6 w-8 bg-gray-200 rounded"></div>
                          ) : (
                            stats?.totalClients || 0
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/clients" className="font-medium text-indigo-700 hover:text-indigo-900">
                      View all clients
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 bg-green-100 text-green-600 rounded-md flex items-center justify-center">
                        <DocumentTextIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          Total Invoices
                        </dt>
                        <dd className="text-base sm:text-lg font-medium text-gray-900">
                          {statsLoading ? (
                            <div className="animate-pulse h-6 w-8 bg-gray-200 rounded"></div>
                          ) : (
                            stats?.totalInvoices || 0
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/invoices" className="font-medium text-green-700 hover:text-green-900">
                      View all invoices
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 bg-yellow-100 text-yellow-600 rounded-md flex items-center justify-center">
                        <CurrencyPoundIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          Outstanding Amount
                        </dt>
                        <dd className="text-base sm:text-lg font-medium text-gray-900">
                          {statsLoading ? (
                            <div className="animate-pulse h-6 w-16 bg-gray-200 rounded"></div>
                          ) : (
                            formatCurrency(stats?.outstandingAmount || 0)
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link href="/invoices" className="font-medium text-yellow-700 hover:text-yellow-900">
                      View unpaid invoices
                    </Link>
                  </div>
                </div>
              </div>


            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/clients/new"
                  className="relative group bg-white p-4 sm:p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-2 sm:p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                      <PlusCircleIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4 sm:mt-8">
                    <h3 className="text-sm sm:text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Add New Client
                    </h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                      Create a new client record for invoicing
                    </p>
                  </div>
                </Link>

                <Link
                  href="/expenses"
                  className="relative group bg-white p-4 sm:p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-2 sm:p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                      <ClipboardDocumentListIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4 sm:mt-8">
                    <h3 className="text-sm sm:text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Track Expenses
                    </h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                      Record and manage business expenses
                    </p>
                  </div>
                </Link>

                <Link
                  href="/invoices/new"
                  className="relative group bg-white p-4 sm:p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-2 sm:p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <DocumentTextIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4 sm:mt-8">
                    <h3 className="text-sm sm:text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Create Invoice
                    </h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                      Generate a new invoice for a client
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 