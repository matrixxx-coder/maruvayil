import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Star, Calendar, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { familyApi } from '../lib/api';
import { FamilyMember } from '../types';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const isMl = i18n.language === 'ml';

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
