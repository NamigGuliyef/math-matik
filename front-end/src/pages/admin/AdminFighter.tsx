import axios from 'axios';
import {
    Award,
    Footprints,
    Hand,
    HardHat,
    Plus,
    Shield,
    Shirt,
    Sword,
    Trash2,
    User as UserIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface FighterItem {
    _id: string;
    name: string;
    category: string;
    level: number;
    price: number;
    image?: string;
    attributes?: Record<string, number>;
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
        category: 'dəbilqə',
        level: 1,
        price: 0,
        image: '',
        attributes: {} as Record<string, number>
    });

    const [newCharacter, setNewCharacter] = useState({
        name: '',
        level: 1,
        price: 0,
        image: ''
    });

    const categories = ['dəbilqə', 'zireh', 'silah', 'qalxan', 'çəkmə', 'boyunbağı', 'şalvar', 'əlcək'];

    const categoryStats: Record<string, Array<{ key: string, label: string }>> = {
        'dəbilqə': [
            { key: 'can', label: 'Can' },
            { key: 'mudafie', label: 'Müdafiə' },
            { key: 'kritik_yayinma', label: 'Kritik zərbədən yayınma' }
        ],
        'zireh': [
            { key: 'can', label: 'Can' },
            { key: 'mudafie', label: 'Müdafiə' },
            { key: 'dozumuluk', label: 'Dözümlülük' }
        ],
        'silah': [
            { key: 'zerbe_gucu', label: 'Zərbə Gücü' },
            { key: 'zireh_delme', label: 'Zireh Dəlmə' },
            { key: 'kritik_sans', label: 'Kritik Şans' }
        ],
        'qalxan': [
            { key: 'can', label: 'Can' },
            { key: 'bloklama_gucu', label: 'Bloklama Gücü' },
            { key: 'sehirli_muqavimet', label: 'Sehrli Müqavimət' }
        ],
        'çəkmə': [
            { key: 'suret', label: 'Sürət' },
            { key: 'dozumuluk', label: 'Dözümlülük' },
            { key: 'qacinma_sansi', label: 'Qaçınma Şansı' }
        ],
        'boyunbağı': [
            { key: 'enerji', label: 'Enerji (Mana)' },
            { key: 'can_yenilenme', label: 'Can Yenilənməsi' },
            { key: 'passiv_guc', label: 'Passiv Güc' }
        ],
        'şalvar': [
            { key: 'can', label: 'Can' },
            { key: 'mudafie', label: 'Müdafiə' },
            { key: 'elementar_muqavimet', label: 'Elementar Müqavimət' }
        ],
        'əlcək': [
            { key: 'deqiqlik', label: 'Dəqiqlik' },
            { key: 'elave_zerbe', label: 'Əlavə Zərbə Gücü' },
            { key: 'zireh_delme', label: 'Zireh Dəlmə' }
        ]
    };

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
            setNewItem({ name: '', category: 'dəbilqə', level: 1, price: 0, image: '', attributes: {} });
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
            {
                category: 'dəbilqə', level: 1, name: 'Qalın Dəri Papaq', price: 0.109,
                attributes: { can: 10, mudafie: 5, kritik_yayinma: 2 }
            },
            {
                category: 'dəbilqə', level: 2, name: 'Qladiator Dəbilqəsi', price: 0.500,
                attributes: { can: 50, mudafie: 25, kritik_yayinma: 10 }
            },
            {
                category: 'dəbilqə', level: 3, name: 'Əjdaha Tacı (Parlayan)', price: 2.000,
                attributes: { can: 200, mudafie: 100, kritik_yayinma: 30 }
            },

            {
                category: 'zireh', level: 1, name: 'Kəndli Köynəyi', price: 0.150,
                attributes: { can: 15, mudafie: 8, dozumuluk: 5 }
            },
            {
                category: 'zireh', level: 2, name: 'Cəngavər Zirehi (Dəmir)', price: 0.800,
                attributes: { can: 80, mudafie: 40, dozumuluk: 20 }
            },
            {
                category: 'zireh', level: 3, name: 'Qızıl Qəhrəman Zirehi', price: 3.000,
                attributes: { can: 300, mudafie: 150, dozumuluk: 60 }
            },

            {
                category: 'silah', level: 1, name: 'İti Taxta Qılınc', price: 0.120,
                attributes: { zerbe_gucu: 5, zireh_delme: 2, kritik_sans: 1 }
            },
            {
                category: 'silah', level: 2, name: 'İkiəlli Polad Qılınc', price: 0.700,
                attributes: { zerbe_gucu: 30, zireh_delme: 15, kritik_sans: 5 }
            },
            {
                category: 'silah', level: 3, name: 'Alovlu Qılınc', price: 2.500,
                attributes: { zerbe_gucu: 120, zireh_delme: 60, kritik_sans: 20 }
            },

            {
                category: 'qalxan', level: 1, name: 'Çatlaq Taxta Qalxan', price: 0.080,
                attributes: { can: 5, bloklama_gucu: 10, sehirli_muqavimet: 2 }
            },
            {
                category: 'qalxan', level: 2, name: 'Üzərində Şir olan Qalxan', price: 0.450,
                attributes: { can: 25, bloklama_gucu: 50, sehirli_muqavimet: 15 }
            },
            {
                category: 'qalxan', level: 3, name: 'İşıq Saçan Sehrli Qalxan', price: 1.800,
                attributes: { can: 100, bloklama_gucu: 150, sehirli_muqavimet: 50 }
            },

            {
                category: 'çəkmə', level: 1, name: 'Köhnə Çarıq (Dəri)', price: 0.060,
                attributes: { suret: 5, dozumuluk: 2, qacinma_sansi: 1 }
            },
            {
                category: 'çəkmə', level: 2, name: 'Polad Ucluqlu Çəkmə', price: 0.350,
                attributes: { suret: 20, dozumuluk: 10, qacinma_sansi: 5 }
            },
            {
                category: 'çəkmə', level: 3, name: 'Qanadlı Çəkmə (Sürət)', price: 1.500,
                attributes: { suret: 80, dozumuluk: 40, qacinma_sansi: 20 }
            },

            {
                category: 'boyunbağı', level: 1, name: 'İpə Düzülmüş Dişlər', price: 0.200,
                attributes: { enerji: 10, can_yenilenme: 1, passiv_guc: 1 }
            },
            {
                category: 'boyunbağı', level: 2, name: 'Gümüş Qurd Medalyonu', price: 1.000,
                attributes: { enerji: 50, can_yenilenme: 5, passiv_guc: 5 }
            },
            {
                category: 'boyunbağı', level: 3, name: 'Ürək Döyüntülü Kristal', price: 4.000,
                attributes: { enerji: 200, can_yenilenme: 20, passiv_guc: 20 }
            },

            {
                category: 'şalvar', level: 1, name: 'Yamaqlı Kətan Şalvar', price: 0.090,
                attributes: { can: 8, mudafie: 4, elementar_muqavimet: 2 }
            },
            {
                category: 'şalvar', level: 2, name: 'Zirehli Dizlikli Şalvar', price: 0.550,
                attributes: { can: 40, mudafie: 20, elementar_muqavimet: 10 }
            },
            {
                category: 'şalvar', level: 3, name: 'Əjdaha Dərisindən Şalvar', price: 2.200,
                attributes: { can: 150, mudafie: 80, elementar_muqavimet: 40 }
            },

            {
                category: 'əlcək', level: 1, name: 'Yırtıq Dəri Əlcək', price: 0.050,
                attributes: { deqiqlik: 5, elave_zerbe: 2, zireh_delme: 1 }
            },
            {
                category: 'əlcək', level: 2, name: 'Dəmir Yumruq (Zirehli)', price: 0.400,
                attributes: { deqiqlik: 20, elave_zerbe: 10, zireh_delme: 5 }
            },
            {
                category: 'əlcək', level: 3, name: 'İldırım Saçan Əlcək', price: 1.700,
                attributes: { deqiqlik: 80, elave_zerbe: 40, zireh_delme: 20 }
            },
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
            case 'dəbilqə': return <HardHat size={iconSize} />;
            case 'zireh': return <Shirt size={iconSize} />;
            case 'silah': return <Sword size={iconSize} />;
            case 'qalxan': return <Shield size={iconSize} />;
            case 'çəkmə': return <Footprints size={iconSize} />;
            case 'boyunbağı': return <Award size={iconSize} />;
            case 'şalvar': return <span style={{ fontSize: `${iconSize}px` }}>👖</span>;
            case 'əlcək': return <Hand   size={iconSize} />;
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
                                    onChange={(e) => {
                                        const cat = e.target.value;
                                        setNewItem({ ...newItem, category: cat, attributes: {} });
                                    }}
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

                            <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>Xüsusiyyətlər ({newItem.category})</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {categoryStats[newItem.category]?.map(stat => (
                                        <div key={stat.key}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7, fontSize: '0.9rem' }}>{stat.label}</label>
                                            <input
                                                type="number"
                                                value={newItem.attributes[stat.key] || 0}
                                                onChange={(e) => setNewItem({
                                                    ...newItem,
                                                    attributes: {
                                                        ...newItem.attributes,
                                                        [stat.key]: parseFloat(e.target.value) || 0
                                                    }
                                                })}
                                                className="admin-input"
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '8px', color: 'white' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" style={{ padding: '0.8rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer', gridColumn: 'span 2' }}>
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
                                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                                {Object.entries(item.attributes).map(([key, value]) => (
                                                    <span key={key} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                        {categoryStats[item.category]?.find(s => s.key === key)?.label || key}: {value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.95rem', marginTop: '5px' }}>{item.price} AZN</div>
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
