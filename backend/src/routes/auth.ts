import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET ?? 'change-me-in-production';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName, phone } = req.body as {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
  };

  if (!email || !password || !fullName) {
    res.status(400).json({ error: 'email, password and fullName are required' });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase().trim(), passwordHash]
    );
    const user = userResult.rows[0] as { id: string; email: string; created_at: string };

    await query(
      'INSERT INTO profiles (id, full_name, phone) VALUES ($1, $2, $3)',
      [user.id, fullName, phone ?? null]
    );

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, createdAt: user.created_at },
    });
  } catch (err) {
    const pgErr = err as { code?: string };
    if (pgErr.code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login — accepts email address or plain user ID
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'User ID / email and password are required' });
    return;
  }

  const identifier = email.trim();

  try {
    // Match exact value first (handles plain user IDs like "admin"),
    // then fall back to case-insensitive email match.
    const result = await query(
      `SELECT id, email, password_hash, created_at FROM users
       WHERE email = $1 OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid User ID / email or password' });
      return;
    }

    const user = result.rows[0] as {
      id: string;
      email: string;
      password_hash: string;
      created_at: string;
    };

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid User ID / email or password' });
      return;
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, createdAt: user.created_at },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.created_at,
              p.full_name, p.full_name_ml, p.phone, p.address,
              p.is_active_member, p.member_since, p.is_admin
       FROM users u
       LEFT JOIN profiles p ON p.id = u.id
       WHERE u.id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const row = result.rows[0] as {
      id: string;
      email: string;
      created_at: string;
      full_name: string | null;
      full_name_ml: string | null;
      phone: string | null;
      address: string | null;
      is_active_member: boolean;
      member_since: string;
      is_admin: boolean;
    };

    res.json({
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
      profile: {
        fullName: row.full_name,
        fullNameMl: row.full_name_ml,
        phone: row.phone,
        address: row.address,
        isActiveMember: row.is_active_member,
        memberSince: row.member_since,
        isAdmin: row.is_admin ?? false,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
