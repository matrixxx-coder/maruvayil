import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, CommitteeMember } from '../../lib/api';
import { Plus, Trash2, Save } from 'lucide-react';

interface MemberState extends CommitteeMember {
  saving: boolean;
  dirty: boolean;
}

const CommitteeEditor: React.FC = () => {
  const [members, setMembers] = useState<MemberState[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role_en: '',
    role_ml: '',
    display_order: 0,
  });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await adminApi.getCommittee();
      setMembers(data.map((m) => ({ ...m, saving: false, dirty: false })));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load committee members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (id: string, field: keyof CommitteeMember, value: string | number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value, dirty: true } : m))
    );
  };

  const handleSave = async (member: MemberState) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, saving: true } : m)));
    try {
      await adminApi.updateCommitteeMember(member.id, {
        name: member.name,
        role_en: member.role_en,
        role_ml: member.role_ml,
        display_order: member.display_order,
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, saving: false, dirty: false } : m))
      );
      toast.success('Member saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save member');
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, saving: false } : m)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this committee member?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteCommitteeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success('Member removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove member');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.role_en.trim()) {
      toast.error('Name and English role are required');
      return;
    }
    setCreating(true);
    try {
      const created = await adminApi.createCommitteeMember(newMember);
      setMembers((prev) => [...prev, { ...(created as CommitteeMember), saving: false, dirty: false }]);
      setNewMember({ name: '', role_en: '', role_ml: '', display_order: 0 });
      setAddingNew(false);
      toast.success('Member added');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add member');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-800">Committee Members</h1>
          <p className="text-gray-500 text-sm mt-1">
            Edit member details inline. Use display order to control the sequence.
          </p>
        </div>
        {!addingNew && (
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Add new member form */}
      {addingNew && (
        <form
          onSubmit={handleCreate}
          className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-6"
        >
          <p className="text-sm font-semibold text-teal-800 mb-4">New Committee Member</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Role (English) *
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newMember.role_en}
                onChange={(e) => setNewMember({ ...newMember, role_en: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Role (Malayalam)
              </label>
              <input
                type="text"
                className="font-malayalam w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newMember.role_ml}
                onChange={(e) => setNewMember({ ...newMember, role_ml: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Order
              </label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newMember.display_order}
                onChange={(e) =>
                  setNewMember({ ...newMember, display_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {creating ? 'Adding...' : 'Add Member'}
            </button>
            <button
              type="button"
              onClick={() => setAddingNew(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading...</div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          No committee members. Add one above.
        </div>
      ) : (
        <div className="space-y-3">
          {members
            .slice()
            .sort((a, b) => a.display_order - b.display_order)
            .map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={member.name}
                      onChange={(e) => handleChange(member.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Role (English)
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={member.role_en}
                      onChange={(e) => handleChange(member.id, 'role_en', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Role (Malayalam)
                    </label>
                    <input
                      type="text"
                      className="font-malayalam w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={member.role_ml}
                      onChange={(e) => handleChange(member.id, 'role_ml', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                      Order
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={member.display_order}
                      onChange={(e) =>
                        handleChange(member.id, 'display_order', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleSave(member)}
                      disabled={member.saving || !member.dirty}
                      className="flex items-center gap-1.5 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      title="Save"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {member.saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      disabled={deletingId === member.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
    </div>
  );
};

export default CommitteeEditor;
