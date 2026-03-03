import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Trash2 } from 'lucide-react';

interface FighterItem {
    _id: string;
    name: string;
    category: string;
    level: number;
    price: number;
}

const API_BASE = 'http://localhost:8002';

const AdminFighter: React.FC = () => {
    const { token } = useAuth();
    const { showNotification } = useNotification();
    const [items, setItems] = useState<FighterItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'şlem',
        level: 1,
        price: 0,
        image: ''
    });

    const categories = ['şlem', 'zireh', 'silah', 'qalxan', 'çəkmə', 'boyunbağı', 'şalvar', 'əlcək'];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const resp = await axios.get(`${API_BASE}/admin/fighter/items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(resp.data);
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const resp = await axios.post(`${API_BASE}/admin/fighter/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setNewItem({ ...newItem, image: resp.data.url });
            showNotification('Şəkil uğurla yükləndi!', 'success');
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Şəkil yüklənərkən xəta baş verdi', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/admin/fighter/items`, newItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewItem({ name: '', category: 'şlem', level: 1, price: 0, image: '' });
            showNotification('Yeni əşya yaradıldı!', 'success');
            fetchItems();
        } catch (err) {
            showNotification('Əşya yaradılarkən xəta baş verdi', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu əşyanı silmək istədiyinizə əminsiniz?')) return;
        try {
            await axios.delete(`${API_BASE}/admin/fighter/items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Əşya silindi', 'success');
            fetchItems();
        } catch (err) {
            showNotification('Silinmə zamanı xəta baş verdi', 'error');
        }
    };

    const clearAllItems = async () => {
        if (!window.confirm('BÜTÜN əşyaları silmək istədiyinizə əminsiniz? Bu geri qaytarıla bilməz!')) return;
        try {
            await axios.delete(`${API_BASE}/admin/fighter/items/clear-all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Bütün əşyalar silindi', 'success');
            fetchItems();
        } catch (e) {
            showNotification('Xəta baş verdi', 'error');
        }
    };

    const seedRequestedItems = async () => {
        const requested = [
            { category: 'şlem', level: 1, name: 'Qalın Dəri Papaq', price: 0.109 },
            { category: 'şlem', level: 2, name: 'Qladiator Dəbilqəsi', price: 0.500 },
            { category: 'şlem', level: 3, name: 'Əjdaha Tacı (Parlayan)', price: 2.000 },

            { category: 'zireh', level: 1, name: 'Kəndli Köynəyi', price: 0.150 },
            { category: 'zireh', level: 2, name: 'Cəngavər Zirehi (Dəmir)', price: 0.800 },
            { category: 'zireh', level: 3, name: 'Qızıl Qəhrəman Zirehi', price: 3.000 },

            { category: 'silah', level: 1, name: 'İti Taxta Qılınc', price: 0.120 },
            { category: 'silah', level: 2, name: 'İkiəlli Polad Qılınc', price: 0.700 },
            { category: 'silah', level: 3, name: 'Alovlu Qılınc', price: 2.500 },

            { category: 'qalxan', level: 1, name: 'Çatlaq Taxta Qalxan', price: 0.080 },
            { category: 'qalxan', level: 2, name: 'Üzərində Şir olan Qalxan', price: 0.450 },
            { category: 'qalxan', level: 3, name: 'İşıq Saçan Sehrli Qalxan', price: 1.800 },

            { category: 'çəkmə', level: 1, name: 'Köhnə Çarıq (Dəri)', price: 0.060 },
            { category: 'çəkmə', level: 2, name: 'Polad Ucluqlu Çəkmə', price: 0.350 },
            { category: 'çəkmə', level: 3, name: 'Qanadlı Çəkmə (Sürət)', price: 1.500 },

            { category: 'boyunbağı', level: 1, name: 'İpə Düzülmüş Dişlər', price: 0.200 },
            { category: 'boyunbağı', level: 2, name: 'Gümüş Qurd Medalyonu', price: 1.000 },
            { category: 'boyunbağı', level: 3, name: 'Ürək Döyüntülü Kristal', price: 4.000 },

            { category: 'şalvar', level: 1, name: 'Yamaqlı Kətan Şalvar', price: 0.090 },
            { category: 'şalvar', level: 2, name: 'Zirehli Dizlikli Şalvar', price: 0.550 },
            { category: 'şalvar', level: 3, name: 'Əjdaha Dərisindən Şalvar', price: 2.200 },

            { category: 'əlcək', level: 1, name: 'Yırtıq Dəri Əlcək', price: 0.050 },
            { category: 'əlcək', level: 2, name: 'Dəmir Yumruq (Zirehli)', price: 0.400 },
            { category: 'əlcək', level: 3, name: 'İldırım Saçan Əlcək', price: 1.700 },
        ];

        if (!window.confirm('Sistemdəki bütün əsas əşyaları yaratmaq istəyirsiniz? (Mövcud olanlar qalacaq)')) return;

        for (const item of requested) {
            try {
                await axios.post(`${API_BASE}/admin/fighter/items`, item, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (e) { console.error(e); }
        }
        fetchItems();
        showNotification('Bütün hazır əşyalar yaradıldı!', 'success');
    };

    return (
        <div className="admin-page" style={{ color: 'white' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Döyüşçü İnventarı İdarəetməsi</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Sistemdəki bütün əşyaları və səviyyələri buradan idarə edin.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={clearAllItems}
                        style={{ padding: '0.8rem 1.5rem', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Bütün Əşyaları Sil
                    </button>
                    <button
                        onClick={seedRequestedItems}
                        style={{ padding: '0.8rem 1.5rem', background: 'var(--secondary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Hazır Əşyaları Yarat
                    </button>
                </div>
            </header>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus size={24} color="var(--primary)" /> Yeni Əşya Əlavə Et
                </h2>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Ad</label>
                        <input
                            type="text"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            required
                            className="admin-input"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Kateqoriya</label>
                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            className="admin-input"
                            style={{ width: '100%', background: 'rgba(15, 23, 42, 1)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Səviyyə (1-3)</label>
                        <input
                            type="number"
                            min="1" max="3"
                            value={newItem.level}
                            onChange={(e) => setNewItem({ ...newItem, level: parseInt(e.target.value) })}
                            required
                            className="admin-input"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Qiymət (AZN)</label>
                        <input
                            type="number"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                            required
                            className="admin-input"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Şəkil</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="file"
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                style={{ padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', border: '1px dashed var(--border)', flex: 1, textAlign: 'center' }}
                            >
                                {uploading ? 'Yüklənir...' : 'Şəkil Seç'}
                            </label>
                            {newItem.image && (
                                <div style={{ width: '45px', height: '45px', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                                    <img src={newItem.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                            )}
                        </div>
                    </div>
                    <button type="submit" style={{ padding: '0.8rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                        Əlavə Et
                    </button>
                </form>
            </div>

            <div className="items-list">
                <h2 style={{ marginBottom: '1.5rem' }}>Mövcud Əşyalar</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {items.map(item => (
                        <div key={item._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.name}</div>
                                <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>{item.category} • Səviyyə {item.level}</div>
                                <div style={{ color: 'var(--warning)', fontWeight: 700 }}>{item.price} AZN</div>
                            </div>
                            <button
                                onClick={() => handleDelete(item._id)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminFighter;
