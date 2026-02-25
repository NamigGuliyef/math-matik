import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        fatherName: '',
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
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', padding: '2rem 1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--secondary)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <UserPlus color="white" size={32} />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Yeni Hesab</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Math-Matik dünyasına xoş gəlmisiniz!</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ShieldAlert size={18} />
                        <span style={{ fontSize: '0.875rem' }}>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Ad</label>
                            <input
                                name="name"
                                className="input-field"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Soyad</label>
                            <input
                                name="surname"
                                className="input-field"
                                type="text"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Atasının Adı</label>
                        <input
                            name="fatherName"
                            className="input-field"
                            type="text"
                            value={formData.fatherName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Şifrə</label>
                        <input
                            name="password"
                            className="input-field"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Şifrəni Təsdiqlə</label>
                        <input
                            name="confirmPassword"
                            className="input-field"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '1rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Qeydiyyat aparılır...' : 'Qeydiyyatı Tamamla'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Artıq hesabınız var?{' '}
                        <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none' }}>
                            Daxil olun
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
