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

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@laundry.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    email: 'PRN001',
    password: 'student123',
    role: 'student',
    prn: 'PRN001'
  }
];

export const mockStudents: Student[] = [
  {
    prn: "PRN001",
    name: "John Doe",
    contact: "+91 9876543210",
    room: "A-101",
    package: {
      type: "60pcs",
      used: 54
    }
  },
  {
    prn: "PRN002",
    name: "Jane Smith",
    contact: "+91 9876543211",
    room: "B-202",
    package: {
      type: "40pcs",
      used: 22
    }
  },
  {
    prn: "PRN003",
    name: "Alice Johnson",
    contact: "+91 9876543212",
    room: "C-303",
    package: {
      type: "75pcs",
      used: 45
    }
  }
];

