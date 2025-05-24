/**
 * ThemeContext.tsx
 * Context for managing application-wide theme settings.
 * Provides theme switching, custom theme management, and CSS variable updates.
 */
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

/**
 * Built-in theme names available in the application
 * @type {string}
 */
export type BuiltInThemeName = 'sunriseCappuccino' | 'midnight' | 'oliveGreen' | 'vintageGarnet' | 'deepOcean' | 'royalPurple' | 'autumnForest' | 'freshMint' | 'techDark' | 'rosySunrise';

/**
 * Theme name can be a built-in theme or a custom theme name
 * @type {string}
 */
export type ThemeName = BuiltInThemeName | string;

/**
 * Core color properties that every theme must define
 * @interface ThemeColors
 */
export interface ThemeColors {
    /** Background color for content areas */
    background: string;
    /** Main text color */
    text: string;
    /** Primary UI color */
    primary: string;
    /** Secondary UI color for accents and highlights */
    secondary: string;
    /** Accent color for buttons, links, and interactive elements */
    accent: string;
}

/**
 * Custom theme definition with metadata
 * Extends ThemeColors with additional properties for UI display
 * @interface CustomTheme
 * @extends {ThemeColors}
 */
export interface CustomTheme extends ThemeColors {
    /** Unique identifier for the theme */
    name: string;
    /** Display name shown in UI */
    label: string;
    /** Short description of the theme */
    description: string;
}

/**
 * Collection of built-in themes with predefined color palettes
 * @const {Record<BuiltInThemeName, ThemeColors>}
 */
export const builtInThemes: Record<BuiltInThemeName, ThemeColors> = {
    sunriseCappuccino: {
      background: '#f9f5f2',
      text: '#382e25',
      primary: '#c7a17a',
      secondary: '#e0ceba',
      accent: '#9b6a37',
    },
    midnight: {
      background: '#1e2a3a',
      text: '#e6edf5',
      primary: '#4d89c4',
      secondary: '#364b63',
      accent: '#77b6ea',
    },
    oliveGreen: {
      background: '#f4f7f2',
      text: '#2c3027',
      primary: '#7d9364',
      secondary: '#cad8c0',
      accent: '#566d3f',
    },
    vintageGarnet: {
      background: '#f5f2f4',
      text: '#332728',
      primary: '#a83e51',
      secondary: '#e3c9cf',
      accent: '#812836',
    },
    deepOcean: {
      background: '#f0f5f7',
      text: '#252e33',
      primary: '#3b7c96',
      secondary: '#c2d8e0',
      accent: '#1d5d75',
    },
    royalPurple: {
      background: '#f4f2f7',
      text: '#2e2733',
      primary: '#7c54a6',
      secondary: '#d7c9e3',
      accent: '#513279',
    },
    autumnForest: {
      background: '#f6f4ef',
      text: '#312c24',
      primary: '#d17f4d',
      secondary: '#e9d8c6',
      accent: '#9b5a30',
    },
    freshMint: {
      background: '#f2f7f5',
      text: '#253330',
      primary: '#4dbd9e',
      secondary: '#c0e0d6',
      accent: '#318a74',
    },
    techDark: {
      background: '#14161a',
      text: '#eaedf1',
      primary: '#4fc3f7',
      secondary: '#2a323e',
      accent: '#03a9f4',
    },
    rosySunrise: {
      background: '#fdf4f7',
      text: '#3a2a2e',
      primary: '#e87da0',
      secondary: '#f5d0db',
      accent: '#d0456e',
    }
  };
  
/**
 * Retrieves custom themes from localStorage
 * Handles JSON parsing errors gracefully
 * 
 * @returns {Record<string, CustomTheme>} Object of custom themes by name
 */
export const getCustomThemes = (): Record<string, CustomTheme> => {
    const storedThemes = localStorage.getItem('customThemes');
    if (storedThemes) {
        try {
            return JSON.parse(storedThemes);
        } catch (error) {
            console.error('Failed to parse custom themes:', error);
            return {};
        }
    }
    return {};
};

/**
 * Context interface for theme management functions and state
 * @interface ThemeContextType
 */
interface ThemeContextType {
    /** Currently active theme name */
    currentTheme: ThemeName;
    /** Function to change the active theme */
    setTheme: (theme: ThemeName) => void;
    /** Colors of the currently active theme */
    themeColors: ThemeColors;
    /** Function to create a new custom theme */
    addCustomTheme: (theme: CustomTheme) => void;
    /** Function to update an existing custom theme */
    updateCustomTheme: (theme: CustomTheme) => void;
    /** Function to delete a custom theme */
    deleteCustomTheme: (themeName: string) => void;
    /** Collection of all user-defined custom themes */
    customThemes: Record<string, CustomTheme>;
}

