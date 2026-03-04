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

interface Character {
    _id: string;
    name: string;
    level: number;
    price: number;
    image: string;
}

interface InventoryRecord {
    _id: string;
    itemId?: FighterItem;
    characterId?: Character;
    isEquipped: boolean;
}

const API_BASE = 'http://localhost:8002';

const getLevelColor = (level: number) => {
    if (level === 2) return 'lvl-2';
    if (level === 3) return 'lvl-3';
    return 'lvl-1';
};

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
        'character': null,
    });
    const [bag, setBag] = useState<InventoryRecord[]>([]);
    const [shopItems, setShopItems] = useState<FighterItem[]>([]);
    const [shopCharacters, setShopCharacters] = useState<Character[]>([]);
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
                'character': null,
            };

            equippedList.forEach((record: InventoryRecord) => {
                if (record.itemId) {
                    equippedMap[record.itemId.category] = record;
                } else if (record.characterId) {
                    equippedMap['character'] = record;
                }
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
            setShopItems(resp.data.items);
            setShopCharacters(resp.data.characters);
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
            showNotification('Əşya alındı!', 'success');
            fetchFighterData();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Balansınız kifayət etmir', 'error');
        }
    };

    const handlePurchaseChar = async (charId: string) => {
        try {
            const response = await axios.post(`${API_BASE}/fighter/purchase-char/${charId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.balance !== undefined) {
                setBalance(response.data.balance);
            }
            showNotification('Karakter alındı!', 'success');
            fetchFighterData();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Balansınız kifayət etmir', 'error');
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

    if (loading) return <div className="fighter-container"></div>;

    return (
        <div className="fighter-container">
            {/* Balance */}
            <div className="balance-card">
                <Coins className="coin-icon" />
                <span>{Number(balance).toFixed(3).replace(/\.?0+$/, '')} AZN</span>
            </div>

            {/* Tabs */}
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
                <div className="fighter-two-col">
                    {/* LEFT: Character + Equipment */}
                    <div className="fighter-left-col">
                        <div className="fighter-visual-section">
                            <div className="fighter-slots-left">
                                <Slot item={equipped['şlem']} label="Şlem" category="şlem" onUnequip={handleUnequip} />
                                <Slot item={equipped['zireh']} label="Zireh" category="zireh" onUnequip={handleUnequip} />
                                <Slot item={equipped['silah']} label="Sağ əl" category="silah" onUnequip={handleUnequip} />
                                <Slot item={equipped['qalxan']} label="Sol əl" category="qalxan" onUnequip={handleUnequip} />
                            </div>

                            <div className="fighter-avatar-wrap">
                                <div className="fighter-base" data-level={equipped.character?.characterId?.level || 0}>
                                    {equipped.character ? (
                                        <>
                                            <img
                                                src={equipped.character.characterId?.image}
                                                alt="Karakter"
                                                className="equipped-char-image"
                                            />
                                            <button
                                                className="char-unequip-btn"
                                                onClick={() => handleUnequip(equipped.character!._id)}
                                                title="Character-i çıxar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <UserIcon size={160} opacity={0.1} />
                                    )}
                                    <div className="fighter-name">

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
                    </div>

                    {/* RIGHT: Bag / Inventory */}
                    <div className="fighter-right-col">
                        <h2 className="bag-title">
                            <ShoppingBag size={20} /> Çanta (İnventar)
                        </h2>
                        <div className="bag-grid">
                            {bag.map(record => {
                                const isItem = !!record.itemId;
                                const data = isItem ? record.itemId : record.characterId;
                                if (!data) return null;

                                return (
                                    <div key={record._id} className={`bag-item-card level-${data.level} ${!isItem ? 'bag-char-card' : ''}`}>
                                        <div className="item-image-panel">
                                            <SlotIcon
                                                category={isItem ? (data as FighterItem).category : 'character'}
                                                image={data.image}
                                                size={36}
                                            />
                                            {/* Info Tooltip (shown on hover) */}
                                            <div className="item-tooltip">
                                                <div className={`tooltip-level ${getLevelColor(data.level)}`}>
                                                    SƏV {data.level}
                                                </div>
                                                <div className="tooltip-name">{data.name}</div>
                                            </div>
                                        </div>
                                        <div className="item-body">
                                            <button className="btn-equip" onClick={() => handleEquip(record._id)}>Geyin</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {bag.length === 0 && (
                            <p className="bag-empty">Çantanız boşdur. Mağazadan alış-veriş edin!</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="shop-view">
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag size={20} /> İnventar Kataloqu
                    </h2>
                    <div className="fighter-inventory-grid">
                        {/* Render Items */}
                        {shopItems.map(item => (
                            <div key={item._id} className={`item-card level-${item.level}`}>
                                <div className="item-image-panel">
                                    <SlotIcon category={item.category} image={item.image} size={36} />
                                    <div className={`item-card-level-badge ${getLevelColor(item.level)}`}>
                                        SV {item.level}
                                    </div>
                                    <div className="item-tooltip">
                                        <div className={`tooltip-level ${getLevelColor(item.level)}`}>
                                            SƏV {item.level}
                                        </div>
                                        <div className="tooltip-name">{item.name}</div>
                                    </div>
                                </div>
                                <div className="item-details-brief">
                                    <span className="item-card-name-label">{item.name}</span>
                                </div>
                                <div className="item-body">
                                    <div className="item-price">{item.price} AZN</div>
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

                        {shopCharacters.map(char => (
                            <div key={char._id} className={`item-card level-${char.level} character-card`}>
                                <div className="item-image-panel">
                                    <SlotIcon category="character" image={char.image} size={36} />
                                    <div className={`item-card-level-badge ${getLevelColor(char.level)}`}>
                                        SV {char.level}
                                    </div>
                                    <div className="item-tooltip">
                                        <div className={`tooltip-level ${getLevelColor(char.level)}`}>
                                            SƏV {char.level}
                                        </div>
                                        <div className="tooltip-name">{char.name}</div>
                                    </div>
                                </div>
                                <div className="item-details-brief">
                                    <span className="item-card-name-label">{char.name}</span>
                                </div>
                                <div className="item-body">
                                    <div className="item-price">{char.price} AZN</div>
                                    <button
                                        className="btn-buy"
                                        onClick={() => handlePurchaseChar(char._id)}
                                        disabled={(balance || 0) < char.price}
                                    >
                                        Alış Et
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div >
    );
};

/* ── Slot Icon helper ── */
const SlotIcon: React.FC<{ category: string; image?: string; size?: number }> = ({ category, image, size = 28 }) => {
    if (image) {
        return <img src={image} alt={category} className="slot-image-content" />;
    }
    switch (category) {
        case 'şlem': return <HardHat size={size} />;
        case 'zireh': return <Shirt size={size} />;
        case 'silah': return <Sword size={size} />;
        case 'qalxan': return <Shield size={size} />;
        case 'çəkmə': return <Footprints size={size} />;
        case 'boyunbağı': return <Award size={size} />;
        case 'şalvar': return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>👖</span>;
        case 'əlcək': return <Zap size={size} />;
        default: return <UserIcon size={size} />;
    }
};

/* ── Equipment Slot ── */
const Slot: React.FC<{ item: InventoryRecord | null; label: string; category: string; onUnequip: (id: string) => void }> = ({
    item, label, category, onUnequip
}) => {
    const itemData = item?.itemId;

    return (
        <div className={`item-slot ${item ? 'has-item' : ''}`} data-level={itemData?.level}>
            <div className="slot-icon">
                <SlotIcon category={category} image={itemData?.image} size={44} />
            </div>

            {/* Show only default label (e.g. 'Şlem') when slot is empty */}
            {!item && <div className="slot-label">{label}</div>}

            {item && itemData && (
                <>
                    {/* Very small level badge on character slot */}
                    <div className={`slot-level-indicator ${getLevelColor(itemData.level)}`}>
                        SV{itemData.level}
                    </div>

                    <button className="unequip-btn" onClick={() => onUnequip(item._id)} title="Çıxar">
                        <X size={12} />
                    </button>

                    {itemData.level === 3 && (
                        <Flame className="glow-icon" style={{ position: 'absolute', top: '4px', right: '4px', color: '#fbbf24', width: '12px' }} />
                    )}
                </>
            )}
        </div>
    );
};

export default Fighter;
