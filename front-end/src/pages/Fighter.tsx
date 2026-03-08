import axios from 'axios';
import {
    Award,
    Coins,
    Flame,
    Footprints,
    Hand,
    HardHat,
    Shield,
    Shirt,
    ShoppingBag,
    Sword,
    User as UserIcon,
    X,
    Zap,
    Play,
    Loader2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Fighter.css';

interface FighterItem {
    _id: string;
    name: string;
    category: string;
    level: number;
    price: number;
    image?: string;
    attributes?: Record<string, number>;
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8002';
const API_BASE_CLEAN = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

const getLevelColor = (level: number) => {
    if (level === 2) return 'lvl-2';
    if (level === 3) return 'lvl-3';
    return 'lvl-1';
};

const getImageUrl = (path?: string) => {
    if (!path) return '';
    // Köhnə verilənlər bazasında olan localhost/127.0.0.1 linklərini təmizlə
    let cleanPath = path.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '');

    if (cleanPath.startsWith('http')) return cleanPath;

    // Ensure leading slash
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${API_BASE_CLEAN}${normalizedPath}`;
};

const Fighter: React.FC = () => {
    const { user, token } = useAuth();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<'fighter' | 'shop'>('fighter');
    const [equipped, setEquipped] = useState<Record<string, InventoryRecord | null>>({
        'dəbilqə': null,
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

    // Battle states
    const [isBattling, setIsBattling] = useState(false);
    const [battleData, setBattleData] = useState<any>(null);
    const [battleRounds, setBattleRounds] = useState<any[]>([]);
    const [battleResult, setBattleResult] = useState<any>(null);
    const [matchingOpponent, setMatchingOpponent] = useState(false);
    const [hp, setHp] = useState({ user: 100, opponent: 100 });

    const allStatLabels: Record<string, string> = {
        can: 'HP',
        mudafie: 'Zireh',
        kritik_yayinma: 'K.Yayınma',
        dozumuluk: 'Dözümlülük',
        zerbe_gucu: 'Zərbə',
        zireh_delme: 'Z.Dəlmə',
        kritik_sans: 'Kritik %',
        bloklama_gucu: 'Blok',
        sehirli_muqavimet: 'S.Müqavimət',
        suret: 'Sürət',
        qacinma_sansi: 'Qaçınma %',
        enerji: 'Mana',
        can_yenilenme: 'Yenilənmə',
        passiv_guc: 'Passiv',
        elementar_muqavimet: 'E.Müqavimət',
        deqiqlik: 'Dəqiqlik',
        elave_zerbe: 'Bonus'
    };

    const statGroups = [
        {
            title: 'Hücum',
            icon: <Sword size={16} color="#ef4444" />,
            stats: ['zerbe_gucu', 'zireh_delme', 'kritik_sans', 'deqiqlik', 'elave_zerbe']
        },
        {
            title: 'Müdafiə',
            icon: <Shield size={16} color="#3b82f6" />,
            stats: ['can', 'mudafie', 'kritik_yayinma', 'dozumuluk', 'bloklama_gucu', 'sehirli_muqavimet', 'elementar_muqavimet', 'qacinma_sansi']
        },
        {
            title: 'Mistik',
            icon: <Zap size={16} color="#fbbf24" />,
            stats: ['suret', 'enerji', 'can_yenilenme', 'passiv_guc']
        }
    ];

    const calculateTotalStats = () => {
        const stats: Record<string, number> = {};
        Object.values(equipped).forEach(record => {
            if (record?.itemId?.attributes) {
                Object.entries(record.itemId.attributes).forEach(([key, value]) => {
                    stats[key] = (stats[key] || 0) + Number(value);
                });
            }
        });
        return stats;
    };

    const totalStats = calculateTotalStats();

    useEffect(() => {
        fetchFighterData();
        fetchShopData();
    }, []);

    const fetchFighterData = async () => {
        try {
            const resp = await axios.get(`${API_BASE_CLEAN}/fighter/my-fighter`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { equipped: equippedList, bag: bagList } = resp.data;

            const categoryNormalize: Record<string, string> = {
                'helmet': 'dəbilqə', 'HELMET': 'dəbilqə', 'şlem': 'dəbilqə',
                'armor': 'zireh', 'ARMOR': 'zireh',
                'weapon': 'silah', 'WEAPON': 'silah',
                'shield': 'qalxan', 'SHIELD': 'qalxan',
                'boots': 'çəkmə', 'BOOTS': 'çəkmə',
                'necklace': 'boyunbağı', 'NECKLACE': 'boyunbağı',
                'pants': 'şalvar', 'PANTS': 'şalvar',
                'gloves': 'əlcək', 'GLOVES': 'əlcək',
            };

            const equippedMap: Record<string, InventoryRecord | null> = {
                'dəbilqə': null, 'zireh': null, 'silah': null, 'qalxan': null,
                'çəkmə': null, 'boyunbağı': null, 'şalvar': null, 'əlcək': null,
                'character': null,
            };

            equippedList.forEach((record: InventoryRecord) => {
                if (record.itemId) {
                    const cat = categoryNormalize[record.itemId.category] || record.itemId.category;
                    equippedMap[cat] = record;
                } else if (record.characterId) {
                    equippedMap['character'] = record;
                }
            });

            const normalizedBag = bagList.map((record: InventoryRecord) => {
                if (record.itemId) {
                    return {
                        ...record,
                        itemId: {
                            ...record.itemId,
                            category: categoryNormalize[record.itemId.category] || record.itemId.category
                        }
                    };
                }
                return record;
            });

            setEquipped(equippedMap);
            setBag(normalizedBag);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching fighter:', err);
            setLoading(false);
        }
    };

    const fetchShopData = async () => {
        try {
            const resp = await axios.get(`${API_BASE_CLEAN}/fighter/shop`, {
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
            const response = await axios.post(`${API_BASE_CLEAN}/fighter/purchase/${itemId}`, {}, {
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
            const response = await axios.post(`${API_BASE_CLEAN}/fighter/purchase-char/${charId}`, {}, {
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
            console.log('Equipping:', inventoryId);
            const resp = await axios.post(`${API_BASE_CLEAN}/fighter/equip/${inventoryId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Equip response:', resp.data);
            fetchFighterData();
            showNotification('Geyinildi!', 'success');
        } catch (err: any) {
            console.error('Error equipping:', err);
            showNotification(err.response?.data?.message || 'Geyinmə xətası', 'error');
        }
    };

    const handleUnequip = async (inventoryId: string) => {
        try {
            await axios.post(`${API_BASE_CLEAN}/fighter/unequip/${inventoryId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFighterData();
        } catch (err) {
            console.error('Error unequipping:', err);
        }
    };

    const handleStartBattle = async () => {
        try {
            setMatchingOpponent(true);
            setIsBattling(true);
            setBattleRounds([]);
            setBattleResult(null);
            setHp({ user: 100, opponent: 100 });

            const resp = await axios.post(`${API_BASE_CLEAN}/fighter/battle/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBattleData(resp.data);
            setMatchingOpponent(false);

            // Start simulation
            runBattleSimulation(resp.data);
        } catch (err: any) {
            setIsBattling(false);
            setMatchingOpponent(false);
            showNotification(err.response?.data?.message || 'Döyüş başlana bilmədi', 'error');
        }
    };

    const runBattleSimulation = (data: any) => {
        const rounds = data.battle.rounds;
        let idx = 0;

        const interval = setInterval(() => {
            if (idx >= rounds.length) {
                clearInterval(interval);
                setTimeout(() => {
                    setBattleResult(data);
                    if (data.newBalance !== undefined) {
                        setBalance(data.newBalance);
                    }
                    fetchFighterData();
                }, 1000);
                return;
            }

            const currentRound = rounds[idx];
            setBattleRounds(prev => [...prev, currentRound]);

            // Update HPs
            if (currentRound.attacker === 'Sən') {
                setHp(prev => ({ ...prev, opponent: currentRound.defenderHp }));
            } else {
                setHp(prev => ({ ...prev, user: currentRound.defenderHp }));
            }

            idx++;
        }, 800);
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
                <button className="start-battle-btn" onClick={handleStartBattle} disabled={isBattling}>
                    <Play size={16} /> Döyüşə Başla
                </button>
            </div>

            {activeTab === 'fighter' ? (
                <div className="fighter-three-col">
                    {/* LEFT: Stats Panel */}
                    <div className="fighter-stats-panel">
                        <h2 className="stats-title">
                            <Award size={20} /> Göstəricilər
                        </h2>
                        <div className="stats-groups-container">
                            {statGroups.map((group, gIdx) => (
                                <div key={gIdx} className="stats-group">
                                    <h3 className="group-label">
                                        {group.icon} {group.title}
                                    </h3>
                                    <div className="stats-rows">
                                        {group.stats.map(key => {
                                            const value = totalStats[key] || 0;
                                            return (
                                                <div key={key} className={`stat-row ${value > 0 ? 'active' : ''}`}>
                                                    <span className="stat-row-label">{allStatLabels[key]}</span>
                                                    <span className="stat-row-val">{value > 0 ? `+${value}` : '0'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CENTER: Character + Equipment */}
                    <div className="fighter-left-col">
                        <div className="fighter-visual-section">
                            <div className="fighter-slots-left">
                                <Slot item={equipped['dəbilqə']} label="Dəbilqə" category="dəbilqə" onUnequip={handleUnequip} />
                                <Slot item={equipped['zireh']} label="Zireh" category="zireh" onUnequip={handleUnequip} />
                                <Slot item={equipped['silah']} label="Sağ əl" category="silah" onUnequip={handleUnequip} />
                                <Slot item={equipped['qalxan']} label="Sol əl" category="qalxan" onUnequip={handleUnequip} />
                            </div>

                            <div className="fighter-avatar-wrap">
                                <div className="fighter-base" data-level={equipped.character?.characterId?.level || 0}>
                                    {equipped.character ? (
                                        <>
                                            <img
                                                src={getImageUrl(equipped.character.characterId?.image)}
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
                                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                                            <div className="tooltip-stats">
                                                {Object.entries(item.attributes).map(([key, val]) => (
                                                    <div key={key} className="tooltip-stat">
                                                        {allStatLabels[key] || key}: +{val}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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

            {/* Battle Arena Modal */}
            {isBattling && (
                <div className="battle-overlay">
                    <div className="battle-arena">
                        <button className="close-battle-btn" onClick={() => setIsBattling(false)} disabled={!battleResult}>
                            <X size={24} />
                        </button>

                        {matchingOpponent ? (
                            <div className="matchmaking-view">
                                <Loader2 className="spinning-loader" size={64} />
                                <h3>Rəqib axtarılır...</h3>
                                <p>Gücünüzə uyğun balanslı rəqib seçilir.</p>
                            </div>
                        ) : (
                            <>
                                <div className="battle-header">
                                    <div className="fighter-profile user-side">
                                        <div className="fighter-name-tag">Sən</div>
                                        <div className="hp-bar-container">
                                            <div className="hp-bar-fill" style={{ width: `${(hp.user / (battleData?.userStats?.can || 100)) * 100}%` }}></div>
                                            <span className="hp-text">{Math.max(0, hp.user).toFixed(0)} / {battleData?.userStats?.can}</span>
                                        </div>
                                        <div className="battle-avatar">
                                            {equipped.character ? (
                                                <img src={getImageUrl(equipped.character.characterId?.image)} alt="User" />
                                            ) : (
                                                <UserIcon size={80} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="battle-vs">VS</div>

                                    <div className="fighter-profile opponent-side">
                                        <div className="fighter-name-tag">{battleData?.opponentName}</div>
                                        <div className="hp-bar-container">
                                            <div className="hp-bar-fill" style={{ width: `${(hp.opponent / (battleData?.opponentStats?.can || 100)) * 100}%` }}></div>
                                            <span className="hp-text">{Math.max(0, hp.opponent).toFixed(0)} / {battleData?.opponentStats?.can}</span>
                                        </div>
                                        <div className="battle-avatar">
                                            <UserIcon size={80} />
                                        </div>
                                    </div>
                                </div>

                                <div className="battle-logs" id="battle-logs">
                                    {battleRounds.map((r, i) => (
                                        <div key={i} className={`log-entry ${r.attacker === 'Sən' ? 'player-atk' : 'opp-atk'}`}>
                                            <span className="round-num">Raund {r.round}:</span>
                                            <span className="atk-name">{r.attacker}</span>
                                            <span className="atk-action">hücum etdi - </span>
                                            <span className="atk-dmg">{r.damage} zərər!</span>
                                        </div>
                                    ))}
                                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })}></div>
                                </div>

                                {battleResult && (
                                    <div className="battle-result-overlay">
                                        <div className={`result-card ${battleResult.isUserWinner ? 'win' : 'lose'}`}>
                                            <h2>{battleResult.isUserWinner ? 'QALİB!' : 'MƏĞLUB!'}</h2>
                                            <p className="reward-text">
                                                Mükafat: <span>+{battleResult.isUserWinner ? battleResult.battle?.rewards?.winnerAmount ?? 0.5 : battleResult.battle?.rewards?.loserAmount ?? 0.1} AZN</span>
                                            </p>
                                            <button className="finish-battle-btn" onClick={() => setIsBattling(false)}>Bağla</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
};

/* ── Slot Icon helper ── */
const SlotIcon: React.FC<{ category: string; image?: string; size?: number }> = ({ category, image, size = 28 }) => {
    if (image) {
        return <img src={getImageUrl(image)} alt={category} className="slot-image-content" />;
    }
    switch (category) {
        case 'dəbilqə': return <HardHat size={size} />;
        case 'zireh': return <Shirt size={size} />;
        case 'silah': return <Sword size={size} />;
        case 'qalxan': return <Shield size={size} />;
        case 'çəkmə': return <Footprints size={size} />;
        case 'boyunbağı': return <Award size={size} />;
        case 'şalvar': return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>👖</span>;
        case 'əlcək': return <Hand size={size} />;
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
