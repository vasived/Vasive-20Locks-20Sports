import { RequestHandler } from "express";
import { query } from "../db";

export const getUserRole: RequestHandler = async (req, res) => {
  try {
    const { clerkUserId } = req.params;

    const result = await query(
      'SELECT role FROM user_roles WHERE clerk_user_id = $1',
      [clerkUserId]
    );

    if (result.rows.length === 0) {
      return res.json({ role: null });
    }

    res.json({ role: result.rows[0].role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ error: 'Failed to fetch user role' });
  }
};

export const updateUserRole: RequestHandler = async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const { role } = req.body;

    if (!['admin', 'premium'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await query(`
      INSERT INTO user_roles (clerk_user_id, role)
      VALUES ($1, $2)
      ON CONFLICT (clerk_user_id)
      DO UPDATE SET role = $2
      RETURNING role
    `, [clerkUserId, role]);

    res.json({ role: result.rows[0].role, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const getAllUserRoles: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
      SELECT clerk_user_id, role, created_at
      FROM user_roles
      ORDER BY created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
};
