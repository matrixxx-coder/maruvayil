const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const TOKEN_KEY = 'maruvayil_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

// ---- Auth API ----

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  id: string;
  email: string;
  createdAt: string;
  profile: {
    fullName: string | null;
    fullNameMl: string | null;
    phone: string | null;
    address: string | null;
    gender: string | null;
    dob: string | null;
    birthStar: string | null;
    placeOfBirth: string | null;
    facebook: string | null;
    instagram: string | null;
    isActiveMember: boolean;
    memberSince: string;
    isAdmin: boolean;
    role: string;
  };
}

export const authApi = {
  register(
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    gender?: string,
    dob?: string,
    birthStar?: string,
    placeOfBirth?: string,
    role?: string
  ): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('POST', '/auth/register', {
      email, password, fullName, phone, gender, dob, birthStar, placeOfBirth, role,
    });
  },
  login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('POST', '/auth/login', { email, password });
  },
  me(): Promise<MeResponse> {
    return apiRequest<MeResponse>('GET', '/auth/me');
  },
};

// ---- Profile API ----

export interface ProfileData {
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
}

export interface ProfileUpdateInput {
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
}

export const profileApi = {
  get(): Promise<ProfileData> {
    return apiRequest<ProfileData>('GET', '/profile');
  },
  update(data: ProfileUpdateInput): Promise<ProfileData> {
    return apiRequest<ProfileData>('PUT', '/profile', data);
  },
};

// ---- Family API ----

export interface FamilyMemberData {
  id: string;
  user_id: string;
  name: string;
  name_malayalam: string | null;
  relationship: string;
  birth_date: string | null;
  birth_star: string | null;
  rashi: string | null;
  notes: string | null;
  include_in_pooja: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyMemberInput {
  name: string;
  nameMalayalam?: string | null;
  relationship: string;
  birthDate?: string | null;
  birthStar?: string | null;
  rashi?: string | null;
  notes?: string | null;
  includeInPooja?: boolean;
}

export const familyApi = {
  list(): Promise<FamilyMemberData[]> {
    return apiRequest<FamilyMemberData[]>('GET', '/family-members');
  },
  create(data: FamilyMemberInput): Promise<FamilyMemberData> {
    return apiRequest<FamilyMemberData>('POST', '/family-members', data);
  },
  update(id: string, data: Partial<FamilyMemberInput>): Promise<FamilyMemberData> {
    return apiRequest<FamilyMemberData>('PUT', `/family-members/${id}`, data);
  },
  delete(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('DELETE', `/family-members/${id}`);
  },
};

// ---- Public Content API (no auth needed) ----

export interface ContentBlock {
  key: string;
  label: string;
  page: string;
  value_en: string;
  value_ml: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title_en: string;
  title_ml: string;
  body_en: string;
  body_ml: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role_en: string;
  role_ml: string;
  display_order: number;
}

export const contentApi = {
  blocks: (page: string) => apiRequest<ContentBlock[]>('GET', `/content/blocks?page=${page}`),
  announcements: () => apiRequest<Announcement[]>('GET', '/content/announcements'),
  committee: () => apiRequest<CommitteeMember[]>('GET', '/content/committee'),
};

// ---- Admin API (requires admin token) ----

export interface AdminMember {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  phone: string | null;
  is_active_member: boolean;
  member_since: string;
  role: string;
}

export const adminApi = {
  // content
  getContent: () => apiRequest<Record<string, ContentBlock[]>>('GET', '/admin/content'),
  updateContent: (key: string, data: { value_en: string; value_ml: string }) =>
    apiRequest<ContentBlock>('PUT', `/admin/content/${key}`, data),
  // announcements
  getAnnouncements: () => apiRequest<Announcement[]>('GET', '/admin/announcements'),
  createAnnouncement: (data: object) => apiRequest<Announcement>('POST', '/admin/announcements', data),
  updateAnnouncement: (id: string, data: object) =>
    apiRequest<Announcement>('PUT', `/admin/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => apiRequest<void>('DELETE', `/admin/announcements/${id}`),
  // committee
  getCommittee: () => apiRequest<CommitteeMember[]>('GET', '/admin/committee'),
  createCommitteeMember: (data: object) => apiRequest<CommitteeMember>('POST', '/admin/committee', data),
  updateCommitteeMember: (id: string, data: object) =>
    apiRequest<CommitteeMember>('PUT', `/admin/committee/${id}`, data),
  deleteCommitteeMember: (id: string) => apiRequest<void>('DELETE', `/admin/committee/${id}`),
  // members
  getMembers: () => apiRequest<AdminMember[]>('GET', '/admin/members'),
  toggleMemberActive: (id: string) =>
    apiRequest<{ id: string; is_active_member: boolean }>('PUT', `/admin/members/${id}/toggle-active`),
  setMemberRole: (id: string, role: string) =>
    apiRequest<{ id: string; role: string }>('PUT', `/admin/members/${id}/role`, { role }),
  purgeTestUsers: () =>
    apiRequest<{ deleted: number; message?: string }>('DELETE', '/admin/members/purge-test'),
};
