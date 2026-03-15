import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Trophy,
    AlertCircle,
    PlayCircle,
    Star,
    Lock,
    CheckCircle,
    Zap,
    Shield,
    Sword,
    ArrowLeft,
    Flame,
    Target,
    ShieldCheck,
    Loader2,
    Camera,
    Gamepad2,
    CalendarDays,
    Gift,
    Award,
    Medal,
    Crown
} from 'lucide-react';
import api from '../api/client';
import RulesModal from '../components/RulesModal';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import './Dashboard.css';

/* ── Math symbol particles ── */
const MATH_SYMBOLS = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    '+', '−', '×', '÷', '=', '%', '≠', '≤', '≥', '∞',
    '²', '³', '√', 'π', 'Σ', '∫', '△', '□', '○', '◇',
];

function seededRng(seed: number) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

const MathBackground: React.FC = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 35 }, (_, i) => {
            const rng = seededRng(i * 1337 + 42);
            const neonPalette = [
                'rgba(99,102,241,0.55)', 'rgba(139,92,246,0.55)',
                'rgba(6,182,212,0.55)', 'rgba(236,72,153,0.55)',
                'rgba(16,185,129,0.45)', 'rgba(245,158,11,0.45)',
            ];
            return {
                id: i,
                symbol: MATH_SYMBOLS[Math.floor(rng() * MATH_SYMBOLS.length)],
                left: rng() * 100,
                size: 1 + rng() * 2.2,
                opacity: 0.06 + rng() * 0.13,
                duration: 12 + rng() * 24,
                delay: rng() * -35,
                drift: (rng() - 0.5) * 160,
                startY: rng() * 130,
                color: neonPalette[Math.floor(rng() * neonPalette.length)],
            };
        });
    }, []);

    return (
        <div className="db-math-bg" aria-hidden="true">
            {/* Grid overlay */}
            <div className="db-grid-overlay" />
            {/* Scanlines */}
            <div className="db-scanlines" />
            {/* Corner accents */}
            <div className="db-corner db-corner--tl" />
            <div className="db-corner db-corner--tr" />
            <div className="db-corner db-corner--bl" />
            <div className="db-corner db-corner--br" />
            {/* Floating particles */}
            {particles.map(p => (
                <motion.span
                    key={p.id}
                    className="db-math-particle"
                    style={{
                        left: `${p.left}%`,
                        fontSize: `${p.size}rem`,
                        opacity: p.opacity,
                        color: p.color,
                        top: `${p.startY}%`,
                    }}
                    animate={{
                        y: [0, -window.innerHeight * 1.3],
                        x: [0, p.drift],
                        rotate: [0, (p.drift > 0 ? 1 : -1) * 30],
                        opacity: [p.opacity, p.opacity * 1.8, p.opacity],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    {p.symbol}
                </motion.span>
            ))}
        </div>
    );
};

/* ── Level data ── */
const LEVELS = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8', 'level9', 'level10'];

const levelMeta = [
    { title: 'Toplama & Çıxma', description: 'Riyazi toplama və çıxma misalları', icon: <Star size={24} />, color: '#6366f1', glow: 'rgba(99,102,241,0.6)', rank: 'NOVICE' },
    { title: 'Müqayisə & Boşluq', description: 'Rəqəmlərin müqayisəsi və boşluqlar', icon: <Shield size={24} />, color: '#10b981', glow: 'rgba(16,185,129,0.6)', rank: 'APPRENTICE' },
    { title: 'Sadə Vurma', description: 'Birrəqəmli ədədlərin vurulması', icon: <Sword size={24} />, color: '#f59e0b', glow: 'rgba(245,158,11,0.6)', rank: 'JOURNEYMAN' },
    { title: 'Mürəkkəb Vurma', description: 'Çoxrəqəmli ədədlərin vurulması', icon: <Zap size={24} />, color: '#ef4444', glow: 'rgba(239,68,68,0.6)', rank: 'EXPERT' },
    { title: 'Ardıcıllıq', description: 'Məntiqi say ardıcıllıqları', icon: <Trophy size={24} />, color: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', rank: 'MASTER' },
    { title: 'Məsələ & Məntiqi', description: 'Mürəkkəb riyazi məsələlər', icon: <PlayCircle size={24} />, color: '#ec4899', glow: 'rgba(236,72,153,0.6)', rank: 'GRANDMASTER' },
    { title: 'Bölmə & Qalıqlı', description: 'Bölmə əməliyyatı və qalıqlar', icon: <Star size={24} />, color: '#f97316', glow: 'rgba(249,115,22,0.6)', rank: 'LEGEND' },
    { title: 'Kəsrlər & Ondalıq', description: 'Kəsrlərlə iş və onluq saylar', icon: <Shield size={24} />, color: '#06b6d4', glow: 'rgba(6,182,212,0.6)', rank: 'IMMORTAL' },
    { title: 'Həndəsi Fiqurlar', description: 'Həndəsənin əsasları', icon: <Sword size={24} />, color: '#10b981', glow: 'rgba(16,185,129,0.6)', rank: 'DIVINE' },
    { title: 'Tənliklər', description: 'Məchulların tapılması', icon: <Gamepad2 size={24} />, color: '#f43f5e', glow: 'rgba(244,63,94,0.6)', rank: 'ETERNAL' }
];

const zigzag = [0, 1, 0, -1, 0, 1, 0, -1, 0, 1];

/* ── XP-bar utility ── */
const XpBar: React.FC<{ pct: number; color: string; done: number; total: number; delay: number }> = ({ pct, color, done, total, delay }) => (
    <div className="g-xp-wrap">
        <div className="g-xp-labels">
            <span className="g-xp-label">Mərhələ {done + 1}</span>
            <span className="g-xp-count">{done} / {total || '?'}</span>
        </div>
        <div className="g-xp-track">
            <motion.div
                className="g-xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: `linear-gradient(90deg, ${color}, ${color}bb)`, boxShadow: `0 0 10px ${color}` }}
            />
            {/* tick marks */}
            {[25, 50, 75].map(t => (
                <div key={t} className="g-xp-tick" style={{ left: `${t}%`, opacity: pct >= t ? 0.6 : 0.2 }} />
            ))}
        </div>
        <span className="g-xp-pct" style={{ color }}>{pct}%</span>
    </div>
);

const renderRankIcon = (iconName: string, size = 20) => {
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

/* ═══════════════════════════════ COMPONENT ═══════════════════════════════ */
const Dashboard: React.FC = () => {
    const { user, updateUser, token } = useAuth();
    const { showNotification } = useNotification();
    const [availableClasses, setAvailableClasses] = React.useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = React.useState<string>(user?.grade || '5A');
    const [availableLevels, setAvailableLevels] = React.useState<string[]>([]);
    const [levelCounts, setLevelCounts] = React.useState<Record<string, { totalQuestions: number; totalStages: number }>>({});
    const [isRulesModalOpen, setIsRulesModalOpen] = React.useState(false);
    const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null);
    const [showStagesLevel, setShowStagesLevel] = React.useState<string | null>(null);
    const [levelStages, setLevelStages] = React.useState<any[]>([]);
    const [loadingStages, setLoadingStages] = React.useState(false);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
    const [dailyQuizStatus, setDailyQuizStatus] = React.useState<{ available: boolean; alreadyPlayed: boolean }>({ available: false, alreadyPlayed: false });
    const [rankInfo, setRankInfo] = React.useState<{ currentRank: any; nextRank: any; totalAnswered: number } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const isStudent = user?.role === 'student';

    const handleAvatarClick = () => {
        if (!uploadingAvatar) {
            fileInputRef.current?.click();
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit to 5MB
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Şəkil ölçüsü 5MB-dan çox olmamalıdır', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingAvatar(true);
        try {
            const res = await api.post('/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.data) {
                updateUser(res.data);
                showNotification('Profil şəkli uğurla yeniləndi', 'success');
            }
        } catch (err: any) {
            console.error('Error uploading avatar:', err);
            showNotification(err.response?.data?.message || 'Şəkil yüklənərkən xəta baş verdi', 'error');
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/questions/available-classes');
                setAvailableClasses(res.data);
                if (user?.grade && res.data.includes(user.grade)) {
                    setSelectedGrade(user.grade);
                } else if (res.data.length > 0) {
                    setSelectedGrade(res.data[0]);
                }
            } catch (err) {
                console.error('Error fetching classes:', err);
            }
        };
        fetchClasses();
    }, [user?.grade]);

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedGrade) return;
            try {
                const [levelsRes, countsRes, statusRes] = await Promise.all([
                    api.get(`/questions/available-levels?grade=${selectedGrade}`),
                    api.get('/questions/level-counts'),
                    api.get('/questions/status'),
                ]);
                setAvailableLevels(levelsRes.data);
                setLevelCounts(countsRes.data);
                if (statusRes.data) updateUser(statusRes.data);
            } catch {
                setAvailableLevels(['level1']);
            }
        };
        fetchData();
    }, [selectedGrade]);

    useEffect(() => {
        const fetchDailyQuizStatus = async () => {
            if (!selectedGrade) return;
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await api.get(`/daily-quiz/today?date=${today}`);
                if (res.data.quiz) {
                    setDailyQuizStatus({ available: true, alreadyPlayed: false });
                } else if (res.data.alreadyPlayed) {
                    setDailyQuizStatus({ available: true, alreadyPlayed: true });
                } else {
                    setDailyQuizStatus({ available: false, alreadyPlayed: false });
                }
            } catch (err) {
                setDailyQuizStatus({ available: false, alreadyPlayed: false });
            }
        };
        fetchDailyQuizStatus();
    }, [selectedGrade]);

    const [userStreaks, setUserStreaks] = React.useState<any>(null);
    useEffect(() => {
        const fetchStreaks = async () => {
            try {
                const res = await api.get('/streaks/my-streaks');
                setUserStreaks(res.data);
            } catch (err) {
                console.error('Error fetching streaks:', err);
            }
        };
        fetchStreaks();
    }, []);

    useEffect(() => {
        const fetchRank = async () => {
            try {
                const res = await api.get('/ranks/my-rank');
                setRankInfo(res.data);
            } catch (err) {
                console.error('Error fetching rank info:', err);
            }
        };
        fetchRank();
    }, []);

    const isLevelCompleted = (level: string) => {
        const stats = levelCounts[`${selectedGrade}:${level}`] || levelCounts[level]; // Support both old and new format for fallback
        if (!stats) return false;
        return (user?.levelProgress?.[`${selectedGrade}:${level}`] ?? user?.levelProgress?.[level] ?? 0) >= stats.totalQuestions;
    };
    const isLevelAccessible = (level: string, index: number) => {
        if (!availableLevels.includes(level)) return false;
        if (!isStudent) return true;
        if (index === 0) return true;
        return isLevelCompleted(LEVELS[index - 1]);
    };
    const getLevelProgress = (level: string) => {
        const stats = levelCounts[`${selectedGrade}:${level}`] || levelCounts[level];
        if (!stats) return 0;

        // Calculate based on completed stages
        const completedStagesCount = user?.completedStages?.filter(s => s.startsWith(`${selectedGrade}:${level}:`)).length || 0;
        const totalStages = stats.totalStages || 1;

        return Math.min(100, Math.round((completedStagesCount / totalStages) * 100));
    };

    const currentLevelIndex = LEVELS.findIndex((l, i) => isLevelAccessible(l, i) && !isLevelCompleted(l));

    const completedCount = LEVELS.filter((l) => isLevelCompleted(l)).length;
    const overallPct = Math.round((completedCount / LEVELS.length) * 100);

    const handleLevelStart = async (level: string) => {
        setShowStagesLevel(level);
        setLoadingStages(true);
        try {
            const res = await api.get(`/questions/stages?grade=${selectedGrade}&level=${level}`);
            setLevelStages(res.data);
        } catch (err) {
            console.error('Error fetching stages:', err);
        } finally {
            setLoadingStages(false);
        }
    };
    const handleConfirmStart = (dontShowAgain: boolean) => {
        if (selectedLevel) {
            if (dontShowAgain) sessionStorage.setItem(`skipRules_${selectedLevel}`, 'true');
            const [grade, level, stage] = selectedLevel.split(':');
            navigate(`/quiz/${grade}/${level}/${stage}`);
        }
        setIsRulesModalOpen(false);
    };

    const handleStageClick = (level: string, stage: number, isAccessible: boolean) => {
        if (!isAccessible) return;
        const stageId = `${selectedGrade}:${level}:${stage}`;
        if (sessionStorage.getItem(`skipRules_${stageId}`) === 'true') {
            navigate(`/quiz/${selectedGrade}/${level}/${stage}`);
            return;
        }
        setSelectedLevel(stageId);
        setIsRulesModalOpen(true);
    };

    const currentStageNum = (user?.completedStages?.filter(s => s.startsWith(`${selectedGrade}:${user?.level || 'level1'}:`)).length || 0) + 1;

    /* HUD stat cards */
    const hudStats = [
        { label: 'DÜZGÜN', value: user?.correctAnswers || 0, icon: <Trophy size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
        { label: 'SƏHV', value: user?.wrongAnswers || 0, icon: <AlertCircle size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
        { label: 'BALANS', value: `${Number(user?.balance || 0).toFixed(2)} ₼`, icon: <Star size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        { label: 'RANK', value: rankInfo?.currentRank?.name || 'BAŞLANĞIC', icon: rankInfo?.currentRank ? renderRankIcon(rankInfo.currentRank.icon) : <Shield size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
        { label: 'MƏRHƏLƏ', value: currentStageNum, icon: <Zap size={20} />, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
        { label: 'QALİBİYYƏT', value: user?.totalBattlesWon || 0, icon: <Sword size={20} />, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
    ];

    return (
        <div className="dashboard-page-wrap">
            <MathBackground />

            <div className="container db-content" style={{ position: 'relative', zIndex: 1, paddingTop: '2rem', paddingBottom: '5rem' }}>

                {/* ── PLAYER HUD HEADER ── */}
                <motion.div
                    className="g-player-hud glass-card"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />

                    {/* Avatar hex */}
                    <div className={`g-player-avatar ${uploadingAvatar ? 'uploading' : ''}`} onClick={handleAvatarClick}>
                        <div className="g-avatar-hex">
                            {uploadingAvatar ? (
                                <Loader2 className="animate-spin" size={32} color="#fff" />
                            ) : user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="g-avatar-img" />
                            ) : (
                                <Sword size={34} color="#fff" />
                            )}
                        </div>
                        <div className="g-avatar-upload-overlay">
                            <Camera size={24} color="#fff" />
                        </div>
                    </div>

                    {/* Player info */}
                    <div className="g-player-info">
                        <h1 className="g-player-name" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {user?.name} <span className="g-player-surname">{user?.surname}</span>
                            {user?.grade && (
                                <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    color: '#38bdf8',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    letterSpacing: '1px',
                                    marginLeft: '4px',
                                    height: 'fit-content',
                                    border: '1px solid rgba(56, 189, 248, 0.2)'
                                }}>
                                    Sinif {user.grade.replace(/Sinif\s*/g, '')}
                                </span>
                            )}
                        </h1>

                        {/* Overall progress - EVEN MORE COMPACT */}
                        <div className="g-overall-progress" style={{ marginTop: '0.6rem', width: '100%', maxWidth: '280px', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="g-overall-label" style={{ marginBottom: '4px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.8px', opacity: 0.7 }}>KAMPANIYA</span>
                                <span className="g-overall-pct" style={{ color: '#6366f1', fontWeight: 900, fontSize: '0.7rem' }}>{overallPct}%</span>
                            </div>
                            <div className="g-overall-track" style={{ height: '4px', marginBottom: '4px' }}>
                                <motion.div
                                    className="g-overall-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallPct}%` }}
                                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="g-overall-sub" style={{ fontSize: '0.55rem', opacity: 0.5 }}>{completedCount}/{LEVELS.length} Səviyyə</span>
                            </div>
                        </div>

                        {/* Rank Progress */}
                        {rankInfo && (
                            <div className="g-overall-progress" style={{ marginTop: '0.6rem', width: '100%', maxWidth: '280px', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="g-overall-label" style={{ marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '0.55rem', letterSpacing: '0.8px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {rankInfo.currentRank ? renderRankIcon(rankInfo.currentRank.icon, 12) : <Award size={12} />}
                                        {rankInfo.currentRank?.name || 'YENİ'}
                                    </span>
                                    {rankInfo.nextRank ? (
                                        <span className="g-overall-pct" style={{ color: '#ec4899', fontWeight: 900, fontSize: '0.55rem' }}>
                                            Növbəti: {rankInfo.nextRank.name}
                                        </span>
                                    ) : (
                                        <span className="g-overall-pct" style={{ color: '#f59e0b', fontWeight: 900, fontSize: '0.55rem' }}>MAX RANK</span>
                                    )}
                                </div>
                                <div className="g-overall-track" style={{ height: '4px', marginBottom: '4px' }}>
                                    <motion.div
                                        className="g-overall-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${rankInfo.nextRank ? Math.min(100, Math.round((rankInfo.totalAnswered / rankInfo.nextRank.minQuestions) * 100)) : 100}%` }}
                                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                        style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="g-overall-sub" style={{ fontSize: '0.55rem', opacity: 0.5 }}>
                                        {rankInfo.totalAnswered} / {rankInfo.nextRank?.minQuestions || rankInfo.totalAnswered} Sual
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── STREAKS AS 2x2 GRID ── */}
                    {userStreaks && (
                        <div className="g-streaks-grid" style={{ marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', minWidth: '400px' }}>
                            {[
                                { key: 'daily', label: 'GÜNLÜK', val: userStreaks.currentDailyStreak, icon: <Flame size={14} fill="#f97316" />, color: '#f97316' },
                                { key: 'question', label: 'DOĞRU SUAL', val: userStreaks.currentQuestionStreak, icon: <Target size={14} />, color: '#3b82f6' },
                                { key: 'stage', label: 'MƏRHƏLƏ', val: userStreaks.currentStageStreak, icon: <Star size={14} fill="#8b5cf6" />, color: '#8b5cf6' },
                                { key: 'battle', label: 'QƏLƏBƏ', val: userStreaks.currentBattleStreak, icon: <ShieldCheck size={14} />, color: '#ef4444' }
                            ].map((st, idx) => {
                                const milestone = userStreaks.upcomingMilestones?.[st.key];
                                const target = milestone?.requirement || st.val || 1;
                                const progressPct = Math.min(100, (st.val / target) * 100);

                                return (
                                    <div key={idx} style={{ 
                                        background: 'rgba(255,255,255,0.02)', 
                                        padding: '10px 14px', 
                                        borderRadius: '14px', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: '8px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ color: st.color, display: 'flex' }}>{st.icon}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>{st.label}</div>
                                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressPct}%` }}
                                                        style={{ height: '100%', background: st.color, boxShadow: `0 0 8px ${st.color}44` }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{st.val}</span>
                                                {milestone && (
                                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 800 }}>/{target}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rewards section */}
                                        {milestone ? (
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.9 }}>
                                                {milestone.rewardAzn > 0 && (
                                                    <span style={{ color: '#10b981', fontSize: '0.55rem', fontWeight: 900, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        +{milestone.rewardAzn}AZN
                                                    </span>
                                                )}
                                                {milestone.rewardChest > 0 && (
                                                    <span style={{ color: '#f59e0b', fontSize: '0.55rem', fontWeight: 900, background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                        +{milestone.rewardChest} <Gift size={10} />
                                                    </span>
                                                )}
                                                {milestone.rewardItemProgress > 0 && (
                                                    <span style={{ color: '#8b5cf6', fontSize: '0.55rem', fontWeight: 900, background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        +{milestone.rewardItemProgress}%⭐
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)' }}>BÜTÜN MÜKAFATLAR QAZANILIB</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* ── SIDEBAR CLASS NAV ── */}
                <div className="g-sidebar-nav custom-scrollbar-hidden">
                    <div className="g-sidebar-label">SİNİF</div>
                    {availableClasses.map((grade, idx) => (
                        <motion.button
                            key={grade}
                            className={`g-sidebar-item ${selectedGrade === grade ? 'g-sidebar-item--active' : ''}`}
                            onClick={() => setSelectedGrade(grade)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="g-sidebar-item-num">{grade.replace(/Sinif\s*/g, '')}</span>
                            <span className="g-sidebar-item-tag">SİNİF</span>
                        </motion.button>
                    ))}
                    {availableClasses.length === 0 && (
                        <div className="g-sidebar-item" style={{ opacity: 0.5 }}>...</div>
                    )}
                </div>

                {/* ── HUD STAT CARDS ── */}
                <div className="g-hud-grid">
                    {hudStats.map((s, i) => (
                        <motion.div
                            key={i}
                            className="g-hud-card glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                            style={{ borderColor: `${s.color}33` }}
                            whileHover={{ scale: 1.04, borderColor: `${s.color}88` }}
                        >
                            <div className="g-hud-icon" style={{ background: s.bg, color: s.color }}>
                                {s.icon}
                            </div>
                            <div className="g-hud-data">
                                <span className="g-hud-label">{s.label}</span>
                                <span className="g-hud-value" style={{ color: s.color }}>{s.value}</span>
                            </div>
                            {/* corner accent */}
                            <div className="g-hud-corner" style={{ borderColor: s.color }} />
                        </motion.div>
                    ))}
                </div>


                {/* ── DAILY QUIZ BANNER ── */}
                {dailyQuizStatus.available && (
                    <motion.div
                        className="daily-quiz-banner glass-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            marginBottom: '2rem',
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: dailyQuizStatus.alreadyPlayed ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2))',
                            border: `1px solid ${dailyQuizStatus.alreadyPlayed ? 'rgba(255,255,255,0.1)' : 'rgba(236, 72, 153, 0.5)'}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: dailyQuizStatus.alreadyPlayed ? '#374151' : '#ec4899', padding: '0.8rem', borderRadius: '12px' }}>
                                <CalendarDays size={28} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: dailyQuizStatus.alreadyPlayed ? 'rgba(255,255,255,0.5)' : '#fff', fontWeight: 800 }}>
                                    Günlük Quiz
                                </h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                    {dailyQuizStatus.alreadyPlayed ? 'Bugünkü Daily Quiz artıq tamamlanıb.' : 'Gündəlik xüsusi quizi tamamla, mükafat qazan!'}
                                </p>
                            </div>
                        </div>
                        {!dailyQuizStatus.alreadyPlayed && (
                            <button
                                onClick={() => navigate('/daily-quiz')}
                                style={{ background: '#ec4899', color: 'white', padding: '0.8rem 2rem', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 0 15px rgba(236,72,153,0.5)', display: 'flex', alignItems: 'center' }}
                            >
                                <PlayCircle size={18} style={{ marginRight: '8px' }} /> İndi Başla
                            </button>
                        )}
                    </motion.div>
                )}

                {/* ── LEVEL JOURNEY ── */}
                <div className="g-section-header">
                    <div className="g-section-line" />
                    <h2 className="g-section-title">
                        <Zap size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        {showStagesLevel ? `${levelMeta[LEVELS.indexOf(showStagesLevel)].title} - MƏRHƏLƏLƏR` : 'SƏVİYYƏ XƏRİTƏSİ'}
                    </h2>
                    <div className="g-section-line" />
                </div>

                {showStagesLevel ? (
                    <div className="stages-container">
                        <motion.button
                            className="btn-rpg"
                            onClick={() => setShowStagesLevel(null)}
                            style={{ marginBottom: '2rem', padding: '0.6rem 1.2rem', fontSize: '0.85rem', '--n-color': 'var(--text-muted)' } as any}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft size={16} /> Geri qayıt
                        </motion.button>

                        <div className="stages-grid">
                            {loadingStages ? (
                                <div style={{ textAlign: 'center', width: '100%', padding: '3rem' }}>
                                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                                </div>
                            ) : levelStages.length > 0 ? (
                                levelStages.map((s, idx) => {
                                    const stageId = `${selectedGrade}:${showStagesLevel}:${s.stage}`;
                                    const isCompleted = user?.completedStages?.includes(stageId);
                                    // Accessible if it's stage 1, or if previous stage is completed
                                    const prevStageId = idx > 0 ? `${selectedGrade}:${showStagesLevel}:${levelStages[idx - 1].stage}` : null;
                                    const isAccessible = idx === 0 || (user?.completedStages?.includes(prevStageId!) ?? false);

                                    return (
                                        <motion.div
                                            key={s.stage}
                                            className={`stage-card glass-card ${isCompleted ? 'stage-card--completed' : ''} ${!isAccessible ? 'stage-card--locked' : ''}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => handleStageClick(showStagesLevel!, s.stage, isAccessible)}
                                        >
                                            <div className="stage-card-icon">
                                                {isCompleted ? <CheckCircle size={24} color="var(--success)" /> : !isAccessible ? <Lock size={24} color="var(--text-muted)" /> : <PlayCircle size={24} color="var(--primary)" />}
                                            </div>
                                            <div className="stage-card-info">
                                                <h3>Mərhələ {s.stage}</h3>
                                                <p>{s.totalQuestions} sual</p>
                                            </div>
                                            {isCompleted && <span className="stage-badge">TAMAMLANDI</span>}
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>
                                    Bu level üçün hələ ki mərhələ yoxdur.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="level-journey">
                        {LEVELS.map((level, index) => {
                            const isAvailable = availableLevels.includes(level);
                            const accessible = isLevelAccessible(level, index);
                            const completed = isLevelCompleted(level);
                            const locked = isAvailable && isStudent && !accessible;
                            const notInDb = !isAvailable;
                            const isCurrent = index === currentLevelIndex && accessible;
                            const progress = getLevelProgress(level);

                            const meta = levelMeta[index];
                            const zz = zigzag[index];

                            return (
                                <div
                                    key={level}
                                    className={`level-journey-row ${zz === 1 ? 'row-right' : zz === -1 ? 'row-left' : 'row-center'}`}
                                >
                                    {index > 0 && (
                                        <div className={`journey-connector ${accessible || completed ? 'connector-active' : ''}`}
                                            style={accessible || completed ? { '--c-color': meta.color } as any : {}} />
                                    )}

                                    <motion.div
                                        className="level-node-wrap"
                                        initial={{ opacity: 0, scale: 0.75 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.13, type: 'spring', stiffness: 220, damping: 22 }}
                                    >
                                        {/* Pulse ring */}
                                        {isCurrent && (
                                            <div className="level-current-pulse" style={{ background: meta.glow }} />
                                        )}

                                        <motion.div
                                            className={`level-node glass-card
                                                ${completed ? 'level-node--completed' : ''}
                                                ${isCurrent ? 'level-node--current' : ''}
                                                ${locked || notInDb ? 'level-node--locked' : ''}
                                            `}
                                            style={{
                                                borderColor: completed || isCurrent ? meta.color : undefined,
                                                boxShadow: completed
                                                    ? `0 0 30px ${meta.glow}, inset 0 1px 0 ${meta.color}55`
                                                    : isCurrent
                                                        ? `0 0 24px ${meta.glow}, inset 0 1px 0 ${meta.color}33`
                                                        : undefined,
                                            }}
                                            whileHover={accessible ? { scale: 1.025, y: -5 } : {}}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            onClick={() => accessible && handleLevelStart(level)}
                                        >
                                            {/* Animated neon border on hover / current */}
                                            {(isCurrent || completed) && (
                                                <div className="g-neon-border" style={{ '--n-color': meta.color } as any} />
                                            )}

                                            {/* ── Top row ── */}
                                            <div className="level-node-top">
                                                <div className="g-level-badge-wrap">
                                                    {/* Rank chip */}
                                                    <span className="g-rank-chip" style={{ color: meta.color, borderColor: `${meta.color}44`, background: `${meta.color}15` }}>
                                                        {meta.rank}
                                                    </span>
                                                    {/* Number badge */}
                                                    <div className="level-num-badge" style={{
                                                        background: accessible ? `linear-gradient(135deg, ${meta.color}, ${meta.color}99)` : 'var(--surface)',
                                                        boxShadow: accessible ? `0 0 12px ${meta.glow}` : 'none',
                                                        opacity: accessible ? 1 : 0.45,
                                                    }}>
                                                        {completed ? <CheckCircle size={16} color="white" />
                                                            : locked || notInDb ? <Lock size={14} color="var(--text-muted)" />
                                                                : <span style={{ color: 'white', fontWeight: 900, fontSize: '0.85rem' }}>0{index + 1}</span>}
                                                    </div>
                                                </div>

                                                {/* Stars removed as requested */}
                                            </div>

                                            {/* ── Body ── */}
                                            <div className="level-node-body">
                                                <div className="level-icon-wrap" style={{
                                                    background: accessible ? `linear-gradient(135deg, ${meta.color}2a, ${meta.color}0d)` : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${accessible ? meta.color + '44' : 'rgba(255,255,255,0.05)'}`,
                                                    boxShadow: accessible ? `inset 0 0 20px ${meta.color}22` : 'none',
                                                }}>
                                                    <span className="level-icon" style={{ filter: accessible ? 'none' : 'grayscale(1)' }}>
                                                        {meta.icon}
                                                    </span>
                                                </div>
                                                <div className="level-info">
                                                    <div className="level-label">Səviyyə {index + 1}</div>
                                                    <h3 className="level-title" style={{ color: accessible ? 'var(--text)' : 'var(--text-muted)' }}>
                                                        {meta.title}
                                                    </h3>
                                                    <p className="level-desc">{meta.description}</p>
                                                </div>
                                            </div>

                                            {/* ── Progress bar ── */}
                                            {isAvailable && accessible && (
                                                <XpBar
                                                    pct={progress}
                                                    color={meta.color}
                                                    done={user?.completedStages?.filter(s => s.startsWith(`${selectedGrade}:${level}:`)).length || 0}
                                                    total={levelCounts[`${selectedGrade}:${level}`]?.totalStages || levelCounts[level]?.totalStages || 0}
                                                    delay={index * 0.15}
                                                />
                                            )}

                                            {/* ── Action ── */}
                                            <div className="level-action">
                                                {accessible ? (
                                                    <motion.button
                                                        className="g-play-btn"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${meta.color}, ${meta.color}bb)`,
                                                            boxShadow: `0 4px 20px ${meta.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                                                        }}
                                                        whileHover={{ scale: 1.05, boxShadow: `0 8px 32px ${meta.glow}` }}
                                                        whileTap={{ scale: 0.96 }}
                                                        onClick={e => { e.stopPropagation(); handleLevelStart(level); }}
                                                    >
                                                        {completed ? <><Zap size={15} /> Yenidən Oyna</>
                                                            : isCurrent ? <><PlayCircle size={15} /> İndi Başla</>
                                                                : <><PlayCircle size={15} /> Davam Et</>}
                                                    </motion.button>
                                                ) : locked ? (
                                                    <div className="level-locked-msg">
                                                        <Lock size={13} /> Əvvəlki mərhələni bitir
                                                    </div>
                                                ) : (
                                                    <div className="level-locked-msg">⏳ Tezliklə</div>
                                                )}
                                            </div>

                                            {/* "CARİ" beacon */}
                                            {isCurrent && (
                                                <motion.div
                                                    className="level-current-badge"
                                                    animate={{ opacity: [1, 0.6, 1] }}
                                                    transition={{ duration: 1.4, repeat: Infinity }}
                                                    style={{ background: meta.color }}
                                                >
                                                    <Zap size={10} /> CARİ
                                                </motion.div>
                                            )}

                                            {/* Completed overlay stamp */}
                                            {completed && (
                                                <div className="g-completed-stamp">
                                                    <CheckCircle size={13} style={{ marginRight: 4 }} />
                                                    TAMAMLANDI
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
