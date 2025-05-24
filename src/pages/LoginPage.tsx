import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { FiUser, FiLock, FiLogIn, FiGithub, FiExternalLink } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/global/Logo';
import ThemeSelector from '../components/global/ThemeSelector';

/**
 * LoginPage component
 * 
 * Provides the authentication entry point for managers and staff.
 * Features a responsive login form with username/password input,
 * error handling, and automatic redirection for authenticated users.
 * Includes theme selection and branding.
 */
const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, isAuthenticated, user } = useAuth();
    const { themeColors } = useTheme();
    const navigate = useNavigate();

    /**
     * Effect to check authentication status and redirect if already authenticated
     * Only redirects on initial mount, not during the login process
     */
    useEffect(() => {
        if (isAuthenticated() && !isLoading && user?.role && ["ADMIN", "MANAGER", "WORKER"].includes(user.role)) {
            navigate("/manager/orders");
        }
    }, [isLoading]);

    /**
     * Handles form submission for login
     * Prevents default form behavior and initiates authentication
     * 
     * @param e - Form event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            await login(username, password);
        }
    };

    return (
        <motion.div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ 
                background: `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.secondary}40 100%)`,
                color: themeColors.text
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Theme selector positioned in the corner */}
            <div className="absolute top-4 right-4">
                <ThemeSelector />
            </div>
            
            <motion.div 
                className="mb-8 flex flex-col items-center"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
                <Logo width={120} />
                <motion.h1 
                    className="mt-4 text-4xl font-bold"
                    style={{ color: themeColors.accent }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    TT Bar Manager
                </motion.h1>
            </motion.div>

            <motion.div
                className="w-full max-w-md p-8 rounded-xl shadow-xl"
                style={{ 
                    backgroundColor: themeColors.background,
                    boxShadow: `0 10px 30px -10px ${themeColors.accent}40` 
                }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold" style={{ color: themeColors.primary }}>
                        Manager Login
                    </h2>
                    <p className="mt-2 opacity-80">
                        Please enter your credentials to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <motion.div 
                            className="mb-6 p-4 rounded-lg flex items-center text-sm"
                            style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.accent }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="font-medium">{error}</span>
                        </motion.div>
                    )}

                    <div className="mb-5">
                        <label htmlFor="username" className="block mb-2 text-sm font-medium">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-70">
                                <FiUser size={18} />
                            </div>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full py-3 pl-10 pr-4 rounded-lg border focus:outline-none"
                                style={{
                                    backgroundColor: `${themeColors.primary}10`,
                                    borderColor: `${themeColors.primary}30`,
                                    color: themeColors.text
                                }}
                                placeholder="Enter your username"
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-70">
                                <FiLock size={18} />
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-3 pl-10 pr-4 rounded-lg border focus:outline-none"
                                style={{
                                    backgroundColor: `${themeColors.primary}10`,
                                    borderColor: `${themeColors.primary}30`,
                                    color: themeColors.text
                                }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center btn btn-accent btn-with-icon-animation"
                        style={{ 
                            backgroundColor: themeColors.accent,
                            color: themeColors.background
                        }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        {isLoading ? (
                            'Logging in...'
                        ) : (
                            <>
                                <FiLogIn size={20} className="mr-2" />
                                Login
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
            
            <motion.div 
                className="mt-6 text-sm opacity-70 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <p className="mb-2">© 2025 GoroCode. Open Source under MIT License.</p>
                <div className="flex justify-center space-x-4 mt-2">
                    <motion.a 
                        href="https://github.com/gorocode/tt-bar-manager" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-accent transition-colors duration-200"
                        style={{ color: themeColors.text }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <FiGithub size={16} className="mr-1" />
                        <span>GitHub</span>
                    </motion.a>
                    <motion.a 
                        href="https://gorocode.dev" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-accent transition-colors duration-200"
                        style={{ color: themeColors.text }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <FiExternalLink size={16} className="mr-1" />
                        <span>Portfolio</span>
                    </motion.a>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoginPage;
