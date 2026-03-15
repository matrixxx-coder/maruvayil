import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes require auth
router.use(requireAuth);

// GET /profile
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, full_name, full_name_ml, phone, address,
              is_active_member, member_since, created_at
       FROM profiles WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const row = result.rows[0] as {
      id: string;
      full_name: string | null;
      full_name_ml: string | null;
      phone: string | null;
      address: string | null;
      is_active_member: boolean;
      member_since: string;
      created_at: string;
    };

    res.json({
      id: row.id,
      full_name: row.full_name,
      full_name_ml: row.full_name_ml,
      phone: row.phone,
      address: row.address,
      is_active_member: row.is_active_member,
      member_since: row.member_since,
      created_at: row.created_at,
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /profile
router.put('/', async (req: Request, res: Response): Promise<void> => {
  const { fullName, fullNameMl, phone, address } = req.body as {
    fullName?: string;
    fullNameMl?: string;
    phone?: string;
    address?: string;
  };

  try {
    const result = await query(
      `UPDATE profiles
       SET full_name    = COALESCE($1, full_name),
           full_name_ml = COALESCE($2, full_name_ml),
           phone        = COALESCE($3, phone),
           address      = COALESCE($4, address)
       WHERE id = $5
       RETURNING id, full_name, full_name_ml, phone, address,
                 is_active_member, member_since, created_at`,
      [fullName ?? null, fullNameMl ?? null, phone ?? null, address ?? null, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const row = result.rows[0] as {
      id: string;
      full_name: string | null;
      full_name_ml: string | null;
      phone: string | null;
      address: string | null;
      is_active_member: boolean;
      member_since: string;
      created_at: string;
    };

    res.json({
      id: row.id,
      full_name: row.full_name,
      full_name_ml: row.full_name_ml,
      phone: row.phone,
      address: row.address,
      is_active_member: row.is_active_member,
      member_since: row.member_since,
      created_at: row.created_at,
    });
  } catch (err) {
    console.error('Profile PUT error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
