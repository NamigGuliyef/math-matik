import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
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
    const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
    const [achievements, setAchievements] = useState<Mission[]>([]);
    const [activeTab, setActiveTab] = useState<'daily' | 'achievements'>('daily');
    const [loading, setLoading] = useState(true);
    const [chestOpening, setChestOpening] = useState(false);
    const [chestResult, setChestResult] = useState<any>(null);

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

            // Update local state and user object
            if (res.data.success && user) {
                fetchMissions();
                // Ideally update user balance/chests in context
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

            // Update user in context
            const updatedUser = { ...user };
            updatedUser.chests -= 1;
            if (res.data.type === 'azn') updatedUser.balance += res.data.amount;
            // Item progress is handled by the backend but we could update locally if needed
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
            <div key={m._id} className={`mission-card ${m.isClaimed ? 'claimed' : ''}`}>
                <div className="mission-info">
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <div className="reward-badge">
                        {m.rewardType === 'azn' ? `+${m.rewardValue} AZN` : '+1 Sandıq'}
                    </div>
                </div>
                <div className="mission-progress-container">
                    <div className="progress-text">{m.currentCount} / {m.targetCount}</div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <button
                        className={`claim-btn ${isReady ? 'ready' : ''}`}
                        disabled={!isReady}
                        onClick={() => claimReward(m._id)}
                    >
                        {m.isClaimed ? 'Alındı' : (isReady ? 'Götür' : 'Davam edir')}
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <div className="missions-loading">Yüklənir...</div>;

    return (
        <div className="missions-container">
            <header className="missions-header">
                <h1>Tapşırıqlar və Nailiyyətlər</h1>
                <div className="chest-section" onClick={openChest}>
                    <div className={`chest-icon ${user?.chests && user.chests > 0 ? 'available' : ''}`}>
                        📦
                        {user?.chests && user.chests > 0 && <span className="chest-count">{user.chests}</span>}
                    </div>
                    <p>{user?.chests && user.chests > 0 ? 'Sandıq açmaq üçün toxun' : 'Sandığınız yoxdur'}</p>
                </div>
            </header>

            <div className="missions-tabs">
                <button
                    className={activeTab === 'daily' ? 'active' : ''}
                    onClick={() => setActiveTab('daily')}
                >
                    Gündəlik Tapşırıqlar
                </button>
                <button
                    className={activeTab === 'achievements' ? 'active' : ''}
                    onClick={() => setActiveTab('achievements')}
                >
                    Nailiyyətlər
                </button>
            </div>

            <div className="missions-list">
                {activeTab === 'daily' ? (
                    dailyMissions.length > 0 ? dailyMissions.map(renderMissionCard) : <p className="empty-msg">Bu gün üçün hələ tapşırıq yoxdur.</p>
                ) : (
                    achievements.length > 0 ? achievements.map(renderMissionCard) : <p className="empty-msg">Hələ nailiyyət yoxdur.</p>
                )}
            </div>

            {chestOpening && (
                <div className="chest-overlay">
                    <div className="opening-animation">
                        <div className="chest-shaking">📦</div>
                        <p>Sandıq açılır...</p>
                    </div>
                </div>
            )}

            {chestResult && (
                <div className="chest-overlay" onClick={() => setChestResult(null)}>
                    <div className="reward-card" onClick={e => e.stopPropagation()}>
                        <h2>Təbriklər!</h2>
                        <div className="reward-content">
                            {chestResult.type === 'azn' ? (
                                <div className="reward-item">
                                    <span className="reward-icon">💰</span>
                                    <span className="reward-text">+{chestResult.amount} AZN qazandınız!</span>
                                </div>
                            ) : (
                                <div className="reward-item">
                                    <img src={chestResult.itemImage} alt={chestResult.itemName} className="reward-image" />
                                    <span className="reward-text">
                                        {chestResult.itemName} üçün +{chestResult.progress}% tərəqqi!
                                        {chestResult.itemAwarded && <strong> (Yeni Əşya Qazanıldı!)</strong>}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button className="close-reward-btn" onClick={() => setChestResult(null)}>Bağla</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Missions;
