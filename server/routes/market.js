import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../database/init.js';

const router = express.Router();

// Transform database result to frontend format for Sales
const transformSalesToFrontend = (sales) => {
  if (!sales) return null;
  
  return {
    id: sales.id,
    branchId: sales.branch_id,
    name: sales.name,
    amount: sales.amount,
    date: sales.date,
    notes: sales.notes,
    createdBy: sales.created_by,
    branchName: sales.branch_name,
    branchLocation: sales.branch_location,
    createdByName: sales.created_by_name
  };
};

// Transform database result to frontend format for Profits
const transformProfitToFrontend = (profit) => {
  if (!profit) return null;
  
  return {
    id: profit.id,
    branchId: profit.branch_id,
    name: profit.name,
    amount: profit.amount,
    date: profit.date,
    notes: profit.notes,
    createdBy: profit.created_by,
    branchName: profit.branch_name,
    branchLocation: profit.branch_location,
    createdByName: profit.created_by_name
  };
};

// Transform database result to frontend format for Expenses
const transformExpenseToFrontend = (expense) => {
  if (!expense) return null;
  
  return {
    id: expense.id,
    branchId: expense.branch_id,
    name: expense.name,
    amount: expense.amount,
    date: expense.date,
    notes: expense.notes,
    paymentStatus: expense.payment_status,
    paidAt: expense.paid_at,
    paidDate: expense.paid_date,
    createdBy: expense.created_by,
    branchName: expense.branch_name,
    branchLocation: expense.branch_location,
    createdByName: expense.created_by_name
  };
};

// SALES ENTRIES ROUTES

