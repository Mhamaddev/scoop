import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    accounting: 'Accounting',
    market: 'Market',
    hr: 'HR Management',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    
    // Dashboard
    welcome: 'Welcome',
    recentInvoices: 'Recent Invoices',
    totalSales: 'Total Sales',
    totalProfits: 'Total Profits',
    totalExpenses: 'Total Expenses',
    unpaidExpenses: 'Unpaid Expenses',
    payrollSummary: 'Payroll Summary',
    
    // Accounting
    invoices: 'Invoices',
    addInvoice: 'Add Invoice',
    invoiceName: 'Invoice Name',
    amount: 'Amount',
    currency: 'Currency',
    invoiceDate: 'Invoice Date',
    entryDate: 'Entry Date',
    notes: 'Notes',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    unpaid: 'Unpaid',
    dailyRate: 'Daily Dollar Rate',
    
    // Market
    sales: 'Sales',
    profits: 'Profits',
    expenses: 'Expenses',
    addSales: 'Add Sales',
    addProfit: 'Add Profit',
    addExpense: 'Add Expense',
    category: 'Category',
    loan: 'Loan',
    cash: 'Cash',
    
    // HR
    employees: 'Employees',
    addEmployee: 'Add Employee',
    employeeName: 'Employee Name',
    phone: 'Phone Number',
    location: 'Location',
    salary: 'Salary',
    startDate: 'Start Date',
    salaryDays: 'Salary Days',
    salaryPeriod: 'Salary Period',
    dailyRate: 'Daily Rate',
    adjustments: 'Adjustments',
    penalties: 'Penalties',
    bonuses: 'Bonuses',
    payroll: 'Payroll',
    payButton: 'Pay Salary',
    markAsPaid: 'Mark as Paid',
    lastPaid: 'Last Paid',
    paymentDate: 'Payment Date',
    salaryPaid: 'Salary Paid',
    unpaidSalary: 'Unpaid',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    date: 'Date',
    total: 'Total',
    actions: 'Actions',
    status: 'Status',
    branch: 'Branch',
    selectBranch: 'Select Branch',
    
    // Auth
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginError: 'Invalid username or password',
    
    // Themes
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    
    // Languages
    english: 'English',
    kurdish: 'Kurdish'
  },
  ku: {
    // Navigation
    dashboard: 'سەرەتا',
    accounting: 'ژمێریاری',
    market: 'بازار',
    hr: 'بەڕێوەبردنی کارمەندان',
    reports: 'ڕاپۆرتەکان',
    settings: 'ڕێکخستنەکان',
    logout: 'دەرچوون',
    
    // Dashboard
    welcome: 'بەخێرهاتوو',
    recentInvoices: 'پسولەکانی نوێ',
    totalSales: 'کۆی فرۆشتن',
    totalProfits: 'کۆی قازانج',
    totalExpenses: 'کۆی خەرجی',
    unpaidExpenses: 'خەرجی نەدراو',
    payrollSummary: 'پوختەی مووچە',
    
    // Accounting
    invoices: 'پسولەکان',
    addInvoice: 'پسولە زیادکە',
    invoiceName: 'ناوی پسولە',
    amount: 'بڕ',
    currency: 'دراو',
    invoiceDate: 'بەرواری پسولە',
    entryDate: 'بەرواری تۆمارکردن',
    notes: 'تێبینی',
    paymentStatus: 'بارودۆخی پارەدان',
    paid: 'دراوە',
    unpaid: 'نەدراوە',
    dailyRate: 'نرخی ڕۆژانەی دۆلار',
    
    // Market
    sales: 'فرۆشتن',
    profits: 'قازانج',
    expenses: 'خەرجی',
    addSales: 'فرۆشتن زیادکە',
    addProfit: 'قازانج زیادکە',
    addExpense: 'خەرجی زیادکە',
    category: 'جۆر',
    loan: 'قەرز',
    cash: 'کاش',
    
    // HR
    employees: 'کارمەندان',
    addEmployee: 'کارمەند زیادکە',
    employeeName: 'ناوی کارمەند',
    phone: 'ژمارەی تەلەفۆن',
    location: 'شوێن',
    salary: 'مووچە',
    startDate: 'بەرواری دەستپێکردن',
    salaryDays: 'ڕۆژانی مووچە',
    salaryPeriod: 'ماوەی مووچە',
    dailyRate: 'نرخی ڕۆژانە',
    adjustments: 'ڕاستکردنەوەکان',
    penalties: 'سزاکان',
    bonuses: 'پاداشت',
    payroll: 'مووچە',
    payButton: 'مووچە بدە',
    markAsPaid: 'وەک دراو نیشان بدە',
    lastPaid: 'کۆتایی جار دراوە',
    paymentDate: 'بەرواری پارەدان',
    salaryPaid: 'مووچە دراوە',
    unpaidSalary: 'نەدراو',
    
    // Common
    save: 'پاشەکەوتکردن',
    cancel: 'هەڵوەشاندنەوە',
    edit: 'دەستکاری',
    delete: 'سڕینەوە',
    submit: 'ناردن',
    search: 'گەڕان',
    filter: 'پاڵاوتن',
    date: 'بەروار',
    total: 'کۆ',
    actions: 'کردارەکان',
    status: 'بارودۆخ',
    branch: 'لق',
    selectBranch: 'لق هەڵبژێرە',
    
    // Auth
    login: 'چوونەژوورەوە',
    username: 'ناوی بەکارهێنەر',
    password: 'وشەی نهێنی',
    loginError: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە',
    
    // Themes
    lightMode: 'دۆخی ڕووناک',
    darkMode: 'دۆخی تاریک',
    
    // Languages
    english: 'ئینگلیزی',
    kurdish: 'کوردی'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};