import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Trophy, TrendingUp, AlertCircle, PlayCircle, Star, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [availableLevels, setAvailableLevels] = React.useState<string[]>([]);

    useEffect(() => {
        const fetchAvailableLevels = async () => {
            try {
                const response = await api.get('/questions/available-levels');
                setAvailableLevels(response.data);
            } catch (err) {
                console.error('Error fetching available levels:', err);
                // Fallback to level1 as default available
                setAvailableLevels(['level1']);
            }
        };
        fetchAvailableLevels();
    }, []);

    const statCards = [
        { label: 'Düzgün Cavablar', value: user?.correctAnswers || 0, icon: <Trophy color="var(--success)" />, color: 'var(--success)' },
        { label: 'Səhv Cavablar', value: user?.wrongAnswers || 0, icon: <AlertCircle color="var(--error)" />, color: 'var(--error)' },
        { label: 'Ümumi Balans', value: `${user?.balance || 0} AZN`, icon: <Star color="var(--warning)" />, color: 'var(--warning)' },
        { label: 'Səviyyə', value: user?.level?.toUpperCase() || 'LEVEL 1', icon: <TrendingUp color="var(--primary)" />, color: 'var(--primary)' },
    ];

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem' }}>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}
                >
                    Salam, <span className="gradient-text">{user?.name} {user?.surname} ({user?.fatherName})!</span>
                </motion.h1>
                <p style={{ color: 'var(--text-muted)' }}>Bugün hansı riyazi zirvəni fəth edəcəyik?</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                    >
                        <div style={{ background: 'rgba(255,255,255,0.05)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.5rem', color: stat.color }}>{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>Mərhələ Seçimi</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {['level1', 'level2', 'level3', 'level4', 'level5'].map((level, index) => {
                        const isAvailable = availableLevels.includes(level);
                        return (
                            <motion.div
                                key={level}
                                whileHover={isAvailable ? { y: -10 } : {}}
                                className="glass-card"
                                style={{
                                    overflow: 'hidden',
                                    position: 'relative',
                                    opacity: isAvailable ? 1 : 0.7,
                                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                                    filter: isAvailable ? 'none' : 'grayscale(0.5)'
                                }}
                            >
                                {!isAvailable && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        zIndex: 10,
                                        background: 'rgba(0,0,0,0.5)',
                                        borderRadius: '50%',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Star size={16} color="var(--warning)" style={{ filter: 'grayscale(1)' }} />
                                    </div>
                                )}
                                <div style={{
                                    height: '120px',
                                    background: `linear-gradient(135deg, ${index === 0 ? '#4f46e5' : index === 1 ? '#8b5cf6' : index === 2 ? '#ec4899' : index === 3 ? '#f59e0b' : '#10b981'}, #312e81)`,
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    opacity: isAvailable ? 1 : 0.5
                                }}>
                                    <h3 style={{ color: 'white', fontSize: '1.5rem' }}>{level.toUpperCase()}</h3>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        {index === 0 ? 'Riyazi toplama və çıxma misalları' :
                                            index === 1 ? 'Orta çətinlikli məsələlər.' :
                                                index === 2 ? 'Mürəkkəb riyazi problemlər.' :
                                                    index === 3 ? 'Məntiqi təfəkkür sualları.' : 'Olimpiada səviyyəli tapşırıqlar.'}
                                    </p>
                                    {isAvailable ? (
                                        <Link to={`/quiz/${level}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', gap: '0.5rem' }}>
                                            <PlayCircle size={20} /> İndi Başla
                                        </Link>
                                    ) : (
                                        <button className="btn" disabled style={{ width: '100%', background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <Timer size={20} /> Tezliklə
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
