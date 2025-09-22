import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { useSlots } from '../../hooks/useApi';
import { formatTime, formatNumber } from '../../utils/format';

export default function SlotsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const { data, isLoading, error } = useSlots(currentPage, itemsPerPage);

  if (error) {
    return (
      <Layout>
        <div className="card">
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">Error loading slots</div>
            <div className="text-gray-500 text-sm">{error.message}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Slots</h1>
          <p className="mt-1 text-sm text-gray-500">
            Recent beacon chain slots and block proposals
          </p>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No slots found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Slot</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Proposer</th>
                    <th className="table-header">Block Root</th>
                    <th className="table-header">Graffiti</th>
                    <th className="table-header">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data.map((slot) => (
                    <tr key={slot.slot_number} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <Link
                          href={`/slots/${slot.slot_number}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          {formatNumber(slot.slot_number)}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            slot.status === 'proposed'
                              ? 'bg-success-100 text-success-800'
                              : 'bg-warning-100 text-warning-800'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {slot.proposer_index !== null ? (
                          <Link
                            href={`/validators/${slot.proposer_index}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {formatNumber(slot.proposer_index)}
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {slot.block_root ? (
                          <span className="font-mono text-sm">
                            {slot.block_root.slice(0, 16)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {slot.graffiti ? (
                          <span className="text-sm max-w-xs truncate">
                            {slot.graffiti}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          {formatTime(slot.timestamp)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.pagination.pages}
            onPageChange={setCurrentPage}
            totalItems={data.pagination.total}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </Layout>
  );
}