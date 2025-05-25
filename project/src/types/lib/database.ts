import { DatabaseAdapter, AuthUser, Student, LaundryEntry, Payment, RegistrationForm, StudentDocument } from '../types';
import { mockUsers } from './mockData';

// Mock student documents storage
const studentDocuments = new Map<string, StudentDocument>();

// Initialize with some sample data
studentDocuments.set("23070122001", {
  prn: "23070122001",
  name: "Ananya Mehta",
  contact: "+91 9876543301",
  room: "C-101",
  profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
  package: {
    type: "40pcs",
    used: 12
  },
  laundryEntries: [
    {
      id: "1",
      date: "2024-03-10",
      items: [
        { itemId: "1", quantity: 2, price: 40, status: "Washed", pieces: 2 },
        { itemId: "4", quantity: 1, price: 25, status: "Pending", pieces: 2 }
      ],
      totalAmount: 65,
      totalPieces: 4,
      isPaid: false
    }
  ],
  payment: {
    totalAmount: 265,
    pendingAmount: 65,
    lastPaymentDate: "2024-03-01"
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export class MockDatabaseAdapter implements DatabaseAdapter {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    return user;
  }

  async signOut(): Promise<void> {
    // Mock implementation
  }

  async register(form: RegistrationForm): Promise<void> {
    const newDoc: StudentDocument = {
      prn: form.prn,
      name: form.fullName,
      contact: form.contact,
      room: form.room,
      profilePicture: form.profilePicture,
      package: {
        type: form.packageType,
        used: 0
      },
      laundryEntries: [],
      payment: {
        totalAmount: 0,
        pendingAmount: 0,
        lastPaymentDate: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    studentDocuments.set(form.prn, newDoc);
  }

  async getStudentDocument(prn: string): Promise<StudentDocument | null> {
    return studentDocuments.get(prn) || null;
  }

  async updateStudentInfo(prn: string, data: Partial<Student>): Promise<StudentDocument> {
    const doc = studentDocuments.get(prn);
    if (!doc) throw new Error('Student not found');

    const updatedDoc = {
      ...doc,
      ...data,
      updatedAt: new Date().toISOString()
    };

    studentDocuments.set(prn, updatedDoc);
    return updatedDoc;
  }

  async addLaundryEntry(prn: string, entry: Omit<LaundryEntry, 'id'>): Promise<StudentDocument> {
    const doc = studentDocuments.get(prn);
    if (!doc) throw new Error('Student not found');

    const newEntry: LaundryEntry = {
      ...entry,
      id: (doc.laundryEntries.length + 1).toString()
    };

    const updatedDoc = {
      ...doc,
      laundryEntries: [...doc.laundryEntries, newEntry],
      payment: {
        ...doc.payment,
        totalAmount: doc.payment.totalAmount + entry.totalAmount,
        pendingAmount: doc.payment.pendingAmount + entry.totalAmount
      },
      updatedAt: new Date().toISOString()
    };

    studentDocuments.set(prn, updatedDoc);
    return updatedDoc;
  }

  async updateLaundryStatus(prn: string, entryId: string, itemId: string, status: 'Washed' | 'Pending'): Promise<StudentDocument> {
    const doc = studentDocuments.get(prn);
    if (!doc) throw new Error('Student not found');

    const updatedEntries = doc.laundryEntries.map(entry => {
      if (entry.id !== entryId) return entry;

      return {
        ...entry,
        items: entry.items.map(item => 
          item.itemId === itemId ? { ...item, status } : item
        )
      };
    });

    const updatedDoc = {
      ...doc,
      laundryEntries: updatedEntries,
      updatedAt: new Date().toISOString()
    };

    studentDocuments.set(prn, updatedDoc);
    return updatedDoc;
  }

  async updatePayment(prn: string, data: Partial<Payment>): Promise<StudentDocument> {
    const doc = studentDocuments.get(prn);
    if (!doc) throw new Error('Student not found');

    const updatedDoc = {
      ...doc,
      payment: {
        ...doc.payment,
        ...data
      },
      updatedAt: new Date().toISOString()
    };

    studentDocuments.set(prn, updatedDoc);
    return updatedDoc;
  }
}

// Create database instance
export const db = new MockDatabaseAdapter();