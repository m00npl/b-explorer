import React, { useState } from 'react';
import Layout from '../components/Layout';
import SlotsTable from '../components/SlotsTable';
import Pagination from '../components/Pagination';
import { useSlots } from '../hooks/useApi';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

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
          <h1 className="text-2xl font-bold text-gray-900">Latest Slots</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time view of the latest beacon chain slots
          </p>
        </div>

        <SlotsTable slots={data?.data || []} loading={isLoading} />

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