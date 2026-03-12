import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, Mail, AlertCircle, Languages } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition text-sm font-medium text-gray-700 flex items-center space-x-2 shadow-sm"
      >
        <Languages className="w-4 h-4" />
        <span>{language.toUpperCase()}</span>
      </button>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img
              src="https://i.postimg.cc/43G5xHyK/Autopilot-AI-logo.png"
              alt="VitaPoint"
              className="w-16 h-16 mx-auto mb-4 rounded-xl"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              VitaPoint Inventory ERP
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">
              Enterprise ERP
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              <a
                href="https://www.autopilotai.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 hover:underline transition"
              >
                Powered by AUTOPILOTAI
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              {t('demoPurposeText')}
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('poweredBySupabase')}
          </p>
        </div>
      </div>
    </div>
  );
}
