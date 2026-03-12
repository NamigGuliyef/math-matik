import React, { createContext, useContext, useState } from 'react';

interface User {
    id: string;
    name: string;
    surname: string;
    fatherName: string;
    email: string;
    grade: string;
    role: string;
    balance: number;
    level: string;
    correctAnswers: number;
    wrongAnswers: number;
    totalAnswered: number;
    quizStartTimes?: Record<string, string>; // Maps are serialized as objects in JSON
    restEndTimes?: Record<string, string>;
    levelProgress?: Record<string, number>;
    stageProgress?: Record<string, number>;
    levelSessionWrongAnswers?: Record<string, number>;
    answeredQuestions: string[];
    completedStages: string[];
    itemProgress: Record<string, number>;
    chests: number;
    profilePicture?: string;
    totalBattlesWon?: number;
}


interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const login = (userData: User, token: string) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Clear quiz rules skip preferences from session storage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('skipRules_')) {
                sessionStorage.removeItem(key);
            }
        });
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            login,
            logout,
            updateUser,
            setUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
