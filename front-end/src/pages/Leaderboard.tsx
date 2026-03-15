import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/client';
import { Medal, Crown, Loader2, Sword, Star, Trophy, Target, Zap, Shield, Award } from 'lucide-react';

const renderRankIcon = (iconName: string, size = 18) => {
    switch (iconName) {
        case 'Trophy': return <Trophy size={size} />;
        case 'Target': return <Target size={size} />;
        case 'Zap': return <Zap size={size} />;
        case 'Crown': return <Crown size={size} />;
        case 'Sword': return <Sword size={size} />;
        case 'Shield': return <Shield size={size} />;
        case 'Award': return <Award size={size} />;
        case 'Medal': return <Medal size={size} />;
        default: return <Star size={size} />;
    }
};

const getRankStyle = (index: number) => {
    if (index === 0) return { color: '#FFD700', fill: 'rgba(255, 215, 0, 0.1)' };
    if (index === 1) return { color: '#C0C0C0', fill: 'rgba(192, 192, 192, 0.1)' };
    if (index === 2) return { color: '#CD7F32', fill: 'rgba(205, 127, 50, 0.1)' };
    return null;
};

const RankCell: React.FC<{ index: number }> = ({ index }) => {
    const style = getRankStyle(index);
    if (style) {
        return (
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Medal size={32} color={style.color} fill={style.fill} />
                <span style={{ position: 'absolute', bottom: '3px', fontSize: '0.625rem', fontWeight: 900, color: style.color }}>
                    {index + 1}
                </span>
            </div>
        );
    }
    return (
        <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: '2px solid var(--border)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)'
        }}>
            {index + 1}
        </div>
    );
};

const Leaderboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'quiz' | 'battle' | 'class'>('quiz');
    const [quizLeaders, setQuizLeaders] = useState<any[]>([]);
    const [battleLeaders, setBattleLeaders] = useState<any[]>([]);
    const [classLeaders, setClassLeaders] = useState<any[]>([]);
    const [ranks, setRanks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [quizRes, battleRes, classRes, ranksRes] = await Promise.all([
                    api.get('/leaderboard'),
                    api.get('/fighter/battle/leaderboard'),
                    api.get('/leaderboard/class-ranking'),
                    api.get('/ranks'),
                ]);
                setQuizLeaders(quizRes.data);
                setBattleLeaders(battleRes.data);
                setClassLeaders(classRes.data);
                setRanks(ranksRes.data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const getUserRank = (totalAnswered: number) => {
        if (!ranks.length) return null;
        return [...ranks].sort((a, b) => b.minQuestions - a.minQuestions)
            .find(r => totalAnswered >= r.minQuestions);
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.6rem 1.6rem',
        background: active ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '8px',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: 800,
        fontSize: '0.95rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        letterSpacing: '0.5px',
    });

    return (
        <div className="container" style={{ maxWidth: '820px', padding: '0 1rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <Crown size={60} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                <h1 className="gradient-text" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>Liderlər Lövhəsi</h1>
                <p style={{ color: 'var(--text-muted)' }}>Ən yüksək nəticə göstərən şagirdlərimiz</p>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                <button style={tabStyle(activeTab === 'quiz')} onClick={() => setActiveTab('quiz')}>
                    🎓 Sual Nəticələri
                </button>
                <button style={tabStyle(activeTab === 'battle')} onClick={() => setActiveTab('battle')}>
                    <Sword size={16} /> Döyüş Qalibiyyəti
                </button>
                <button style={tabStyle(activeTab === 'class')} onClick={() => setActiveTab('class')}>
                    🏆 Sinif Reytinqi
                </button>
            </div>

            {/* Quiz Leaderboard */}
            {activeTab === 'quiz' && (
                <div className="glass-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sıra</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Şagird</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sinif</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Səviyyə</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Düzgün</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>AZN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizLeaders.map((student, index) => (
                                <motion.tr
                                    key={student._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    style={{ borderBottom: index === quizLeaders.length - 1 ? 'none' : '1px solid var(--border)' }}
                                >
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <RankCell index={index} />
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {student.name} {student.surname}
                                            {getUserRank(student.totalAnswered || 0) && (
                                                <div title={getUserRank(student.totalAnswered || 0)?.name} style={{ color: 'var(--warning)', display: 'flex' }}>
                                                    {renderRankIcon(getUserRank(student.totalAnswered || 0)!.icon, 14)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                        {student.grade}
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            {student.level?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--success)', whiteSpace: 'nowrap' }}>{student.correctAnswers}</td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>{Number(student.balance).toFixed(3)}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {quizLeaders.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Hələ ki heç bir nəticə yoxdur. İlk sən ol!
                        </div>
                    )}
                </div>
            )}

            {/* Battle Leaderboard */}
            {activeTab === 'battle' && (
                <div className="glass-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sıra</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Döyüşçü</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sinif</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Səviyyə</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Qalibiyyət</th>
                            </tr>
                        </thead>
                        <tbody>
                            {battleLeaders.map((fighter, index) => (
                                <motion.tr
                                    key={fighter._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    style={{ borderBottom: index === battleLeaders.length - 1 ? 'none' : '1px solid var(--border)' }}
                                >
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <RankCell index={index} />
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {fighter.name} {fighter.surname}
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                        {fighter.grade}
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            {fighter.level?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                        <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            ⚔️ {fighter.wins}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {battleLeaders.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Hələ heç bir döyüş olmayıb. İlk qalibi sən ol!
                        </div>
                    )}
                </div>
            )}

            {/* Class Leaderboard */}
            {activeTab === 'class' && (
                <div className="glass-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sıra</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sinif</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Düzgün sual sayı</th>
                                <th style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Qalibiyyət</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classLeaders.map((item, index) => (
                                <motion.tr
                                    key={item.grade}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    style={{ borderBottom: index === classLeaders.length - 1 ? 'none' : '1px solid var(--border)' }}
                                >
                                    <td style={{ padding: '1rem 0.75rem' }}>
                                        <RankCell index={index} />
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                                        {item.grade}
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--success)', whiteSpace: 'nowrap' }}>
                                        {item.totalCorrectAnswers}
                                    </td>
                                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                        <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            ⚔️ {item.totalWins}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {classLeaders.length === 0 && (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Hələ ki heç bir nəticə yoxdur.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
