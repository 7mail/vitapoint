import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Users, CreditCard as Edit2, Save, X, Shield } from 'lucide-react';
import type { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function UserManagement() {
  const { profile: currentProfile } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<'Admin' | 'Sales' | 'Warehouse' | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError(null);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(t('failedToSaveRole'));
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user: Profile) => {
    setEditingId(user.id);
    setEditedRole(user.role);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedRole(null);
  };

  const saveRole = async (userId: string) => {
    if (!editedRole) return;

    try {
      setSaving(true);
      setError(null);

      const { error: err } = await supabase
        .from('profiles')
        .update({ role: editedRole })
        .eq('id', userId);

      if (err) throw err;

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: editedRole } : u
      ));

      await logActivity('UPDATE_USER_ROLE', 'profiles', userId, {
        new_role: editedRole,
      });

      setEditingId(null);
      setEditedRole(null);
    } catch (err) {
      console.error('Error saving role:', err);
      setError(t('failedToSaveRole'));
    } finally {
      setSaving(false);
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, unknown>
  ) => {
    try {
      await supabase.from('activity_logs').insert({
        user_id: currentProfile?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  if (!currentProfile || currentProfile.role !== 'Admin') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <Shield className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900">{t('accessDenied')}</h3>
        <p className="text-red-700 mt-2">{t('onlyAdministrators')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Users className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">{t('userManagement')}</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('name')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('email')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('role')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('joined')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.full_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === user.id ? (
                      <select
                        value={editedRole || user.role}
                        onChange={(e) => setEditedRole(e.target.value as 'Admin' | 'Sales' | 'Warehouse')}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="Admin">{t('admin')}</option>
                        <option value="Sales">{t('sales')}</option>
                        <option value="Warehouse">{t('warehouse')}</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'Sales'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === user.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => saveRole(user.id)}
                          disabled={saving}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>{t('save')}</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                          <span>{t('cancel')}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(user)}
                        className="flex items-center space-x-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>{t('edit')}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noUsersFound')}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        <a
          href="https://www.autopilotai.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 hover:underline transition"
        >
          {t('poweredBy')}
        </a>
      </div>
    </div>
  );
}
