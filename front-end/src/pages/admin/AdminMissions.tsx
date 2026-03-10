import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { ScrollText, Plus, Trash2, CheckCircle, Target, Gift } from 'lucide-react';

interface Mission {
    _id: string;
    title: string;
    description: string;
    type: string;
    targetCount: number;
    rewardType: string;
    rewardValue: number;
    isActive: boolean;
}

interface Achievement {
    _id: string;
    title: string;
    description: string;
    type: string;
    targetCount: number;
    rewardType: string;
    rewardValue: number;
    isActive: boolean;
}

interface ChestReward {
    _id: string;
    type: string;
    amount: number;
    itemId?: string;
    isActive: boolean;
}

const AdminMissions: React.FC = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [chestRewards, setChestRewards] = useState<ChestReward[]>([]);
    const [activeTab, setActiveTab] = useState<'missions' | 'achievements' | 'chests'>('missions');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'answer_questions',
        targetCount: 5,
        rewardType: 'azn',
        rewardValue: 0.05,
    });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [mRes, aRes, cRes] = await Promise.all([
                api.get('/admin/missions'),
                api.get('/admin/achievements'),
                api.get('/admin/chest-rewards'),
            ]);
            setMissions(mRes.data);
            setAchievements(aRes.data);
            setChestRewards(cRes.data);
        } catch (err) {
            console.error('Error fetching admin missions data', err);
        } finally {
            setLoading(false);
        }
    };

    const createMission = async () => {
        try {
            const endpoint = activeTab === 'missions' ? '/admin/missions' : '/admin/achievements';
            await api.post(endpoint, form);
            setShowForm(false);
            setForm({ title: '', description: '', type: 'answer_questions', targetCount: 5, rewardType: 'azn', rewardValue: 0.05 });
            fetchAll();
        } catch (err) {
            console.error('Error creating', err);
        }
    };

    const toggleActive = async (id: string, current: boolean, type: 'mission' | 'achievement') => {
        try {
            const endpoint = type === 'mission' ? `/admin/missions/${id}` : `/admin/achievements/${id}`;
            await api.patch(endpoint, { isActive: !current });
            fetchAll();
        } catch (err) {
            console.error('Error toggling', err);
        }
    };

    const deleteItem = async (id: string, type: 'mission' | 'achievement') => {
        if (!confirm('Silmək istədiyinizdən əminsiniz?')) return;
        try {
            const endpoint = type === 'mission' ? `/admin/missions/${id}` : `/admin/achievements/${id}`;
            await api.delete(endpoint);
            fetchAll();
        } catch (err) {
            console.error('Error deleting', err);
        }
    };

    const missionTypes = [
        { value: 'answer_questions', label: 'Sual cavabla' },
        { value: 'complete_stages', label: 'Stage tamamla' },
        { value: 'win_battles', label: 'Döyüş qazan' },
        { value: 'open_chests', label: 'Sandıq aç' },
    ];

    const renderMissionRow = (item: Mission | Achievement, type: 'mission' | 'achievement') => (
        <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '1rem', fontWeight: 700 }}>{item.title}</td>
            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.description}</td>
            <td style={{ padding: '1rem' }}>{item.type}</td>
            <td style={{ padding: '1rem' }}>{item.targetCount}</td>
            <td style={{ padding: '1rem' }}>
                {item.rewardType === 'azn' ? `+${item.rewardValue} AZN` : '1 Sandıq'}
            </td>
            <td style={{ padding: '1rem' }}>
                <button
                    onClick={() => toggleActive(item._id, item.isActive, type)}
                    style={{
                        background: item.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${item.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        color: item.isActive ? '#22c55e' : '#ef4444',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                    }}
                >
                    {item.isActive ? 'Aktiv' : 'Deaktiv'}
                </button>
            </td>
            <td style={{ padding: '1rem' }}>
                <button
                    onClick={() => deleteItem(item._id, type)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <Trash2 size={15} />
                </button>
            </td>
        </tr>
    );

    if (loading) return <div className="loader" />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Tapşırıqlar & Nailiyyətlər</h1>
                    <p className="text-muted">Gündəlik tapşırıqları, nailiyyətləri və sandıq mükafatlarını idarə et</p>
                </div>
                {activeTab !== 'chests' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Yeni Əlavə Et
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
                {[
                    { key: 'missions', label: 'Gündəlik Tapşırıqlar', icon: <Target size={16} /> },
                    { key: 'achievements', label: 'Nailiyyətlər', icon: <CheckCircle size={16} /> },
                    { key: 'chests', label: 'Sandıq Mükafatları', icon: <Gift size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1.2rem',
                            background: 'none', border: 'none',
                            borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                            marginBottom: '-1px', transition: 'all 0.2s',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Create Form */}
            {showForm && activeTab !== 'chests' && (
                <div className="glass-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Başlıq</label>
                        <input
                            className="form-input"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Tapşırıq başlığı"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Növ</label>
                        <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            {missionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Açıqlama</label>
                        <input
                            className="form-input"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Qısa açıqlama"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Hədəf Say</label>
                        <input
                            className="form-input"
                            type="number"
                            value={form.targetCount}
                            onChange={e => setForm({ ...form, targetCount: +e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Mükafat Növü</label>
                        <select className="form-input" value={form.rewardType} onChange={e => setForm({ ...form, rewardType: e.target.value })}>
                            <option value="azn">AZN</option>
                            <option value="chest">Sandıq</option>
                        </select>
                    </div>
                    {form.rewardType === 'azn' && (
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Mükafat Dəyəri (AZN)</label>
                            <input
                                className="form-input"
                                type="number"
                                step="0.01"
                                value={form.rewardValue}
                                onChange={e => setForm({ ...form, rewardValue: +e.target.value })}
                            />
                        </div>
                    )}
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} onClick={() => setShowForm(false)}>Ləğv et</button>
                        <button className="btn btn-primary" onClick={createMission}>Saxla</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                {activeTab === 'chests' ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Gift size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <p>Sandıq mükafatlarını backend API-dan idarə edin.<br />Endpoint: <code>/admin/chest-rewards</code></p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            Cari aktiv mükafat sayı: <strong>{chestRewards.length}</strong>
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Başlıq', 'Açıqlama', 'Növ', 'Hədəf', 'Mükafat', 'Status', ''].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'missions' ? missions : achievements).length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <ScrollText size={40} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                        <p>Heç bir qeyd tapılmadı. Yeni əlavə edin.</p>
                                    </td>
                                </tr>
                            ) : (
                                (activeTab === 'missions' ? missions : achievements).map(item =>
                                    renderMissionRow(item, activeTab === 'missions' ? 'mission' : 'achievement')
                                )
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminMissions;
