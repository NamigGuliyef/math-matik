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
import Missions from './pages/Missions';

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionList from './pages/admin/QuestionList';
import QuestionForm from './pages/admin/QuestionForm';
import UserManagement from './pages/admin/UserManagement';
import AdminFighter from './pages/admin/AdminFighter';
import AdminMissions from './pages/admin/AdminMissions';
import AdminGuard from './components/AdminGuard';

import { LogOut, User as UserIcon, LayoutDashboard, Trophy, Settings, Shield, ScrollText } from 'lucide-react';
import GlobalChat from './components/GlobalChat';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};



import { NotificationProvider } from './context/NotificationContext';
import { MissionProvider, useMissionsCount } from './context/MissionContext';

const NavbarContent: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unclaimedCount } = useMissionsCount();

  return (
    <nav className="navbar-v2 glass-card">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand-v2">
          <div className="navbar-logo-wrap-v2">
            <img src="/favicon.png" alt="Math-Mathic Logo" className="navbar-logo-img-v2" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </div>
          <span className="gradient-text navbar-logo-text-v2">MATHEMATICS</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-links-v2">
            {user?.role === 'admin' && (
              <Link to="/admin" className="navbar-admin-btn-v2" title="Admin Panel">
                <Settings size={18} /><span className="navbar-link-text-v2">Admin</span>
              </Link>
            )}

            <div className="navbar-nav-group">
              <Link to="/dashboard" className="nav-icon-btn" title="Panel">
                <LayoutDashboard size={17} color="#6366f1" /><span className="nav-icon-label">Panel</span>
              </Link>
              <Link to="/missions" className="nav-icon-btn" title="Tapşırıqlar" style={{ position: 'relative' }}>
                <ScrollText size={17} color="#ec4899" />
                <span className="nav-icon-label">Tapşırıqlar</span>
                {unclaimedCount > 0 && (
                  <span className="nav-badge">
                    {unclaimedCount}
                  </span>
                )}
              </Link>
              <Link to="/fighter" className="nav-icon-btn" title="Döyüşçüm">
                <Shield size={17} color="#ef4444" /><span className="nav-icon-label">Döyüşçüm</span>
              </Link>
              <Link to="/leaderboard" className="nav-icon-btn" title="Reytinq">
                <Trophy size={17} color="#f59e0b" /><span className="nav-icon-label">Reytinq</span>
              </Link>
            </div>

            <div className="navbar-user-pill-v2">
              <UserIcon size={16} color="white" />
              <span className="navbar-username-v2">{user?.name} {user?.surname}</span>
              <button
                onClick={logout}
                className="navbar-logout-btn-v2"
                title="Çıxış"
              >
                <LogOut size={15} />
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

const Navbar: React.FC = () => {
    return <NavbarContent />;
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <MissionProvider>
          <BrowserRouter>
            <Routes>
              {/* Main App Routes */}
              <Route path="/" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Home /></main></>} />

              <Route path="/login" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Login /></main></>} />
              <Route path="/register" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><Register /></main></>} />

              <Route path="/dashboard" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Dashboard /></ProtectedRoute></main></>} />
              <Route path="/fighter" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Fighter /></ProtectedRoute></main></>} />
              <Route path="/missions" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Missions /></ProtectedRoute></main></>} />
              <Route path="/quiz/:grade/:level" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Quiz /></ProtectedRoute></main></>} />
              <Route path="/quiz/:grade/:level/:stage" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Quiz /></ProtectedRoute></main></>} />
              <Route path="/leaderboard" element={<><Navbar /><main style={{ flex: 1, padding: '2rem 0' }}><ProtectedRoute><Leaderboard /></ProtectedRoute></main></>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminDashboard />} />
                <Route path="questions" element={<QuestionList />} />
                <Route path="questions/new" element={<QuestionForm />} />
                <Route path="questions/edit/:id" element={<QuestionForm />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="fighter" element={<AdminFighter />} />
                <Route path="missions" element={<AdminMissions />} />
              </Route>
            </Routes>
            <GlobalChat />
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
                  &copy; {new Date().getFullYear()} Mathematics Quiz Platforması. Bütün hüquqlar qorunur.<br />
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
        </MissionProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
