'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ArrowRightStartOnRectangleIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to home page after successful logout
        router.push('/');
      } else {
        console.error('Logout failed:', data.error);
        // Even if the API call fails, redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, redirect to login
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation - Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <img
              src="/images/favicon/android-chrome-192x192.png"
              alt="MPDEE Accounts"
              className="h-8 w-auto"
            />
            <span className="ml-3 text-xl font-semibold text-gray-900">Accounts</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link
            href="/"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname === '/'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <HomeIcon className={`h-5 w-5 mr-3 ${pathname === '/' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Dashboard
          </Link>
          <Link
            href="/clients"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname?.startsWith('/clients')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <UsersIcon className={`h-5 w-5 mr-3 ${pathname?.startsWith('/clients') ? 'text-blue-600' : 'text-gray-400'}`} />
            Clients
          </Link>
          <Link
            href="/invoices"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname?.startsWith('/invoices')
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <DocumentTextIcon className={`h-5 w-5 mr-3 ${pathname?.startsWith('/invoices') ? 'text-green-600' : 'text-gray-400'}`} />
            Invoices
          </Link>
          <Link
            href="/expenses"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname?.startsWith('/expenses')
                ? 'bg-orange-50 text-orange-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <BanknotesIcon className={`h-5 w-5 mr-3 ${pathname?.startsWith('/expenses') ? 'text-orange-600' : 'text-gray-400'}`} />
            Expenses
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href="/settings"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
              pathname?.startsWith('/settings')
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <CogIcon className="h-5 w-5 mr-3 text-gray-400" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Desktop Navigation - Top Bar (Medium screens) */}
      <nav className="hidden sm:hidden lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo - Left */}
            <div className="flex items-center">
              <Link href="/" className="inline-flex items-center">
                <img
                  src="/images/favicon/android-chrome-192x192.png"
                  alt="MPDEE Accounts"
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-semibold text-gray-900">Accounts</span>
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="flex flex-1 justify-center">
              <nav className="flex space-x-8">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/clients"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Clients
                </Link>
                <Link
                  href="/invoices"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Invoices
                </Link>
                <Link
                  href="/expenses"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Expenses
                </Link>
              </nav>
            </div>

            {/* Desktop Right Side - Settings & Logout */}
            <div className="flex items-center space-x-4">
              {/* Settings button */}
              <Link
                href="/settings"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <CogIcon className="h-5 w-5" />
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoggingOut ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging out...
                  </div>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          <Link 
            href="/" 
            aria-label="Dashboard" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] active:scale-95 ${
              pathname === '/' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'hover:bg-indigo-50 text-gray-600'
            }`}
          >
            <HomeIcon className={`h-6 w-6 ${pathname === '/' ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className={`text-xs mt-1 font-medium ${pathname === '/' ? 'text-indigo-700' : 'text-gray-600'}`}>
              Home
            </span>
          </Link>
          <Link 
            href="/clients" 
            aria-label="Clients" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] active:scale-95 ${
              pathname?.startsWith('/clients')
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-blue-50 text-gray-600'
            }`}
          >
            <UsersIcon className={`h-6 w-6 ${pathname?.startsWith('/clients') ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className={`text-xs mt-1 font-medium ${pathname?.startsWith('/clients') ? 'text-blue-700' : 'text-gray-600'}`}>
              Clients
            </span>
          </Link>
          <Link 
            href="/invoices" 
            aria-label="Invoices" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] active:scale-95 ${
              pathname?.startsWith('/invoices')
                ? 'bg-green-100 text-green-700' 
                : 'hover:bg-green-50 text-gray-600'
            }`}
          >
            <DocumentTextIcon className={`h-6 w-6 ${pathname?.startsWith('/invoices') ? 'text-green-600' : 'text-gray-500'}`} />
            <span className={`text-xs mt-1 font-medium ${pathname?.startsWith('/invoices') ? 'text-green-700' : 'text-gray-600'}`}>
              Invoices
            </span>
          </Link>
          <Link 
            href="/expenses" 
            aria-label="Expenses" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] active:scale-95 ${
              pathname?.startsWith('/expenses')
                ? 'bg-orange-100 text-orange-700' 
                : 'hover:bg-orange-50 text-gray-600'
            }`}
          >
            <BanknotesIcon className={`h-6 w-6 ${pathname?.startsWith('/expenses') ? 'text-orange-600' : 'text-gray-500'}`} />
            <span className={`text-xs mt-1 font-medium ${pathname?.startsWith('/expenses') ? 'text-orange-700' : 'text-gray-600'}`}>
              Expenses
            </span>
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] active:scale-95 ${
              pathname?.startsWith('/settings')
                ? 'bg-gray-200 text-gray-800' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <CogIcon className={`h-6 w-6 ${pathname?.startsWith('/settings') ? 'text-gray-700' : 'text-gray-500'}`} />
            <span className={`text-xs mt-1 font-medium ${pathname?.startsWith('/settings') ? 'text-gray-800' : 'text-gray-600'}`}>
              Settings
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
} 