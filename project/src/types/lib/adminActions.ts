import { mockStudents, mockLaundryEntries, mockPayments } from './mockData';
import type { Student, LaundryEntry, Payment } from '../types';

export async function updateStudentPackage(
  prn: string,
  packageType: '40pcs' | '60pcs' | '75pcs',
  packageUsed: number
) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const studentIndex = mockStudents.findIndex(s => s.prn === prn);
  if (studentIndex === -1) throw new Error('Student not found');

  mockStudents[studentIndex] = {
    ...mockStudents[studentIndex],
    package: {
      type: packageType,
      used: packageUsed
    }
  };

  return { success: true };
}

export async function updateLaundryStatus(
  entryId: string,
  itemId: string,
  status: 'Washed' | 'Pending'
) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const entryIndex = mockLaundryEntries.findIndex(e => e.id === entryId);
  if (entryIndex === -1) throw new Error('Entry not found');

  const itemIndex = mockLaundryEntries[entryIndex].items.findIndex(i => i.itemId === itemId);
  if (itemIndex === -1) throw new Error('Item not found');

  mockLaundryEntries[entryIndex].items[itemIndex].status = status;

  return { success: true };
}

export async function approvePayment(prn: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const paymentIndex = mockPayments.findIndex(p => p.prn === prn);
  if (paymentIndex === -1) throw new Error('Payment not found');

  mockPayments[paymentIndex].pendingAmount = 0;
  mockPayments[paymentIndex].lastPaymentDate = new Date().toISOString().split('T')[0];

  // Update related laundry entries
  mockLaundryEntries.forEach(entry => {
    if (entry.prn === prn) {
      entry.isPaid = true;
    }
  });

  return { success: true };
}

export async function getStudentData(prn: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const student = mockStudents.find(s => s.prn === prn);
  if (!student) throw new Error('Student not found');

  const entries = mockLaundryEntries.filter(e => e.prn === prn);
  const payment = mockPayments.find(p => p.prn === prn);

  return {
    student,
    entries,
    payment
  };
}