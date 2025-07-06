const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { runQuery, getQuery, allQuery } = require('../database.js');

const router = express.Router();

// Helper function to transform database columns to frontend properties
const transformBranchToFrontend = (branch) => {
  if (!branch) return null;
  
  return {
    id: branch.id,
    name: branch.name,
    location: branch.location,
    currency: branch.currency,
    description: branch.description,
    manager: branch.manager,
    phone: branch.phone,
    address: branch.address,
    isActive: Boolean(branch.is_active),
    moduleType: branch.module_type,
    createdAt: branch.created_at
  };
};

// Helper function to transform frontend properties to database columns
const transformBranchToDatabase = (branch) => {
  return {
    name: branch.name,
    location: branch.location,
    currency: branch.currency,
    description: branch.description,
    manager: branch.manager,
    phone: branch.phone,
    address: branch.address,
    is_active: branch.isActive !== undefined ? (branch.isActive ? 1 : 0) : undefined,
    module_type: branch.moduleType
  };
};

// Get all branches
router.get('/', async (req, res) => {
  try {
    const { moduleType } = req.query;
    
    let query = 'SELECT * FROM branches WHERE 1=1';
    const params = [];

    if (moduleType) {
      query += ' AND module_type = ?';
      params.push(moduleType);
    }

    query += ' ORDER BY created_at DESC';

    const branches = await allQuery(query, params);
    const transformedBranches = branches.map(transformBranchToFrontend);
    
    res.json({
      branches: transformedBranches,
      total: transformedBranches.length
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Get branch by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const branch = await getQuery('SELECT * FROM branches WHERE id = ?', [id]);
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(transformBranchToFrontend(branch));
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
});

// Create new branch
router.post('/', async (req, res) => {
  try {
    const {
      name,
      location,
      currency,
      description,
      manager,
      phone,
      address,
      moduleType
    } = req.body;

    // Validation
    if (!name || !location || !currency || !moduleType) {
      return res.status(400).json({ 
        error: 'Name, location, currency, and module type are required' 
      });
    }

    if (!['USD', 'IQD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be USD or IQD' });
    }

    if (!['accounting', 'market'].includes(moduleType)) {
      return res.status(400).json({ error: 'Module type must be accounting or market' });
    }

    const branchId = uuidv4();
    
    await runQuery(`
      INSERT INTO branches (
        id, name, location, currency, description, manager, 
        phone, address, module_type, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      branchId, name, location, currency, description, 
      manager, phone, address, moduleType, 1
    ]);

    const newBranch = await getQuery('SELECT * FROM branches WHERE id = ?', [branchId]);
    
    res.status(201).json(transformBranchToFrontend(newBranch));
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

// Update branch
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      currency,
      description,
      manager,
      phone,
      address,
      isActive
    } = req.body;

    // Check if branch exists
    const existingBranch = await getQuery('SELECT * FROM branches WHERE id = ?', [id]);
    if (!existingBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Validation
    if (currency && !['USD', 'IQD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be USD or IQD' });
    }

    // Convert isActive to database format
    const isActiveDb = isActive !== undefined ? (isActive ? 1 : 0) : undefined;

    await runQuery(`
      UPDATE branches SET 
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        currency = COALESCE(?, currency),
        description = COALESCE(?, description),
        manager = COALESCE(?, manager),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name, location, currency, description, manager, phone, address, isActiveDb, id]);

    const updatedBranch = await getQuery('SELECT * FROM branches WHERE id = ?', [id]);
    
    res.json(transformBranchToFrontend(updatedBranch));
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ error: 'Failed to update branch' });
  }
});

// Delete branch
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch exists
    const existingBranch = await getQuery('SELECT * FROM branches WHERE id = ?', [id]);
    if (!existingBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Check if branch has associated data
    const invoiceCount = await getQuery('SELECT COUNT(*) as count FROM invoices WHERE branch_id = ?', [id]);
    const salesCount = await getQuery('SELECT COUNT(*) as count FROM sales_entries WHERE branch_id = ?', [id]);
    const profitCount = await getQuery('SELECT COUNT(*) as count FROM profit_entries WHERE branch_id = ?', [id]);
    const expenseCount = await getQuery('SELECT COUNT(*) as count FROM expense_entries WHERE branch_id = ?', [id]);

    const totalRecords = invoiceCount.count + salesCount.count + profitCount.count + expenseCount.count;

    if (totalRecords > 0) {
      return res.status(400).json({ 
        error: `Cannot delete branch. It has ${totalRecords} associated records.`,
        details: {
          invoices: invoiceCount.count,
          sales: salesCount.count,
          profits: profitCount.count,
          expenses: expenseCount.count
        }
      });
    }

    await runQuery('DELETE FROM branches WHERE id = ?', [id]);
    
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
});

// Toggle branch status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const existingBranch = await getQuery('SELECT * FROM branches WHERE id = ?', [id]);
    if (!existingBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const newStatus = existingBranch.is_active ? 0 : 1;
    
    await runQuery('UPDATE branches SET is_active = ? WHERE id = ?', [newStatus, id]);

    const updatedBranch = await getQuery('SELECT * FROM branches WHERE id = ?', [id]);
    
    res.json(transformBranchToFrontend(updatedBranch));
  } catch (error) {
    console.error('Error toggling branch status:', error);
    res.status(500).json({ error: 'Failed to toggle branch status' });
  }
});

// Get branches by module type
router.get('/module/:moduleType', async (req, res) => {
  try {
    const { moduleType } = req.params;

    if (!['accounting', 'market'].includes(moduleType)) {
      return res.status(400).json({ error: 'Invalid module type' });
    }

    const branches = await allQuery(
      'SELECT * FROM branches WHERE module_type = ? ORDER BY created_at DESC',
      [moduleType]
    );
    
    const transformedBranches = branches.map(transformBranchToFrontend);
    
    res.json({
      branches: transformedBranches,
      moduleType: moduleType,
      total: transformedBranches.length
    });
  } catch (error) {
    console.error('Error fetching branches by module:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

module.exports = router; 
