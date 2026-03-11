import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { ScrollText, Plus, Trash2, CheckCircle, Target, Gift, Edit2 } from 'lucide-react';

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

interface FighterItem {
    _id: string;
    name: string;
    category: string;
}

const AdminMissions: React.FC = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [chestRewards, setChestRewards] = useState<ChestReward[]>([]);
    const [items, setItems] = useState<FighterItem[]>([]);
    const [activeTab, setActiveTab] = useState<'missions' | 'achievements' | 'chests'>('missions');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'quiz_answer',
        targetCount: 5,
        rewardType: 'azn',
        rewardValue: 0.05,
        amount: 0,
        itemId: '',
        isActive: true
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '0.8rem',
        borderRadius: '8px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none'
    };

    const selectStyle = {
        width: '100%',
        background: 'rgba(15, 23, 42, 1)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '0.8rem',
        borderRadius: '8px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none'
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [mRes, aRes, cRes, iRes] = await Promise.all([
                api.get('/admin/missions/daily'),
                api.get('/admin/missions/achievements'),
                api.get('/admin/missions/chest-rewards'),
                api.get('/admin/fighter/items'),
            ]);
            setMissions(mRes.data);
            setAchievements(aRes.data);
            setChestRewards(cRes.data);
            setItems(iRes.data);
        } catch (err) {
            console.error('Error fetching admin missions data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            let endpoint = '';
            if (activeTab === 'missions') endpoint = '/admin/missions/daily';
            else if (activeTab === 'achievements') endpoint = '/admin/missions/achievements';
            else endpoint = '/admin/missions/chest-rewards';

            if (editId) {
                await api.put(`${endpoint}/${editId}`, form);
            } else {
                await api.post(endpoint, form);
            }

            setShowForm(false);
            setEditId(null);
            resetForm();
            fetchAll();
        } catch (err) {
            console.error('Error saving', err);
        }
    };

    const resetForm = () => {
        setDropdownOpen(false);
        setForm({
            title: '',
            description: '',
            type: activeTab === 'chests' ? 'azn' : 'quiz_answer',
            targetCount: 5,
            rewardType: 'azn',
            rewardValue: 0.05,
            amount: 0,
            itemId: '',
            isActive: true
        });
    };

    const startEdit = (item: any) => {
        setEditId(item._id);
        setForm({
            title: item.title || '',
            description: item.description || '',
            type: item.type,
            targetCount: item.targetCount || 0,
            rewardType: item.rewardType || 'azn',
            rewardValue: item.rewardValue || 0,
            amount: item.amount || 0,
            itemId: item.itemId || '',
            isActive: item.isActive
        });
        setShowForm(true);
    };

    const toggleActive = async (id: string, current: boolean) => {
        try {
            let endpoint = '';
            if (activeTab === 'missions') endpoint = '/admin/missions/daily';
            else if (activeTab === 'achievements') endpoint = '/admin/missions/achievements';
            else endpoint = '/admin/missions/chest-rewards';

            await api.put(`${endpoint}/${id}`, { isActive: !current });
            fetchAll();
        } catch (err) {
            console.error('Error toggling', err);
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Silmək istədiyinizdən əminsiniz?')) return;
        try {
            let endpoint = '';
            if (activeTab === 'missions') endpoint = '/admin/missions/daily';
            else if (activeTab === 'achievements') endpoint = '/admin/missions/achievements';
            else endpoint = '/admin/missions/chest-rewards';

            await api.delete(`${endpoint}/${id}`);
            fetchAll();
        } catch (err) {
            console.error('Error deleting', err);
        }
    };

    const missionTypes = [
        { value: 'quiz_answer', label: 'Sual cavabla' },
        { value: 'stage_complete', label: 'Stage tamamla' },
        { value: 'battle_win', label: 'Döyüş qazan' },
        { value: 'chest_open', label: 'Sandıq aç' },
    ];

    const chestRewardTypes = [
        { value: 'azn', label: 'AZN' },
        { value: 'item_progress', label: 'Item Proqresi' },
    ];

    if (loading) return <div className="loader" />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>Tapşırıqlar & Nailiyyətlər</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>Gündəlik tapşırıqları, nailiyyətləri və sandıq mükafatlarını idarə et</p>
                </div>
                <button
                    onClick={() => {
                        setEditId(null);
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: '#7c3aed', color: '#fff',
                        padding: '0.75rem 1.5rem', borderRadius: '12px',
                        border: 'none', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                    }}
                >
                    <Plus size={20} /> Yeni Əlavə Et
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0' }}>
                {[
                    { key: 'missions', label: 'Gündəlik Tapşırıqlar', icon: <Target size={20} /> },
                    { key: 'achievements', label: 'Nailiyyətlər', icon: <CheckCircle size={20} /> },
                    { key: 'chests', label: 'Sandıq Mükafatları', icon: <Gift size={20} /> },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key as any);
                            setShowForm(false);
                            setDropdownOpen(false);
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '1rem 0',
                            background: 'none', border: 'none',
                            borderBottom: activeTab === tab.key ? '3px solid #7c3aed' : '3px solid transparent',
                            color: activeTab === tab.key ? '#7c3aed' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {activeTab !== 'chests' ? (
							<>
								<div>
									<label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Başlıq</label>
									<input
										style={inputStyle}
										value={form.title}
										onChange={e => setForm({ ...form, title: e.target.value })}
										placeholder="Tapşırıq başlığı"
									/>
								</div>
								<div>
									<label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Növ</label>
									<select 
										style={selectStyle}
										value={form.type} 
										onChange={e => setForm({ ...form, type: e.target.value })}
									>
										{missionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
									</select>
								</div>
								<div>
									<label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Açıqlama</label>
									<input
										style={inputStyle}
										value={form.description}
										onChange={e => setForm({ ...form, description: e.target.value })}
										placeholder="Qısa açıqlama"
									/>
								</div>
								<div>
									<label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Hədəf Say</label>
									<input
										style={inputStyle}
										type="number"
										value={form.targetCount}
										onChange={e => setForm({ ...form, targetCount: +e.target.value })}
									/>
								</div>
								<div>
									<label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Mükafat Növü</label>
									<select 
										style={selectStyle}
										value={form.rewardType} 
										onChange={e => setForm({ ...form, rewardType: e.target.value })}
									>
										<option value="azn">AZN</option>
										<option value="chest">Sandıq</option>
									</select>
								</div>
								<div>
									<label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Mükafat Dəyəri (AZN)</label>
									<input
										style={inputStyle}
										type="number"
										step="0.01"
										disabled={form.rewardType !== 'azn'}
										value={form.rewardValue}
										onChange={e => setForm({ ...form, rewardValue: +e.target.value })}
									/>
								</div>
							</>
                        ) : (
                            <>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Növ</label>
                                    <select 
                                        style={selectStyle}
                                        value={form.type} 
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                    >
                                        {chestRewardTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Miqdar / Faiz</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: +e.target.value })}
                                    />
                                </div>
                                {form.type === 'item_progress' && (
                                    <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.6rem' }}>Item Seçimi</label>
                                        <div 
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            style={{
                                                ...selectStyle,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: 'rgba(15, 23, 42, 1)'
                                            }}
                                        >
                                            <span>
                                                {form.itemId ? 
                                                    (items.find(i => i._id === form.itemId)?.name || 'Yüklənir...') 
                                                    : 'Item seçin...'}
                                            </span>
                                            <ScrollText size={16} style={{ opacity: 0.5 }} />
                                        </div>

                                        {dropdownOpen && (
                                            <div 
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    zIndex: 100,
                                                    marginTop: '0.5rem',
                                                    background: '#1f2937',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px',
                                                    maxHeight: '200px', // Roughly 5 items
                                                    overflowY: 'auto',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                                    scrollbarWidth: 'thin',
                                                    scrollbarColor: '#7c3aed transparent'
                                                }}
                                            >
                                                {items.map(item => (
                                                    <div
                                                        key={item._id}
                                                        onClick={() => {
                                                            setForm({ ...form, itemId: item._id });
                                                            setDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: '0.8rem 1rem',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        {item.name} <span style={{ opacity: 0.4, fontSize: '0.8rem' }}>({item.category})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={() => {
                                setShowForm(false);
                                setEditId(null);
                            }}
                            style={{
                                background: '#374151', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            Ləğv et
                        </button>
                        <button 
                            onClick={handleSave}
                            style={{
                                background: '#7c3aed', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                            }}
                        >
                            Saxla
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ background: 'rgba(31, 41, 55, 0.4)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            {activeTab !== 'chests' ? (
                                <>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>BAŞLIQ</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>AÇIQLAMA</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>NÖV</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>HƏDƏF</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>MÜKAFAT</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>STATUS</th>
                                </>
                            ) : (
                                <>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>NÖV</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>MİQDAR</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>ITEM</th>
                                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>STATUS</th>
                                </>
                            )}
                            <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>İŞLƏMLƏR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(activeTab === 'missions' ? missions : activeTab === 'achievements' ? achievements : chestRewards).length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <ScrollText size={48} style={{ marginBottom: '1rem', opacity: 0.2, margin: '0 auto' }} />
                                    <p style={{ fontSize: '1.1rem' }}>Heç bir qeyd tapılmadı. Yeni əlavə edin.</p>
                                </td>
                            </tr>
                        ) : (
                            (activeTab === 'missions' ? missions : activeTab === 'achievements' ? achievements : chestRewards).map(item => (
                                <tr key={item._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                    {activeTab !== 'chests' ? (
                                        <>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#fff' }}>{(item as any).title}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{(item as any).description}</td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {missionTypes.find(t => t.value === (item as any).type)?.label || (item as any).type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#fff' }}>{(item as any).targetCount}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#fbbf24', fontWeight: 700 }}>
                                                {(item as any).rewardType === 'azn' ? `+${(item as any).rewardValue} AZN` : '1 Sandıq'}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#fff', fontWeight: 700 }}>
                                                {chestRewardTypes.find(t => t.value === (item as any).type)?.label || (item as any).type}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: '#fff' }}>{(item as any).amount}{(item as any).type === 'item_progress' ? '%' : ' AZN'}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)' }}>
                                                {((item as any).type === 'item_progress' && (item as any).itemId) ? 
                                                    (items.find(i => i._id === (item as any).itemId)?.name || (item as any).itemId) 
                                                    : '-'}
                                            </td>
                                        </>
                                    )}
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <button
                                            onClick={() => toggleActive(item._id, item.isActive)}
                                            style={{
                                                background: item.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                border: `1px solid ${item.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                                color: item.isActive ? '#4ade80' : '#f87171',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {item.isActive ? 'Aktiv' : 'Deaktiv'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => startEdit(item)}
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteItem(item._id)}
                                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMissions;
