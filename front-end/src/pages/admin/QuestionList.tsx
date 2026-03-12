import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, FileUp, FileDown, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';

interface Question {
    _id: string;
    grade: string;
    level: string;
    stage: number;
    text: string;
    rewardAmount: number;
}

const ImportSuccessModal: React.FC<{ count: number, onClose: () => void }> = ({ count, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            style={{
                background: 'rgba(25, 25, 35, 0.95)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                }}
            >
                <X size={20} />
            </button>

            <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
            }}>
                <CheckCircle size={40} />
            </div>

            <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Hər şey hazırdır!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{count}</span> sual uğurla bazaya əlavə edildi.
            </p>

            <button
                className="btn btn-primary"
                onClick={onClose}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px' }}
            >
                Bağla
            </button>
        </motion.div>
    </motion.div>
);

const QuestionList: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [importCount, setImportCount] = useState<number | null>(null);
    const { showNotification } = useNotification();
    const LIMIT = 20;

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/questions/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `suallar_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            showNotification('Export zamanı xəta baş verdi.', 'error');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuestions(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchQuestions = async (pageNumber: number) => {
        try {
            const response = await api.get(`/admin/questions?page=${pageNumber}&limit=${LIMIT}&search=${search}`);
            setQuestions(response.data.questions);
            setTotalPages(Math.ceil(response.data.total / LIMIT));
            setTotalQuestions(response.data.total);
            setPage(pageNumber);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu sualı silmək istədiyinizə əminsiniz?')) return;

        try {
            await api.delete(`/admin/questions/${id}`);
            // Refresh current page
            fetchQuestions(page);
        } catch (error) {
            showNotification('Sualı silmək mümkün olmadı.', 'error');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const response = await api.post('/admin/questions/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImportCount(response.data.success);
            fetchQuestions(1);
        } catch (error) {
            console.error('Error uploading file:', error);
            showNotification('Fayl yüklənərkən xəta baş verdi.', 'error');
        } finally {
            setLoading(false);
            // Reset input
            e.target.value = '';
        }
    };

    if (loading && questions.length === 0) return <div className="loader"></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <AnimatePresence>
                {importCount !== null && (
                    <ImportSuccessModal
                        count={importCount}
                        onClose={() => setImportCount(null)}
                    />
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Suallar</h1>
                    <p className="text-muted">Bütün sualların idarə edilməsi ({totalQuestions} sual).</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleExport}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
                    >
                        <FileDown size={20} /> Export Excel
                    </button>
                    <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                        <FileUp size={20} /> İmport Excel
                        <input type="file" accept=".xlsx" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <Link to="/admin/questions/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <Plus size={20} /> Yeni Sual
                    </Link>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} className="text-muted" style={{ marginLeft: '1rem' }} />
                <input
                    type="text"
                    placeholder="Sual, sinif və ya səviyyə üzrə axtar..."
                    style={{ background: 'none', border: 'none', padding: '1rem', width: '100%', outline: 'none', fontSize: '1rem', color: 'white' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>Sinif</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>Səviyyə</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>Mərhələ</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>Sual Metni</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>Mükafat</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>Əməliyyatlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((q) => (
                            <tr key={q._id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                                        {q.grade}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', background: 'var(--primary)20', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                                        {q.level.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{ fontWeight: 700 }}>
                                        {q.stage}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {q.text}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>
                                    {q.rewardAmount} ₼
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <Link to={`/admin/questions/edit/${q._id}`} style={{ color: 'var(--text-muted)' }} title="Redaktə">
                                            <Edit2 size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(q._id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }} title="Sil">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {questions.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p className="text-muted">Heç bir sual tapılmadı.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        className="btn"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                        disabled={page === 1}
                        onClick={() => fetchQuestions(page - 1)}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontWeight: 600 }}>
                        Səhifə {page} / {totalPages}
                    </span>
                    <button
                        className="btn"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                        disabled={page === totalPages}
                        onClick={() => fetchQuestions(page + 1)}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};


export default QuestionList;

