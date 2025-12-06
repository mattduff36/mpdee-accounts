'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import { UsersIcon, DocumentTextIcon, CurrencyPoundIcon, PlusCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { ClientAvatar } from '@/lib/client-avatar';

interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  outstandingAmount: number;
  outstandingClients: Array<{
    id: string;
    name: string;
    image_url: string | null;
  }>;
}

export default function AccountsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastLoginDate, setLastLoginDate] = useState<string>('');
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

  useEffect(() => {
    // Get last login date from localStorage
    const storedLastLogin = localStorage.getItem('lastLoginDate');
    if (storedLastLogin) {
      setLastLoginDate(storedLastLogin);
    } else {
      // If no stored date, set current date and store it
      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      localStorage.setItem('lastLoginDate', currentDate);
      setLastLoginDate(currentDate);
    }
  }, []);

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
      
      <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dashboard
              </h2>
              {lastLoginDate && (
                <p className="mt-1 text-sm text-gray-500">
                  Last logged in on {lastLoginDate}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            {/* Quick Actions - Moved to Top */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-3 sm:mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                <Link
                  href="/clients/new"
                  className="relative group bg-indigo-600 hover:bg-indigo-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-xl shadow-lg hover:shadow-xl transition-all aspect-square flex flex-col items-center justify-center p-4 active:scale-95"
                >
                  <PlusCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white mb-2" />
                  <span className="text-xs sm:text-sm font-semibold text-white text-center">
                    Add Client
                  </span>
                </Link>

                <Link
                  href="/invoices/new"
                  className="relative group bg-green-600 hover:bg-green-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-xl shadow-lg hover:shadow-xl transition-all aspect-square flex flex-col items-center justify-center p-4 active:scale-95"
                >
                  <DocumentTextIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white mb-2" />
                  <span className="text-xs sm:text-sm font-semibold text-white text-center">
                    New Invoice
                  </span>
                </Link>

                <Link
                  href="/expenses"
                  className="relative group bg-orange-600 hover:bg-orange-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-xl shadow-lg hover:shadow-xl transition-all aspect-square flex flex-col items-center justify-center p-4 active:scale-95"
                >
                  <ClipboardDocumentListIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white mb-2" />
                  <span className="text-xs sm:text-sm font-semibold text-white text-center">
                    Expenses
                  </span>
                </Link>
              </div>
            </div>

            {/* Quick Stats Cards - Now Fully Clickable */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link 
                href="/clients" 
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow active:scale-98 block"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <UsersIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          Total Clients
                        </dt>
                        <dd className="text-lg sm:text-2xl font-bold text-gray-900">
                          {statsLoading ? (
                            <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                          ) : (
                            stats?.totalClients || 0
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50 px-5 py-3 border-t border-indigo-100">
                  <div className="text-sm font-medium text-indigo-700 flex items-center justify-between">
                    <span>View all clients</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link 
                href="/invoices" 
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow active:scale-98 block"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          Total Invoices
                        </dt>
                        <dd className="text-lg sm:text-2xl font-bold text-gray-900">
                          {statsLoading ? (
                            <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                          ) : (
                            stats?.totalInvoices || 0
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 px-5 py-3 border-t border-green-100">
                  <div className="text-sm font-medium text-green-700 flex items-center justify-between">
                    <span>View all invoices</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link 
                href="/invoices" 
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow active:scale-98 block"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                        <CurrencyPoundIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          Outstanding
                        </dt>
                        <dd className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                          {statsLoading ? (
                            <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
                          ) : (
                            <>
                              <span className="text-lg sm:text-2xl">
                                {formatCurrency(stats?.outstandingAmount || 0)}
                              </span>
                              {stats?.outstandingClients && stats.outstandingClients.length > 0 && (
                                <div className="flex -space-x-2">
                                  {stats.outstandingClients.slice(0, 3).map((client) => (
                                    <ClientAvatar 
                                      key={client.id} 
                                      client={client} 
                                      size="xs" 
                                    />
                                  ))}
                                  {stats.outstandingClients.length > 3 && (
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium">
                                      +{stats.outstandingClients.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 px-5 py-3 border-t border-yellow-100">
                  <div className="text-sm font-medium text-yellow-700 flex items-center justify-between">
                    <span>View unpaid invoices</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 