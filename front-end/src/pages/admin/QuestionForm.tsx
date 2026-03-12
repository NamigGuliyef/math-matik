import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { ChevronLeft, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect: React.FC<{
    label: string,
    value: string,
    options: string[],
    onChange: (val: string) => void,
    placeholder?: string,
    width?: string
}> = ({ label, value, options, onChange, placeholder, width = '100%' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: width, position: 'relative' }} ref={dropdownRef}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    height: '42px',
                    boxSizing: 'border-box'
                }}
            >
                <span>{value || placeholder}</span>
                <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.4rem',
                    background: '#1e293b',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    zIndex: 100,
                    maxHeight: '180px', // Roughly 5 items (36px each)
                    overflowY: 'auto',
                    padding: '0.25rem'
                }} className="custom-scrollbar-v2">
                    {options.map(opt => (
                        <div
                            key={opt}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            style={{
                                padding: '0.6rem 0.8rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                                background: value === opt ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                color: value === opt ? 'var(--primary)' : 'white',
                                fontWeight: value === opt ? 700 : 400
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = value === opt ? 'rgba(99, 102, 241, 0.1)' : 'transparent'}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const QuestionForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        grade: 'Sinif 1',
        level: 'level1',
        stage: 1,
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        rewardAmount: 0.001,
    });

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const fetchQuestion = async () => {
                try {
                    const response = await api.get(`/admin/questions/${id}`);
                    const question = response.data;
                    if (question) {
                        setFormData({
                            grade: question.grade || 'Sinif 1',
                            level: question.level,
                            stage: question.stage || 1,
                            text: question.text,
                            options: question.options,
                            correctAnswer: question.correctAnswer,
                            rewardAmount: question.rewardAmount,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching question:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchQuestion();
        }
    }, [id, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/admin/questions/${id}`, formData);
            } else {
                await api.post('/admin/questions', formData);
            }
            navigate('/admin/questions');
            showNotification(isEdit ? 'Sual yeniləndi' : 'Yeni sual yaradıldı', 'success');
        } catch (error) {
            showNotification('Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => navigate('/admin/questions')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1>{isEdit ? 'Sualı Redaktə Et' : 'Yeni Sual'}</h1>
            </div>

            <form className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <CustomSelect
                        label="Sinif"
                        value={formData.grade}
                        options={Array.from({ length: 11 }, (_, i) => i + 1).map(num => `Sinif ${num}`)}
                        onChange={(val) => setFormData(prev => ({ ...prev, grade: val }))}
                        width="140px"
                    />
                    <CustomSelect
                        label="Səviyyə"
                        value={formData.level === 'level1' ? 'Səviyyə 1' : `Səviyyə ${formData.level.replace('level', '')}`}
                        options={Array.from({ length: 10 }, (_, i) => i + 1).map(num => `Səviyyə ${num}`)}
                        onChange={(val) => setFormData(prev => ({ ...prev, level: `level${val.replace('Səviyyə ', '')}` }))}
                        width="140px"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '140px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mərhələ (Stage)</label>
                        <input
                            type="number"
                            name="stage"
                            min="1"
                            style={{ 
                                padding: '0.6rem 0.8rem', 
                                borderRadius: '8px', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--border)', 
                                color: 'white',
                                width: '100%',
                                height: '42px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                            value={formData.stage}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Mükafat Məbləği (₼)</label>
                        <input
                            type="number"
                            step="0.0001"
                            name="rewardAmount"
                            style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
                            value={formData.rewardAmount}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Sual Metni</label>
                    <textarea
                        name="text"
                        rows={3}
                        style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', resize: 'vertical' }}
                        value={formData.text}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label>Variantlar</label>
                    {formData.options.map((option, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 700, opacity: 0.5 }}>{String.fromCharCode(65 + index)}</span>
                            <input
                                type="text"
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                                placeholder={`Variant ${index + 1}`}
                            />
                            <input
                                type="radio"
                                name="correctAnswer"
                                checked={formData.correctAnswer === option && option !== ''}
                                onChange={() => setFormData(prev => ({ ...prev, correctAnswer: option }))}
                                disabled={option === ''}
                                title="Düzgün cavab olaraq işarələ"
                            />
                        </div>
                    ))}
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Sualın yanındakı dairəni işarələyərək düzgün cavabı seçin.</p>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={saving || !formData.correctAnswer}
                >
                    <Save size={20} /> {saving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
                </button>
            </form>
        </div>
    );
};

export default QuestionForm;
