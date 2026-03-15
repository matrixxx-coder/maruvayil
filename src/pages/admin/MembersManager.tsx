import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, AdminMember } from '../../lib/api';
import { UserCheck, UserX } from 'lucide-react';

const MembersManager: React.FC = () => {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getMembers();
        setMembers(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = async (member: AdminMember) => {
    setTogglingId(member.id);
    try {
      const result = await adminApi.toggleMemberActive(member.id);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, is_active_member: result.is_active_member } : m
        )
      );
      toast.success(
        result.is_active_member ? 'Member marked active' : 'Member marked inactive'
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update member status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-teal-800">Members</h1>
        <p className="text-gray-500 text-sm mt-1">
          View all registered members and manage their active membership status.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading...</div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          No registered members yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Member Since
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-teal-800 text-sm">
                        {member.full_name ?? (
                          <span className="text-gray-400 italic">No name</span>
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{member.phone ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-500">
                        {member.member_since
                          ? new Date(member.member_since).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          member.is_active_member
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {member.is_active_member ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggle(member)}
                        disabled={togglingId === member.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                          member.is_active_member
                            ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {togglingId === member.id
                          ? 'Updating...'
                          : member.is_active_member
                          ? 'Mark Inactive'
                          : 'Mark Active'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            {members.length} member{members.length !== 1 ? 's' : ''} registered
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersManager;
