import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { useEpochs } from '../../hooks/useApi';
import { formatTime, formatNumber, formatEffectiveness } from '../../utils/format';

export default function EpochsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const { data, isLoading, error } = useEpochs(currentPage, itemsPerPage);

  if (error) {
    return (
      <Layout>
        <div className="card">
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">Error loading epochs</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Epochs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Historical view of beacon chain epochs
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
              No epochs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Epoch</th>
                    <th className="table-header">Slots</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Active Validators</th>
                    <th className="table-header">Total Validators</th>
                    <th className="table-header">Avg Effectiveness</th>
                    <th className="table-header">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data.map((epoch) => (
                    <tr key={epoch.epoch_number} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <Link
                          href={`/epochs/${epoch.epoch_number}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          {epoch.epoch_number}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-600">
                          {epoch.start_slot} - {epoch.end_slot}
                        </span>
                      </td>
                      <td className="table-cell">
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
                      </td>
                      <td className="table-cell">
                        {formatNumber(epoch.active_validators)}
                      </td>
                      <td className="table-cell">
                        {formatNumber(epoch.total_validators)}
                      </td>
                      <td className="table-cell">
                        {formatEffectiveness(epoch.avg_effectiveness)}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          {formatTime(epoch.timestamp)}
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