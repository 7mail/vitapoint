import { useState, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Users,
  Activity,
  History,
  Languages,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navigation = [
    { name: 'dashboard', icon: LayoutDashboard, page: 'dashboard', roles: ['Admin', 'Sales', 'Warehouse'] },
    { name: 'products', icon: Package, page: 'products', roles: ['Admin', 'Warehouse'] },
    { name: 'orders', icon: ShoppingCart, page: 'orders', roles: ['Admin', 'Sales'] },
    { name: 'inventory', icon: BarChart3, page: 'inventory', roles: ['Admin', 'Warehouse'] },
    { name: 'reports', icon: Activity, page: 'reports', roles: ['Admin', 'Sales', 'Warehouse'] },
    { name: 'users', icon: Users, page: 'users', roles: ['Admin'] },
    { name: 'activityLogs', icon: Activity, page: 'activity', roles: ['Admin'] },
    { name: 'auditTrail', icon: History, page: 'audit', roles: ['Admin'] },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(profile?.role || 'Sales')
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-lg font-bold text-gray-900">VitaPoint ERP</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm font-medium text-gray-700 flex items-center space-x-1"
            >
              <Languages className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <img
                  src="https://i.postimg.cc/43G5xHyK/Autopilot-AI-logo.png"
                  alt="VitaPoint"
                  className="w-8 h-8 rounded"
                />
                <h1 className="text-lg font-bold text-gray-900">
                  VitaPoint ERP
                </h1>
              </div>
              <button
                onClick={toggleLanguage}
                className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition text-xs font-medium text-gray-700"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{language.toUpperCase()}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              <a
                href="https://www.autopilotai.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 hover:underline transition"
              >
                {t('poweredBy')}
              </a>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onNavigate(item.page);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{t(item.name)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || profile?.email}
                </p>
                <p className="text-xs text-gray-500">{t(profile?.role.toLowerCase() || 'sales')}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('signOut')}</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
