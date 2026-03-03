import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Sword, Shield, HardHat, Footprints,
    Shirt, User as UserIcon, ShoppingBag,
    Coins, X, Award, Flame, Zap
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import './Fighter.css';

interface FighterItem {
    _id: string;
    name: string;
    category: string;
    level: number;
    price: number;
    image?: string;
}

interface InventoryRecord {
    _id: string;
    itemId: FighterItem;
    isEquipped: boolean;
}

const API_BASE = 'http://localhost:8002'; // Replace with your backend URL if different

const Fighter: React.FC = () => {
    const { user, token } = useAuth();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<'fighter' | 'shop'>('fighter');
    const [equipped, setEquipped] = useState<Record<string, InventoryRecord | null>>({
        'şlem': null,
        'zireh': null,
        'silah': null,
        'qalxan': null,
        'çəkmə': null,
        'boyunbağı': null,
        'şalvar': null,
        'əlcək': null,
    });
    const [bag, setBag] = useState<InventoryRecord[]>([]);
    const [shopItems, setShopItems] = useState<FighterItem[]>([]);
    const [balance, setBalance] = useState<number>(user?.balance || 0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFighterData();
        fetchShopData();
    }, []);

    const fetchFighterData = async () => {
        try {
            const resp = await axios.get(`${API_BASE}/fighter`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { equipped: equippedList, bag: bagList } = resp.data;

            const equippedMap: Record<string, InventoryRecord | null> = {
                'şlem': null, 'zireh': null, 'silah': null, 'qalxan': null,
                'çəkmə': null, 'boyunbağı': null, 'şalvar': null, 'əlcək': null,
            };

            equippedList.forEach((item: InventoryRecord) => {
                equippedMap[item.itemId.category] = item;
            });

            setEquipped(equippedMap);
            setBag(bagList);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching fighter:', err);
            setLoading(false);
        }
    };

    const fetchShopData = async () => {
        try {
            const resp = await axios.get(`${API_BASE}/fighter/shop`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShopItems(resp.data);
        } catch (err) {
            console.error('Error fetching shop:', err);
        }
    };

    const handlePurchase = async (itemId: string) => {
        try {
            const response = await axios.post(`${API_BASE}/fighter/purchase/${itemId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.balance !== undefined) {
                setBalance(response.data.balance);
            }
            fetchFighterData();
            showNotification('Təbriklər! Yeni əşya alındı.', 'success');
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Alış zamanı xəta baş verdi', 'error');
        }
    };

    const handleEquip = async (inventoryId: string) => {
        try {
            await axios.post(`${API_BASE}/fighter/equip/${inventoryId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFighterData();
        } catch (err) {
            console.error('Error equipping:', err);
        }
    };

    const handleUnequip = async (inventoryId: string) => {
        try {
            await axios.post(`${API_BASE}/fighter/unequip/${inventoryId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFighterData();
        } catch (err) {
            console.error('Error unequipping:', err);
        }
    };

    const getSlotIcon = (category: string, itemImage?: string) => {
        if (itemImage) {
            return <img src={itemImage} alt={category} className="item-image-content" />;
        }

        switch (category) {
            case 'şlem': return <HardHat size={40} />;
            case 'zireh': return <Shirt size={40} />;
            case 'silah': return <Sword size={40} />;
            case 'qalxan': return <Shield size={40} />;
            case 'çəkmə': return <Footprints size={40} />;
            case 'boyunbağı': return <Award size={40} />;
            case 'şalvar': return <div style={{ fontSize: '40px', fontWeight: 'bold' }}>👖</div>;
            case 'əlcək': return <Zap size={40} />;
            default: return <UserIcon size={40} />;
        }
    };

    const getLevelColor = (level: number) => {
        if (level === 2) return 'lvl-2';
        if (level === 3) return 'lvl-3';
        return 'lvl-1';
    };

    if (loading) return <div className="fighter-container">Yüklənir...</div>;

    return (
        <div className="fighter-container">
            <div className="balance-card">
                <Coins className="coin-icon" />
                <span>{Number(balance).toFixed(3).replace(/\.?0+$/, '')} AZN</span>
            </div>

            <div className="fighter-tabs">
                <button
                    className={`fighter-tab ${activeTab === 'fighter' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fighter')}
                >
                    Döyüşçüm
                </button>
                <button
                    className={`fighter-tab ${activeTab === 'shop' ? 'active' : ''}`}
                    onClick={() => setActiveTab('shop')}
                >
                    Mağaza
                </button>
            </div>

            {activeTab === 'fighter' ? (
                <div className="fighter-view">
                    <div className="fighter-visual-section">
                        <div className="fighter-slots-left">
                            <Slot item={equipped['şlem']} label="Şlem" category="şlem" onUnequip={handleUnequip} />
                            <Slot item={equipped['zireh']} label="Zireh" category="zireh" onUnequip={handleUnequip} />
                            <Slot item={equipped['silah']} label="Sağ əl" category="silah" onUnequip={handleUnequip} />
                            <Slot item={equipped['qalxan']} label="Sol əl" category="qalxan" onUnequip={handleUnequip} />
                        </div>

                        <div className="fighter-avatar-wrap">
                            <div className="fighter-base">
                                <UserIcon size={200} opacity={0.1} />
                                <div style={{ position: 'absolute', bottom: '20px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--fighter-accent)' }}>
                                    {user?.name} {user?.surname}
                                </div>
                            </div>
                        </div>

                        <div className="fighter-slots-right">
                            <Slot item={equipped['çəkmə']} label="Çəkmə" category="çəkmə" onUnequip={handleUnequip} />
                            <Slot item={equipped['boyunbağı']} label="Boyunbağı" category="boyunbağı" onUnequip={handleUnequip} />
                            <Slot item={equipped['şalvar']} label="Şalvar" category="şalvar" onUnequip={handleUnequip} />
                            <Slot item={equipped['əlcək']} label="Əlcək" category="əlcək" onUnequip={handleUnequip} />
                        </div>
                    </div>

                    <h2 style={{ marginTop: '4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag /> Çanta (İnventar)
                    </h2>
                    <div className="fighter-inventory-grid">
                        {bag.map(record => (
                            <div key={record._id} className={`item-card level-${record.itemId.level}`}>
                                <div className="item-header">
                                    <span className={`item-level-badge ${getLevelColor(record.itemId.level)}`}>
                                        Səviyyə {record.itemId.level}
                                    </span>
                                    <span className="item-category-icon">{getSlotIcon(record.itemId.category, record.itemId.image)}</span>
                                </div>
                                <div className="item-name">{record.itemId.name}</div>
                                <div className="item-actions">
                                    <button className="btn-equip" onClick={() => handleEquip(record._id)}>Geyin</button>
                                </div>
                            </div>
                        ))}
                        {bag.length === 0 && <p style={{ opacity: 0.5 }}>Çantanız boşdur. Mağazadan alış-veriş edin!</p>}
                    </div>
                </div>
            ) : (
                <div className="shop-view">
                    <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag /> İnventar Kataloqu
                    </h2>
                    <div className="fighter-inventory-grid">
                        {shopItems.map(item => (
                            <div key={item._id} className={`item-card level-${item.level}`}>
                                <div className="item-header">
                                    <span className={`item-level-badge ${getLevelColor(item.level)}`}>
                                        Səviyyə {item.level}
                                    </span>
                                    <span className="item-category-icon">{getSlotIcon(item.category, item.image)}</span>
                                </div>
                                <div className="item-name">{item.name}</div>
                                <div className="item-price">{item.price} AZN</div>
                                <div className="item-actions">
                                    <button
                                        className="btn-buy"
                                        onClick={() => handlePurchase(item._id)}
                                        disabled={(balance || 0) < item.price}
                                    >
                                        Alış Et
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Slot: React.FC<{ item: InventoryRecord | null, label: string, category: string, onUnequip: (id: string) => void }> = ({ item, label, category, onUnequip }) => {
    const getSlotIcon = (cat: string, itemImage?: string) => {
        if (itemImage) {
            return <img src={itemImage} alt={cat} className="slot-image-content" />;
        }
        switch (cat) {
            case 'şlem': return <HardHat size={32} />;
            case 'zireh': return <Shirt size={32} />;
            case 'silah': return <Sword size={32} />;
            case 'qalxan': return <Shield size={32} />;
            case 'çəkmə': return <Footprints size={32} />;
            case 'boyunbağı': return <Award size={32} />;
            case 'şalvar': return <span style={{ fontSize: '28px' }}>👖</span>;
            case 'əlcək': return <Zap size={32} />;
            default: return <UserIcon size={32} />;
        }
    };

    return (
        <div className={`item-slot ${item ? 'has-item' : ''}`} data-level={item?.itemId.level}>
            <div className="slot-icon">
                {item ? getSlotIcon(category, item.itemId.image) : getSlotIcon(category)}
            </div>
            <div className="slot-label">{item ? item.itemId.name : label}</div>
            {item && (
                <button className="unequip-btn" onClick={() => onUnequip(item._id)} title="Çıxar">
                    <X size={14} />
                </button>
            )}
            {item && item.itemId.level === 3 && (
                <Flame className="glow-icon" style={{ position: 'absolute', top: '5px', left: '5px', color: '#fbbf24', width: '16px' }} />
            )}
        </div>
    );
};

export default Fighter;
