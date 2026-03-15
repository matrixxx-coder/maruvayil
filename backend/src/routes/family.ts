import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes require auth
router.use(requireAuth);

// GET /family-members
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, user_id, name, name_malayalam, relationship,
              birth_date, birth_star, rashi, notes, include_in_pooja,
              created_at, updated_at
       FROM family_members
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Family GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /family-members
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    nameMalayalam,
    relationship,
    birthDate,
    birthStar,
    rashi,
    notes,
    includeInPooja,
  } = req.body as {
    name?: string;
    nameMalayalam?: string;
    relationship?: string;
    birthDate?: string;
    birthStar?: string;
    rashi?: string;
    notes?: string;
    includeInPooja?: boolean;
  };

  if (!name || !relationship) {
    res.status(400).json({ error: 'name and relationship are required' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO family_members
         (user_id, name, name_malayalam, relationship, birth_date, birth_star, rashi, notes, include_in_pooja)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, user_id, name, name_malayalam, relationship,
                 birth_date, birth_star, rashi, notes, include_in_pooja,
                 created_at, updated_at`,
      [
        req.userId,
        name,
        nameMalayalam ?? null,
        relationship,
        birthDate ?? null,
        birthStar ?? null,
        rashi ?? null,
        notes ?? null,
        includeInPooja !== undefined ? includeInPooja : true,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Family POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /family-members/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    name,
    nameMalayalam,
    relationship,
    birthDate,
    birthStar,
    rashi,
    notes,
    includeInPooja,
  } = req.body as {
    name?: string;
    nameMalayalam?: string;
    relationship?: string;
    birthDate?: string;
    birthStar?: string;
    rashi?: string;
    notes?: string;
    includeInPooja?: boolean;
  };

  try {
    // Verify ownership first
    const check = await query(
      'SELECT id FROM family_members WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Family member not found' });
      return;
    }

    const result = await query(
      `UPDATE family_members
       SET name            = COALESCE($1, name),
           name_malayalam  = COALESCE($2, name_malayalam),
           relationship    = COALESCE($3, relationship),
           birth_date      = COALESCE($4, birth_date),
           birth_star      = COALESCE($5, birth_star),
           rashi           = COALESCE($6, rashi),
           notes           = COALESCE($7, notes),
           include_in_pooja = COALESCE($8, include_in_pooja)
       WHERE id = $9 AND user_id = $10
       RETURNING id, user_id, name, name_malayalam, relationship,
                 birth_date, birth_star, rashi, notes, include_in_pooja,
                 created_at, updated_at`,
      [
        name ?? null,
        nameMalayalam ?? null,
        relationship ?? null,
        birthDate ?? null,
        birthStar ?? null,
        rashi ?? null,
        notes ?? null,
        includeInPooja !== undefined ? includeInPooja : null,
        id,
        req.userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Family PUT error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /family-members/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM family_members WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Family member not found' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Family DELETE error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
