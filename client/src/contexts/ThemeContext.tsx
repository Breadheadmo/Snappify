import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, getThemeColors, getThemeClasses, themeConfig, cssVariables } from '../utils/themeConfig';

interface ThemeContextType {
  theme: ThemeMode;
  colors: ReturnType<typeof getThemeColors>;
  themeClasses: ReturnType<typeof getThemeClasses>;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' // Default to dark theme to show your black shimmer theme
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [colors, setColors] = useState(getThemeColors(defaultTheme));
  const [themeClasses, setThemeClasses] = useState(getThemeClasses(defaultTheme));

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
      setColors(getThemeColors(savedTheme));
      setThemeClasses(getThemeClasses(savedTheme));
    }
  }, []);

  // Apply theme changes to DOM and localStorage
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    setColors(getThemeColors(theme));
    setThemeClasses(getThemeClasses(theme));
    
    // Apply CSS variables to root element for global access
    const root = document.documentElement;
    const themeColors = getThemeColors(theme);
    
    // Set CSS variables dynamically
    Object.entries(cssVariables).forEach(([cssVar, colorKey]) => {
      const colorValue = themeColors[colorKey as keyof typeof themeColors];
      if (colorValue) {
        root.style.setProperty(`--${cssVar}`, colorValue);
      }
    });
    
    // Apply theme class to body for global styling
    document.body.className = `${theme}-theme`;
    
    // Set global background and text color
    document.body.style.backgroundColor = themeColors.primary;
    document.body.style.color = themeColors.textPrimary;
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors.primary);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColors.primary;
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    
    // Update scrollbar styling
    const scrollbarStyle = document.getElementById('scrollbar-style');
    if (scrollbarStyle) {
      scrollbarStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'scrollbar-style';
    style.textContent = `
      ::-webkit-scrollbar-track {
        background: ${theme === 'dark' ? '#1f2937' : '#f1f5f9'};
      }
      ::-webkit-scrollbar-thumb {
        background: ${theme === 'dark' ? 'linear-gradient(135deg, #4b5563, #6b7280)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)'};
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${theme === 'dark' ? 'linear-gradient(135deg, #374151, #4b5563)' : 'linear-gradient(135deg, #2563eb, #7c3aed)'};
      }
    `;
    document.head.appendChild(style);
    
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prevTheme: ThemeMode) => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    colors,
    themeClasses,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen transition-all duration-300 ${themeClasses.background}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for component-specific theme utilities
export const useThemeUtils = () => {
  const { theme, themeClasses, isDark, colors } = useTheme();

  // Utility to combine classes safely
  const combineClasses = (...classes: (string | undefined | null | boolean)[]): string => {
    return classes.filter(Boolean).join(' ');
  };

  // Component-specific class generators
  const getCardClasses = (variant?: 'default' | 'hover' | 'elevated', additionalClasses?: string) => {
    const baseClass = variant === 'hover' ? themeClasses.cardHover : themeClasses.card;
    const elevatedClass = variant === 'elevated' ? (isDark ? 'shadow-2xl' : 'shadow-xl') : '';
    return combineClasses(baseClass, elevatedClass, additionalClasses);
  };

  const getButtonClasses = (
    variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' = 'primary',
    size: 'sm' | 'md' | 'lg' = 'md',
    additionalClasses?: string
  ) => {
    const variantClass = {
      primary: themeClasses.buttonPrimary,
      secondary: themeClasses.buttonSecondary,
      danger: themeClasses.buttonDanger,
      success: themeClasses.buttonSuccess,
      outline: themeClasses.buttonOutline,
    }[variant];

    const sizeClass = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    }[size];

    // Remove default px/py from variant class and apply size class
    const cleanVariantClass = variantClass.replace(/px-\d+\s*py-\d+/, '');
    
    return combineClasses(cleanVariantClass, sizeClass, additionalClasses);
  };

  const getInputClasses = (variant?: 'default' | 'error' | 'success', additionalClasses?: string) => {
    const baseClass = themeClasses.input;
    const variantClass = {
      default: '', // Add default property
      error: isDark ? 'border-red-500 focus:ring-red-500' : 'border-red-300 focus:ring-red-500',
      success: isDark ? 'border-green-500 focus:ring-green-500' : 'border-green-300 focus:ring-green-500',
    }[variant || 'default'] || '';

    return combineClasses(baseClass, variantClass, additionalClasses);
  };

  const getBadgeClasses = (
    status: 'success' | 'warning' | 'danger' | 'info' = 'info',
    size: 'sm' | 'md' | 'lg' = 'md',
    additionalClasses?: string
  ) => {
    const statusClass = {
      success: themeClasses.badgeSuccess,
      warning: themeClasses.badgeWarning,
      danger: themeClasses.badgeDanger,
      info: themeClasses.badgeInfo,
    }[status];

    const sizeClass = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base',
    }[size];

    // Remove default px/py from status class and apply size class
    const cleanStatusClass = statusClass.replace(/px-\d+\s*py-\d+/, '');
    
    return combineClasses(cleanStatusClass, sizeClass, additionalClasses);
  };

  const getTableClasses = () => ({
    container: themeClasses.table,
    header: themeClasses.tableHeader,
    row: themeClasses.tableRow,
    cell: themeClasses.tableCell,
  });

  const getModalClasses = () => ({
    overlay: themeClasses.modalOverlay,
    container: themeClasses.modal,
    content: themeClasses.modalContent,
  });

  const getNavClasses = () => ({
    nav: themeClasses.nav,
    link: themeClasses.navLink,
    activeLink: themeClasses.navLinkActive,
  });

  return {
    theme,
    isDark,
    colors,
    themeClasses,
    combineClasses,
    getCardClasses,
    getButtonClasses,
    getInputClasses,
    getBadgeClasses,
    getTableClasses,
    getModalClasses,
    getNavClasses,
  };
};

export default ThemeContext;
