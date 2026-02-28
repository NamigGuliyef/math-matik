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
    <nav className="glass-card" style={{
      borderRadius: '0',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundImage: 'url("/assets/math_pattern.svg")',
      backgroundSize: '800px',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      backgroundColor: 'rgba(15, 23, 42, 0.75)'
    }}>
      <div className="container navbar-inner">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.9rem', flexShrink: 0 }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.25)' }}>
            <img src="/favicon.png" alt="Math-Mathic Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.1)' }} />
          </div>
          <span className="gradient-text navbar-logo-text" style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.7px' }}>MATHEMATIC</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-links" style={{ gap: '1.5rem' }}>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                <Settings size={20} /><span className="navbar-link-text">Admin Panel</span>
              </Link>
            )}
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.3s ease' }} className="nav-link-v2">
              <LayoutDashboard size={20} color="var(--primary)" /><span className="navbar-link-text">Panel</span>
            </Link>
            <Link to="/leaderboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.3s ease' }} className="nav-link-v2">
              <Trophy size={20} color="var(--warning)" /><span className="navbar-link-text">Reytinq</span>
            </Link>
            <div className="navbar-user-pill" style={{
              background: 'rgba(255, 255, 255, 0.07)',
              padding: '0.5rem 1.25rem',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <UserIcon size={18} color="white" />
              <span className="navbar-username" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white' }}>{user?.name} {user?.surname}</span>
              <button
                onClick={logout}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  marginLeft: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                title="Çıxış"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--error)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link
              to="/login"
              className="btn-outline-v2"
              style={{
                padding: '0.6rem 1.5rem',
                fontSize: '0.95rem',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(5px)',
                color: 'white',
                fontWeight: 700
              }}
            >
              Daxil Ol
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{
                padding: '0.7rem 1.6rem',
                fontSize: '0.95rem',
                borderRadius: '12px',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
              }}
            >
              Qeydiyyat
            </Link>
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
  );
};

export default App;
