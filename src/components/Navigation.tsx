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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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

			<div className="flex items-center space-x-4 w-full justify-end">
				{/* Desktop nav */}
				<nav className="hidden sm:flex space-x-8">
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

				{/* Mobile icon nav */}
				<nav className="flex sm:hidden items-center gap-2">
					<Link href="/" aria-label="Dashboard" className="p-2 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
						<HomeIcon className="h-5 w-5" />
					</Link>
					<Link href="/clients" aria-label="Clients" className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100">
						<UsersIcon className="h-5 w-5" />
					</Link>
					<Link href="/invoices" aria-label="Invoices" className="p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100">
						<DocumentTextIcon className="h-5 w-5" />
					</Link>
					<Link href="/expenses" aria-label="Expenses" className="p-2 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100">
						<BanknotesIcon className="h-5 w-5" />
					</Link>
				</nav>

				{/* Logout button (text on desktop, icon on mobile) */}
				<button
					onClick={handleLogout}
					disabled={isLoggingOut}
					className="hidden sm:inline-flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
				<button
					onClick={handleLogout}
					disabled={isLoggingOut}
					aria-label="Logout"
					className="sm:hidden p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ArrowRightStartOnRectangleIcon className="h-5 w-5" />
				</button>
          </div>
        </div>
      </div>
    </nav>
  );
} 