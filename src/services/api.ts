// API Service for AccountingPro Backend
const getApiBaseUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in development (localhost)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Check if we're on Vercel (contains vercel.app in hostname)
  const isVercel = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('.vercel.app');
  
  // For local development
  if (isLocalhost) {
    return 'http://localhost:5000/api';
  }
  
  // For production (Vercel or any other deployment)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging for production troubleshooting
console.log('API Configuration:', {
  hostname: window.location.hostname,
  env_var: import.meta.env.VITE_API_BASE_URL,
  calculated_url: API_BASE_URL,
  is_development: import.meta.env.DEV,
  is_production: import.meta.env.PROD
});

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage if it exists
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(username: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (data.token) {
      this.token = data.token;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('session_id', data.sessionId);
    }
    
    return data;
  }

  async logout() {
    const sessionId = localStorage.getItem('session_id');
    
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('session_id');
    }
  }

  async verifyToken() {
    return await this.request('/auth/verify');
  }

  // Branches
  async getBranches(moduleType?: string) {
    const query = moduleType ? `?moduleType=${moduleType}` : '';
    return await this.request(`/branches${query}`);
  }

  async createBranch(branchData: any) {
    return await this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }

  async updateBranch(id: string, updates: any) {
    return await this.request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBranch(id: string) {
    return await this.request(`/branches/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoices
  async getInvoices(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/invoices${query}`);
  }

  async createInvoice(invoiceData: any) {
    return await this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, updates: any) {
    return await this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteInvoice(id: string) {
    return await this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async updateInvoicePaymentStatus(id: string, paymentStatus: 'paid' | 'unpaid', paidDate?: string) {
    return await this.request(`/invoices/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus, paidDate }),
    });
  }

  async getDollarRates(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/invoices/dollar-rates/all${query}`);
  }

  async addDollarRate(rateData: any) {
    return await this.request('/invoices/dollar-rates', {
      method: 'POST',
      body: JSON.stringify(rateData),
    });
  }

  // Market
  async getSales(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/market/sales${query}`);
  }

  async createSales(salesData: any) {
    return await this.request('/market/sales', {
      method: 'POST',
      body: JSON.stringify(salesData),
    });
  }

  async updateSales(id: string, updates: any) {
    return await this.request(`/market/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSales(id: string) {
    return await this.request(`/market/sales/${id}`, {
      method: 'DELETE',
    });
  }

  async getProfits(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/market/profits${query}`);
  }

  async createProfit(profitData: any) {
    return await this.request('/market/profits', {
      method: 'POST',
      body: JSON.stringify(profitData),
    });
  }

  async updateProfit(id: string, updates: any) {
    return await this.request(`/market/profits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProfit(id: string) {
    return await this.request(`/market/profits/${id}`, {
      method: 'DELETE',
    });
  }

  async getExpenses(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/market/expenses${query}`);
  }

  async createExpense(expenseData: any) {
    return await this.request('/market/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(id: string, updates: any) {
    return await this.request(`/market/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteExpense(id: string) {
    return await this.request(`/market/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async updateExpensePaymentStatus(id: string, paymentStatus: 'paid' | 'unpaid', paidDate?: string) {
    return await this.request(`/market/expenses/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus, paidDate }),
    });
  }

  // HR
  async getEmployees(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/hr/employees${query}`);
  }

  async createEmployee(employeeData: any) {
    return await this.request('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id: string, updates: any) {
    return await this.request(`/hr/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async payEmployeeSalary(id: string, amount: number, paymentDate: string, notes?: string) {
    return await this.request(`/hr/employees/${id}/pay-salary`, {
      method: 'POST',
      body: JSON.stringify({ 
        amount, 
        date: paymentDate, 
        notes: notes || '',
        createdBy: 'current-user' 
      }),
    });
  }

  async getEmployeeSalaryPayments(id: string, params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/hr/employees/${id}/salary-payments${query}`);
  }

  async getAdjustments(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/hr/adjustments${query}`);
  }

  async createAdjustment(adjustmentData: any) {
    return await this.request('/hr/adjustments', {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  }

  async updateAdjustment(id: string, updates: any) {
    return await this.request(`/hr/adjustments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAdjustment(id: string) {
    return await this.request(`/hr/adjustments/${id}`, {
      method: 'DELETE',
    });
  }

  async getPayrollSummaryByBranch(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/hr/payroll-summary/by-branch${query}`);
  }

  // Users
  async getUsers() {
    return await this.request('/users');
  }

  async createUser(userData: any) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any) {
    return await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Roles
  async getRoles() {
    return await this.request('/roles');
  }

  async getPermissions() {
    return await this.request('/roles/permissions');
  }

  async createRole(roleData: any) {
    return await this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id: string, updates: any) {
    return await this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRole(id: string) {
    return await this.request(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/notifications${query}`);
  }

  async createNotification(notificationData: any) {
    return await this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(id: string) {
    return await this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return await this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  // Dashboard
  async getDashboardStats(params?: { period?: string; date?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/dashboard/stats${query}`);
  }

  async getDashboardSummary(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await this.request(`/dashboard/summary${query}`);
  }

  async resetAllData() {
    return await this.request('/dashboard/reset-data', {
      method: 'POST',
    });
  }

  async generateReport(params: {
    module: 'accounting' | 'market';
    branchId: string;
    reportType: string;
    startDate: string;
    endDate: string;
  }) {
    return await this.request('/dashboard/generate-report', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }

  // Additional methods for DataContext
  async deleteEmployee(id: string) {
    return await this.request(`/hr/employees/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService; 