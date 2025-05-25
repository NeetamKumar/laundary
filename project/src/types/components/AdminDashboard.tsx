import React, { useState, useMemo } from 'react';
import { Users, IndianRupee, Shirt, AlertCircle, Download, Filter, X, Save, RefreshCw } from 'lucide-react';
import { Payment, Student, LaundryEntry } from '../types';
import { Pagination } from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { useLaundryStore } from '../store/laundryStore';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const DashboardCard = ({ title, value, icon, color, subtitle }: DashboardCardProps) => (
  <div className={`${color} p-6 rounded-lg shadow-md`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-medium">{title}</p>
        <p className="text-white text-2xl font-bold mt-2">{value}</p>
        {subtitle && (
          <p className="text-white/80 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      <div className="text-white/80">{icon}</div>
    </div>
  </div>
);

interface MonthlyReport {
  year: number;
  month: string;
  reportDate: string;
  fileUrl: string;
}

const mockReports: MonthlyReport[] = [
  {
    year: 2024,
    month: 'March',
    reportDate: '31-03-2024',
    fileUrl: '#'
  },
  {
    year: 2024,
    month: 'February',
    reportDate: '29-02-2024',
    fileUrl: '#'
  },
  {
    year: 2024,
    month: 'January',
    reportDate: '31-01-2024',
    fileUrl: '#'
  }
];

interface AdminDashboardProps {
  students: Student[];
  payments: Payment[];
  laundryEntries: LaundryEntry[];
  onViewStudent: (prn: string) => void;
  onApprovePayment: (prn: string) => void;
}

interface PackageApprovalModalProps {
  students: Student[];
  payments: Payment[];
  onClose: () => void;
  onApprovePayment: (prn: string) => void;
}

interface GroupedLaundryEntry {
  date: string;
  entries: LaundryEntry[];
  totalQuantity: number;
  totalAmount: number;
  status: 'pending' | 'washed';
}

const PackageApprovalModal = ({ students, payments, onClose, onApprovePayment }: PackageApprovalModalProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    batch: [] as string[],
    package: [] as string[],
    date: '',
    status: 'all' as 'all' | 'approved' | 'not_approved'
  });
  const [approvedPayments, setApprovedPayments] = useState<string[]>([]);

  const clearFilters = () => {
    setFilters({
      batch: [],
      package: [],
      date: '',
      status: 'all'
    });
  };

  const getBatchFromPRN = (prn: string) => {
    return prn.startsWith('22') ? 'Senior Batch' : 'Junior Batch';
  };

  const filteredStudents = students.filter(student => {
    if (filters.batch.length > 0) {
      const batch = getBatchFromPRN(student.prn);
      if (!filters.batch.includes(batch)) return false;
    }

    if (filters.package.length > 0) {
      if (!student.package || !filters.package.includes(student.package.type)) return false;
    }

    const payment = payments.find(p => p.prn === student.prn);
    if (filters.date && payment) {
      if (payment.lastPaymentDate !== filters.date) return false;
    }

    if (filters.status !== 'all') {
      const payment = payments.find(p => p.prn === student.prn);
      const isApproved = payment ? payment.pendingAmount === 0 : false;
      if (filters.status === 'approved' && !isApproved) return false;
      if (filters.status === 'not_approved' && isApproved) return false;
    }

    return true;
  });

  const handleSaveChanges = () => {
    approvedPayments.forEach(prn => {
      onApprovePayment(prn);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Package Payment Approval</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
            
            {(filters.batch.length > 0 || filters.package.length > 0 || filters.date || filters.status !== 'all') && (
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
                    <option value="Senior Batch">Senior Batch</option>
                    <option value="Junior Batch">Junior Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                  <select
                    multiple
                    value={filters.package}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, package: values }));
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="40pcs">40 Pieces</option>
                    <option value="60pcs">60 Pieces</option>
                    <option value="75pcs">75 Pieces</option>
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
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'approved' | 'not_approved' }))}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="not_approved">Not Approved</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">PRN</th>
                <th className="px-4 py-2 text-left">Student Name</th>
                <th className="px-4 py-2 text-left">Batch</th>
                <th className="px-4 py-2 text-left">Package</th>
                <th className="px-4 py-2 text-right">Payment Amount</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const payment = payments.find(p => p.prn === student.prn);
                const isApproved = approvedPayments.includes(student.prn);
                const isPending = payment && payment.pendingAmount > 0;

                return (
                  <tr key={student.prn} className="border-t">
                    <td className="px-4 py-2">{student.prn}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{getBatchFromPRN(student.prn)}</td>
                    <td className="px-4 py-2">{student.package?.type || 'No Package'}</td>
                    <td className="px-4 py-2 text-right">
                      ₹{payment?.pendingAmount || 0}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {isPending && !isApproved ? (
                        <button
                          onClick={() => setApprovedPayments([...approvedPayments, student.prn])}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-green-600">
                          {isApproved ? 'Approved' : 'No Payment Due'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {approvedPayments.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export function AdminDashboard({
  students,
  payments,
  laundryEntries,
  onViewStudent,
  onApprovePayment,
}: AdminDashboardProps) {
  const [showPackageApproval, setShowPackageApproval] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format date function
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Group laundry entries by date
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, GroupedLaundryEntry>();
    
    laundryEntries.forEach(entry => {
      const date = entry.date;
      
      if (!groups.has(date)) {
        groups.set(date, {
          date,
          entries: [],
          totalQuantity: 0,
          totalAmount: 0,
          status: 'washed'
        });
      }
      
      const group = groups.get(date)!;
      group.entries.push(entry);
      group.totalQuantity += entry.items.reduce((sum, item) => sum + item.quantity, 0);
      group.totalAmount += entry.totalAmount;
      
      if (entry.items.some(item => item.status === 'Pending')) {
        group.status = 'pending';
      }
    });

    return Array.from(groups.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [laundryEntries]);

  // Calculate summary data
  const totalStudents = students.length;
  const seniorBatchStudents = students.filter(s => s.prn.startsWith('22')).length;
  const juniorBatchStudents = students.filter(s => s.prn.startsWith('23')).length;
  const studentsWithPackage = students.filter(s => s.package).length;
  
  const totalPayments = payments.reduce((sum, p) => sum + (p.totalAmount - p.pendingAmount), 0);
  const pendingPayments = payments.reduce((sum, p) => sum + p.pendingAmount, 0);
  
  const pendingLaundry = groupedEntries.reduce((sum, group) => 
    group.status === 'pending' ? sum + 1 : sum, 0
  );

  const handleApprovePayment = async (prn: string) => {
    try {
      setLoading(true);
      await onApprovePayment(prn);
    } catch (error) {
      console.error('Error approving payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Students"
          value={totalStudents}
          subtitle={`${seniorBatchStudents} senior, ${juniorBatchStudents} junior`}
          icon={<Users size={24} />}
          color="bg-blue-600"
        />
        <DashboardCard
          title="Package Subscriptions"
          value={studentsWithPackage}
          subtitle={`${((studentsWithPackage / totalStudents) * 100).toFixed(1)}% enrolled`}
          icon={<Shirt size={24} />}
          color="bg-green-600"
        />
        <DashboardCard
          title="Total Payments"
          value={`₹${totalPayments}`}
          subtitle={`₹${pendingPayments} pending`}
          icon={<IndianRupee size={24} />}
          color="bg-purple-600"
        />
        <DashboardCard
          title="Pending Laundry"
          value={pendingLaundry}
          subtitle="Orders to process"
          icon={<AlertCircle size={24} />}
          color="bg-yellow-600"
        />
      </div>

      {/* Monthly Reports */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 lg:p-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-4">Monthly Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Year</th>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-left">Report Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockReports.map((report) => (
                  <tr key={`${report.year}-${report.month}`} className="border-t">
                    <td className="px-4 py-2">{report.year}</td>
                    <td className="px-4 py-2">{report.month}</td>
                    <td className="px-4 py-2">{report.reportDate}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => window.open(report.fileUrl, '_blank')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Laundry Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 lg:p-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-4">Recent Laundry Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Total Items</th>
                  <th className="px-4 py-2 text-right">Total Amount</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {groupedEntries.map((group) => (
                  <tr key={group.date} className="border-t">
                    <td className="px-4 py-2">{formatDate(group.date)}</td>
                    <td className="px-4 py-2 text-right">{group.totalQuantity}</td>
                    <td className="px-4 py-2 text-right">₹{group.totalAmount}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        group.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {group.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Package Approval Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowPackageApproval(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <IndianRupee className="h-5 w-5" />
          Package Payment Approval
        </button>
      </div>

      {/* Package Approval Modal */}
      {showPackageApproval && (
        <PackageApprovalModal
          students={students}
          payments={payments}
          onClose={() => setShowPackageApproval(false)}
          onApprovePayment={handleApprovePayment}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}