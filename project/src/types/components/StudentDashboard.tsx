import React, { useState, useMemo } from 'react';
import { Package, Shirt, CreditCard, Clock, ChevronDown, X, Info, LogOut, FileText, Camera } from 'lucide-react';
import { Student, LaundryEntry, Payment } from '../types';
import { predefinedItems } from '../data/mockData';
import { ImageUpload } from './ImageUpload';
import { ProfilePicture } from './ProfilePicture';

interface StudentDashboardProps {
  student: Student;
  laundryEntries: LaundryEntry[];
  payment: Payment;
  onLogout: () => void;
  onUpdateProfile?: (profilePicture: string) => void;
}

interface ItemDetailsModalProps {
  items: {
    itemId: string;
    quantity: number;
    status: 'Pending' | 'Washed';
  }[];
  onClose: () => void;
}

const ItemDetailsModal = ({ items, onClose }: ItemDetailsModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Item Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left">CLOTH NAME</th>
            <th className="px-4 py-2 text-center">TOTAL QUANTITY</th>
            <th className="px-4 py-2 text-center">WASHED QUANTITY</th>
            <th className="px-4 py-2 text-center">PENDING QUANTITY</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const itemDetails = predefinedItems.find(i => i.id === item.itemId);
            const washedQuantity = item.washedQuantity ?? (item.status === 'Washed' ? item.quantity : 0);
            const pendingQuantity = item.quantity - washedQuantity;
            return (
              <tr key={item.itemId} className="border-t">
                <td className="px-4 py-2">{itemDetails?.name}</td>
                <td className="px-4 py-2 text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-center">{washedQuantity}</td>
                <td className="px-4 py-2 text-center">{pendingQuantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

interface TermsModalProps {
  onClose: () => void;
}

const TermsModal = ({ onClose }: TermsModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Terms and Conditions</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>
      <ul className="space-y-4 text-gray-600">
        <li>• It is the responsibility of students to regularly track their laundry status.</li>
        <li>•  The piece count may vary depending on the type of clothing.</li>
        <li>• Additional charges may apply based on specific washing requirements.</li>
        <li>• If a package is taken, the piece limit will reset at the beginning of each month. Any unused count from the previous package will not carry forward to the next month.</li>
        <li>• If a student submits clothes for washing and their package limit is reached mid-set, any additional garments beyond the limit will be charged per garment as per the updated price list.</li>
        <li>• If certain clothes are marked as pending, it may be due to one of the following reasons:
       -The garment is torn or damaged and cannot be washed.
       -The garment requires special services such as dry cleaning, steam ironing, or other treatments.</li>
        <li>• In such cases, students must contact the laundry directly to inquire about their pending clothes.</li>
        <li>• If any laundry item remains pending for an extended period, students should reach out to the laundry service for further clarification. </li>
      </ul>
    </div>
  </div>
);

interface ReportsModalProps {
  onClose: () => void;
}

const ReportsModal = ({ onClose }: ReportsModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Inspection Reports</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <img 
          src="https://images.unsplash.com/photo-1582647509711-c8aa8eb7c7a4?auto=format&fit=crop&q=80&w=800"
          alt="Inspection Report 1"
          className="w-full rounded-lg shadow-md"
        />
        <img 
          src="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800"
          alt="Inspection Report 2"
          className="w-full rounded-lg shadow-md"
        />
      </div>
    </div>
  </div>
);

interface GroupedEntry {
  date: string;
  entries: LaundryEntry[];
  totalQuantity: number;
  totalAmount: number;
  status: 'pending' | 'washed';
}

export function StudentDashboard({ 
  student, 
  laundryEntries, 
  payment, 
  onLogout,
  onUpdateProfile 
}: StudentDashboardProps) {
  const [selectedItems, setSelectedItems] = useState<LaundryEntry['items'] | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [localStudent, setLocalStudent] = useState<Student>(student);

  React.useEffect(() => {
    setLocalStudent(student);
  }, [student]);

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, GroupedEntry>();
    
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

  const totalPendingItems = useMemo(() => 
    laundryEntries.reduce((sum, entry) => 
      sum + entry.items.reduce((itemSum, item) => {
        const washedQuantity = item.washedQuantity ?? (item.status === 'Pending' ? 0 : item.quantity);
        return itemSum + (item.quantity - washedQuantity);
      }, 0), 0
    ), [laundryEntries]
  );

  const totalOrders = groupedEntries.length;
  const lastMonthOrders = groupedEntries.filter(group => {
    const entryDate = new Date(group.date);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return entryDate >= lastMonth;
  }).length;

  const handleImageSelect = async (base64Image: string) => {
    if (onUpdateProfile) {
      try {
        await onUpdateProfile(base64Image);
        setLocalStudent(prev => ({
          ...prev,
          profilePicture: base64Image
        }));
        setShowImageUpload(false);
      } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Failed to update profile picture. Please try again.');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <ProfilePicture
                  src={localStudent.profilePicture}
                  size="lg"
                  className="border-2 border-gray-200"
                />
                {onUpdateProfile && (
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    title="Change Profile Picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{localStudent.name}</h1>
                <p className="text-gray-600">PRN: {localStudent.prn}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReports(true)}
                className="text-gray-600 hover:text-gray-900"
                title="Inspection Reports"
              >
                <FileText className="h-5 w-5" />
                <span className="sr-only">Reports</span>
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="text-gray-600 hover:text-gray-900"
                title="Terms and Conditions"
              >
                <Info className="h-5 w-5" />
                <span className="sr-only">Terms</span>
              </button>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold">Package</h2>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">
                {localStudent.package?.type || 'No Package'}
              </p>
              <p className="text-gray-600">
                {localStudent.package 
                  ? `${parseInt(localStudent.package.type) - localStudent.package.used} items remaining`
                  : 'No active package'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shirt className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Total Items</h2>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">
                {laundryEntries.reduce((sum, entry) => sum + entry.totalPieces, 0)}
              </p>
              <p className="text-gray-600">{totalPendingItems} items pending</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold">Pending Payment</h2>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">₹{payment.pendingAmount}</p>
              <p className="text-gray-600">{payment.pendingAmount > 0 ? '1 payment pending' : 'No pending payments'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold">Total Orders</h2>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{totalOrders}</p>
              <p className="text-gray-600">Last month: {lastMonthOrders}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">DATE</th>
                    <th className="px-4 py-2 text-left">ITEMS</th>
                    <th className="px-4 py-2 text-left">STATUS</th>
                    <th className="px-4 py-2 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEntries.map((group) => (
                    <tr key={group.date} className="border-t">
                      <td className="px-4 py-2">{formatDate(group.date)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setSelectedItems(group.entries.flatMap(e => e.items))}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          {group.totalQuantity} items
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          group.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {group.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">₹{group.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Payment History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">DATE</th>
                    <th className="px-4 py-2 text-right">AMOUNT</th>
                    <th className="px-4 py-2 text-left">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEntries.map((group) => (
                    <tr key={group.date} className="border-t">
                      <td className="px-4 py-2">{formatDate(group.date)}</td>
                      <td className="px-4 py-2 text-right">₹{group.totalAmount}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          group.entries.every(e => e.isPaid)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {group.entries.every(e => e.isPaid) ? 'paid' : 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {selectedItems && (
        <ItemDetailsModal
          items={selectedItems}
          onClose={() => setSelectedItems(null)}
        />
      )}

      {showTerms && (
        <TermsModal onClose={() => setShowTerms(false)} />
      )}

      {showReports && (
        <ReportsModal onClose={() => setShowReports(false)} />
      )}

      {showImageUpload && (
        <ImageUpload
          onImageSelect={handleImageSelect}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  );
}