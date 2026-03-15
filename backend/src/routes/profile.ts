import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { encryptNullable, decryptNullable } from '../encryption.js';

const router = Router();

// All routes require auth
router.use(requireAuth);

// GET /profile
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, full_name, full_name_ml, phone, address,
              gender, dob, birth_star, place_of_birth,
              facebook, instagram, role,
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
      gender: string | null;
      dob: string | null;
      birth_star: string | null;
      place_of_birth: string | null;
      facebook: string | null;
      instagram: string | null;
      role: string;
      is_active_member: boolean;
      member_since: string;
      created_at: string;
    };

    res.json({
      id: row.id,
      full_name: decryptNullable(row.full_name),
      full_name_ml: decryptNullable(row.full_name_ml),
      phone: decryptNullable(row.phone),
      address: decryptNullable(row.address),
      gender: decryptNullable(row.gender),
      dob: decryptNullable(row.dob),
      birth_star: decryptNullable(row.birth_star),
      place_of_birth: decryptNullable(row.place_of_birth),
      facebook: decryptNullable(row.facebook),
      instagram: decryptNullable(row.instagram),
      role: row.role ?? 'Devotee',
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
  const { fullName, fullNameMl, phone, address, gender, dob, birthStar, placeOfBirth, facebook, instagram } = req.body as {
    fullName?: string;
    fullNameMl?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dob?: string;
    birthStar?: string;
    placeOfBirth?: string;
    facebook?: string;
    instagram?: string;
  };

  try {
    const result = await query(
      `UPDATE profiles
       SET full_name      = COALESCE($1, full_name),
           full_name_ml   = COALESCE($2, full_name_ml),
           phone          = COALESCE($3, phone),
           address        = COALESCE($4, address),
           gender         = COALESCE($5, gender),
           dob            = COALESCE($6, dob),
           birth_star     = COALESCE($7, birth_star),
           place_of_birth = COALESCE($8, place_of_birth),
           facebook       = COALESCE($9, facebook),
           instagram      = COALESCE($10, instagram)
       WHERE id = $11
       RETURNING id, full_name, full_name_ml, phone, address,
                 gender, dob, birth_star, place_of_birth,
                 facebook, instagram, role,
                 is_active_member, member_since, created_at`,
      [
        encryptNullable(fullName ?? null),
        encryptNullable(fullNameMl ?? null),
        encryptNullable(phone ?? null),
        encryptNullable(address ?? null),
        encryptNullable(gender ?? null),
        encryptNullable(dob ?? null),
        encryptNullable(birthStar ?? null),
        encryptNullable(placeOfBirth ?? null),
        facebook !== undefined ? encryptNullable(facebook || null) : null,
        instagram !== undefined ? encryptNullable(instagram || null) : null,
        req.userId,
      ]
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
      gender: string | null;
      dob: string | null;
      birth_star: string | null;
      place_of_birth: string | null;
      facebook: string | null;
      instagram: string | null;
      role: string;
      is_active_member: boolean;
      member_since: string;
      created_at: string;
    };

    res.json({
      id: row.id,
      full_name: decryptNullable(row.full_name),
      full_name_ml: decryptNullable(row.full_name_ml),
      phone: decryptNullable(row.phone),
      address: decryptNullable(row.address),
      gender: decryptNullable(row.gender),
      dob: decryptNullable(row.dob),
      birth_star: decryptNullable(row.birth_star),
      place_of_birth: decryptNullable(row.place_of_birth),
      facebook: decryptNullable(row.facebook),
      instagram: decryptNullable(row.instagram),
      role: row.role ?? 'Devotee',
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
