import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionList from './pages/admin/QuestionList';
import QuestionForm from './pages/admin/QuestionForm';
import UserManagement from './pages/admin/UserManagement';
import AdminGuard from './components/AdminGuard';

import { LogOut, User as UserIcon, LayoutDashboard, Trophy, Settings } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="glass-card" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container navbar-inner">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.9rem', flexShrink: 0 }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.25)' }}>
            <img src="/favicon.png" alt="Math-Mathic Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.1)' }} />
          </div>
          <span className="gradient-text navbar-logo-text" style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.7px' }}>MATHEMATIC</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-links">
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} /><span className="navbar-link-text">Admin Panel</span>
              </Link>
            )}
            <Link to="/dashboard" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={20} /><span className="navbar-link-text">Panel</span>
            </Link>
            <Link to="/leaderboard" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={20} /><span className="navbar-link-text">Reytinq</span>
            </Link>
            <div className="navbar-user-pill">
              <UserIcon size={18} color="var(--primary)" />
              <span className="navbar-username" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name} {user?.surname}</span>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                title="Çıxış"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn" style={{ color: 'var(--text)', textDecoration: 'none' }}>Daxil Ol</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Qeydiyyat</Link>
          </div>
        )}
      </div>
    </nav>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Home /></main></>} />

          <Route path="/login" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Login /></main></>} />
          <Route path="/register" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Register /></main></>} />

          <Route path="/dashboard" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Dashboard /></ProtectedRoute></main></>} />
          <Route path="/quiz/:level" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Quiz /></ProtectedRoute></main></>} />
          <Route path="/leaderboard" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Leaderboard /></ProtectedRoute></main></>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="questions" element={<QuestionList />} />
            <Route path="questions/new" element={<QuestionForm />} />
            <Route path="questions/edit/:id" element={<QuestionForm />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>

        <footer style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <div className="container">
            <p>&copy; 2026 Math-Matik Quiz Platforması. Bütün hüquqlar qorunur.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>Riyaziyyatı bizimlə öyrənin və zirvələrə yüksəlin!</p>
          </div>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
