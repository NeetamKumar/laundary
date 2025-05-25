export interface Student {
  prn: string;
  name: string;
  contact: string;
  room: string;
  profilePicture?: string;
  package?: {
    type: '40pcs' | '60pcs' | '75pcs';
    used: number;
  };
}

export interface LaundryItem {
  id: string;
  name: string;
  baseRate: number;
  pieces: number;
}

export interface LaundryEntry {
  id: string;
  date: string;
  items: {
    itemId: string;
    quantity: number;
    price: number;
    status: 'Pending' | 'Washed';
    pieces: number;
    washedQuantity?: number;
    washedPieces?: number;
  }[];
  totalAmount: number;
  totalPieces: number;
  isPaid: boolean;
}

export interface Payment {
  totalAmount: number;
  pendingAmount: number;
  lastPaymentDate: string;
}

export interface StudentDocument {
  prn: string;
  name: string;
  contact: string;
  room: string;
  profilePicture?: string;
  package?: {
    type: '40pcs' | '60pcs' | '75pcs';
    used: number;
  };
  laundryEntries: LaundryEntry[];
  payment: Payment;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilter = 'all' | 'pending' | 'washed';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  prn?: string;
}

export type AuthUser = User;

export interface RegistrationForm {
  prn: string;
  fullName: string;
  email: string;
  contact: string;
  room: string;
  packageType: '40pcs' | '60pcs' | '75pcs';
  password: string;
  confirmPassword: string;
  batch: 'senior' | 'junior';
  guardianName: string;
  guardianContact: string;
  profilePicture?: string;
}

export type View = 'dashboard' | 'search' | 'washing' | 'payments';

export interface DatabaseAdapter {
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  register: (form: RegistrationForm) => Promise<void>;
  getStudentDocument: (prn: string) => Promise<StudentDocument | null>;
  updateStudentInfo: (prn: string, data: Partial<Student>) => Promise<StudentDocument>;
  addLaundryEntry: (prn: string, entry: Omit<LaundryEntry, 'id'>) => Promise<StudentDocument>;
  updateLaundryStatus: (prn: string, entryId: string, itemId: string, status: 'Washed' | 'Pending') => Promise<StudentDocument>;
  updatePayment: (prn: string, data: Partial<Payment>) => Promise<StudentDocument>;
}