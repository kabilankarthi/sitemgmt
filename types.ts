
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  WORKER = 'WORKER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  workerId?: string; // Links to a Worker object if role is WORKER
}

export interface Site {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  clientName: string;
  budget: number;
  status: 'ongoing' | 'completed' | 'on-hold';
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  dailyRate: number;
  assignedSiteId: string | null;
  phone: string;
  password?: string; // For login
}

export interface Attendance {
  id: string;
  workerId: string;
  siteId: string;
  punchIn: Date;
  punchOut?: Date;
  isPaid?: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Transaction {
  id: string;
  siteId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  entityId?: string;
}

export interface AppState {
  sites: Site[];
  workers: Worker[];
  attendance: Attendance[];
  transactions: Transaction[];
  adminPhone: string;
  adminPassword?: string;
}
