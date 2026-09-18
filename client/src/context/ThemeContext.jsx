import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode] = useState(false); // Force light mode exclusively

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('protein_theme', 'light');
  }, []);

  const toggleTheme = () => {}; // No-op

  return (
    <ThemeContext.Provider value={{ darkMode: false, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
