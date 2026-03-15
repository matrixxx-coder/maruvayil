import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, LogOut, User, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, isTrustee, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ml' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(t('auth.logout_success'));
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/temple', label: t('nav.temple') },
    { to: '/pooja', label: t('nav.pooja') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-teal-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/published/temple-logo.jpg"
              alt="Temple Logo"
              className="h-10 w-10 rounded-full object-cover border-2 border-gold-400"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Maruvayil</p>
              <p className="text-gold-300 text-xs font-medium">ShivaParvathy Temple</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-teal-600 text-white'
                    : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border-2 border-gold-400 text-gold-300 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all"
              title={i18n.language === 'en' ? 'Switch to Malayalam' : 'Switch to English'}
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className={i18n.language === 'ml' ? 'font-malayalam' : ''}>
                {i18n.language === 'en' ? 'English' : 'മലയാളം'}
              </span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-teal-100 hover:bg-teal-600 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.dashboard')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/dashboard/family"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('nav.family')}
                    </Link>
                    {(isAdmin || isTrustee) && (
                      <>
                        <hr className="my-1" />
                        <Link
                          to={isAdmin ? '/admin' : '/admin/members'}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-teal-700 font-medium hover:bg-teal-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {isAdmin ? 'Admin Panel' : 'Trustee Panel'}
                        </Link>
                      </>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-maroon-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-teal-100 hover:bg-teal-600 hover:text-white transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-1.5 rounded-md text-sm font-semibold bg-gold-500 text-white hover:bg-gold-600 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border-2 border-gold-400 text-gold-300 hover:bg-gold-500 hover:text-white transition-all"
            >
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span className={i18n.language === 'ml' ? 'font-malayalam' : ''}>
                {i18n.language === 'en' ? 'English' : 'മലയാളം'}
              </span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-teal-100 hover:bg-teal-600"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-teal-800 border-t border-teal-600">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-teal-600 text-white'
                    : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-teal-600 my-2" />
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-teal-100 hover:bg-teal-700"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/dashboard/family"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-teal-100 hover:bg-teal-700"
                >
                  {t('nav.family')}
                </Link>
                {(isAdmin || isTrustee) && (
                  <Link
                    to={isAdmin ? '/admin' : '/admin/members'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gold-300 hover:bg-teal-700"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isAdmin ? 'Admin Panel' : 'Trustee Panel'}
                  </Link>
                )}
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:bg-teal-700"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-teal-100 hover:bg-teal-700"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold bg-gold-500 text-white hover:bg-gold-600 text-center"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
