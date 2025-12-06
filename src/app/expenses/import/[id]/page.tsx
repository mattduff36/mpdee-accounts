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
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

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

  function toggleAll() {
    const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
    const allSelected = pendingTransactions.every(t => selected[t.id]);
    
    if (allSelected) {
      // Deselect all
      setSelected({});
    } else {
      // Select all pending transactions
      const newSelected: Record<string, boolean> = {};
      pendingTransactions.forEach(t => {
        newSelected[t.id] = true;
      });
      setSelected(newSelected);
    }
  }

  async function categorizeWithAI() {
    const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
    if (pendingTransactions.length === 0) {
      setError('No pending transactions to categorize');
      return;
    }

    setIsAiProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/expenses/ai-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: pendingTransactions.map(t => ({
            id: t.id,
            description: t.description,
            amount: t.amount
          })),
                     prompt: aiPrompt,
           categories
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
                 // Update the category mappings with AI suggestions
         const newCategoryById = { ...categoryById };

         data.data.forEach((suggestion: any) => {
           if (suggestion.category) {
             newCategoryById[suggestion.id] = suggestion.category;
           }
         });

         setCategoryById(newCategoryById);
      } else {
        setError(data.error || 'Failed to categorize with AI');
      }
    } catch (err) {
      console.error('AI categorization error:', err);
      setError('Failed to categorize with AI');
    } finally {
      setIsAiProcessing(false);
    }
  }

  async function commitSelected() {
    const selections = Object.entries(selected)
      .filter(([, v]) => v)
             .map(([id]) => ({
         transaction_id: id,
         category: categoryById[id] || 'Other',
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
      <div className="pt-4 pb-24 sm:pt-20 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Review Imported Transactions</h1>
            <Link href="/expenses" className="text-sm text-gray-600 hover:text-gray-900">Back to Expenses</Link>
          </div>

          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

          {/* AI Categorization Section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-blue-900">AI-Powered Categorization</h3>
              <button
                onClick={categorizeWithAI}
                disabled={isAiProcessing || transactions.filter(t => t.status === 'PENDING').length === 0}
                className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isAiProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Auto-Categorize Transactions'
                )}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="ai-prompt" className="block text-sm font-medium text-blue-800 mb-1">
                  Custom Instructions (Optional)
                </label>
                <input
                  id="ai-prompt"
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Make all transactions containing 'Cursor' a software expense for the 'Development' Area"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-blue-700">
                The AI will analyze transaction descriptions and automatically assign categories and business areas. 
                Use the custom instructions to provide specific guidance for your business context.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8">Loading…</div>
          ) : (
            <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        checked={transactions.filter(t => t.status === 'PENDING').every(t => selected[t.id]) && transactions.filter(t => t.status === 'PENDING').length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
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
                                             <td className="px-4 py-2 text-sm text-right tabular-nums w-32">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(t.amount)}</td>
                      <td className="px-4 py-2">
                        <select className="border rounded px-2 py-1 text-sm" value={categoryById[t.id] || ''} onChange={(e) => setCategoryById((m) => ({ ...m, [t.id]: e.target.value }))}>
                          <option value="">Choose…</option>
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      
                                             <td className="px-4 py-2">
                         <input className="border rounded px-2 py-1 text-sm w-32" placeholder="Optional notes" value={notesById[t.id] || ''} onChange={(e) => setNotesById((m) => ({ ...m, [t.id]: e.target.value }))} />
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


