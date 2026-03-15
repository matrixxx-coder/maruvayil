import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, FileText, Bell, Users, UserCog, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/admin/content', label: 'Content Blocks', icon: FileText },
  { to: '/admin/announcements', label: 'Announcements', icon: Bell },
  { to: '/admin/committee', label: 'Committee', icon: Users },
  { to: '/admin/members', label: 'Members', icon: UserCog },
];

const AdminLayout: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-teal-700 font-semibold">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-teal-800 text-white shadow-xl flex-shrink-0">
        {/* Header */}
        <div className="px-5 py-5 border-b border-teal-700">
          <div className="flex items-center gap-3">
            <img
              src="https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/published/temple-logo.jpg"
              alt="Temple Logo"
              className="h-9 w-9 rounded-full object-cover border-2 border-gold-400"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <p className="font-bold text-sm text-white leading-tight">Admin Panel</p>
              <p className="text-gold-300 text-xs">Maruvayil Temple</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/admin'
                ? 'bg-teal-600 text-white'
                : 'text-teal-100 hover:bg-teal-700 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            Overview
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? 'bg-teal-600 text-white'
                  : 'text-teal-100 hover:bg-teal-700 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-teal-700">
          <Link
            to="/"
            className="text-xs text-teal-300 hover:text-white transition-colors"
          >
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-64 h-full bg-teal-800 text-white shadow-xl">
            <div className="px-5 py-5 border-b border-teal-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/published/temple-logo.jpg"
                  alt="Temple Logo"
                  className="h-9 w-9 rounded-full object-cover border-2 border-gold-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <p className="font-bold text-sm text-white leading-tight">Admin Panel</p>
                  <p className="text-gold-300 text-xs">Maruvayil Temple</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-teal-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <Link
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-teal-600 text-white'
                    : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                Overview
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.to)
                      ? 'bg-teal-600 text-white'
                      : 'text-teal-100 hover:bg-teal-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-5 py-4 border-t border-teal-700">
              <Link to="/" className="text-xs text-teal-300 hover:text-white transition-colors">
                Back to Site
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile only) */}
        <header className="md:hidden bg-teal-800 text-white px-4 py-3 flex items-center gap-3 shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded text-teal-200 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
