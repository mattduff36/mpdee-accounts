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
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          setIsAuthenticated(true);
          fetchStats();
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const storedLastLogin = localStorage.getItem('lastLoginDate');
    if (storedLastLogin) {
      setLastLoginDate(storedLastLogin);
    } else {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navigation />
      
      <div className="pt-16 pb-24 lg:pt-6 lg:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back
            </h1>
            {lastLoginDate && (
              <p className="mt-1 text-sm text-gray-500">
                Last logged in on {lastLoginDate}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/clients/new"
                className="group bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-4 active:scale-95"
              >
                <PlusCircleIcon className="h-8 w-8 text-white mb-2" />
                <span className="text-sm font-semibold text-white text-center">
                  Add Client
                </span>
              </Link>

              <Link
                href="/invoices/new"
                className="group bg-green-600 hover:bg-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-4 active:scale-95"
              >
                <DocumentTextIcon className="h-8 w-8 text-white mb-2" />
                <span className="text-sm font-semibold text-white text-center">
                  New Invoice
                </span>
              </Link>

              <Link
                href="/expenses"
                className="group bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-4 active:scale-95"
              >
                <ClipboardDocumentListIcon className="h-8 w-8 text-white mb-2" />
                <span className="text-sm font-semibold text-white text-center">
                  Expenses
                </span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/clients" 
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.98] block border border-gray-100"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    View all
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                    ) : (
                      stats?.totalClients || 0
                    )}
                  </p>
                </div>
              </div>
            </Link>

            <Link 
              href="/invoices" 
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.98] block border border-gray-100"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    View all
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                    ) : (
                      stats?.totalInvoices || 0
                    )}
                  </p>
                </div>
              </div>
            </Link>

            <Link 
              href="/invoices" 
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.98] block border border-gray-100"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <CurrencyPoundIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
                    Unpaid
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Outstanding</p>
                  <p className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                    {statsLoading ? (
                      <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                    ) : (
                      <>
                        {formatCurrency(stats?.outstandingAmount || 0)}
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
                              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 font-medium ring-2 ring-white">
                                +{stats.outstandingClients.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