// Get all sales entries
router.get('/sales', async (req, res) => {
  try {
    const { branchId, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT s.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM sales_entries s
      JOIN branches b ON s.branch_id = b.id
      JOIN users u ON s.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branchId) {
      query += ' AND s.branch_id = ?';
      params.push(branchId);
    }

    if (startDate) {
      query += ' AND s.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND s.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const sales = await allQuery(query, params);
    
    res.json({
      sales: sales.map(transformSalesToFrontend),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching sales entries:', error);
    res.status(500).json({ error: 'Failed to fetch sales entries' });
  }
});

// Create sales entry
router.post('/sales', async (req, res) => {
  try {
    const { branchId, name, amount, date, notes, createdBy } = req.body;

    if (!branchId || !name || !amount || !date || !createdBy) {
      return res.status(400).json({ 
        error: 'Branch ID, name, amount, date, and created by are required' 
      });
    }

    // Check if branch exists and is market type
    const branch = await getQuery('SELECT * FROM branches WHERE id = ? AND module_type = ?', [branchId, 'market']);
    if (!branch) {
      return res.status(400).json({ error: 'Invalid market branch ID' });
    }

    const salesId = uuidv4();
    
    await runQuery(`
      INSERT INTO sales_entries (id, branch_id, name, amount, date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [salesId, branchId, name, amount, date, notes, createdBy]);

    const newSales = await getQuery(`
      SELECT s.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM sales_entries s
      JOIN branches b ON s.branch_id = b.id
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [salesId]);
    
    res.status(201).json(transformSalesToFrontend(newSales));
  } catch (error) {
    console.error('Error creating sales entry:', error);
    res.status(500).json({ error: 'Failed to create sales entry' });
  }
});

// Update sales entry
router.put('/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, notes } = req.body;

    const existingSales = await getQuery('SELECT * FROM sales_entries WHERE id = ?', [id]);
    if (!existingSales) {
      return res.status(404).json({ error: 'Sales entry not found' });
    }

    await runQuery(`
      UPDATE sales_entries 
      SET amount = COALESCE(?, amount),
          date = COALESCE(?, date),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `, [amount, date, notes, id]);

    const updatedSales = await getQuery(`
      SELECT s.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM sales_entries s
      JOIN branches b ON s.branch_id = b.id
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [id]);
    
    res.json(transformSalesToFrontend(updatedSales));
  } catch (error) {
    console.error('Error updating sales entry:', error);
    res.status(500).json({ error: 'Failed to update sales entry' });
  }
});

// Delete sales entry
router.delete('/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingSales = await getQuery('SELECT * FROM sales_entries WHERE id = ?', [id]);
    if (!existingSales) {
      return res.status(404).json({ error: 'Sales entry not found' });
    }

    await runQuery('DELETE FROM sales_entries WHERE id = ?', [id]);
    
    res.json({ message: 'Sales entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales entry:', error);
    res.status(500).json({ error: 'Failed to delete sales entry' });
  }
});

// PROFIT ENTRIES ROUTES

// Get all profit entries
router.get('/profits', async (req, res) => {
  try {
    const { branchId, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT p.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM profit_entries p
      JOIN branches b ON p.branch_id = b.id
      JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branchId) {
      query += ' AND p.branch_id = ?';
      params.push(branchId);
    }

    if (startDate) {
      query += ' AND p.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND p.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const profits = await allQuery(query, params);
    
    res.json({
      profits: profits.map(transformProfitToFrontend),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching profit entries:', error);
    res.status(500).json({ error: 'Failed to fetch profit entries' });
  }
});

// Create profit entry
router.post('/profits', async (req, res) => {
  try {
    const { branchId, name, amount, date, notes, createdBy } = req.body;

    if (!branchId || !name || !amount || !date || !createdBy) {
      return res.status(400).json({ 
        error: 'Branch ID, name, amount, date, and created by are required' 
      });
    }

    // Check if branch exists and is market type
    const branch = await getQuery('SELECT * FROM branches WHERE id = ? AND module_type = ?', [branchId, 'market']);
    if (!branch) {
      return res.status(400).json({ error: 'Invalid market branch ID' });
    }

    const profitId = uuidv4();
    
    await runQuery(`
      INSERT INTO profit_entries (id, branch_id, name, amount, date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [profitId, branchId, name, amount, date, notes, createdBy]);

    const newProfit = await getQuery(`
      SELECT p.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM profit_entries p
      JOIN branches b ON p.branch_id = b.id
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [profitId]);
    
    res.status(201).json(transformProfitToFrontend(newProfit));
  } catch (error) {
    console.error('Error creating profit entry:', error);
    res.status(500).json({ error: 'Failed to create profit entry' });
  }
});

// Update profit entry
router.put('/profits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, notes } = req.body;

    const existingProfit = await getQuery('SELECT * FROM profit_entries WHERE id = ?', [id]);
    if (!existingProfit) {
      return res.status(404).json({ error: 'Profit entry not found' });
    }

    await runQuery(`
      UPDATE profit_entries 
      SET amount = COALESCE(?, amount),
          date = COALESCE(?, date),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `, [amount, date, notes, id]);

    const updatedProfit = await getQuery(`
      SELECT p.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM profit_entries p
      JOIN branches b ON p.branch_id = b.id
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [id]);
    
    res.json(transformProfitToFrontend(updatedProfit));
  } catch (error) {
    console.error('Error updating profit entry:', error);
    res.status(500).json({ error: 'Failed to update profit entry' });
  }
});

// Delete profit entry
router.delete('/profits/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingProfit = await getQuery('SELECT * FROM profit_entries WHERE id = ?', [id]);
    if (!existingProfit) {
      return res.status(404).json({ error: 'Profit entry not found' });
    }

    await runQuery('DELETE FROM profit_entries WHERE id = ?', [id]);
    
    res.json({ message: 'Profit entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting profit entry:', error);
    res.status(500).json({ error: 'Failed to delete profit entry' });
  }
});

// EXPENSE ENTRIES ROUTES

// Get all expense entries
router.get('/expenses', async (req, res) => {
  try {
    const { branchId, paymentStatus, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT e.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM expense_entries e
      JOIN branches b ON e.branch_id = b.id
      JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branchId) {
      query += ' AND e.branch_id = ?';
      params.push(branchId);
    }

    if (paymentStatus) {
      query += ' AND e.payment_status = ?';
      params.push(paymentStatus);
    }

    if (startDate) {
      query += ' AND e.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND e.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const expenses = await allQuery(query, params);
    
    res.json({
      expenses: expenses.map(transformExpenseToFrontend),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching expense entries:', error);
    res.status(500).json({ error: 'Failed to fetch expense entries' });
  }
});

// Create expense entry
router.post('/expenses', async (req, res) => {
  try {
    const { branchId, name, amount, date, notes, paymentStatus = 'unpaid', createdBy } = req.body;

    if (!branchId || !name || !amount || !date || !createdBy) {
      return res.status(400).json({ 
        error: 'Branch ID, name, amount, date, and created by are required' 
      });
    }

    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Payment status must be paid or unpaid' });
    }

    // Check if branch exists and is market type
    const branch = await getQuery('SELECT * FROM branches WHERE id = ? AND module_type = ?', [branchId, 'market']);
    if (!branch) {
      return res.status(400).json({ error: 'Invalid market branch ID' });
    }

    const expenseId = uuidv4();
    
    await runQuery(`
      INSERT INTO expense_entries (id, branch_id, name, amount, date, notes, payment_status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [expenseId, branchId, name, amount, date, notes, paymentStatus, createdBy]);

    const newExpense = await getQuery(`
      SELECT e.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM expense_entries e
      JOIN branches b ON e.branch_id = b.id
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [expenseId]);
    
    res.status(201).json(transformExpenseToFrontend(newExpense));
  } catch (error) {
    console.error('Error creating expense entry:', error);
    res.status(500).json({ error: 'Failed to create expense entry' });
  }
});

// Update expense entry
router.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, notes, paymentStatus } = req.body;

    const existingExpense = await getQuery('SELECT * FROM expense_entries WHERE id = ?', [id]);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense entry not found' });
    }

    if (paymentStatus && !['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Payment status must be paid or unpaid' });
    }

    await runQuery(`
      UPDATE expense_entries 
      SET amount = COALESCE(?, amount),
          date = COALESCE(?, date),
          notes = COALESCE(?, notes),
          payment_status = COALESCE(?, payment_status)
      WHERE id = ?
    `, [amount, date, notes, paymentStatus, id]);

    const updatedExpense = await getQuery(`
      SELECT e.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM expense_entries e
      JOIN branches b ON e.branch_id = b.id
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);
    
    res.json(transformExpenseToFrontend(updatedExpense));
  } catch (error) {
    console.error('Error updating expense entry:', error);
    res.status(500).json({ error: 'Failed to update expense entry' });
  }
});

// Delete expense entry
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingExpense = await getQuery('SELECT * FROM expense_entries WHERE id = ?', [id]);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense entry not found' });
    }

    await runQuery('DELETE FROM expense_entries WHERE id = ?', [id]);
    
    res.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense entry:', error);
    res.status(500).json({ error: 'Failed to delete expense entry' });
  }
});

// Update expense payment status
router.patch('/expenses/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paidDate } = req.body;

    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Payment status must be paid or unpaid' });
    }

    const existingExpense = await getQuery('SELECT * FROM expense_entries WHERE id = ?', [id]);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const paidAt = paymentStatus === 'paid' ? new Date().toISOString() : null;
    const finalPaidDate = paymentStatus === 'paid' ? (paidDate || new Date().toISOString().split('T')[0]) : null;

    await runQuery(`
      UPDATE expense_entries 
      SET payment_status = ?, paid_at = ?, paid_date = ?
      WHERE id = ?
    `, [paymentStatus, paidAt, finalPaidDate, id]);

    const updatedExpense = await getQuery(`
      SELECT e.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM expense_entries e
      JOIN branches b ON e.branch_id = b.id
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);
    
    res.json(transformExpenseToFrontend(updatedExpense));
  } catch (error) {
    console.error('Error updating expense payment status:', error);
    res.status(500).json({ error: 'Failed to update expense payment status' });
  }
});

// Get market summary statistics
router.get('/summary', async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (branchId) {
      whereClause += ' AND branch_id = ?';
      params.push(branchId);
    }

    if (startDate) {
      whereClause += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND date <= ?';
      params.push(endDate);
    }

    // Get totals
    const salesTotal = await getQuery(`
      SELECT COALESCE(SUM(amount), 0) as total FROM sales_entries ${whereClause}
    `, params);

    const profitsTotal = await getQuery(`
      SELECT COALESCE(SUM(amount), 0) as total FROM profit_entries ${whereClause}
    `, params);

    const expensesTotal = await getQuery(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expense_entries ${whereClause}
    `, params);

    const unpaidExpenses = await getQuery(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expense_entries 
      ${whereClause} AND payment_status = 'unpaid'
    `, [...params]);

    res.json({
      totalSales: salesTotal.total,
      totalProfits: profitsTotal.total,
      totalExpenses: expensesTotal.total,
      unpaidExpenses: unpaidExpenses.total,
      netProfit: salesTotal.total + profitsTotal.total - expensesTotal.total
    });
  } catch (error) {
    console.error('Error fetching market summary:', error);
    res.status(500).json({ error: 'Failed to fetch market summary' });
  }
});

export default router; 