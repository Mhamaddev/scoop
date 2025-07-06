import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../database/init.js';

const router = express.Router();

// EMPLOYEES ROUTES

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const { isActive, location, branchId, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT e.*, u.name as created_by_name, b.name as branch_name, b.location as branch_location
      FROM employees e
      JOIN users u ON e.created_by = u.id
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (isActive !== undefined) {
      query += ' AND e.is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }

    if (location) {
      query += ' AND e.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (branchId) {
      query += ' AND e.branch_id = ?';
      params.push(branchId);
    }

    if (search) {
      query += ' AND e.name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const employees = await allQuery(query, params);
    
    res.json({
      employees: employees,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await getQuery(`
      SELECT e.*, u.name as created_by_name
      FROM employees e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get employee adjustments
    const adjustments = await allQuery(`
      SELECT a.*, u.name as created_by_name
      FROM adjustments a
      JOIN users u ON a.created_by = u.id
      WHERE a.employee_id = ?
      ORDER BY a.date DESC
    `, [id]);

    res.json({
      ...employee,
      adjustments: adjustments
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/employees', async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      salary,
      salaryDays,
      startDate,
      branchId,
      createdBy
    } = req.body;

    if (!name || !salary || !salaryDays || !startDate || !createdBy) {
      return res.status(400).json({ 
        error: 'Name, salary, salary days, start date, and created by are required' 
      });
    }

    // Check if user exists
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [createdBy]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if branch exists (if provided)
    if (branchId) {
      const branch = await getQuery('SELECT * FROM branches WHERE id = ?', [branchId]);
      if (!branch) {
        return res.status(400).json({ error: 'Invalid branch ID' });
      }
    }

    const employeeId = uuidv4();
    
    await runQuery(`
      INSERT INTO employees (
        id, name, phone, location, salary, salary_days, 
        start_date, branch_id, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employeeId, name, phone, location, salary, salaryDays, 
      startDate, branchId, 1, createdBy
    ]);

    const newEmployee = await getQuery(`
      SELECT e.*, u.name as created_by_name, b.name as branch_name, b.location as branch_location
      FROM employees e
      JOIN users u ON e.created_by = u.id
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `, [employeeId]);
    
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      location,
      salary,
      salaryDays,
      startDate,
      branchId,
      isActive
    } = req.body;

    const existingEmployee = await getQuery('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if branch exists (if provided)
    if (branchId) {
      const branch = await getQuery('SELECT * FROM branches WHERE id = ?', [branchId]);
      if (!branch) {
        return res.status(400).json({ error: 'Invalid branch ID' });
      }
    }

    await runQuery(`
      UPDATE employees SET 
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        salary = COALESCE(?, salary),
        salary_days = COALESCE(?, salary_days),
        start_date = COALESCE(?, start_date),
        branch_id = COALESCE(?, branch_id),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name, phone, location, salary, salaryDays, startDate, branchId, isActive, id]);

    const updatedEmployee = await getQuery(`
      SELECT e.*, u.name as created_by_name, b.name as branch_name, b.location as branch_location
      FROM employees e
      JOIN users u ON e.created_by = u.id
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `, [id]);
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingEmployee = await getQuery('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete related adjustments first
    await runQuery('DELETE FROM adjustments WHERE employee_id = ?', [id]);
    
    // Delete employee
    await runQuery('DELETE FROM employees WHERE id = ?', [id]);
    
    res.json({ message: 'Employee and related adjustments deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Pay employee salary
router.post('/employees/:id/pay-salary', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, notes = '', createdBy = 'current-user' } = req.body;

    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' });
    }

    const employee = await getQuery('SELECT * FROM employees WHERE id = ?', [id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Create salary payment record
    const paymentId = uuidv4();
    await runQuery(`
      INSERT INTO salary_payments (id, employee_id, amount, payment_date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [paymentId, id, amount, date, notes, createdBy]);

    // Update employee last payment info
    await runQuery(`
      UPDATE employees SET 
        last_paid_date = ?,
        is_paid = 1,
        paid_amount = ?
      WHERE id = ?
    `, [date, amount, id]);

    const updatedEmployee = await getQuery(`
      SELECT e.*, u.name as created_by_name
      FROM employees e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);
    
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error paying employee salary:', error);
    res.status(500).json({ error: 'Failed to pay employee salary' });
  }
});

// Get employee salary payment history
router.get('/employees/:id/salary-payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const employee = await getQuery('SELECT * FROM employees WHERE id = ?', [id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const payments = await allQuery(`
      SELECT sp.*, u.name as created_by_name
      FROM salary_payments sp
      JOIN users u ON sp.created_by = u.id
      WHERE sp.employee_id = ?
      ORDER BY sp.payment_date DESC, sp.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), parseInt(offset)]);

    res.json({
      payments,
      employee_name: employee.name,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching salary payments:', error);
    res.status(500).json({ error: 'Failed to fetch salary payments' });
  }
});

// ADJUSTMENTS ROUTES

// Get all adjustments
router.get('/adjustments', async (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT a.*, e.name as employee_name, u.name as created_by_name
      FROM adjustments a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (employeeId) {
      query += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    if (type) {
      query += ' AND a.type = ?';
      params.push(type);
    }

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const adjustments = await allQuery(query, params);
    
    res.json({
      adjustments: adjustments,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    res.status(500).json({ error: 'Failed to fetch adjustments' });
  }
});

// Create adjustment
router.post('/adjustments', async (req, res) => {
  try {
    const {
      employeeId,
      type,
      amount,
      date,
      description,
      createdBy
    } = req.body;

    if (!employeeId || !type || !amount || !date || !description || !createdBy) {
      return res.status(400).json({ 
        error: 'Employee ID, type, amount, date, description, and created by are required' 
      });
    }

    if (!['penalty', 'bonus'].includes(type)) {
      return res.status(400).json({ error: 'Type must be penalty or bonus' });
    }

    // Check if employee exists
    const employee = await getQuery('SELECT * FROM employees WHERE id = ?', [employeeId]);
    if (!employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // Check if user exists
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [createdBy]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const adjustmentId = uuidv4();
    
    await runQuery(`
      INSERT INTO adjustments (id, employee_id, type, amount, date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [adjustmentId, employeeId, type, amount, date, description, createdBy]);

    const newAdjustment = await getQuery(`
      SELECT a.*, e.name as employee_name, u.name as created_by_name
      FROM adjustments a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `, [adjustmentId]);
    
    res.status(201).json(newAdjustment);
  } catch (error) {
    console.error('Error creating adjustment:', error);
    res.status(500).json({ error: 'Failed to create adjustment' });
  }
});

// Update adjustment
router.put('/adjustments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, type, amount, date, description } = req.body;

    // Check if adjustment exists
    const existingAdjustment = await getQuery('SELECT * FROM adjustments WHERE id = ?', [id]);
    if (!existingAdjustment) {
      return res.status(404).json({ error: 'Adjustment not found' });
    }

    // Validate type if provided
    if (type && !['penalty', 'bonus'].includes(type)) {
      return res.status(400).json({ error: 'Type must be penalty or bonus' });
    }

    // Check if employee exists if employeeId is provided
    if (employeeId) {
      const employee = await getQuery('SELECT * FROM employees WHERE id = ?', [employeeId]);
      if (!employee) {
        return res.status(400).json({ error: 'Employee not found' });
      }
    }

    await runQuery(`
      UPDATE adjustments 
      SET employee_id = COALESCE(?, employee_id),
          type = COALESCE(?, type),
          amount = COALESCE(?, amount),
          date = COALESCE(?, date),
          description = COALESCE(?, description)
      WHERE id = ?
    `, [employeeId, type, amount, date, description, id]);

    const updatedAdjustment = await getQuery(`
      SELECT a.*, e.name as employee_name, u.name as created_by_name
      FROM adjustments a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `, [id]);
    
    res.json(updatedAdjustment);
  } catch (error) {
    console.error('Error updating adjustment:', error);
    res.status(500).json({ error: 'Failed to update adjustment' });
  }
});

// Delete adjustment
router.delete('/adjustments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingAdjustment = await getQuery('SELECT * FROM adjustments WHERE id = ?', [id]);
    if (!existingAdjustment) {
      return res.status(404).json({ error: 'Adjustment not found' });
    }

    await runQuery('DELETE FROM adjustments WHERE id = ?', [id]);
    
    res.json({ message: 'Adjustment deleted successfully' });
  } catch (error) {
    console.error('Error deleting adjustment:', error);
    res.status(500).json({ error: 'Failed to delete adjustment' });
  }
});

// Get payroll summary
router.get('/payroll-summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all active employees
    const employees = await allQuery('SELECT * FROM employees WHERE is_active = 1');
    
    // Get adjustments for the period
    let adjustmentQuery = 'SELECT * FROM adjustments WHERE 1=1';
    const adjustmentParams = [];

    if (startDate) {
      adjustmentQuery += ' AND date >= ?';
      adjustmentParams.push(startDate);
    }

    if (endDate) {
      adjustmentQuery += ' AND date <= ?';
      adjustmentParams.push(endDate);
    }

    const adjustments = await allQuery(adjustmentQuery, adjustmentParams);

    // Calculate totals
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const totalBonuses = adjustments.filter(adj => adj.type === 'bonus').reduce((sum, adj) => sum + adj.amount, 0);
    const totalPenalties = adjustments.filter(adj => adj.type === 'penalty').reduce((sum, adj) => sum + adj.amount, 0);
    const paidEmployees = employees.filter(emp => emp.is_paid).length;
    const unpaidEmployees = totalEmployees - paidEmployees;

    res.json({
      totalEmployees,
      paidEmployees,
      unpaidEmployees,
      totalSalary,
      totalBonuses,
      totalPenalties,
      netPayroll: totalSalary + totalBonuses - totalPenalties,
      employees: employees.map(emp => {
        const empAdjustments = adjustments.filter(adj => adj.employee_id === emp.id);
        const bonuses = empAdjustments.filter(adj => adj.type === 'bonus').reduce((sum, adj) => sum + adj.amount, 0);
        const penalties = empAdjustments.filter(adj => adj.type === 'penalty').reduce((sum, adj) => sum + adj.amount, 0);
        
        return {
          ...emp,
          bonuses,
          penalties,
          netSalary: emp.salary + bonuses - penalties,
          adjustmentCount: empAdjustments.length
        };
      })
    });
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ error: 'Failed to fetch payroll summary' });
  }
});

// Get payroll summary by branch
router.get('/payroll-summary/by-branch', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all active employees with branch information
    const employees = await allQuery(`
      SELECT e.*, b.name as branch_name, b.location as branch_location
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.is_active = 1
    `);
    
    // Get adjustments for the period
    let adjustmentQuery = 'SELECT * FROM adjustments WHERE 1=1';
    const adjustmentParams = [];

    if (startDate) {
      adjustmentQuery += ' AND date >= ?';
      adjustmentParams.push(startDate);
    }

    if (endDate) {
      adjustmentQuery += ' AND date <= ?';
      adjustmentParams.push(endDate);
    }

    const adjustments = await allQuery(adjustmentQuery, adjustmentParams);

    // Group employees by branch
    const branchSummary = {};
    const unassignedEmployees = [];

    employees.forEach(emp => {
      const empAdjustments = adjustments.filter(adj => adj.employee_id === emp.id);
      const bonuses = empAdjustments.filter(adj => adj.type === 'bonus').reduce((sum, adj) => sum + adj.amount, 0);
      const penalties = empAdjustments.filter(adj => adj.type === 'penalty').reduce((sum, adj) => sum + adj.amount, 0);
      
      const employeeData = {
        ...emp,
        bonuses,
        penalties,
        netSalary: emp.salary + bonuses - penalties,
        adjustmentCount: empAdjustments.length
      };

      if (emp.branch_id) {
        const branchKey = emp.branch_id;
        if (!branchSummary[branchKey]) {
          branchSummary[branchKey] = {
            branchId: emp.branch_id,
            branchName: emp.branch_name,
            branchLocation: emp.branch_location,
            employees: [],
            totalEmployees: 0,
            totalSalary: 0,
            totalBonuses: 0,
            totalPenalties: 0,
            netPayroll: 0,
            paidEmployees: 0,
            unpaidEmployees: 0
          };
        }
        
        branchSummary[branchKey].employees.push(employeeData);
        branchSummary[branchKey].totalEmployees++;
        branchSummary[branchKey].totalSalary += emp.salary;
        branchSummary[branchKey].totalBonuses += bonuses;
        branchSummary[branchKey].totalPenalties += penalties;
        branchSummary[branchKey].netPayroll += employeeData.netSalary;
        if (emp.is_paid) {
          branchSummary[branchKey].paidEmployees++;
        } else {
          branchSummary[branchKey].unpaidEmployees++;
        }
      } else {
        unassignedEmployees.push(employeeData);
      }
    });

    // Calculate overall totals
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const totalBonuses = adjustments.filter(adj => adj.type === 'bonus').reduce((sum, adj) => sum + adj.amount, 0);
    const totalPenalties = adjustments.filter(adj => adj.type === 'penalty').reduce((sum, adj) => sum + adj.amount, 0);
    const paidEmployees = employees.filter(emp => emp.is_paid).length;
    const unpaidEmployees = totalEmployees - paidEmployees;

    res.json({
      overall: {
        totalEmployees,
        paidEmployees,
        unpaidEmployees,
        totalSalary,
        totalBonuses,
        totalPenalties,
        netPayroll: totalSalary + totalBonuses - totalPenalties
      },
      branches: Object.values(branchSummary),
      unassignedEmployees: {
        count: unassignedEmployees.length,
        totalSalary: unassignedEmployees.reduce((sum, emp) => sum + emp.salary, 0),
        employees: unassignedEmployees
      }
    });
  } catch (error) {
    console.error('Error fetching payroll summary by branch:', error);
    res.status(500).json({ error: 'Failed to fetch payroll summary by branch' });
  }
});

export default router; 