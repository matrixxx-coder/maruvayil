import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Star, Calendar, ArrowRight, CheckCircle, XCircle, Pencil, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { familyApi, profileApi } from '../lib/api';
import { FamilyMember } from '../types';

// Simple inline SVG brand icons
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="url(#ig-grad)">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433"/>
        <stop offset="25%" stopColor="#e6683c"/>
        <stop offset="50%" stopColor="#dc2743"/>
        <stop offset="75%" stopColor="#cc2366"/>
        <stop offset="100%" stopColor="#bc1888"/>
      </linearGradient>
    </defs>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const isMl = i18n.language === 'ml';

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialForm, setSocialForm] = useState({ facebook: '', instagram: '' });
  const [savingSocial, setSavingSocial] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFamilyMembers();
    }
  }, [user]);

  const fetchFamilyMembers = async () => {
    try {
      const data = await familyApi.list();
      setFamilyMembers(data as FamilyMember[]);
    } catch (err) {
      console.error('Failed to fetch family members:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditSocial = () => {
    setSocialForm({
      facebook: profile?.facebook ?? '',
      instagram: profile?.instagram ?? '',
    });
    setEditingSocial(true);
  };

  const saveSocial = async () => {
    setSavingSocial(true);
    try {
      await profileApi.update({
        facebook: socialForm.facebook.trim() || '',
        instagram: socialForm.instagram.trim() || '',
      });
      await refreshProfile();
      setEditingSocial(false);
      toast.success('Social profiles updated');
    } catch {
      toast.error('Failed to save social profiles');
    } finally {
      setSavingSocial(false);
    }
  };

  const poojaCount = familyMembers.filter((m) => m.include_in_pooja).length;
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Devotee';

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">🙏</span>
            </div>
            <div>
              <p className={`text-teal-200 text-sm ${isMl ? 'font-malayalam' : ''}`}>
                {t('dashboard.welcome')}
              </p>
              <h1 className="text-2xl font-bold text-white">
                {displayName}
              </h1>
              <p className="text-teal-300 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Membership Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              {profile?.is_active_member ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <p className={`text-xs font-medium text-gray-500 uppercase tracking-wider ${isMl ? 'font-malayalam' : ''}`}>
                {t('dashboard.membership_status')}
              </p>
            </div>
            <p className={`font-bold ${profile?.is_active_member ? 'text-green-600' : 'text-gray-500'}`}>
              {profile?.is_active_member
                ? t('dashboard.active_member')
                : t('dashboard.inactive_member')}
            </p>
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              <p className={`text-xs font-medium text-gray-500 uppercase tracking-wider ${isMl ? 'font-malayalam' : ''}`}>
                {t('dashboard.member_since')}
              </p>
            </div>
            <p className="font-bold text-teal-800">
              {profile?.member_since
                ? new Date(profile.member_since).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                  })
                : new Date().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                  })}
            </p>
          </div>

          {/* Family Count */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <p className={`text-xs font-medium text-gray-500 uppercase tracking-wider ${isMl ? 'font-malayalam' : ''}`}>
                {t('dashboard.family_count')}
              </p>
            </div>
            <p className="font-bold text-3xl text-blue-600">
              {loading ? '—' : familyMembers.length}
            </p>
          </div>

          {/* In Pooja */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-gold-500" />
              <p className={`text-xs font-medium text-gray-500 uppercase tracking-wider ${isMl ? 'font-malayalam' : ''}`}>
                {t('dashboard.pooja_members')}
              </p>
            </div>
            <p className="font-bold text-3xl text-gold-600">
              {loading ? '—' : poojaCount}
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Family Members Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
                {t('nav.family')}
              </h2>
              <Link
                to="/dashboard/family"
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
              >
                {t('dashboard.manage_family')}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : familyMembers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
                <p className={`text-gray-500 text-sm ${isMl ? 'font-malayalam' : ''}`}>
                  {t('family.no_members')}
                </p>
                <Link
                  to="/dashboard/family"
                  className="inline-block mt-4 px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
                >
                  {t('family.add_member')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {familyMembers.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{member.name}</p>
                      <p className={`text-xs text-gray-500 capitalize ${isMl ? 'font-malayalam' : ''}`}>
                        {member.relationship}
                        {member.birth_star && ` · ${member.birth_star}`}
                      </p>
                    </div>
                    {member.include_in_pooja && (
                      <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full border border-gold-200 flex-shrink-0">
                        Pooja
                      </span>
                    )}
                  </div>
                ))}
                {familyMembers.length > 5 && (
                  <p className="text-sm text-center text-gray-400 pt-1">
                    +{familyMembers.length - 5} more members
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            {/* Monthly Pooja Info */}
            <div className="bg-gradient-to-br from-maroon-700 to-maroon-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🪔</span>
                <h3 className={`font-bold text-lg ${isMl ? 'font-malayalam' : ''}`}>
                  {t('home.monthly_pooja_title')}
                </h3>
              </div>
              <p className={`text-maroon-200 text-sm mb-3 ${isMl ? 'font-malayalam' : ''}`}>
                {t('home.monthly_pooja_desc')}
              </p>
              <p className="text-2xl font-bold text-gold-400 mb-4">₹1,000 / month</p>
              <Link
                to="/pooja"
                className="inline-flex items-center gap-2 text-sm font-medium text-maroon-200 hover:text-white transition-colors"
              >
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Profile settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-teal-800 mb-4">Account Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-700 font-medium truncate ml-4">{user?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="text-gray-700 font-medium">{profile.phone}</span>
                  </div>
                )}
                {profile?.full_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="text-gray-700 font-medium">{profile.full_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Profiles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-teal-800">Social Profiles</h3>
                {!editingSocial ? (
                  <button
                    onClick={startEditSocial}
                    className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveSocial}
                      disabled={savingSocial}
                      className="flex items-center gap-1 text-sm text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded-lg font-medium disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSocial(false)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {editingSocial ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FacebookIcon />
                    <div className="flex-1 flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                      <span className="px-2 text-xs text-gray-400 whitespace-nowrap">facebook.com/</span>
                      <input
                        type="text"
                        value={socialForm.facebook}
                        onChange={(e) => setSocialForm((f) => ({ ...f, facebook: e.target.value }))}
                        placeholder="username"
                        className="flex-1 py-2 pr-3 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <InstagramIcon />
                    <div className="flex-1 flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                      <span className="px-2 text-xs text-gray-400 whitespace-nowrap">instagram.com/</span>
                      <input
                        type="text"
                        value={socialForm.instagram}
                        onChange={(e) => setSocialForm((f) => ({ ...f, instagram: e.target.value }))}
                        placeholder="username"
                        className="flex-1 py-2 pr-3 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile?.facebook ? (
                    <a
                      href={`https://facebook.com/${profile.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <FacebookIcon />
                      {profile.facebook}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <FacebookIcon />
                      <span>Not added</span>
                    </div>
                  )}
                  {profile?.instagram ? (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-pink-600 hover:text-pink-700 font-medium"
                    >
                      <InstagramIcon />
                      {profile.instagram}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <InstagramIcon />
                      <span>Not added</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
