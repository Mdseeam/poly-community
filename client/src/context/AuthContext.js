import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('https://poly-community.onrender.com/api/auth/me', {
                headers: { 'x-auth-token': token }
            }).then(res => {
                setUser(res.data);
                setLoading(false);
            }).catch(() => {
                localStorage.removeItem('token');
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('https://poly-community.onrender.com/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        const me = await axios.get('https://poly-community.onrender.com/api/auth/me', {
            headers: { 'x-auth-token': res.data.token }
        });
        setUser(me.data);
    };

    const register = async (formData) => {
        const res = await axios.post('https://poly-community.onrender.com/api/auth/register', formData);
        localStorage.setItem('token', res.data.token);
        const me = await axios.get('https://poly-community.onrender.com/api/auth/me', {
            headers: { 'x-auth-token': res.data.token }
        });
        setUser(me.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};