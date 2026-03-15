export interface Profile {
  id: string;
  full_name: string | null;
  full_name_ml: string | null;
  phone: string | null;
  address: string | null;
  member_since: string;
  is_active_member: boolean;
  created_at: string;
  facebook: string | null;
  instagram: string | null;
  role: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  name_malayalam: string | null;
  relationship: Relationship;
  birth_date: string | null;
  birth_star: string | null;
  rashi: string | null;
  notes: string | null;
  include_in_pooja: boolean;
  created_at: string;
  updated_at: string;
}

export type Relationship = 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

export interface Nakshatra {
  en: string;
  ml: string;
}

export interface Rashi {
  en: string;
  ml: string;
}

export const NAKSHATRAS: Nakshatra[] = [
  { en: 'Ashwini', ml: 'അശ്വതി' },
  { en: 'Bharani', ml: 'ഭരണി' },
  { en: 'Krittika', ml: 'കാർത്തിക' },
  { en: 'Rohini', ml: 'രോഹിണി' },
  { en: 'Mrigashira', ml: 'മകയിരം' },
  { en: 'Ardra', ml: 'തിരുവാതിര' },
  { en: 'Punarvasu', ml: 'പുണർതം' },
  { en: 'Pushya', ml: 'പൂയം' },
  { en: 'Ashlesha', ml: 'ആയില്യം' },
  { en: 'Magha', ml: 'മകം' },
  { en: 'Purva Phalguni', ml: 'പൂരം' },
  { en: 'Uttara Phalguni', ml: 'ഉത്രം' },
  { en: 'Hasta', ml: 'അത്തം' },
  { en: 'Chitra', ml: 'ചിത്തിര' },
  { en: 'Swati', ml: 'ചോതി' },
  { en: 'Vishakha', ml: 'വിശാഖം' },
  { en: 'Anuradha', ml: 'അനിഴം' },
  { en: 'Jyeshtha', ml: 'തൃക്കേട്ട' },
  { en: 'Mula', ml: 'മൂലം' },
  { en: 'Purva Ashadha', ml: 'പൂരാടം' },
  { en: 'Uttara Ashadha', ml: 'ഉത്രാടം' },
  { en: 'Shravana', ml: 'തിരുവോണം' },
  { en: 'Dhanishtha', ml: 'അവിട്ടം' },
  { en: 'Shatabhisha', ml: 'ചതയം' },
  { en: 'Purva Bhadrapada', ml: 'പൂരുരുട്ടാതി' },
  { en: 'Uttara Bhadrapada', ml: 'ഉത്തൃട്ടാതി' },
  { en: 'Revati', ml: 'രേവതി' },
];

export const RASHIS: Rashi[] = [
  { en: 'Mesha', ml: 'മേഷം' },
  { en: 'Vrishabha', ml: 'വൃഷഭം' },
  { en: 'Mithuna', ml: 'മിഥുനം' },
  { en: 'Karka', ml: 'കർക്കടകം' },
  { en: 'Simha', ml: 'സിംഹം' },
  { en: 'Kanya', ml: 'കന്നി' },
  { en: 'Tula', ml: 'തുലാം' },
  { en: 'Vrishchika', ml: 'വൃശ്ചികം' },
  { en: 'Dhanu', ml: 'ധനു' },
  { en: 'Makara', ml: 'മകരം' },
  { en: 'Kumbha', ml: 'കുംഭം' },
  { en: 'Meena', ml: 'മീനം' },
];

export const RELATIONSHIPS: { value: Relationship; en: string; ml: string }[] = [
  { value: 'self', en: 'Self', ml: 'സ്വയം' },
  { value: 'spouse', en: 'Spouse', ml: 'ഭാര്യ/ഭർത്താവ്' },
  { value: 'child', en: 'Child', ml: 'മകൻ/മകൾ' },
  { value: 'parent', en: 'Parent', ml: 'അച്ഛൻ/അമ്മ' },
  { value: 'sibling', en: 'Sibling', ml: 'സഹോദരൻ/സഹോദരി' },
  { value: 'other', en: 'Other', ml: 'മറ്റുള്ളവർ' },
];
