import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {  Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface Question {
    _id: string;
    text: string;
    grade: string;
    level: string;
}

interface DailyQuiz {
    _id: string;
    date: string;
    grade: string;
    selectionMethod: string;
    rewardAzn: number;
    rewardChest: number;
    questions: Question[];
}

const AdminDailyQuiz: React.FC = () => {
    const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [grade, setGrade] = useState('7');
    const [level, setLevel] = useState('level1');
    const [date, setDate] = useState('');
    const [selectionMethod, setSelectionMethod] = useState('random');
    const [rewardAzn, setRewardAzn] = useState(0.05);
    const [rewardChest, setRewardChest] = useState(0);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

    // Questions for manual selection
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [isGradeSelectOpen, setIsGradeSelectOpen] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/daily-quiz/admin');
            setQuizzes(res.data);
        } catch (err) {
            console.error('Error fetching daily quizzes', err);
        } finally {
            setLoading(false);
        }
    };

    // When grade or selectionMethod changes, fetch questions if manual
    useEffect(() => {
        if (selectionMethod === 'manual') {
            fetchQuestions();
        }
    }, [grade, level, selectionMethod]);

    const fetchQuestions = async () => {
        try {
            setQuestionsLoading(true);
            const res = await api.get(`/admin/questions?search=${level}&limit=5000`);
            const filtered = res.data.questions?.filter((q: Question) => {
                const qGradeNum = (q.grade || '').toString().replace(/[^0-9]/g, '');
                const selGradeNum = grade.toString().replace(/[^0-9]/g, '');
                const isGradeMatch = qGradeNum === selGradeNum || q.grade === grade;
                const isLevelMatch = q.level === level;
                return isGradeMatch && isLevelMatch;
            }) || [];
            setAvailableQuestions(filtered);
            setSelectedQuestions([]);
        } catch (err) {
            console.error('Error fetching questions', err);
        } finally {
            setQuestionsLoading(false);
        }
    };

    const handleSave = async () => {
        if (selectionMethod === 'manual' && selectedQuestions.length !== 10) {
            alert('Manual seçimdə tam 10 sual seçməlisiniz.');
            return;
        }
        if (!date) {
            alert('Tarix mütləqdir.');
            return;
        }

        try {
            await api.post('/daily-quiz/admin', {
                grade,
                date,
                selectionMethod,
                rewardAzn,
                rewardChest,
                questions: selectionMethod === 'manual' ? selectedQuestions : undefined
            });
            setShowForm(false);
            fetchQuizzes();
            setSelectedQuestions([]);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error occurred');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu quizi silmək istədiyinizdən əminsiniz?')) return;
        try {
            await api.delete(`/daily-quiz/admin/${id}`);
            fetchQuizzes();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleQuestion = (id: string) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const inputStyle = {
        width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '1rem', outline: 'none'
    };

    const selectStyle = {
        ...inputStyle, background: 'rgba(15, 23, 42, 1)'
    };

    if (loading) return <div className="loader" />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>Günlük Quiz İdarəetməsi</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Gündəlik xüsusi quizləri buradan yaradın və tənzimləyin.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: '#7c3aed', color: '#fff',
                        padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                        fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                    }}
                >
                    <Plus size={20} /> Yeni Quiz Yarat
                </button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(17, 24, 39, 0.6)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, display: 'block' }}>Sinif</label>
                            <div 
                                tabIndex={0}
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        setIsGradeSelectOpen(false);
                                    }
                                }}
                                style={{ position: 'relative', outline: 'none' }}
                            >
                                <div 
                                    onClick={() => setIsGradeSelectOpen(!isGradeSelectOpen)}
                                    style={{ ...selectStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', margin: 0 }}
                                >
                                    <span>Sinif {grade}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
                                </div>
                                {isGradeSelectOpen && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0, 
                                        background: 'rgba(15, 23, 42, 1)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', zIndex: 10, marginTop: '4px',
                                        maxHeight: '210px', overflowY: 'auto'
                                    }}>
                                        {[...Array(11)].map((_, i) => (
                                            <div 
                                                key={i + 1}
                                                onClick={() => {
                                                    setGrade((i + 1).toString());
                                                    setIsGradeSelectOpen(false);
                                                }}
                                                style={{
                                                    padding: '0.8rem', cursor: 'pointer',
                                                    background: grade === (i + 1).toString() ? 'rgba(124, 58, 237, 0.5)' : 'transparent',
                                                    color: 'white',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (grade !== (i + 1).toString()) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (grade !== (i + 1).toString()) e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                Sinif {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, display: 'block' }}>Tarix</label>
                            <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, display: 'block' }}>Seçim Növü</label>
                            <select style={selectStyle} value={selectionMethod} onChange={e => setSelectionMethod(e.target.value)}>
                                <option value="random">Avtomatik (Random 10 Sual)</option>
                                <option value="manual">Manual (Özün Seç)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, display: 'block' }}>Mükafat AZN</label>
                                <input type="number" step="0.01" style={inputStyle} value={rewardAzn} onChange={e => setRewardAzn(+e.target.value)} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, display: 'block' }}>Mükafat Sandıq</label>
                                <input type="number" style={inputStyle} value={rewardChest} onChange={e => setRewardChest(+e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {selectionMethod === 'manual' && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Bölmə (Level) Seçin</label>
                                <select style={selectStyle} value={level} onChange={e => setLevel(e.target.value)}>
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={`level${i + 1}`}>Level {i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>
                                Sualları Seçin ({selectedQuestions.length}/10)
                            </h3>
                            {questionsLoading ? <p style={{ color: 'white' }}>Yüklənir...</p> : (
                                <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                    {availableQuestions.length === 0 ? (
                                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Bu sinif və bölmə (level) üçün sual tapılmadı.</p>
                                    ) : (
                                        availableQuestions.map(q => (
                                            <div
                                                key={q._id}
                                                onClick={() => {
                                                    if (!selectedQuestions.includes(q._id) && selectedQuestions.length >= 10) return;
                                                    toggleQuestion(q._id);
                                                }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                                    padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: (selectedQuestions.length >= 10 && !selectedQuestions.includes(q._id)) ? 'not-allowed' : 'pointer',
                                                    opacity: (selectedQuestions.length >= 10 && !selectedQuestions.includes(q._id)) ? 0.5 : 1
                                                }}
                                            >
                                                {selectedQuestions.includes(q._id) ? <CheckSquare color="#4ade80" /> : <Square color="rgba(255,255,255,0.3)" />}
                                                <div style={{ color: 'white', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>[{q.level}]</span> {q.text}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowForm(false)} style={{ background: '#374151', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Ləğv et</button>
                        <button onClick={handleSave} style={{ background: '#7c3aed', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Saxla</button>
                    </div>
                </div>
            )}

            <div style={{ background: 'rgba(31, 41, 55, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                            <th style={{ padding: '1.25rem', textAlign: 'left' }}>TARİX</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left' }}>SİNİF</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left' }}>SEÇİM</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left' }}>MÜKAFAT</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right' }}>SİL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizzes.map(q => (
                            <tr key={q._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
                                <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{q.date}</td>
                                <td style={{ padding: '1rem 1.25rem' }}>{q.grade}</td>
                                <td style={{ padding: '1rem 1.25rem', opacity: 0.8 }}>
                                    {q.selectionMethod === 'random' ? 'Random' : 'Manual'} ({q.questions.length} sual)
                                </td>
                                <td style={{ padding: '1rem 1.25rem', color: '#fbbf24', fontWeight: 'bold' }}>
                                    {q.rewardAzn > 0 && `${q.rewardAzn} AZN `}
                                    {q.rewardChest > 0 && `${q.rewardChest} Sandıq`}
                                </td>
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(q._id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDailyQuiz;
