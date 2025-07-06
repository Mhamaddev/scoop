import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../database.js';

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const { isRead, priority, type, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (isRead !== undefined) {
      query += ' AND is_read = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const notifications = await allQuery(query, params);
    const unreadCount = await getQuery('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    
    res.json({
      notifications,
      unreadCount: unreadCount.count
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const { type, title, message, priority = 'medium' } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Type, title, and message are required' });
    }

    const notificationId = uuidv4();
    
    await runQuery(`
      INSERT INTO notifications (id, type, title, message, priority)
      VALUES (?, ?, ?, ?, ?)
    `, [notificationId, type, title, message, priority]);
    
    res.status(201).json({ id: notificationId, message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    await runQuery('UPDATE notifications SET is_read = 1');
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router; 
