import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Trophy, TrendingUp, AlertCircle, PlayCircle, Star, Timer, Lock } from 'lucide-react';
import api from '../api/client';
import RulesModal from '../components/RulesModal';
import { useNavigate } from 'react-router-dom';

const LEVELS = ['level1', 'level2', 'level3', 'level4', 'level5'];

const Dashboard: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [availableLevels, setAvailableLevels] = React.useState<string[]>([]);
    const [levelCounts, setLevelCounts] = React.useState<Record<string, number>>({});
    const [isRulesModalOpen, setIsRulesModalOpen] = React.useState(false);
    const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null);

    const navigate = useNavigate();

    const isStudent = user?.role === 'student';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [levelsRes, countsRes, statusRes] = await Promise.all([
                    api.get('/questions/available-levels'),
                    api.get('/questions/level-counts'),
                    api.get('/questions/status'),
                ]);
                setAvailableLevels(levelsRes.data);
                setLevelCounts(countsRes.data);
                if (statusRes.data) {
                    updateUser(statusRes.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setAvailableLevels(['level1']);
            }
        };
        fetchData();
    }, []);

    // Check if a level is fully completed by comparing levelProgress to total question count
    const isLevelCompleted = (level: string): boolean => {
        const totalQuestions = levelCounts[level];
        if (!totalQuestions) return false;
        const progress = user?.levelProgress?.[level] ?? 0;
        return progress >= totalQuestions;
    };

    // For students: a level is accessible if all previous levels are completed
    // For admins: all available levels are accessible
    const isLevelAccessible = (level: string, index: number): boolean => {
        if (!availableLevels.includes(level)) return false;
        if (!isStudent) return true;
        if (index === 0) return true; // level1 always open
        const previousLevel = LEVELS[index - 1];
        return isLevelCompleted(previousLevel);
    };

    const statCards = [
        { label: 'Düzgün Cavablar', value: user?.correctAnswers || 0, icon: <Trophy color="var(--success)" />, color: 'var(--success)' },
        { label: 'Səhv Cavablar', value: user?.wrongAnswers || 0, icon: <AlertCircle color="var(--error)" />, color: 'var(--error)' },
        { label: 'Ümumi Balans', value: `${Number(user?.balance || 0).toFixed(3)} AZN`, icon: <Star color="var(--warning)" />, color: 'var(--warning)' },
        { label: 'Səviyyə', value: user?.level?.toUpperCase() || 'LEVEL 1', icon: <TrendingUp color="var(--primary)" />, color: 'var(--primary)' },
    ];

    const handleLevelStart = (level: string) => {
        // Check if user has opted to skip rules for this level in the current session
        const skipRules = sessionStorage.getItem(`skipRules_${level}`) === 'true';
        if (skipRules) {
            navigate(`/quiz/${level}`);
            return;
        }
        setSelectedLevel(level);
        setIsRulesModalOpen(true);
    };

    const handleConfirmStart = (dontShowAgain: boolean) => {
        if (selectedLevel) {
            if (dontShowAgain) {
                sessionStorage.setItem(`skipRules_${selectedLevel}`, 'true');
            }
            navigate(`/quiz/${selectedLevel}`);
        }
        setIsRulesModalOpen(false);
    };

    const levelDescriptions = [
        'Riyazi toplama və çıxma misalları',
        'Çatışmayan ədədi tap, ədədləri müqayisə et.',
        'Sadə vurma əməliyyatları və onların müqayisəsi.',
        'Məntiqi təfəkkür sualları.',
        'Olimpiada səviyyəli tapşırıqlar.',
    ];

    const levelColors = ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="container">
            <header className="dashboard-header" style={{ marginBottom: '3rem' }}>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}
                >
                    Salam, <span className="gradient-text">{user?.name} {user?.surname} ({user?.fatherName})!</span>
                </motion.h1>
                <p style={{ color: 'var(--text-muted)' }}>Bugün hansı riyazi zirvəni fəth edəcəyik?</p>
            </header>

            <div className="stats-grid">
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
                            <p className="stat-card-label" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
                            <h3 className="stat-card-value" style={{ fontSize: '1.5rem', color: stat.color }}>{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="section-title" style={{ fontSize: '1.75rem' }}>Mərhələ Seçimi</h2>
                </div>

                <div className="levels-grid">
                    {LEVELS.map((level, index) => {
                        const isAvailable = availableLevels.includes(level);
                        const accessible = isLevelAccessible(level, index);
                        const completed = isLevelCompleted(level);
                        // Locked = exists in DB but student hasn't finished the previous level
                        const locked = isAvailable && isStudent && !accessible;

                        return (
                            <motion.div
                                key={level}
                                whileHover={accessible ? { y: -10 } : {}}
                                className="glass-card"
                                style={{
                                    overflow: 'hidden',
                                    position: 'relative',
                                    opacity: isAvailable ? (accessible ? 1 : 0.65) : 0.7,
                                    cursor: accessible ? 'pointer' : 'not-allowed',
                                    filter: accessible ? 'none' : 'grayscale(0.5)',
                                }}
                            >
                                {/* Lock icon for student-locked levels */}
                                {locked && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        zIndex: 10,
                                        background: 'rgba(0,0,0,0.55)',
                                        borderRadius: '50%',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Lock size={16} color="#f59e0b" />
                                    </div>
                                )}

                                {/* Not-in-DB icon */}
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
                                        justifyContent: 'center',
                                    }}>
                                        <Star size={16} color="var(--warning)" style={{ filter: 'grayscale(1)' }} />
                                    </div>
                                )}

                                <div style={{
                                    height: '120px',
                                    background: `linear-gradient(135deg, ${levelColors[index]}, #312e81)`,
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    opacity: accessible ? 1 : 0.5,
                                }}>
                                    <h3 style={{ color: 'white', fontSize: '1.5rem' }}>{level.toUpperCase()}</h3>
                                </div>

                                <div style={{ padding: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        {levelDescriptions[index]}
                                    </p>

                                    {accessible ? (
                                        <button
                                            onClick={() => handleLevelStart(level)}
                                            className="btn btn-primary"
                                            style={{ width: '100%', gap: '0.5rem' }}
                                        >
                                            <PlayCircle size={20} />
                                            {completed ? 'Yenidən Oyna' : 'İndi Başla'}
                                        </button>
                                    ) : locked ? (
                                        <button className="btn" disabled style={{
                                            width: '100%',
                                            background: 'var(--surface)',
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--border)',
                                            cursor: 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                        }}>
                                            <Lock size={20} /> Əvvəlki mərhələni bitir
                                        </button>
                                    ) : (
                                        <button className="btn" disabled style={{
                                            width: '100%',
                                            background: 'var(--surface)',
                                            color: 'var(--text-muted)',
                                            border: '1px solid var(--border)',
                                            cursor: 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                        }}>
                                            <Timer size={20} /> Tezliklə
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <RulesModal
                isOpen={isRulesModalOpen}
                levelName={selectedLevel || ''}
                onClose={() => setIsRulesModalOpen(false)}
                onConfirm={handleConfirmStart}
            />
        </div>
    );
};

export default Dashboard;
