import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user with role and permissions
    const user = await getQuery(`
      SELECT u.*, r.name as role_name, r.display_name as role_display_name, 
             r.description as role_description, r.color as role_color
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.username = ? AND u.is_active = 1
    `, [username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user permissions
    const permissions = await allQuery(`
      SELECT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `, [user.role_id]);

    // Update last login
    await runQuery('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Create session
    const sessionId = uuidv4();
    await runQuery(`
      INSERT INTO user_sessions (id, user_id, ip_address, user_agent) 
      VALUES (?, ?, ?, ?)
    `, [sessionId, user.id, req.ip, req.get('User-Agent')]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        sessionId: sessionId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user data (exclude password)
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      position: user.position,
      isActive: user.is_active,
      lastLogin: user.last_login,
      profileImage: user.profile_image,
      role: {
        id: user.role_id,
        name: user.role_name,
        displayName: user.role_display_name,
        description: user.role_description,
        color: user.role_color
      },
      permissions: permissions,
      createdAt: user.created_at
    };

    res.json({
      user: userData,
      token: token,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      await runQuery('UPDATE user_sessions SET is_active = 0 WHERE id = ?', [sessionId]);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is still active
    const session = await getQuery(
      'SELECT * FROM user_sessions WHERE id = ? AND is_active = 1',
      [decoded.sessionId]
    );

    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Update last activity
    await runQuery(
      'UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ?',
      [decoded.sessionId]
    );

    // Get fresh user data
    const user = await getQuery(`
      SELECT u.*, r.name as role_name, r.display_name as role_display_name, 
             r.description as role_description, r.color as role_color
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.is_active = 1
    `, [decoded.userId]);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get user permissions
    const permissions = await allQuery(`
      SELECT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `, [user.role_id]);

    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      position: user.position,
      isActive: user.is_active,
      lastLogin: user.last_login,
      profileImage: user.profile_image,
      role: {
        id: user.role_id,
        name: user.role_name,
        displayName: user.role_display_name,
        description: user.role_description,
        color: user.role_color
      },
      permissions: permissions,
      createdAt: user.created_at
    };

    res.json({ user: userData });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router; 
