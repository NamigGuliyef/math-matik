import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

interface Mission {
    _id: string;
    isClaimed: boolean;
    currentCount: number;
    targetCount: number;
}

interface MissionContextType {
    unclaimedCount: number;
    refreshMissions: () => Promise<void>;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const useMissionsCount = () => {
    const context = useContext(MissionContext);
    if (!context) {
        throw new Error('useMissionsCount must be used within a MissionProvider');
    }
    return context;
};

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [unclaimedCount, setUnclaimedCount] = useState(0);

    const refreshMissions = useCallback(async () => {
        if (!isAuthenticated) {
            setUnclaimedCount(0);
            return;
        }
        try {
            const res = await api.get('/missions');
            const daily = res.data.daily || [];
            const achievements = res.data.achievements || [];

            // Count missions that are NOT claimed
            const unclaimedDaily = daily.filter((m: Mission) => !m.isClaimed).length;
            const unclaimedAchievements = achievements.filter((m: Mission) => !m.isClaimed).length;

            setUnclaimedCount(unclaimedDaily + unclaimedAchievements);
        } catch (err) {
            console.error('Error fetching missions for count', err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            refreshMissions();
            // Optional: Set up an interval to refresh periodically
            const interval = setInterval(refreshMissions, 60000); // Every 1 minute
            return () => clearInterval(interval);
        } else {
            setUnclaimedCount(0);
        }
    }, [isAuthenticated, refreshMissions]);

    return (
        <MissionContext.Provider value={{ unclaimedCount, refreshMissions }}>
            {children}
        </MissionContext.Provider>
    );
};
