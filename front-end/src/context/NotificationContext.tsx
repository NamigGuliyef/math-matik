import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="notification-container">
                {notifications.map((n) => (
                    <div key={n.id} className={`notification-toast ${n.type}`}>
                        <div className="notification-icon">
                            {n.type === 'success' && <CheckCircle size={20} />}
                            {n.type === 'error' && <AlertCircle size={20} />}
                            {n.type === 'info' && <Info size={20} />}
                            {n.type === 'warning' && <AlertCircle size={20} />}
                        </div>
                        <div className="notification-message">{n.message}</div>
                        <button className="notification-close" onClick={() => removeNotification(n.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                }
                .notification-toast {
                    pointer-events: auto;
                    min-width: 300px;
                    max-width: 450px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    background: rgba(15, 15, 20, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    animation: slideIn 0.3s ease forwards;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-toast.success { border-left: 4px solid #10b981; }
                .notification-toast.error { border-left: 4px solid #ef4444; }
                .notification-toast.info { border-left: 4px solid #3b82f6; }
                .notification-toast.warning { border-left: 4px solid #f59e0b; }
                
                .notification-icon.success { color: #10b981; }
                .notification-icon.error { color: #ef4444; }
                
                .notification-message { flex: 1; font-weight: 500; font-size: 0.95rem; }
                .notification-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .notification-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
            `}} />
        </NotificationContext.Provider>
    );
};
