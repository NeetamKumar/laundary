import { create } from 'zustand';
import { mockLaundryEntries } from '../lib/mockData';
import type { LaundryEntry } from '../types';

interface LaundryStore {
  entries: LaundryEntry[];
  setEntries: (entries: LaundryEntry[]) => void;
  updateEntryStatus: (entryId: string, itemId: string, status: 'Washed' | 'Pending') => void;
  addEntry: (entry: LaundryEntry) => void;
  updatePaymentStatus: (prn: string, isPaid: boolean) => void;
  updateBatchStatus: (updates: { entryId: string; itemId: string; status: 'Washed' | 'Pending'; quantity: number }[]) => void;
  removeItemFromEntry: (entryId: string, itemId: string) => void;
}

export const useLaundryStore = create<LaundryStore>((set) => ({
  entries: mockLaundryEntries,
  
  setEntries: (entries) => set({ entries }),
  
  updateEntryStatus: (entryId, itemId, status) =>
    set((state) => {
      try {
        const updatedEntries = state.entries.map(entry => {
          if (entry.id !== entryId) return entry;

          const updatedItems = entry.items.map(item => {
            if (item.itemId !== itemId) return item;

            return {
              ...item,
              status,
              washedQuantity: status === 'Washed' ? item.quantity : 0,
              washedPieces: status === 'Washed' ? item.pieces : 0
            };
          });

          return {
            ...entry,
            items: updatedItems
          };
        });

        return { entries: updatedEntries };
      } catch (error) {
        console.error('Error updating entry status:', error);
        return state;
      }
    }),
    
  addEntry: (entry) =>
    set((state) => {
      try {
        if (!entry.id || !entry.prn || !Array.isArray(entry.items)) {
          console.error('Invalid entry data:', entry);
          return state;
        }

        // Find existing entry for the same PRN and date
        const existingEntryIndex = state.entries.findIndex(e => 
          e.prn === entry.prn && e.date === entry.date
        );

        if (existingEntryIndex >= 0) {
          // Update existing entry
          const updatedEntries = [...state.entries];
          const existingEntry = updatedEntries[existingEntryIndex];
          
          // Create a map of existing items for efficient lookup
          const itemMap = new Map(
            existingEntry.items.map(item => [item.itemId, { ...item }])
          );

          // Process new items
          entry.items.forEach(newItem => {
            const existingItem = itemMap.get(newItem.itemId);
            
            if (existingItem) {
              // Replace existing item instead of adding quantities
              itemMap.set(newItem.itemId, {
                ...newItem,
                status: 'Pending',
                washedQuantity: 0,
                washedPieces: 0
              });
            } else {
              // Add new item
              itemMap.set(newItem.itemId, {
                ...newItem,
                status: 'Pending',
                washedQuantity: 0,
                washedPieces: 0
              });
            }
          });

          const updatedItems = Array.from(itemMap.values());

          // Update entry with new items
          updatedEntries[existingEntryIndex] = {
            ...existingEntry,
            items: updatedItems,
            totalAmount: updatedItems.reduce((sum, item) => sum + item.price, 0),
            totalPieces: updatedItems.reduce((sum, item) => sum + item.pieces, 0)
          };

          return { entries: updatedEntries };
        }

        // Add new entry
        return {
          entries: [...state.entries, {
            ...entry,
            items: entry.items.map(item => ({
              ...item,
              status: 'Pending',
              washedQuantity: 0,
              washedPieces: 0
            })),
            totalAmount: entry.items.reduce((sum, item) => sum + item.price, 0),
            totalPieces: entry.items.reduce((sum, item) => sum + item.pieces, 0),
            isPaid: false
          }]
        };
      } catch (error) {
        console.error('Error adding new entry:', error);
        return state;
      }
    }),
    
  updatePaymentStatus: (prn, isPaid) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.prn === prn ? { ...entry, isPaid } : entry
      ),
    })),
    
  updateBatchStatus: (updates) =>
    set((state) => {
      try {
        const updateMap = new Map(
          updates.map(update => [`${update.entryId}-${update.itemId}`, update])
        );

        const updatedEntries = state.entries.map(entry => {
          const entryUpdates = updates.filter(u => u.entryId === entry.id);
          if (entryUpdates.length === 0) return entry;

          const updatedItems = entry.items.map(item => {
            const updateKey = `${entry.id}-${item.itemId}`;
            const update = updateMap.get(updateKey);
            
            if (!update) return item;

            // Calculate washed quantities based on the update
            const washedQuantity = Math.min(update.quantity, item.quantity);
            const washedPieces = (washedQuantity / item.quantity) * item.pieces;

            return {
              ...item,
              status: washedQuantity >= item.quantity ? 'Washed' : 'Pending',
              washedQuantity,
              washedPieces
            };
          });

          return {
            ...entry,
            items: updatedItems
          };
        });

        return { entries: updatedEntries };
      } catch (error) {
        console.error('Error updating batch status:', error);
        return state;
      }
    }),

  removeItemFromEntry: (entryId, itemId) =>
    set((state) => {
      try {
        const updatedEntries = state.entries.map(entry => {
          if (entry.id !== entryId) return entry;

          const updatedItems = entry.items.filter(item => item.itemId !== itemId);
          
          if (updatedItems.length === 0) return null;

          return {
            ...entry,
            items: updatedItems,
            totalAmount: updatedItems.reduce((sum, item) => sum + item.price, 0),
            totalPieces: updatedItems.reduce((sum, item) => sum + item.pieces, 0)
          };
        }).filter((entry): entry is LaundryEntry => entry !== null);

        return { entries: updatedEntries };
      } catch (error) {
        console.error('Error removing item from entry:', error);
        return state;
      }
    })
}));