/**
 * React context for theme management
 * Initially undefined until Provider is mounted
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider component that manages theme state and updates CSS variables
 * Features:
 * - Persists theme preference in localStorage
 * - Syncs with system color scheme preference
 * - Manages custom themes in localStorage
 * - Updates CSS variables when theme changes
 *
 * @param {object} props - Component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Provider with theme context
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Theme state management
    const [currentTheme, setCurrentTheme] = useState<ThemeName>('light');
    const [customThemes, setCustomThemes] = useState<Record<string, CustomTheme>>({});

    /**
     * Load custom themes from localStorage on initial render
     */
    useEffect(() => {
        setCustomThemes(getCustomThemes());
    }, []);

    // Get all available themes (built-in + custom)
    const allThemes: Record<string, ThemeColors> = { ...builtInThemes, ...customThemes };

    // Get theme colors based on current theme
    const themeColors = allThemes[currentTheme] || builtInThemes.sunriseCappuccino;

    /**
     * Adds a new custom theme to localStorage and state
     * Validates that theme name is not empty
     * 
     * @param {CustomTheme} theme - New theme to add
     */
    const addCustomTheme = (theme: CustomTheme) => {
        if (!theme.name || theme.name.trim() === '') {
            console.error("Theme name cannot be empty");
            return;
        }

        const newCustomThemes = {
            ...customThemes,
            [theme.name]: theme
        };

        setCustomThemes(newCustomThemes);
        localStorage.setItem('customThemes', JSON.stringify(newCustomThemes));
    };

    /**
     * Updates an existing custom theme
     * If the current theme is updated, applies changes immediately
     * 
     * @param {CustomTheme} theme - Updated theme data
     */
    const updateCustomTheme = (theme: CustomTheme) => {
        if (!customThemes[theme.name]) {
            console.error(`Theme ${theme.name} does not exist`);
            return;
        }

        const updatedCustomThemes = {
            ...customThemes,
            [theme.name]: theme
        };

        setCustomThemes(updatedCustomThemes);
        localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes));

        // If the updated theme is the current theme, update it
        if (currentTheme === theme.name) {
            setTheme(theme.name);
        }
    };

    /**
     * Deletes a custom theme from localStorage and state
     * If the deleted theme is currently active, switches to light theme
     * 
     * @param {string} themeName - Name of the theme to delete
     */
    const deleteCustomTheme = (themeName: string) => {
        if (!customThemes[themeName]) {
            console.error(`Theme ${themeName} does not exist`);
            return;
        }

        const newCustomThemes = { ...customThemes };
        delete newCustomThemes[themeName];

        setCustomThemes(newCustomThemes);
        localStorage.setItem('customThemes', JSON.stringify(newCustomThemes));

        // If the deleted theme is the current theme, switch to light theme
        if (currentTheme === themeName) {
            setTheme('light');
        }
    };

    /**
     * Sets the active theme and updates CSS variables
     * Stores preference in localStorage and updates document attributes
     * 
     * @param {ThemeName} theme - Name of the theme to activate
     */
    const setTheme = (theme: ThemeName) => {
        // Check if theme exists in allThemes
        if (!allThemes[theme]) {
            console.error(`Theme ${theme} does not exist`);
            return;
        }

        setCurrentTheme(theme);
        localStorage.setItem('theme', theme);

        const selectedTheme = allThemes[theme];

        // Update CSS variables
        const root = document.documentElement;
        root.style.setProperty('--background', selectedTheme.background);
        root.style.setProperty('--text', selectedTheme.text);
        root.style.setProperty('--primary', selectedTheme.primary);
        root.style.setProperty('--secondary', selectedTheme.secondary);
        root.style.setProperty('--accent', selectedTheme.accent);

        // Set data-theme attribute for compatibility with existing code
        document.documentElement.setAttribute('data-theme', theme);
    };

    /**
     * Initialize theme from localStorage or system preference
     * Listens for system preference changes and updates if no manual selection
     */
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeName | null;

        if (savedTheme && Object.prototype.hasOwnProperty.call(allThemes, savedTheme)) {
            setTheme(savedTheme);
        } else {
            // Check system preference for dark mode
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setTheme,
            themeColors,
            addCustomTheme,
            updateCustomTheme,
            deleteCustomTheme,
            customThemes
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Custom hook to access the theme context
 * Must be used within a ThemeProvider component
 * 
 * @returns {ThemeContextType} Theme context with colors and functions
 * @throws {Error} If used outside of a ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
