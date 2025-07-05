import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../database/init.js';

const router = express.Router();

// Transform database result to frontend format
const transformInvoiceToFrontend = (invoice) => {
  if (!invoice) return null;
  
  return {
    id: invoice.id,
    branchId: invoice.branch_id,
    name: invoice.name,
    amount: invoice.amount,
    currency: invoice.currency,
    invoiceDate: invoice.invoice_date,
    entryDate: invoice.entry_date,
    notes: invoice.notes,
    paymentStatus: invoice.payment_status,
    paidAt: invoice.paid_at,
    paidDate: invoice.paid_date,
    createdBy: invoice.created_by,
    branchName: invoice.branch_name,
    branchLocation: invoice.branch_location,
    createdByName: invoice.created_by_name
  };
};

// Transform frontend data to database format
const transformInvoiceToDatabase = (invoice) => {
  return {
    branch_id: invoice.branchId,
    name: invoice.name,
    amount: invoice.amount,
    currency: invoice.currency,
    invoice_date: invoice.invoiceDate,
    entry_date: invoice.entryDate,
    notes: invoice.notes,
    payment_status: invoice.paymentStatus,
    paid_at: invoice.paidAt,
    paid_date: invoice.paidDate,
    created_by: invoice.createdBy
  };
};

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const { branchId, paymentStatus, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT i.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      JOIN users u ON i.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branchId) {
      query += ' AND i.branch_id = ?';
      params.push(branchId);
    }

    if (paymentStatus) {
      query += ' AND i.payment_status = ?';
      params.push(paymentStatus);
    }

    if (startDate) {
      query += ' AND i.invoice_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND i.invoice_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const invoices = await allQuery(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      WHERE 1=1
    `;
    const countParams = [];

    if (branchId) {
      countQuery += ' AND i.branch_id = ?';
      countParams.push(branchId);
    }

    if (paymentStatus) {
      countQuery += ' AND i.payment_status = ?';
      countParams.push(paymentStatus);
    }

    if (startDate) {
      countQuery += ' AND i.invoice_date >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND i.invoice_date <= ?';
      countParams.push(endDate);
    }

    const totalResult = await getQuery(countQuery, countParams);
    
    res.json({
      invoices: invoices.map(transformInvoiceToFrontend),
      total: totalResult.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await getQuery(`
      SELECT i.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `, [id]);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(transformInvoiceToFrontend(invoice));
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const {
      branchId,
      name,
      amount,
      currency,
      invoiceDate,
      entryDate,
      notes,
      paymentStatus = 'unpaid',
      createdBy
    } = req.body;

    // Validation
    if (!branchId || !name || !amount || !currency || !invoiceDate || !entryDate || !createdBy) {
      return res.status(400).json({ 
        error: 'Branch ID, name, amount, currency, invoice date, entry date, and created by are required' 
      });
    }

    if (!['USD', 'IQD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be USD or IQD' });
    }

    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Payment status must be paid or unpaid' });
    }

    // Check if branch exists and is accounting type
    const branch = await getQuery('SELECT * FROM branches WHERE id = ? AND module_type = ?', [branchId, 'accounting']);
    if (!branch) {
      return res.status(400).json({ error: 'Invalid accounting branch ID' });
    }

    // Check if user exists
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [createdBy]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const invoiceId = uuidv4();
    
    await runQuery(`
      INSERT INTO invoices (
        id, branch_id, name, amount, currency, invoice_date, 
        entry_date, notes, payment_status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceId, branchId, name, amount, currency, invoiceDate, 
      entryDate, notes, paymentStatus, createdBy
    ]);

    const newInvoice = await getQuery(`
      SELECT i.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `, [invoiceId]);
    
    res.status(201).json(transformInvoiceToFrontend(newInvoice));
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      branchId,
      name,
      amount,
      currency,
      invoiceDate,
      entryDate,
      notes,
      paymentStatus
    } = req.body;

    // Check if invoice exists
    const existingInvoice = await getQuery('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Validation
    if (currency && !['USD', 'IQD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be USD or IQD' });
    }

    if (paymentStatus && !['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Payment status must be paid or unpaid' });
    }

    if (branchId) {
      const branch = await getQuery('SELECT * FROM branches WHERE id = ? AND module_type = ?', [branchId, 'accounting']);
      if (!branch) {
        return res.status(400).json({ error: 'Invalid accounting branch ID' });
      }
    }

    await runQuery(`
      UPDATE invoices SET 
        branch_id = COALESCE(?, branch_id),
        name = COALESCE(?, name),
        amount = COALESCE(?, amount),
        currency = COALESCE(?, currency),
        invoice_date = COALESCE(?, invoice_date),
        entry_date = COALESCE(?, entry_date),
        notes = COALESCE(?, notes),
        payment_status = COALESCE(?, payment_status)
      WHERE id = ?
    `, [branchId, name, amount, currency, invoiceDate, entryDate, notes, paymentStatus, id]);

    const updatedInvoice = await getQuery(`
      SELECT i.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `, [id]);
    
    res.json(transformInvoiceToFrontend(updatedInvoice));
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingInvoice = await getQuery('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await runQuery('DELETE FROM invoices WHERE id = ?', [id]);
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Update payment status
router.patch('/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paidDate } = req.body;

    if (!['paid', 'unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Payment status must be paid or unpaid' });
    }

    const existingInvoice = await getQuery('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    let updateQuery = 'UPDATE invoices SET payment_status = ?, paid_at = ?, paid_date = ? WHERE id = ?';
    let updateParams = [paymentStatus, null, null, id];

    if (paymentStatus === 'paid') {
      const paidAtValue = paidDate ? new Date(paidDate).toISOString() : new Date().toISOString();
      const paidDateValue = paidDate ? paidDate : new Date().toISOString().split('T')[0];
      updateParams = [paymentStatus, paidAtValue, paidDateValue, id];
    }

    await runQuery(updateQuery, updateParams);

    const updatedInvoice = await getQuery(`
      SELECT i.*, b.name as branch_name, b.location as branch_location,
             u.name as created_by_name
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `, [id]);
    
    res.json(transformInvoiceToFrontend(updatedInvoice));
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Get dollar rates
router.get('/dollar-rates/all', async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    let query = `
      SELECT dr.*, u.name as entered_by_name
      FROM dollar_rates dr
      JOIN users u ON dr.entered_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND dr.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND dr.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY dr.date DESC LIMIT ?';
    params.push(parseInt(limit));

    const rates = await allQuery(query, params);
    
    res.json(rates);
  } catch (error) {
    console.error('Error fetching dollar rates:', error);
    res.status(500).json({ error: 'Failed to fetch dollar rates' });
  }
});

// Add dollar rate
router.post('/dollar-rates', async (req, res) => {
  try {
    const { date, rate, enteredBy } = req.body;

    if (!date || !rate || !enteredBy) {
      return res.status(400).json({ error: 'Date, rate, and entered by are required' });
    }

    // Check if user exists
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [enteredBy]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if rate already exists for this date
    const existingRate = await getQuery('SELECT * FROM dollar_rates WHERE date = ?', [date]);
    if (existingRate) {
      return res.status(400).json({ error: 'Dollar rate already exists for this date' });
    }

    const rateId = uuidv4();
    
    await runQuery(`
      INSERT INTO dollar_rates (id, date, rate, entered_by)
      VALUES (?, ?, ?, ?)
    `, [rateId, date, rate, enteredBy]);

    const newRate = await getQuery(`
      SELECT dr.*, u.name as entered_by_name
      FROM dollar_rates dr
      JOIN users u ON dr.entered_by = u.id
      WHERE dr.id = ?
    `, [rateId]);
    
    res.status(201).json(newRate);
  } catch (error) {
    console.error('Error adding dollar rate:', error);
    res.status(500).json({ error: 'Failed to add dollar rate' });
  }
});

export default router; 