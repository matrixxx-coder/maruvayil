import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import TempleDetails from './pages/TempleDetails';
import Pooja from './pages/Pooja';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FamilyMembers from './pages/FamilyMembers';
import AdminLayout from './pages/admin/AdminLayout';
import ContentEditor from './pages/admin/ContentEditor';
import AnnouncementsEditor from './pages/admin/AnnouncementsEditor';
import CommitteeEditor from './pages/admin/CommitteeEditor';
import MembersManager from './pages/admin/MembersManager';
import FamilyTree from './pages/admin/FamilyTree';

// Layout wrapper for public pages (with navbar + footer)
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout wrapper for auth pages (no footer)
const AuthLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

// Layout wrapper for dashboard pages
const DashboardLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/temple" element={<TempleDetails />} />
            <Route path="/pooja" element={<Pooja />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Auth pages */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<AuthPage mode="login" />} />
            <Route path="/auth/register" element={<AuthPage mode="register" />} />
          </Route>

          {/* Protected dashboard pages */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/family"
              element={
                <ProtectedRoute>
                  <FamilyMembers />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/content" replace />} />
            <Route path="content" element={<ContentEditor />} />
            <Route path="announcements" element={<AnnouncementsEditor />} />
            <Route path="committee" element={<CommitteeEditor />} />
            <Route path="members" element={<MembersManager />} />
            <Route path="family-tree" element={<FamilyTree />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-1 flex items-center justify-center bg-cream">
                <div className="text-center">
                  <div className="text-7xl mb-4">🕉️</div>
                  <h1 className="text-3xl font-bold text-teal-800 mb-2">Page Not Found</h1>
                  <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
                  <a href="/" className="px-6 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors">
                    Back to Home
                  </a>
                </div>
              </div>
              <Footer />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
