// context/ThemeContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProviderCustom = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark'
  const [themePreference, setThemePreference] = useState('system'); // 'light' | 'dark' | 'system'

  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem('theme-preference');
        if (stored) setThemePreference(stored);
      } catch (err) {
        console.error('Error loading theme:', err);
      }
    };
    loadPreference();
  }, []);

  // Toggle theme: light → dark → system
  const toggleDarkMode = async () => {
    const next =
      themePreference === 'light'
        ? 'dark'
        : themePreference === 'dark'
        ? 'system'
        : 'light';

    try {
      await AsyncStorage.setItem('theme-preference', next);
      setThemePreference(next);
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  };

  // Determine actual theme based on preference or system
  const resolvedTheme =
    themePreference === 'system' ? systemColorScheme : themePreference;
  const isDarkMode = resolvedTheme === 'dark';

  const theme = {
    isDarkMode,
    themePreference,
    toggleDarkMode,
    colors: {
      background: isDarkMode ? '#000' : '#fff',
      text: isDarkMode ? '#fff' : '#000',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
