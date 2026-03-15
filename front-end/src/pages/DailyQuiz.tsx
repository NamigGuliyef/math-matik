import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import QuestionCard from '../components/QuestionCard';
import { Loader2, Trophy, ArrowLeft, CalendarDays, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const DailyQuiz: React.FC = () => {
    const [quizData, setQuizData] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showFinished, setShowFinished] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const { showNotification } = useNotification();
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchDailyQuiz = async () => {
            try {
                const res = await api.get(`/daily-quiz/today?date=${today}`);
                if (res.data.alreadyPlayed) {
                    setErrorMsg('Bugünkü Daily Quiz artıq tamamlanıb. Sabah yenidən cəhd edin!');
                } else if (res.data.notFound) {
                    setErrorMsg('Bu gün üçün Daily Quiz təyin edilməyib.');
                } else if (res.data.quiz) {
                    setQuizData(res.data.quiz);
                    setQuestions(res.data.quiz.questions || []);
                }
            } catch (err: any) {
                setErrorMsg('Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDailyQuiz();
    }, [today]);

    const handleAnswer = async (_isCorrect: boolean, selectedAnswer: string) => {
        const currentQ = questions[currentIndex];
        const newAnswers = { ...answers, [currentQ._id]: selectedAnswer };
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finished all questions, submit!
            await submitQuiz(newAnswers);
        }
    };

    const submitQuiz = async (finalAnswers: Record<string, string>) => {
        setSubmitLoading(true);
        try {
            const res = await api.post('/daily-quiz/submit', {
                quizId: quizData._id,
                answers: finalAnswers,
                date: today
            });
            setResult(res.data);

            const { streakRewards } = res.data;
            if (streakRewards && streakRewards.length > 0) {
                streakRewards.forEach((milestone: any) => {
                    showNotification(`🔖 Yeni Streak! ${milestone.requirement} gün keçdiniz! Mükafatlar balansınıza əlavə edildi.`, 'success');
                });
            }

            // Update user balance/chests visually
            const statsRes = await api.get('/questions/status');
            updateUser(statsRes.data);

            setShowFinished(true);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Nəticəni göndərərkən xəta yarandı.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="#ec4899" />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card"
                    style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto', border: '1px solid rgba(236,72,153,0.3)' }}
                >
                    <CalendarDays size={60} color="#ec4899" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                    <h2 style={{ marginBottom: '1rem' }}>Daily Quiz Məlumatı</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
                        {errorMsg}
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', background: '#ec4899', borderColor: '#ec4899' }}>
                        Dashboard-a Qayıt
                    </button>
                </motion.div>
            </div>
        );
    }

    if (showFinished && result) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card"
                    style={{ padding: '2rem', maxWidth: '450px', margin: '0 auto', position: 'relative', overflow: 'hidden', border: `1px solid ${result.rewardGiven ? 'var(--success)' : 'rgba(255,255,255,0.1)'}` }}
                >
                    {result.rewardGiven && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(34,197,94,0.3) 0%, transparent 70%)', opacity: 0.5, pointerEvents: 'none' }} />}

                    <Trophy size={50} color={result.rewardGiven ? "var(--success)" : "var(--text-muted)"} style={{ marginBottom: '1rem' }} />
                    <h1 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '0.25rem', fontWeight: 900 }}>
                        {result.rewardGiven ? 'MÖHTƏŞƏM NƏTİCƏ!' : 'NƏTİCƏ'}
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text)', marginBottom: '1.5rem', fontWeight: 700 }}>
                        {result.correctCount} / {result.totalCount} düzgün cavab
                    </p>

                    {result.rewardGiven ? (
                        <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '0.5rem', fontWeight: 800 }}>QAZANDIĞINIZ MÜKAFATLAR:</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                                {result.rewardAzn > 0 && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>+{result.rewardAzn}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AZN</div>
                                    </div>
                                )}
                                {result.rewardChest > 0 && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ec4899' }}>+{result.rewardChest}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SANDIQ</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <p style={{ margin: 0, color: '#f87171', fontSize: '0.9rem', fontWeight: 600 }}>
                                Mükafat qazanmaq üçün ən azı 8 düzgün cavab verməliydiniz. Sabah yenidən cəhd edin!
                            </p>
                        </div>
                    )}

                    <button className="btn-rpg" onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', '--n-color': 'var(--primary)' } as any}>
                        Panel-ə Qayıt
                    </button>
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
                    <div className="rpg-label" style={{ marginBottom: 0, fontSize: '0.75rem', color: '#ec4899', borderColor: 'rgba(236,72,153,0.3)' }}>SPECIAL</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '1px' }}>
                        GÜNLÜK QUIZ
                    </div>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                    background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '12px', color: '#ec4899'
                }}>
                    <Zap size={18} />
                    <span style={{ fontWeight: 800 }}></span>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative', opacity: submitLoading ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    <span>Sual {currentIndex + 1} / {questions.length}</span>
                    <span style={{ color: '#ec4899' }}>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div style={{ background: 'var(--surface)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        style={{ background: 'linear-gradient(90deg, #ec4899, #f43f5e)', height: '100%' }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {questions.length > 0 && questions[currentIndex] && (
                    <div style={{ opacity: submitLoading ? 0.5 : 1, pointerEvents: submitLoading ? 'none' : 'auto' }}>
                        <QuestionCard
                            key={questions[currentIndex]._id}
                            question={questions[currentIndex]}
                            onAnswer={handleAnswer}
                        />
                    </div>
                )}
            </AnimatePresence>

            {submitLoading && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Loader2 className="animate-spin" size={32} color="#ec4899" style={{ margin: '0 auto' }} />
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Nəticə yoxlanılır...</p>
                </div>
            )}
        </div>
    );
};

export default DailyQuiz;
