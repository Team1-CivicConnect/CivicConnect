import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Bootstrap: load user from stored access token ──────────────────────────
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const { data } = await api.get('/auth/me');
                    setUser(data.user);
                }
            } catch (err) {
                // Token invalid / expired — clear it
                localStorage.removeItem('accessToken');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // ── Login ──────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
        return data; // caller can check data.user.role
    }, []);

    // ── Register ───────────────────────────────────────────────────────────────
    const register = useCallback(async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        return data; // returns { message, email } — no token yet (needs OTP)
    }, []);

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // Ignore errors on logout
        }
        localStorage.removeItem('accessToken');
        setUser(null);
    }, []);

    // ── Update user in state (used after profile edits) ────────────────────────
    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
    }, []);

    // ── Refresh access token (called by api interceptor) ──────────────────────
    const refreshAccessToken = useCallback(async () => {
        try {
            const { data } = await api.post('/auth/refresh');
            localStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } catch {
            localStorage.removeItem('accessToken');
            setUser(null);
            return null;
        }
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        refreshAccessToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
