import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Role, Permission, User } from '../types';

interface RoleContextType {
  roles: Role[];
  permissions: Permission[];
  users: User[];
  addRole: (role: Omit<Role, 'id' | 'createdAt'>) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  deleteRole: (roleId: string) => void;
  toggleRoleStatus: (roleId: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  assignRoleToUser: (userId: string, roleId: string) => void;
  hasPermission: (userId: string, permission: string) => boolean;
  getUserRole: (userId: string) => Role | undefined;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRoles = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoles must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  // Default permissions
  const [permissions] = useState<Permission[]>([
    // Dashboard permissions
    { id: 'dashboard.view', name: 'dashboard.view', displayName: 'View Dashboard', description: 'Access to dashboard overview', module: 'dashboard', action: 'view' },
    
    // Accounting permissions
    { id: 'accounting.view', name: 'accounting.view', displayName: 'View Accounting', description: 'Access to accounting module', module: 'accounting', action: 'view' },
    { id: 'accounting.create', name: 'accounting.create', displayName: 'Create Invoices', description: 'Create new invoices and entries', module: 'accounting', action: 'create' },
    { id: 'accounting.edit', name: 'accounting.edit', displayName: 'Edit Accounting', description: 'Edit existing accounting entries', module: 'accounting', action: 'edit' },
    { id: 'accounting.delete', name: 'accounting.delete', displayName: 'Delete Accounting', description: 'Delete accounting entries', module: 'accounting', action: 'delete' },
    { id: 'accounting.manage', name: 'accounting.manage', displayName: 'Manage Accounting', description: 'Full accounting management', module: 'accounting', action: 'manage' },
    { id: 'accounting.export', name: 'accounting.export', displayName: 'Export Accounting', description: 'Export accounting data', module: 'accounting', action: 'export' },
    
    // Market permissions
    { id: 'market.view', name: 'market.view', displayName: 'View Market', description: 'Access to market module', module: 'market', action: 'view' },
    { id: 'market.create', name: 'market.create', displayName: 'Create Market Entries', description: 'Create sales, profits, expenses', module: 'market', action: 'create' },
    { id: 'market.edit', name: 'market.edit', displayName: 'Edit Market', description: 'Edit market entries', module: 'market', action: 'edit' },
    { id: 'market.delete', name: 'market.delete', displayName: 'Delete Market', description: 'Delete market entries', module: 'market', action: 'delete' },
    { id: 'market.manage', name: 'market.manage', displayName: 'Manage Market', description: 'Full market management', module: 'market', action: 'manage' },
    
    // HR permissions
    { id: 'hr.view', name: 'hr.view', displayName: 'View HR', description: 'Access to HR module', module: 'hr', action: 'view' },
    { id: 'hr.create', name: 'hr.create', displayName: 'Create HR Entries', description: 'Add employees and adjustments', module: 'hr', action: 'create' },
    { id: 'hr.edit', name: 'hr.edit', displayName: 'Edit HR', description: 'Edit HR entries', module: 'hr', action: 'edit' },
    { id: 'hr.delete', name: 'hr.delete', displayName: 'Delete HR', description: 'Delete HR entries', module: 'hr', action: 'delete' },
    { id: 'hr.manage', name: 'hr.manage', displayName: 'Manage HR', description: 'Full HR management', module: 'hr', action: 'manage' },
    { id: 'hr.approve', name: 'hr.approve', displayName: 'Approve Payroll', description: 'Approve payroll and adjustments', module: 'hr', action: 'approve' },
    
    // Reports permissions
    { id: 'reports.view', name: 'reports.view', displayName: 'View Reports', description: 'Access to reports module', module: 'reports', action: 'view' },
    { id: 'reports.create', name: 'reports.create', displayName: 'Create Reports', description: 'Generate custom reports', module: 'reports', action: 'create' },
    { id: 'reports.export', name: 'reports.export', displayName: 'Export Reports', description: 'Export reports to PDF/Excel', module: 'reports', action: 'export' },
    
    // Settings permissions
    { id: 'settings.view', name: 'settings.view', displayName: 'View Settings', description: 'Access to settings module', module: 'settings', action: 'view' },
    { id: 'settings.edit', name: 'settings.edit', displayName: 'Edit Settings', description: 'Modify system settings', module: 'settings', action: 'edit' },
    { id: 'settings.manage', name: 'settings.manage', displayName: 'Manage Settings', description: 'Full settings management', module: 'settings', action: 'manage' },
    
    // System permissions
    { id: 'system.users', name: 'system.users', displayName: 'Manage Users', description: 'Manage user accounts', module: 'system', action: 'manage' },
    { id: 'system.roles', name: 'system.roles', displayName: 'Manage Roles', description: 'Manage roles and permissions', module: 'system', action: 'manage' },
    { id: 'system.branches', name: 'system.branches', displayName: 'Manage Branches', description: 'Manage branch settings', module: 'system', action: 'manage' },
    { id: 'system.backup', name: 'system.backup', displayName: 'System Backup', description: 'Backup and restore system', module: 'system', action: 'manage' },
  ]);

  // Default roles
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'super-admin',
      name: 'super-admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: permissions,
      isSystemRole: true,
      isActive: true,
      color: '#dc2626',
      createdAt: new Date().toISOString()
    },
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrator',
      description: 'Administrative access with most permissions',
      permissions: permissions.filter(p => !p.name.includes('system.backup')),
      isSystemRole: true,
      isActive: true,
      color: '#2563eb',
      createdAt: new Date().toISOString()
    },
    {
      id: 'accountant',
      name: 'accountant',
      displayName: 'Accountant',
      description: 'Accounting and financial operations access with HR withdrawals',
      permissions: permissions.filter(p => 
        p.module === 'dashboard' || 
        p.module === 'accounting' || 
        p.module === 'reports' ||
        (p.module === 'settings' && p.action === 'view') ||
        (p.module === 'hr' && p.action === 'view')
      ),
      isSystemRole: true,
      isActive: true,
      color: '#059669',
      createdAt: new Date().toISOString()
    },
    {
      id: 'market-manager',
      name: 'market-manager',
      displayName: 'Market Manager',
      description: 'Market operations and sales management',
      permissions: permissions.filter(p => 
        p.module === 'dashboard' || 
        p.module === 'market' || 
        p.module === 'reports' ||
        (p.module === 'settings' && p.action === 'view')
      ),
      isSystemRole: false,
      isActive: true,
      color: '#7c3aed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'hr-manager',
      name: 'hr-manager',
      displayName: 'HR Manager',
      description: 'Human resources and payroll management',
      permissions: permissions.filter(p => 
        p.module === 'dashboard' || 
        p.module === 'hr' || 
        p.module === 'reports' ||
        (p.module === 'settings' && p.action === 'view')
      ),
      isSystemRole: false,
      isActive: true,
      color: '#ea580c',
      createdAt: new Date().toISOString()
    },
    {
      id: 'viewer',
      name: 'viewer',
      displayName: 'Viewer',
      description: 'Read-only access to most modules',
      permissions: permissions.filter(p => p.action === 'view'),
      isSystemRole: false,
      isActive: true,
      color: '#6b7280',
      createdAt: new Date().toISOString()
    }
  ]);

  // Default users - keeping only one admin for system access
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      role: roles.find(r => r.name === 'super-admin')!,
      name: 'System Administrator',
      email: 'admin@yourcompany.com',
      phone: '',
      department: 'Management',
      position: 'Administrator',
      permissions: roles.find(r => r.name === 'super-admin')!.permissions,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const addRole = (roleData: Omit<Role, 'id' | 'createdAt'>) => {
    const newRole: Role = {
      ...roleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setRoles(prev => [...prev, newRole]);
  };

  const updateRole = (roleId: string, updates: Partial<Role>) => {
    setRoles(prev =>
      prev.map(role => 
        role.id === roleId 
          ? { ...role, ...updates, updatedAt: new Date().toISOString() }
          : role
      )
    );
    
    // Update users with this role
    setUsers(prev =>
      prev.map(user => {
        if (user.role.id === roleId) {
          const updatedRole = { ...user.role, ...updates };
          return {
            ...user,
            role: updatedRole,
            permissions: updatedRole.permissions || user.permissions
          };
        }
        return user;
      })
    );
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystemRole) {
      alert('Cannot delete system roles');
      return;
    }
    
    // Check if any users have this role
    const usersWithRole = users.filter(u => u.role.id === roleId);
    if (usersWithRole.length > 0) {
      alert(`Cannot delete role. ${usersWithRole.length} users are assigned to this role.`);
      return;
    }
    
    setRoles(prev => prev.filter(role => role.id !== roleId));
  };

  const toggleRoleStatus = (roleId: string) => {
    setRoles(prev =>
      prev.map(role =>
        role.id === roleId ? { ...role, isActive: !role.isActive } : role
      )
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, ...updates, updatedAt: new Date().toISOString() }
          : user
      )
    );
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
  };

  const assignRoleToUser = (userId: string, roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { 
              ...user, 
              role, 
              permissions: role.permissions,
              updatedAt: new Date().toISOString()
            }
          : user
      )
    );
  };

  const hasPermission = (userId: string, permission: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.isActive) return false;
    
    return user.permissions.some(p => p.name === permission);
  };

  const getUserRole = (userId: string): Role | undefined => {
    const user = users.find(u => u.id === userId);
    return user?.role;
  };

  return (
    <RoleContext.Provider
      value={{
        roles,
        permissions,
        users,
        addRole,
        updateRole,
        deleteRole,
        toggleRoleStatus,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        assignRoleToUser,
        hasPermission,
        getUserRole
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};