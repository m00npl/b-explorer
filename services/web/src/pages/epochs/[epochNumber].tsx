import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useEpoch } from '../../hooks/useApi';
import { formatTime, formatNumber, formatEffectiveness } from '../../utils/format';

export default function EpochDetailPage() {
  const router = useRouter();
  const { epochNumber } = router.query;
  const epochNum = parseInt(epochNumber as string, 10);

  const { data: epoch, isLoading, error } = useEpoch(epochNum);

  if (error) {
    return (
      <Layout>
        <div className="card">
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">Error loading epoch</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
            <Link
              href="/epochs"
              className="mt-4 inline-block text-primary-600 hover:text-primary-900"
            >
              ← Back to epochs
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || !epoch) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="card">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/epochs" className="hover:text-gray-700">
              Epochs
            </Link>
            <span>›</span>
            <span className="text-gray-900">Epoch {epoch.epoch_number}</span>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900">
            Epoch {epoch.epoch_number}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatTime(epoch.timestamp)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Slot Range</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(epoch.start_slot)} - {formatNumber(epoch.end_slot)}
              </dd>
              <div className="mt-2 text-sm text-gray-500">
                32 slots per epoch
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <div className="flex space-x-2">
                  {epoch.finalized && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Finalized
                    </span>
                  )}
                  {epoch.justified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Justified
                    </span>
                  )}
                  {!epoch.finalized && !epoch.justified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Pending
                    </span>
                  )}
                </div>
              </dd>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Active Validators</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(epoch.active_validators)}
              </dd>
              <div className="mt-1 text-sm text-gray-500">
                of {formatNumber(epoch.total_validators)} total
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Total Balance</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(epoch.total_balance)} ETH
              </dd>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Average Effectiveness</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatEffectiveness(epoch.avg_effectiveness)}
              </dd>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatTime(epoch.timestamp)}
              </dd>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation</h2>
            <div className="flex space-x-4">
              {epochNum > 0 && (
                <Link
                  href={`/epochs/${epochNum - 1}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Previous Epoch
                </Link>
              )}
              <Link
                href={`/epochs/${epochNum + 1}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next Epoch →
              </Link>
              <Link
                href={`/slots?epoch=${epochNum}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                View Slots in this Epoch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}