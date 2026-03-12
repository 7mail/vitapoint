import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Search,
  AlertTriangle,
  Package,
  TrendingUp,
  Activity,
} from 'lucide-react';
import type { Database } from '../types/database';
import { useLanguage } from '../contexts/LanguageContext';

type Product = Database['public']['Tables']['products']['Row'];
type InventoryLog = Database['public']['Tables']['inventory_logs']['Row'];

export function Inventory() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'in_stock'>('all');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const [productsResult, logsResult] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase
          .from('inventory_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (logsResult.error) throw logsResult.error;

      setProducts(productsResult.data || []);
      setLogs(logsResult.data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => {
      if (filterType === 'low_stock') return product.stock < product.min_stock_level;
      if (filterType === 'in_stock') return product.stock >= product.min_stock_level;
      return true;
    });

  const lowStockItems = products.filter((p) => p.stock < p.min_stock_level);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('inventoryManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('trackAndMonitorStock')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalProducts')}</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalStockUnits')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalStockUnits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{t('lowStockItems')}</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">{t('lowStockAlert')}</h3>
              <p className="text-sm text-red-800">
                {lowStockItems.length} {t('product')}{lowStockItems.length !== 1 ? 's' : ''} {t('belowMinimumStock')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchInventory')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('allProducts')}
          </button>
          <button
            onClick={() => setFilterType('low_stock')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'low_stock'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('lowStock')} ({lowStockItems.length})
          </button>
          <button
            onClick={() => setFilterType('in_stock')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterType === 'in_stock'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('inStock')}
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noProductsFound')}</h3>
          <p className="text-gray-600">
            {searchTerm
              ? t('tryAdjustingSearch')
              : t('noMatchingFilter')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock < product.min_stock_level;
            const stockPercentage = (product.stock / product.min_stock_level) * 100;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition ${
                  isLowStock ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">SKU: {product.sku}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  </div>
                  {isLowStock && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('price')}:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">{t('stockLevel')}</span>
                      <span
                        className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}
                      >
                        {product.stock} {t('units')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isLowStock ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('minLevel')}: {product.min_stock_level}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('stockValue')}:</span>
                      <span className="font-semibold text-gray-900">
                        ${(product.price * product.stock).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {logs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">{t('recentInventoryActivity')}</h2>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {logs.map((log) => {
              const product = products.find((p) => p.id === log.product_id);
              return (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {product?.name || t('unknownProductText')}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {log.change_type === 'IN' && t('stockAdded')}
                        {log.change_type === 'OUT' && t('stockRemoved')}
                        {log.change_type === 'ADJUSTMENT' && t('stockAdjusted')}
                      </p>
                      {log.reason && (
                        <p className="text-xs text-gray-500 mt-1 italic">{log.reason}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        log.change_type === 'IN'
                          ? 'text-green-600'
                          : log.change_type === 'OUT'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {log.change_type === 'IN' && '+'}
                      {log.change_type === 'OUT' && '-'}
                      {log.quantity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('inventorySummary')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-100">{t('totalProducts')}</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div>
                <p className="text-blue-100">{t('totalUnits')}</p>
                <p className="text-2xl font-bold">{totalStockUnits}</p>
              </div>
              <div>
                <p className="text-blue-100">{t('stockValue')}</p>
                <p className="text-2xl font-bold">${totalInventoryValue.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-blue-100">{t('lowStock')}</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-100">{t('inventoryUpdatedRealTime')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
