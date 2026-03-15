import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { encrypt, encryptNullable, decrypt, decryptNullable, hmacEmail } from '../encryption.js';

const router = Router();

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET ?? 'change-me-in-production';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, fullName, phone, gender, dob, birthStar, placeOfBirth, role } = req.body as {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    birthStar?: string;
    placeOfBirth?: string;
    role?: string;
  };

  if (!email || !password || !fullName) {
    res.status(400).json({ error: 'email, password and fullName are required' });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase().trim();
    const emailHmac = hmacEmail(normalizedEmail);
    const encryptedEmail = encrypt(normalizedEmail);

    // Try insert with email_hmac; fall back if column not yet migrated
    let userResult;
    try {
      userResult = await query(
        'INSERT INTO users (email, email_hmac, password_hash) VALUES ($1, $2, $3) RETURNING id, email, created_at',
        [encryptedEmail, emailHmac, passwordHash]
      );
    } catch (colErr) {
      const pgErr = colErr as { code?: string; message?: string };
      if (pgErr.message?.includes('email_hmac')) {
        // Column not yet migrated — insert without it
        userResult = await query(
          'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
          [encryptedEmail, passwordHash]
        );
      } else {
        throw colErr;
      }
    }
    const user = userResult.rows[0] as { id: string; email: string; created_at: string };

    // Validate role — Trustee can only be assigned by admin
    const allowedRoles = ['Devotee', 'Family Member'];
    const assignedRole = role && allowedRoles.includes(role) ? role : 'Devotee';

    try {
      await query(
        'INSERT INTO profiles (id, full_name, phone, gender, dob, birth_star, place_of_birth, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          user.id,
          encryptNullable(fullName),
          encryptNullable(phone ?? null),
          encryptNullable(gender ?? null),
          encryptNullable(dob ?? null),
          encryptNullable(birthStar ?? null),
          encryptNullable(placeOfBirth ?? null),
          assignedRole,
        ]
      );
    } catch {
      // role column not yet migrated — insert without it
      await query(
        'INSERT INTO profiles (id, full_name, phone, gender, dob, birth_star, place_of_birth) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          user.id,
          encryptNullable(fullName),
          encryptNullable(phone ?? null),
          encryptNullable(gender ?? null),
          encryptNullable(dob ?? null),
          encryptNullable(birthStar ?? null),
          encryptNullable(placeOfBirth ?? null),
        ]
      );
    }

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: normalizedEmail, createdAt: user.created_at },
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
    type UserRow = { id: string; email: string; password_hash: string; created_at: string };

    // Primary lookup: HMAC index (fast, O(1))
    let user: UserRow | null = null;
    try {
      const identifierHmac = hmacEmail(identifier);
      const result = await query(
        'SELECT id, email, password_hash, created_at FROM users WHERE email_hmac = $1 LIMIT 1',
        [identifierHmac]
      );
      if (result.rows.length > 0) user = result.rows[0] as UserRow;
    } catch {
      // email_hmac column not yet migrated — fall through to scan
    }

    // Fallback: decrypt every email and compare (handles pre-migration databases)
    if (!user) {
      const all = await query('SELECT id, email, password_hash, created_at FROM users');
      const normalised = identifier.toLowerCase().trim();
      for (const row of all.rows as UserRow[]) {
        const decrypted = (decryptNullable(row.email) ?? row.email).toLowerCase().trim();
        if (decrypted === normalised) {
          user = row;
          break;
        }
      }
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid User ID / email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid User ID / email or password' });
      return;
    }

    const decryptedEmail = decryptNullable(user.email) ?? user.email;
    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: decryptedEmail, createdAt: user.created_at },
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
              p.gender, p.dob, p.birth_star, p.place_of_birth,
              p.facebook, p.instagram,
              p.is_active_member, p.member_since, p.is_admin, p.role
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
      gender: string | null;
      dob: string | null;
      birth_star: string | null;
      place_of_birth: string | null;
      facebook: string | null;
      instagram: string | null;
      is_active_member: boolean;
      member_since: string;
      is_admin: boolean;
      role: string;
    };

    res.json({
      id: row.id,
      email: decryptNullable(row.email) ?? row.email,
      createdAt: row.created_at,
      profile: {
        fullName: decryptNullable(row.full_name),
        fullNameMl: decryptNullable(row.full_name_ml),
        phone: decryptNullable(row.phone),
        address: decryptNullable(row.address),
        gender: decryptNullable(row.gender),
        dob: decryptNullable(row.dob),
        birthStar: decryptNullable(row.birth_star),
        placeOfBirth: decryptNullable(row.place_of_birth),
        facebook: decryptNullable(row.facebook),
        instagram: decryptNullable(row.instagram),
        isActiveMember: row.is_active_member,
        memberSince: row.member_since,
        isAdmin: row.is_admin ?? false,
        role: row.role ?? 'Devotee',
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
