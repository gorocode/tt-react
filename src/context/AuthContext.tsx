import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '../config'

/**
 * User information returned from authentication
 */
export type User = {
    id: string;
    username: string;
    email: string;
    role: string;
};
/**
 * Authentication context interface defining all available
 * methods and properties for authentication management
 */
type AuthContextType = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    authInitialized: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: () => boolean;
    hasRole: (role: string[]) => boolean;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    authInitialized: false,
    login: async () => { },
    logout: () => { },
    isAuthenticated: () => false,
    hasRole: () => false,
});

/**
 * Custom hook for accessing authentication context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Authentication provider component that handles user authentication state,
 * token validation, login, and logout functionality
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [authInitialized, setAuthInitialized] = useState<boolean>(false);
    const navigate = useNavigate();

    /**
     * Effect to validate the authentication token and extract user data on component mount
     * This only runs once when the component is first loaded
     */
    useEffect(() => {
        const validateTokenAndExtractUser = async () => {
            setIsLoading(true);

            if (token) {
                try {
                    const payloadBase64 = token.split('.')[1];
                    const payload = JSON.parse(atob(payloadBase64));

                    // Check if token is expired
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (payload.exp && payload.exp < currentTime) {
                        localStorage.removeItem('auth_token');
                        setToken(null);
                        setUser(null);
                    } else {
                        const userDataFromToken = {
                            id: payload.sub,
                            username: payload.sub,
                            email: payload.email || '',
                            role: payload.role.replace("ROLE_", "") || 'CUSTOMER',
                        };
                        setUser(userDataFromToken);
                    }
                } catch (err) {
                    localStorage.removeItem('auth_token');
                    setToken(null);
                }
            }
            setAuthInitialized(true);
            setIsLoading(false);
        };
        validateTokenAndExtractUser();
    }, []);

    /**
     * Authenticates a user with username and password
     * @param username User's username
     * @param password User's password
     */
    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed');
            }

            const data = await response.json();
            localStorage.setItem('auth_token', data.token);

            setUser({
                id: data.userId,
                username: data.username,
                email: data.email,
                role: data.role,
            });
            setToken(data.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setIsLoading(false);
            if (!error) {
                navigate('/manager/menu');
            }
        }
    };

    /**
     * Logs out the current user by clearing auth state and redirecting to login
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_token');
        setToken(null);
        navigate('/manager');
    }

    /**
     * Checks if a user is currently authenticated
     * @returns True if user is authenticated, false otherwise
     */
    const isAuthenticated = () => {
        return !!token && !!user;
    };

    /**
     * Checks if the current user has provided role
     * @returns True if user has provided role, false otherwise
     */
    const hasRole = (roles: string[]) => {
        return isAuthenticated() && !!user?.role && roles.includes(user.role);
    };

    const value = {
        user,
        token,
        isLoading,
        error,
        authInitialized,
        login,
        logout,
        isAuthenticated,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
