import express from 'express';
import { runQuery, getQuery, allQuery } from '../database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = 'monthly', date } = req.query;
    
    // Calculate date ranges for current and previous periods
    const currentDate = date ? new Date(date) : new Date();
    const { startDate: currentStart, endDate: currentEnd } = getDateRange(currentDate, period);
    const { startDate: prevStart, endDate: prevEnd } = getPreviousDateRange(currentDate, period);

    // Current period stats
    const currentStats = await calculatePeriodStats(currentStart, currentEnd);
    
    // Previous period stats for percentage calculations
    const previousStats = await calculatePeriodStats(prevStart, prevEnd);
    
    // Calculate percentage changes
    const getPercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const stats = {
      accounting: {
        total_invoices: currentStats.totalInvoices,
        paid_invoices: currentStats.paidInvoices,
        unpaid_invoices: currentStats.unpaidInvoices,
        total_amount: currentStats.totalAmount,
        changes: {
          total_invoices: getPercentageChange(currentStats.totalInvoices, previousStats.totalInvoices),
          paid_invoices: getPercentageChange(currentStats.paidInvoices, previousStats.paidInvoices),
          unpaid_invoices: getPercentageChange(currentStats.unpaidInvoices, previousStats.unpaidInvoices),
          total_amount: getPercentageChange(currentStats.totalAmount, previousStats.totalAmount)
        }
      },
      market: {
        total_sales: currentStats.totalSales,
        total_profits: currentStats.totalProfits,
        total_expenses: currentStats.totalExpenses,
        unpaid_expenses: currentStats.unpaidExpenses,
        changes: {
          total_sales: getPercentageChange(currentStats.totalSales, previousStats.totalSales),
          total_profits: getPercentageChange(currentStats.totalProfits, previousStats.totalProfits),
          total_expenses: getPercentageChange(currentStats.totalExpenses, previousStats.totalExpenses),
          unpaid_expenses: getPercentageChange(currentStats.unpaidExpenses, previousStats.unpaidExpenses)
        }
      },
      hr: {
        total_employees: currentStats.totalEmployees,
        total_payroll: currentStats.totalPayroll,
        changes: {
          total_employees: getPercentageChange(currentStats.totalEmployees, previousStats.totalEmployees),
          total_payroll: getPercentageChange(currentStats.totalPayroll, previousStats.totalPayroll)
        }
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get summary by date range
router.get('/summary', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let dateFormat = '%Y-%m';
    if (period === 'daily') dateFormat = '%Y-%m-%d';
    if (period === 'yearly') dateFormat = '%Y';

    const summary = await allQuery(`
      SELECT 
        strftime('${dateFormat}', created_at) as period,
        'invoices' as type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM invoices 
      GROUP BY strftime('${dateFormat}', created_at)
      
      UNION ALL
      
      SELECT 
        strftime('${dateFormat}', created_at) as period,
        'sales' as type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM sales_entries 
      GROUP BY strftime('${dateFormat}', created_at)
      
      ORDER BY period DESC
      LIMIT 12
    `);

    res.json({ summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Reset all business data (keep system data like users, roles, permissions)
router.post('/reset-data', async (req, res) => {
  try {
    console.log('🔄 Starting data reset...');
    
    // Clear all business data tables
    const resetQueries = [
      'DELETE FROM notifications',
      'DELETE FROM adjustments',
      'DELETE FROM employees',
      'DELETE FROM expense_entries',
      'DELETE FROM profit_entries', 
      'DELETE FROM sales_entries',
      'DELETE FROM dollar_rates',
      'DELETE FROM invoices',
      'DELETE FROM branches',
      'DELETE FROM user_sessions WHERE user_id != (SELECT id FROM users WHERE username = "admin")'
    ];

    for (const query of resetQueries) {
      await runQuery(query);
    }

    console.log('✅ All business data cleared');
    
    res.json({ 
      message: 'All business data has been reset successfully. System is ready for new data.',
      clearedTables: [
        'branches', 'invoices', 'dollar_rates', 'sales_entries', 
        'profit_entries', 'expense_entries', 'employees', 
        'adjustments', 'notifications'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error resetting data:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Generate comprehensive reports
router.post('/generate-report', async (req, res) => {
  try {
    console.log('📊 Generate report request received');
    console.log('Request body:', req.body);
    
    const { 
      module = 'accounting', 
      branchId = 'all', 
      reportType = 'summary',
      startDate,
      endDate 
    } = req.body || {};

    // Validate required parameters
    if (!module || !['accounting', 'market'].includes(module)) {
      return res.status(400).json({ 
        error: 'Invalid module. Must be "accounting" or "market"' 
      });
    }

    console.log(`🔄 Generating ${module} report for branch: ${branchId}...`);

    // Set default date range if not provided
    const defaultStartDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const defaultEndDate = endDate || new Date().toISOString();

    console.log(`📅 Date range: ${defaultStartDate} to ${defaultEndDate}`);

    // Get report data based on module
    let reportData;
    if (module === 'accounting') {
      reportData = await generateAccountingReport(branchId, defaultStartDate, defaultEndDate);
    } else if (module === 'market') {
      reportData = await generateMarketReport(branchId, defaultStartDate, defaultEndDate);
    }

    // Add metadata
    const report = {
      id: `report-${Date.now()}`,
      module,
      branchId,
      reportType,
      dateRange: { startDate: defaultStartDate, endDate: defaultEndDate },
      data: reportData,
      generatedAt: new Date().toISOString(),
      generatedBy: 'admin' // You can get this from auth context
    };

    console.log('✅ Report generated successfully');
    res.json(report);

  } catch (error) {
    console.error('❌ Error generating report:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to generate accounting reports
async function generateAccountingReport(branchId, startDate, endDate) {
  try {
    // Build WHERE clause for branch filtering
    let branchClause = '';
    let branchParams = [startDate, endDate];
    
    if (branchId !== 'all') {
      branchClause = ' AND i.branch_id = ?';
      branchParams.push(branchId);
    }

    // Get basic invoice statistics
    const invoiceStats = await getQuery(`
      SELECT 
        COUNT(*) as total_entries,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN amount ELSE 0 END), 0) as unpaid_amount
      FROM invoices i
      WHERE i.created_at >= ? AND i.created_at <= ?${branchClause}
    `, branchParams);

    // Get monthly trend (last 6 months)
    const monthlyTrend = await allQuery(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COALESCE(SUM(amount), 0) as amount
      FROM invoices i
      WHERE i.created_at >= datetime('now', '-6 months')${branchId !== 'all' ? ' AND i.branch_id = ?' : ''}
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 6
    `, branchId !== 'all' ? [branchId] : []);

    // Get recent invoices
    const recentEntries = await allQuery(`
      SELECT 
        i.id,
        i.name,
        i.amount,
        i.payment_status as status,
        date(i.created_at) as date,
        b.name as branch
      FROM invoices i
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE i.created_at >= ? AND i.created_at <= ?${branchClause}
      ORDER BY i.created_at DESC
      LIMIT 10
    `, branchParams);

    // Get branch comparison (if all branches selected)
    let branchComparison = [];
    if (branchId === 'all') {
      branchComparison = await allQuery(`
        SELECT 
          (b.name || ' - ' || b.location) as branch_name,
          COUNT(i.id) as entries,
          COALESCE(SUM(i.amount), 0) as amount
        FROM branches b
        LEFT JOIN invoices i ON b.id = i.branch_id 
          AND i.created_at >= ? AND i.created_at <= ?
        WHERE b.module_type = 'accounting'
        GROUP BY b.id, b.name, b.location
        ORDER BY amount DESC
      `, [startDate, endDate]);
    }

    // Since we don't have category data in current schema, return empty categories
    const topCategories = [];

    return {
      totalAmount: invoiceStats?.total_amount || 0,
      totalEntries: invoiceStats?.total_entries || 0,
      paidAmount: invoiceStats?.paid_amount || 0,
      unpaidAmount: invoiceStats?.unpaid_amount || 0,
      monthlyTrend: monthlyTrend.map(m => m.amount).reverse(), // Reverse to show oldest to newest
      topCategories,
      recentEntries,
      branchComparison
    };

  } catch (error) {
    console.error('Error generating accounting report:', error);
    throw error;
  }
}

// Helper function to generate market reports
async function generateMarketReport(branchId, startDate, endDate) {
  try {
    // Build WHERE clause for branch filtering
    let branchClause = '';
    let branchParams = [startDate, endDate];
    
    if (branchId !== 'all') {
      branchClause = ' AND s.branch_id = ?';
      branchParams.push(branchId);
    }

    // Get sales statistics
    const salesStats = await getQuery(`
      SELECT 
        COUNT(*) as total_entries,
        COALESCE(SUM(amount), 0) as total_sales
      FROM sales_entries s
      WHERE s.created_at >= ? AND s.created_at <= ?${branchClause}
    `, branchParams);

    // Get profit statistics  
    const profitStats = await getQuery(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_profits
      FROM profit_entries p
      WHERE p.created_at >= ? AND p.created_at <= ?${branchClause.replace('s.', 'p.')}
    `, branchParams);

    // Get expense statistics
    const expenseStats = await getQuery(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN amount ELSE 0 END), 0) as unpaid_expenses
      FROM expense_entries e
      WHERE e.created_at >= ? AND e.created_at <= ?${branchClause.replace('s.', 'e.')}
    `, branchParams);

    // Calculate totals
    const totalSales = salesStats?.total_sales || 0;
    const totalProfits = profitStats?.total_profits || 0;
    const totalExpenses = expenseStats?.total_expenses || 0;
    const unpaidExpenses = expenseStats?.unpaid_expenses || 0;
    const totalAmount = totalSales + totalProfits;
    const paidAmount = totalAmount - unpaidExpenses;

    // Get monthly trend for sales
    const monthlyTrend = await allQuery(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COALESCE(SUM(amount), 0) as amount
      FROM sales_entries s
      WHERE s.created_at >= datetime('now', '-6 months')${branchId !== 'all' ? ' AND s.branch_id = ?' : ''}
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 6
    `, branchId !== 'all' ? [branchId] : []);

    // Get recent sales entries
    const recentEntries = await allQuery(`
      SELECT 
        s.id,
        ('Sales Entry #' || s.id) as name,
        s.amount,
        'paid' as status,
        date(s.created_at) as date,
        b.name as branch
      FROM sales_entries s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.created_at >= ? AND s.created_at <= ?${branchClause}
      ORDER BY s.created_at DESC
      LIMIT 10
    `, branchParams);

    // Get branch comparison (if all branches selected)
    let branchComparison = [];
    if (branchId === 'all') {
      branchComparison = await allQuery(`
        SELECT 
          (b.name || ' - ' || b.location) as branch_name,
          COUNT(s.id) as entries,
          COALESCE(SUM(s.amount), 0) as amount
        FROM branches b
        LEFT JOIN sales_entries s ON b.id = s.branch_id 
          AND s.created_at >= ? AND s.created_at <= ?
        WHERE b.module_type = 'market'
        GROUP BY b.id, b.name, b.location
        ORDER BY amount DESC
      `, [startDate, endDate]);
    }

    // Since we don't have category data in current schema, return empty categories
    const topCategories = [];

    return {
      totalAmount,
      totalEntries: salesStats?.total_entries || 0,
      paidAmount,
      unpaidAmount: unpaidExpenses,
      monthlyTrend: monthlyTrend.map(m => m.amount).reverse(),
      topCategories,
      recentEntries,
      branchComparison
    };

  } catch (error) {
    console.error('Error generating market report:', error);
    throw error;
  }
}

export default router; 

// Helper function to get date range based on period
function getDateRange(date, period) {
  const currentDate = new Date(date);
  let startDate, endDate;

  switch (period) {
    case 'daily':
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      break;
    case 'weekly':
      const dayOfWeek = currentDate.getDay();
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - dayOfWeek);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - dayOfWeek + 7);
      break;
    case 'monthly':
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      break;
    case 'yearly':
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear() + 1, 0, 1);
      break;
    default:
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  return { startDate, endDate };
}

// Helper function to get previous period date range
function getPreviousDateRange(date, period) {
  const currentDate = new Date(date);
  let prevDate;

  switch (period) {
    case 'daily':
      prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
      break;
    case 'weekly':
      prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
      break;
    case 'monthly':
      prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      break;
    case 'yearly':
      prevDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      break;
    default:
      prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  return getDateRange(prevDate, period);
}

// Helper function to calculate stats for a specific period
async function calculatePeriodStats(startDate, endDate) {
  try {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Invoices stats
    const invoices = await allQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) as unpaid,
        COALESCE(SUM(amount), 0) as total_amount
      FROM invoices 
      WHERE created_at >= ? AND created_at < ?
    `, [startISO, endISO]);

    // Market stats
    const sales = await getQuery(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM sales_entries 
      WHERE created_at >= ? AND created_at < ?
    `, [startISO, endISO]);

    const profits = await getQuery(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM profit_entries 
      WHERE created_at >= ? AND created_at < ?
    `, [startISO, endISO]);

    const expenses = await getQuery(`
      SELECT 
        COALESCE(SUM(amount), 0) as total,
        COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN amount ELSE 0 END), 0) as unpaid
      FROM expense_entries 
      WHERE created_at >= ? AND created_at < ?
    `, [startISO, endISO]);

    // Employee stats
    const employees = await getQuery(`
      SELECT COUNT(*) as total 
      FROM employees 
      WHERE created_at >= ? AND created_at < ?
    `, [startISO, endISO]);

    // Payroll calculation (could be more complex based on your needs)
    const payroll = await getQuery(`
      SELECT COALESCE(SUM(e.salary + COALESCE(adj.amount, 0)), 0) as total
      FROM employees e
      LEFT JOIN adjustments adj ON e.id = adj.employee_id
      WHERE e.created_at >= ? AND e.created_at < ?
    `, [startISO, endISO]);

    return {
      totalInvoices: invoices[0]?.total || 0,
      paidInvoices: invoices[0]?.paid || 0,
      unpaidInvoices: invoices[0]?.unpaid || 0,
      totalAmount: invoices[0]?.total_amount || 0,
      totalSales: sales?.total || 0,
      totalProfits: profits?.total || 0,
      totalExpenses: expenses?.total || 0,
      unpaidExpenses: expenses?.unpaid || 0,
      totalEmployees: employees?.total || 0,
      totalPayroll: payroll?.total || 0
    };
  } catch (error) {
    console.error('Error calculating period stats:', error);
    return {
      totalInvoices: 0,
      paidInvoices: 0,
      unpaidInvoices: 0,
      totalAmount: 0,
      totalSales: 0,
      totalProfits: 0,
      totalExpenses: 0,
      unpaidExpenses: 0,
      totalEmployees: 0,
      totalPayroll: 0
    };
  }
} 
