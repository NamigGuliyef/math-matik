import { Award, BookOpen, Brain, CheckCircle, ChevronRight, Flame, Lightbulb, Play, Rocket, Shield, Star, Sword, Target, TrendingUp, Trophy, User as UserIcon, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './Home.css';

// Assets
const HERO_IMAGE = '/assets/hero.png';
const STEPS_IMAGE = '/assets/steps_v2.png';
const LEVELS_IMAGE = '/assets/content_bg.png';
const CTA_BG = '/assets/cta_bg.png';

interface LandingStats {
    totalStudents: number;
    totalQuestions: number;
    totalCorrectAnswers: number;
    totalLevels: number;
}

const Home: React.FC = () => {
    const [stats, setStats] = useState<LandingStats | null>(null);
    const [featuredChar, setFeaturedChar] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, charRes] = await Promise.all([
                    api.get('/questions/landing-stats'),
                    api.get('/fighter/featured')
                ]);
                setStats(statsRes.data);
                setFeaturedChar(charRes.data);
            } catch (error) {
                console.error('Error fetching landing data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const steps = [
        { icon: <Play size={24} />, title: 'Qeydiyyat', desc: 'Saniyələr içində hesabını yarat.' },
        { icon: <Target size={24} />, title: 'Seçim', desc: 'Bilik səviyyənə uyğun mərhələni seç.' },
        { icon: <Zap size={24} />, title: 'Oyun', desc: 'Sualları cavabla və xal qazan.' },
        { icon: <Award size={24} />, title: 'Zəfər', desc: 'Liderlər sırasına daxil ol.' },
    ];

    const contentHighlights = [
        { icon: <Brain size={24} color="#4f46e5" />, title: 'İntellektual Alqoritmlər', desc: 'Sistem hər bir şagirdin qabiliyyətinə uyğun suallar təklif edir.' },
        { icon: <Lightbulb size={24} color="#8b5cf6" />, title: 'Daimi Yenilənmə', desc: 'Hər həftə yeni riyazi bazalar və məntiq testləri əlavə olunur.' },
        { icon: <Trophy size={24} color="#ec4899" />, title: 'Global Reytinqlər', desc: 'Ölkə üzrə bütün şagirdlərlə yarışmaq və inkişafı izləmək imkanı.' },
    ];

    return (
        <div className="home-wrapper">
            {/* HERO SECTION */}
            <section className="hero-v2">
                <div className="container hero-container-v2">
                    <div className="hero-text-content">
                        <div className="badge-premium animate-fade-in">
                            <Rocket size={16} /> <span>Gələcəyin Riyaziyyatçıları Üçün</span>
                        </div>
                        <h1 className="hero-h1 animate-fade-in">
                            Riyaziyyat Artıq Daha <span className="text-gradient-v2">Maraqlıdır!</span>
                        </h1>
                        <p className="hero-p animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            Mathematics ilə darıxdırıcı misalları unudun. İnteraktiv suallar,
                            rəqabət dolu reytinq və fərdi inkişaf sistemi ilə riyazi dünyanı kəşf edin.
                        </p>
                        <div className="hero-cta-group animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <Link to="/register" className="btn-main btn-glow">
                                İndi Başla <ChevronRight size={20} />
                            </Link>
                            <Link to="/login" className="btn-outline-v2">
                                Daxil Ol
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual-v2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="hero-img-wrap">
                            <img src={HERO_IMAGE} alt="Math Illustration" className="hero-main-img" />
                            <div className="floating-card-v2 fc-1">
                                <BookOpen size={20} color="#4f46e5" />
                                <div>
                                    <small>Suallar</small>
                                    <strong>+{stats?.totalQuestions || '1,000'}</strong>
                                </div>
                            </div>
                            <div className="floating-card-v2 fc-2">
                                <Star size={20} color="#f59e0b" fill="#f59e0b" />
                                <div>
                                    <small>Dəyərləndirmə</small>
                                    <strong>4.9/5</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK STATS - Static Powers Display
            <div className="featured-stats-bar container">
                <div className="f-stat-item">
                    <Zap size={18} />
                    <span>İntellekt: 99</span>
                </div>
                <div className="f-stat-item">
                    <Target size={18} />
                    <span>Dəqiqlik: 95%</span>
                </div>
                <div className="f-stat-item">
                    <Trophy size={18} />
                    <span>Rütbə: Magistr</span>
                </div>
            </div> */}

            {/* STATS STRIP */}
            <section className="stats-strip">
                <div className="container">
                    <div className="section-title-v2" style={{ marginBottom: '1.5rem' }}>
                        <h2>Statistika</h2>
                    </div>
                    <div className="stats-cards-grid">
                        <div className="stat-mini-card glass-card">
                            <div className="stat-icon-v2 icon-purple"><Users /></div>
                            <h3>{loading ? '...' : stats?.totalStudents || 0}</h3>
                            <span>Aktiv Şagird</span>
                        </div>
                        <div className="stat-mini-card glass-card">
                            <div className="stat-icon-v2 icon-blue"><BookOpen /></div>
                            <h3>{loading ? '...' : stats?.totalQuestions || 0}</h3>
                            <span>Ümumi Sual</span>
                        </div>
                        <div className="stat-mini-card glass-card">
                            <div className="stat-icon-v2 icon-green"><CheckCircle /></div>
                            <h3>{loading ? '...' : stats?.totalCorrectAnswers || 0}</h3>
                            <span>Düzgün Cavab</span>
                        </div>
                        <div className="stat-mini-card glass-card">
                            <div className="stat-icon-v2 icon-orange"><Zap /></div>
                            <h3>{loading ? '...' : stats?.totalLevels || 0}</h3>
                            <span>Mərhələ</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-title-v2">
                        <h2>4 Addımda Uğura Doğru</h2>
                        <p>Platformadan istifadə etmək və öyrənməyə başlamaq çox sadədir.</p>
                    </div>
                    <div className="steps-visual-layout">
                        <div className="steps-grid-v2">
                            {steps.map((step, idx) => (
                                <div key={idx} className="step-card-v2 glass-card">
                                    <div className="step-number">{idx + 1}</div>
                                    <div className="step-icon-v2">{step.icon}</div>
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="side-visual-v2">
                            <img src={STEPS_IMAGE} alt="Steps Illustration" className="side-img" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FIGHTER MODE SHOWCASE */}
            <section className="fighter-showcase">
                <div className="container">
                    <div className="fighter-preview-card glass-card">
                        <div className="fighter-showcase-content">
                            <div className="fighter-badge">
                                <Sword size={16} /> <span>Yenilik: Döyüşçü Rejimi</span>
                            </div>
                            <h2>Riyaziyyatın <span className="text-gradient-v2">Qəhrəmanı Ol!</span></h2>
                            <p>
                                Misalları həll et, qızıl qazan və öz döyüşçünü təkmilləşdir.
                                Nadir zirehlər, güclü silahlar və unikal xarakterlər səni gözləyir.
                            </p>
                            <div className="fighter-features-grid">
                                <div className="f-feature">
                                    <UserIcon size={20} color="var(--primary)" />
                                    <span>Xarakterini Yarat</span>
                                </div>
                                <div className="f-feature">
                                    <Shield size={20} color="#3b82f6" />
                                    <span>Nadir İnventar</span>
                                </div>
                                <div className="f-feature">
                                    <Flame size={20} color="#ef4444" />
                                    <span>Güclü Göstəricilər</span>
                                </div>
                            </div>
                            <Link to="/fighter" className="btn-main mt-2">
                                Döyüşçümə Get <ChevronRight size={20} />
                            </Link>
                        </div>
                        <div className="fighter-visual-preview">
                            <div className="hero-platform"></div>
                            {featuredChar ? (
                                <img
                                    src={featuredChar.image.startsWith('http') ? featuredChar.image : `${import.meta.env.VITE_API_URL || 'http://localhost:8002'}${featuredChar.image.startsWith('/') ? '' : '/'}${featuredChar.image}`}
                                    alt={featuredChar.name}
                                    className="fighter-preview-img featured-char-anim"
                                />
                            ) : (
                                <img src="" alt="" className="" />
                            )}

                            <div className="stat-floater sf-1">
                                <Sword size={14} color="#ef4444" /> <span>Hücum +99</span>
                            </div>
                            <div className="stat-floater sf-2">
                                <Shield size={14} color="#3b82f6" /> <span>Müdafiə +85</span>
                            </div>
                            <div className="stat-floater sf-3">
                                <Zap size={14} color="#fbbf24" /> <span>Mana +120</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* LEVELS SECTION - Now Content Section */}
            <section className="levels-section-v2">
                <div className="levels-bg-visual">
                    <img src={LEVELS_IMAGE} alt="Content Background" className="levels-img-v2" />
                </div>
                <div className="container">
                    <div className="levels-flex">
                        <div className="levels-info">
                            <h2>Platformamızın <span className="text-gradient-v2">Özəllikləri</span></h2>
                            <p>
                                Mathematics sadəcə bir quiz tətbiqi deyil, o təhsil səyahətində sizin ən yaxın köməkçinizdir.
                            </p>
                            <ul className="levels-list-v2">
                                <li><CheckCircle size={18} color="var(--success)" /> Dinamik artan mürəkkəblik</li>
                                <li><CheckCircle size={18} color="var(--success)" /> Hər yaşa uyğun sual bazası</li>
                                <li><CheckCircle size={18} color="var(--success)" /> Gündəlik yeni tapşırıqlar</li>
                            </ul>
                            <Link to="/register" className="btn-main mt-2">Daha Çox Kəşf Et</Link>
                        </div>
                        <div className="levels-visual-v2">
                            <div className="levels-cards-stack">
                                {contentHighlights.map((hl, idx) => (
                                    <div key={idx} className="level-mini-card">
                                        <div className="lmc-header">
                                            {hl.icon}
                                            <h4>{hl.title}</h4>
                                        </div>
                                        <p>{hl.desc}</p>
                                    </div>
                                ))}
                                <div className="level-mini-card glass-card infinite-badge">
                                    <TrendingUp size={24} color="var(--primary)" />
                                    <span>Və daha çox funksiyalar...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST SECTION */}
            <section className="trust-section">
                <div className="container">
                    <div className="trust-card glass-card">
                        <div className="trust-content">
                            <Shield size={48} color="var(--primary)" />
                            <h2>Təhsiliniz Bizimlə Güvəndədir</h2>
                            <p>Minlərlə valideyn və müəllim şagirdlərin inkişafını izləmək üçün Mathematics-ə etibar edir.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="final-cta">
                <div className="container">
                    <div className="cta-box-v2 glass-card">
                        <img src={CTA_BG} alt="CTA Background" className="cta-bg-img" />
                        <div className="cta-shapes">
                            <div className="c-shape s1"></div>
                            <div className="c-shape s2"></div>
                        </div>
                        <div className="cta-text">
                            <h2>Sən də Komandamıza Qoşul!</h2>
                            <p>Riyaziyyatı əyləncəyə çevirən minlərlə şagird arasında sən də yerini al.</p>
                        </div>
                        <div className="cta-btn-wrap">
                            <Link to="/register" className="btn-main btn-xl btn-white-v2">Başla <ChevronRight /></Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
