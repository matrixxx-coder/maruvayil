import { Router, Request, Response } from 'express';
import { query } from '../db.js';

const router = Router();

// GET /content/blocks?page=home — public, no auth
router.get('/blocks', async (req: Request, res: Response): Promise<void> => {
  const { page } = req.query as { page?: string };

  try {
    let result;
    if (page) {
      result = await query(
        'SELECT key, label, page, value_en, value_ml, updated_at FROM content_blocks WHERE page = $1 ORDER BY key',
        [page]
      );
    } else {
      result = await query(
        'SELECT key, label, page, value_en, value_ml, updated_at FROM content_blocks ORDER BY page, key'
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('GET /content/blocks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /content/announcements — public, active only
router.get('/announcements', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, title_en, title_ml, body_en, body_ml, display_order, created_at FROM announcements WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /content/announcements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /content/committee — public
router.get('/committee', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, name, role_en, role_ml, display_order FROM committee_members ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /content/committee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
