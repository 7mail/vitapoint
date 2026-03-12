import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Search, CreditCard as Edit2, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import type { Database } from '../types/database';

type Order = Database['public']['Tables']['orders']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm(t('deleteOrderConfirm'))) return;

    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(t('failedToDeleteOrder'));
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Processing: 'bg-blue-100 text-blue-800 border-blue-200',
      Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      Delivered: 'bg-green-100 text-green-800 border-green-200',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.Pending;
  };

  const getPaymentColor = (status: string) => {
    const colors = {
      Unpaid: 'bg-red-100 text-red-800',
      Paid: 'bg-green-100 text-green-800',
      Refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.Unpaid;
  };

  const getStatusTranslation = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: 'pending',
      Processing: 'processing',
      Shipped: 'shipped',
      Delivered: 'delivered',
      Cancelled: 'cancelled',
    };
    return t(statusMap[status] || 'pending');
  };

  const getPaymentStatusTranslation = (status: string) => {
    const paymentMap: { [key: string]: string } = {
      Unpaid: 'unpaid',
      Paid: 'paid',
      Refunded: 'refunded',
    };
    return t(paymentMap[status] || 'unpaid');
  };

  if (showForm || editingOrder) {
    return (
      <OrderForm
        order={editingOrder}
        onClose={() => {
          setShowForm(false);
          setEditingOrder(null);
          loadOrders();
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('orders')}</h1>
          <p className="text-gray-600 mt-1">{t('manageCustomerOrders')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>{t('newOrder')}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchOrders')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noOrdersFound')}</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? t('tryAdjustingSearch') : t('createNewCustomerOrder')}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>{t('createOrder')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.customer_name}
                      </h3>
                      <p className="text-sm text-gray-600">{t('orderNumber')} #{order.order_number}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusTranslation(order.status)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(
                          order.payment_status
                        )}`}
                      >
                        {getPaymentStatusTranslation(order.payment_status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t('total')}:</span>{' '}
                      <span className="font-semibold text-gray-900">${order.total_amount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('date')}:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-sm text-gray-600 italic">{order.notes}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingOrder(order)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderForm({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customer_name: order?.customer_name || '',
    total_amount: order?.total_amount || 0,
    status: order?.status || 'Pending',
    payment_status: order?.payment_status || 'Unpaid',
    notes: order?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (order) {
        const { error } = await supabase
          .from('orders')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        if (error) throw error;
      } else {
        const orderNumber = await generateOrderNumber();
        const { error } = await supabase.from('orders').insert({
          ...formData,
          order_number: orderNumber,
          created_by: user?.id,
        });

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
      setError(t('failedToSaveOrder'));
    } finally {
      setLoading(false);
    }
  };

  const generateOrderNumber = async () => {
    const { data } = await supabase.rpc('generate_order_number');
    return data || `ORD${Date.now()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {order ? t('editOrder') : t('newOrder')}
          </h1>
          <p className="text-gray-600 mt-1">
            {order ? t('updateOrderDetails') : t('createNewCustomerOrder')}
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
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customerNameRequired')}
            </label>
            <input
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder={t('customerName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('totalAmountRequired')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('statusRequired')}</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="Pending">{t('pending')}</option>
              <option value="Processing">{t('processing')}</option>
              <option value="Shipped">{t('shipped')}</option>
              <option value="Delivered">{t('delivered')}</option>
              <option value="Cancelled">{t('cancelled')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('paymentStatusRequired')}</label>
            <select
              required
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="Unpaid">{t('unpaid')}</option>
              <option value="Paid">{t('paid')}</option>
              <option value="Refunded">{t('refunded')}</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('notes')}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder={t('orderNotes')}
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
            {loading ? t('saving') : order ? t('updateOrder') : t('createOrder')}
          </button>
        </div>
      </form>
    </div>
  );
}
