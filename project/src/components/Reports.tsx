import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import type { Database } from '../types/database';
import { useLanguage } from '../contexts/LanguageContext';

type Order = Database['public']['Tables']['orders']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type InventoryLog = Database['public']['Tables']['inventory_logs']['Row'];

interface MonthlyData {
  month: string;
  sales: number;
  revenue: number;
}

interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface InventoryTrendData {
  date: string;
  in: number;
  out: number;
}

export function Reports() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([]);
  const [inventoryTrends, setInventoryTrends] = useState<InventoryTrendData[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const [ordersResult, productsResult, logsResult] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: true }),
        supabase.from('products').select('*'),
        supabase.from('inventory_logs').select('*').order('created_at', { ascending: true }),
      ]);

      if (ordersResult.data) {
        setOrders(ordersResult.data);
        processMonthlyData(ordersResult.data);
        processOrderStatusData(ordersResult.data);
      }

      if (productsResult.data) {
        setProducts(productsResult.data);
        const lowStock = productsResult.data.filter(
          (p) => p.stock < p.min_stock_level
        );
        setLowStockItems(lowStock);
      }

      if (logsResult.data) {
        setInventoryLogs(logsResult.data);
        processInventoryTrends(logsResult.data);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (orders: Order[]) => {
    const monthlyMap = new Map<string, { sales: number; revenue: number }>();

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { sales: 0, revenue: 0 });
      }

      const data = monthlyMap.get(monthKey)!;
      data.sales += 1;
      data.revenue += Number(order.total_amount);
    });

    const sortedData = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          sales: value.sales,
          revenue: Math.round(value.revenue),
        };
      });

    setMonthlyData(sortedData);
  };

  const processOrderStatusData = (orders: Order[]) => {
    const statusCount = new Map<string, number>();
    const total = orders.length;

    orders.forEach((order) => {
      const count = statusCount.get(order.status) || 0;
      statusCount.set(order.status, count + 1);
    });

    const data = Array.from(statusCount.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    setOrderStatusData(data);
  };

  const processInventoryTrends = (logs: InventoryLog[]) => {
    const dailyMap = new Map<string, { in: number; out: number }>();

    logs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { in: 0, out: 0 });
      }

      const data = dailyMap.get(date)!;
      if (log.change_type === 'IN') {
        data.in += log.quantity;
      } else if (log.change_type === 'OUT') {
        data.out += log.quantity;
      }
    });

    const sortedData = Array.from(dailyMap.entries())
      .slice(-14)
      .map(([date, value]) => ({
        date,
        in: value.in,
        out: value.out,
      }));

    setInventoryTrends(sortedData);
  };

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const processingOrders = orders.filter((o) => o.status === 'Processing').length;
  const fulfillmentRate =
    totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockPercentage =
    products.length > 0 ? Math.round((lowStockItems.length / products.length) * 100) : 0;

  const statusColors: { [key: string]: string } = {
    Pending: '#EAB308',
    Processing: '#3B82F6',
    Shipped: '#8B5CF6',
    Delivered: '#10B981',
    Cancelled: '#6B7280',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('reportsAndAnalytics')}</h1>
        <p className="text-gray-600 mt-1">{t('comprehensiveInsights')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{totalOrders}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">{t('totalOrdersText')}</p>
          <p className="text-xs text-gray-500 mt-1">{deliveredOrders} {t('deliveredText')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toFixed(0)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">{t('totalRevenueText')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('allTimeSalesText')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{processingOrders}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">{t('processingText')}</p>
          <p className="text-xs text-gray-500 mt-1">{pendingOrders} {t('pendingText')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{lowStockItems.length}</span>
          </div>
          <p className="text-sm font-medium text-gray-600">{t('lowStockItemsText')}</p>
          <p className="text-xs text-gray-500 mt-1">{lowStockPercentage}% {t('ofInventoryText')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t('salesRevenue')}</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="sales" fill="#3B82F6" name="Orders" radius={[8, 8, 0, 0]} />
              <Bar
                dataKey="revenue"
                fill="#10B981"
                name="Revenue ($)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-4 text-center">
            {t('lastSixMonthsText')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t('orderStatusText')}</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.status} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColors[item.status] }}
                />
                <span className="text-xs text-gray-600">
                  {item.status}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{t('inventoryMovementText')}</h2>
          <Package className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={inventoryTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line
              type="monotone"
              dataKey="in"
              stroke="#10B981"
              strokeWidth={2}
              name="Stock In"
              dot={{ fill: '#10B981', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="out"
              stroke="#EF4444"
              strokeWidth={2}
              name="Stock Out"
              dot={{ fill: '#EF4444', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-4 text-center">
          {t('lastFourteenDaysText')}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t('lowStockAlertText')}</h2>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">{t('allStockHealthy')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('noBelowThreshold')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => {
              const stockPercentage = (item.stock / item.min_stock_level) * 100;
              return (
                <div
                  key={item.id}
                  className="border border-red-200 rounded-lg p-4 bg-red-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-600">{item.category}</p>
                      <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                    </div>
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                      {t('lowText')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{t('currentText')}: {item.stock}</span>
                      <span className="text-gray-600">{t('minText')}: {item.min_stock_level}</span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-red-600 transition-all"
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('summaryReportText')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-100">{t('totalProductsText')}</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div>
                <p className="text-blue-100">{t('totalStockValueText')}</p>
                <p className="text-2xl font-bold">${totalInventoryValue.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-blue-100">{t('activeOrdersText')}</p>
                <p className="text-2xl font-bold">{totalOrders - deliveredOrders}</p>
              </div>
              <div>
                <p className="text-blue-100">{t('fulfillmentRateText')}</p>
                <p className="text-2xl font-bold">{fulfillmentRate}%</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-100">{t('reportsUpdatedText')}</span>
          </div>
        </div>
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
