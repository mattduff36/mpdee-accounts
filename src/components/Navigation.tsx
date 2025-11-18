'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo - Left (Hidden on mobile) */}
          <div className="hidden sm:flex items-center">
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
          <div className="hidden sm:flex flex-1 justify-center">
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

          {/* Mobile icon navigation - Full width with equal spacing */}
          <nav className="flex sm:hidden items-center justify-between flex-1 px-1">
            <Link 
              href="/" 
              aria-label="Dashboard" 
              className="flex-1 flex justify-center p-2 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 mx-0.5 min-h-[44px] items-center"
            >
              <HomeIcon className="h-6 w-6" />
            </Link>
            <Link 
              href="/clients" 
              aria-label="Clients" 
              className="flex-1 flex justify-center p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 mx-0.5 min-h-[44px] items-center"
            >
              <UsersIcon className="h-6 w-6" />
            </Link>
            <Link 
              href="/invoices" 
              aria-label="Invoices" 
              className="flex-1 flex justify-center p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 mx-0.5 min-h-[44px] items-center"
            >
              <DocumentTextIcon className="h-6 w-6" />
            </Link>
            <Link 
              href="/expenses" 
              aria-label="Expenses" 
              className="flex-1 flex justify-center p-2 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 mx-0.5 min-h-[44px] items-center"
            >
              <BanknotesIcon className="h-6 w-6" />
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex-1 flex justify-center p-2 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 mx-0.5 min-h-[44px] items-center"
            >
              <CogIcon className="h-6 w-6" />
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Logout"
              className="flex-1 flex justify-center p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed mx-0.5 min-h-[44px] items-center"
            >
              <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
            </button>
          </nav>

          {/* Desktop Right Side - Settings & Logout */}
          <div className="hidden sm:flex items-center space-x-4">
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
              className="inline-flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
} 