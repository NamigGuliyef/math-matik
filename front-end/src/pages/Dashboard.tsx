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
    Loader2,
    Camera,
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
const LEVELS = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];

const levelMeta = [
    { title: 'Toplama & Çıxma', description: 'Riyazi toplama və çıxma misalları', icon: '➕', color: '#6366f1', glow: 'rgba(99,102,241,0.6)', rank: 'NOVICE' },
    { title: 'Müqayisə & Boşluq', description: 'Çatışmayan ədədi tap, ədədləri müqayisə et.', icon: '🔢', color: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', rank: 'ROOKIE' },
    { title: 'Sadə Vurma', description: 'Sadə vurma əməliyyatları və müqayisəsi.', icon: '✖️', color: '#ec4899', glow: 'rgba(236,72,153,0.6)', rank: 'FIGHTER' },
    { title: 'Mürəkkəb Vurma', description: 'Mürəkkəb vurma əməliyyatları və müqayisə.', icon: '🧮', color: '#f59e0b', glow: 'rgba(245,158,11,0.6)', rank: 'WARRIOR' },
    { title: 'Ardıcıllıq', description: 'Ardıcıllığı tamamla, ən böyük / kiçik tap.', icon: '📊', color: '#10b981', glow: 'rgba(16,185,129,0.6)', rank: 'CHAMPION' },
    { title: 'Məsələ & Məntiqi', description: 'Pul, yaş və s. , ədəd oxu, onluq-təklik məsələləri.', icon: '🧠', color: '#06b6d4', glow: 'rgba(6,182,212,0.6)', rank: 'LEGEND' },
];

const zigzag = [0, 1, 0, -1, 0, 1];

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

/* ═══════════════════════════════ COMPONENT ═══════════════════════════════ */
const Dashboard: React.FC = () => {
    const { user, updateUser, token } = useAuth();
    const { showNotification } = useNotification();
    const [availableLevels, setAvailableLevels] = React.useState<string[]>([]);
    const [levelCounts, setLevelCounts] = React.useState<Record<string, { totalQuestions: number; totalStages: number }>>({});
    const [isRulesModalOpen, setIsRulesModalOpen] = React.useState(false);
    const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null);
    const [showStagesLevel, setShowStagesLevel] = React.useState<string | null>(null);
    const [levelStages, setLevelStages] = React.useState<any[]>([]);
    const [loadingStages, setLoadingStages] = React.useState(false);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
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
        const fetchData = async () => {
            try {
                const [levelsRes, countsRes, statusRes] = await Promise.all([
                    api.get('/questions/available-levels'),
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
    }, []);

    const isLevelCompleted = (level: string) => {
        const stats = levelCounts[level];
        if (!stats) return false;
        return (user?.levelProgress?.[level] ?? 0) >= stats.totalQuestions;
    };
    const isLevelAccessible = (level: string, index: number) => {
        if (!availableLevels.includes(level)) return false;
        if (!isStudent) return true;
        if (index === 0) return true;
        return isLevelCompleted(LEVELS[index - 1]);
    };
    const getLevelProgress = (level: string) => {
        const stats = levelCounts[level];
        if (!stats) return 0;

        // Calculate based on completed stages
        const completedStagesCount = user?.completedStages?.filter(s => s.startsWith(`${level}:`)).length || 0;
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
            const res = await api.get(`/questions/stages?level=${level}`);
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
            // Extract the actual level from "levelN:stageM" if needed, but here it's just level
            const [level, stage] = selectedLevel.split(':');
            navigate(`/quiz/${level}/${stage}`);
        }
        setIsRulesModalOpen(false);
    };

    const handleStageClick = (level: string, stage: number, isAccessible: boolean) => {
        if (!isAccessible) return;
        const stageId = `${level}:${stage}`;
        if (sessionStorage.getItem(`skipRules_${stageId}`) === 'true') {
            navigate(`/quiz/${level}/${stage}`);
            return;
        }
        setSelectedLevel(stageId);
        setIsRulesModalOpen(true);
    };

    const currentStageNum = (user?.completedStages?.filter(s => s.startsWith(`${user?.level || 'level1'}:`)).length || 0) + 1;

    /* HUD stat cards */
    const hudStats = [
        { label: 'DÜZGÜN', value: user?.correctAnswers || 0, icon: <Trophy size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
        { label: 'SƏHV', value: user?.wrongAnswers || 0, icon: <AlertCircle size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
        { label: 'BALANS', value: `${Number(user?.balance || 0).toFixed(2)} ₼`, icon: <Star size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        { label: 'RANK', value: user?.level?.toUpperCase() || 'LVL 1', icon: <Shield size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
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
                                <Loader2 className="animate-spin" size={24} color="#fff" />
                            ) : user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="g-avatar-img" />
                            ) : (
                                <Sword size={26} color="#fff" />
                            )}
                        </div>
                        <div className="g-avatar-upload-overlay">
                            <Camera size={18} color="#fff" />
                        </div>
                    </div>

                    {/* Player info */}
                    <div className="g-player-info">
                        <div className="g-player-top">
                            <span className="g-player-tag">◈ OYUNÇU</span>
                            <span className="g-online-dot" />
                            <span className="g-online-txt">ONLİNE</span>
                        </div>
                        <h1 className="g-player-name">
                            {user?.name} <span className="g-player-surname">{user?.surname}</span>
                        </h1>
                        <p className="g-player-sub">Bugün hansı riyazi zirvəni fəth edəcəyik?</p>
                    </div>

                    {/* Overall progress */}
                    <div className="g-overall-progress">
                        <div className="g-overall-label">
                            <span>KAMPANIYA</span>
                            <span className="g-overall-pct" style={{ color: '#6366f1' }}>{overallPct}%</span>
                        </div>
                        <div className="g-overall-track">
                            <motion.div
                                className="g-overall-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${overallPct}%` }}
                                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </div>
                        <span className="g-overall-sub">{completedCount} / {LEVELS.length} Səviyyə tamamlandı</span>
                    </div>
                </motion.div>

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
                                    const stageId = `${showStagesLevel}:${s.stage}`;
                                    const isCompleted = user?.completedStages?.includes(stageId);
                                    // Accessible if it's stage 1, or if previous stage is completed
                                    const prevStageId = idx > 0 ? `${showStagesLevel}:${levelStages[idx - 1].stage}` : null;
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
                                                    done={user?.completedStages?.filter(s => s.startsWith(`${level}:`)).length || 0}
                                                    total={levelCounts[level]?.totalStages || 0}
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
