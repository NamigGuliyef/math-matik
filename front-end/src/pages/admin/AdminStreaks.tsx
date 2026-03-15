import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Award, Plus, Trash2, Edit2, X, RefreshCw, Flame, Target, Star, Sword, Gift } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakReward {
  _id: string;
  type: 'daily' | 'question' | 'stage' | 'battle';
  requirement: number;
  rewardAzn: number;
  rewardChest: number;
  rewardItemProgress: number;
}

const AdminStreaks: React.FC = () => {
  const { showNotification } = useNotification();
  const [rewards, setRewards] = useState<StreakReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<StreakReward>>({
    type: 'daily',
    requirement: 1,
    rewardAzn: 0,
    rewardChest: 0,
    rewardItemProgress: 0
  });

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/streaks/admin/rewards');
      setRewards(res.data);
    } catch (err) {
      console.error(err);
      showNotification('Mükafatları yükləyərkən xəta baş verdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.post(`/streaks/admin/rewards/${editId}`, formData); 
      } else {
        await api.post('/streaks/admin/rewards', formData);
      }
      
      showNotification(editId ? 'Mükafat yeniləndi' : 'Streak mükafatı əlavə edildi', 'success');
      setShowForm(false);
      setEditId(null);
      resetForm();
      fetchRewards();
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Xəta baş verdi', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'daily',
      requirement: 1,
      rewardAzn: 0,
      rewardChest: 0,
      rewardItemProgress: 0
    });
  };

  const handleEdit = (reward: StreakReward) => {
    setEditId(reward._id);
    setFormData({
      type: reward.type,
      requirement: reward.requirement,
      rewardAzn: reward.rewardAzn,
      rewardChest: reward.rewardChest,
      rewardItemProgress: reward.rewardItemProgress
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu mükafatı silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/streaks/admin/rewards/${id}`);
      showNotification('Mükafat silindi', 'success');
      fetchRewards();
    } catch (err) {
      console.error(err);
      showNotification('Silinmə zamanı xəta', 'error');
    }
  };

  const streakTypeMeta = {
    daily: { label: 'Günlük Aktivlik', icon: <Flame size={20} />, color: '#f97316' },
    question: { label: 'Ardıcıl Suallar', icon: <Target size={20} />, color: '#3b82f6' },
    stage: { label: 'Ardıcıl Səviyyə', icon: <Star size={20} />, color: '#8b5cf6' },
    battle: { label: 'Döyüş Qələbəsi', icon: <Sword size={20} />, color: '#ef4444' }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '0.8rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="admin-streaks-container" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>
            Streak Mükafatları
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Şagirdlərin aktivliyini artıran xüsusi streak mükafatlarını idarə edin</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) {
              setEditId(null);
              resetForm();
            }
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
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Ləğv Et' : 'Yeni Mükafat'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card" 
            style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.8)' }}
          >
            <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Edit2 size={24} color="#7c3aed" /> {editId ? 'Mükafatı Redaktə Et' : 'Yeni Streak Mükafatı'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Streak Növü</label>
                <select 
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="daily" style={{ backgroundColor: '#1b2335' }}>🔥 Günlük Aktivlik</option>
                  <option value="question" style={{ backgroundColor: '#1b2335' }}>🎯 Ardıcıl Doğru Sual</option>
                  <option value="stage" style={{ backgroundColor: '#1b2335' }}>⭐ Keçilən Mərhələ (Stage)</option>
                  <option value="battle" style={{ backgroundColor: '#1b2335' }}>⚔️ Ardıcıl Döyüş</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hədəf Say (Gün/Say)</label>
                <input 
                  type="number" 
                  style={inputStyle} 
                  name="requirement" 
                  min="1" 
                  value={formData.requirement} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AZN Mükafatı</label>
                <input 
                  type="number" 
                  style={inputStyle} 
                  name="rewardAzn" 
                  step="0.01" 
                  min="0" 
                  value={formData.rewardAzn} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sandıq Mükafatı</label>
                <input 
                  type="number" 
                  style={inputStyle} 
                  name="rewardChest" 
                  min="0" 
                  value={formData.rewardChest} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Əşya İnkişafı (%)</label>
                <input 
                  type="number" 
                  style={inputStyle} 
                  name="rewardItemProgress" 
                  step="0.01" 
                  min="0" 
                  max="100"
                  value={formData.rewardItemProgress} 
                  onChange={handleInputChange} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    resetForm();
                  }}
                  style={{
                    background: '#374151', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', flex: 1
                  }}
                >
                  Ləğv et
                </button>
                <button 
                  type="submit" 
                  style={{
                    background: '#7c3aed', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', flex: 1, boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {editId ? 'Saxla' : 'Yarat'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem' }}>
          <RefreshCw className="spin" size={48} color="#7c3aed" />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Məlumatlar yüklənir...</span>
        </div>
      ) : rewards.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', borderRadius: '30px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Award size={80} style={{ opacity: 0.1, marginBottom: '1.5rem', margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Heç bir mükafat təyin edilməyib</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem' }}>Yeni bir streak mükafatı yaradaraq şagirdlərin motivasiyasını artırın.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(31, 41, 55, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>NÖV</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>TƏLƏB</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>AZN</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>SANDIQ</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>ƏŞYA İNKİŞAFI</th>
                  <th style={{ padding: '1.25rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'right' }}>DÜZƏLİŞ / SİL</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map(reward => {
                  const meta = streakTypeMeta[reward.type];
                  return (
                    <motion.tr 
                      key={reward._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', transition: 'background 0.2s' }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ background: `${meta.color}15`, color: meta.color, padding: '8px', borderRadius: '10px', display: 'flex' }}>
                              {meta.icon}
                          </div>
                          <span style={{ fontWeight: 700 }}>{meta.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{reward.requirement}</span>
                        <span style={{ marginLeft: '6px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: '0.85rem' }}>{reward.type === 'daily' ? 'GÜN' : 'SAY'}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {reward.rewardAzn > 0 ? (
                          <span style={{ color: '#10b981', fontWeight: 800 }}>+{reward.rewardAzn.toFixed(2)} AZN</span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.1)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {reward.rewardChest > 0 ? (
                          <span style={{ color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            +{reward.rewardChest} <Gift size={14} />
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.1)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {reward.rewardItemProgress > 0 ? (
                          <span style={{ color: '#8b5cf6', fontWeight: 800 }}>+{reward.rewardItemProgress.toFixed(2)}%</span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.1)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleEdit(reward)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#7c3aed', e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)')}
                            onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)', e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(reward._id)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStreaks;
