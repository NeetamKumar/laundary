import React, { useState, useMemo, useCallback } from 'react';
import { LaundryEntry, StatusFilter, Student } from '../types';
import { Filter, Save, X, ChevronDown, Search, User, Phone, Home, RefreshCw } from 'lucide-react';
import { predefinedItems } from '../lib/mockData';
import { Pagination } from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { useLaundryStore } from '../store/laundryStore';

interface WashingChecklistProps {
  entries: LaundryEntry[];
  students: Student[];
  onUpdateStatus: (entryId: string, itemId: string, status: 'Washed' | 'Pending') => void;
  onViewStudent: (prn: string) => void;
}

interface ItemSummary {
  name: string;
  total: number;
  washed: number;
  pending: number;
  itemId: string;
  entryId: string;
  quantity: number;
}

export function WashingChecklist({ 
  entries: initialEntries,
  students, 
  onUpdateStatus, 
  onViewStudent 
}: WashingChecklistProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    batch: [] as string[],
    date: '',
    status: 'all' as StatusFilter
  });
  const [modal, setModal] = useState({ prn: '', isOpen: false });
  const [washedCounts, setWashedCounts] = useState<Record<string, number>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  const { entries, updateBatchStatus } = useLaundryStore();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const filteredEntries = useMemo(() => {
    if (!hasAppliedFilters) return [];

    return entries.filter(entry => {
      const student = students.find(s => s.prn === entry.prn);
      if (!student) return false;

      if (searchTerm && !entry.prn.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (filters.batch.length > 0) {
        const batch = student.prn.substring(0, 2);
        if (!filters.batch.includes(batch)) return false;
      }

      if (filters.date) {
        const entryDate = formatDate(entry.date);
        if (entryDate !== filters.date) return false;
      }

      if (filters.status !== 'all') {
        const hasMatchingStatus = entry.items.some(item => 
          filters.status === 'pending' ? item.status === 'Pending' : item.status === 'Washed'
        );
        if (!hasMatchingStatus) return false;
      }

      return true;
    });
  }, [entries, students, filters, searchTerm, hasAppliedFilters]);

  const summaryData = useMemo(() => {
    const summary = new Map();
    
    filteredEntries.forEach(entry => {
      const existing = summary.get(entry.prn) || {
        totalClothes: 0,
        pendingClothes: 0,
        washedClothes: 0,
        lastEntryDate: entry.date
      };

      if (new Date(entry.date) > new Date(existing.lastEntryDate)) {
        existing.lastEntryDate = entry.date;
      }

      entry.items.forEach(item => {
        // Add to total clothes based on quantity
        existing.totalClothes += item.quantity;
        
        // Calculate washed and pending based on quantity
        if (item.status === 'Pending') {
          existing.pendingClothes += item.quantity;
        } else {
          existing.washedClothes += item.quantity;
        }
      });

      summary.set(entry.prn, existing);
    });

    return summary;
  }, [filteredEntries]);

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedEntries,
    setCurrentPage
  } = usePagination(Array.from(summaryData.entries()), { itemsPerPage: 5 });

  const selectedStudentDetails = useMemo(() => {
    if (!modal.isOpen) return null;
    
    const student = students.find(s => s.prn === modal.prn);
    if (!student) return null;

    const studentEntries = filteredEntries.filter(e => e.prn === modal.prn);
    const clothesSummary = new Map<string, ItemSummary>();

    studentEntries.forEach(entry => {
      entry.items.forEach(item => {
        const itemDetails = predefinedItems.find(i => i.id === item.itemId);
        if (!itemDetails) return;

        const existing = clothesSummary.get(item.itemId) || {
          name: itemDetails.name,
          total: 0,
          washed: 0,
          pending: 0,
          itemId: item.itemId,
          entryId: entry.id,
          quantity: item.quantity
        };

        existing.total += item.quantity;
        if (item.status === 'Washed') {
          existing.washed += item.quantity;
        } else {
          existing.pending += item.quantity;
        }

        clothesSummary.set(item.itemId, existing);
      });
    });

    return {
      student,
      clothesSummary: Array.from(clothesSummary.values())
    };
  }, [modal, students, filteredEntries]);

  const handleWashedCountChange = useCallback((itemId: string, value: number, total: number) => {
    const newValue = Math.min(Math.max(0, value), total);
    setWashedCounts(prev => ({
      ...prev,
      [itemId]: newValue
    }));
  }, []);

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);

      const updates = Object.entries(washedCounts).map(([itemId, washedCount]) => {
        const entry = filteredEntries.find(e => e.prn === modal.prn);
        if (!entry) return null;

        const item = entry.items.find(i => i.itemId === itemId);
        if (!item) return null;

        return {
          entryId: entry.id,
          itemId: itemId,
          status: washedCount >= item.quantity ? 'Washed' : 'Pending',
          quantity: washedCount
        };
      }).filter((update): update is NonNullable<typeof update> => update !== null);

      updateBatchStatus(updates);

      await Promise.all(
        updates.map(update => onUpdateStatus(update.entryId, update.itemId, update.status))
      );

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setModal({ prn: '', isOpen: false });
        setWashedCounts({});
      }, 1500);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingCount = useCallback((itemId: string, total: number) => {
    const washedCount = washedCounts[itemId] ?? 0;
    return Math.max(0, total - washedCount);
  }, [washedCounts]);

  const clearFilters = () => {
    setFilters({
      batch: [],
      date: '',
      status: 'all'
    });
    setSearchTerm('');
    setHasAppliedFilters(false);
  };

  const handleApplyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHasAppliedFilters(true);
      setIsLoading(false);
    }, 500);
  };

  const hasActiveFilters = filters.batch.length > 0 || filters.date || filters.status !== 'all' || searchTerm;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PRN..."
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
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

          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="23">Batch 2023</option>
                    <option value="24">Batch 2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as StatusFilter }))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="washed">Washed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Filter className="h-5 w-5" />
                      <span>Apply Filters</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          ) : !hasAppliedFilters ? (
            <div className="text-center py-8">
              <Filter className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Apply filters to view laundry entries</p>
              <p className="text-sm text-gray-400">Use the filters above to search for specific entries</p>
            </div>
          ) : summaryData.size === 0 ? (
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
                    <th className="px-4 py-2 text-left">Last Entry Date</th>
                    <th className="px-4 py-2 text-right">Total Clothes</th>
                    <th className="px-4 py-2 text-right">Pending</th>
                    <th className="px-4 py-2 text-right">Washed</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map(([prn, data]) => (
                    <tr key={prn} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <button
                          onClick={() => onViewStudent(prn)}
                          className="text-blue-600 hover:underline"
                        >
                          {prn}
                        </button>
                      </td>
                      <td className="px-4 py-2">{formatDate(data.lastEntryDate)}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => setModal({ prn, isOpen: true })}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {data.totalClothes}
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-4 py-2 text-right text-red-600">
                        {data.pendingClothes}
                      </td>
                      <td className="px-4 py-2 text-right text-green-600">
                        {data.washedClothes}
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

      {modal.isOpen && selectedStudentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedStudentDetails.student.name}</h2>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>PRN: {selectedStudentDetails.student.prn}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{selectedStudentDetails.student.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home className="h-4 w-4" />
                      <span>Room: {selectedStudentDetails.student.room}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModal({ prn: '', isOpen: false });
                    setWashedCounts({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {showSuccessMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
                Changes saved successfully!
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-right">Washed</th>
                    <th className="px-4 py-2 text-right">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentDetails.clothesSummary.map((item) => {
                    const currentWashed = washedCounts[item.itemId] ?? item.washed;
                    const pendingCount = getPendingCount(item.itemId, item.total);

                    return (
                      <tr key={item.itemId} className="border-t">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2 text-right">{item.total}</td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            value={currentWashed}
                            onChange={(e) => handleWashedCountChange(
                              item.itemId,
                              parseInt(e.target.value) || 0,
                              item.total
                            )}
                            className="w-20 text-right border rounded p-1"
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-red-600">
                          {pendingCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {Object.keys(washedCounts).length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}