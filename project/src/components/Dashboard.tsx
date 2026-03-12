import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: number;
  totalInventoryValue: number;
  totalCustomers: number;
  pendingOrders: number;
}

export function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    recentOrders: 0,
    totalInventoryValue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        productsResult,
        lowStockResult,
        ordersResult,
        customersResult,
        pendingOrdersResult,
      ] = await Promise.all([
        supabase.from('products').select('price, stock', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('orders').select('*', { count: 'exact' }),
        supabase.from('customers').select('*', { count: 'exact' }),
        supabase.from('orders').select('*', { count: 'exact' }).eq('status', 'Pending'),
      ]);

      const products = productsResult.data || [];
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

      const lowStock = lowStockResult.data?.filter(
        (p) => p.stock < p.min_stock_level
      ) || [];

      setStats({
        totalProducts: productsResult.count || 0,
        lowStockProducts: lowStock.length,
        recentOrders: ordersResult.count || 0,
        totalInventoryValue: totalValue,
        totalCustomers: customersResult.count || 0,
        pendingOrders: pendingOrdersResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: t('totalProducts'),
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: t('lowStockAlert'),
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      name: t('totalOrders'),
      value: stats.recentOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: t('inventoryValue'),
      value: `$${stats.totalInventoryValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
  ];

  const inventoryCards = [
    {
      name: t('totalCustomers'),
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-teal-500',
    },
    {
      name: t('pendingOrders'),
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('welcomeTo')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.name}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('inventoryOverview')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inventoryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">{t('systemStatus')}</h3>
        <p className="text-blue-100 mb-4">{t('allSystemsOperational')}</p>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-blue-100">{t('connectedToDatabase')}</span>
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
