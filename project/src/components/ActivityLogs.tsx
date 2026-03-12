import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Activity, Filter, Clock } from 'lucide-react';
import type { Database } from '../types/database';

type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

export function ActivityLogs() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterEntity, setFilterEntity] = useState<string>('');
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [entityOptions, setEntityOptions] = useState<string[]>([]);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filterAction, filterEntity]);

  const loadActivityLogs = async () => {
    try {
      setError(null);
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (profile?.role !== 'Admin') {
        query = query.eq('user_id', profile?.id);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setLogs(data || []);

      const actions = [...new Set((data || []).map(log => log.action))];
      const entities = [...new Set((data || []).map(log => log.entity_type || ''))];
      setActionOptions(actions.sort());
      setEntityOptions(entities.filter(e => e).sort());
    } catch (err) {
      console.error('Error loading activity logs:', err);
      setError(t('noActivityLogsFound'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    if (filterEntity) {
      filtered = filtered.filter(log => log.entity_type === filterEntity);
    }

    setFilteredLogs(filtered);
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CREATE': t('created'),
      'UPDATE': t('updated'),
      'DELETE': t('deleted'),
      'VIEW': t('viewed'),
      'UPDATE_USER_ROLE': t('roleChanged'),
      'LOGIN': t('login'),
      'LOGOUT': t('logout'),
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('LOGIN')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Activity className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">{t('activityLogsTitle')}</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-gray-700">{t('filters')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('action')}
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allActions')}</option>
              {actionOptions.map(action => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('entityType')}
            </label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allTypes')}</option>
              {entityOptions.map(entity => (
                <option key={entity} value={entity}>
                  {entity || t('other')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('action')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('entity')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('details')}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.entity_type || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <span className="text-xs text-gray-500">
                        {Object.entries(log.details).slice(0, 2).map(([k, v]) => (
                          `${k}: ${JSON.stringify(v)}`
                        )).join(', ')}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noActivityLogsFound')}</p>
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
