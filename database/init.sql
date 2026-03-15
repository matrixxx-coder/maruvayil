-- Users table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,              -- AES-256-GCM encrypted
  email_hmac TEXT UNIQUE NOT NULL,  -- HMAC-SHA256 for lookups (not reversible)
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,        -- encrypted
  full_name_ml TEXT,     -- encrypted
  phone TEXT,            -- encrypted
  address TEXT,          -- encrypted
  dob TEXT,              -- encrypted date of birth
  birth_star TEXT,       -- encrypted
  place_of_birth TEXT,   -- encrypted
  is_active_member BOOLEAN DEFAULT FALSE,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,       -- encrypted
  name_malayalam TEXT,      -- encrypted
  relationship TEXT NOT NULL,
  birth_date TEXT,          -- encrypted date string
  birth_star TEXT,          -- encrypted
  rashi TEXT,               -- encrypted
  notes TEXT,               -- encrypted
  include_in_pooja BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Editable content blocks (key/value pairs per page)
CREATE TABLE IF NOT EXISTS content_blocks (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  page TEXT NOT NULL,
  value_en TEXT NOT NULL DEFAULT '',
  value_ml TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Announcements (shown on home page)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ml TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL,
  body_ml TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Committee members
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_en TEXT NOT NULL,
  role_ml TEXT NOT NULL DEFAULT '',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default content blocks
INSERT INTO content_blocks (key, label, page, value_en, value_ml) VALUES
  ('home.hero_title', 'Hero Title', 'home', 'Maruvayil Sree ShivaParvathy Temple', 'മറുവയൽ ശ്രീ ശിവ പാർവതി ക്ഷേത്രം'),
  ('home.hero_subtitle', 'Hero Subtitle', 'home', 'Kudumba Kshetra Charitable Trust — Badagara, Kerala', 'കുടുംബ ക്ഷേത്ര ചാരിറ്റബിൾ ട്രസ്റ്റ് — ബദഗര, കേരള'),
  ('home.welcome_title', 'Welcome Section Title', 'home', 'Welcome to Our Sacred Temple', 'ഞങ്ങളുടെ പവിത്ര ക്ഷേത്രത്തിലേക്ക് സ്വാഗതം'),
  ('home.welcome_text', 'Welcome Section Body', 'home', 'Maruvayil Sree ShivaParvathy Kudumba Kshetra is a sacred family temple in Badagara, Calicut District, Kerala — over 300 years old, reconstructed in February 2020.', 'മറുവയൽ ശ്രീ ശിവ പാർവതി കുടുംബ ക്ഷേത്രം കേരളത്തിലെ കോഴിക്കോട് ജില്ലയിലെ ബദഗരയിലെ ഒരു പ്രാചീന കുടുംബ ക്ഷേത്രമാണ് — 300 വർഷത്തിലേറെ പഴക്കമുള്ളതും 2020 ഫെബ്രുവരിയിൽ പുനർനിർമിച്ചതും.'),
  ('temple.history_title', 'History Section Title', 'temple', 'Temple History', 'ക്ഷേത്ര ചരിത്രം'),
  ('temple.history_text', 'History Body Text', 'temple', 'This sacred temple is over 300 years old, dedicated to Shiva and Parvathi. The temple was reconstructed in February 2020 with full rituals performed on March 5th, 2020.', 'ഈ പവിത്ര ക്ഷേത്രം 300 വർഷത്തിലേറെ പഴക്കമുള്ളതാണ്, ശിവനും പാർവതിക്കും സമർപ്പിതം. 2020 ഫെബ്രുവരിയിൽ ക്ഷേത്രം പുനർനിർമ്മിക്കുകയും 2020 മാർച്ച് 5-ന് പൂർണ്ണ ചടങ്ങുകൾ നടത്തുകയും ചെയ്തു.'),
  ('pooja.description', 'Monthly Pooja Description', 'pooja', 'The temple conducts monthly poojas for members. Each monthly pooja includes Nivedhyam, Neelanjanam, Maala, and Deeparadhana offered to all deities.', 'ക്ഷേത്രം അംഗങ്ങൾക്കായി പ്രതിമാസ പൂജകൾ നടത്തുന്നു. ഓരോ പ്രതിമാസ പൂജയിലും എല്ലാ ദേവതകൾക്കും നിവേദ്യം, നീലാഞ്ജനം, മാല, ദീപാരാധന എന്നിവ അർപ്പിക്കും.'),
  ('contact.address', 'Temple Address', 'contact', 'Maruveyil House, Post Kunhumakara, Via Chombala, Vadagara Taluq, Calicut District, Kerala', 'മറുവയൽ ഹൗസ്, പോസ്റ്റ് കുഞ്ഞുമക്കര, ചൊമ്പള വഴി, വടകര താലൂക്ക്, കോഴിക്കോട് ജില്ല, കേരള'),
  ('contact.email', 'Temple Email', 'contact', 'maruvayiltemple@gmail.com', 'maruvayiltemple@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- Seed default committee members
INSERT INTO committee_members (name, role_en, role_ml, display_order) VALUES
  ('Committee President', 'President', 'പ്രസിഡന്റ്', 1),
  ('Committee Vice President 1', 'Vice President', 'വൈസ് പ്രസിഡന്റ്', 2),
  ('Committee Vice President 2', 'Vice President', 'വൈസ് പ്രസിഡന്റ്', 3),
  ('Committee Secretary', 'Secretary', 'സെക്രട്ടറി', 4),
  ('Committee Treasurer', 'Treasurer', 'ട്രഷറർ', 5),
  ('Joint Secretary 1', 'Joint Secretary', 'ജോയിന്റ് സെക്രട്ടറി', 6),
  ('Joint Secretary 2', 'Joint Secretary', 'ജോയിന്റ് സെക്രട്ടറി', 7),
  ('Joint Secretary 3', 'Joint Secretary', 'ജോയിന്റ് സെക്രട്ടറി', 8),
  ('Joint Secretary 4', 'Joint Secretary', 'ജോയിന്റ് സെക്രട്ടറി', 9)
ON CONFLICT DO NOTHING;

-- Auto-update trigger for announcements
CREATE OR REPLACE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Encryption migration (safe to re-run on existing databases) ──────────────
-- Add email_hmac column if missing (existing rows will have NULL — run the
-- backend migration script to back-fill HMACs after setting ENCRYPTION_KEY)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_hmac TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_hmac ON users(email_hmac) WHERE email_hmac IS NOT NULL;

-- New profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_star TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS place_of_birth TEXT;

-- family_members.birth_date was DATE; add a TEXT column for the encrypted value
-- (old DATE column is kept so no existing data is lost)
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS birth_date_enc TEXT;
