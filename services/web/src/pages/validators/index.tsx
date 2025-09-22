import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ValidatorSearch from '../../components/ValidatorSearch';
import Pagination from '../../components/Pagination';
import { useValidators } from '../../hooks/useApi';
import { formatBalance, formatEffectiveness, formatValidatorStatus, truncateHash } from '../../utils/format';

export default function ValidatorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const { data, isLoading, error } = useValidators(currentPage, itemsPerPage);

  if (error) {
    return (
      <Layout>
        <div className="card">
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">Error loading validators</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Validators</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search and explore beacon chain validators
          </p>
        </div>

        <ValidatorSearch />

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
              No validators found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Index</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Public Key</th>
                    <th className="table-header">Balance</th>
                    <th className="table-header">Effectiveness</th>
                    <th className="table-header">Activation Epoch</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data.map((validator) => {
                    const status = formatValidatorStatus(validator.status);
                    return (
                      <tr key={validator.validator_index} className="hover:bg-gray-50">
                        <td className="table-cell">
                          <Link
                            href={`/validators/${validator.validator_index}`}
                            className="text-primary-600 hover:text-primary-900 font-medium"
                          >
                            {validator.validator_index}
                          </Link>
                        </td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="table-cell">
                          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {truncateHash(validator.pubkey)}
                          </code>
                        </td>
                        <td className="table-cell">
                          {formatBalance(validator.balance)}
                        </td>
                        <td className="table-cell">
                          {formatEffectiveness(validator.effectiveness_rating)}
                        </td>
                        <td className="table-cell">
                          {validator.activation_epoch}
                        </td>
                      </tr>
                    );
                  })}
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