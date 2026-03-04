import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
    Plus, Trash2, Sword, Shield, HardHat,
    Footprints, Shirt, User as UserIcon, Award, Zap
} from 'lucide-react';

interface FighterItem {
    _id: string;
    name: string;
    category: string;
    level: number;
    price: number;
    image?: string;
}

const API_BASE = 'http://localhost:8002';

const AdminFighter: React.FC = () => {
    const { token } = useAuth();
    const { showNotification } = useNotification();
    const [items, setItems] = useState<FighterItem[]>([]);
    const [characters, setCharacters] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'items' | 'characters'>('items');
    const [uploading, setUploading] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        category: 'şlem',
        level: 1,
        price: 0,
        image: ''
    });

    const [newCharacter, setNewCharacter] = useState({
        name: '',
        level: 1,
        price: 0,
        image: ''
    });

    const categories = ['şlem', 'zireh', 'silah', 'qalxan', 'çəkmə', 'boyunbağı', 'şalvar', 'əlcək'];

    useEffect(() => {
        fetchItems();
        fetchCharacters();
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

    const fetchCharacters = async () => {
        try {
            const resp = await axios.get(`${API_BASE}/admin/fighter/characters`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCharacters(resp.data);
        } catch (err) {
            console.error('Error fetching characters:', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'item' | 'character' = 'item') => {
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

            if (type === 'item') {
                setNewItem({ ...newItem, image: resp.data.url });
            } else {
                setNewCharacter({ ...newCharacter, image: resp.data.url });
            }

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

    const handleCreateCharacter = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/admin/fighter/characters`, newCharacter, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewCharacter({ name: '', level: 1, price: 0, image: '' });
            showNotification('Yeni karakter yaradıldı!', 'success');
            fetchCharacters();
        } catch (err) {
            showNotification('Karakter yaradılarkən xəta baş verdi', 'error');
        }
    };

    const handleDelete = async (id: string, type: 'item' | 'character' = 'item') => {
        if (!window.confirm('Bu seçimi silmək istədiyinizə əminsiniz?')) return;
        try {
            const endpoint = type === 'item' ? `items/${id}` : `characters/${id}`;
            await axios.delete(`${API_BASE}/admin/fighter/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Silindi', 'success');
            if (type === 'item') fetchItems();
            else fetchCharacters();
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

    const ItemThumbnail: React.FC<{ category: string; image?: string }> = ({ category, image }) => {
        if (image) {
            return <img src={image} alt={category} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
        }
        const iconSize = 24;
        switch (category) {
            case 'şlem': return <HardHat size={iconSize} />;
            case 'zireh': return <Shirt size={iconSize} />;
            case 'silah': return <Sword size={iconSize} />;
            case 'qalxan': return <Shield size={iconSize} />;
            case 'çəkmə': return <Footprints size={iconSize} />;
            case 'boyunbağı': return <Award size={iconSize} />;
            case 'şalvar': return <span style={{ fontSize: `${iconSize}px` }}>👖</span>;
            case 'əlcək': return <Zap size={iconSize} />;
            default: return <UserIcon size={iconSize} />;
        }
    };

    return (
        <div className="admin-page" style={{ color: 'white' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Döyüşçü İnventarı İdarəetməsi</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Sistemdəki bütün əşyaları və karakterləri buradan idarə edin.</p>
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

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('items')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'items' ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        borderBottom: activeTab === 'items' ? '2px solid var(--primary)' : 'none'
                    }}
                >
                    Əşyalar
                </button>
                <button
                    onClick={() => setActiveTab('characters')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'characters' ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        borderBottom: activeTab === 'characters' ? '2px solid var(--primary)' : 'none'
                    }}
                >
                    Karakterim
                </button>
            </div>

            {activeTab === 'items' ? (
                <>
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
                                        onChange={(e) => handleImageUpload(e, 'item')}
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                            {items.map(item => (
                                <div key={item._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                        <ItemThumbnail category={item.category} image={item.image} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>{item.name}</div>
                                        <div style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '4px' }}>{item.category} • Səviyyə {item.level}</div>
                                        <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.95rem' }}>{item.price} AZN</div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item._id, 'item')}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Plus size={24} color="var(--primary)" /> Yeni Karakter Əlavə Et
                        </h2>
                        <form onSubmit={handleCreateCharacter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Karakter Adı</label>
                                <input
                                    type="text"
                                    value={newCharacter.name}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                    required
                                    className="admin-input"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Səviyyə</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newCharacter.level}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, level: parseInt(e.target.value) })}
                                    required
                                    className="admin-input"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Qiymət (AZN)</label>
                                <input
                                    type="number"
                                    value={newCharacter.price}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, price: parseFloat(e.target.value) })}
                                    required
                                    className="admin-input"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Karakter Şəkili</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="file"
                                        onChange={(e) => handleImageUpload(e, 'character')}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="char-image-upload"
                                    />
                                    <label
                                        htmlFor="char-image-upload"
                                        style={{ padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', border: '1px dashed var(--border)', flex: 1, textAlign: 'center' }}
                                    >
                                        {uploading ? 'Yüklənir...' : 'Şəkil Seç'}
                                    </label>
                                    {newCharacter.image && (
                                        <div style={{ width: '45px', height: '45px', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                                            <img src={newCharacter.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button type="submit" style={{ padding: '0.8rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                                Əlavə Et
                            </button>
                        </form>
                    </div>

                    <div className="characters-list">
                        <h2 style={{ marginBottom: '1.5rem' }}>Mövcud Karakterlərim</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                            {characters.map(char => (
                                <div key={char._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                        {char.image ? (
                                            <img src={char.image} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <UserIcon size={24} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>{char.name}</div>
                                        <div style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '4px' }}>Səviyyə {char.level}</div>
                                        <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.95rem' }}>{char.price} AZN</div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(char._id, 'character')}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminFighter;
