export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  isActive: boolean;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  module: 'dashboard' | 'accounting' | 'market' | 'hr' | 'reports' | 'settings' | 'system';
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'export' | 'approve';
  resource?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  currency: 'USD' | 'IQD';
  description?: string;
  manager?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  moduleType: 'accounting' | 'market';
  createdAt: string;
}

export interface Invoice {
  id: string;
  branchId: string;
  name: string;
  amount: number;
  currency: 'USD' | 'IQD';
  convertedAmount?: number; // Amount in IQD (for USD entries, this is the converted amount)
  exchangeRate?: number; // Exchange rate used for conversion (USD entries only)
  rateDate?: string; // Date of exchange rate used
  invoiceDate: string;
  entryDate: string;
  notes?: string;
  paymentStatus: 'paid' | 'unpaid';
  paidAt?: string;
  paidDate?: string;
  createdBy: string;
}

export interface CurrencyTotal {
  total_iqd: number;
  total_usd: number;
  total: number; // This is the IQD total (same as total_iqd)
}

export interface DollarRate {
  id: string;
  date: string;
  rate: number;
  enteredBy: string;
  createdAt: string;
}

export interface SalesEntry {
  id: string;
  branchId: string;
  name: string;
  amount: number;
  currency: 'USD' | 'IQD';
  convertedAmount: number; // Amount in IQD (for USD entries, this is the converted amount)
  exchangeRate?: number; // Exchange rate used for conversion (USD entries only)
  rateDate?: string; // Date of exchange rate used
  date: string;
  notes?: string;
  createdBy: string;
}

export interface ProfitEntry {
  id: string;
  branchId: string;
  name: string;
  amount: number;
  currency: 'USD' | 'IQD';
  convertedAmount: number; // Amount in IQD (for USD entries, this is the converted amount)
  exchangeRate?: number; // Exchange rate used for conversion (USD entries only)
  rateDate?: string; // Date of exchange rate used
  date: string;
  notes?: string;
  createdBy: string;
}

export interface ExpenseEntry {
  id: string;
  branchId: string;
  name: string;
  amount: number;
  currency: 'USD' | 'IQD';
  convertedAmount: number; // Amount in IQD (for USD entries, this is the converted amount)
  exchangeRate?: number; // Exchange rate used for conversion (USD entries only)
  rateDate?: string; // Date of exchange rate used
  date: string;
  notes?: string;
  paymentStatus: 'paid' | 'unpaid';
  paidAt?: string;
  paidDate?: string;
  createdBy: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface SalaryWithdrawal {
  id: string;
  employeeId: string;
  amount: number;
  currency: 'USD' | 'IQD';
  convertedAmount: number; // Amount in IQD (for USD entries, this is the converted amount)
  exchangeRate?: number; // Exchange rate used for conversion (USD entries only)
  rateDate?: string; // Date of exchange rate used
  withdrawalDate: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Employee {
  id: string;
  branchId: string;
  name: string;
  phone?: string;
  location?: string;
  salary: number;
  salaryCurrency: 'USD' | 'IQD';
  convertedSalary: number; // Salary in IQD (for USD salaries, this is the converted amount)
  salaryExchangeRate?: number; // Exchange rate used for salary conversion
  salaryRateDate?: string; // Date of exchange rate used for salary
  salaryDays: number;
  deposit: number;
  depositCurrency: 'USD' | 'IQD';
  convertedDeposit: number; // Deposit in IQD (for USD deposits, this is the converted amount)
  depositExchangeRate?: number; // Exchange rate used for deposit conversion
  depositRateDate?: string; // Date of exchange rate used for deposit
  startDate: string;
  isActive: boolean;
  lastPaidDate?: string;
  isPaid?: boolean;
  paidAmount?: number;
  createdBy: string;
  salaryPayments?: SalaryPayment[];
  salaryWithdrawals?: SalaryWithdrawal[];
}

export interface Adjustment {
  id: string;
  employeeId: string;
  type: 'penalty' | 'bonus';
  amount: number;
  currency: 'USD' | 'IQD';
  convertedAmount: number; // Amount in IQD (for USD entries, this is the converted amount)
  exchangeRate?: number; // Exchange rate used for conversion (USD entries only)
  rateDate?: string; // Date of exchange rate used
  date: string;
  description: string;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: 'invoices' | 'sales' | 'expenses' | 'payroll' | 'currency' | 'alerts';
  title: string;
  visible: boolean;
  order: number;
}

export interface NotificationItem {
  id: string;
  type: 'invoice' | 'expense' | 'payroll' | 'rate';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

export type Language = 'en' | 'ku';
export type Theme = 'light' | 'dark';