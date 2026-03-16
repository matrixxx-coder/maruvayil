import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import toast from 'react-hot-toast';
import { UserPlus, Pencil, Trash2, UserRoundPlus, ChevronUp, ChevronDown, X, Check, Star, MapPin, Phone, AtSign, Calendar, User, Camera } from 'lucide-react';
import { treeApi, TreeMember, TreeMemberInput } from '../../lib/api';
import { BIRTH_STARS, WORLD_CITIES } from '../../constants/templeData';

// ── helpers ───────────────────────────────────────────────────────────────────

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const parts = dob.split('-');
  if (parts.length !== 3) return null;
  const [mon, day, year] = parts;
  const birth = new Date(parseInt(year), MONTHS[mon] ?? 0, parseInt(day));
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

const AVATAR_COLORS = [
  'bg-teal-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600',
  'bg-rose-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-orange-600',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const MONTHS_LIST = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function isoToMmm(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${MONTHS_LIST[parseInt(m, 10) - 1]}-${d}-${y}`;
}

// ── crop helper ───────────────────────────────────────────────────────────────

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.85);
}

// ── form blank ────────────────────────────────────────────────────────────────

const BLANK: TreeMemberInput = {
  full_name: '', full_name_ml: '', gender: '', dob: '', birth_star: '',
  place_of_birth: '', phone: '', email: '', role: 'Devotee', notes: '',
  parent_id: null, photo: null,
};

// ── PhotoCropper ──────────────────────────────────────────────────────────────

interface PhotoCropperProps {
  src: string;
  onDone: (dataUrl: string) => void;
  onCancel: () => void;
}

const PhotoCropper: React.FC<PhotoCropperProps> = ({ src, onDone, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleDone = async () => {
    if (!croppedArea) return;
    const result = await getCroppedImg(src, croppedArea);
    onDone(result);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-gray-800 text-sm">Crop Photo</p>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        {/* Crop area */}
        <div className="relative w-full" style={{ height: 300, background: '#111' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        {/* Zoom slider */}
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="text-xs text-gray-400">Zoom</span>
          <input
            type="range" min={1} max={3} step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-teal-600"
          />
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleDone} className="flex-1 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Use Photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ── AddEditModal ──────────────────────────────────────────────────────────────

interface ModalProps {
  initial: TreeMemberInput;
  title: string;
  saving: boolean;
  onSave: (data: TreeMemberInput) => void;
  onClose: () => void;
}

const AddEditModal: React.FC<ModalProps> = ({ initial, title, saving, onSave, onClose }) => {
  const [form, setForm] = useState<TreeMemberInput>(initial);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCities =
    (form.place_of_birth?.length ?? 0) >= 3
      ? WORLD_CITIES.filter((c) => c.toLowerCase().includes((form.place_of_birth ?? '').toLowerCase())).slice(0, 8)
      : [];

  const set = (field: keyof TreeMemberInput, value: string | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  const openDatePicker = () => {
    (datePickerRef.current as HTMLInputElement & { showPicker?: () => void })?.showPicker?.()
      ?? datePickerRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    onSave(form);
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition';
  const iconInputCls = 'w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition';

  return (
    <>
      {cropSrc && (
        <PhotoCropper
          src={cropSrc}
          onDone={(dataUrl) => { set('photo', dataUrl); setCropSrc(null); }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-teal-800">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Photo upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {form.photo ? (
                  <img src={form.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-2 ring-teal-200 shadow" />
                ) : (
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${avatarColor(form.full_name || '?')} ring-2 ring-white shadow`}>
                    {form.full_name ? getInitials(form.full_name) : <User className="w-8 h-8" />}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow transition-colors"
                  title="Upload photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              {form.photo && (
                <button type="button" onClick={() => set('photo', null)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  Remove photo
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  className={iconInputCls}
                  placeholder="Full name in English"
                  autoFocus
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Gender</label>
              <div className="flex gap-6">
                {['Male', 'Female'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio" name="gender" value={g}
                      checked={form.gender === g}
                      onChange={() => set('gender', g)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className="text-sm text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="tel" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} className={iconInputCls} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} className={iconInputCls} placeholder="email@example.com" />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Date of Birth</label>
              <div className="relative">
                <button type="button" onClick={openDatePicker} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors z-10" tabIndex={-1}>
                  <Calendar className="w-4 h-4" />
                </button>
                <input type="text" value={form.dob ?? ''} readOnly onClick={openDatePicker} className={`${iconInputCls} cursor-pointer`} placeholder="MMM-DD-YYYY" />
                <input
                  ref={datePickerRef} type="date" tabIndex={-1}
                  max={new Date().toISOString().split('T')[0]}
                  className="absolute left-0 top-0 opacity-0 w-full h-full pointer-events-none"
                  onChange={(e) => { if (e.target.value) set('dob', isoToMmm(e.target.value)); }}
                />
                {form.dob && (
                  <button type="button" onClick={() => set('dob', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500" tabIndex={-1}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Birth Star */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Birth Star</label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select value={form.birth_star ?? ''} onChange={(e) => set('birth_star', e.target.value || null)} className={`${iconInputCls} bg-white appearance-none`}>
                  <option value="">Select birth star</option>
                  {BIRTH_STARS.map((s) => <option key={s.en} value={s.en}>{s.ml} ({s.en})</option>)}
                </select>
              </div>
            </div>

            {/* Place of Birth */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Place of Birth</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text" value={form.place_of_birth ?? ''}
                  onChange={(e) => { set('place_of_birth', e.target.value); setShowCitySuggestions(e.target.value.length >= 3); }}
                  onFocus={() => (form.place_of_birth?.length ?? 0) >= 3 && setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                  autoComplete="off" className={iconInputCls} placeholder="City, Country"
                />
              </div>
              {showCitySuggestions && filteredCities.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <li key={city}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { set('place_of_birth', city); setShowCitySuggestions(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800 transition-colors">
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Notes</label>
              <textarea value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Optional notes" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ── MemberCard ────────────────────────────────────────────────────────────────

interface CardProps {
  member: TreeMember;
  onAddChild: () => void;
  onAddParent: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MemberCard: React.FC<CardProps> = ({ member, onAddChild, onAddParent, onEdit, onDelete }) => {
  const age = calcAge(member.dob);
  const initials = getInitials(member.full_name);
  const color = avatarColor(member.full_name);
  const hasParent = !!member.parent_id;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-36 flex flex-col items-center pt-5 pb-3 px-3 gap-2 hover:shadow-md transition-shadow group">
      {/* Photo / Avatar */}
      <div className="relative">
        {member.photo ? (
          <img src={member.photo} alt={member.full_name} className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md" />
        ) : (
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${color} ring-2 ring-white shadow-md`}>
            {initials}
          </div>
        )}
      </div>

      {/* Name + Age */}
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-800 leading-tight">{member.full_name}</p>
        {age !== null && (
          <p className="text-xs text-gray-400 mt-0.5">{age} yrs</p>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="w-full opacity-0 group-hover:opacity-100 transition-opacity space-y-1 mt-1">
        <div className="flex gap-1">
          <button onClick={onAddParent} disabled={hasParent} title={hasParent ? 'Already has a parent' : 'Add parent'}
            className="flex-1 flex items-center justify-center py-1 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={onAddChild} title="Add child"
            className="flex-1 flex items-center justify-center py-1 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={onEdit} title="Edit"
            className="flex-1 flex items-center justify-center py-1 text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={onDelete} title="Delete"
            className="flex-1 flex items-center justify-center py-1 text-red-400 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-1 text-xs text-center">
          <span className="flex-1 text-blue-400">Parent</span>
          <span className="flex-1 text-teal-600">Child</span>
          <span className="flex-1 text-gray-400">Edit</span>
          <span className="flex-1 text-red-400">Del</span>
        </div>
      </div>
    </div>
  );
};

// ── TreeNode (recursive) ──────────────────────────────────────────────────────

interface NodeProps {
  member: TreeMember;
  allMembers: TreeMember[];
  onAddChild: (parentId: string) => void;
  onAddParent: (childId: string) => void;
  onEdit: (member: TreeMember) => void;
  onDelete: (member: TreeMember) => void;
}

const TreeNode: React.FC<NodeProps> = ({ member, allMembers, onAddChild, onAddParent, onEdit, onDelete }) => {
  const children = allMembers
    .filter((m) => m.parent_id === member.id)
    .sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at));

  return (
    <div className="flex flex-col items-center">
      <MemberCard
        member={member}
        onAddChild={() => onAddChild(member.id)}
        onAddParent={() => onAddParent(member.id)}
        onEdit={() => onEdit(member)}
        onDelete={() => onDelete(member)}
      />

      {children.length > 0 && (
        <>
          {/* Stem down */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Children row */}
          <div className="flex items-start">
            {children.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center px-4 relative">
                {/* Horizontal connector */}
                {children.length > 1 && (
                  <div
                    className="absolute top-0 h-px bg-gray-300"
                    style={{
                      left: i === 0 ? '50%' : 0,
                      right: i === children.length - 1 ? '50%' : 0,
                    }}
                  />
                )}
                {/* Stem up */}
                <div className="w-px h-8 bg-gray-300" />
                <TreeNode
                  member={child}
                  allMembers={allMembers}
                  onAddChild={onAddChild}
                  onAddParent={onAddParent}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── FamilyTree page ───────────────────────────────────────────────────────────

type ModalMode =
  | { type: 'add-child'; parentId: string }
  | { type: 'add-parent'; childId: string }
  | { type: 'edit'; member: TreeMember }
  | { type: 'add-root' }
  | null;

const FamilyTree: React.FC = () => {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await treeApi.list();
      setMembers(data);
    } catch {
      toast.error('Failed to load family tree');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const roots = members
    .filter((m) => !m.parent_id)
    .sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at));

  const modalTitle = () => {
    if (!modal) return '';
    if (modal.type === 'add-root') return 'Add Root Member';
    if (modal.type === 'add-child') return 'Add Child Member';
    if (modal.type === 'add-parent') return 'Add Parent Member';
    if (modal.type === 'edit') return `Edit — ${modal.member.full_name}`;
    return '';
  };

  const modalInitial = (): TreeMemberInput => {
    if (!modal) return BLANK;
    if (modal.type === 'edit') {
      const m = modal.member;
      return {
        full_name: m.full_name, full_name_ml: m.full_name_ml,
        gender: m.gender, dob: m.dob, birth_star: m.birth_star,
        place_of_birth: m.place_of_birth, phone: m.phone,
        email: m.email, role: m.role, notes: m.notes,
        parent_id: m.parent_id, photo: m.photo,
      };
    }
    return { ...BLANK };
  };

  const handleSave = async (data: TreeMemberInput) => {
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.type === 'edit') {
        const updated = await treeApi.update(modal.member.id, data);
        setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        toast.success('Member updated');
      } else if (modal.type === 'add-child') {
        const created = await treeApi.create({ ...data, parent_id: modal.parentId });
        setMembers((prev) => [...prev, created]);
        toast.success('Child member added');
      } else if (modal.type === 'add-parent') {
        const newParent = await treeApi.create({ ...data, parent_id: null });
        const updated = await treeApi.update(modal.childId, { parent_id: newParent.id });
        setMembers((prev) => [
          ...prev.map((m) => (m.id === updated.id ? updated : m)),
          newParent,
        ]);
        toast.success('Parent member added');
      } else {
        const created = await treeApi.create({ ...data, parent_id: null });
        setMembers((prev) => [...prev, created]);
        toast.success('Root member added');
      }
      setModal(null);
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TreeMember) => {
    const childCount = members.filter((m) => m.parent_id === member.id).length;
    const msg = childCount > 0
      ? `Delete "${member.full_name}"? Their ${childCount} child${childCount !== 1 ? 'ren' : ''} will become root node${childCount !== 1 ? 's' : ''}. This cannot be undone.`
      : `Delete "${member.full_name}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    try {
      await treeApi.remove(member.id);
      setMembers((prev) =>
        prev.filter((m) => m.id !== member.id)
            .map((m) => (m.parent_id === member.id ? { ...m, parent_id: null } : m))
      );
      toast.success('Member deleted');
    } catch {
      toast.error('Failed to delete member');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-800">Family Tree</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the temple family tree. Hover over a card to add, edit, or delete.
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'add-root' })}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Add Root Member
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-24">Loading...</div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <UserRoundPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No members yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Root Member" to start building the family tree.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 overflow-auto">
          <div className="flex gap-12 items-start min-w-max pb-4">
            {roots.map((root) => (
              <TreeNode
                key={root.id}
                member={root}
                allMembers={members}
                onAddChild={(parentId) => setModal({ type: 'add-child', parentId })}
                onAddParent={(childId) => setModal({ type: 'add-parent', childId })}
                onEdit={(member) => setModal({ type: 'edit', member })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {members.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {members.length} member{members.length !== 1 ? 's' : ''} &middot; {roots.length} root node{roots.length !== 1 ? 's' : ''}
        </p>
      )}

      {modal && (
        <AddEditModal
          title={modalTitle()}
          initial={modalInitial()}
          saving={saving}
          onSave={handleSave}
          onClose={() => !saving && setModal(null)}
        />
      )}
    </div>
  );
};

export default FamilyTree;
