'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'PENDING' | 'ADDED' | 'IGNORED';
}

export default function ReviewImportPage() {
  const params = useParams();
  const router = useRouter();
  const importId = params?.id as string;
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [categoryById, setCategoryById] = useState<Record<string, string>>({});
  const [areaById, setAreaById] = useState<Record<string, 'CREATIVE' | 'DEVELOPMENT' | 'SUPPORT'>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = useMemo(() => ['Office Supplies','Travel','Marketing','Equipment','Software','Utilities','Professional Services','Other'], []);

  async function load() {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/expenses/import/${importId}/transactions`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTransactions(data.data as BankTransaction[]);
      } else {
        setError(data.error || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Load error:', err); // Debug log
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { if (importId) load(); }, [importId]);

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  async function commitSelected() {
    const selections = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => ({
        transaction_id: id,
        category: categoryById[id] || 'Other',
        business_area: areaById[id] || 'CREATIVE',
        notes: notesById[id],
      }));
    if (selections.length === 0) return;
    try {
      const res = await fetch(`/api/expenses/import/${importId}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/expenses');
      } else {
        setError(data.error || 'Failed to add expenses');
      }
    } catch {
      setError('Failed to add expenses');
    }
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Review Imported Transactions</h1>
            <Link href="/expenses" className="text-sm text-gray-600 hover:text-gray-900">Back to Expenses</Link>
          </div>

          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

          {isLoading ? (
            <div className="mt-8">Loading…</div>
          ) : (
            <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pick</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((t) => (
                    <tr key={t.id} className={t.status !== 'PENDING' ? 'opacity-50' : ''}>
                      <td className="px-4 py-2">
                        <input type="checkbox" disabled={t.status !== 'PENDING'} checked={!!selected[t.id]} onChange={() => toggle(t.id)} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{t.description}</td>
                      <td className="px-4 py-2 text-sm text-right tabular-nums">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(t.amount)}</td>
                      <td className="px-4 py-2">
                        <select className="border rounded px-2 py-1 text-sm" value={categoryById[t.id] || ''} onChange={(e) => setCategoryById((m) => ({ ...m, [t.id]: e.target.value }))}>
                          <option value="">Choose…</option>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select className="border rounded px-2 py-1 text-sm" value={areaById[t.id] || ''} onChange={(e) => setAreaById((m) => ({ ...m, [t.id]: e.target.value as any }))}>
                          <option value="">Choose…</option>
                          <option value="CREATIVE">Creative</option>
                          <option value="DEVELOPMENT">Development</option>
                          <option value="SUPPORT">Support</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input className="border rounded px-2 py-1 text-sm w-56" placeholder="Optional notes" value={notesById[t.id] || ''} onChange={(e) => setNotesById((m) => ({ ...m, [t.id]: e.target.value }))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button onClick={commitSelected} className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Add selected as expenses</button>
            <Link href="/expenses" className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</Link>
          </div>
        </div>
      </div>
    </>
  );
}


