import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useBranches } from '../../contexts/BranchContext';
import { useData } from '../../contexts/DataContext';
import { Plus, Edit, Trash2, Users, Award, Calculator, DollarSign, Clock, User, History, Phone, MapPin, Calendar, CreditCard, Filter } from 'lucide-react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Select from '../Common/Select';
import Modal from '../Common/Modal';
import { Employee } from '../../types';
import apiService from '../../services/api';

const HRModule: React.FC = () => {
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const { accountingBranches, marketBranches } = useBranches();
  const allBranches = [...accountingBranches, ...marketBranches];
  const { employees, adjustments, addEmployee, updateEmployee, deleteEmployee, payEmployeeSalary, addAdjustment } = useData();
  
  const [activeTab, setActiveTab] = useState<'employees' | 'adjustments'>('employees');
  const [showAddModal, setShowAddModal] = useState(false);
  const [keepFormOpen, setKeepFormOpen] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [profileEmployee, setProfileEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Filter and search states
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [payrollSummary, setPayrollSummary] = useState<{
    branches: Array<{
      branchId: string;
      branchName: string;
      branchLocation: string;
      totalEmployees: number;
      totalSalary: number;
      totalBonuses: number;
      totalPenalties: number;
      netPayroll: number;
    }>;
    overall: {
      totalEmployees: number;
      totalSalary: number;
      totalBonuses: number;
      totalPenalties: number;
      netPayroll: number;
    };
  } | null>(null);

  // Load payroll summary on component mount
  useEffect(() => {
    const loadPayrollSummary = async () => {
      try {
        const summary = await apiService.getPayrollSummaryByBranch();
        setPayrollSummary(summary);
      } catch (err) {
        console.error('Error loading payroll summary:', err);
      }
    };
    
    loadPayrollSummary();
  }, [employees, adjustments]); // Reload when data changes

  // Filter employees based on branch and search term
  const filteredEmployees = employees.filter(employee => {
    const matchesBranch = !selectedBranch || employee.branchId === selectedBranch;
    const matchesSearch = !searchTerm || employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // Refs for Employee form
  const empBranchRef = useRef<HTMLSelectElement>(null);
  const empNameRef = useRef<HTMLInputElement>(null);
  const empPhoneRef = useRef<HTMLInputElement>(null);
  const empLocationRef = useRef<HTMLInputElement>(null);
  const empSalaryRef = useRef<HTMLInputElement>(null);
  const empSalaryDaysRef = useRef<HTMLInputElement>(null);
  const empStartDateRef = useRef<HTMLInputElement>(null);

  // Refs for Edit Employee form
  const editEmpBranchRef = useRef<HTMLSelectElement>(null);
  const editEmpNameRef = useRef<HTMLInputElement>(null);
  const editEmpPhoneRef = useRef<HTMLInputElement>(null);
  const editEmpLocationRef = useRef<HTMLInputElement>(null);
  const editEmpSalaryRef = useRef<HTMLInputElement>(null);
  const editEmpSalaryDaysRef = useRef<HTMLInputElement>(null);
  const editEmpStartDateRef = useRef<HTMLInputElement>(null);

  // Refs for Adjustment form
  const adjEmployeeRef = useRef<HTMLSelectElement>(null);
  const adjTypeRef = useRef<HTMLSelectElement>(null);
  const adjAmountRef = useRef<HTMLInputElement>(null);
  const adjDateRef = useRef<HTMLInputElement>(null);
  const adjDescriptionRef = useRef<HTMLInputElement>(null);

  // Refs for Pay Salary form
  const payDateRef = useRef<HTMLInputElement>(null);
  const payAmountRef = useRef<HTMLInputElement>(null);
  const payNotesRef = useRef<HTMLInputElement>(null);

  const [newEmployee, setNewEmployee] = useState({
    branchId: '',
    name: '',
    phone: '',
    location: '',
    salary: '',
    salaryDays: '30',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [editEmployee, setEditEmployee] = useState({
    branchId: '',
    name: '',
    phone: '',
    location: '',
    salary: '',
    salaryDays: '30',
    startDate: ''
  });

  const [newAdjustment, setNewAdjustment] = useState({
    employeeId: '',
    type: 'penalty' as 'penalty' | 'bonus',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paidAmount: '',
    notes: ''
  });

  // Handle Enter key navigation for Employee form
  const handleEmployeeKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'branch':
          empNameRef.current?.focus();
          break;
        case 'name':
          empPhoneRef.current?.focus();
          break;
        case 'phone':
          empLocationRef.current?.focus();
          break;
        case 'location':
          empSalaryRef.current?.focus();
          break;
        case 'salary':
          empSalaryDaysRef.current?.focus();
          break;
        case 'salaryDays':
          empStartDateRef.current?.focus();
          break;
        case 'startDate':
          handleAddEmployee();
          break;
      }
    }
  };

  // Handle Enter key navigation for Edit Employee form
  const handleEditEmployeeKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'branch':
          editEmpNameRef.current?.focus();
          break;
        case 'name':
          editEmpPhoneRef.current?.focus();
          break;
        case 'phone':
          editEmpLocationRef.current?.focus();
          break;
        case 'location':
          editEmpSalaryRef.current?.focus();
          break;
        case 'salary':
          editEmpSalaryDaysRef.current?.focus();
          break;
        case 'salaryDays':
          editEmpStartDateRef.current?.focus();
          break;
        case 'startDate':
          handleUpdateEmployee();
          break;
      }
    }
  };

  // Handle Enter key navigation for Adjustment form
  const handleAdjustmentKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'employee':
          adjTypeRef.current?.focus();
          break;
        case 'type':
          adjAmountRef.current?.focus();
          break;
        case 'amount':
          adjDateRef.current?.focus();
          break;
        case 'date':
          adjDescriptionRef.current?.focus();
          break;
        case 'description':
          handleAddAdjustment();
          break;
      }
    }
  };

  // Handle Enter key navigation for Pay Salary form
  const handlePaySalaryKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      switch (currentField) {
        case 'date':
          payAmountRef.current?.focus();
          break;
        case 'amount':
          payNotesRef.current?.focus();
          break;
        case 'notes':
          handlePaySalary();
          break;
      }
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.branchId || !newEmployee.name || !newEmployee.salary || !newEmployee.salaryDays) {
      addNotification({
        type: 'payroll',
        title: 'Missing Information',
        message: 'Please fill in all required fields (branch, name, salary, and salary days).',
        priority: 'medium'
      });
      return;
    }

    try {
      await addEmployee({
        branchId: newEmployee.branchId,
        name: newEmployee.name,
        phone: newEmployee.phone,
        location: newEmployee.location,
        salary: parseFloat(newEmployee.salary),
        salaryDays: parseInt(newEmployee.salaryDays),
        startDate: newEmployee.startDate,
        isActive: true,
        createdBy: 'current-user'
      });
      
      // Add notification for new employee
      addNotification({
        type: 'payroll',
        title: 'New Employee Added',
        message: `Employee "${newEmployee.name}" has been added with salary ${newEmployee.salary.toLocaleString()} IQD for ${newEmployee.salaryDays} days.`,
        priority: 'medium'
      });
      
      if (keepFormOpen) {
        // Keep the modal open and reset form for next entry
        setNewEmployee({
          branchId: newEmployee.branchId, // Keep the same branch
          name: '',
          phone: '',
          location: newEmployee.location, // Keep the same location
          salary: '',
          salaryDays: newEmployee.salaryDays, // Keep the same salary days
          startDate: new Date().toISOString().split('T')[0]
        });
        // Focus back to first field
        setTimeout(() => empBranchRef.current?.focus(), 100);
      } else {
        setShowAddModal(false);
        setNewEmployee({
          branchId: '',
          name: '',
          phone: '',
          location: '',
          salary: '',
          salaryDays: '30',
          startDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch {
      addNotification({
        type: 'payroll',
        title: 'Error',
        message: 'Failed to add employee. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee || !editEmployee.branchId || !editEmployee.name || !editEmployee.salary || !editEmployee.salaryDays) {
      addNotification({
        type: 'payroll',
        title: 'Missing Information',
        message: 'Please fill in all required fields.',
        priority: 'medium'
      });
      return;
    }

    try {
      await updateEmployee(editingEmployee.id, {
        branchId: editEmployee.branchId,
        name: editEmployee.name,
        phone: editEmployee.phone,
        location: editEmployee.location,
        salary: parseFloat(editEmployee.salary),
        salaryDays: parseInt(editEmployee.salaryDays),
        startDate: editEmployee.startDate
      });
    
      // Add notification for updated employee
      addNotification({
        type: 'payroll',
        title: 'Employee Updated',
        message: `Employee "${editEmployee.name}" has been updated successfully.`,
        priority: 'low'
      });

      setShowEditModal(false);
      setEditingEmployee(null);
    } catch {
      addNotification({
        type: 'payroll',
        title: 'Error',
        message: 'Failed to update employee. Please try again.',
        priority: 'high'
      });
    }
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditEmployee({
      branchId: employee.branchId || '',
      name: employee.name,
      phone: employee.phone || '',
      location: employee.location || '',
      salary: employee.salary.toString(),
      salaryDays: employee.salaryDays.toString(),
      startDate: employee.startDate
    });
    setShowEditModal(true);
    setTimeout(() => editEmpBranchRef.current?.focus(), 100);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete employee "${employee.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteEmployee(employee.id);
      
      addNotification({
        type: 'payroll',
        title: 'Employee Deleted',
        message: `Employee "${employee.name}" has been deleted successfully.`,
        priority: 'low'
      });
    } catch {
      addNotification({
        type: 'payroll',
        title: 'Error',
        message: 'Failed to delete employee. Please try again.',
        priority: 'high'
      });
    }
  };

  const handleAddAdjustment = async () => {
    if (!newAdjustment.employeeId || !newAdjustment.amount || !newAdjustment.description) {
      addNotification({
        type: 'payroll',
        title: 'Missing Information',
        message: 'Please fill in all required fields.',
        priority: 'medium'
      });
      return;
    }

    try {
      await addAdjustment({
        employeeId: newAdjustment.employeeId,
        type: newAdjustment.type,
        amount: parseFloat(newAdjustment.amount),
        date: newAdjustment.date,
        description: newAdjustment.description,
        createdBy: 'current-user'
      });
      
      // Add notification for adjustment
      addNotification({
        type: 'payroll',
        title: `Employee ${newAdjustment.type === 'bonus' ? 'Bonus' : 'Penalty'} Added`,
        message: `${newAdjustment.type === 'bonus' ? 'Bonus' : 'Penalty'} of ${parseFloat(newAdjustment.amount).toLocaleString()} IQD has been added for an employee.`,
        priority: newAdjustment.type === 'penalty' ? 'medium' : 'low'
      });
      
      if (keepFormOpen) {
        // Keep the modal open and reset form for next entry
        setNewAdjustment({
          employeeId: newAdjustment.employeeId, // Keep the same employee
          type: newAdjustment.type, // Keep the same type
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        // Focus back to first field
        setTimeout(() => adjEmployeeRef.current?.focus(), 100);
      } else {
        setShowAddModal(false);
        setNewAdjustment({
          employeeId: '',
          type: 'penalty',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
      }
    } catch {
      addNotification({
        type: 'payroll',
        title: 'Error',
        message: 'Failed to add adjustment. Please try again.',
        priority: 'high'
      });
    }
  };

  const handlePaySalary = async () => {
    if (!selectedEmployee || !paymentData.paidAmount) {
      addNotification({
        type: 'payroll',
        title: 'Missing Information',
        message: 'Please fill in all required fields.',
        priority: 'medium'
      });
      return;
    }

    try {
      await payEmployeeSalary(
        selectedEmployee.id,
        parseFloat(paymentData.paidAmount),
        paymentData.paymentDate
      );

      // Add notification for salary payment
      addNotification({
        type: 'payroll',
        title: 'Salary Payment Processed',
        message: `Salary payment of ${parseFloat(paymentData.paidAmount).toLocaleString()} IQD has been processed for ${selectedEmployee.name}.`,
        priority: 'low'
      });

      // Reset and close modal
      setPaymentData({
        paymentDate: new Date().toISOString().split('T')[0],
        paidAmount: '',
        notes: ''
      });
      setSelectedEmployee(null);
      setShowPayModal(false);
    } catch {
      addNotification({
        type: 'payroll',
        title: 'Error',
        message: 'Failed to process salary payment. Please try again.',
        priority: 'high'
      });
    }
  };

  const openPayModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    const netSalary = getEmployeeNetSalary(employee);
    setPaymentData({
      paymentDate: new Date().toISOString().split('T')[0],
      paidAmount: netSalary.toString(),
      notes: ''
    });
    setShowPayModal(true);
    // Focus first field when modal opens
    setTimeout(() => payDateRef.current?.focus(), 100);
  };

  const openProfileModal = (employee: Employee) => {
    setProfileEmployee(employee);
    setShowProfileModal(true);
  };

  const getEmployeeAdjustments = (employeeId: string) => {
    return adjustments.filter(adj => adj.employeeId === employeeId);
  };

  const getEmployeeNetSalary = (employee: Employee) => {
    const empAdjustments = getEmployeeAdjustments(employee.id);
    const bonuses = empAdjustments.filter(adj => adj.type === 'bonus').reduce((sum, adj) => sum + adj.amount, 0);
    const penalties = empAdjustments.filter(adj => adj.type === 'penalty').reduce((sum, adj) => sum + adj.amount, 0);
    return employee.salary + bonuses - penalties;
  };

  const getDailySalary = (employee: Employee) => {
    return employee.salary / employee.salaryDays;
  };

  const getSalaryPeriodText = (days: number) => {
    if (days === 1) return 'Daily';
    if (days === 7) return 'Weekly';
    if (days === 14) return 'Bi-weekly';
    if (days === 15) return 'Half-monthly';
    if (days === 30 || days === 31) return 'Monthly';
    if (days === 365 || days === 366) return 'Yearly';
    return `${days} days`;
  };

  // Calculate when the next payment is due
  const getNextPaymentDate = (employee: Employee) => {
    const startDate = new Date(employee.startDate);
    const today = new Date();
    
    // If employee has payment history, use last payment date as base
    if (employee.salaryPayments && employee.salaryPayments.length > 0) {
      const lastPayment = employee.salaryPayments
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
      const lastPaymentDate = new Date(lastPayment.paymentDate);
      const nextPaymentDate = new Date(lastPaymentDate);
      nextPaymentDate.setDate(nextPaymentDate.getDate() + employee.salaryDays);
      return nextPaymentDate;
    }
    
    // If no payment history, calculate from start date
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const completedCycles = Math.floor(daysSinceStart / employee.salaryDays);
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setDate(nextPaymentDate.getDate() + (completedCycles + 1) * employee.salaryDays);
    
    return nextPaymentDate;
  };

  // Check if payment is due
  const isPaymentDue = (employee: Employee) => {
    const nextPaymentDate = getNextPaymentDate(employee);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextPaymentDate.setHours(0, 0, 0, 0);
    
    return today >= nextPaymentDate;
  };

  // Get days until next payment
  const getDaysUntilNextPayment = (employee: Employee) => {
    const nextPaymentDate = getNextPaymentDate(employee);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextPaymentDate.setHours(0, 0, 0, 0);
    
    const diffTime = nextPaymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const tabs = [
    { id: 'employees', label: t('employees'), icon: Users },
    { id: 'adjustments', label: t('adjustments'), icon: Award }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('hr')}
        </h1>
        <Button
          onClick={() => {
            setShowAddModal(true);
            // Focus appropriate field based on active tab
            setTimeout(() => {
              if (activeTab === 'employees') {
                empBranchRef.current?.focus();
              } else if (activeTab === 'adjustments') {
                adjEmployeeRef.current?.focus();
              }
            }, 100);
          }}
          className="flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'employees' ? t('addEmployee') : 'Add Adjustment'}
        </Button>
      </div>

      {/* Payroll Summary by Branch */}
      {payrollSummary && payrollSummary.branches && payrollSummary.branches.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Payroll Summary by Branch
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payrollSummary.branches.map((branch) => (
              <div key={branch.branchId} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{branch.branchName}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{branch.branchLocation}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Employees:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{branch.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Total Salary:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{branch.totalSalary.toLocaleString()} IQD</span>
                  </div>
                  {branch.totalBonuses > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Bonuses:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">+{branch.totalBonuses.toLocaleString()} IQD</span>
                    </div>
                  )}
                  {branch.totalPenalties > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Penalties:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">-{branch.totalPenalties.toLocaleString()} IQD</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-blue-200 dark:border-blue-600">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Net Payroll:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{branch.netPayroll.toLocaleString()} IQD</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Overall Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Overall Total</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">All Employees:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payrollSummary.overall.totalEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Salary:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{payrollSummary.overall.totalSalary.toLocaleString()} IQD</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Net Payroll:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{payrollSummary.overall.netPayroll.toLocaleString()} IQD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {activeTab === 'employees' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branch Filter */}
            <div>
              <Select
                label="Filter by Branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                options={[
                  { value: '', label: 'All Branches' },
                  ...allBranches.filter(branch => branch.isActive).map(branch => ({ 
                    value: branch.id, 
                    label: `${branch.name} - ${branch.location}` 
                  }))
                ]}
              />
            </div>
            
            {/* Employee Search */}
            <div>
              <Input
                label="Search Employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee name..."
              />
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>
                Showing {filteredEmployees.length} of {employees.length} employees
                {selectedBranch && ` from selected branch`}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            </div>
            {(selectedBranch || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedBranch('');
                  setSearchTerm('');
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'employees' | 'adjustments')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'employees' && (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('employeeName')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                      {t('phone')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      {t('branch')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      {t('location')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('salary')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      Salary Period
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden xl:table-cell">
                      Daily Rate
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                      {t('startDate')}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                      Payment Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {employee.name}
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {employee.phone || 'No phone'} • {getSalaryPeriodText(employee.salaryDays)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                        {employee.phone || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                        {employee.branchId ? (
                          <div className="text-xs">
                            <div className="font-medium">
                              {allBranches.find(branch => branch.id === employee.branchId)?.name || 'Unknown'}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {allBranches.find(branch => branch.id === employee.branchId)?.moduleType || ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden md:table-cell">
                        {employee.location || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{employee.salary.toLocaleString()} IQD</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                            {getSalaryPeriodText(employee.salaryDays)} • {getDailySalary(employee).toFixed(0)} IQD/day
                          </div>
                          <div className="text-xs mt-1 sm:hidden">
                            {isPaymentDue(employee) ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">Payment Due!</span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">
                                Next payment: {getDaysUntilNextPayment(employee)} days
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            employee.salaryDays === 30 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            employee.salaryDays === 15 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            employee.salaryDays === 7 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            employee.salaryDays === 1 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {getSalaryPeriodText(employee.salaryDays)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden xl:table-cell">
                        <div>
                          <div className="font-medium">{getDailySalary(employee).toFixed(0)} IQD</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">per day</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                        {new Date(employee.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden md:table-cell">
                        {isPaymentDue(employee) ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Payment Due
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                            {getDaysUntilNextPayment(employee)} days left
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                        <button 
                          onClick={() => openProfileModal(employee)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                          title="View Profile"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(employee)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isPaymentDue(employee) ? (
                          <button 
                            onClick={() => openPayModal(employee)}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                            title="Pay Salary"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            title={`Next payment in ${getDaysUntilNextPayment(employee)} days`}
                            disabled
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-3 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'adjustments' && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {adjustments.map((adjustment) => {
                    const employee = employees.find(emp => emp.id === adjustment.employeeId);
                    return (
                      <tr key={adjustment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            adjustment.type === 'bonus'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {adjustment.type === 'bonus' ? 'Bonus' : 'Penalty'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {adjustment.amount.toLocaleString()} IQD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(adjustment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {adjustment.description}
                        </td>
                      </tr>
                    );
                  })}
                  {adjustments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No adjustments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}


        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal && activeTab === 'employees'}
        onClose={() => setShowAddModal(false)}
        title={t('addEmployee')}
      >
        <div className="space-y-4">
          {/* Keep Form Open Toggle */}
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Quick Entry Mode - Employees
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={keepFormOpen}
                onChange={(e) => setKeepFormOpen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <Select
            ref={empBranchRef}
            label={t('branch')}
            value={newEmployee.branchId}
            onChange={(e) => setNewEmployee({...newEmployee, branchId: e.target.value})}
            onKeyDown={(e) => handleEmployeeKeyDown(e, 'branch')}
            options={[
              { value: '', label: 'Select branch' },
              ...allBranches.filter(branch => branch.isActive).map(branch => ({ 
                value: branch.id, 
                label: `${branch.name} - ${branch.location} (${branch.moduleType})` 
              }))
            ]}
          />
          
          <Input
            ref={empNameRef}
            label={t('employeeName')}
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
            onKeyDown={(e) => handleEmployeeKeyDown(e, 'name')}
            placeholder="Enter employee name"
          />
          
          <Input
            ref={empPhoneRef}
            label={t('phone')}
            value={newEmployee.phone}
            onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
            onKeyDown={(e) => handleEmployeeKeyDown(e, 'phone')}
            placeholder="Enter phone number"
          />
          
          <Input
            ref={empLocationRef}
            label={t('location')}
            value={newEmployee.location}
            onChange={(e) => setNewEmployee({...newEmployee, location: e.target.value})}
            onKeyDown={(e) => handleEmployeeKeyDown(e, 'location')}
            placeholder="Enter location"
          />
          
          <Input
            ref={empSalaryRef}
            label={t('salary')}
            type="number"
            value={newEmployee.salary}
            onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
            onKeyDown={(e) => handleEmployeeKeyDown(e, 'salary')}
            placeholder="Enter salary in IQD"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              ref={empSalaryDaysRef}
              label="Salary Days"
              type="number"
              min="1"
              max="365"
              value={newEmployee.salaryDays}
              onChange={(e) => setNewEmployee({...newEmployee, salaryDays: e.target.value})}
              onKeyDown={(e) => handleEmployeeKeyDown(e, 'salaryDays')}
              placeholder="Days"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Select
              </label>
              <select
                value={newEmployee.salaryDays}
                onChange={(e) => setNewEmployee({...newEmployee, salaryDays: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1">Daily (1 day)</option>
                <option value="7">Weekly (7 days)</option>
                <option value="14">Bi-weekly (14 days)</option>
                <option value="15">Half-monthly (15 days)</option>
                <option value="30">Monthly (30 days)</option>
                <option value="365">Yearly (365 days)</option>
              </select>
            </div>
          </div>
          
          {/* Salary Calculation Preview */}
          {newEmployee.salary && newEmployee.salaryDays && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Salary Calculation Preview
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Total Salary:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {parseFloat(newEmployee.salary).toLocaleString()} IQD
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Daily Rate:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {(parseFloat(newEmployee.salary) / parseInt(newEmployee.salaryDays)).toFixed(0)} IQD/day
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Period:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {getSalaryPeriodText(parseInt(newEmployee.salaryDays))}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Days:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {newEmployee.salaryDays} days
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Input
            ref={empStartDateRef}
            label={t('startDate')}
            type="date"
            value={newEmployee.startDate}
            onChange={(e) => setNewEmployee({...newEmployee, startDate: e.target.value})}
            onKeyDown={(e) => handleEmployeeKeyDown(e, 'startDate')}
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddEmployee} className="flex-1">
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

      {/* Add Adjustment Modal */}
      <Modal
        isOpen={showAddModal && activeTab === 'adjustments'}
        onClose={() => setShowAddModal(false)}
        title="Add Adjustment"
      >
        <div className="space-y-4">
          {/* Keep Form Open Toggle */}
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Quick Entry Mode - Adjustments
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={keepFormOpen}
                onChange={(e) => setKeepFormOpen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
            </label>
          </div>
          
          <Select
            ref={adjEmployeeRef}
            label="Employee"
            value={newAdjustment.employeeId}
            onChange={(e) => setNewAdjustment({...newAdjustment, employeeId: e.target.value})}
            onKeyDown={(e) => handleAdjustmentKeyDown(e, 'employee')}
            options={[
              { value: '', label: 'Select Employee' },
              ...employees.map(emp => ({ value: emp.id, label: emp.name }))
            ]}
          />
          
          <Select
            ref={adjTypeRef}
            label="Type"
            value={newAdjustment.type}
            onChange={(e) => setNewAdjustment({...newAdjustment, type: e.target.value as 'penalty' | 'bonus'})}
            onKeyDown={(e) => handleAdjustmentKeyDown(e, 'type')}
            options={[
              { value: 'penalty', label: 'Penalty' },
              { value: 'bonus', label: 'Bonus' }
            ]}
          />
          
          <Input
            ref={adjAmountRef}
            label={t('amount')}
            type="number"
            value={newAdjustment.amount}
            onChange={(e) => setNewAdjustment({...newAdjustment, amount: e.target.value})}
            onKeyDown={(e) => handleAdjustmentKeyDown(e, 'amount')}
            placeholder="Enter amount in IQD"
          />
          
          <Input
            ref={adjDateRef}
            label={t('date')}
            type="date"
            value={newAdjustment.date}
            onChange={(e) => setNewAdjustment({...newAdjustment, date: e.target.value})}
            onKeyDown={(e) => handleAdjustmentKeyDown(e, 'date')}
          />
          
          <Input
            ref={adjDescriptionRef}
            label="Description"
            value={newAdjustment.description}
            onChange={(e) => setNewAdjustment({...newAdjustment, description: e.target.value})}
            onKeyDown={(e) => handleAdjustmentKeyDown(e, 'description')}
            placeholder="Enter description"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddAdjustment} className="flex-1">
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

      {/* Pay Salary Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={`${t('payButton')} - ${selectedEmployee?.name}`}
      >
        <div className="space-y-4">
          {/* Employee Info */}
          {selectedEmployee && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-lg font-medium text-green-800 dark:text-green-200">
                  Salary Payment Details
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600 dark:text-green-400">Employee:</span>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    {selectedEmployee.name}
                  </div>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400">Base Salary:</span>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    {selectedEmployee.salary.toLocaleString()} IQD
                  </div>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400">Salary Period:</span>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    {getSalaryPeriodText(selectedEmployee.salaryDays)}
                  </div>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400">Net Amount:</span>
                  <div className="font-medium text-green-800 dark:text-green-200">
                    {getEmployeeNetSalary(selectedEmployee).toLocaleString()} IQD
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Input
            ref={payDateRef}
            label={t('paymentDate')}
            type="date"
            value={paymentData.paymentDate}
            onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
            onKeyDown={(e) => handlePaySalaryKeyDown(e, 'date')}
          />
          
          <Input
            ref={payAmountRef}
            label="Paid Amount"
            type="number"
            value={paymentData.paidAmount}
            onChange={(e) => setPaymentData({...paymentData, paidAmount: e.target.value})}
            onKeyDown={(e) => handlePaySalaryKeyDown(e, 'amount')}
            placeholder="Enter paid amount in IQD"
          />
          
          <Input
            ref={payNotesRef}
            label="Payment Notes"
            value={paymentData.notes}
            onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
            onKeyDown={(e) => handlePaySalaryKeyDown(e, 'notes')}
            placeholder="Optional payment notes"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handlePaySalary} variant="success" className="flex-1">
              <DollarSign className="w-4 h-4 mr-2" />
              {t('markAsPaid')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPayModal(false);
                setSelectedEmployee(null);
              }} 
              className="flex-1"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Employee Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setProfileEmployee(null);
        }}
        title={`Employee Profile - ${profileEmployee?.name}`}
        size="lg"
      >
        {profileEmployee && (
          <div className="space-y-6">
            {/* Employee Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileEmployee.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    Employee ID: {profileEmployee.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileEmployee.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileEmployee.location || 'Not provided'}
                    </span>
                  </div>
                  {profileEmployee.branchId && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Branch:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {allBranches.find(branch => branch.id === profileEmployee.branchId)?.name || 'Unknown Branch'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({allBranches.find(branch => branch.id === profileEmployee.branchId)?.moduleType || ''})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Start Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(profileEmployee.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Base Salary:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileEmployee.salary.toLocaleString()} IQD
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Salary Period:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getSalaryPeriodText(profileEmployee.salaryDays)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Rate:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getDailySalary(profileEmployee).toFixed(0)} IQD/day
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Salary Calculation */}
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Net Salary:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {getEmployeeNetSalary(profileEmployee).toLocaleString()} IQD
                  </span>
                </div>
                {getEmployeeAdjustments(profileEmployee.id).length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Includes bonuses and penalties
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profileEmployee.isPaid
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {profileEmployee.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                {profileEmployee.lastPaidDate && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Last paid: {new Date(profileEmployee.lastPaidDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Payment History
                  </h4>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {profileEmployee.salaryPayments && profileEmployee.salaryPayments.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {profileEmployee.salaryPayments
                      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                      .map((payment) => (
                        <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {payment.amount.toLocaleString()} IQD
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </div>
                              {payment.notes && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {payment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No payment history found</p>
                    <p className="text-sm mt-1">Payments will appear here once processed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Adjustments */}
            {getEmployeeAdjustments(profileEmployee.id).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Salary Adjustments
                    </h4>
                  </div>
                </div>
                
                <div className="max-h-32 overflow-y-auto">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {getEmployeeAdjustments(profileEmployee.id).map((adjustment) => (
                      <div key={adjustment.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              adjustment.type === 'bonus'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {adjustment.type === 'bonus' ? 'Bonus' : 'Penalty'}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {adjustment.description}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {adjustment.type === 'bonus' ? '+' : '-'}{adjustment.amount.toLocaleString()} IQD
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(adjustment.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {isPaymentDue(profileEmployee) && (
                <Button
                  onClick={() => {
                    setShowProfileModal(false);
                    openPayModal(profileEmployee);
                  }}
                  variant="success"
                  className="flex-1"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Salary
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileEmployee(null);
                }} 
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
        }}
        title={`Edit Employee - ${editingEmployee?.name}`}
      >
        <div className="space-y-4">
          <Select
            ref={editEmpBranchRef}
            label={t('branch')}
            value={editEmployee.branchId}
            onChange={(e) => setEditEmployee({...editEmployee, branchId: e.target.value})}
            onKeyDown={(e) => handleEditEmployeeKeyDown(e, 'branch')}
            options={[
              { value: '', label: 'Select branch' },
              ...allBranches.filter(branch => branch.isActive).map(branch => ({ 
                value: branch.id, 
                label: `${branch.name} - ${branch.location} (${branch.moduleType})` 
              }))
            ]}
          />
          
          <Input
            ref={editEmpNameRef}
            label={t('employeeName')}
            value={editEmployee.name}
            onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})}
            onKeyDown={(e) => handleEditEmployeeKeyDown(e, 'name')}
            placeholder="Enter employee name"
          />
          
          <Input
            ref={editEmpPhoneRef}
            label={t('phone')}
            value={editEmployee.phone}
            onChange={(e) => setEditEmployee({...editEmployee, phone: e.target.value})}
            onKeyDown={(e) => handleEditEmployeeKeyDown(e, 'phone')}
            placeholder="Enter phone number"
          />
          
          <Input
            ref={editEmpLocationRef}
            label={t('location')}
            value={editEmployee.location}
            onChange={(e) => setEditEmployee({...editEmployee, location: e.target.value})}
            onKeyDown={(e) => handleEditEmployeeKeyDown(e, 'location')}
            placeholder="Enter location"
          />
          
          <Input
            ref={editEmpSalaryRef}
            label={t('salary')}
            type="number"
            value={editEmployee.salary}
            onChange={(e) => setEditEmployee({...editEmployee, salary: e.target.value})}
            onKeyDown={(e) => handleEditEmployeeKeyDown(e, 'salary')}
            placeholder="Enter salary in IQD"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              ref={editEmpSalaryDaysRef}
              label="Salary Days"
              type="number"
              min="1"
              max="365"
              value={editEmployee.salaryDays}
              onChange={(e) => setEditEmployee({...editEmployee, salaryDays: e.target.value})}
              onKeyDown={(e) => handleEditEmployeeKeyDown(e, 'salaryDays')}
              placeholder="Days"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Select
              </label>
              <select
                value={editEmployee.salaryDays}
                onChange={(e) => setEditEmployee({...editEmployee, salaryDays: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1">Daily (1 day)</option>
                <option value="7">Weekly (7 days)</option>
                <option value="14">Bi-weekly (14 days)</option>
                <option value="15">Half-monthly (15 days)</option>
                <option value="30">Monthly (30 days)</option>
                <option value="365">Yearly (365 days)</option>
              </select>
            </div>
          </div>
          
          {/* Salary Calculation Preview */}
          {editEmployee.salary && editEmployee.salaryDays && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Salary Calculation Preview
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Total Salary:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {parseFloat(editEmployee.salary).toLocaleString()} IQD
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Daily Rate:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {(parseFloat(editEmployee.salary) / parseInt(editEmployee.salaryDays)).toFixed(0)} IQD/day
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Period:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {getSalaryPeriodText(parseInt(editEmployee.salaryDays))}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Days:</span>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {editEmployee.salaryDays} days
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Input
            ref={editEmpStartDateRef}
            label={t('startDate')}
            type="date"
            value={editEmployee.startDate}
            onChange={(e) => setEditEmployee({...editEmployee, startDate: e.target.value})}
            onKeyDown={(e) => handleEditEmployeeKeyDown(e, 'startDate')}
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleUpdateEmployee} className="flex-1">
              Update Employee
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditModal(false);
                setEditingEmployee(null);
              }} 
              className="flex-1"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HRModule;