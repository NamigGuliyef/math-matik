import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useMissionsCount } from '../context/MissionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, Gift, ArrowRight, CheckCircle2, Coins, X } from 'lucide-react';
import './Missions.css';

interface Mission {
    _id: string;
    title: string;
    description: string;
    type: string;
    targetCount: number;
    currentCount: number;
    rewardType: string;
    rewardValue: number;
    isClaimed: boolean;
}

const Missions: React.FC = () => {
    const { user, token, setUser } = useAuth();
    const { refreshMissions: updateBadgeCount } = useMissionsCount();
    const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
    const [achievements, setAchievements] = useState<Mission[]>([]);
    const [activeTab, setActiveTab] = useState<'daily' | 'achievements'>('daily');
    const [loading, setLoading] = useState(true);
    const [chestOpening, setChestOpening] = useState(false);
    const [chestResult, setChestResult] = useState<any>(null);
    const [claimResult, setClaimResult] = useState<any>(null);

    useEffect(() => {
        fetchMissions();
    }, [token]);

    const fetchMissions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/missions');
            setDailyMissions(res.data.daily);
            setAchievements(res.data.achievements);
        } catch (err) {
            console.error('Error fetching missions', err);
        } finally {
            setLoading(false);
        }
    };

    const claimReward = async (id: string) => {
        try {
            const res = await api.post(`/missions/claim/${id}`);

            if (res.data.success && user) {
                // Show claim notification
                setClaimResult({
                    rewardType: res.data.rewardType,
                    rewardValue: res.data.rewardValue
                });

                fetchMissions();
                updateBadgeCount();
                const updatedUser = { ...user };
                if (res.data.rewardType === 'azn') updatedUser.balance += res.data.rewardValue;
                if (res.data.rewardType === 'chest') updatedUser.chests += 1;
                setUser(updatedUser);
            }
        } catch (err) {
            console.error('Error claiming reward', err);
        }
    };

    const openChest = async () => {
        if (!user || user.chests <= 0) return;
        try {
            setChestOpening(true);
            setChestResult(null);
            const res = await api.post('/missions/open-chest');
            setChestResult(res.data);

            const updatedUser = { ...user };
            updatedUser.chests -= 1;
            if (res.data.type === 'azn') updatedUser.balance += res.data.amount;
            setUser(updatedUser);
        } catch (err) {
            console.error('Error opening chest', err);
        } finally {
            setChestOpening(false);
        }
    };

    const renderMissionCard = (m: Mission) => {
        const progress = Math.min(100, (m.currentCount / m.targetCount) * 100);
        const isReady = m.currentCount >= m.targetCount && !m.isClaimed;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={m._id}
                className={`mission-card ${m.isClaimed ? 'claimed' : ''}`}
            >
                <div className="mission-info">
                    <div>
                        <h3>{m.title}</h3>
                        <p>{m.description}</p>
                    </div>
                    <div className="reward-badge">
                        {m.rewardType === 'azn' ? <Coins size={14} /> : <Gift size={14} />}
                        {m.rewardType === 'azn' ? `+${m.rewardValue} AZN` : '+1 Sandıq'}
                    </div>
                </div>

                <div className="mission-progress-section">
                    <div className="progress-container">
                        <div className="progress-header">
                            <span className="progress-text">İrəliləmə</span>
                            <span className="progress-text">{m.currentCount} / {m.targetCount}</span>
                        </div>
                        <div className="progress-bar-bg">
                            <motion.div
                                className="progress-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>

                    <button
                        className={`claim-btn ${isReady ? 'ready' : ''} ${m.isClaimed ? 'claimed' : ''}`}
                        disabled={!isReady && !m.isClaimed}
                        onClick={() => isReady && claimReward(m._id)}
                    >
                        {m.isClaimed ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <CheckCircle2 size={16} /> Alındı
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {isReady ? 'Mükafatı Götür' : 'Davam edir'}
                                {!isReady && <ArrowRight size={14} />}
                            </div>
                        )}
                    </button>
                </div>
            </motion.div>
        );
    };

    if (loading) return (
        <div className="missions-loading">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '2rem' }}
            >
                <Target color="#7c3aed" />
            </motion.div>
            <p>Tapşırıqlar yüklənir...</p>
        </div>
    );

    return (
        <div className="missions-container">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="missions-header"
            >
                <div className="header-text">
                    <h1>Tapşırıqlar & Nailiyyətlər</h1>
                    <p>Hər gün yeni hədəflər, hər addımda yeni mükafatlar!</p>
                </div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="chest-section"
                    onClick={openChest}
                >
                    <div className={`chest-icon ${user?.chests && user.chests > 0 ? 'available' : ''}`}>
                        <Gift size={40} color={user?.chests && user.chests > 0 ? '#fbbf24' : '#4b5563'} />
                        {user?.chests && user.chests > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="chest-count"
                            >
                                {user.chests}
                            </motion.span>
                        )}
                    </div>
                    <div className="chest-info">
                        <p style={{ margin: 0, fontWeight: 800, color: '#fff' }}>Hədiyyə Sandığı</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            {user?.chests && user.chests > 0 ? 'Açmaq üçün klikləyin' : 'Sandığınız yoxdur'}
                        </p>
                    </div>
                </motion.div>
            </motion.header>

            <div className="missions-tabs">
                <button
                    className={activeTab === 'daily' ? 'active' : ''}
                    onClick={() => setActiveTab('daily')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={18} /> Gündəlik
                    </div>
                </button>
                <button
                    className={activeTab === 'achievements' ? 'active' : ''}
                    onClick={() => setActiveTab('achievements')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={18} /> Nailiyyətlər
                    </div>
                </button>
            </div>

            <motion.div
                layout
                className="missions-list"
            >
                <AnimatePresence mode="popLayout">
                    {activeTab === 'daily' ? (
                        dailyMissions.length > 0 ? dailyMissions.map(renderMissionCard) : (
                            <motion.p key="empty-d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-msg">Bu gün üçün hələ tapşırıq yoxdur.</motion.p>
                        )
                    ) : (
                        achievements.length > 0 ? achievements.map(renderMissionCard) : (
                            <motion.p key="empty-a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-msg">Hələ nailiyyət yoxdur.</motion.p>
                        )
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Chest Opening Overlay */}
            <AnimatePresence>
                {chestOpening && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="overlay"
                    >
                        <div className="opening-animation">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                style={{ fontSize: '6rem' }}
                            >
                                📦
                            </motion.div>
                            <h2 style={{ color: '#fff', marginTop: '1.5rem' }}>Sandıq açılır...</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reward Notification Modal (Both for Chest and Mission Claim) */}
            <AnimatePresence>
                {(chestResult || claimResult) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="overlay"
                        onClick={() => { setChestResult(null); setClaimResult(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="reward-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="modal-close"
                                onClick={() => { setChestResult(null); setClaimResult(null); }}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>

                            <h2>Təbriklər!</h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Yeni bir mükafat qazandınız</p>

                            <div className="reward-icon-container">
                                {chestResult ? (
                                    chestResult.type === 'azn' ? '💰' : <img src={chestResult.itemImage} alt="" style={{ width: '80px' }} />
                                ) : (
                                    claimResult.rewardType === 'azn' ? '💰' : '🎁'
                                )}
                            </div>

                            <div className="reward-description">
                                {chestResult ? (
                                    chestResult.type === 'azn' ? (
                                        <>Balansınıza <strong>{chestResult.amount} AZN</strong> əlavə edildi!</>
                                    ) : (
                                        <>
                                            <strong>{chestResult.itemName}</strong> üçün +{chestResult.progress}% irəliləmə!
                                            {chestResult.itemAwarded && <><br /><strong>Yeni Əşya Qazanıldı!</strong></>}
                                        </>
                                    )
                                ) : (
                                    claimResult.rewardType === 'azn' ? (
                                        <>Tapşırıqdan <strong>{claimResult.rewardValue} AZN</strong> qazandınız!</>
                                    ) : (
                                        <>Mükafat olaraq <strong>1 ədəd Hədiyyə Sandığı</strong> qazandınız!</>
                                    )
                                )}
                            </div>

                            <button className="reward-close-btn" onClick={() => { setChestResult(null); setClaimResult(null); }}>Əla!</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Missions;
