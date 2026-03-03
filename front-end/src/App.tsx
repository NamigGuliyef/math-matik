import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import Fighter from './pages/Fighter';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionList from './pages/admin/QuestionList';
import QuestionForm from './pages/admin/QuestionForm';
import UserManagement from './pages/admin/UserManagement';
import AdminFighter from './pages/admin/AdminFighter';
import AdminGuard from './components/AdminGuard';

import { LogOut, User as UserIcon, LayoutDashboard, Trophy, Settings, Shield } from 'lucide-react';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar-v2 glass-card">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand-v2">
          <div className="navbar-logo-wrap-v2">
            <img src="/favicon.png" alt="Math-Mathic Logo" className="navbar-logo-img-v2" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
          <span className="gradient-text navbar-logo-text-v2">MATHEMATIC</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-links-v2">
            {user?.role === 'admin' && (
              <Link to="/admin" className="navbar-admin-btn-v2">
                <Settings size={20} /><span className="navbar-link-text-v2">Admin Panel</span>
              </Link>
            )}
            <Link to="/dashboard" className="nav-link-v2-main">
              <LayoutDashboard size={20} color="var(--primary)" /><span className="navbar-link-text-v2">Panel</span>
            </Link>
            <Link to="/fighter" className="nav-link-v2-main">
              <Shield size={20} color="var(--secondary)" /><span className="navbar-link-text-v2">Döyüşçüm</span>
            </Link>
            <Link to="/leaderboard" className="nav-link-v2-main">
              <Trophy size={20} color="var(--warning)" /><span className="navbar-link-text-v2">Reytinq</span>
            </Link>
            <div className="navbar-user-pill-v2">
              <UserIcon size={18} color="white" />
              <span className="navbar-username-v2">{user?.name} {user?.surname}</span>
              <button
                onClick={logout}
                className="navbar-logout-btn-v2"
                title="Çıxış"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-auth-group-v2">
            <Link
              to="/login"
              className="btn-outline-v2 navbar-login-btn-v2"
            >
              Daxil Ol
            </Link>
            <Link
              to="/register"
              className="btn btn-primary navbar-register-btn-v2"
            >
              Qeydiyyat
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};


import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main App Routes */}
            <Route path="/" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Home /></main></>} />

            <Route path="/login" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Login /></main></>} />
            <Route path="/register" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Register /></main></>} />

            <Route path="/dashboard" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Dashboard /></ProtectedRoute></main></>} />
            <Route path="/fighter" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Fighter /></ProtectedRoute></main></>} />
            <Route path="/quiz/:level" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Quiz /></ProtectedRoute></main></>} />
            <Route path="/leaderboard" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Leaderboard /></ProtectedRoute></main></>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<AdminDashboard />} />
              <Route path="questions" element={<QuestionList />} />
              <Route path="questions/new" element={<QuestionForm />} />
              <Route path="questions/edit/:id" element={<QuestionForm />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="fighter" element={<AdminFighter />} />
            </Route>
          </Routes>

          <footer className="footer" style={{
            padding: '2.5rem 0',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: 'auto'
          }}>
            <div className="container" style={{ textAlign: 'center' }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem',
                lineHeight: '1.6',
                maxWidth: '800px',
                margin: '0 auto',
                fontWeight: 500
              }}>
                &copy; {new Date().getFullYear()} Mathematic Quiz Platforması. Bütün hüquqlar qorunur.<br />
                <span className="gradient-text" style={{
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}>
                  Riyaziyyatı bizimlə öyrənin və zirvələrə yüksəlin!
                </span>
              </p>
            </div>
          </footer>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
