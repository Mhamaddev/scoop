import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../database.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await allQuery(`
      SELECT u.id, u.username, u.name, u.email, u.phone, u.department, 
             u.position, u.is_active, u.last_login, u.created_at,
             r.name as role_name, r.display_name as role_display_name, r.color as role_color
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, password, roleId, name, email, phone, department, position, createdBy } = req.body;

    if (!username || !password || !roleId || !name) {
      return res.status(400).json({ error: 'Username, password, role ID, and name are required' });
    }

    const existingUser = await getQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    await runQuery(`
      INSERT INTO users (id, username, password_hash, role_id, name, email, phone, department, position, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, username, hashedPassword, roleId, name, email, phone, department, position, createdBy]);

    const newUser = await getQuery(`
      SELECT u.id, u.username, u.name, u.email, u.phone, u.department, u.position, u.is_active, u.created_at,
             r.name as role_name, r.display_name as role_display_name
      FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?
    `, [userId]);
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, position, isActive } = req.body;

    await runQuery(`
      UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), 
                      phone = COALESCE(?, phone), department = COALESCE(?, department),
                      position = COALESCE(?, position), is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name, email, phone, department, position, isActive, id]);

    const updatedUser = await getQuery(`
      SELECT u.id, u.username, u.name, u.email, u.phone, u.department, u.position, u.is_active,
             r.name as role_name, r.display_name as role_display_name
      FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?
    `, [id]);
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 
