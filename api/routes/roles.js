import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from '../database.js';

const router = express.Router();

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await allQuery('SELECT * FROM roles ORDER BY created_at DESC');
    
    // Get permissions for each role
    for (let role of roles) {
      const permissions = await allQuery(`
        SELECT p.* FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `, [role.id]);
      role.permissions = permissions;
    }
    
    res.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get all permissions
router.get('/permissions', async (req, res) => {
  try {
    const permissions = await allQuery('SELECT * FROM permissions ORDER BY module, action');
    res.json({ permissions });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Create role
router.post('/', async (req, res) => {
  try {
    const { name, displayName, description, permissionIds, color } = req.body;

    if (!name || !displayName || !permissionIds) {
      return res.status(400).json({ error: 'Name, display name, and permissions are required' });
    }

    const roleId = uuidv4();
    
    await runQuery(`
      INSERT INTO roles (id, name, display_name, description, color, is_system_role)
      VALUES (?, ?, ?, ?, ?, 0)
    `, [roleId, name, displayName, description, color || '#6b7280']);

    // Add permissions
    for (const permissionId of permissionIds) {
      await runQuery(`
        INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)
      `, [roleId, permissionId]);
    }
    
    res.status(201).json({ id: roleId, message: 'Role created successfully' });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, permissionIds, color, isActive } = req.body;

    await runQuery(`
      UPDATE roles SET display_name = COALESCE(?, display_name),
                      description = COALESCE(?, description),
                      color = COALESCE(?, color),
                      is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [displayName, description, color, isActive, id]);

    if (permissionIds) {
      await runQuery('DELETE FROM role_permissions WHERE role_id = ?', [id]);
      for (const permissionId of permissionIds) {
        await runQuery('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [id, permissionId]);
      }
    }
    
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await getQuery('SELECT * FROM roles WHERE id = ?', [id]);
    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if role is a system role
    if (existingRole.is_system_role) {
      return res.status(400).json({ error: 'Cannot delete system roles' });
    }

    // Check if any users are assigned to this role
    const usersWithRole = await getQuery('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [id]);
    if (usersWithRole.count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete role. ${usersWithRole.count} users are assigned to this role.`,
        usersCount: usersWithRole.count
      });
    }

    // Delete role permissions first (due to foreign key constraint)
    await runQuery('DELETE FROM role_permissions WHERE role_id = ?', [id]);
    
    // Delete the role
    await runQuery('DELETE FROM roles WHERE id = ?', [id]);
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router; 
