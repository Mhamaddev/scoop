import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Invoice, DollarRate, SalesEntry, ProfitEntry, ExpenseEntry, Employee, Adjustment } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  updateInvoicePaymentStatus: (invoiceId: string, paymentStatus: 'paid' | 'unpaid', paidDate?: string) => Promise<void>;
  
  // Dollar Rates
  dollarRates: DollarRate[];
  addDollarRate: (rate: Omit<DollarRate, 'id' | 'createdAt'>) => Promise<void>;
  
  // Sales Entries
  salesEntries: SalesEntry[];
  addSalesEntry: (entry: Omit<SalesEntry, 'id'>) => Promise<void>;
  updateSalesEntry: (entryId: string, updates: Partial<SalesEntry>) => Promise<void>;
  deleteSalesEntry: (entryId: string) => Promise<void>;
  
  // Profit Entries
  profitEntries: ProfitEntry[];
  addProfitEntry: (entry: Omit<ProfitEntry, 'id'>) => Promise<void>;
  updateProfitEntry: (entryId: string, updates: Partial<ProfitEntry>) => Promise<void>;
  deleteProfitEntry: (entryId: string) => Promise<void>;
  
  // Expense Entries
  expenseEntries: ExpenseEntry[];
  addExpenseEntry: (entry: Omit<ExpenseEntry, 'id'>) => Promise<void>;
  updateExpenseEntry: (entryId: string, updates: Partial<ExpenseEntry>) => Promise<void>;
  deleteExpenseEntry: (entryId: string) => Promise<void>;
  updateExpensePaymentStatus: (expenseId: string, paymentStatus: 'paid' | 'unpaid', paidDate?: string) => Promise<void>;
  
  // Employees
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  payEmployeeSalary: (employeeId: string, amount: number, date: string, notes?: string) => Promise<void>;
  
  // Adjustments
  adjustments: Adjustment[];
  addAdjustment: (adjustment: Omit<Adjustment, 'id'>) => Promise<void>;
  updateAdjustment: (adjustmentId: string, updates: Partial<Adjustment>) => Promise<void>;
  deleteAdjustment: (adjustmentId: string) => Promise<void>;
  
  // Data management
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // State for all data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dollarRates, setDollarRates] = useState<DollarRate[]>([]);
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([]);
  const [profitEntries, setProfitEntries] = useState<ProfitEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);

  // Refresh all data from API
  const refreshData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const [
        invoicesRes,
        dollarRatesRes,
        salesRes,
        profitsRes,
        expensesRes,
        employeesRes,
        adjustmentsRes
      ] = await Promise.all([
        apiService.getInvoices(),
        apiService.getDollarRates(),
        apiService.getSales(),
        apiService.getProfits(),
        apiService.getExpenses(),
        apiService.getEmployees(),
        apiService.getAdjustments()
      ]);
      
      setInvoices(invoicesRes.invoices || []);
      setDollarRates(dollarRatesRes || []);
      setSalesEntries(salesRes.sales || []);
      setProfitEntries(profitsRes.profits || []);
      setExpenseEntries(expensesRes.expenses || []);
      setEmployees(employeesRes.employees || []);
      setAdjustments(adjustmentsRes.adjustments || []);
      
      } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
      }
    };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Clear data when user logs out
      setInvoices([]);
      setDollarRates([]);
      setSalesEntries([]);
      setProfitEntries([]);
      setExpenseEntries([]);
      setEmployees([]);
      setAdjustments([]);
    }
  }, [user]);

  // Invoice methods
  const addInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    try {
      await apiService.createInvoice({
      ...invoiceData,
        createdBy: user?.id
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding invoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      await apiService.updateInvoice(invoiceId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      await apiService.deleteInvoice(invoiceId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  const updateInvoicePaymentStatus = async (invoiceId: string, paymentStatus: 'paid' | 'unpaid', paidDate?: string) => {
    try {
      await apiService.updateInvoicePaymentStatus(invoiceId, paymentStatus, paidDate);
      await refreshData();
    } catch (error) {
      console.error('Error updating invoice payment status:', error);
      throw error;
    }
  };

  // Dollar rate methods
  const addDollarRate = async (rateData: Omit<DollarRate, 'id' | 'createdAt'>) => {
    try {
      await apiService.addDollarRate({
      ...rateData,
        enteredBy: user?.id
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding dollar rate:', error);
      throw error;
    }
  };

  // Sales methods
  const addSalesEntry = async (salesData: Omit<SalesEntry, 'id'>) => {
    try {
      await apiService.createSales({
        ...salesData,
        createdBy: user?.id
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding sales entry:', error);
      throw error;
    }
  };

  const updateSalesEntry = async (entryId: string, updates: Partial<SalesEntry>) => {
    try {
      await apiService.updateSales(entryId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating sales entry:', error);
      throw error;
    }
  };

  const deleteSalesEntry = async (entryId: string) => {
    try {
      await apiService.deleteSales(entryId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting sales entry:', error);
      throw error;
    }
  };

  // Profit methods
  const addProfitEntry = async (profitData: Omit<ProfitEntry, 'id'>) => {
    try {
      await apiService.createProfit({
        ...profitData,
        createdBy: user?.id
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding profit entry:', error);
      throw error;
    }
  };

  const updateProfitEntry = async (entryId: string, updates: Partial<ProfitEntry>) => {
    try {
      await apiService.updateProfit(entryId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating profit entry:', error);
      throw error;
    }
  };

  const deleteProfitEntry = async (entryId: string) => {
    try {
      await apiService.deleteProfit(entryId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting profit entry:', error);
      throw error;
    }
  };

  // Expense methods
  const addExpenseEntry = async (expenseData: Omit<ExpenseEntry, 'id'>) => {
    try {
      await apiService.createExpense({
        ...expenseData,
        createdBy: user?.id
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding expense entry:', error);
      throw error;
    }
  };

  const updateExpenseEntry = async (entryId: string, updates: Partial<ExpenseEntry>) => {
    try {
      await apiService.updateExpense(entryId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating expense entry:', error);
      throw error;
    }
  };

  const deleteExpenseEntry = async (entryId: string) => {
    try {
      await apiService.deleteExpense(entryId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting expense entry:', error);
      throw error;
    }
  };

  const updateExpensePaymentStatus = async (expenseId: string, paymentStatus: 'paid' | 'unpaid', paidDate?: string) => {
    try {
      await apiService.updateExpensePaymentStatus(expenseId, paymentStatus, paidDate);
      await refreshData();
    } catch (error) {
      console.error('Error updating expense payment status:', error);
      throw error;
    }
  };

  // Employee methods
  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      await apiService.createEmployee({
      ...employeeData,
        createdBy: user?.id
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    try {
      await apiService.updateEmployee(employeeId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      await apiService.deleteEmployee(employeeId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

  const payEmployeeSalary = async (employeeId: string, amount: number, date: string, notes?: string) => {
    try {
      await apiService.payEmployeeSalary(employeeId, amount, date, notes);
      await refreshData();
    } catch (error) {
      console.error('Error paying employee salary:', error);
      throw error;
    }
  };

  // Adjustment methods
  const addAdjustment = async (adjustmentData: Omit<Adjustment, 'id'>) => {
    try {
      await apiService.createAdjustment({
        ...adjustmentData,
        createdBy: user?.id
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding adjustment:', error);
      throw error;
    }
  };

  const updateAdjustment = async (adjustmentId: string, updates: Partial<Adjustment>) => {
    try {
      await apiService.updateAdjustment(adjustmentId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating adjustment:', error);
      throw error;
    }
  };

  const deleteAdjustment = async (adjustmentId: string) => {
    try {
      await apiService.deleteAdjustment(adjustmentId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        // Data
        invoices,
        dollarRates,
        salesEntries,
        profitEntries,
        expenseEntries,
        employees,
        adjustments,
        
        // Invoice methods
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateInvoicePaymentStatus,
        
        // Dollar rate methods
        addDollarRate,
        
        // Sales methods
        addSalesEntry,
        updateSalesEntry,
        deleteSalesEntry,
        
        // Profit methods
        addProfitEntry,
        updateProfitEntry,
        deleteProfitEntry,
        
        // Expense methods
        addExpenseEntry,
        updateExpenseEntry,
        deleteExpenseEntry,
        updateExpensePaymentStatus,
        
        // Employee methods
        addEmployee,
        updateEmployee,
        deleteEmployee,
        payEmployeeSalary,
        
        // Adjustment methods
        addAdjustment,
        updateAdjustment,
        deleteAdjustment,
        
        // Management
        loading,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};