import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, LogOut, Award, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0c' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', borderRight: '1px solid var(--border)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award color="white" size={20} />
                    </div>
                    <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>ADMIN</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }} className="nav-link">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/admin/questions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }} className="nav-link">
                        <PlusCircle size={20} /> Suallar
                    </Link>
                    <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }} className="nav-link">
                        <Users size={20} /> İstifadəçilər
                    </Link>
                </nav>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
                        <ChevronLeft size={20} /> Panelə Qayıt
                    </Link>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'var(--error)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                        <LogOut size={20} /> Çıxış Et
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
