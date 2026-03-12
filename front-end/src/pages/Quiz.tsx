import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import QuestionCard from '../components/QuestionCard';
import { Loader2, Trophy, ArrowLeft, Timer, Clock, Zap, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LEVELS = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];


const Quiz: React.FC = () => {
    const { grade, level, stage } = useParams<{ grade: string, level: string, stage: string }>();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showFinished, setShowFinished] = useState(false);
    const [stageReward, setStageReward] = useState<any>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isRestingState, setIsRestingState] = useState(false);
    const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
    const [isChestOpen, setIsChestOpen] = useState(false);

    const timerRef = useRef<any>(null);
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    // --- Robust Reactive Rest Logic ---
    // Derived rest status to ensure immediate UI feedback even before useEffect runs
    const currentRestEndTime = user?.restEndTimes?.[`${grade}:${level}`];
    const isResting = isRestingState || (currentRestEndTime ? new Date() < new Date(currentRestEndTime) : false);

    const currentWrongAnswers = user?.levelSessionWrongAnswers?.[`${grade}:${level}`] || 0;
    const chances = 5 - currentWrongAnswers;

    useEffect(() => {
        const checkStatusAndFetch = async () => {
            if (!user || !level) return;

            // --- Immediate rest check from context ---
            if (currentRestEndTime) {
                const now = new Date();
                const restEnd = new Date(currentRestEndTime);
                if (now < restEnd) {
                    setIsRestingState(true);
                    setRestTimeLeft(Math.ceil((restEnd.getTime() - now.getTime()) / 1000));
                    setIsLoading(false);
                    return;
                } else {
                    setIsRestingState(false);
                    // Clear it from context if it's expired
                    const updatedRestEndTimes = { ...user.restEndTimes };
                    delete updatedRestEndTimes[`${grade}:${level}`];
                    updateUser({ ...user, restEndTimes: updatedRestEndTimes });
                }
            }

            // --- Level access guard (students only) ---
            if (user.role === 'student' && level) {
                const levelIndex = LEVELS.indexOf(level);
                if (levelIndex > 0) {
                    try {
                        const prevLevel = LEVELS[levelIndex - 1];
                        const countsRes = await api.get('/questions/level-counts');
                        const counts: Record<string, any> = countsRes.data;
                        const prevKey = `${grade}:${prevLevel}`;
                        const prevStats = counts[prevKey] || counts[prevLevel];
                        const prevTotal = prevStats?.totalQuestions ?? 0;
                        const prevProgress = user.levelProgress?.[prevKey] ?? user.levelProgress?.[prevLevel] ?? 0;
                        if (prevTotal === 0 || prevProgress < prevTotal) {
                            navigate('/dashboard', { replace: true });
                            return;
                        }
                    } catch {
                        navigate('/dashboard', { replace: true });
                        return;
                    }
                }
            }

            try {
                const questionsUrl = stage
                    ? `/questions/by-stage?grade=${grade}&level=${level}&stage=${stage}`
                    : `/questions/by-level?grade=${grade}&level=${level}`;

                const [qRes, startRes] = await Promise.all([
                    api.get(questionsUrl),
                    api.post('/questions/start', { grade, level })
                ]);

                const allQuestions = qRes.data;
                const updatedUser = startRes.data;

                // Check if the fresh status reveals a rest period (e.g., sessions expired)
                const freshRestEnd = updatedUser.restEndTimes?.[`${grade}:${level}`];
                if (freshRestEnd) {
                    const now = new Date();
                    const restEnd = new Date(freshRestEnd);
                    if (now < restEnd) {
                        setQuestions(allQuestions);
                        updateUser(updatedUser);
                        setIsRestingState(true);
                        setRestTimeLeft(Math.ceil((restEnd.getTime() - now.getTime()) / 1000));
                        setIsLoading(false);
                        return;
                    }
                }

                setQuestions(allQuestions);
                updateUser(updatedUser);

                // Load progress based on stageProgress or answeredQuestions
                const answeredIds = updatedUser.answeredQuestions || [];
                let progressIndex = 0;

                const stageKey = `${grade}:${level}:${stage}`;
                const savedStageProgress = updatedUser.stageProgress?.[stageKey];

                if (stage && savedStageProgress !== undefined) {
                    progressIndex = savedStageProgress;
                } else {
                    // Fallback to searching answered questions if no stageProgress is found
                    for (let i = 0; i < allQuestions.length; i++) {
                        if (answeredIds.includes(allQuestions[i]._id)) {
                            progressIndex = i + 1;
                        } else {
                            break;
                        }
                    }
                }

                setCurrentIndex(progressIndex >= allQuestions.length ? 0 : progressIndex);

                // Handle timer
                const freshQuizStart = updatedUser.quizStartTimes?.[`${grade}:${level}`];
                if (freshQuizStart) {
                    const startTime = new Date(freshQuizStart);
                    const now = new Date();
                    const diffSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                    const limitSeconds = 20 * 60;

                    if (diffSeconds >= limitSeconds) {
                        // 20 min elapsed — call start again so backend sets restEndTime
                        const restTriggerRes = await api.post('/questions/start', { grade, level });
                        const restUser = restTriggerRes.data;
                        updateUser(restUser);
                        setIsRestingState(true);
                        const finalRestEnd = restUser.restEndTimes?.[`${grade}:${level}`];
                        if (finalRestEnd) {
                            const now2 = new Date();
                            const restEnd = new Date(finalRestEnd);
                            const remaining = Math.ceil((restEnd.getTime() - now2.getTime()) / 1000);
                            setRestTimeLeft(remaining > 0 ? remaining : 3600);
                        } else {
                            setRestTimeLeft(3600);
                        }
                    } else {
                        setTimeLeft(limitSeconds - diffSeconds);
                    }
                }
            } catch (err) {
                console.error('Error fetching questions or starting quiz:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatusAndFetch();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [level]); // Removed user and navigate from dependencies to prevent infinite loop/flicker

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !isResting) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else if (timeLeft === 0 && !isResting) {
            // Timer expired — call backend so it sets restEndTime, then show countdown
            const triggerRest = async () => {
                try {
                    const res = await api.post('/questions/start', { grade, level });
                    const restUser = res.data;
                    updateUser(restUser);
                    const freshRestEnd = restUser.restEndTimes?.[`${grade!}:${level!}`];
                    if (freshRestEnd) {
                        const now = new Date();
                        const restEnd = new Date(freshRestEnd);
                        const remaining = Math.ceil((restEnd.getTime() - now.getTime()) / 1000);
                        setRestTimeLeft(remaining > 0 ? remaining : 3600);
                    } else {
                        setRestTimeLeft(3600);
                    }
                } catch (err) {
                    console.error('Error triggering rest period:', err);
                    setRestTimeLeft(3600);
                }
                setIsRestingState(true);
            };
            triggerRest();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, isResting]); // Add isResting to clear interval when resting starts

    useEffect(() => {
        let restInterval: any;
        if (isResting && restTimeLeft !== null && restTimeLeft > 0) {
            restInterval = setInterval(() => {
                setRestTimeLeft(prev => {
                    if (prev !== null && prev <= 1) {
                        // Time is up! Re-fetch status
                        clearInterval(restInterval);
                        window.location.reload(); // Refresh to re-trigger checkStatusAndFetch
                        return 0;
                    }
                    return prev !== null ? prev - 1 : 0;
                });
            }, 1000);
        }
        return () => clearInterval(restInterval);
    }, [isResting, restTimeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = async (isCorrect: boolean, selectedAnswer: string) => {
        try {
            if (user && questions[currentIndex]) {
                const response = await api.post(`/questions/answer/${questions[currentIndex]._id}`, {
                    answer: selectedAnswer,
                    grade,
                    level,
                    index: isCorrect ? currentIndex + 1 : currentIndex,
                    stage: stage ? Number(stage) : undefined
                });

                if (response.data.error === 'TIME_UP' || response.data.error === 'REST_PERIOD' || response.data.error === 'OUT_OF_CHANCES') {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setIsRestingState(true);
                    updateUser(response.data.user);
                    return;
                }

                const { user: updatedUser, addedReward } = response.data;
                if (addedReward > 0) {
                    setScore(prev => prev + addedReward);
                }
                updateUser(updatedUser);

                if (isCorrect) {
                    if (currentIndex < questions.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                    } else {
                        if (stage) {
                            // Stage completion
                            try {
                                const res = await api.post('/questions/complete-stage', {
                                    grade,
                                    level,
                                    stage: Number(stage)
                                });
                                console.log('Stage completion response:', res.data);
                                setStageReward(res.data.reward);
                                setIsChestOpen(false); // Reset for new stage

                                // Refresh user data to get updated completedStages and progress
                                const statusRes = await api.get('/questions/status');
                                updateUser(statusRes.data);
                            } catch (err) {
                                console.error('Error completing stage:', err);
                            }
                        }
                        setShowFinished(true);
                    }
                }
            }
        } catch (err) {
            console.error('Error updating stats:', err);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (isResting) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card"
                    style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}
                >
                    <Clock size={60} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>İstirahət vaxtıdır!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Beyninizi dincəltmək üçün 1 saat gözləməlisiniz.
                    </p>
                    {restTimeLeft !== null && (
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2rem' }}>
                            {formatTime(restTimeLeft)}
                        </div>
                    )}
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
                        Dashboard-a Qayıt
                    </button>
                </motion.div>
            </div>
        );
    }

    if (showFinished) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card"
                    style={{ padding: '1.5rem', maxWidth: '400px', margin: '0 auto', position: 'relative', overflow: 'hidden', border: '1px solid var(--warning)' }}
                >
                    {/* Background glow for victory */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--warning) 0%, transparent 70%)', opacity: 0.1, pointerEvents: 'none' }} />

                    <Trophy size={40} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                    <h1 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '0.25rem', fontWeight: 900 }}>ƏHSƏN!</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                        {stage ? `Səviyyə ${level?.replace('level', '')} - Mərhələ ${stage} tamamlandı!` : `Səviyyə ${level?.replace('level', '')} tamamlandı!`}
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1rem', marginBottom: '1.2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.1rem', fontWeight: 600 }}>CƏM QAZANC:</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--success)', textShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }}>
                            +{score.toFixed(2)} AZN
                        </div>
                    </div>

                    {stageReward && (
                        /* existing reward UI */
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--primary)' }}>SANDIQ MÜKAFATI</span>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
                            </div>

                            {!isChestOpen ? (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '1.2rem', border: '1px dashed rgba(255,255,255,0.2)', cursor: 'pointer' }}
                                    onClick={() => setIsChestOpen(true)}
                                >
                                    <motion.div
                                        animate={{ y: [0, -5, 0], rotate: [0, -5, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ display: 'inline-block', marginBottom: '0.5rem' }}
                                    >
                                        <Gift size={40} color="#f59e0b" />
                                    </motion.div>
                                    <button className="btn-rpg" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', '--n-color': '#f59e0b' } as any}>
                                        Sandığı Aç
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                                >
                                    <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                                        {stageReward.itemImage ? (
                                            <img src={stageReward.itemImage} alt={stageReward.itemName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Zap size={30} color="var(--primary)" />
                                        )}
                                        <div style={{ position: 'absolute', top: -10, right: -10, background: '#f59e0b', color: '#000', padding: '2px 6px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900 }}>
                                            +{stageReward.addedProgress}%
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.3rem' }}>{stageReward.itemName}</h3>
                                        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                                            <motion.div
                                                initial={{ width: `${stageReward.currentProgress - stageReward.addedProgress}%` }}
                                                animate={{ width: `${stageReward.currentProgress}%` }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700 }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Mövcud İrəliləmə:</span>
                                            <span style={{ color: '#f59e0b' }}>{stageReward.currentProgress}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {isChestOpen && stageReward.itemAwarded && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    style={{ marginTop: '1.2rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '0.6rem', borderRadius: '10px', color: '#000', fontSize: '0.85rem', fontWeight: 900, letterSpacing: '1px', boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}
                                >
                                    🎊 YENİ ƏŞYA QAZANILDI! 🎊
                                </motion.div>
                            )}
                        </div>
                    )}

                    {!stageReward && stage && (
                        <div style={{ marginBottom: '2.5rem', opacity: 0.6 }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Bu səviyyə üçün artıq sandıq mükafatı əldə edilib.
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button className="btn-rpg" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '0.7rem', fontSize: '0.8rem', '--n-color': 'var(--primary)' } as any}>
                            Panel-ə Qayıt
                        </button>
                        {stage && (
                            <button className="btn-rpg btn-rpg--outline" onClick={() => window.location.reload()} style={{ flex: 1, padding: '0.7rem', fontSize: '0.8rem', '--n-color': 'var(--secondary)' } as any}>
                                Yenidən Oyna
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-rpg"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', '--n-color': 'var(--text-muted)' } as any}
                >
                    <ArrowLeft size={16} /> Geri qayıt
                </button>

                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <div className="rpg-label" style={{ marginBottom: 0, fontSize: '0.75rem' }}>{level?.toUpperCase()}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '1px' }}>
                        {stage ? `MƏRHƏLƏ ${stage}` : 'ÜMUMİ MƏŞQ'}
                    </div>
                </div>

                {timeLeft !== null && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: chances <= 1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: chances <= 1 ? '#ef4444' : 'inherit'
                        }}>
                            <span style={{ fontWeight: 700 }}>Şanslar: {chances}/5</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: timeLeft < 60 ? '#ef4444' : 'inherit'
                        }}>
                            <Timer size={18} />
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem' }}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    <span>Sual {currentIndex + 1} / {questions.length}</span>
                    <span style={{ color: 'var(--primary)' }}>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div style={{ background: 'var(--surface)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', height: '100%' }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {questions.length > 0 && questions[currentIndex] && (
                    <QuestionCard
                        key={questions[currentIndex]._id}
                        question={questions[currentIndex]}
                        onAnswer={handleAnswer}
                        stage={stage}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Quiz;
