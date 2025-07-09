import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBranches } from '../../contexts/BranchContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useData } from '../../contexts/DataContext';
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Select from '../Common/Select';
import Modal from '../Common/Modal';
import CurrencyAmountInput from '../Common/CurrencyAmountInput';
import { SalesEntry, ProfitEntry, ExpenseEntry } from '../../types';
import { CurrencyConversion, formatCurrency } from '../../utils/currency';

const MarketModule: React.FC = () => {
  const { t } = useLanguage();
  const { marketBranches } = useBranches();
  const { addNotification } = useNotifications();
  const { 
    salesEntries, 
    profitEntries, 
    expenseEntries, 
    addSalesEntry, 
    updateSalesEntry,
    deleteSalesEntry,
    addProfitEntry, 
    updateProfitEntry,
    deleteProfitEntry,
    addExpenseEntry,
    updateExpenseEntry,
    deleteExpenseEntry,
    updateExpensePaymentStatus
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'sales' | 'profits' | 'expenses'>('sales');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [keepFormOpen, setKeepFormOpen] = useState(true);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | ProfitEntry | ExpenseEntry | null>(null);

  // Refs for Add Sales form
  const addSalesBranchRef = useRef<HTMLSelectElement>(null);
  const addSalesNameRef = useRef<HTMLInputElement>(null);
  const addSalesAmountRef = useRef<HTMLInputElement>(null);
  const addSalesDateRef = useRef<HTMLInputElement>(null);
  const addSalesNotesRef = useRef<HTMLInputElement>(null);

  // Refs for Edit Sales form
  const editSalesNameRef = useRef<HTMLInputElement>(null);
  const editSalesAmountRef = useRef<HTMLInputElement>(null);
  const editSalesDateRef = useRef<HTMLInputElement>(null);
  const editSalesNotesRef = useRef<HTMLInputElement>(null);

  // Refs for Add Profit form
  const addProfitBranchRef = useRef<HTMLSelectElement>(null);
  const addProfitNameRef = useRef<HTMLInputElement>(null);
  const addProfitAmountRef = useRef<HTMLInputElement>(null);
  const addProfitDateRef = useRef<HTMLInputElement>(null);
  const addProfitNotesRef = useRef<HTMLInputElement>(null);

  // Refs for Edit Profit form
  const editProfitNameRef = useRef<HTMLInputElement>(null);
  const editProfitAmountRef = useRef<HTMLInputElement>(null);
  const editProfitDateRef = useRef<HTMLInputElement>(null);
  const editProfitNotesRef = useRef<HTMLInputElement>(null);

  // Refs for Add Expense form
  const addExpenseBranchRef = useRef<HTMLSelectElement>(null);
  const addExpenseNameRef = useRef<HTMLInputElement>(null);
  const addExpenseAmountRef = useRef<HTMLInputElement>(null);
  const addExpenseDateRef = useRef<HTMLInputElement>(null);
  const addExpenseNotesRef = useRef<HTMLInputElement>(null);

  // Refs for Edit Expense form
  const editExpenseNameRef = useRef<HTMLInputElement>(null);
  const editExpenseAmountRef = useRef<HTMLInputElement>(null);
  const editExpenseDateRef = useRef<HTMLInputElement>(null);
  const editExpenseNotesRef = useRef<HTMLInputElement>(null);

  const [newSales, setNewSales] = useState({
    branchId: '',
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [salesConversion, setSalesConversion] = useState<CurrencyConversion | null>(null);

  const [editSales, setEditSales] = useState({
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    date: '',
    notes: ''
  });

  const [editSalesConversion, setEditSalesConversion] = useState<CurrencyConversion | null>(null);

  const [newProfit, setNewProfit] = useState({
    branchId: '',
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [profitConversion, setProfitConversion] = useState<CurrencyConversion | null>(null);

  const [editProfit, setEditProfit] = useState({
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    date: '',
    notes: ''
  });

  const [editProfitConversion, setEditProfitConversion] = useState<CurrencyConversion | null>(null);

  const [newExpense, setNewExpense] = useState({
    branchId: '',
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [expenseConversion, setExpenseConversion] = useState<CurrencyConversion | null>(null);

  const [editExpense, setEditExpense] = useState({
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    date: '',
    notes: ''
  });

  const [editExpenseConversion, setEditExpenseConversion] = useState<CurrencyConversion | null>(null);

  // Handle Enter key navigation for Add Sales
  const handleAddSalesKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'branch':
          addSalesNameRef.current?.focus();
          break;
        case 'name':
          addSalesAmountRef.current?.focus();
          break;
        case 'amount':
          addSalesDateRef.current?.focus();
          break;
        case 'date':
          addSalesNotesRef.current?.focus();
          break;
        case 'notes':
          handleAddSales();
          break;
      }
    }
  };

  // Handle Enter key navigation for Edit Sales
  const handleEditSalesKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'name':
          editSalesAmountRef.current?.focus();
          break;
        case 'amount':
          editSalesDateRef.current?.focus();
          break;
        case 'date':
          editSalesNotesRef.current?.focus();
          break;
        case 'notes':
          handleEditSales();
          break;
      }
    }
  };

  // Handle Enter key navigation for Add Profit
  const handleAddProfitKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'branch':
          addProfitNameRef.current?.focus();
          break;
        case 'name':
          addProfitAmountRef.current?.focus();
          break;
        case 'amount':
          addProfitDateRef.current?.focus();
          break;
        case 'date':
          addProfitNotesRef.current?.focus();
          break;
        case 'notes':
          handleAddProfit();
          break;
      }
    }
  };

  // Handle Enter key navigation for Edit Profit
  const handleEditProfitKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'name':
          editProfitAmountRef.current?.focus();
          break;
        case 'amount':
          editProfitDateRef.current?.focus();
          break;
        case 'date':
          editProfitNotesRef.current?.focus();
          break;
        case 'notes':
          handleEditProfit();
          break;
      }
    }
  };

  // Handle Enter key navigation for Add Expense
  const handleAddExpenseKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'branch':
          addExpenseNameRef.current?.focus();
          break;
        case 'name':
          addExpenseAmountRef.current?.focus();
          break;
        case 'amount':
          addExpenseDateRef.current?.focus();
          break;
        case 'date':
          addExpenseNotesRef.current?.focus();
          break;
        case 'notes':
          handleAddExpense();
          break;
      }
    }
  };

  // Handle Enter key navigation for Edit Expense
  const handleEditExpenseKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'name':
          editExpenseAmountRef.current?.focus();
          break;
        case 'amount':
          editExpenseDateRef.current?.focus();
          break;
        case 'date':
          editExpenseNotesRef.current?.focus();
          break;
        case 'notes':
          handleEditExpense();
          break;
      }
    }
  };

  const handleAddSales = async () => {
    if (!newSales.branchId) {
      addNotification({
        type: 'expense',
        title: 'Branch Required',
        message: 'Please select a branch before adding a sales entry.',
        priority: 'medium'
      });
      return;
    }
    if (!newSales.name || !newSales.amount) {
      addNotification({
        type: 'expense',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    if (!salesConversion) {
      addNotification({
        type: 'expense',
        title: 'Conversion Error',
        message: 'Currency conversion failed. Please check exchange rates.',
        priority: 'medium'
      });
      return;
    }

    try {
      await addSalesEntry({
        branchId: newSales.branchId,
        name: newSales.name,
        amount: parseFloat(newSales.amount),
        currency: newSales.currency,
        convertedAmount: salesConversion.convertedAmount,
        exchangeRate: salesConversion.exchangeRate,
        rateDate: salesConversion.rateDate,
        date: newSales.date,
        notes: newSales.notes,
        createdBy: 'current-user'
      });
      
      addNotification({
        type: 'expense',
        title: 'Sales Entry Added',
        message: `Sales entry "${newSales.name}" for ${newSales.amount} ${newSales.currency} has been added.`,
        priority: 'low'
      });
      
      if (keepFormOpen) {
        setNewSales({
          branchId: newSales.branchId,
          name: '',
          amount: '',
          currency: newSales.currency,
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        setTimeout(() => addSalesNameRef.current?.focus(), 100);
      } else {
        setShowAddModal(false);
      }
    } catch (error) {
      addNotification({
        type: 'expense',
        title: 'Error',
        message: 'Failed to add sales entry. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleEditSales = async () => {
    if (!editingEntry) return;

    if (!editSales.name || !editSales.amount) {
      addNotification({
        type: 'expense',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    try {
      await updateSalesEntry(editingEntry.id, {
        name: editSales.name,
        amount: parseFloat(editSales.amount),
        date: editSales.date,
        notes: editSales.notes
      });

      addNotification({
        type: 'expense',
        title: 'Sales Entry Updated',
        message: `Sales entry "${editSales.name}" has been updated successfully.`,
        priority: 'low'
      });

      setShowEditModal(false);
      setEditingEntry(null);
    } catch (error) {
      addNotification({
        type: 'expense',
        title: 'Update Failed',
        message: 'Failed to update sales entry. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleAddProfit = async () => {
    if (!newProfit.branchId) {
      addNotification({
        type: 'expense',
        title: 'Branch Required',
        message: 'Please select a branch before adding a profit entry.',
        priority: 'medium'
      });
      return;
    }
    if (!newProfit.name || !newProfit.amount) {
      addNotification({
        type: 'expense',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    if (!profitConversion) {
      addNotification({
        type: 'expense',
        title: 'Conversion Error',
        message: 'Currency conversion failed. Please check exchange rates.',
        priority: 'medium'
      });
      return;
    }

    try {
      await addProfitEntry({
        branchId: newProfit.branchId,
        name: newProfit.name,
        amount: parseFloat(newProfit.amount),
        currency: newProfit.currency,
        convertedAmount: profitConversion.convertedAmount,
        exchangeRate: profitConversion.exchangeRate,
        rateDate: profitConversion.rateDate,
        date: newProfit.date,
        notes: newProfit.notes,
        createdBy: 'current-user'
      });
      
      addNotification({
        type: 'expense',
        title: 'Profit Entry Added',
        message: `Profit entry "${newProfit.name}" for ${newProfit.amount} ${newProfit.currency} has been added.`,
        priority: 'low'
      });
      
      if (keepFormOpen) {
        setNewProfit({
          branchId: newProfit.branchId,
          name: '',
          amount: '',
          currency: newProfit.currency,
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        setTimeout(() => addProfitNameRef.current?.focus(), 100);
      } else {
        setShowAddModal(false);
      }
    } catch (error) {
      addNotification({
        type: 'expense',
        title: 'Error',
        message: 'Failed to add profit entry. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleEditProfit = async () => {
    if (!editingEntry) return;

    if (!editProfit.name || !editProfit.amount) {
      addNotification({
        type: 'expense',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    try {
      await updateProfitEntry(editingEntry.id, {
        name: editProfit.name,
        amount: parseFloat(editProfit.amount),
        date: editProfit.date,
        notes: editProfit.notes
      });

      addNotification({
        type: 'expense',
        title: 'Profit Entry Updated',
        message: `Profit entry "${editProfit.name}" has been updated successfully.`,
        priority: 'low'
      });

      setShowEditModal(false);
      setEditingEntry(null);
    } catch (error) {
      addNotification({
        type: 'expense',
        title: 'Update Failed',
        message: 'Failed to update profit entry. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.branchId) {
      addNotification({
        type: 'expense',
        title: 'Branch Required',
        message: 'Please select a branch before adding an expense entry.',
        priority: 'medium'
      });
      return;
    }
    if (!newExpense.name || !newExpense.amount) {
      addNotification({
        type: 'expense',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    if (!expenseConversion) {
      addNotification({
        type: 'expense',
        title: 'Conversion Error',
        message: 'Currency conversion failed. Please check exchange rates.',
        priority: 'medium'
      });
      return;
    }

    try {
      await addExpenseEntry({
        branchId: newExpense.branchId,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        currency: newExpense.currency,
        convertedAmount: expenseConversion.convertedAmount,
        exchangeRate: expenseConversion.exchangeRate,
        rateDate: expenseConversion.rateDate,
        date: newExpense.date,
        notes: newExpense.notes,
        paymentStatus: 'unpaid',
        createdBy: 'current-user'
      });
      
      addNotification({
        type: 'expense',
        title: 'Expense Entry Added',
        message: `Expense entry "${newExpense.name}" for ${newExpense.amount} ${newExpense.currency} has been added.`,
        priority: 'low'
      });
      
      if (keepFormOpen) {
        setNewExpense({
          branchId: newExpense.branchId,
          name: '',
          amount: '',
          currency: newExpense.currency,
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        setTimeout(() => addExpenseNameRef.current?.focus(), 100);
      } else {
        setShowAddModal(false);
      }
    } catch (error) {
      addNotification({
        type: 'expense',
        title: 'Error',
        message: 'Failed to add expense entry. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleEditExpense = async () => {
    if (!editingEntry) return;

    if (!editExpense.name || !editExpense.amount) {
      addNotification({
        type: 'expense',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    try {
      await updateExpenseEntry(editingEntry.id, {
        name: editExpense.name,
        amount: parseFloat(editExpense.amount),
        date: editExpense.date,
        notes: editExpense.notes
      });

      addNotification({
        type: 'expense',
        title: 'Expense Entry Updated',
        message: `Expense entry "${editExpense.name}" has been updated successfully.`,
        priority: 'low'
      });

      setShowEditModal(false);
      setEditingEntry(null);
    } catch (error) {
      addNotification({
        type: 'expense',
        title: 'Update Failed',
        message: 'Failed to update expense entry. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleEdit = (entry: SalesEntry | ProfitEntry | ExpenseEntry) => {
    setEditingEntry(entry);
    if (activeTab === 'sales') {
      setEditSales({
        name: entry.name,
        amount: entry.amount.toString(),
        currency: entry.currency,
        date: entry.date,
        notes: entry.notes || ''
      });
      setTimeout(() => editSalesNameRef.current?.focus(), 100);
    } else if (activeTab === 'profits') {
      setEditProfit({
        name: entry.name,
        amount: entry.amount.toString(),
        currency: entry.currency,
        date: entry.date,
        notes: entry.notes || ''
      });
      setTimeout(() => editProfitNameRef.current?.focus(), 100);
    } else if (activeTab === 'expenses') {
      setEditExpense({
        name: entry.name,
        amount: entry.amount.toString(),
        currency: entry.currency,
        date: entry.date,
        notes: entry.notes || ''
      });
      setTimeout(() => editExpenseNameRef.current?.focus(), 100);
    }
    setShowEditModal(true);
  };

  const handleDelete = async (entry: SalesEntry | ProfitEntry | ExpenseEntry) => {
    if (!confirm(`Are you sure you want to delete the ${activeTab.slice(0, -1)} entry "${entry.name}"?`)) {
      return;
    }

    try {
      if (activeTab === 'sales') {
        await deleteSalesEntry(entry.id);
      } else if (activeTab === 'profits') {
        await deleteProfitEntry(entry.id);
      } else if (activeTab === 'expenses') {
        await deleteExpenseEntry(entry.id);
      }

      addNotification({
        type: 'expense',
        title: 'Entry Deleted',
        message: `${activeTab.slice(0, -1)} entry "${entry.name}" has been deleted.`,
        priority: 'low'
      });
    } catch (error) {
      addNotification({
        type: 'expense',
        title: 'Delete Failed',
        message: `Failed to delete ${activeTab.slice(0, -1)} entry. Please try again.`,
        priority: 'high'
      });
    }
  };

  const handleMarkAsPaid = (expenseId: string) => {
    const currentDate = new Date();
    const paidDate = currentDate.toISOString();
    
    updateExpensePaymentStatus(expenseId, 'paid', paidDate);
    
    // Add notification for payment
    const expense = expenseEntries.find(e => e.id === expenseId);
    if (expense) {
      const amountDisplay = expense.currency === 'USD' 
        ? `${(expense.convertedAmount || 0).toLocaleString()} IQD ($${(expense.amount || 0).toLocaleString()})`
        : `${(expense.convertedAmount || expense.amount || 0).toLocaleString()} IQD`;
        
      addNotification({
        type: 'expense',
        title: 'Expense Payment Processed',
        message: `Payment of ${amountDisplay} has been processed and marked as paid.`,
        priority: 'low'
      });
    }
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'sales':
        return salesEntries.filter(entry => !selectedBranch || entry.branchId === selectedBranch);
      case 'profits':
        return profitEntries.filter(entry => !selectedBranch || entry.branchId === selectedBranch);
      case 'expenses':
        return expenseEntries.filter(entry => !selectedBranch || entry.branchId === selectedBranch);
      default:
        return [];
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'sales':
        return <DollarSign className="w-4 h-4" />;
      case 'profits':
        return <TrendingUp className="w-4 h-4" />;
      case 'expenses':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTabColor = (tab: string) => {
    switch (tab) {
      case 'sales':
        return 'text-blue-600 dark:text-blue-400';
      case 'profits':
        return 'text-green-600 dark:text-green-400';
      case 'expenses':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    // Focus appropriate field based on active tab
    setTimeout(() => {
      if (activeTab === 'sales') {
        addSalesBranchRef.current?.focus();
      } else if (activeTab === 'profits') {
        addProfitBranchRef.current?.focus();
      } else if (activeTab === 'expenses') {
        addExpenseBranchRef.current?.focus();
      }
    }, 100);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('market')}
        </h1>
        <Button
          onClick={openAddModal}
          className="flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      {/* Branch Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <Select
          label="Filter by Branch"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          options={[
            { value: '', label: 'All Branches' },
            ...marketBranches.filter(branch => branch.isActive).map(branch => ({ 
              value: branch.id, 
              label: `${branch.name} - ${branch.location}` 
            }))
          ]}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {['sales', 'profits', 'expenses'].map((tab) => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {getTabIcon(tab)}
                  <span className="capitalize">{tab}</span>
                </div>
                </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Date
                    </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  Notes
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                    </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {getActiveData().map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {entry.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className={getTabColor(activeTab)}>
                      {entry.currency === 'USD' 
                        ? `${(entry.convertedAmount || 0).toLocaleString()} IQD ($${(entry.amount || 0).toLocaleString()})`
                        : `${(entry.convertedAmount || entry.amount || 0).toLocaleString()} IQD`
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden md:table-cell">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                    <div className="max-w-xs truncate">
                      {entry.notes || '-'}
                    </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {activeTab === 'expenses' && (entry as ExpenseEntry).paymentStatus === 'unpaid' && (
                          <Button
                            onClick={() => handleMarkAsPaid(entry.id)}
                            variant="success"
                            size="sm"
                          className="ml-2"
                          >
                          <span className="hidden sm:inline">Mark as </span>Paid
                          </Button>
                        )}
                    </div>
                      </td>
                  </tr>
                ))}
              {getActiveData().length === 0 && (
                  <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No {activeTab} entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add ${activeTab.slice(0, -1)} Entry`}
      >
        <div className="space-y-4">
          {/* Keep Form Open Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Quick Entry Mode
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={keepFormOpen}
                onChange={(e) => setKeepFormOpen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {/* Sales Form */}
          {activeTab === 'sales' && (
            <>
              <Select
                ref={addSalesBranchRef}
                label="Branch"
                value={newSales.branchId}
                onChange={(e) => setNewSales({...newSales, branchId: e.target.value})}
                onKeyDown={(e) => handleAddSalesKeyDown(e, 'branch')}
                options={[
                  { value: '', label: 'Select Branch' },
                  ...marketBranches.filter(branch => branch.isActive).map(branch => ({ 
                    value: branch.id, 
                    label: `${branch.name} - ${branch.location}` 
                  }))
                ]}
              />
              <Input
                ref={addSalesNameRef}
                label="Sales Name"
                value={newSales.name}
                onChange={(e) => setNewSales({...newSales, name: e.target.value})}
                onKeyDown={(e) => handleAddSalesKeyDown(e, 'name')}
                placeholder="Enter sales name"
              />
                        <CurrencyAmountInput
                label="Amount"
                amount={newSales.amount}
                currency={newSales.currency}
                entryDate={newSales.date}
                onAmountChange={(amount) => setNewSales({...newSales, amount})}
                onCurrencyChange={(currency) => setNewSales({...newSales, currency})}
                onConversionChange={setSalesConversion}
                amountRef={addSalesAmountRef}
                onAmountKeyDown={(e) => handleAddSalesKeyDown(e, 'amount')}
                placeholder="Enter amount"
                required
              />
              <Input
                ref={addSalesDateRef}
                label="Date"
                type="date"
                value={newSales.date}
                onChange={(e) => setNewSales({...newSales, date: e.target.value})}
                onKeyDown={(e) => handleAddSalesKeyDown(e, 'date')}
              />
              <Input
                ref={addSalesNotesRef}
                label="Notes"
                value={newSales.notes}
                onChange={(e) => setNewSales({...newSales, notes: e.target.value})}
                onKeyDown={(e) => handleAddSalesKeyDown(e, 'notes')}
                placeholder="Optional notes"
              />
            </>
          )}

          {/* Profit Form */}
          {activeTab === 'profits' && (
            <>
              <Select
                ref={addProfitBranchRef}
                label="Branch"
                value={newProfit.branchId}
                onChange={(e) => setNewProfit({...newProfit, branchId: e.target.value})}
                onKeyDown={(e) => handleAddProfitKeyDown(e, 'branch')}
                options={[
                  { value: '', label: 'Select Branch' },
                  ...marketBranches.filter(branch => branch.isActive).map(branch => ({ 
                    value: branch.id, 
                    label: `${branch.name} - ${branch.location}` 
                  }))
                ]}
              />
              <Input
                ref={addProfitNameRef}
                label="Profit Name"
                value={newProfit.name}
                onChange={(e) => setNewProfit({...newProfit, name: e.target.value})}
                onKeyDown={(e) => handleAddProfitKeyDown(e, 'name')}
                placeholder="Enter profit name"
              />
              <CurrencyAmountInput
                label="Amount"
                amount={newProfit.amount}
                currency={newProfit.currency}
                entryDate={newProfit.date}
                onAmountChange={(amount) => setNewProfit({...newProfit, amount})}
                onCurrencyChange={(currency) => setNewProfit({...newProfit, currency})}
                onConversionChange={setProfitConversion}
                amountRef={addProfitAmountRef}
                onAmountKeyDown={(e) => handleAddProfitKeyDown(e, 'amount')}
                placeholder="Enter amount"
                required
              />
          <Input
                ref={addProfitDateRef}
                label="Date"
            type="date"
                value={newProfit.date}
                onChange={(e) => setNewProfit({...newProfit, date: e.target.value})}
                onKeyDown={(e) => handleAddProfitKeyDown(e, 'date')}
              />
              <Input
                ref={addProfitNotesRef}
                label="Notes"
                value={newProfit.notes}
                onChange={(e) => setNewProfit({...newProfit, notes: e.target.value})}
                onKeyDown={(e) => handleAddProfitKeyDown(e, 'notes')}
                placeholder="Optional notes"
              />
            </>
          )}

          {/* Expense Form */}
          {activeTab === 'expenses' && (
            <>
              <Select
                ref={addExpenseBranchRef}
                label="Branch"
                value={newExpense.branchId}
                onChange={(e) => setNewExpense({...newExpense, branchId: e.target.value})}
                onKeyDown={(e) => handleAddExpenseKeyDown(e, 'branch')}
                options={[
                  { value: '', label: 'Select Branch' },
                  ...marketBranches.filter(branch => branch.isActive).map(branch => ({ 
                    value: branch.id, 
                    label: `${branch.name} - ${branch.location}` 
                  }))
                ]}
              />
              <Input
                ref={addExpenseNameRef}
                label="Expense Name"
                value={newExpense.name}
                onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                onKeyDown={(e) => handleAddExpenseKeyDown(e, 'name')}
                placeholder="Enter expense name"
              />
              <CurrencyAmountInput
                label="Amount"
                amount={newExpense.amount}
                currency={newExpense.currency}
                entryDate={newExpense.date}
                onAmountChange={(amount) => setNewExpense({...newExpense, amount})}
                onCurrencyChange={(currency) => setNewExpense({...newExpense, currency})}
                onConversionChange={setExpenseConversion}
                amountRef={addExpenseAmountRef}
                onAmountKeyDown={(e) => handleAddExpenseKeyDown(e, 'amount')}
                placeholder="Enter amount"
                required
              />
              <Input
                ref={addExpenseDateRef}
                label="Date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                onKeyDown={(e) => handleAddExpenseKeyDown(e, 'date')}
              />
              <Input
                ref={addExpenseNotesRef}
                label="Notes"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                onKeyDown={(e) => handleAddExpenseKeyDown(e, 'notes')}
                placeholder="Optional notes"
              />
            </>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={() => {
              if (activeTab === 'sales') handleAddSales();
              else if (activeTab === 'profits') handleAddProfit();
              else if (activeTab === 'expenses') handleAddExpense();
            }} className="flex-1">
              {keepFormOpen ? 'Save & Add Another' : 'Save'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddModal(false);
                setKeepFormOpen(true);
              }} 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEntry(null);
        }}
        title={`Edit ${activeTab.slice(0, -1)} Entry`}
      >
        <div className="space-y-4">
          {/* Sales Edit Form */}
          {activeTab === 'sales' && (
            <>
              <Input
                ref={editSalesNameRef}
                label="Sales Name"
                value={editSales.name}
                onChange={(e) => setEditSales({...editSales, name: e.target.value})}
                onKeyDown={(e) => handleEditSalesKeyDown(e, 'name')}
                placeholder="Enter sales name"
              />
              <CurrencyAmountInput
                label="Amount"
                amount={editSales.amount}
                currency={editSales.currency}
                entryDate={editSales.date}
                onAmountChange={(amount) => setEditSales({...editSales, amount})}
                onCurrencyChange={(currency) => setEditSales({...editSales, currency})}
                onConversionChange={setEditSalesConversion}
                amountRef={editSalesAmountRef}
                onAmountKeyDown={(e) => handleEditSalesKeyDown(e, 'amount')}
                placeholder="Enter amount"
                required
              />
              <Input
                ref={editSalesDateRef}
                label="Date"
                type="date"
                value={editSales.date}
                onChange={(e) => setEditSales({...editSales, date: e.target.value})}
                onKeyDown={(e) => handleEditSalesKeyDown(e, 'date')}
              />
              <Input
                ref={editSalesNotesRef}
                label="Notes"
                value={editSales.notes}
                onChange={(e) => setEditSales({...editSales, notes: e.target.value})}
                onKeyDown={(e) => handleEditSalesKeyDown(e, 'notes')}
                placeholder="Optional notes"
              />
            </>
          )}

          {/* Profit Edit Form */}
          {activeTab === 'profits' && (
            <>
              <Input
                ref={editProfitNameRef}
                label="Profit Name"
                value={editProfit.name}
                onChange={(e) => setEditProfit({...editProfit, name: e.target.value})}
                onKeyDown={(e) => handleEditProfitKeyDown(e, 'name')}
                placeholder="Enter profit name"
              />
              <CurrencyAmountInput
                label="Amount"
                amount={editProfit.amount}
                currency={editProfit.currency}
                entryDate={editProfit.date}
                onAmountChange={(amount) => setEditProfit({...editProfit, amount})}
                onCurrencyChange={(currency) => setEditProfit({...editProfit, currency})}
                onConversionChange={setEditProfitConversion}
                amountRef={editProfitAmountRef}
                onAmountKeyDown={(e) => handleEditProfitKeyDown(e, 'amount')}
                placeholder="Enter amount"
                required
              />
              <Input
                ref={editProfitDateRef}
                label="Date"
                type="date"
                value={editProfit.date}
                onChange={(e) => setEditProfit({...editProfit, date: e.target.value})}
                onKeyDown={(e) => handleEditProfitKeyDown(e, 'date')}
              />
              <Input
                ref={editProfitNotesRef}
                label="Notes"
                value={editProfit.notes}
                onChange={(e) => setEditProfit({...editProfit, notes: e.target.value})}
                onKeyDown={(e) => handleEditProfitKeyDown(e, 'notes')}
                placeholder="Optional notes"
              />
            </>
          )}

          {/* Expense Edit Form */}
          {activeTab === 'expenses' && (
            <>
              <Input
                ref={editExpenseNameRef}
                label="Expense Name"
                value={editExpense.name}
                onChange={(e) => setEditExpense({...editExpense, name: e.target.value})}
                onKeyDown={(e) => handleEditExpenseKeyDown(e, 'name')}
                placeholder="Enter expense name"
              />
              <CurrencyAmountInput
                label="Amount"
                amount={editExpense.amount}
                currency={editExpense.currency}
                entryDate={editExpense.date}
                onAmountChange={(amount) => setEditExpense({...editExpense, amount})}
                onCurrencyChange={(currency) => setEditExpense({...editExpense, currency})}
                onConversionChange={setEditExpenseConversion}
                amountRef={editExpenseAmountRef}
                onAmountKeyDown={(e) => handleEditExpenseKeyDown(e, 'amount')}
                placeholder="Enter amount"
                required
              />
              <Input
                ref={editExpenseDateRef}
                label="Date"
                type="date"
                value={editExpense.date}
                onChange={(e) => setEditExpense({...editExpense, date: e.target.value})}
                onKeyDown={(e) => handleEditExpenseKeyDown(e, 'date')}
              />
              <Input
                ref={editExpenseNotesRef}
                label="Notes"
                value={editExpense.notes}
                onChange={(e) => setEditExpense({...editExpense, notes: e.target.value})}
                onKeyDown={(e) => handleEditExpenseKeyDown(e, 'notes')}
                placeholder="Optional notes"
              />
            </>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={() => {
              if (activeTab === 'sales') handleEditSales();
              else if (activeTab === 'profits') handleEditProfit();
              else if (activeTab === 'expenses') handleEditExpense();
            }} className="flex-1">
              Update Entry
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                setEditingEntry(null);
              }} 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MarketModule;