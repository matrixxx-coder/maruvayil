import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth.js';
import { query } from '../db.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  // First validate the JWT token
  requireAuth(req, res, async () => {
    try {
      const result = await query('SELECT is_admin FROM profiles WHERE id = $1', [req.userId]);
      if (result.rows.length === 0) {
        res.status(403).json({ error: 'Forbidden: profile not found' });
        return;
      }
      const row = result.rows[0] as { is_admin: boolean };
      if (!row.is_admin) {
        res.status(403).json({ error: 'Forbidden: admin access required' });
        return;
      }
      next();
    } catch (err) {
      console.error('requireAdmin error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
