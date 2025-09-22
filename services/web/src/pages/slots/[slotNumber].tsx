import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useSlot } from '../../hooks/useApi';
import { formatTime, formatNumber } from '../../utils/format';

export default function SlotDetailPage() {
  const router = useRouter();
  const { slotNumber } = router.query;
  const slotNum = parseInt(slotNumber as string, 10);

  const { data: slot, isLoading, error } = useSlot(slotNum);

  if (error) {
    return (
      <Layout>
        <div className="card">
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">Error loading slot</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
            <Link
              href="/slots"
              className="mt-4 inline-block text-primary-600 hover:text-primary-900"
            >
              ← Back to slots
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || !slot) {
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

  const epochNumber = Math.floor(slot.slot_number / 32);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/slots" className="hover:text-gray-700">
              Slots
            </Link>
            <span>›</span>
            <span className="text-gray-900">Slot {slot.slot_number}</span>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900">
            Slot {formatNumber(slot.slot_number)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatTime(slot.timestamp)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    slot.status === 'proposed'
                      ? 'bg-success-100 text-success-800'
                      : 'bg-warning-100 text-warning-800'
                  }`}
                >
                  {slot.status}
                </span>
              </dd>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Epoch</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(epochNumber)}
              </dd>
              <Link
                href={`/epochs/${epochNumber}`}
                className="mt-1 text-sm text-primary-600 hover:text-primary-900"
              >
                View epoch →
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Proposer</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {slot.proposer_index !== null ? formatNumber(slot.proposer_index) : 'None'}
              </dd>
              {slot.proposer_index !== null && (
                <Link
                  href={`/validators/${slot.proposer_index}`}
                  className="mt-1 text-sm text-primary-600 hover:text-primary-900"
                >
                  View validator →
                </Link>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatTime(slot.timestamp)}
              </dd>
            </div>
          </div>

          {slot.graffiti && (
            <div className="card">
              <div className="p-6">
                <dt className="text-sm font-medium text-gray-500">Graffiti</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900 break-all">
                  {slot.graffiti}
                </dd>
              </div>
            </div>
          )}
        </div>

        {slot.block_root && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Block Root</h2>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm break-all">
                {slot.block_root}
              </div>
            </div>
          </div>
        )}

        {slot.parent_root && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Parent Root</h2>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm break-all">
                {slot.parent_root}
              </div>
            </div>
          </div>
        )}

        {slot.state_root && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">State Root</h2>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm break-all">
                {slot.state_root}
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation</h2>
            <div className="flex space-x-4">
              {slotNum > 0 && (
                <Link
                  href={`/slots/${slotNum - 1}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Previous Slot
                </Link>
              )}
              <Link
                href={`/slots/${slotNum + 1}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next Slot →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}