import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../middleware/admin.js';
import { requireAuth } from '../middleware/auth.js';
import { decryptNullable } from '../encryption.js';

const router = Router();

// ── Role management — accessible by admins AND trustees ──────────────────────

// PUT /admin/members/:id/role
// Admins can set any role. Trustees can only set "Family Member".
router.put('/members/:id/role', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body as { role?: string };

  const validRoles = ['Trustee', 'Family Member', 'Devotee'];
  if (!role || !validRoles.includes(role)) {
    res.status(400).json({ error: 'role must be one of: Trustee, Family Member, Devotee' });
    return;
  }

  try {
    // Look up the caller's permissions
    const callerResult = await query(
      'SELECT is_admin, role FROM profiles WHERE id = $1',
      [req.userId]
    );
    if (callerResult.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const caller = callerResult.rows[0] as { is_admin: boolean; role: string };
    const callerIsAdmin = caller.is_admin === true;
    const callerIsTrustee = caller.role === 'Trustee';

    if (!callerIsAdmin && !callerIsTrustee) {
      res.status(403).json({ error: 'Forbidden: admin or trustee access required' });
      return;
    }
    if (callerIsTrustee && !callerIsAdmin && role !== 'Family Member') {
      res.status(403).json({ error: 'Trustees can only assign the Family Member role' });
      return;
    }

    const result = await query(
      'UPDATE profiles SET role = $1 WHERE id = $2 RETURNING id, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /admin/members/:id/role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/members — accessible by admins AND trustees
router.get('/members', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify caller is admin or trustee
    const callerResult = await query(
      'SELECT is_admin, role FROM profiles WHERE id = $1',
      [req.userId]
    );
    if (callerResult.rows.length === 0) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const caller = callerResult.rows[0] as { is_admin: boolean; role: string };
    if (!caller.is_admin && caller.role !== 'Trustee') {
      res.status(403).json({ error: 'Forbidden: admin or trustee access required' });
      return;
    }

    const result = await query(
      `SELECT u.id, u.email, u.created_at,
              p.full_name, p.phone, p.is_active_member, p.member_since, p.role
       FROM users u
       LEFT JOIN profiles p ON p.id = u.id
       ORDER BY u.created_at DESC`
    );
    const rows = (result.rows as Array<{
      id: string;
      email: string;
      created_at: string;
      full_name: string | null;
      phone: string | null;
      is_active_member: boolean;
      member_since: string;
      role: string;
    }>).map((row) => ({
      ...row,
      email: decryptNullable(row.email) ?? row.email,
      full_name: decryptNullable(row.full_name),
      phone: decryptNullable(row.phone),
      role: row.role ?? 'Devotee',
    }));
    res.json(rows);
  } catch (err) {
    console.error('GET /admin/members error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All routes below require admin
router.use(requireAdmin);

// ---- Content Blocks ----

// GET /admin/content — return all content blocks grouped by page
router.get('/content', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT key, label, page, value_en, value_ml, updated_at, updated_by FROM content_blocks ORDER BY page, key'
    );

    const grouped: Record<string, typeof result.rows> = {};
    for (const row of result.rows) {
      const r = row as { page: string };
      if (!grouped[r.page]) grouped[r.page] = [];
      grouped[r.page].push(row);
    }

    res.json(grouped);
  } catch (err) {
    console.error('GET /admin/content error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /admin/content/:key — update a content block
router.put('/content/:key', async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;
  const { value_en, value_ml } = req.body as { value_en?: string; value_ml?: string };

  if (value_en === undefined || value_ml === undefined) {
    res.status(400).json({ error: 'value_en and value_ml are required' });
    return;
  }

  try {
    const result = await query(
      `UPDATE content_blocks
       SET value_en = $1, value_ml = $2, updated_at = NOW(), updated_by = $3
       WHERE key = $4
       RETURNING *`,
      [value_en, value_ml, req.userId, key]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Content block not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /admin/content/:key error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Announcements ----

// GET /admin/announcements
router.get('/announcements', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT * FROM announcements ORDER BY display_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /admin/announcements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/announcements
router.post('/announcements', async (req: Request, res: Response): Promise<void> => {
  const { title_en, title_ml, body_en, body_ml, is_active, display_order } = req.body as {
    title_en?: string;
    title_ml?: string;
    body_en?: string;
    body_ml?: string;
    is_active?: boolean;
    display_order?: number;
  };

  if (!title_en || !body_en) {
    res.status(400).json({ error: 'title_en and body_en are required' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO announcements (title_en, title_ml, body_en, body_ml, is_active, display_order, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title_en,
        title_ml ?? '',
        body_en,
        body_ml ?? '',
        is_active ?? true,
        display_order ?? 0,
        req.userId,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /admin/announcements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /admin/announcements/:id
router.put('/announcements/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title_en, title_ml, body_en, body_ml, is_active, display_order } = req.body as {
    title_en?: string;
    title_ml?: string;
    body_en?: string;
    body_ml?: string;
    is_active?: boolean;
    display_order?: number;
  };

  try {
    const result = await query(
      `UPDATE announcements
       SET title_en      = COALESCE($1, title_en),
           title_ml      = COALESCE($2, title_ml),
           body_en       = COALESCE($3, body_en),
           body_ml       = COALESCE($4, body_ml),
           is_active     = COALESCE($5, is_active),
           display_order = COALESCE($6, display_order),
           updated_at    = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title_en ?? null,
        title_ml ?? null,
        body_en ?? null,
        body_ml ?? null,
        is_active ?? null,
        display_order ?? null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /admin/announcements/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/announcements/:id
router.delete('/announcements/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await query('DELETE FROM announcements WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /admin/announcements/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Committee Members ----

// GET /admin/committee
router.get('/committee', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM committee_members ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /admin/committee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/committee
router.post('/committee', async (req: Request, res: Response): Promise<void> => {
  const { name, role_en, role_ml, display_order } = req.body as {
    name?: string;
    role_en?: string;
    role_ml?: string;
    display_order?: number;
  };

  if (!name || !role_en) {
    res.status(400).json({ error: 'name and role_en are required' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO committee_members (name, role_en, role_ml, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, role_en, role_ml ?? '', display_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /admin/committee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /admin/committee/:id
router.put('/committee/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, role_en, role_ml, display_order } = req.body as {
    name?: string;
    role_en?: string;
    role_ml?: string;
    display_order?: number;
  };

  try {
    const result = await query(
      `UPDATE committee_members
       SET name          = COALESCE($1, name),
           role_en       = COALESCE($2, role_en),
           role_ml       = COALESCE($3, role_ml),
           display_order = COALESCE($4, display_order)
       WHERE id = $5
       RETURNING *`,
      [name ?? null, role_en ?? null, role_ml ?? null, display_order ?? null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Committee member not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /admin/committee/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/committee/:id
router.delete('/committee/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await query('DELETE FROM committee_members WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /admin/committee/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Members Management ----

// PUT /admin/members/:id/toggle-active
router.put('/members/:id/toggle-active', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await query(
      `UPDATE profiles
       SET is_active_member = NOT is_active_member
       WHERE id = $1
       RETURNING id, is_active_member`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /admin/members/:id/toggle-active error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/members/purge-test
// Finds all users whose decrypted email contains "test" (case-insensitive) and deletes them.
// Deletion cascades to profiles, family_members, and any other related rows.
router.delete('/members/purge-test', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT id, email FROM users');

    const testUserIds: string[] = [];
    for (const row of result.rows as Array<{ id: string; email: string }>) {
      const email = decryptNullable(row.email) ?? row.email;
      if (email.toLowerCase().includes('test')) {
        testUserIds.push(row.id);
      }
    }

    if (testUserIds.length === 0) {
      res.json({ deleted: 0, message: 'No test users found' });
      return;
    }

    await query('DELETE FROM users WHERE id = ANY($1)', [testUserIds]);
    res.json({ deleted: testUserIds.length });
  } catch (err) {
    console.error('DELETE /admin/members/purge-test error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Family Tree ----

// GET /admin/tree
router.get('/tree', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT * FROM tree_members ORDER BY display_order ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /admin/tree error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/tree
router.post('/tree', async (req: Request, res: Response): Promise<void> => {
  const {
    full_name, full_name_ml, gender, dob, birth_star, place_of_birth,
    phone, email, role, notes, parent_id, display_order,
  } = req.body as {
    full_name?: string; full_name_ml?: string; gender?: string;
    dob?: string; birth_star?: string; place_of_birth?: string;
    phone?: string; email?: string; role?: string; notes?: string;
    parent_id?: string | null; display_order?: number;
  };

  if (!full_name) {
    res.status(400).json({ error: 'full_name is required' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO tree_members
         (full_name, full_name_ml, gender, dob, birth_star, place_of_birth,
          phone, email, role, notes, parent_id, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        full_name, full_name_ml ?? null, gender ?? null, dob ?? null,
        birth_star ?? null, place_of_birth ?? null, phone ?? null,
        email ?? null, role ?? 'Devotee', notes ?? null,
        parent_id ?? null, display_order ?? 0,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /admin/tree error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /admin/tree/:id
router.put('/tree/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    full_name, full_name_ml, gender, dob, birth_star, place_of_birth,
    phone, email, role, notes, parent_id, display_order,
  } = req.body as {
    full_name?: string; full_name_ml?: string; gender?: string;
    dob?: string; birth_star?: string; place_of_birth?: string;
    phone?: string; email?: string; role?: string; notes?: string;
    parent_id?: string | null; display_order?: number;
  };

  try {
    const result = await query(
      `UPDATE tree_members SET
         full_name      = COALESCE($1, full_name),
         full_name_ml   = $2,
         gender         = $3,
         dob            = $4,
         birth_star     = $5,
         place_of_birth = $6,
         phone          = $7,
         email          = $8,
         role           = COALESCE($9, role),
         notes          = $10,
         parent_id      = $11,
         display_order  = COALESCE($12, display_order)
       WHERE id = $13
       RETURNING *`,
      [
        full_name ?? null, full_name_ml ?? null, gender ?? null,
        dob ?? null, birth_star ?? null, place_of_birth ?? null,
        phone ?? null, email ?? null, role ?? null, notes ?? null,
        parent_id !== undefined ? parent_id : null,
        display_order ?? null, id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /admin/tree/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/tree/:id  (children's parent_id set to NULL by ON DELETE SET NULL)
router.delete('/tree/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await query('DELETE FROM tree_members WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /admin/tree/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
