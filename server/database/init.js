import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'accounting_pro.db');

// Create database connection
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database operations
export const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Database schema
const createTables = async () => {
  const tables = [
    // Permissions table
    `CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Roles table
    `CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      is_system_role BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      color TEXT DEFAULT '#6b7280',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )`,

    // Role permissions junction table
    `CREATE TABLE IF NOT EXISTS role_permissions (
      role_id TEXT,
      permission_id TEXT,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    )`,

    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      department TEXT,
      position TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      profile_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      created_by TEXT,
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // User sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // Branches table
    `CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      currency TEXT CHECK(currency IN ('USD', 'IQD')) NOT NULL,
      description TEXT,
      manager TEXT,
      phone TEXT,
      address TEXT,
      is_active BOOLEAN DEFAULT 1,
      module_type TEXT CHECK(module_type IN ('accounting', 'market')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Invoices table
    `CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      currency TEXT CHECK(currency IN ('USD', 'IQD')) NOT NULL,
      invoice_date DATE NOT NULL,
      entry_date DATE NOT NULL,
      notes TEXT,
      payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
      paid_at DATETIME,
      paid_date DATE,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Dollar rates table
    `CREATE TABLE IF NOT EXISTS dollar_rates (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      rate DECIMAL(10,4) NOT NULL,
      entered_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entered_by) REFERENCES users(id)
    )`,

    // Sales entries table
    `CREATE TABLE IF NOT EXISTS sales_entries (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Profit entries table
    `CREATE TABLE IF NOT EXISTS profit_entries (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Expense entries table
    `CREATE TABLE IF NOT EXISTS expense_entries (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      date DATE NOT NULL,
      notes TEXT,
      payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
      paid_at DATETIME,
      paid_date DATE,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Employees table
    `CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      location TEXT,
      salary DECIMAL(10,2) NOT NULL,
      salary_days INTEGER NOT NULL,
      start_date DATE NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      last_paid_date DATE,
      is_paid BOOLEAN DEFAULT 0,
      paid_amount DECIMAL(10,2),
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Adjustments table
    `CREATE TABLE IF NOT EXISTS adjustments (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      type TEXT CHECK(type IN ('penalty', 'bonus')) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Dashboard widgets table
    `CREATE TABLE IF NOT EXISTS dashboard_widgets (
      id TEXT PRIMARY KEY,
      type TEXT CHECK(type IN ('invoices', 'sales', 'expenses', 'payroll', 'currency', 'alerts')) NOT NULL,
      title TEXT NOT NULL,
      visible BOOLEAN DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT CHECK(type IN ('invoice', 'expense', 'payroll', 'rate')) NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const table of tables) {
    await runQuery(table);
  }
};

// Insert default data
const insertDefaultData = async () => {
  try {
    // Check if permissions exist
    const permissionCount = await getQuery('SELECT COUNT(*) as count FROM permissions');
    
    if (permissionCount.count === 0) {
      console.log('🔄 Inserting default permissions...');
      
      // Default permissions
      const permissions = [
        // Dashboard permissions
        { id: uuidv4(), name: 'dashboard.view', displayName: 'View Dashboard', description: 'Access to dashboard overview', module: 'dashboard', action: 'view' },
        
        // Accounting permissions
        { id: uuidv4(), name: 'accounting.view', displayName: 'View Accounting', description: 'Access to accounting module', module: 'accounting', action: 'view' },
        { id: uuidv4(), name: 'accounting.create', displayName: 'Create Invoices', description: 'Create new invoices and entries', module: 'accounting', action: 'create' },
        { id: uuidv4(), name: 'accounting.edit', displayName: 'Edit Accounting', description: 'Edit existing accounting entries', module: 'accounting', action: 'edit' },
        { id: uuidv4(), name: 'accounting.delete', displayName: 'Delete Accounting', description: 'Delete accounting entries', module: 'accounting', action: 'delete' },
        { id: uuidv4(), name: 'accounting.manage', displayName: 'Manage Accounting', description: 'Full accounting management', module: 'accounting', action: 'manage' },
        { id: uuidv4(), name: 'accounting.export', displayName: 'Export Accounting', description: 'Export accounting data', module: 'accounting', action: 'export' },
        
        // Market permissions
        { id: uuidv4(), name: 'market.view', displayName: 'View Market', description: 'Access to market module', module: 'market', action: 'view' },
        { id: uuidv4(), name: 'market.create', displayName: 'Create Market Entries', description: 'Create sales, profits, expenses', module: 'market', action: 'create' },
        { id: uuidv4(), name: 'market.edit', displayName: 'Edit Market', description: 'Edit market entries', module: 'market', action: 'edit' },
        { id: uuidv4(), name: 'market.delete', displayName: 'Delete Market', description: 'Delete market entries', module: 'market', action: 'delete' },
        { id: uuidv4(), name: 'market.manage', displayName: 'Manage Market', description: 'Full market management', module: 'market', action: 'manage' },
        
        // HR permissions
        { id: uuidv4(), name: 'hr.view', displayName: 'View HR', description: 'Access to HR module', module: 'hr', action: 'view' },
        { id: uuidv4(), name: 'hr.create', displayName: 'Create HR Entries', description: 'Add employees and adjustments', module: 'hr', action: 'create' },
        { id: uuidv4(), name: 'hr.edit', displayName: 'Edit HR', description: 'Edit HR entries', module: 'hr', action: 'edit' },
        { id: uuidv4(), name: 'hr.delete', displayName: 'Delete HR', description: 'Delete HR entries', module: 'hr', action: 'delete' },
        { id: uuidv4(), name: 'hr.manage', displayName: 'Manage HR', description: 'Full HR management', module: 'hr', action: 'manage' },
        { id: uuidv4(), name: 'hr.approve', displayName: 'Approve Payroll', description: 'Approve payroll and adjustments', module: 'hr', action: 'approve' },
        
        // Reports permissions
        { id: uuidv4(), name: 'reports.view', displayName: 'View Reports', description: 'Access to reports module', module: 'reports', action: 'view' },
        { id: uuidv4(), name: 'reports.create', displayName: 'Create Reports', description: 'Generate custom reports', module: 'reports', action: 'create' },
        { id: uuidv4(), name: 'reports.export', displayName: 'Export Reports', description: 'Export reports to PDF/Excel', module: 'reports', action: 'export' },
        
        // Settings permissions
        { id: uuidv4(), name: 'settings.view', displayName: 'View Settings', description: 'Access to settings module', module: 'settings', action: 'view' },
        { id: uuidv4(), name: 'settings.edit', displayName: 'Edit Settings', description: 'Modify system settings', module: 'settings', action: 'edit' },
        { id: uuidv4(), name: 'settings.manage', displayName: 'Manage Settings', description: 'Full settings management', module: 'settings', action: 'manage' },
        
        // System permissions
        { id: uuidv4(), name: 'system.users', displayName: 'Manage Users', description: 'Manage user accounts', module: 'system', action: 'manage' },
        { id: uuidv4(), name: 'system.roles', displayName: 'Manage Roles', description: 'Manage roles and permissions', module: 'system', action: 'manage' },
        { id: uuidv4(), name: 'system.branches', displayName: 'Manage Branches', description: 'Manage branch settings', module: 'system', action: 'manage' },
        { id: uuidv4(), name: 'system.backup', displayName: 'System Backup', description: 'Backup and restore system', module: 'system', action: 'manage' },
      ];

      for (const permission of permissions) {
        await runQuery(
          'INSERT INTO permissions (id, name, display_name, description, module, action) VALUES (?, ?, ?, ?, ?, ?)',
          [permission.id, permission.name, permission.displayName, permission.description, permission.module, permission.action]
        );
      }

      console.log('✅ Default permissions inserted');

      // Create super admin role
      const superAdminRoleId = uuidv4();
      await runQuery(
        'INSERT INTO roles (id, name, display_name, description, is_system_role, is_active, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [superAdminRoleId, 'super-admin', 'Super Administrator', 'Full system access with all permissions', 1, 1, '#dc2626']
      );

      // Assign all permissions to super admin role
      const allPermissions = await allQuery('SELECT id FROM permissions');
      for (const permission of allPermissions) {
        await runQuery(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [superAdminRoleId, permission.id]
        );
      }

      // Create default admin user
      const adminUserId = uuidv4();
      const hashedPassword = await bcrypt.hash('password', 10);
      
      await runQuery(
        'INSERT INTO users (id, username, password_hash, role_id, name, email, department, position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [adminUserId, 'admin', hashedPassword, superAdminRoleId, 'System Administrator', 'admin@yourcompany.com', 'Management', 'Administrator', 1]
      );

      console.log('✅ Default admin user created (username: admin, password: password)');
    }
  } catch (error) {
    console.error('Error inserting default data:', error);
    throw error;
  }
};

// Run migrations
const runMigrations = async () => {
  try {
    // Migration 1: Add paid_at and paid_date columns to invoices table
    const invoicesColumns = await allQuery("PRAGMA table_info(invoices)");
    const hasPaidAt = invoicesColumns.some(column => column.name === 'paid_at');
    const hasPaidDate = invoicesColumns.some(column => column.name === 'paid_date');
    
    if (!hasPaidAt) {
      console.log('🔄 Adding paid_at column to invoices table...');
      await runQuery('ALTER TABLE invoices ADD COLUMN paid_at DATETIME');
    }
    
    if (!hasPaidDate) {
      console.log('🔄 Adding paid_date column to invoices table...');
      await runQuery('ALTER TABLE invoices ADD COLUMN paid_date DATE');
    }
    
    // Migration 2: Add name column to market entries tables
    const salesColumns = await allQuery("PRAGMA table_info(sales_entries)");
    const salesHasName = salesColumns.some(column => column.name === 'name');
    
    if (!salesHasName) {
      console.log('🔄 Adding name column to sales_entries table...');
      await runQuery('ALTER TABLE sales_entries ADD COLUMN name TEXT DEFAULT ""');
    }
    
    const profitColumns = await allQuery("PRAGMA table_info(profit_entries)");
    const profitHasName = profitColumns.some(column => column.name === 'name');
    
    if (!profitHasName) {
      console.log('🔄 Adding name column to profit_entries table...');
      await runQuery('ALTER TABLE profit_entries ADD COLUMN name TEXT DEFAULT ""');
    }
    
    const expenseColumns = await allQuery("PRAGMA table_info(expense_entries)");
    const expenseHasName = expenseColumns.some(column => column.name === 'name');
    
    if (!expenseHasName) {
      console.log('🔄 Adding name column to expense_entries table...');
      await runQuery('ALTER TABLE expense_entries ADD COLUMN name TEXT DEFAULT ""');
    }
    
    // Migration 3: Add branch_id column to employees table
    const employeesColumns = await allQuery("PRAGMA table_info(employees)");
    const hasBranchId = employeesColumns.some(column => column.name === 'branch_id');
    
    if (!hasBranchId) {
      console.log('🔄 Adding branch_id column to employees table...');
      await runQuery('ALTER TABLE employees ADD COLUMN branch_id TEXT');
    }
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
};

// Initialize database and run migrations
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    await createTables();
    await runMigrations();
    await insertDefaultData();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}; 