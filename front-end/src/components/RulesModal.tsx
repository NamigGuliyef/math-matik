import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, XCircle, Timer, Clock, Rocket } from 'lucide-react';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    levelName: string;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onConfirm, levelName }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.5rem',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                width: '100%',
                                maxWidth: '450px',
                                padding: '1.75rem',
                                position: 'relative',
                                background: 'rgba(30, 41, 59, 0.95)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Decorative Background Elements */}
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '150px',
                                height: '150px',
                                background: 'var(--primary)',
                                filter: 'blur(80px)',
                                opacity: 0.2,
                                zIndex: -1
                            }} />

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(79, 70, 229, 0.1)',
                                    marginBottom: '0.75rem'
                                }}>
                                    <BookOpen size={32} color="var(--primary)" />
                                </div>
                                <h1 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>İmtahan Qaydaları</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{levelName.toUpperCase()} üçün qaydalarla tanış olun.</p>
                            </div>

                            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
                                <RuleItem
                                    icon={<Timer size={18} color="var(--primary)" />}
                                    title="Sessiya Müddəti"
                                    description="Hər sessiya 20 dəqiqədir."
                                />
                                <RuleItem
                                    icon={<Clock size={18} color="var(--warning)" />}
                                    title="İstirahət Rejimi"
                                    description="Sessiyadan sonra 1 saat istirahət."
                                />
                                <RuleItem
                                    icon={<CheckCircle2 size={18} color="var(--success)" />}
                                    title="Səhv Limiti"
                                    description="Cəmi 5 şansınız var."
                                />
                                <RuleItem
                                    icon={<XCircle size={18} color="var(--error)" />}
                                    title="Sessiyanın Sonu"
                                    description="5 şans bitdikdə imtahan yekunlaşır."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn"
                                    onClick={onClose}
                                    style={{
                                        flex: 1,
                                        padding: '0.6rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text)'
                                    }}
                                >
                                    Geri
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={onConfirm}
                                    style={{
                                        flex: 2,
                                        padding: '0.6rem',
                                        gap: '0.5rem',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <Rocket size={16} />
                                    Davam Et
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const RuleItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.05)'
    }}>
        <div style={{ marginTop: '0.1rem' }}>{icon}</div>
        <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.1rem' }}>{title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.3 }}>{description}</p>
        </div>
    </div>
);

export default RulesModal;
