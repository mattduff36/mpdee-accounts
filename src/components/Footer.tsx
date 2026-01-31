'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [lastLoginDate, setLastLoginDate] = useState<string>('');

  useEffect(() => {
    // Get last login date from localStorage or set current date as fallback
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

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto lg:ml-72">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            Designed by MPDEE Development © 2025 - All rights reserved.
          </div>
          <div className="text-sm text-gray-500">
            Last logged in on {lastLoginDate}
          </div>
        </div>
      </div>
    </footer>
  );
}
