import { Student, LaundryItem, LaundryEntry, Payment, User } from '../types';

export const predefinedItems: LaundryItem[] = [
  { id: '1', name: 'Socks- Ankle Length', baseRate: 3.75, pieces: 0.25 },
  { id: '2', name: 'Socks- Full Length', baseRate: 7.5, pieces: 0.5 },
  { id: '3', name: 'Bra', baseRate: 7.5, pieces: 0.5 },
  { id: '4', name: 'Hanky', baseRate: 4.995, pieces: 0.333 },
  { id: '5', name: 'Underware- Full', baseRate: 15, pieces: 1 },
  { id: '6', name: 'Underware- Cut', baseRate: 7.5, pieces: 0.5 },
  { id: '7', name: 'Shirt', baseRate: 15, pieces: 1 },
  { id: '8', name: 'Tshirt', baseRate: 15, pieces: 1 },
  { id: '9', name: 'Kurtha', baseRate: 15, pieces: 1 },
  { id: '10', name: 'Sweater', baseRate: 45, pieces: 3 },
  { id: '11', name: 'Jacket', baseRate: 45, pieces: 3 },
  { id: '12', name: 'Jerking', baseRate: 45, pieces: 3 },
  { id: '13', name: 'Hoodie', baseRate: 45, pieces: 3 },
  { id: '14', name: 'Sweatshit', baseRate: 45, pieces: 3 },
  { id: '15', name: 'Blazer', baseRate: 100, pieces: 0 },
  { id: '16', name: 'Pants', baseRate: 15, pieces: 1 },
  { id: '17', name: 'Jeans', baseRate: 15, pieces: 1 },
  { id: '18', name: '6 pocket pants', baseRate: 45, pieces: 3 },
  { id: '19', name: 'Shorts', baseRate: 15, pieces: 1 },
  { id: '20', name: 'Bedsheet- Single', baseRate: 30, pieces: 2 },
  { id: '21', name: 'Bedsheet- Double', baseRate: 45, pieces: 3 },
  { id: '22', name: 'Blanket', baseRate: 45, pieces: 3 },
  { id: '23', name: 'Curtains', baseRate: 200, pieces: 0 },
  { id: '24', name: 'Shoes', baseRate: 250, pieces: 0 },
  { id: '25', name: 'Helmet', baseRate: 100, pieces: 0 },
  { id: '26', name: 'Doormat', baseRate: 100, pieces: 0 },
  { id: '27', name: 'Cap', baseRate: 50, pieces: 0 },
  { id: '28', name: 'Bag', baseRate: 100, pieces: 0 },
  { id: '29', name: 'Gloves', baseRate: 50, pieces: 0 }
];

// Mock data for testing - replace with your database implementation
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@laundry.com',
    role: 'admin'
  },
  {
    id: '2',
    email: 'student@sims.edu',
    role: 'student',
    prn: 'PRN001'
  }
];

export const mockStudents: Student[] = [
  {
    prn: "23070122001",
    name: "Ananya Mehta",
    contact: "+91 9876543301",
    room: "C-101",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    package: {
      type: "40pcs",
      used: 12
    }
  },
  {
    prn: "23070122002",
    name: "Rohan Kapoor",
    contact: "+91 9876543302",
    room: "C-102",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    package: {
      type: "60pcs",
      used: 25
    }
  }
];

export const mockLaundryEntries: LaundryEntry[] = [
  {
    id: "1",
    prn: "23070122001",
    date: "2024-03-10",
    items: [
      { itemId: "1", quantity: 2, price: 40, status: "Washed", pieces: 2 },
      { itemId: "4", quantity: 1, price: 25, status: "Pending", pieces: 2 }
    ],
    totalAmount: 65,
    totalPieces: 4,
    isPaid: false
  },
  {
    id: "2",
    prn: "23070122002",
    date: "2024-03-11",
    items: [
      { itemId: "2", quantity: 1, price: 20, status: "Pending", pieces: 1 },
      { itemId: "3", quantity: 2, price: 40, status: "Pending", pieces: 2 }
    ],
    totalAmount: 60,
    totalPieces: 3,
    isPaid: false
  }
];

export const mockPayments: Payment[] = [
  {
    prn: "23070122001",
    totalAmount: 265,
    pendingAmount: 65,
    lastPaymentDate: "2024-03-01"
  },
  {
    prn: "23070122002",
    totalAmount: 180,
    pendingAmount: 60,
    lastPaymentDate: "2024-03-05"
  }
];