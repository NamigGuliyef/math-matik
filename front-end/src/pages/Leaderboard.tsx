import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/client';
import { Medal, Crown, Loader2 } from 'lucide-react';

const Leaderboard: React.FC = () => {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/leaderboard');
                setLeaders(response.data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <Crown size={60} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                <h1 className="gradient-text" style={{ fontSize: '3rem' }}>Liderlər Lövhəsi</h1>
                <p style={{ color: 'var(--text-muted)' }}>Ən yüksək nəticə göstərən şagirdlərimiz</p>
            </header>

            <div className="glass-card" style={{ padding: '1rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sıra</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Şagird</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Səviyyə</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Düzgün</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>AZN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.map((student, index) => (
                            <motion.tr
                                key={student._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ borderBottom: index === leaders.length - 1 ? 'none' : '1px solid var(--border)' }}
                            >
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                                        {index < 3 ? (
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Medal
                                                    size={32}
                                                    color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                                                    fill={index === 0 ? 'rgba(255, 215, 0, 0.1)' : index === 1 ? 'rgba(192, 192, 192, 0.1)' : 'rgba(205, 127, 50, 0.1)'}
                                                />
                                                <span style={{
                                                    position: 'absolute',
                                                    bottom: '3px',
                                                    fontSize: '0.625rem',
                                                    fontWeight: 900,
                                                    color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                                                }}>
                                                    {index + 1}
                                                </span>
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                border: '2px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                color: 'var(--text-muted)'
                                            }}>
                                                {index + 1}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', fontWeight: 600 }}>{student.name} {student.surname} ({student.fatherName})</td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {student.level.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{student.correctAnswers}</td>
                                <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 800 }}>{student.balance}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {leaders.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Hələ ki heç bir nəticə yoxdur. İlk sən ol!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
