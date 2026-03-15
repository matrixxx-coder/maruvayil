import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, Announcement } from '../../lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface FormData {
  title_en: string;
  title_ml: string;
  body_en: string;
  body_ml: string;
  is_active: boolean;
  display_order: number;
}

const emptyForm = (): FormData => ({
  title_en: '',
  title_ml: '',
  body_en: '',
  body_ml: '',
  is_active: true,
  display_order: 0,
});

const AnnouncementsEditor: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setForm({
      title_en: ann.title_en,
      title_ml: ann.title_ml,
      body_en: ann.body_en,
      body_ml: ann.body_ml,
      is_active: ann.is_active,
      display_order: ann.display_order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en.trim() || !form.body_en.trim()) {
      toast.error('English title and body are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await adminApi.updateAnnouncement(editingId, form);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingId ? (updated as Announcement) : a))
        );
        toast.success('Announcement updated');
      } else {
        const created = await adminApi.createAnnouncement(form);
        setAnnouncements((prev) => [...prev, created as Announcement]);
        toast.success('Announcement created');
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (ann: Announcement) => {
    try {
      const updated = await adminApi.updateAnnouncement(ann.id, { is_active: !ann.is_active });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? (updated as Announcement) : a))
      );
      toast.success(ann.is_active ? 'Deactivated' : 'Activated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success('Announcement deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete announcement');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-800">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage announcements displayed on the home page.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          No announcements yet. Click "New Announcement" to add one.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ann.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {ann.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">Order: {ann.display_order}</span>
                  </div>
                  <p className="font-semibold text-teal-800 truncate">{ann.title_en}</p>
                  {ann.title_ml && (
                    <p className="font-malayalam text-teal-600 text-sm">{ann.title_ml}</p>
                  )}
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{ann.body_en}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle active */}
                  <button
                    onClick={() => handleToggleActive(ann)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      ann.is_active
                        ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {ann.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEdit(ann)}
                    className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    disabled={deletingId === ann.id}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-teal-800">
                {editingId ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Title (Malayalam)
                  </label>
                  <input
                    type="text"
                    className="font-malayalam w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={form.title_ml}
                    onChange={(e) => setForm({ ...form, title_ml: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Body (English) *
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[80px]"
                  value={form.body_en}
                  onChange={(e) => setForm({ ...form, body_en: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Body (Malayalam)
                </label>
                <textarea
                  className="font-malayalam w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[80px]"
                  value={form.body_ml}
                  onChange={(e) => setForm({ ...form, body_ml: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsEditor;
