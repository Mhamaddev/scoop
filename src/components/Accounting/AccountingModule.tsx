import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBranches } from '../../contexts/BranchContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useData } from '../../contexts/DataContext';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Select from '../Common/Select';
import Modal from '../Common/Modal';
import { Invoice, Branch, DollarRate } from '../../types';

const AccountingModule: React.FC = () => {
  const { t } = useLanguage();
  const { accountingBranches } = useBranches();
  const { addNotification } = useNotifications();
  const { invoices, addInvoice, updateInvoice, deleteInvoice, updateInvoicePaymentStatus, addDollarRate } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [keepFormOpen, setKeepFormOpen] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Refs for Add Invoice form fields
  const addBranchRef = useRef<HTMLSelectElement>(null);
  const addNameRef = useRef<HTMLInputElement>(null);
  const addAmountRef = useRef<HTMLInputElement>(null);
  const addCurrencyRef = useRef<HTMLSelectElement>(null);
  const addDateRef = useRef<HTMLInputElement>(null);
  const addStatusRef = useRef<HTMLSelectElement>(null);
  const addNotesRef = useRef<HTMLInputElement>(null);

  // Refs for Edit Invoice form fields  
  const editNameRef = useRef<HTMLInputElement>(null);
  const editAmountRef = useRef<HTMLInputElement>(null);
  const editCurrencyRef = useRef<HTMLSelectElement>(null);
  const editDateRef = useRef<HTMLInputElement>(null);
  const editStatusRef = useRef<HTMLSelectElement>(null);
  const editNotesRef = useRef<HTMLInputElement>(null);

  // Refs for Daily Rate form fields
  const rateDateRef = useRef<HTMLInputElement>(null);
  const rateValueRef = useRef<HTMLInputElement>(null);

  const [newInvoice, setNewInvoice] = useState({
    branchId: '',
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    invoiceDate: new Date().toISOString().split('T')[0],
    notes: '',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid'
  });

  const [editInvoice, setEditInvoice] = useState({
    name: '',
    amount: '',
    currency: 'IQD' as 'USD' | 'IQD',
    invoiceDate: '',
    notes: '',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid'
  });

  const [dailyRate, setDailyRate] = useState({
    date: new Date().toISOString().split('T')[0],
    rate: ''
  });

  // Handle Enter key navigation
  const handleAddFormKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'branch':
          addNameRef.current?.focus();
          break;
        case 'name':
          addAmountRef.current?.focus();
          break;
        case 'amount':
          addCurrencyRef.current?.focus();
          break;
        case 'currency':
          addDateRef.current?.focus();
          break;
        case 'date':
          addStatusRef.current?.focus();
          break;
        case 'status':
          addNotesRef.current?.focus();
          break;
        case 'notes':
          handleAddInvoice();
          break;
      }
    }
  };

  const handleEditFormKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'name':
          editAmountRef.current?.focus();
          break;
        case 'amount':
          editCurrencyRef.current?.focus();
          break;
        case 'currency':
          editDateRef.current?.focus();
          break;
        case 'date':
          editStatusRef.current?.focus();
          break;
        case 'status':
          editNotesRef.current?.focus();
          break;
        case 'notes':
          handleEditInvoice();
          break;
      }
    }
  };

  const handleRateFormKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'date':
          rateValueRef.current?.focus();
          break;
        case 'rate':
          handleAddDailyRate();
          break;
      }
    }
  };

  const handleAddInvoice = () => {
    if (!newInvoice.branchId) {
      addNotification({
        type: 'invoice',
        title: 'Branch Required',
        message: 'Please select a branch before adding an invoice.',
        priority: 'medium'
      });
      return;
    }
    if (!newInvoice.name || !newInvoice.amount) {
      addNotification({
        type: 'invoice',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    addInvoice({
      branchId: newInvoice.branchId,
      name: newInvoice.name,
      amount: parseFloat(newInvoice.amount),
      currency: newInvoice.currency,
      invoiceDate: newInvoice.invoiceDate,
      entryDate: new Date().toISOString().split('T')[0],
      notes: newInvoice.notes,
      paymentStatus: newInvoice.paymentStatus,
      createdBy: 'current-user'
    });
    
    // Add notification for new invoice
    addNotification({
      type: 'invoice',
      title: 'New Invoice Created',
      message: `Invoice "${newInvoice.name}" for ${newInvoice.amount.toLocaleString()} ${newInvoice.currency} has been created.`,
      priority: 'medium'
    });
    
    if (keepFormOpen) {
      // Keep the modal open and reset form for next entry
      setNewInvoice({
        branchId: newInvoice.branchId, // Keep the same branch
        name: '',
        amount: '',
        currency: newInvoice.currency, // Keep the same currency
        invoiceDate: new Date().toISOString().split('T')[0],
        notes: '',
        paymentStatus: newInvoice.paymentStatus // Keep the same payment status
      });
      // Focus back to name field in quick entry mode
      setTimeout(() => addNameRef.current?.focus(), 100);
    } else {
      setShowAddModal(false);
    }
  };

  const handleEditInvoice = async () => {
    if (!editingInvoice) return;

    if (!editInvoice.name || !editInvoice.amount) {
      addNotification({
        type: 'invoice',
        title: 'Missing Information',
        message: 'Please fill in all required fields (name and amount).',
        priority: 'medium'
      });
      return;
    }

    try {
      await updateInvoice(editingInvoice.id, {
        name: editInvoice.name,
        amount: parseFloat(editInvoice.amount),
        currency: editInvoice.currency,
        invoiceDate: editInvoice.invoiceDate,
        notes: editInvoice.notes,
        paymentStatus: editInvoice.paymentStatus
      });

      // Add notification for updated invoice
      addNotification({
        type: 'invoice',
        title: 'Invoice Updated',
        message: `Invoice "${editInvoice.name}" has been updated successfully.`,
        priority: 'low'
      });

      setShowEditModal(false);
      setEditingInvoice(null);
    } catch (error) {
      addNotification({
        type: 'invoice',
        title: 'Update Failed',
        message: 'Failed to update invoice. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleEditClick = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditInvoice({
      name: invoice.name,
      amount: invoice.amount.toString(),
      currency: invoice.currency,
      invoiceDate: invoice.invoiceDate,
      notes: invoice.notes || '',
      paymentStatus: invoice.paymentStatus
    });
    setShowEditModal(true);
    // Focus first field when modal opens
    setTimeout(() => editNameRef.current?.focus(), 100);
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const currentDate = new Date();
    const paidDate = currentDate.toISOString().split('T')[0];
    
    updateInvoicePaymentStatus(invoiceId, 'paid', paidDate);
    
    // Add notification for payment
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      addNotification({
        type: 'invoice',
        title: 'Invoice Payment Processed',
        message: `Payment of ${invoice.amount.toLocaleString()} ${invoice.currency} has been processed and marked as paid.`,
        priority: 'low'
      });
    }
  };

  const handleAddDailyRate = () => {
    if (!dailyRate.rate) {
      addNotification({
        type: 'rate',
        title: 'Rate Required',
        message: 'Please enter the daily exchange rate.',
        priority: 'medium'
      });
      return;
    }

    addDollarRate({
      date: dailyRate.date,
      rate: parseFloat(dailyRate.rate),
      enteredBy: 'current-user'
    });
    
    // Add notification for daily rate update
    addNotification({
      type: 'rate',
      title: 'Daily Rate Updated',
      message: `USD to IQD exchange rate has been updated to ${dailyRate.rate} for ${new Date(dailyRate.date).toLocaleDateString()}.`,
      priority: 'low'
    });
    
    setDailyRate({
      date: new Date().toISOString().split('T')[0],
      rate: ''
    });
    setShowRateModal(false);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.paymentStatus === filterStatus;
    const matchesBranch = !selectedBranch || invoice.branchId === selectedBranch;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('accounting')}
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            onClick={() => {
              setShowRateModal(true);
              setTimeout(() => rateDateRef.current?.focus(), 100);
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {t('dailyRate')}
          </Button>
          <Button
            onClick={() => {
              setShowAddModal(true);
              setTimeout(() => addBranchRef.current?.focus(), 100);
            }}
            className="flex items-center justify-center w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addInvoice')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Filter by Branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            options={[
              { value: '', label: 'All Branches' },
              ...accountingBranches.filter(branch => branch.isActive).map(branch => ({ 
                value: branch.id, 
                label: `${branch.name} - ${branch.location}` 
              }))
            ]}
          />
          
          <Input
            label={t('search')}
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select
            label={t('status')}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'paid', label: t('paid') },
              { value: 'unpaid', label: t('unpaid') }
            ]}
          />
          
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('filter')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('invoiceName')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  {t('currency')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  {t('invoiceDate')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('paymentStatus')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="truncate max-w-32 sm:max-w-none">
                    {invoice.name}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {invoice.currency} • {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                    {invoice.currency}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden md:table-cell">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {t(invoice.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditClick(invoice)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this invoice?')) {
                          deleteInvoice(invoice.id);
                          addNotification({
                            type: 'invoice',
                            title: 'Invoice Deleted',
                            message: `Invoice "${invoice.name}" has been deleted.`,
                            priority: 'low'
                          });
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {invoice.paymentStatus === 'unpaid' && (
                      <Button
                        onClick={() => handleMarkAsPaid(invoice.id)}
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
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('addInvoice')}
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
          
          <Select
            ref={addBranchRef}
            label={t('branch')}
            value={newInvoice.branchId}
            onChange={(e) => setNewInvoice({...newInvoice, branchId: e.target.value})}
            onKeyDown={(e) => handleAddFormKeyDown(e, 'branch')}
            options={[
              { value: '', label: t('selectBranch') },
              ...accountingBranches.filter(branch => branch.isActive).map(branch => ({ 
                value: branch.id, 
                label: `${branch.name} - ${branch.location}` 
              }))
            ]}
          />
          
          <Input
            ref={addNameRef}
            label={t('invoiceName')}
            value={newInvoice.name}
            onChange={(e) => setNewInvoice({...newInvoice, name: e.target.value})}
            onKeyDown={(e) => handleAddFormKeyDown(e, 'name')}
            placeholder="Enter invoice name"
          />
          
          <Input
            ref={addAmountRef}
            label={t('amount')}
            type="number"
            value={newInvoice.amount}
            onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
            onKeyDown={(e) => handleAddFormKeyDown(e, 'amount')}
            placeholder="Enter amount"
          />
          
          <Select
            ref={addCurrencyRef}
            label={t('currency')}
            value={newInvoice.currency}
            onChange={(e) => setNewInvoice({...newInvoice, currency: e.target.value as 'USD' | 'IQD'})}
            onKeyDown={(e) => handleAddFormKeyDown(e, 'currency')}
            options={[
              { value: 'IQD', label: 'IQD' },
              { value: 'USD', label: 'USD' }
            ]}
          />
          
          <Input
            ref={addDateRef}
            label={t('invoiceDate')}
            type="date"
            value={newInvoice.invoiceDate}
            onChange={(e) => setNewInvoice({...newInvoice, invoiceDate: e.target.value})}
            onKeyDown={(e) => handleAddFormKeyDown(e, 'date')}
          />
          
          <Select
            ref={addStatusRef}
            label={t('paymentStatus')}
            value={newInvoice.paymentStatus}
            onChange={(e) => setNewInvoice({...newInvoice, paymentStatus: e.target.value as 'paid' | 'unpaid'})}
            onKeyDown={(e) => handleAddFormKeyDown(e, 'status')}
            options={[
              { value: 'unpaid', label: t('unpaid') },
              { value: 'paid', label: t('paid') }
            ]}
          />
          
          <Input
            ref={addNotesRef}
            label={t('notes')}
            value={newInvoice.notes}
            onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
            onKeyDown={(e) => handleAddFormKeyDown(e, 'notes')}
            placeholder="Optional notes"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddInvoice} className="flex-1">
              {keepFormOpen ? 'Save & Add Another' : t('save')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddModal(false);
                setKeepFormOpen(true); // Reset for next time
              }} 
              className="flex-1"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingInvoice(null);
        }}
        title="Edit Invoice"
      >
        <div className="space-y-4">
          <Input
            ref={editNameRef}
            label={t('invoiceName')}
            value={editInvoice.name}
            onChange={(e) => setEditInvoice({...editInvoice, name: e.target.value})}
            onKeyDown={(e) => handleEditFormKeyDown(e, 'name')}
            placeholder="Enter invoice name"
          />
          
          <Input
            ref={editAmountRef}
            label={t('amount')}
            type="number"
            value={editInvoice.amount}
            onChange={(e) => setEditInvoice({...editInvoice, amount: e.target.value})}
            onKeyDown={(e) => handleEditFormKeyDown(e, 'amount')}
            placeholder="Enter amount"
          />
          
          <Select
            ref={editCurrencyRef}
            label={t('currency')}
            value={editInvoice.currency}
            onChange={(e) => setEditInvoice({...editInvoice, currency: e.target.value as 'USD' | 'IQD'})}
            onKeyDown={(e) => handleEditFormKeyDown(e, 'currency')}
            options={[
              { value: 'IQD', label: 'IQD' },
              { value: 'USD', label: 'USD' }
            ]}
          />
          
          <Input
            ref={editDateRef}
            label={t('invoiceDate')}
            type="date"
            value={editInvoice.invoiceDate}
            onChange={(e) => setEditInvoice({...editInvoice, invoiceDate: e.target.value})}
            onKeyDown={(e) => handleEditFormKeyDown(e, 'date')}
          />
          
          <Select
            ref={editStatusRef}
            label={t('paymentStatus')}
            value={editInvoice.paymentStatus}
            onChange={(e) => setEditInvoice({...editInvoice, paymentStatus: e.target.value as 'paid' | 'unpaid'})}
            onKeyDown={(e) => handleEditFormKeyDown(e, 'status')}
            options={[
              { value: 'unpaid', label: t('unpaid') },
              { value: 'paid', label: t('paid') }
            ]}
          />
          
          <Input
            ref={editNotesRef}
            label={t('notes')}
            value={editInvoice.notes}
            onChange={(e) => setEditInvoice({...editInvoice, notes: e.target.value})}
            onKeyDown={(e) => handleEditFormKeyDown(e, 'notes')}
            placeholder="Optional notes"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleEditInvoice} className="flex-1">
              Update Invoice
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                setEditingInvoice(null);
              }} 
              className="flex-1"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Daily Rate Modal */}
      <Modal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        title={t('dailyRate')}
      >
        <div className="space-y-4">
          <Input
            ref={rateDateRef}
            label={t('date')}
            type="date"
            value={dailyRate.date}
            onChange={(e) => setDailyRate({...dailyRate, date: e.target.value})}
            onKeyDown={(e) => handleRateFormKeyDown(e, 'date')}
          />
          
          <Input
            ref={rateValueRef}
            label="USD to IQD Rate"
            type="number"
            step="0.01"
            value={dailyRate.rate}
            onChange={(e) => setDailyRate({...dailyRate, rate: e.target.value})}
            onKeyDown={(e) => handleRateFormKeyDown(e, 'rate')}
            placeholder="Enter exchange rate"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddDailyRate} className="flex-1">
              {t('save')}
            </Button>
            <Button variant="outline" onClick={() => setShowRateModal(false)} className="flex-1">
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountingModule;