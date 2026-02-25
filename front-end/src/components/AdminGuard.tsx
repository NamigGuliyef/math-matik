import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
};

export default AdminGuard;
