import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        const fetchUnread = async () => {
            try {
                const { data } = await api.get('/notifications?unread=true');
                setUnreadCount(data.length || 0);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUnread();
        // Poll every 30 seconds
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
