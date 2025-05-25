import React, { useState, useMemo } from 'react';
import { Student, LaundryEntry, Payment } from '../types';
import { UserCircle, Phone, Home, ChevronDown, ChevronUp, X, Save, Trash2 } from 'lucide-react';
import { predefinedItems } from '../lib/mockData';
import { ProfilePicture } from './ProfilePicture';
import { useLaundryStore } from '../store/laundryStore';

interface ItemDetailsModalProps {
  items: LaundryEntry['items'];
  entryId: string;
  onClose: () => void;
  onSave: () => void;
}

interface GroupedEntry {
  date: string;
  entries: LaundryEntry[];
  totalQuantity: number;
  totalAmount: number;
  status: 'pending' | 'washed';
}

const ItemDetailsModal = ({ items, entryId, onClose, onSave }: ItemDetailsModalProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const removeItemFromEntry = useLaundryStore(state => state.removeItemFromEntry);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Deduplicate items by combining quantities for same itemId
  const consolidatedItems = useMemo(() => {
    const itemMap = new Map();
    
    items.forEach(item => {
      if (itemMap.has(item.itemId)) {
        const existing = itemMap.get(item.itemId);
        itemMap.set(item.itemId, {
          ...item,
          quantity: existing.quantity + item.quantity,
          pieces: existing.pieces + item.pieces,
          price: existing.price + item.price,
          status: item.status === 'Pending' || existing.status === 'Pending' ? 'Pending' : 'Washed'
        });
      } else {
        itemMap.set(item.itemId, { ...item });
      }
    });

    return Array.from(itemMap.values());
  }, [items]);

  const handleRemoveItems = () => {
    selectedItems.forEach(itemId => {
      removeItemFromEntry(entryId, itemId);
    });
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      onSave();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Item Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {showSuccessMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
            Items removed successfully!
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Select</th>
              <th className="px-4 py-2 text-left">Cloth Name</th>
              <th className="px-4 py-2 text-center">Quantity</th>
              <th className="px-4 py-2 text-center">Piece Count</th>
              <th className="px-4 py-2 text-center">Price</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {consolidatedItems.map((item) => {
              const itemDetails = predefinedItems.find(i => i.id === item.itemId);
              return (
                <tr key={item.itemId} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.itemId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.itemId]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.itemId));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-2">{itemDetails?.name}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-center">{item.pieces}</td>
                  <td className="px-4 py-2 text-center">
                    {item.price > 0 ? `₹${item.price}` : 'Free'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      item.status === 'Washed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {selectedItems.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleRemoveItems}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-5 w-5" />
              Remove Selected Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface StudentDetailsProps {
  student: Student;
  laundryHistory: LaundryEntry[];
  payment: Payment;
  onNewEntry: () => void;
  onUpdatePayment: () => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export function StudentDetails({
  student,
  laundryHistory,
  payment,
  onNewEntry,
  onUpdatePayment,
  onUpdateStudent,
}: StudentDetailsProps) {
  const [showClothesDetails, setShowClothesDetails] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{items: LaundryEntry['items'], entryId: string} | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Group entries by date with consolidated totals
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, GroupedEntry>();
    
    laundryHistory.forEach(entry => {
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
  }, [laundryHistory]);

  const totalPendingItems = useMemo(() => 
    laundryHistory.reduce((sum, entry) => 
      sum + entry.items.reduce((itemSum, item) => {
        const washedQuantity = item.washedQuantity ?? (item.status === 'Washed' ? item.quantity : 0);
        return itemSum + (item.quantity - washedQuantity);
      }, 0), 0
    ), [laundryHistory]
  );

  const totalOrders = groupedEntries.length;
  const lastMonthOrders = groupedEntries.filter(group => {
    const entryDate = new Date(group.date);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return entryDate >= lastMonth;
  }).length;

  const packageInfo = student.package;
  const piecesLeft = packageInfo ? parseInt(packageInfo.type) - packageInfo.used : 0;
  
  const currentDate = new Date();
  const totalClothesThisMonth = laundryHistory
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentDate.getMonth() && 
             entryDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const packageUsagePercentage = packageInfo 
    ? (packageInfo.used / parseInt(packageInfo.type)) * 100
    : 0;

  const getPackageStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSaveChanges = () => {
    if (onUpdateStudent) {
      onUpdateStudent(student);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Info Section */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <ProfilePicture src={student.profilePicture} size="lg" />
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{student.name}</h2>
              <p className="text-gray-600">PRN: {student.prn}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onNewEntry}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              New Entry
            </button>
            <button
              onClick={onUpdatePayment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Payment
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <UserCircle className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">PRN: {student.prn}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{student.contact}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Home className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Room: {student.room}</span>
          </div>
        </div>
      </div>

      {/* Clothes Summary Section */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg lg:text-xl font-semibold">Clothes Summary</h3>
          <button
            onClick={() => setShowClothesDetails(!showClothesDetails)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            {showClothesDetails ? <ChevronUp /> : <ChevronDown />}
            {showClothesDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600">Package</p>
              <p className="text-lg font-semibold">{packageInfo?.type || 'No Package'}</p>
              {packageInfo && (
                <p className={`text-sm ${getPackageStatusColor(packageUsagePercentage)}`}>
                  {packageUsagePercentage.toFixed(1)}% used
                </p>
              )}
            </div>
            <div>
              <p className="text-gray-600">Pieces Left</p>
              <p className="text-lg font-semibold">{piecesLeft}</p>
              {packageInfo && piecesLeft <= parseInt(packageInfo.type) * 0.1 && (
                <p className="text-sm text-red-600">Low balance!</p>
              )}
            </div>
            <div>
              <p className="text-gray-600">Total Clothes This Month</p>
              <p className="text-lg font-semibold">{totalClothesThisMonth}</p>
              <p className="text-sm text-gray-500">Current month usage</p>
            </div>
            <div>
              <p className="text-gray-600">Total Pending Clothes</p>
              <p className="text-lg font-semibold">{totalPendingItems}</p>
              {totalPendingItems > 0 && (
                <p className="text-sm text-yellow-600">Items pending</p>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-lg lg:text-xl font-semibold mb-4">Latest Laundry History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Items</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {groupedEntries.map((group) => (
                <tr key={group.date} className="border-t">
                  <td className="px-4 py-2">{formatDate(group.date)}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedEntry({ 
                        items: group.entries.flatMap(e => e.items),
                        entryId: group.entries[0].id
                      })}
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

      {/* Payment Summary Section */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
        <h3 className="text-lg lg:text-xl font-semibold mb-4">Payment Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Total Amount</p>
            <p className="text-xl lg:text-2xl font-bold">₹{payment.totalAmount}</p>
          </div>
          <div>
            <p className="text-gray-600">Pending Amount</p>
            <p className="text-xl lg:text-2xl font-bold text-red-600">₹{payment.pendingAmount}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Payment</p>
            <p className="text-lg">{payment.lastPaymentDate}</p>
          </div>
        </div>
      </div>

      {selectedEntry && (
        <ItemDetailsModal
          items={selectedEntry.items}
          entryId={selectedEntry.entryId}
          onClose={() => setSelectedEntry(null)}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
}