import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { ChevronLeft, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useState, useEffect } from 'react';

const QuestionForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        level: 'level1',
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
                            level: question.level,
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Səviyyə</label>
                        <select
                            name="level"
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                color: 'white'
                            }}
                            value={formData.level}
                            onChange={handleChange}
                        >
                            <option value="level1" style={{ background: '#1e293b' }}>Səviyyə 1</option>
                            <option value="level2" style={{ background: '#1e293b' }}>Səviyyə 2</option>
                            <option value="level3" style={{ background: '#1e293b' }}>Səviyyə 3</option>
                            <option value="level4" style={{ background: '#1e293b' }}>Səviyyə 4</option>
                            <option value="level5" style={{ background: '#1e293b' }}>Səviyyə 5</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label>Mükafat Məbləği (₼)</label>
                        <input
                            type="number"
                            step="0.001"
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
