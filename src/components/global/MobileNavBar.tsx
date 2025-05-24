/**
 * MobileNavBar.tsx
 * Mobile navigation bar component for the manager interface.
 */

// React and external libraries
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';

// Icons
import { MdTableRestaurant, MdMenu, MdClose } from "react-icons/md";
import { BiSolidFoodMenu } from "react-icons/bi";
import { PiBowlFoodFill } from "react-icons/pi";
import { GrRestaurant } from "react-icons/gr";
import { TbInvoice } from "react-icons/tb";
import { FaFileInvoiceDollar, FaUsers } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";

// Context and components
import { useTheme } from '../../context/ThemeContext';
import ThemeSelector from './ThemeSelector';
import { useAuth } from '../../context/AuthContext';
import { useQuestionModal } from '../../context/QuestionModalContext';

/**
 * MobileNavBar component
 * 
 * Provides navigation for the mobile manager interface with:
 * - Fixed bottom navigation bar for primary actions
 * - Expandable drawer for additional options
 * - Theme-aware styling
 * - Visual indication of current route
 */
const MobileNavBar: React.FC = () => {
    const { hasRole, logout, user } = useAuth();
    const { themeColors } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { askQuestion } = useQuestionModal();

    /**
     * Checks if a route is currently active to highlight the current section
     * 
     * @param path - Route path to check
     * @returns true if the current location includes the given path
     */
    const isRouteActive = (path: string) => {
        return location.pathname.includes(path);
    };

    /**
     * Navigates to the specified route and closes the drawer
     * 
     * @param path - Route path to navigate to
     */
    const navigateTo = (path: string) => {
        navigate(path);
        setIsDrawerOpen(false);
    };

    /**
     * Handles the logout action
     */
    const handleLogout = async () => {
        const confirm = await askQuestion("Are you sure you want to logout?");
        if (!confirm) return;
        logout();
        navigate('/manager');
        setIsDrawerOpen(false);
    };

    /**
     * Toggles the drawer visibility
     */
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <>
            {/* Fixed bottom navigation bar */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 shadow-lg"
                style={{
                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`,
                    borderTop: `1px solid ${themeColors.secondary}25`
                }}
            >
                <motion.div
                    onClick={() => navigateTo("/m/manager/orders")}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center justify-center p-2"
                    style={{
                        color: isRouteActive('/orders') ? themeColors.accent : themeColors.text,
                    }}
                >
                    <TbInvoice size={24} />
                    <span className="text-xs mt-1">Orders</span>
                </motion.div>

                <motion.div
                    onClick={() => navigateTo("/m/manager/tables")}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center justify-center p-2"
                    style={{
                        color: isRouteActive('/tables') ? themeColors.accent : themeColors.text,
                    }}
                >
                    <MdTableRestaurant size={24} />
                    <span className="text-xs mt-1">Tables</span>
                </motion.div>

                <motion.div
                    onClick={() => navigateTo("/m/manager/menu")}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center justify-center p-2"
                    style={{
                        color: isRouteActive('/menu') ? themeColors.accent : themeColors.text,
                    }}
                >
                    <BiSolidFoodMenu size={24} />
                    <span className="text-xs mt-1">Menu</span>
                </motion.div>

                <motion.div
                    onClick={toggleDrawer}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center justify-center p-2"
                    style={{
                        color: isDrawerOpen ? themeColors.accent : themeColors.text,
                    }}
                >
                    {isDrawerOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
                    <span className="text-xs mt-1">More</span>
                </motion.div>
            </div>

            {/* Theme Selector */}
            {isDrawerOpen && (
                <motion.div className="absolute right-1 top-3 flex items-center justify-between px-5 py-4 mx-2 my-1 rounded-lg z-60"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                    <ThemeSelector />
                </motion.div>
            )}

            {/* Drawer for additional navigation options */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-16 left-0 right-0 z-40 shadow-lg rounded-t-2xl pb-4 pt-2"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`,
                            borderTop: `1px solid ${themeColors.secondary}25`,
                            maxHeight: 'calc(100vh - 16rem)',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

                        <motion.div
                            onClick={() => navigateTo("/m/manager/products")}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center px-5 py-4 mx-2 my-1 rounded-lg`}
                            style={{
                                backgroundColor: isRouteActive('/products') ? `${themeColors.accent}15` : 'transparent',
                                color: isRouteActive('/products') ? themeColors.accent : themeColors.text,
                            }}
                        >
                            <PiBowlFoodFill size={24} className="mr-3" />
                            <span className="text-base">Products</span>
                        </motion.div>

                        <motion.div
                            onClick={() => navigateTo("/m/manager/kitchen")}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center px-5 py-4 mx-2 my-1 rounded-lg`}
                            style={{
                                backgroundColor: isRouteActive('/kitchen') ? `${themeColors.accent}15` : 'transparent',
                                color: isRouteActive('/kitchen') ? themeColors.accent : themeColors.text,
                            }}
                        >
                            <GrRestaurant size={24} className="mr-3" />
                            <span className="text-base">Kitchen</span>
                        </motion.div>

                        <motion.div
                            onClick={() => navigateTo("/m/manager/invoices")}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center px-5 py-4 mx-2 my-1 rounded-lg`}
                            style={{
                                backgroundColor: isRouteActive('/invoices') ? `${themeColors.accent}15` : 'transparent',
                                color: isRouteActive('/invoices') ? themeColors.accent : themeColors.text,
                            }}
                        >
                            <FaFileInvoiceDollar size={24} className="mr-3" />
                            <span className="text-base">Invoices</span>
                        </motion.div>

                        {hasRole(["ADMIN"]) && (
                            <motion.div
                                onClick={() => navigateTo("/m/manager/users")}
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center px-5 py-4 mx-2 my-1 rounded-lg`}
                                style={{
                                    backgroundColor: isRouteActive('/users') ? `${themeColors.accent}15` : 'transparent',
                                    color: isRouteActive('/users') ? themeColors.accent : themeColors.text,
                                }}
                            >
                                <FaUsers size={24} className="mr-3" />
                                <span className="text-base">Users</span>
                            </motion.div>
                        )}

                        {/* User info display */}
                        {user && (
                            <div className="flex flex-col items-center px-5 py-3 mx-2 my-1 rounded-lg border border-solid"
                                 style={{
                                     backgroundColor: `${themeColors.accent}10`,
                                     borderColor: `${themeColors.accent}30`
                                 }}>
                                <span className="text-sm font-medium"
                                      style={{ color: themeColors.text }}>
                                    {user.username}
                                </span>
                                <span className="text-xs opacity-70"
                                      style={{ color: themeColors.text }}>
                                    Role: {user.role}
                                </span>
                            </div>
                        )}
                        
                        {/* Logout button */}
                        <motion.div
                            onClick={handleLogout}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center px-5 py-4 mx-2 my-1 rounded-lg"
                            style={{
                                color: themeColors.text,
                            }}
                        >
                            <FiLogOut size={24} className="mr-3" />
                            <span className="text-base">Logout</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay to close drawer when clicking outside */}
            {isDrawerOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black z-30"
                    onClick={toggleDrawer}
                />
            )}
        </>
    );
};

export default MobileNavBar;
