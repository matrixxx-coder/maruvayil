import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AtSign, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const { t, i18n } = useTranslation();
  const isMl = i18n.language === 'ml';
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register } = useAuth();
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'register') {
      if (!form.full_name.trim()) e.full_name = 'Full name is required';
      // Email must be a valid email address for registration
      if (!form.email.trim()) {
        e.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        e.email = 'Enter a valid email address';
      }
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    } else {
      // Login: accept email address OR plain user ID (any non-empty string)
      if (!form.email.trim()) e.email = 'User ID or email is required';
      if (!form.password) e.password = 'Password is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success(t('auth.login_success'));
        navigate(from, { replace: true });
      } else {
        await register(form.email, form.password, form.full_name, form.phone || undefined);
        toast.success(t('auth.register_success'));
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cream to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <div className="w-16 h-16 rounded-full border-3 border-gold-400 overflow-hidden mx-auto shadow-lg">
              <img
                src="https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/published/temple-logo.jpg"
                alt="Temple Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-teal-700 flex items-center justify-center text-3xl">🕉️</div>';
                }}
              />
            </div>
          </Link>
          <h1 className={`text-2xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
            {mode === 'login' ? t('auth.login_title') : t('auth.register_title')}
          </h1>
          <p className={`text-gray-500 mt-1 ${isMl ? 'font-malayalam' : ''}`}>
            {mode === 'login' ? t('auth.login_subtitle') : t('auth.register_subtitle')}
          </p>
          <p className="font-malayalam text-teal-600 text-sm mt-1">
            മറുവയൽ ശ്രീ ശിവ പാർവതി ക്ഷേത്രം
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <>
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {t('auth.full_name')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.full_name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      placeholder="Your full name"
                    />
                  </div>
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {t('auth.phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                {mode === 'login'
                  ? (isMl ? 'യൂസർ ഐഡി അല്ലെങ്കിൽ ഇമെയിൽ' : 'User ID or Email')
                  : t('auth.email')}{' '}*
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete={mode === 'login' ? 'username' : 'email'}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                {t('auth.password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span className={isMl ? 'font-malayalam' : ''}>
                {mode === 'login' ? t('auth.login_button') : t('auth.register_button')}
              </span>
            </button>
          </form>

          <div className="mt-5 text-center">
            {mode === 'login' ? (
              <Link
                to="/auth/register"
                className={`text-teal-600 hover:text-teal-700 text-sm font-medium ${isMl ? 'font-malayalam' : ''}`}
              >
                {t('auth.register_link')}
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className={`text-teal-600 hover:text-teal-700 text-sm font-medium ${isMl ? 'font-malayalam' : ''}`}
              >
                {t('auth.login_link')}
              </Link>
            )}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-4">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
