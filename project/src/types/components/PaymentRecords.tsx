import React, { useState } from 'react';
import { Payment } from '../types';
import { IndianRupee, Filter, X, RefreshCw } from 'lucide-react';
import { Pagination } from './Pagination';
import { usePagination } from '../hooks/usePagination';

interface PaymentRecordsProps {
  payments: Payment[];
  onApprovePayment: (prn: string) => void;
  onViewStudent: (prn: string) => void;
}

export function PaymentRecords({ payments, onApprovePayment, onViewStudent }: PaymentRecordsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    batch: [] as string[],
    date: '',
    pendingAmount: false,
    status: 'all' as 'all' | 'approved' | 'not_approved'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // Format date function
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const filteredPayments = payments.filter(payment => {
    if (!hasAppliedFilters) return false;

    // Batch filter
    if (filters.batch.length > 0) {
      const prn = payment.prn;
      const batch = prn.substring(0, 2);
      if (!filters.batch.includes(batch)) return false;
    }

    // Date filter
    if (filters.date && formatDate(payment.lastPaymentDate) !== filters.date) {
      return false;
    }

    // Pending amount filter
    if (filters.pendingAmount && payment.pendingAmount <= 1000) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all') {
      const isApproved = payment.pendingAmount === 0;
      if (filters.status === 'approved' && !isApproved) return false;
      if (filters.status === 'not_approved' && isApproved) return false;
    }

    return true;
  });

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedPayments,
    setCurrentPage
  } = usePagination(filteredPayments, { itemsPerPage: 5 });

  const clearFilters = () => {
    setFilters({
      batch: [],
      date: '',
      pendingAmount: false,
      status: 'all'
    });
    setHasAppliedFilters(false);
  };

  const handleApplyFilters = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setHasAppliedFilters(true);
      setIsLoading(false);
    }, 500);
  };

  const hasActiveFilters = filters.batch.length > 0 || filters.date || filters.pendingAmount || filters.status !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 lg:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Payment Records</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <select
                  multiple
                  value={filters.batch}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, batch: values }));
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="22">Senior Batch (22)</option>
                  <option value="23">Junior Batch (23)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: formatDate(e.target.value) }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pending Amount</label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={filters.pendingAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, pendingAmount: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Above ₹1000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'approved' | 'not_approved' }))}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="not_approved">Not Approved</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          ) : !hasAppliedFilters ? (
            <div className="text-center py-8">
              <Filter className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Apply filters to view payment records</p>
              <p className="text-sm text-gray-400">Use the filters above to search for specific records</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No records found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">PRN</th>
                    <th className="px-4 py-2 text-right">Total Amount</th>
                    <th className="px-4 py-2 text-right">Pending Amount</th>
                    <th className="px-4 py-2 text-left">Last Payment</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.prn} className="border-t">
                      <td className="px-4 py-2">
                        <button
                          onClick={() => onViewStudent(payment.prn)}
                          className="text-blue-600 hover:underline"
                        >
                          {payment.prn}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-right">₹{payment.totalAmount}</td>
                      <td className="px-4 py-2 text-right text-red-600">
                        ₹{payment.pendingAmount}
                      </td>
                      <td className="px-4 py-2">{formatDate(payment.lastPaymentDate)}</td>
                      <td className="px-4 py-2">
                        {payment.pendingAmount > 0 && (
                          <button
                            onClick={() => onApprovePayment(payment.prn)}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            <IndianRupee className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}