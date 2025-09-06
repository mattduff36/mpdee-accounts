'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const iconColor = type === 'success' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
      
      {/* Message Box */}
      <div className={`relative max-w-md w-full ${bgColor} border ${borderColor} rounded-lg shadow-xl pointer-events-auto animate-modal-fade-in`}>
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {type === 'success' ? (
                <CheckCircleIcon className={`h-8 w-8 ${iconColor}`} />
              ) : (
                <XCircleIcon className={`h-8 w-8 ${iconColor}`} />
              )}
            </div>
            <div className="ml-4 flex-1">
              <p className={`text-base font-medium ${textColor}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                className={`rounded-md inline-flex ${textColor} hover:${textColor.replace('800', '600')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'success' ? 'green' : 'red'}-500`}
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
