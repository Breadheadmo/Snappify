export type ThemeMode = 'light' | 'dark';

export const themeConfig = {
  light: {
    // Backgrounds
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    surface: '#F1F5F9',
    
    // Text Colors
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textAccent: '#64748B',
    
    // Accent Colors (Gray-based to match your preference, no blue)
    accent: '#4B5563',
    accentHover: '#374151',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#6B7280',
    
    // Borders
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.2)',
  },
  dark: {
    // Backgrounds (Black Theme)
    primary: '#000000',
    secondary: '#111827',
    surface: '#1F2937',
    
    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textAccent: '#9CA3AF',
    
    // Accent Colors (Gray-based instead of blue)
    accent: '#6B7280',
    accentHover: '#4B5563',
    
    // Status Colors (Enhanced for dark theme)
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#6B7280',
    
    // Borders
    border: '#374151',
    borderLight: '#4B5563',
    
    // Shadows
    shadow: 'rgba(255, 255, 255, 0.1)',
    shadowHover: 'rgba(255, 255, 255, 0.2)',
  }
};

// Theme class mappings that correspond to your CSS classes
export const themeClassMappings = {
  light: {
    // Layout Classes
    background: 'bg-white',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    card: 'bg-white shadow-lg rounded-xl p-6 border border-gray-200',
    cardHover: 'bg-white shadow-lg rounded-xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 border border-gray-200',
    header: 'bg-white shadow-sm border-b border-gray-200',
    sidebar: 'bg-gray-50 border-r border-gray-200',
    
    // Text Classes
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textAccent: 'text-gray-500',
    heading: 'text-gray-900 font-bold',
    
    // Button Classes
    buttonPrimary: 'bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105',
    buttonSecondary: 'bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105',
    buttonDanger: 'bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105',
    buttonSuccess: 'bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105',
    buttonOutline: 'border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300',
    
    // Form Classes
    input: 'border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent px-4 py-3 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300',
    select: 'border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent px-4 py-3 bg-white text-gray-900 transition-all duration-300',
    checkbox: 'rounded border-gray-300 bg-white text-gray-600 focus:ring-gray-500',
    label: 'text-gray-700 font-medium',
    
    // Navigation Classes
    nav: 'bg-white border-b border-gray-200',
    navLink: 'text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300',
    navLinkActive: 'text-gray-900 bg-gray-100 px-3 py-2 rounded-lg',
    
    // Table Classes
    table: 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
    tableHeader: 'bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200',
    tableRow: 'hover:bg-gray-50 transition-colors duration-300 border-b border-gray-100 last:border-b-0',
    tableCell: 'px-6 py-4 whitespace-nowrap text-gray-900',
    
    // Modal Classes
    modal: 'bg-white rounded-2xl shadow-2xl border border-gray-200',
    modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm',
    modalContent: 'p-8 text-gray-900',
    
    // Status Classes
    badgeSuccess: 'bg-green-100 text-green-800 px-3 py-1 text-sm font-medium rounded-full border border-green-200',
    badgeWarning: 'bg-yellow-100 text-yellow-800 px-3 py-1 text-sm font-medium rounded-full border border-yellow-200',
    badgeDanger: 'bg-red-100 text-red-800 px-3 py-1 text-sm font-medium rounded-full border border-red-200',
    badgeInfo: 'bg-gray-100 text-gray-800 px-3 py-1 text-sm font-medium rounded-full border border-gray-200',
    
    // Loading Classes
    loading: 'animate-pulse',
    shimmer: 'shimmer',
    shimmerOverlay: '',
    
    // Border Classes
    border: 'border-gray-200',
    borderLight: 'border-gray-100',
    divider: 'border-t border-gray-200',
  },
  dark: {
    // Layout Classes (Using your CSS classes)
    background: 'bg-black',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    card: 'theme-card',
    cardHover: 'theme-card-hover',
    header: 'theme-header',
    sidebar: 'theme-sidebar',
    
    // Text Classes
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textAccent: 'text-gray-400',
    heading: 'text-white font-bold',
    
    // Button Classes (Using your CSS classes)
    buttonPrimary: 'theme-button-primary',
    buttonSecondary: 'theme-button-secondary',
    buttonDanger: 'theme-button-danger',
    buttonSuccess: 'theme-button-success',
    buttonOutline: 'theme-button-outline',
    
    // Form Classes (Using your CSS classes)
    input: 'theme-input',
    select: 'theme-select',
    checkbox: 'theme-checkbox',
    label: 'theme-label',
    
    // Navigation Classes (Using your CSS classes)
    nav: 'theme-nav',
    navLink: 'theme-nav-link',
    navLinkActive: 'theme-nav-link-active',
    
    // Table Classes (Using your CSS classes)
    table: 'theme-table',
    tableHeader: 'theme-table-header',
    tableRow: 'theme-table-row',
    tableCell: 'theme-table-cell',
    
    // Modal Classes (Using your CSS classes)
    modal: 'theme-modal',
    modalOverlay: 'theme-modal-overlay',
    modalContent: 'theme-modal-content',
    
    // Status Classes (Using your CSS classes)
    badgeSuccess: 'theme-badge-success',
    badgeWarning: 'theme-badge-warning',
    badgeDanger: 'theme-badge-danger',
    badgeInfo: 'theme-badge-info',
    
    // Loading Classes (Using your CSS classes)
    loading: 'loading-shimmer',
    shimmer: 'shimmer-theme',
    shimmerOverlay: 'shimmer-overlay-hover',
    
    // Border Classes
    border: 'border-gray-700',
    borderLight: 'border-gray-800',
    divider: 'theme-divider',
  }
};

// Helper functions
export const getThemeColors = (mode: ThemeMode) => themeConfig[mode];
export const getThemeClasses = (mode: ThemeMode) => themeClassMappings[mode];

// CSS variable names for dynamic theming
export const cssVariables = {
  // Background variables
  'color-bg-primary': 'primary',
  'color-bg-secondary': 'secondary',
  'color-bg-surface': 'surface',
  
  // Text variables
  'color-text-primary': 'textPrimary',
  'color-text-secondary': 'textSecondary',
  'color-text-accent': 'textAccent',
  
  // Accent variables
  'color-accent': 'accent',
  'color-accent-hover': 'accentHover',
  
  // Status variables
  'color-success': 'success',
  'color-warning': 'warning',
  'color-error': 'error',
  'color-info': 'info',
  
  // Border variables
  'color-border': 'border',
  'color-border-light': 'borderLight',
  
  // Shadow variables
  'color-shadow': 'shadow',
  'color-shadow-hover': 'shadowHover',
};

// Theme transition settings
export const themeTransition = {
  duration: '300ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  properties: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
};

export default {
  themeConfig,
  themeClassMappings,
  getThemeColors,
  getThemeClasses,
  cssVariables,
  themeTransition,
  breakpoints,
  zIndex,
};