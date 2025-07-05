import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBranches } from '../../contexts/BranchContext';
import { Plus, Edit, Trash2, Building, MapPin, DollarSign, Check, X, Eye, EyeOff, Calculator, TrendingUp } from 'lucide-react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Select from '../Common/Select';
import Modal from '../Common/Modal';
import { Branch } from '../../types';

const BranchManagement: React.FC = () => {
  const { t } = useLanguage();
  const { 
    accountingBranches, 
    marketBranches, 
    addBranch, 
    updateBranch, 
    deleteBranch, 
    toggleBranchStatus 
  } = useBranches();
  
  const [activeTab, setActiveTab] = useState<'accounting' | 'market'>('accounting');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [newBranch, setNewBranch] = useState({
    name: '',
    location: '',
    currency: 'IQD' as 'IQD' | 'USD',
    description: '',
    manager: '',
    phone: '',
    address: '',
    moduleType: 'accounting' as 'accounting' | 'market'
  });

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.location) {
      alert('Please fill in all required fields');
      return;
    }

    addBranch({
      name: newBranch.name,
      location: newBranch.location,
      currency: newBranch.currency,
      description: newBranch.description,
      manager: newBranch.manager,
      phone: newBranch.phone,
      address: newBranch.address,
      isActive: true,
      moduleType: newBranch.moduleType
    });
    
    setNewBranch({
      name: '',
      location: '',
      currency: 'IQD',
      description: '',
      manager: '',
      phone: '',
      address: '',
      moduleType: 'accounting'
    });
    setShowAddModal(false);
  };

  const handleEditBranch = () => {
    if (!editingBranch) return;

    updateBranch(editingBranch.id, editingBranch);
    setShowEditModal(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (branchId: string, moduleType: 'accounting' | 'market') => {
    deleteBranch(branchId, moduleType);
    setShowDeleteConfirm(null);
  };

  const handleToggleBranchStatus = (branchId: string, moduleType: 'accounting' | 'market') => {
    toggleBranchStatus(branchId, moduleType);
  };

  const startEdit = (branch: Branch) => {
    setEditingBranch({ ...branch });
    setShowEditModal(true);
  };

  const getCurrentBranches = () => {
    return activeTab === 'accounting' ? accountingBranches : marketBranches;
  };

  const getAllBranches = () => {
    return [...accountingBranches, ...marketBranches];
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Branch Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage branches for Accounting and Market modules separately
          </p>
        </div>
        <Button
          onClick={() => {
            setNewBranch({...newBranch, moduleType: activeTab});
            setShowAddModal(true);
          }}
          className="flex items-center justify-center w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === 'accounting' ? 'Accounting' : 'Market'} Branch
        </Button>
      </div>

      {/* Module Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('accounting')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accounting'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Accounting Branches ({accountingBranches.length})
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'market'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Market Branches ({marketBranches.length})
            </button>
          </nav>
        </div>
      </div>
      {/* Branch Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {activeTab === 'accounting' ? 'Accounting' : 'Market'} Branches
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getCurrentBranches().length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Branches</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getCurrentBranches().filter(b => b.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">USD Branches</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {getCurrentBranches().filter(b => b.currency === 'USD').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {getCurrentBranches().map((branch) => (
          <div
            key={branch.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 transition-all duration-200 ${
              branch.isActive 
                ? 'border-green-200 dark:border-green-800 hover:shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 opacity-75'
            }`}
          >
            <div className="p-4 sm:p-6">
              {/* Branch Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    branch.isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/20' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Building className={`w-5 h-5 ${
                      branch.isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {branch.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {branch.location}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    branch.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Branch Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                  <span className={`font-medium px-2 py-1 rounded ${
                    branch.currency === 'USD' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {branch.currency}
                  </span>
                </div>
                
                {branch.manager && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Manager:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{branch.manager}</span>
                  </div>
                )}
                
                {branch.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="text-gray-900 dark:text-white">{branch.phone}</span>
                  </div>
                )}
                
                {branch.description && (
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Description:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{branch.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  onClick={() => startEdit(branch)}
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  onClick={() => handleToggleBranchStatus(branch.id, branch.moduleType)}
                  variant={branch.isActive ? "outline" : "success"}
                  size="sm"
                  className="flex items-center justify-center flex-1"
                >
                  {branch.isActive ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setShowDeleteConfirm(branch.id)}
                  variant="danger"
                  size="sm"
                  className="flex items-center justify-center sm:w-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {getCurrentBranches().length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {activeTab} branches found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first {activeTab} branch
            </p>
            <Button onClick={() => {
              setNewBranch({...newBranch, moduleType: activeTab});
              setShowAddModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add First {activeTab === 'accounting' ? 'Accounting' : 'Market'} Branch
            </Button>
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add New ${activeTab === 'accounting' ? 'Accounting' : 'Market'} Branch`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              {activeTab === 'accounting' ? (
                <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              ) : (
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              )}
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Creating branch for {activeTab === 'accounting' ? 'Accounting' : 'Market'} module
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch Name *"
              value={newBranch.name}
              onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
              placeholder="Enter branch name"
            />
            
            <Input
              label="Location *"
              value={newBranch.location}
              onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
              placeholder="Enter location"
            />
            
            <Select
              label="Default Currency *"
              value={newBranch.currency}
              onChange={(e) => setNewBranch({...newBranch, currency: e.target.value as 'IQD' | 'USD'})}
              options={[
                { value: 'IQD', label: 'Iraqi Dinar (IQD)' },
                { value: 'USD', label: 'US Dollar (USD)' }
              ]}
            />
            
            <Input
              label="Manager Name"
              value={newBranch.manager}
              onChange={(e) => setNewBranch({...newBranch, manager: e.target.value})}
              placeholder="Enter manager name"
            />
            
            <Input
              label="Phone Number"
              value={newBranch.phone}
              onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
              placeholder="Enter phone number"
            />
            
            <Input
              label="Address"
              value={newBranch.address}
              onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
              placeholder="Enter address"
            />
          </div>
          
          <Input
            label="Description"
            value={newBranch.description}
            onChange={(e) => setNewBranch({...newBranch, description: e.target.value})}
            placeholder="Enter branch description"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddBranch} className="flex-1">
              Add Branch
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${editingBranch?.moduleType === 'accounting' ? 'Accounting' : 'Market'} Branch`}
        size="lg"
      >
        {editingBranch && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Branch Name *"
                value={editingBranch.name}
                onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})}
                placeholder="Enter branch name"
              />
              
              <Input
                label="Location *"
                value={editingBranch.location}
                onChange={(e) => setEditingBranch({...editingBranch, location: e.target.value})}
                placeholder="Enter location"
              />
              
              <Select
                label="Default Currency *"
                value={editingBranch.currency}
                onChange={(e) => setEditingBranch({...editingBranch, currency: e.target.value as 'IQD' | 'USD'})}
                options={[
                  { value: 'IQD', label: 'Iraqi Dinar (IQD)' },
                  { value: 'USD', label: 'US Dollar (USD)' }
                ]}
              />
              
              <Input
                label="Manager Name"
                value={editingBranch.manager || ''}
                onChange={(e) => setEditingBranch({...editingBranch, manager: e.target.value})}
                placeholder="Enter manager name"
              />
              
              <Input
                label="Phone Number"
                value={editingBranch.phone || ''}
                onChange={(e) => setEditingBranch({...editingBranch, phone: e.target.value})}
                placeholder="Enter phone number"
              />
              
              <Input
                label="Address"
                value={editingBranch.address || ''}
                onChange={(e) => setEditingBranch({...editingBranch, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>
            
            <Input
              label="Description"
              value={editingBranch.description || ''}
              onChange={(e) => setEditingBranch({...editingBranch, description: e.target.value})}
              placeholder="Enter branch description"
            />
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={handleEditBranch} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
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
        title="Delete Branch"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Are you sure you want to delete this branch?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                This action cannot be undone. All data associated with this branch will be permanently deleted.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => {
                if (showDeleteConfirm) {
                  const branch = getAllBranches().find(b => b.id === showDeleteConfirm);
                  if (branch) {
                    handleDeleteBranch(showDeleteConfirm, branch.moduleType);
                  }
                }
              }} 
              variant="danger" 
              className="flex-1"
            >
              Delete Branch
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

export default BranchManagement;