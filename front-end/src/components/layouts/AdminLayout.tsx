import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, LogOut, Award, ChevronLeft, Menu, Shield, ScrollText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarVariants = {
        expanded: { width: '280px' },
        collapsed: { width: '80px' }
    };

    const navItems = [
        { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/admin/questions', icon: <PlusCircle size={20} />, label: 'Suallar' },
        { to: '/admin/users', icon: <Users size={20} />, label: 'İstifadəçilər' },
        { to: '/admin/fighter', icon: <Shield size={20} />, label: 'Döyüşçü Parametrləri' },
        { to: '/admin/missions', icon: <ScrollText size={20} />, label: 'Tapşırıqlar & Nailiyyətlər' },
    ];

    return (
        <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0c' }}>
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={sidebarVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    borderRight: '1px solid var(--border)',
                    padding: isCollapsed ? '2rem 0.75rem' : '2rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(20px)',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    zIndex: 100,
                    overflow: 'hidden'
                }}
            >
                {/* Header & Toggle */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    marginBottom: '2.5rem',
                    gap: '0.75rem'
                }}>
                    {!isCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award color="white" size={20} />
                            </div>
                            <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 800, whiteSpace: 'nowrap' }}>ADMIN</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                        }}
                    >
                        {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            title={isCollapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                color: 'var(--text)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                justifyContent: isCollapsed ? 'center' : 'flex-start'
                            }}
                            className="nav-link"
                        >
                            <span style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>{item.icon}</span>
                            {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Footer Section - Fixed at bottom via flex: 1 on nav */}
                <div style={{
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--border)'
                }}>
                    <Link
                        to="/dashboard"
                        title={isCollapsed ? "Panelə Qayıt" : ""}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            color: 'var(--text-muted)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        }}
                    >
                        <ChevronLeft size={20} />
                        {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Panelə Qayıt</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? "Çıxış Et" : ""}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--error)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        }}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Çıxış Et</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', maxHeight: '100vh' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

