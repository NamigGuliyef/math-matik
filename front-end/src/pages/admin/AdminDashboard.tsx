import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Users, BookOpen, CheckCircle, TrendingUp, LogIn, UserPlus, CheckCircle2, XCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Activity {
    _id: string;
    userName: string;
    type: string;
    description: string;
    createdAt: string;
}

interface Stats {
    totalUsers: number;
    totalQuestions: number;
    totalAnswers: number;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, activitiesRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get(`/admin/activities?page=${page}&limit=${limit}&search=${search}`)
            ]);
            setStats(statsRes.data);
            setActivities(activitiesRes.data.activities);
            setTotal(activitiesRes.data.total);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [page, search]);

    const totalPages = Math.ceil(total / limit);

    if (loading && page === 1 && !search) return <div className="loader"></div>;

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'login': return <LogIn size={18} color="var(--primary)" />;
            case 'register': return <UserPlus size={18} color="var(--success)" />;
            case 'answer_correct': return <CheckCircle2 size={18} color="var(--secondary)" />;
            case 'answer_wrong': return <XCircle size={18} color="var(--error)" />;
            default: return <Clock size={18} />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) + '  ' +
            date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
    };

    const statCards = [
        { title: 'Ümumi İstifadəçilər', value: stats?.totalUsers, icon: <Users size={24} color="var(--primary)" />, color: 'var(--primary)' },
        { title: 'Ümumi Suallar', value: stats?.totalQuestions, icon: <BookOpen size={24} color="var(--secondary)" />, color: 'var(--secondary)' },
        { title: 'Ümumi Cavablar', value: stats?.totalAnswers, icon: <CheckCircle size={24} color="var(--success)" />, color: 'var(--success)' },
        { title: 'Aktivlik', value: '87%', icon: <TrendingUp size={24} color="var(--warning)" />, color: 'var(--warning)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
                <h1 style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                <p className="text-muted">Platformanın cari vəziyyəti və statistikası.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {statCards.map((card, index) => (
                    <div key={index} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ background: `${card.color}20`, padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{card.title}</p>
                            <h2 style={{ margin: 0 }}>{card.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Son Aktivliklər</h3>
                <div style={{
                    position: 'relative',
                    width: '320px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Şagird adına görə axtar..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        style={{
                            width: '100%',
                            padding: '0.85rem 1rem 0.85rem 3rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '14px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.15), inset 0 2px 4px rgba(0,0,0,0.1)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '400px' }}>
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity._id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '10px' }}>
                                {getActivityIcon(activity.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 700 }}>{activity.userName}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(activity.createdAt)}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{activity.description}</p>
                            </div>
                        </div>
                    ))
                ) : loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                        <span className="text-muted">Məlumat yoxdur</span>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1.25rem',
                    marginTop: '3rem',
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)'
                }}>
                    <button
                        className="btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        style={{
                            padding: '0.6rem 1.25rem',
                            background: page === 1 ? 'rgba(255,255,255,0.05)' : 'var(--glass)',
                            border: '1px solid var(--border)',
                            color: page === 1 ? 'var(--text-muted)' : 'white',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (page !== 1) {
                                e.currentTarget.style.background = 'var(--surface-hover)';
                                e.currentTarget.style.transform = 'translateX(-3px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (page !== 1) {
                                e.currentTarget.style.background = 'var(--glass)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }
                        }}
                    >
                        <ChevronLeft size={18} />
                        Əvvəlki
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--text)'
                    }}>
                        <span style={{ color: 'var(--text-muted)' }}>Səhifə</span>
                        <span style={{
                            background: 'var(--primary)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            minWidth: '2rem',
                            textAlign: 'center'
                        }}>{page}</span>
                        <span style={{ color: 'var(--text-muted)' }}>/ {totalPages}</span>
                    </div>

                    <button
                        className="btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        style={{
                            padding: '0.6rem 1.25rem',
                            background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'var(--glass)',
                            border: '1px solid var(--border)',
                            color: page === totalPages ? 'var(--text-muted)' : 'white',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (page !== totalPages) {
                                e.currentTarget.style.background = 'var(--surface-hover)';
                                e.currentTarget.style.transform = 'translateX(3px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (page !== totalPages) {
                                e.currentTarget.style.background = 'var(--glass)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }
                        }}
                    >
                        Növbəti
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
