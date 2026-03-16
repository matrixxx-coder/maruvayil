import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Check, Users, User, Star, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { familyApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { FamilyMember, NAKSHATRAS, RASHIS, RELATIONSHIPS, Relationship } from '../types';
import { BIRTH_STARS, WORLD_CITIES } from '../constants/templeData';
import { toMalayalamDate } from '../utils/malayalamCalendar';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOB_REGEX = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}-\d{4}$/i;

function isoToMmm(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]}-${d}-${y}`;
}

const emptyForm = {
  name: '',
  name_malayalam: '',
  relationship: 'self' as Relationship,
  gender: '',
  birth_date: '',
  birth_star: '',
  place_of_birth: '',
  rashi: '',
  notes: '',
  include_in_pooja: true,
};

const FamilyMembers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isMl = i18n.language === 'ml';

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);

  const filteredCities =
    form.place_of_birth.length >= 3
      ? WORLD_CITIES.filter((c) => c.toLowerCase().includes(form.place_of_birth.toLowerCase())).slice(0, 8)
      : [];

  const mlDate = DOB_REGEX.test(form.birth_date) ? toMalayalamDate(form.birth_date) : null;

  const openDatePicker = () => {
    const el = datePickerRef.current;
    if (!el) return;
    (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.() ?? el.click();
  };

  useEffect(() => {
    if (user) fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    try {
      const data = await familyApi.list();
      setMembers(data as FamilyMember[]);
    } catch (err) {
      console.error('Failed to fetch family members:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (member: FamilyMember) => {
    setForm({
      name: member.name,
      name_malayalam: member.name_malayalam || '',
      relationship: member.relationship,
      gender: (member as FamilyMember & { gender?: string }).gender || '',
      birth_date: member.birth_date || '',
      birth_star: member.birth_star || '',
      place_of_birth: (member as FamilyMember & { place_of_birth?: string }).place_of_birth || '',
      rashi: member.rashi || '',
      notes: member.notes || '',
      include_in_pooja: member.include_in_pooja,
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      if (editingId) {
        await familyApi.update(editingId, {
          name: form.name,
          nameMalayalam: form.name_malayalam || null,
          relationship: form.relationship,
          gender: form.gender || null,
          birthDate: form.birth_date || null,
          birthStar: form.birth_star || null,
          placeOfBirth: form.place_of_birth || null,
          rashi: form.rashi || null,
          notes: form.notes || null,
          includeInPooja: form.include_in_pooja,
        });
        toast.success(t('family.updated_success'));
      } else {
        await familyApi.create({
          name: form.name,
          nameMalayalam: form.name_malayalam || null,
          relationship: form.relationship,
          gender: form.gender || null,
          birthDate: form.birth_date || null,
          birthStar: form.birth_star || null,
          placeOfBirth: form.place_of_birth || null,
          rashi: form.rashi || null,
          notes: form.notes || null,
          includeInPooja: form.include_in_pooja,
        });
        toast.success(t('family.added_success'));
      }

      await fetchMembers();
      closeForm();
    } catch {
      toast.error(t('family.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      await familyApi.delete(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(t('family.deleted_success'));
    } catch {
      toast.error(t('family.error'));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const getNakshatraLabel = (star: string) => {
    const n = NAKSHATRAS.find((x) => x.en === star);
    if (!n) return star;
    return isMl ? n.ml : n.en;
  };

  const getRashiLabel = (rashi: string) => {
    const r = RASHIS.find((x) => x.en === rashi);
    if (!r) return rashi;
    return isMl ? r.ml : r.en;
  };

  const getRelationshipLabel = (rel: string) => {
    const r = RELATIONSHIPS.find((x) => x.value === rel);
    if (!r) return rel;
    return isMl ? r.ml : r.en;
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isMl ? 'font-malayalam' : ''}`}>
              {t('family.title')}
            </h1>
            <p className={`text-teal-200 text-sm mt-1 ${isMl ? 'font-malayalam' : ''}`}>
              {t('family.subtitle')}
            </p>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span className={isMl ? 'font-malayalam' : ''}>{t('family.add_member')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {members.length > 0 && (
          <div className="flex gap-4 mb-6">
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">
                {members.length} {isMl ? 'അംഗങ്ങൾ' : 'Members'}
              </span>
            </div>
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
              <span className="text-sm">🪔</span>
              <span className="text-sm font-medium text-gray-700">
                {members.filter((m) => m.include_in_pooja).length} {isMl ? 'പൂജയിൽ' : 'in Pooja'}
              </span>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && members.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className={`text-xl font-bold text-teal-800 mb-2 ${isMl ? 'font-malayalam' : ''}`}>
              {t('family.no_members')}
            </h3>
            <p className={`text-gray-500 mb-6 ${isMl ? 'font-malayalam' : ''}`}>
              {t('family.no_members_desc')}
            </p>
            <button
              onClick={openAddForm}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors"
            >
              {t('family.add_member')}
            </button>
          </div>
        )}

        {/* Members Grid */}
        {!loading && members.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
              >
                {/* Pooja badge */}
                {member.include_in_pooja && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full border border-gold-200">
                      🪔 Pooja
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pr-16">
                    <p className="font-bold text-teal-800 text-base truncate">{member.name}</p>
                    {member.name_malayalam && (
                      <p className="font-malayalam text-teal-600 text-sm">{member.name_malayalam}</p>
                    )}
                    <span className="inline-block text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full mt-1 capitalize">
                      {getRelationshipLabel(member.relationship)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
                  {member.birth_date && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400 text-xs w-16">DOB:</span>
                      <span>{new Date(member.birth_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {member.birth_star && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400 text-xs w-16">Nakshatra:</span>
                      <span className={isMl ? 'font-malayalam' : ''}>{getNakshatraLabel(member.birth_star)}</span>
                    </div>
                  )}
                  {member.rashi && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400 text-xs w-16">Rashi:</span>
                      <span className={isMl ? 'font-malayalam' : ''}>{getRashiLabel(member.rashi)}</span>
                    </div>
                  )}
                  {member.notes && (
                    <div className="text-gray-500 text-xs mt-1 italic truncate">
                      {member.notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditForm(member)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-teal-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className={isMl ? 'font-malayalam' : ''}>{t('family.edit')}</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(member.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className={isMl ? 'font-malayalam' : ''}>{t('family.delete')}</span>
                  </button>
                </div>

                {/* Confirm Delete */}
                {confirmDelete === member.id && (
                  <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                    <p className={`text-sm text-gray-700 text-center mb-4 font-medium ${isMl ? 'font-malayalam' : ''}`}>
                      {t('family.confirm_delete')}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
                      >
                        {deletingId === member.id ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span className={isMl ? 'font-malayalam' : ''}>{t('common.yes')}</span>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className={isMl ? 'font-malayalam' : ''}>{t('common.no')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className={`text-xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
                {editingId ? t('family.edit_member') : t('family.add_member')}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Full Name */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {t('family.name')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
                    placeholder="Full name"
                  />
                </div>
              </div>

              {/* Full Name Malayalam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-malayalam">
                  {t('family.name_malayalam')}
                </label>
                <input
                  type="text"
                  name="name_malayalam"
                  value={form.name_malayalam}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm font-malayalam"
                  placeholder="മലയാളത്തിൽ"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {t('family.relationship')} *
                </label>
                <select
                  name="relationship"
                  value={form.relationship}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm bg-white"
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {isMl ? rel.ml : rel.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {isMl ? 'ലിംഗം' : 'Gender'}
                </label>
                <div className="flex gap-6">
                  {['Male', 'Female'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={handleChange}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className={`text-sm text-gray-700 ${isMl ? 'font-malayalam' : ''}`}>
                        {isMl ? (g === 'Male' ? 'പുരുഷൻ' : 'സ്ത്രീ') : g}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {isMl ? 'ജനനത്തീയതി' : 'Date of Birth'}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={openDatePicker}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors z-10"
                    tabIndex={-1}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    name="birth_date"
                    value={form.birth_date}
                    readOnly
                    onClick={openDatePicker}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm cursor-pointer"
                    placeholder="MMM-DD-YYYY"
                  />
                  <input
                    ref={datePickerRef}
                    type="date"
                    tabIndex={-1}
                    max={new Date().toISOString().split('T')[0]}
                    className="absolute left-0 top-0 opacity-0 w-full h-full pointer-events-none"
                    onChange={(e) => {
                      if (e.target.value) setForm((f) => ({ ...f, birth_date: isoToMmm(e.target.value) }));
                    }}
                  />
                </div>
                {mlDate && (
                  <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-1.5">കൊല്ലവർഷം</p>
                    <p className="font-malayalam text-teal-800 font-bold text-lg leading-snug">
                      {mlDate.year} {mlDate.monthMl}{' '}
                      <span className="font-sans font-normal text-sm text-teal-600">({mlDate.monthEn})</span>{' '}
                      {mlDate.day}
                    </p>
                  </div>
                )}
              </div>

              {/* Birth Star */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {isMl ? 'ജന്മ നക്ഷത്രം' : 'Birth Star (Nakshatra)'}
                </label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    name="birth_star"
                    value={form.birth_star}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm bg-white appearance-none"
                  >
                    <option value="">{isMl ? 'നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select birth star'}</option>
                    {BIRTH_STARS.map((s) => (
                      <option key={s.en} value={s.en}>{s.ml} ({s.en})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Place of Birth */}
              <div className="relative">
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {isMl ? 'ജന്മസ്ഥലം' : 'Place of Birth'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    name="place_of_birth"
                    value={form.place_of_birth}
                    onChange={handleChange}
                    onFocus={() => form.place_of_birth.length >= 3 && setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm"
                    placeholder={isMl ? 'നഗരം, രാജ്യം' : 'City, Country'}
                  />
                </div>
                {showCitySuggestions && filteredCities.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <li key={city}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm((f) => ({ ...f, place_of_birth: city }));
                            setShowCitySuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                        >
                          {city}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Rashi */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {t('family.rashi')}
                </label>
                <select
                  name="rashi"
                  value={form.rashi}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm bg-white"
                >
                  <option value="">Select Rashi</option>
                  {RASHIS.map((r) => (
                    <option key={r.en} value={r.en}>
                      {isMl ? `${r.ml} (${r.en})` : `${r.en} (${r.ml})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {t('family.notes')} <span className="text-gray-400 font-normal">({t('common.optional')})</span>
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Include in Pooja */}
              <div className="flex items-center gap-3 p-4 bg-gold-50 rounded-xl border border-gold-200">
                <input
                  type="checkbox"
                  id="include_in_pooja"
                  name="include_in_pooja"
                  checked={form.include_in_pooja}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <label
                  htmlFor="include_in_pooja"
                  className={`text-sm font-medium text-gray-700 cursor-pointer ${isMl ? 'font-malayalam' : ''}`}
                >
                  🪔 {t('family.include_in_pooja')}
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span className={isMl ? 'font-malayalam' : ''}>{t('family.save')}</span>
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className={isMl ? 'font-malayalam' : ''}>{t('family.cancel')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMembers;
