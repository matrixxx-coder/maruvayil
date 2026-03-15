import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AtSign, Lock, User, Phone, Calendar, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { BIRTH_STARS, WORLD_CITIES } from '../constants/templeData';
import { toMalayalamDate } from '../utils/malayalamCalendar';

interface LocationState {
  from?: { pathname: string };
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOB_REGEX = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}-\d{4}$/i;

/** ISO YYYY-MM-DD → MMM-DD-YYYY */
function isoToMmm(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]}-${d}-${y}`;
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
    gender: '',
    dob: '',
    birth_star: '',
    place_of_birth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const datePickerRef = useRef<HTMLInputElement>(null);

  // Filtered city suggestions (only when ≥ 3 chars typed)
  const filteredCities =
    form.place_of_birth.length >= 3
      ? WORLD_CITIES.filter((c) =>
          c.toLowerCase().includes(form.place_of_birth.toLowerCase())
        ).slice(0, 8)
      : [];

  // Malayalam calendar date (shown once DoB is fully entered)
  const mlDate = DOB_REGEX.test(form.dob) ? toMalayalamDate(form.dob) : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'register') {
      if (!form.full_name.trim()) e.full_name = 'Full name is required';
      if (!form.gender) e.gender = 'Please select a gender';
      if (!form.email.trim()) {
        e.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        e.email = 'Enter a valid email address';
      }
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (form.dob && !DOB_REGEX.test(form.dob)) e.dob = 'Use format MMM-DD-YYYY (e.g. Mar-05-1990)';
    } else {
      if (!form.email.trim()) e.email = 'User ID or email is required';
      if (!form.password) e.password = 'Password is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'place_of_birth') {
      setShowCitySuggestions(value.length >= 3);
    }
  };

  const openDatePicker = () => {
    const el = datePickerRef.current;
    if (!el) return;
    // showPicker() is available in modern browsers
    (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.() ?? el.click();
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
        await register(
          form.email,
          form.password,
          form.full_name,
          form.phone || undefined,
          form.gender || undefined,
          form.dob || undefined,
          form.birth_star || undefined,
          form.place_of_birth || undefined,
        );
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
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    '<div class="w-full h-full bg-teal-700 flex items-center justify-center text-3xl">🕉️</div>';
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
                {/* Full Name */}
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

                {/* Gender */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {isMl ? 'ലിംഗം' : 'Gender'} *
                  </label>
                  <div className="flex gap-6">
                    {['Male', 'Female'].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={form.gender === g}
                          onChange={handleChange}
                          className="w-4 h-4 accent-teal-600"
                        />
                        <span className={`text-sm text-gray-700 ${isMl ? 'font-malayalam' : ''}`}>
                          {isMl ? (g === 'Male' ? 'പുരുഷൻ' : 'സ്ത്രീ') : g}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>

                {/* Phone */}
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

                {/* Email — register only; login email is rendered below */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {t('auth.email')} *
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {isMl ? 'ജനനത്തീയതി' : 'Date of Birth'}
                  </label>
                  <div className="relative">
                    {/* Clickable calendar icon opens native date picker */}
                    <button
                      type="button"
                      onClick={openDatePicker}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors z-10"
                      tabIndex={-1}
                      title="Open calendar"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      onClick={openDatePicker}
                      readOnly
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition cursor-pointer ${errors.dob ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      placeholder="MMM-DD-YYYY"
                    />
                    {/* Hidden native date picker — triggered by the calendar icon */}
                    <input
                      ref={datePickerRef}
                      type="date"
                      tabIndex={-1}
                      max={new Date().toISOString().split('T')[0]}
                      className="absolute left-0 top-0 opacity-0 w-full h-full pointer-events-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          setForm((f) => ({ ...f, dob: isoToMmm(e.target.value) }));
                        }
                      }}
                    />
                  </div>
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                  {/* Malayalam calendar date */}
                  {mlDate && (
                    <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-1.5">
                        കൊല്ലവർഷം
                      </p>
                      <p className="font-malayalam text-teal-800 font-bold text-lg leading-snug">
                        {mlDate.year} {mlDate.monthMl}{' '}
                        <span className="font-sans font-normal text-sm text-teal-600">({mlDate.monthEn})</span>{' '}
                        {mlDate.day}
                      </p>
                    </div>
                  )}
                </div>

                {/* Birth Star */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {isMl ? 'ജന്മ നക്ഷത്രം' : 'Birth Star (Nakshatra)'}
                  </label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      name="birth_star"
                      value={form.birth_star}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white appearance-none"
                    >
                      <option value="">{isMl ? 'നക്ഷത്രം തിരഞ്ഞെടുക്കുക' : 'Select birth star'}</option>
                      {BIRTH_STARS.map((star) => (
                        <option key={star.en} value={star.en}>
                          {star.ml} ({star.en})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Place of Birth — custom typeahead, shows after 3 chars */}
                <div className="relative">
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {isMl ? 'ജന്മസ്ഥലം' : 'Place of Birth'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="place_of_birth"
                      value={form.place_of_birth}
                      onChange={handleChange}
                      onFocus={() => form.place_of_birth.length >= 3 && setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder={isMl ? 'നഗരം, രാജ്യം' : 'City, Country'}
                    />
                  </div>
                  {showCitySuggestions && filteredCities.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <li key={city}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setForm((f) => ({ ...f, place_of_birth: city }));
                              setShowCitySuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                          >
                            {city}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* Email / User ID — login only (register has it above after Phone) */}
            {mode === 'login' && (
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                  {isMl ? 'യൂസർ ഐഡി അല്ലെങ്കിൽ ഇമെയിൽ' : 'User ID or Email'} *
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="username"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            )}

            {/* Password */}
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
