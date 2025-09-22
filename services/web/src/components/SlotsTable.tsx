import React from 'react';
import Link from 'next/link';
import { SlotData } from '../types/api';
import { formatTime, formatTimeAgo, formatSlotStatus, truncateHash } from '../utils/format';

interface SlotsTableProps {
  slots: SlotData[];
  loading?: boolean;
}

const SlotsTable: React.FC<SlotsTableProps> = ({ slots, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="card">
        <div className="p-6 text-center text-gray-500">
          No slots found
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Slot</th>
              <th className="table-header">Status</th>
              <th className="table-header">Proposer</th>
              <th className="table-header">Block Root</th>
              <th className="table-header">Time</th>
              <th className="table-header">Graffiti</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {slots.map((slot) => {
              const status = formatSlotStatus(slot.status);
              return (
                <tr key={slot.slot_number} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <Link
                      href={`/slots/${slot.slot_number}`}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      {slot.slot_number}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    {slot.proposer_index !== null ? (
                      <Link
                        href={`/validators/${slot.proposer_index}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {slot.proposer_index}
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {slot.block_root ? (
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {truncateHash(slot.block_root)}
                      </code>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="text-sm">
                      <div>{formatTime(slot.timestamp)}</div>
                      <div className="text-gray-500 text-xs">
                        {formatTimeAgo(slot.timestamp)}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {slot.graffiti ? (
                      <span className="text-xs text-gray-600 max-w-xs truncate">
                        {slot.graffiti}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlotsTable;