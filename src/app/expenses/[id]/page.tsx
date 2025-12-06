'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    business_area: 'CREATIVE',
    receipt_url: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Office Supplies','Travel','Marketing','Equipment','Software','Utilities','Professional Services','Other'
  ];

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/expenses/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.success) {
          const e = data.data;
          setFormData({
            description: e.description || '',
            amount: String(e.amount ?? ''),
            category: e.category || '',
            date: e.date ? new Date(e.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            receipt_url: e.receipt_url || '',
            business_area: e.business_area || 'CREATIVE',
            notes: e.notes || '',
          });
        } else if (res.status === 401) {
          router.push('/login');
          return;
        } else {
          setError(data.error || 'Failed to load expense');
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (id) load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount || '0'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/expenses');
      } else {
        setError(data.error || 'Failed to update expense');
      }
    } catch (e) {
      setError('Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this expense?')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success ?? true)) {
        router.push('/expenses');
      } else {
        setError(data.error || 'Failed to delete expense');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="pt-20 pb-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Edit Expense</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6 bg-white p-6 rounded-lg shadow">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (£) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date *</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Area *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.business_area}
                  onChange={(e) => setFormData((p) => ({ ...p, business_area: e.target.value }))}
                >
                  <option value="CREATIVE">Creative</option>
                  <option value="DEVELOPMENT">Development</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Receipt URL</label>
              <input
                type="url"
                placeholder="https://..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.receipt_url}
                onChange={(e) => setFormData((p) => ({ ...p, receipt_url: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/expenses')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


