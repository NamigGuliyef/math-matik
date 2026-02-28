import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldAlert, User, Key, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

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
        <div className="auth-page-wrapper">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="auth-card-v2"
            >
                <div className="auth-header-v2">
                    <div className="auth-icon-wrap" style={{ background: 'var(--primary)', color: 'white' }}>
                        <LogIn size={32} />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontWeight: 900 }}>Xoş Gəlmisiniz</h2>
                    <p>Məlumatlarınızı daxil edərək riyaziyyat dünyasına giriş edin</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="error-box-v2"
                        >
                            <ShieldAlert size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    <div className="auth-name-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div className="input-group-v2" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label-v2">Ad</label>
                            <div className="input-wrapper-v2">
                                <User className="input-icon-v2" size={18} />
                                <input
                                    className="input-v2"
                                    type="text"
                                    placeholder="Adınız"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group-v2" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label-v2">Soyad</label>
                            <div className="input-wrapper-v2">
                                <User className="input-icon-v2" size={18} />
                                <input
                                    className="input-v2"
                                    type="text"
                                    placeholder="Soyadınız"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group-v2">
                        <label className="input-label-v2">Atasının Adı</label>
                        <div className="input-wrapper-v2">
                            <User className="input-icon-v2" size={18} />
                            <input
                                className="input-v2"
                                type="text"
                                placeholder="Ata adınız"
                                value={fatherName}
                                onChange={(e) => setFatherName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group-v2">
                        <label className="input-label-v2">Şifrə</label>
                        <div className="input-wrapper-v2">
                            <Key className="input-icon-v2" size={18} />
                            <input
                                className="input-v2"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-auth-v2 btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Giriş edilir...' : 'Daxil Ol'}
                        {!isLoading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="auth-footer-v2">
                    <p>
                        Hesabınız yoxdur?{' '}
                        <Link to="/register" className="auth-link-v2">
                            Qeydiyyatdan keçin
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
