import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Trophy, AlertCircle, PlayCircle, Star, Lock, CheckCircle, Zap, Shield, Sword } from 'lucide-react';
import api from '../api/client';
import RulesModal from '../components/RulesModal';
import { useNavigate } from 'react-router-dom';
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
    { title: 'Məntiq & Məsələ', description: 'Sadə, mürəkkəb və məntiqli məsələlər.', icon: '🧠', color: '#06b6d4', glow: 'rgba(6,182,212,0.6)', rank: 'LEGEND' },
];

const zigzag = [0, 1, 0, -1, 0, 1];

/* ── XP-bar utility ── */
const XpBar: React.FC<{ pct: number; color: string; done: number; total: number; delay: number }> = ({ pct, color, done, total, delay }) => (
    <div className="g-xp-wrap">
        <div className="g-xp-labels">
            <span className="g-xp-label">XP</span>
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
                if (statusRes.data) updateUser(statusRes.data);
            } catch {
                setAvailableLevels(['level1']);
            }
        };
        fetchData();
    }, []);

    const isLevelCompleted = (level: string) => {
        const total = levelCounts[level];
        if (!total) return false;
        return (user?.levelProgress?.[level] ?? 0) >= total;
    };
    const isLevelAccessible = (level: string, index: number) => {
        if (!availableLevels.includes(level)) return false;
        if (!isStudent) return true;
        if (index === 0) return true;
        return isLevelCompleted(LEVELS[index - 1]);
    };
    const getLevelProgress = (level: string) => {
        const total = levelCounts[level] || 0;
        const done = user?.levelProgress?.[level] ?? 0;
        return total ? Math.min(100, Math.round((done / total) * 100)) : 0;
    };
    const getStarCount = (level: string) => {
        const p = getLevelProgress(level);
        return p >= 100 ? 3 : p >= 60 ? 2 : p >= 30 ? 1 : 0;
    };
    const currentLevelIndex = LEVELS.findIndex((l, i) => isLevelAccessible(l, i) && !isLevelCompleted(l));

    const completedCount = LEVELS.filter((l) => isLevelCompleted(l)).length;
    const overallPct = Math.round((completedCount / LEVELS.length) * 100);

    const handleLevelStart = (level: string) => {
        if (sessionStorage.getItem(`skipRules_${level}`) === 'true') { navigate(`/quiz/${level}`); return; }
        setSelectedLevel(level); setIsRulesModalOpen(true);
    };
    const handleConfirmStart = (dontShowAgain: boolean) => {
        if (selectedLevel) {
            if (dontShowAgain) sessionStorage.setItem(`skipRules_${selectedLevel}`, 'true');
            navigate(`/quiz/${selectedLevel}`);
        }
        setIsRulesModalOpen(false);
    };

    /* HUD stat cards */
    const hudStats = [
        { label: 'DÜZGÜN', value: user?.correctAnswers || 0, icon: <Trophy size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
        { label: 'SƏHV', value: user?.wrongAnswers || 0, icon: <AlertCircle size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
        { label: 'BALANS', value: `${Number(user?.balance || 0).toFixed(2)} ₼`, icon: <Star size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        { label: 'RANK', value: user?.level?.toUpperCase() || 'LVL 1', icon: <Shield size={20} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
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
                    {/* Avatar hex */}
                    <div className="g-player-avatar">
                        <div className="g-avatar-hex">
                            <Sword size={26} color="#fff" />
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
                        <span className="g-overall-sub">{completedCount} / {LEVELS.length} Mərhələ tamamlandı</span>
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
                        MƏRHƏLƏ XƏRİTƏSİ
                    </h2>
                    <div className="g-section-line" />
                </div>

                <div className="level-journey">
                    {LEVELS.map((level, index) => {
                        const isAvailable = availableLevels.includes(level);
                        const accessible = isLevelAccessible(level, index);
                        const completed = isLevelCompleted(level);
                        const locked = isAvailable && isStudent && !accessible;
                        const notInDb = !isAvailable;
                        const isCurrent = index === currentLevelIndex && accessible;
                        const progress = getLevelProgress(level);
                        const stars = getStarCount(level);
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

                                            {/* Stars */}
                                            <div className="level-stars">
                                                {[0, 1, 2].map(s => (
                                                    <motion.span key={s}
                                                        animate={stars > s ? { scale: [1, 1.5, 1], rotate: [0, 15, 0] } : {}}
                                                        transition={{ delay: s * 0.15, duration: 0.4 }}
                                                    >
                                                        <Star size={15}
                                                            fill={s < stars ? '#f59e0b' : 'none'}
                                                            color={s < stars ? '#f59e0b' : 'rgba(255,255,255,0.18)'}
                                                            style={{ filter: s < stars ? 'drop-shadow(0 0 5px #f59e0b)' : 'none' }}
                                                        />
                                                    </motion.span>
                                                ))}
                                            </div>
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
                                                <div className="level-label">Mərhələ {index + 1}</div>
                                                <h3 className="level-title" style={{ color: accessible ? 'var(--text)' : 'var(--text-muted)' }}>
                                                    {meta.title}
                                                </h3>
                                                <p className="level-desc">{meta.description}</p>
                                            </div>
                                        </div>

                                        {/* ── XP bar ── */}
                                        {isAvailable && accessible && (
                                            <XpBar
                                                pct={progress}
                                                color={meta.color}
                                                done={user?.levelProgress?.[level] ?? 0}
                                                total={levelCounts[level] || 0}
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
