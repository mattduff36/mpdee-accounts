'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Expense } from '@/lib/types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const categories = useMemo(
    () => ['Office Supplies','Travel','Marketing','Equipment','Software','Utilities','Professional Services','Other'],
    []
  );

  async function fetchExpenses() {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      if (category) params.set('category', category);

      const res = await fetch(`/api/expenses?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setExpenses(data.data as Expense[]);
        setTotal(data.total as number);
      } else if (res.status === 401) {
        window.location.href = '/login';
      } else {
        setError(data.error || 'Failed to load expenses');
      }
    } catch (e) {
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(expenseId: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh the expenses list
        fetchExpenses();
      } else if (res.status === 401) {
        window.location.href = '/login';
      } else {
        setError(data.error || 'Failed to delete expense');
      }
    } catch (e) {
      setError('Failed to delete expense');
    }
  }

  useEffect(() => { fetchExpenses(); }, [page, search, category]);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
  }

  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Expenses
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/expenses/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Expense
              </Link>
              <Link
                href="/expenses/import"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Import CSV
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={search}
                  onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                />
              </div>
              <div>
                <select
                  className="block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={category}
                  onChange={(e) => { setPage(1); setCategory(e.target.value); }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading expenses...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">No expenses found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {expenses.map((exp) => (
                    <li key={exp.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">{exp.description}</p>
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(exp.amount)}</p>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{exp.category}</span>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{exp.business_area}</span>
                            <span>•</span>
                            <span>{formatDate(exp.date)}</span>
                            {exp.notes ? (<><span>•</span><span className="truncate">{exp.notes}</span></>) : null}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/expenses/${exp.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Edit expense"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete expense"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


