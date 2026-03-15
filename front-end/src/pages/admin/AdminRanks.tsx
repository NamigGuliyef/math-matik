import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Shield, 
    Plus, 
    Trash2, 
    Edit2, 
    Save, 
    X, 
    Star, 
    Trophy, 
    Target, 
    Zap, 
    Crown, 
    Sword,
    Medal,
    Award
} from 'lucide-react';
import api from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

interface Rank {
    _id: string;
    name: string;
    minQuestions: number;
    icon: string;
    order: number;
}

const ICON_OPTIONS = [
    { name: 'Star', icon: <Star size={20} /> },
    { name: 'Trophy', icon: <Trophy size={20} /> },
    { name: 'Target', icon: <Target size={20} /> },
    { name: 'Zap', icon: <Zap size={20} /> },
    { name: 'Crown', icon: <Crown size={20} /> },
    { name: 'Sword', icon: <Sword size={20} /> },
    { name: 'Shield', icon: <Shield size={20} /> },
    { name: 'Medal', icon: <Medal size={20} /> },
    { name: 'Award', icon: <Award size={20} /> },
];

const renderIcon = (iconName: string) => {
    const found = ICON_OPTIONS.find(i => i.name === iconName);
    return found ? found.icon : <Star size={20} />;
};

const AdminRanks: React.FC = () => {
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Rank>>({
        name: '',
        minQuestions: 0,
        icon: 'Star',
        order: 0
    });
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchRanks();
    }, []);

    const fetchRanks = async () => {
        try {
            const res = await api.get('/ranks');
            setRanks(res.data);
        } catch (err) {
            console.error('Error fetching ranks:', err);
            showNotification('Rankları yükləyərkən xəta baş verdi', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'minQuestions' || name === 'order' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && isEditing !== 'new') {
                await api.put(`/ranks/admin/${isEditing}`, formData);
                showNotification('Rank uğurla yeniləndi', 'success');
            } else {
                await api.post('/ranks/admin', formData);
                showNotification('Yeni rank yaradıldı', 'success');
            }
            setIsEditing(null);
            setFormData({ name: '', minQuestions: 0, icon: 'Star', order: 0 });
            fetchRanks();
        } catch (err) {
            console.error('Error saving rank:', err);
            showNotification('Xəta baş verdi', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu rankı silmək istədiyinizə əminsiniz?')) return;
        try {
            await api.delete(`/ranks/admin/${id}`);
            showNotification('Rank silindi', 'success');
            fetchRanks();
        } catch (err) {
            console.error('Error deleting rank:', err);
            showNotification('Silinərkən xəta baş verdi', 'error');
        }
    };

    const startEdit = (rank: Rank) => {
        setIsEditing(rank._id);
        setFormData(rank);
    };

    const startNew = () => {
        setIsEditing('new');
        setFormData({
            name: '',
            minQuestions: 0,
            icon: 'Star',
            order: ranks.length > 0 ? Math.max(...ranks.map(r => r.order)) + 1 : 0
        });
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    Rank İdarəetməsi
                </h1>
                <button
                    onClick={startNew}
                    className="admin-btn-primary"
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Yeni Rank
                </button>
            </div>

            {isEditing && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1.5rem' }}>
                        {isEditing === 'new' ? 'Yeni Rank Yarat' : 'Rankı Redaktə Et'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Rank Adı</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="admin-input"
                                placeholder="Məsələn: Usta"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Tələb olunan sual sayı</label>
                            <input
                                type="number"
                                name="minQuestions"
                                value={formData.minQuestions}
                                onChange={handleInputChange}
                                required
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Sıralama (Order)</label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleInputChange}
                                required
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>İkon</label>
                            <select
                                name="icon"
                                value={formData.icon}
                                onChange={handleInputChange}
                                required
                                className="admin-input"
                                style={{ backgroundColor: '#111827' }}
                            >
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt.name} value={opt.name}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsEditing(null)}
                                className="admin-btn-secondary"
                                style={{ padding: '0.6rem 1.5rem', borderRadius: '8px' }}
                            >
                                <X size={18} style={{ marginRight: '8px' }} /> Ləğv et
                            </button>
                            <button
                                type="submit"
                                className="admin-btn-primary"
                                style={{ padding: '0.6rem 2rem', borderRadius: '8px' }}
                            >
                                <Save size={18} style={{ marginRight: '8px' }} /> Yadda saxla
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(31, 41, 55, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(156, 163, 175, 1)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Sıra</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(156, 163, 175, 1)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>İkon</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(156, 163, 175, 1)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Rank Adı</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(156, 163, 175, 1)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Sual Sayı</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'rgba(156, 163, 175, 1)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranks.map((rank, index) => (
                            <tr key={rank._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '1rem 1.5rem', color: 'rgba(156, 163, 175, 1)' }}>{rank.order}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ color: 'var(--primary)', display: 'flex' }}>
                                        {renderIcon(rank.icon)}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 600 }}>{rank.name}</td>
                                <td style={{ padding: '1rem 1.5rem', color: '#fff' }}>{rank.minQuestions}+ sual</td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => startEdit(rank)}
                                            style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rank._id)}
                                            style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {ranks.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(156, 163, 175, 1)' }}>
                                    Heç bir rank tapılmadı. Yeni rank əlavə edin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRanks;
