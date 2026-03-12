import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { History, Filter, Shield } from 'lucide-react';
import type { Database } from '../types/database';

type AuditTrail = Database['public']['Tables']['audit_trail']['Row'];

export function AuditTrail() {
  const { profile: currentProfile } = useAuth();
  const { t } = useLanguage();
  const [trails, setTrails] = useState<AuditTrail[]>([]);
  const [filteredTrails, setFilteredTrails] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTable, setFilterTable] = useState<string>('');
  const [filterOperation, setFilterOperation] = useState<string>('');
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [operationOptions, setOperationOptions] = useState<string[]>([]);

  useEffect(() => {
    loadAuditTrail();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trails, filterTable, filterOperation]);

  const loadAuditTrail = async () => {
    try {
      setError(null);

      if (currentProfile?.role !== 'Admin') {
        setError(t('onlyAdministratorsAudit'));
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from('audit_trail')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (err) throw err;
      setTrails(data || []);

      const tables = [...new Set((data || []).map(trail => trail.table_name))];
      const operations = [...new Set((data || []).map(trail => trail.operation))];
      setTableOptions(tables.sort());
      setOperationOptions(operations.sort());
    } catch (err) {
      console.error('Error loading audit trail:', err);
      setError(t('noAuditEntriesFound'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = trails;

    if (filterTable) {
      filtered = filtered.filter(trail => trail.table_name === filterTable);
    }

    if (filterOperation) {
      filtered = filtered.filter(trail => trail.operation === filterOperation);
    }

    setFilteredTrails(filtered);
  };

  const getOperationColor = (operation: string) => {
    if (operation === 'INSERT') return 'bg-green-100 text-green-800';
    if (operation === 'UPDATE') return 'bg-blue-100 text-blue-800';
    if (operation === 'DELETE') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const renderChange = (oldVal: unknown, newVal: unknown) => {
    if (oldVal === newVal) return null;

    return (
      <div className="text-xs space-y-1">
        {oldVal !== undefined && oldVal !== null && (
          <div className="text-red-600">
            <span className="font-semibold">{t('before')}:</span> {JSON.stringify(oldVal)}
          </div>
        )}
        {newVal !== undefined && newVal !== null && (
          <div className="text-green-600">
            <span className="font-semibold">{t('after')}:</span> {JSON.stringify(newVal)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentProfile?.role !== 'Admin') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <Shield className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900">{t('accessDenied')}</h3>
        <p className="text-red-700 mt-2">{t('onlyAdministratorsAudit')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <History className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">{t('auditTrail')}</h2>
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
              {t('table')}
            </label>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allTables')}</option>
              {tableOptions.map(table => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('operation')}
            </label>
            <select
              value={filterOperation}
              onChange={(e) => setFilterOperation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allOperations')}</option>
              {operationOptions.map(op => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTrails.map((trail) => (
          <div key={trail.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
              <div className="flex items-start space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOperationColor(trail.operation)}`}>
                  {trail.operation}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{trail.table_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(trail.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {trail.old_values || trail.new_values ? (
              <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                {trail.new_values && trail.old_values ? (
                  Object.entries(trail.new_values).map(([key, newVal]) => {
                    const oldVal = (trail.old_values as Record<string, unknown>)?.[key];
                    if (oldVal !== newVal) {
                      return (
                        <div key={key} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                          <p className="font-semibold text-gray-700 mb-1">{key}</p>
                          {renderChange(oldVal, newVal)}
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <div className="text-gray-600">
                    {trail.new_values && (
                      <div>
                        <p className="font-semibold text-green-700 mb-1">{t('newValues')}:</p>
                        <pre className="text-xs bg-white p-2 rounded border border-gray-300 overflow-auto">
                          {JSON.stringify(trail.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    {trail.old_values && (
                      <div>
                        <p className="font-semibold text-red-700 mb-1">{t('oldValues')}:</p>
                        <pre className="text-xs bg-white p-2 rounded border border-gray-300 overflow-auto">
                          {JSON.stringify(trail.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('noChangesRecorded')}</p>
            )}
          </div>
        ))}

        {filteredTrails.length === 0 && (
          <div className="p-8 bg-white rounded-lg text-center border border-gray-200">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noAuditEntriesFound')}</p>
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
