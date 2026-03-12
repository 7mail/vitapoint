import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, CreditCard as Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import type { Database } from '../types/database';
import { useLanguage } from '../contexts/LanguageContext';

type Product = Database['public']['Tables']['products']['Row'];

export function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(t('deleteProductConfirm'))) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(t('failedToDeleteProduct'));
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter((p) => p.stock < p.min_stock_level);

  if (showForm || editingProduct) {
    return (
      <ProductForm
        product={editingProduct}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
          loadProducts();
        }}
      />
    );
  }

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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('products')}</h1>
          <p className="text-gray-600 mt-1">{t('manageProducts')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addProduct')}</span>
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">{t('lowStockAlert')}</h3>
              <p className="text-sm text-red-800">
                {lowStockProducts.length} {t('product')}{lowStockProducts.length !== 1 ? 's' : ''} {t('belowMinimumStock')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchProducts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noProductsFound')}</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? t('tryAdjustingSearch') : t('addFirstProduct')}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>{t('addProduct')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('productName')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('sku')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('brand')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('category')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('price')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('stock')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock < product.min_stock_level;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.brand}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                          {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="text-xs text-gray-500">{t('min')}: {product.min_stock_level}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || '',
    sku: product?.sku || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    min_stock_level: product?.min_stock_level || 10,
    description: product?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(formData);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(t('failedToSaveProduct'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {product ? t('editProduct') : t('newProduct')}
          </h1>
          <p className="text-gray-600 mt-1">
            {product ? t('updateProductDetails') : t('addNewProductToCatalog')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          {t('cancel')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('productNameRequired')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder={t('productNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('brandRequired')}</label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder={t('brandPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('categoryRequired')}</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder={t('categoryPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('skuRequired')}</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder={t('skuPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('priceRequired')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('stockQuantityRequired')}</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('minStockLevelRequired')}
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.min_stock_level}
              onChange={(e) =>
                setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="10"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder={t('productDescription')}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {loading ? t('saving') : product ? t('updateProduct') : t('addProduct')}
          </button>
        </div>
      </form>
    </div>
  );
}
