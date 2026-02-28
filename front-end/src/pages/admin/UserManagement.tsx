import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { User as UserIcon, Calendar } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    surname: string;
    balance: number;
    level: string;
    correctAnswers: number;
    totalAnswered: number;
    createdAt: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1>İstifadəçilər</h1>
                <p className="text-muted">Platformada qeydiyyatdan keçmiş tələbələr.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {users.map((user) => (
                    <div key={user._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'var(--primary)20', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon size={24} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{user.name} {user.surname}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <Calendar size={14} />
                                    {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Balans</p>
                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--secondary)' }}>{user.balance.toFixed(3)} ₼</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Səviyyə</p>
                                <p style={{ margin: 0, fontWeight: 700 }}>{user.level.toUpperCase()}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Suallar</p>
                                <p style={{ margin: 0, fontWeight: 700 }}>{user.correctAnswers}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {users.length === 0 && <p className="text-muted" style={{ textAlign: 'center' }}>Heç bir istifadəçi tapılmadı.</p>}
        </div>
    );
};

export default UserManagement;
