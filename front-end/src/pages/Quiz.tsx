import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import QuestionCard from '../components/QuestionCard';
import { Loader2, Trophy, ArrowLeft, Timer, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Quiz: React.FC = () => {
    const { level } = useParams<{ level: string }>();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showFinished, setShowFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isResting, setIsResting] = useState(false);
    const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);

    const timerRef = useRef<any>(null);
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    useEffect(() => {
        const checkStatusAndFetch = async () => {
            if (!user) return;

            // Check if resting
            if (user.restEndTime) {
                const now = new Date();
                const restEnd = new Date(user.restEndTime);
                if (now < restEnd) {
                    setIsResting(true);
                    setRestTimeLeft(Math.ceil((restEnd.getTime() - now.getTime()) / 1000));
                    setIsLoading(false);
                    return;
                } else {
                    // Rest period ended, proceed to fetch
                    setIsResting(false);
                    setRestTimeLeft(null);
                }
            }

            try {
                const [qRes, startRes] = await Promise.all([
                    api.get(`/questions/by-level?level=${level}`),
                    api.post('/questions/start')
                ]);

                const allQuestions = qRes.data;
                const updatedUser = startRes.data;

                setQuestions(allQuestions);
                updateUser(updatedUser);

                // Load progress
                const savedIndex = updatedUser.levelProgress?.[level || ''] || 0;
                setCurrentIndex(savedIndex >= allQuestions.length ? 0 : savedIndex);

                // Handle timer
                if (updatedUser.quizStartTime) {
                    const startTime = new Date(updatedUser.quizStartTime);
                    const now = new Date();
                    const diffSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                    const limitSeconds = 20 * 60;

                    if (diffSeconds >= limitSeconds) {
                        setIsResting(true);
                        // Refresh user
                        const userRes = await api.get('/questions/status');
                        updateUser(userRes.data);
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
    }, [level]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else if (timeLeft === 0) {
            setIsResting(true);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft]);

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
                    level,
                    index: isCorrect ? currentIndex + 1 : currentIndex
                });

                if (response.data.error === 'TIME_UP' || response.data.error === 'REST_PERIOD') {
                    setIsResting(true);
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
                        Limitiniz bitib. Beyninizi dincəltmək üçün 1 saat gözləməlisiniz.
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
                    style={{ padding: '4rem', maxWidth: '600px', margin: '0 auto' }}
                >
                    <Trophy size={80} color="var(--warning)" style={{ marginBottom: '2rem' }} />
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Təbriklər!</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                        {level?.toUpperCase()} mərhələsini tamamladınız.
                    </p>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem' }}>
                        Qazanılan: <span style={{ color: 'var(--success)' }}>+{score} AZN</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '1rem 3rem' }}>
                        Dashboard-a Qayıt
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                >
                    <ArrowLeft size={18} /> Geri qayıt
                </button>

                {timeLeft !== null && (
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
                )}
            </div>

            <div style={{ marginBottom: '3rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 600 }}>
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
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Quiz;
