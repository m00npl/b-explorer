import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useValidator, useValidatorPerformance } from '../../hooks/useApi';
import { formatTime, formatNumber, formatEffectiveness } from '../../utils/format';

export default function ValidatorDetailPage() {
  const router = useRouter();
  const { validatorIndex } = router.query;
  const validatorIdx = parseInt(validatorIndex as string, 10);

  const { data: validator, isLoading: validatorLoading, error: validatorError } = useValidator(validatorIdx);
  const { data: performance, isLoading: performanceLoading, error: performanceError } = useValidatorPerformance(validatorIdx);

  if (validatorError) {
    return (
      <Layout>
        <div className="card">
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">Error loading validator</div>
            <div className="text-gray-500 text-sm">{validatorError.message}</div>
            <Link
              href="/validators"
              className="mt-4 inline-block text-primary-600 hover:text-primary-900"
            >
              ← Back to validators
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (validatorLoading || !validator) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active_ongoing':
        return 'bg-success-100 text-success-800';
      case 'active_exiting':
        return 'bg-warning-100 text-warning-800';
      case 'active_slashed':
        return 'bg-error-100 text-error-800';
      case 'exit_unslashed':
        return 'bg-gray-100 text-gray-800';
      case 'exit_slashed':
        return 'bg-error-100 text-error-800';
      case 'withdrawal_possible':
        return 'bg-blue-100 text-blue-800';
      case 'withdrawal_done':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/validators" className="hover:text-gray-700">
              Validators
            </Link>
            <span>›</span>
            <span className="text-gray-900">Validator {validator.validator_index}</span>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900">
            Validator {validator.validator_index}
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-mono break-all">
            {validator.pubkey}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(validator.status)}`}>
                  {validator.status.replace('_', ' ')}
                </span>
              </dd>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Balance</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(validator.balance)} ETH
              </dd>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Effective Balance</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatNumber(validator.effective_balance)} ETH
              </dd>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Activation Epoch</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {validator.activation_epoch === 0 ? 'Genesis' : formatNumber(validator.activation_epoch)}
              </dd>
              {validator.activation_epoch > 0 && (
                <Link
                  href={`/epochs/${validator.activation_epoch}`}
                  className="mt-1 text-sm text-primary-600 hover:text-primary-900"
                >
                  View epoch →
                </Link>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Exit Epoch</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {validator.exit_epoch === 0 || validator.exit_epoch > 9999999 ? 'Not set' : formatNumber(validator.exit_epoch)}
              </dd>
              {validator.exit_epoch > 0 && validator.exit_epoch <= 9999999 && (
                <Link
                  href={`/epochs/${validator.exit_epoch}`}
                  className="mt-1 text-sm text-primary-600 hover:text-primary-900"
                >
                  View epoch →
                </Link>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <dt className="text-sm font-medium text-gray-500">Effectiveness Rating</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {formatEffectiveness(validator.effectiveness_rating)}
              </dd>
            </div>
          </div>

          {validator.last_attestation_slot && (
            <div className="card">
              <div className="p-6">
                <dt className="text-sm font-medium text-gray-500">Last Attestation</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  Slot {formatNumber(validator.last_attestation_slot)}
                </dd>
                <Link
                  href={`/slots/${validator.last_attestation_slot}`}
                  className="mt-1 text-sm text-primary-600 hover:text-primary-900"
                >
                  View slot →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Withdrawal Credentials</h2>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm break-all">
              {validator.withdrawal_credentials}
            </div>
          </div>
        </div>

        {performanceError && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
              <div className="text-orange-600 text-sm">
                Performance data not available: {performanceError.message}
              </div>
            </div>
          </div>
        )}

        {performanceLoading && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {performance && (
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Performance</h2>
              {performance.recent_performance && performance.recent_performance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Epoch
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Attestations
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Expected
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Blocks Proposed
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Effectiveness
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performance.recent_performance.map((perf) => (
                        <tr key={perf.epoch}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <Link
                              href={`/epochs/${perf.epoch}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              {formatNumber(perf.epoch)}
                            </Link>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatNumber(perf.attestations_made)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatNumber(perf.attestations_expected)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatNumber(perf.blocks_proposed)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatEffectiveness(perf.effectiveness)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">No recent performance data available</div>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation</h2>
            <div className="flex space-x-4">
              {validatorIdx > 0 && (
                <Link
                  href={`/validators/${validatorIdx - 1}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Previous Validator
                </Link>
              )}
              <Link
                href={`/validators/${validatorIdx + 1}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next Validator →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}