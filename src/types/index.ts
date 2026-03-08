export type UserRole = "master" | "attendant";
export type ContractStatus = "active" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "overdue";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Phone {
  id: number;
  number: string;
  label: string;
  clientId: number;
}

export interface Client {
  id: number;
  name: string;
  cpf?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  phones: Phone[];
  createdAt: Date;
}

export interface ContractDate {
  id: number;
  contractId: number;
  date: Date;
}

export interface Payment {
  id: number;
  contractId: number;
  amount: number;
  dueDate: Date;
  paidAt?: Date | null;
  status: PaymentStatus;
  notes?: string | null;
}

export interface Contract {
  id: number;
  clientId: number;
  client: Client;
  totalAmount: number;
  amountInWords?: string | null;
  status: ContractStatus;
  notes?: string | null;
  template?: string | null;
  dates: ContractDate[];
  payments: Payment[];
  createdAt: Date;
}

export interface Setting {
  key: string;
  value: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueThisMonth: number;
  totalContracts: number;
  contractsThisMonth: number;
  pendingPayments: number;
  upcomingEvents: number;
}
