import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { name, surname, fatherName, password });
            login(response.data.user, response.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Giriş uğursuz oldu. Zəhmət olmasa təkrar yoxlayın.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '2.5rem', width: '100%', maxWidth: '450px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <LogIn color="white" size={32} />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Xoş Gəlmisiniz</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Məlumatlarınızı daxil edərək sistemə giriş edin</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ShieldAlert size={18} />
                        <span style={{ fontSize: '0.875rem' }}>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Ad</label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Məsələn: Əli"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Soyad</label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Məsələn: Əliyev"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Atasının Adı</label>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Məsələn: Vəli"
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Şifrə</label>
                        <input
                            className="input-field"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Giriş edilir...' : 'Daxil Ol'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Hesabınız yoxdur?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Qeydiyyatdan keçin
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
