import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, profileApi, getToken, setToken, clearToken } from '../lib/api';
import { Profile } from '../types';

interface AppUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AppUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  isTrustee: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string, gender?: string, dob?: string, birthStar?: string, placeOfBirth?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isTrustee: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function decodeTokenUser(token: string): AppUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { userId?: string; email?: string };
    if (!payload.userId) return null;
    return { id: payload.userId, email: payload.email ?? '' };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTrustee, setIsTrustee] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.get();
      setProfile({
        id: data.id,
        full_name: data.full_name,
        full_name_ml: data.full_name_ml,
        phone: data.phone,
        address: data.address,
        is_active_member: data.is_active_member,
        member_since: data.member_since,
        created_at: data.created_at,
        facebook: data.facebook,
        instagram: data.instagram,
        role: data.role ?? 'Devotee',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  // On mount: restore session from localStorage
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Validate token with server
        const me = await authApi.me();
        setUser({ id: me.id, email: me.email });
        setIsAdmin(me.profile.isAdmin ?? false);
        setIsTrustee((me.profile.role ?? 'Devotee') === 'Trustee');
        setProfile({
          id: me.id,
          full_name: me.profile.fullName,
          full_name_ml: me.profile.fullNameMl,
          phone: me.profile.phone,
          address: me.profile.address,
          is_active_member: me.profile.isActiveMember,
          member_since: me.profile.memberSince,
          created_at: me.createdAt,
          facebook: me.profile.facebook ?? null,
          instagram: me.profile.instagram ?? null,
          role: me.profile.role ?? 'Devotee',
        });
      } catch {
        // Token is invalid or expired — clear it
        clearToken();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: authUser } = await authApi.login(email, password);
    setToken(token);

    // Decode user from token for immediate use
    const decoded = decodeTokenUser(token);
    setUser(decoded ?? { id: authUser.id, email: authUser.email });

    // Fetch full profile (including isAdmin)
    try {
      const me = await authApi.me();
      setIsAdmin(me.profile.isAdmin ?? false);
      setIsTrustee((me.profile.role ?? 'Devotee') === 'Trustee');
      setProfile({
        id: me.id,
        full_name: me.profile.fullName,
        full_name_ml: me.profile.fullNameMl,
        phone: me.profile.phone,
        address: me.profile.address,
        is_active_member: me.profile.isActiveMember,
        member_since: me.profile.memberSince,
        created_at: me.createdAt,
        facebook: me.profile.facebook ?? null,
        instagram: me.profile.instagram ?? null,
        role: me.profile.role ?? 'Devotee',
      });
    } catch (err) {
      console.error('Profile fetch after login failed:', err);
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string, gender?: string, dob?: string, birthStar?: string, placeOfBirth?: string, role?: string) => {
    const { token, user: authUser } = await authApi.register(email, password, fullName, phone, gender, dob, birthStar, placeOfBirth, role);
    setToken(token);
    const decoded = decodeTokenUser(token);
    setUser(decoded ?? { id: authUser.id, email: authUser.email });
    setIsAdmin(false);
    setIsTrustee(false);
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsTrustee(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, isTrustee, loading, login, register, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
