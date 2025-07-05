import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRoles } from '../../contexts/RoleContext';
import { 
  Shield, 
  Users, 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Crown,
  UserCheck,
  Settings,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Select from '../Common/Select';
import Modal from '../Common/Modal';
import { Role, Permission, User } from '../../types';

const RoleManagement: React.FC = () => {
  const { t } = useLanguage();
  const { 
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
    assignRoleToUser
  } = useRoles();
  
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'role' | 'user', id: string} | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as Permission[],
    color: '#2563eb'
  });

  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    roleId: '',
    password: ''
  });

  const handleAddRole = () => {
    if (!newRole.name || !newRole.displayName) {
      alert('Please fill in all required fields');
      return;
    }

    addRole({
      name: newRole.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: newRole.displayName,
      description: newRole.description,
      permissions: newRole.permissions,
      isSystemRole: false,
      isActive: true,
      color: newRole.color
    });

    setNewRole({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
      color: '#2563eb'
    });
    setShowAddRoleModal(false);
  };

  const handleEditRole = () => {
    if (!editingRole) return;

    updateRole(editingRole.id, editingRole);
    setShowEditRoleModal(false);
    setEditingRole(null);
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.name || !newUser.email || !newUser.roleId) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedRole = roles.find(r => r.id === newUser.roleId);
    if (!selectedRole) {
      alert('Please select a valid role');
      return;
    }

    addUser({
      username: newUser.username,
      role: selectedRole,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      department: newUser.department,
      position: newUser.position,
      permissions: selectedRole.permissions,
      isActive: true
    });

    setNewUser({
      username: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      roleId: '',
      password: ''
    });
    setShowAddUserModal(false);
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    updateUser(editingUser.id, editingUser);
    setShowEditUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteRole = (roleId: string) => {
    deleteRole(roleId);
    setShowDeleteConfirm(null);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    setShowDeleteConfirm(null);
  };

  const startEditRole = (role: Role) => {
    setEditingRole({ ...role });
    setShowEditRoleModal(true);
  };

  const startEditUser = (user: User) => {
    setEditingUser({ ...user });
    setShowEditUserModal(true);
  };

  const togglePermission = (permission: Permission, isSelected: boolean) => {
    if (editingRole) {
      const updatedPermissions = isSelected
        ? editingRole.permissions.filter(p => p.id !== permission.id)
        : [...editingRole.permissions, permission];
      
      setEditingRole({
        ...editingRole,
        permissions: updatedPermissions
      });
    } else {
      const updatedPermissions = isSelected
        ? newRole.permissions.filter(p => p.id !== permission.id)
        : [...newRole.permissions, permission];
      
      setNewRole({
        ...newRole,
        permissions: updatedPermissions
      });
    }
  };

  const getFilteredRoles = () => {
    return roles.filter(role => {
      const matchesSearch = role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           role.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && role.isActive) ||
                           (filterStatus === 'inactive' && !role.isActive);
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.role.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && user.isActive) ||
                           (filterStatus === 'inactive' && !user.isActive);
      return matchesSearch && matchesStatus;
    });
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const tabs = [
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'permissions', label: 'Permission Matrix', icon: Key }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Role Management System
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage user roles, permissions, and access control
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {activeTab === 'roles' && (
            <Button
              onClick={() => setShowAddRoleModal(true)}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          )}
          {activeTab === 'users' && (
            <Button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'roles' | 'users' | 'permissions')}
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
        <div className="p-6">
          {/* Search and Filter */}
          {(activeTab === 'roles' || activeTab === 'users') && (
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {getFilteredRoles().map((role) => (
                <div
                  key={role.id}
                  className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-6 transition-all duration-200 ${
                    role.isActive 
                      ? 'border-gray-200 dark:border-gray-700 hover:shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700 opacity-75'
                  }`}
                  style={{ borderLeftColor: role.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${role.color}20` }}
                      >
                        {role.isSystemRole ? (
                          <Crown className="w-5 h-5" style={{ color: role.color }} />
                        ) : (
                          <Shield className="w-5 h-5" style={{ color: role.color }} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {role.displayName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {role.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {role.isSystemRole && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                          System
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        role.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {role.description || 'No description provided'}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      PERMISSIONS PREVIEW
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <span
                          key={permission.id}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {permission.displayName}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startEditRole(role)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      onClick={() => toggleRoleStatus(role.id)}
                      variant={role.isActive ? "outline" : "success"}
                      size="sm"
                      className="flex-1"
                    >
                      {role.isActive ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Enable
                        </>
                      )}
                    </Button>
                    
                    {!role.isSystemRole && (
                      <Button
                        onClick={() => setShowDeleteConfirm({type: 'role', id: role.id})}
                        variant="danger"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getFilteredUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: user.role.color }}
                        >
                          {user.role.displayName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{user.department || '-'}</div>
                          <div className="text-gray-500 dark:text-gray-400">{user.position || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => startEditUser(user)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => toggleUserStatus(user.id)}
                          variant={user.isActive ? "outline" : "success"}
                          size="sm"
                        >
                          {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm({type: 'user', id: user.id})}
                          variant="danger"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Permission Matrix
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Overview of all available permissions organized by module and action type
                </p>
              </div>

              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <div key={module} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {module} Module
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {modulePermissions.length} permissions available
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modulePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {permission.displayName}
                            </h5>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              permission.action === 'view' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              permission.action === 'create' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              permission.action === 'edit' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              permission.action === 'delete' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              permission.action === 'manage' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {permission.action}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {permission.description}
                          </p>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {permission.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        title="Create New Role"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role Name *"
              value={newRole.name}
              onChange={(e) => setNewRole({...newRole, name: e.target.value})}
              placeholder="e.g., sales-manager"
            />
            
            <Input
              label="Display Name *"
              value={newRole.displayName}
              onChange={(e) => setNewRole({...newRole, displayName: e.target.value})}
              placeholder="e.g., Sales Manager"
            />
          </div>
          
          <Input
            label="Description"
            value={newRole.description}
            onChange={(e) => setNewRole({...newRole, description: e.target.value})}
            placeholder="Describe the role responsibilities"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role Color
            </label>
            <input
              type="color"
              value={newRole.color}
              onChange={(e) => setNewRole({...newRole, color: e.target.value})}
              className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assign Permissions
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <div key={module} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                    {module} Module
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {modulePermissions.map((permission) => {
                      const isSelected = newRole.permissions.some(p => p.id === permission.id);
                      return (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission, isSelected)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {permission.displayName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddRole} className="flex-1">
              Create Role
            </Button>
            <Button variant="outline" onClick={() => setShowAddRoleModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditRoleModal}
        onClose={() => setShowEditRoleModal(false)}
        title="Edit Role"
        size="xl"
      >
        {editingRole && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Name *"
                value={editingRole.displayName}
                onChange={(e) => setEditingRole({...editingRole, displayName: e.target.value})}
                placeholder="e.g., Sales Manager"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Color
                </label>
                <input
                  type="color"
                  value={editingRole.color}
                  onChange={(e) => setEditingRole({...editingRole, color: e.target.value})}
                  className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
            </div>
            
            <Input
              label="Description"
              value={editingRole.description}
              onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
              placeholder="Describe the role responsibilities"
            />
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Permissions
              </h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                      {module} Module
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modulePermissions.map((permission) => {
                        const isSelected = editingRole.permissions.some(p => p.id === permission.id);
                        return (
                          <label
                            key={permission.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePermission(permission, isSelected)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {permission.displayName}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={handleEditRole} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditRoleModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username *"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              placeholder="Enter username"
            />
            
            <Input
              label="Full Name *"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="Enter full name"
            />
            
            <Input
              label="Email *"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="Enter email address"
            />
            
            <Input
              label="Phone"
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              placeholder="Enter phone number"
            />
            
            <Input
              label="Department"
              value={newUser.department}
              onChange={(e) => setNewUser({...newUser, department: e.target.value})}
              placeholder="Enter department"
            />
            
            <Input
              label="Position"
              value={newUser.position}
              onChange={(e) => setNewUser({...newUser, position: e.target.value})}
              placeholder="Enter position"
            />
          </div>
          
          <Select
            label="Role *"
            value={newUser.roleId}
            onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
            options={[
              { value: '', label: 'Select Role' },
              ...roles.filter(r => r.isActive).map(role => ({ 
                value: role.id, 
                label: role.displayName 
              }))
            ]}
          />
          
          <Input
            label="Password *"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            placeholder="Enter password"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddUser} className="flex-1">
              Add User
            </Button>
            <Button variant="outline" onClick={() => setShowAddUserModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        title="Edit User"
        size="lg"
      >
        {editingUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                placeholder="Enter full name"
              />
              
              <Input
                label="Email *"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                placeholder="Enter email address"
              />
              
              <Input
                label="Phone"
                value={editingUser.phone || ''}
                onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                placeholder="Enter phone number"
              />
              
              <Input
                label="Department"
                value={editingUser.department || ''}
                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                placeholder="Enter department"
              />
              
              <Input
                label="Position"
                value={editingUser.position || ''}
                onChange={(e) => setEditingUser({...editingUser, position: e.target.value})}
                placeholder="Enter position"
              />
            </div>
            
            <Select
              label="Role *"
              value={editingUser.role.id}
              onChange={(e) => {
                const selectedRole = roles.find(r => r.id === e.target.value);
                if (selectedRole) {
                  setEditingUser({
                    ...editingUser, 
                    role: selectedRole,
                    permissions: selectedRole.permissions
                  });
                }
              }}
              options={[
                { value: '', label: 'Select Role' },
                ...roles.filter(r => r.isActive).map(role => ({ 
                  value: role.id, 
                  label: role.displayName 
                }))
              ]}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={handleEditUser} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditUserModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={`Delete ${showDeleteConfirm?.type === 'role' ? 'Role' : 'User'}`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Are you sure you want to delete this {showDeleteConfirm?.type}?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => {
                if (showDeleteConfirm?.type === 'role') {
                  handleDeleteRole(showDeleteConfirm.id);
                } else {
                  handleDeleteUser(showDeleteConfirm.id);
                }
              }} 
              variant="danger" 
              className="flex-1"
            >
              Delete {showDeleteConfirm?.type === 'role' ? 'Role' : 'User'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(null)} 
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

export default RoleManagement;