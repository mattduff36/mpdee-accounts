'use client';

import { useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ImportExpensesPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const file = inputRef.current?.files?.[0];
    if (!file) { setError('Please choose a CSV file'); return; }
    const form = new FormData();
    form.append('file', file);
    setIsUploading(true);
    try {
      const res = await fetch('/api/expenses/import', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/expenses/import/${data.data.import_id}`);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <Navigation />
      <div className="pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Import Expenses from CSV</h1>
          <p className="mt-2 text-sm text-gray-600">Upload a bank statement CSV. We will parse transactions so you can review and add expenses.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white p-6 rounded-md shadow">
            <div>
              <label className="block text-sm font-medium text-gray-700">CSV File</label>
              <input ref={inputRef} type="file" accept=".csv,text/csv" className="mt-1 block w-full" />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center gap-3">
              <button disabled={isUploading} className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                {isUploading ? 'Uploading…' : 'Upload and Parse'}
              </button>
              <Link href="/expenses" className="text-sm text-gray-600 hover:text-gray-900">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


