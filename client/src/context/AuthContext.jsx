import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../services/api'; // We will create this

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const { data } = await api.get('/auth/me');
                    setUser(data.user);
                }
            } catch (err) {
                console.error('Auth initialization failed', err);
                localStorage.removeItem('accessToken');
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
