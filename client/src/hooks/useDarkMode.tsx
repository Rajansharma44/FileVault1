import { useState, useEffect } from 'react';

export default function useDarkMode() {
  // Check for system preference
  const getSystemPreference = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Get stored theme from localStorage or use system preference as fallback
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode === null) {
      // No stored preference, use system preference
      return getSystemPreference();
    }
    return storedMode === 'true';
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    // Update document class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't explicitly set a preference
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    // Add listener (using the appropriate method based on browser support)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
  };

  return { isDarkMode, toggleDarkMode, setDarkMode };
}
