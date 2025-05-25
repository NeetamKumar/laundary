import React, { useState, useMemo } from 'react';
import { LaundryItem, Student } from '../types';
import { X, Save } from 'lucide-react';
import { useLaundryStore } from '../store/laundryStore';

interface NewEntryFormProps {
  items: LaundryItem[];
  student: Student;
  onSubmit: (items: { itemId: string; quantity: number; price: number; pieces: number }[]) => void;
  onClose: () => void;
}

export function NewEntryForm({ items, student, onSubmit, onClose }: NewEntryFormProps) {
  const [selectedItems, setSelectedItems] = useState<{
    itemId: string;
    quantity: number;
    price: number;
    pieces: number;
  }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addEntry = useLaundryStore(state => state.addEntry);

  // Calculate total pieces used in current order
  const currentOrderPieces = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.pieces, 0);
  }, [selectedItems]);

  // Calculate remaining package pieces
  const remainingPackagePieces = useMemo(() => {
    if (!student.package) return 0;
    const packageLimit = parseInt(student.package.type);
    return Math.max(0, packageLimit - student.package.used);
  }, [student.package]);

  // Calculate how many pieces will be charged extra
  const calculateExcessPieces = (pieces: number, itemIndex: number) => {
    if (!student.package) return pieces;

    // Calculate pieces used before this item
    const piecesBefore = selectedItems
      .slice(0, itemIndex)
      .reduce((sum, item) => sum + item.pieces, 0);

    const availablePackagePieces = Math.max(0, remainingPackagePieces - piecesBefore);
    return Math.max(0, pieces - availablePackagePieces);
  };

  const calculatePrice = (itemId: string, quantity: number, pieces: number, itemIndex: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return 0;

    // If student has no package, charge full price
    if (!student.package) {
      return item.baseRate * quantity;
    }

    // Calculate excess pieces that will be charged
    const excessPieces = calculateExcessPieces(pieces, itemIndex);
    if (excessPieces <= 0) return 0;

    // Calculate price based on excess pieces and base rate
    return item.baseRate * (excessPieces / item.pieces);
  };

  const handleAddItem = (itemId: string) => {
    if (!itemId) return;
    
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Check if item already exists
    const existingItemIndex = selectedItems.findIndex(i => i.itemId === itemId);
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      handleUpdateQuantity(existingItemIndex, selectedItems[existingItemIndex].quantity + 1);
      return;
    }

    // Add new item
    const newIndex = selectedItems.length;
    const pieces = item.pieces;
    const price = calculatePrice(itemId, 1, pieces, newIndex);
    
    setSelectedItems(prev => [
      ...prev,
      { 
        itemId, 
        quantity: 1, 
        price,
        pieces
      }
    ]);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    const item = items.find((i) => i.id === selectedItems[index].itemId);
    if (!item) return;

    const pieces = item.pieces * newQuantity;
    const price = calculatePrice(selectedItems[index].itemId, newQuantity, pieces, index);
    
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: newQuantity,
        pieces,
        price
      };
      return updated;
    });
  };

  const handleUpdatePrice = (index: number, price: number) => {
    if (price < 0) return;
    
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        price
      };
      return updated;
    });
  };

  const handleUpdatePieces = (index: number, pieces: number) => {
    if (pieces < 0) return;
    
    const item = items.find((i) => i.id === selectedItems[index].itemId);
    if (!item) return;

    const price = calculatePrice(selectedItems[index].itemId, selectedItems[index].quantity, pieces, index);
    
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        pieces,
        price
      };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || selectedItems.length === 0) return;
    
    try {
      setIsSubmitting(true);

      // Get current date in local timezone
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const formattedDate = localDate.toISOString().split('T')[0];

      // Calculate totals
      const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
      const totalPieces = selectedItems.reduce((sum, item) => sum + item.pieces, 0);

      const newEntry = {
        id: `${student.prn}-${Date.now()}`,
        prn: student.prn,
        date: formattedDate,
        items: selectedItems.map(item => ({
          ...item,
          status: 'Pending' as const
        })),
        totalAmount,
        totalPieces,
        isPaid: false
      };

      // Add the entry to the store
      addEntry(newEntry);
      
      // Call the original onSubmit
      onSubmit(selectedItems);
    } catch (error) {
      console.error('Error submitting entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const projectedPackageUsage = student.package 
    ? student.package.used + currentOrderPieces 
    : currentOrderPieces;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">New Laundry Entry</h2>
            {student.package && (
              <div className="space-y-1 mt-2">
                <p className="text-sm text-gray-600">
                  Package: {student.package.type}
                </p>
                <p className="text-sm text-gray-600">
                  Used: {student.package.used} pieces
                </p>
                <p className="text-sm text-gray-600">
                  Remaining: {remainingPackagePieces} pieces
                </p>
                <p className="text-sm text-gray-600">
                  Projected Usage: {projectedPackageUsage} pieces
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <select
            onChange={(e) => handleAddItem(e.target.value)}
            className="w-full p-2 border rounded-lg"
            defaultValue=""
            disabled={isSubmitting}
          >
            <option value="" disabled>Add Item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - ₹{item.baseRate} ({item.pieces} {item.pieces === 1 ? 'piece' : 'pieces'})
              </option>
            ))}
          </select>
        </div>

        {selectedItems.length > 0 && (
          <div className="space-y-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Pieces</th>
                  <th className="px-4 py-2 text-left">Package Usage</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((selectedItem, index) => {
                  const item = items.find((i) => i.id === selectedItem.itemId);
                  const totalPiecesForItem = selectedItem.pieces;
                  const excessPieces = calculateExcessPieces(totalPiecesForItem, index);
                  const packagePieces = totalPiecesForItem - excessPieces;
                  
                  return (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item?.name}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={selectedItem.quantity}
                          onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                          className="w-20 p-1 border rounded"
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          value={selectedItem.pieces}
                          onChange={(e) => handleUpdatePieces(index, parseFloat(e.target.value) || 0)}
                          className="w-20 p-1 border rounded"
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm">
                          <p className="text-green-600">{packagePieces} in package</p>
                          {excessPieces > 0 && (
                            <p className="text-red-600">{excessPieces} excess</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          ₹
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={selectedItem.price}
                            onChange={(e) => handleUpdatePrice(index, parseFloat(e.target.value) || 0)}
                            className="w-20 p-1 border rounded"
                            disabled={isSubmitting}
                          />
                          {selectedItem.price === 0 && (
                            <span className="text-xs text-green-600">(Free)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-between items-start pt-4 border-t">
              <div className="space-y-2">
                <p className="text-lg">
                  Total Pieces: <span className="font-bold">{currentOrderPieces}</span>
                </p>
                <p className="text-xl font-bold">
                  Total Amount: ₹{totalAmount}
                </p>
                {student.package && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Package Status After Order:</p>
                    <p>• Used: {projectedPackageUsage} pieces</p>
                    <p>• {projectedPackageUsage > parseInt(student.package.type) 
                        ? `Exceeding package by ${projectedPackageUsage - parseInt(student.package.type)} pieces` 
                        : `${parseInt(student.package.type) - projectedPackageUsage} pieces remaining`}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedItems.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}