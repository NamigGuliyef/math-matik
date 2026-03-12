import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldAlert, User, Key, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import './Auth.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        fatherName: '',
        grade: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Şifrələr uyğun gəlmir.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/register', {
                name: formData.name,
                surname: formData.surname,
                fatherName: formData.fatherName,
                grade: formData.grade,
                email: formData.email,
                password: formData.password
            });
            navigate('/login', { state: { message: 'Qeydiyyat uğurla tamamlandı. Giriş edə bilərsiniz.' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Qeydiyyat zamanı xəta baş verdi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="auth-card-v2"
                style={{ maxWidth: '500px' }}
            >
                <div className="auth-header-v2">
                    <div className="auth-icon-wrap" style={{ background: 'var(--secondary)', color: 'white' }}>
                        <UserPlus size={32} />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontWeight: 900 }}>Yeni Hesab</h2>
                    <p>Mathematics dünyasına xoş gəlmisiniz!</p>
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
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div className="input-group-v2" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label-v2">Ad</label>
                            <div className="input-wrapper-v2">
                                <User className="input-icon-v2" size={18} />
                                <input
                                    name="name"
                                    className="input-v2"
                                    type="text"
                                    placeholder="Adınız"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group-v2" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label-v2">Soyad</label>
                            <div className="input-wrapper-v2">
                                <User className="input-icon-v2" size={18} />
                                <input
                                    name="surname"
                                    className="input-v2"
                                    type="text"
                                    placeholder="Soyadınız"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div className="input-group-v2" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label-v2">Atasının Adı</label>
                            <div className="input-wrapper-v2">
                                <User className="input-icon-v2" size={18} />
                                <input
                                    name="fatherName"
                                    className="input-v2"
                                    type="text"
                                    placeholder="Ata adınız"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group-v2" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="input-label-v2">Sinif</label>
                            <div className="input-wrapper-v2">
                                <User className="input-icon-v2" size={18} />
                                <select
                                    name="grade"
                                    className="input-v2"
                                    value={formData.grade}
                                    onChange={(e: any) => setFormData({ ...formData, grade: e.target.value })}
                                    required
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="" disabled>Sinif seçin</option>
                                    {Array.from({ length: 11 }, (_, i) => i + 1).flatMap(i => 
                                        ['A', 'B', 'C', 'D'].map(letter => (
                                            <option key={`${i}${letter}`} value={`${i}${letter}`} style={{ background: '#1e293b' }}>
                                                {i}{letter}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="input-group-v2">
                        <label className="input-label-v2">Email</label>
                        <div className="input-wrapper-v2">
                            <User className="input-icon-v2" size={18} />
                            <input
                                name="email"
                                className="input-v2"
                                type="email"
                                placeholder="Email ünvanınız"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group-v2">
                        <label className="input-label-v2">Şifrə</label>
                        <div className="input-wrapper-v2">
                            <Key className="input-icon-v2" size={18} />
                            <input
                                name="password"
                                className="input-v2"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group-v2">
                        <label className="input-label-v2">Şifrəni Təsdiqlə</label>
                        <div className="input-wrapper-v2">
                            <Key className="input-icon-v2" size={18} />
                            <input
                                name="confirmPassword"
                                className="input-v2"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-auth-v2 btn-secondary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Qeydiyyat aparılır...' : 'Qeydiyyatı Tamamla'}
                        {!isLoading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="auth-footer-v2">
                    <p>
                        Artıq hesabınız var?{' '}
                        <Link to="/login" className="auth-link-v2" style={{ color: 'var(--secondary)' }}>
                            Daxil olun
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
