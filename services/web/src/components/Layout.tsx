import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStats, useHealth } from '../hooks/useApi';
import { formatNumber } from '../utils/format';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: stats } = useStats();
  const { data: health } = useHealth();

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary-600">
                  Beacon Explorer
                </span>
              </Link>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Latest Slots
                </Link>

                <Link
                  href="/validators"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/validators')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Validators
                </Link>

                <Link
                  href="/epochs"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/epochs')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Epochs
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {health && (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  health.status === 'ok'
                    ? 'bg-success-100 text-success-800'
                    : 'bg-error-100 text-error-800'
                }`}>
                  {health.status === 'ok' ? '● Online' : '● Offline'}
                </div>
              )}

              {stats && (
                <div className="text-sm text-gray-500">
                  Slot {formatNumber(stats.latest_slot)}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {stats && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.latest_slot)}
                </div>
                <div className="text-sm text-gray-500">Latest Slot</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.latest_epoch)}
                </div>
                <div className="text-sm text-gray-500">Latest Epoch</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.active_validators)}
                </div>
                <div className="text-sm text-gray-500">Active Validators</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.total_validators)}
                </div>
                <div className="text-sm text-gray-500">Total Validators</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;