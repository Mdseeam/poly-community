import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [accent, setAccent] = useState(() => localStorage.getItem('accent') || '#007bff');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.body.className = theme;
        document.documentElement.style.setProperty('--accent', accent);
        localStorage.setItem('accent', accent);
    }, [theme, accent]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const changeAccent = (color) => setAccent(color);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, accent, changeAccent }}>
            {children}
        </ThemeContext.Provider>
    );
};