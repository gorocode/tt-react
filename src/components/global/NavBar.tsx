/**
 * NavBar.tsx
 * Main navigation sidebar component for the manager interface.
 */

// React and external libraries
import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';

// Icons
import { MdTableRestaurant } from "react-icons/md";
import { BiSolidFoodMenu } from "react-icons/bi";
import { PiBowlFoodFill } from "react-icons/pi";
import { GrRestaurant } from "react-icons/gr";
import { TbInvoice, TbArrowBadgeRightFilled, TbArrowBadgeLeftFilled } from "react-icons/tb";
import { FaFileInvoiceDollar, FaUsers } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";

// Context and components
import { useTheme } from '../../context/ThemeContext';
import ThemeSelector from './ThemeSelector';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';

/**
 * Props for the NavBar component
 */
type NavBarProps = {
    /** Whether the navbar is currently hidden */
    hidden: boolean;
    /** Function to toggle the navbar visibility */
    setHidden: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * NavBar component
 * 
 * Provides navigation for the manager interface with:
 * - Collapsible sidebar with animation
 * - Theme-aware styling
 * - Visual indication of current route
 * - Access to all main application areas
 * 
 * @param hidden - Whether the navbar is currently hidden
 * @param setHidden - Function to toggle navbar visibility
 */
const NavBar = ({ hidden, setHidden }: NavBarProps) => {
    const { hasRole, logout, user } = useAuth();
    const { themeColors } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

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
     * Navigates to the specified route
     * 
     * @param path - Route path to navigate to
     */
    const navigateTo = (path: string) => {
        navigate(path);
    };

    /**
     * Handles click on a navigation item
     * 
     * @param path - Route path to navigate to
     */
    const handleNavItemClick = (path: string) => {
        navigateTo(path);
    };

    /**
     * Toggles the navbar visibility
     */
    const toggleNavbar = () => {
        setHidden(!hidden);
    };

    /**
     * Handles the navbar toggle button click
     */
    const handleToggleNavbar = () => {
        toggleNavbar();
    };

    return (
        <motion.nav
            className="sm:block absolute h-full min-w-[200px] font-medium relative z-10 select-none shadow-lg"
            animate={hidden ? { x: -200 } : { x: 0 }}
            style={{
                backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`,
                borderRight: `1px solid ${themeColors.secondary}25`
            }}
            transition={{ ease: "easeInOut", duration: 0.3 }}
        >
            <div className='w-full flex justify-center pt-6 pb-4'>
                <Logo width={128} />
            </div>
            <div className="w-full flex items-center select-none pointer-events-none px-4 mb-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-transparent"
                    style={{ background: `linear-gradient(to right, transparent, ${themeColors.text}40, transparent)` }}></div>
            </div>
            <motion.div
                onClick={() => handleNavItemClick("/manager/orders")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex gap-2 items-center px-5 py-3 my-1 mx-2 cursor-pointer rounded-md transition-all duration-200`}
                style={{
                    backgroundColor: isRouteActive('/orders') ? `${themeColors.accent}15` : 'transparent',
                    color: isRouteActive('/orders') ? themeColors.accent : themeColors.text,
                    borderLeft: isRouteActive('/orders') ? `3px solid ${themeColors.accent}` : '3px solid transparent'
                }}
            >
                <TbInvoice size={18} />
                <span>Orders</span>
            </motion.div>
            <motion.div
                onClick={() => handleNavItemClick("/manager/invoices")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex gap-2 items-center px-5 py-3 my-1 mx-2 cursor-pointer rounded-md transition-all duration-200`}
                style={{
                    backgroundColor: isRouteActive('/invoices') ? `${themeColors.accent}15` : 'transparent',
                    color: isRouteActive('/invoices') ? themeColors.accent : themeColors.text,
                    borderLeft: isRouteActive('/invoices') ? `3px solid ${themeColors.accent}` : '3px solid transparent'
                }}
            >
                <FaFileInvoiceDollar size={18} />
                <span>Invoices</span>
            </motion.div>
            <motion.div
                onClick={() => handleNavItemClick("/manager/tables")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex gap-2 items-center px-5 py-3 my-1 mx-2 cursor-pointer rounded-md transition-all duration-200`}
                style={{
                    backgroundColor: isRouteActive('/tables') ? `${themeColors.accent}15` : 'transparent',
                    color: isRouteActive('/tables') ? themeColors.accent : themeColors.text,
                    borderLeft: isRouteActive('/tables') ? `3px solid ${themeColors.accent}` : '3px solid transparent'
                }}
            >
                <MdTableRestaurant size={18} />
                <span>Tables</span>
            </motion.div>
            <motion.div
                onClick={() => handleNavItemClick("/manager/products")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex gap-2 items-center px-5 py-3 my-1 mx-2 cursor-pointer rounded-md transition-all duration-200`}
                style={{
                    backgroundColor: isRouteActive('/products') ? `${themeColors.accent}15` : 'transparent',
                    color: isRouteActive('/products') ? themeColors.accent : themeColors.text,
                    borderLeft: isRouteActive('/products') ? `3px solid ${themeColors.accent}` : '3px solid transparent'
                }}
            >
                <PiBowlFoodFill size={18} />
                <span>Products</span>
            </motion.div>
            <motion.div
                onClick={() => handleNavItemClick("/manager/menu")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex gap-2 items-center px-5 py-3 my-1 mx-2 cursor-pointer rounded-md transition-all duration-200`}
                style={{
                    backgroundColor: isRouteActive('/menu') ? `${themeColors.accent}15` : 'transparent',
                    color: isRouteActive('/menu') ? themeColors.accent : themeColors.text,
                    borderLeft: isRouteActive('/menu') ? `3px solid ${themeColors.accent}` : '3px solid transparent'
                }}
            >
                <BiSolidFoodMenu size={18} />
                <span>Menu</span>
            </motion.div>
            <motion.div
                onClick={() => handleNavItemClick("/manager/kitchen")}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex gap-2 items-center px-5 py-3 my-1 mx-2 cursor-pointer rounded-md transition-all duration-200`}
                style={{
                    backgroundColor: isRouteActive('/kitchen') ? `${themeColors.accent}15` : 'transparent',
                    color: isRouteActive('/kitchen') ? themeColors.accent : themeColors.text,
                    borderLeft: isRouteActive('/kitchen') ? `3px solid ${themeColors.accent}` : '3px solid transparent'
                }}
            >
                <GrRestaurant size={18} />
                <span>Kitchen</span>
            </motion.div>
            {hasRole(["ADMIN"]) && (
                <motion.div
                    onClick={() => handleNavItemClick("/manager/users")}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex gap-2 items-center px-5 py-3 my-1 mx-2 cursor-pointer rounded-md transition-all duration-200`}
                    style={{
                        backgroundColor: isRouteActive('/users') ? `${themeColors.accent}15` : 'transparent',
                        color: isRouteActive('/users') ? themeColors.accent : themeColors.text,
                        borderLeft: isRouteActive('/users') ? `3px solid ${themeColors.accent}` : '3px solid transparent'
                    }}
                >
                    <FaUsers size={18} />
                    <span>Users</span>
                </motion.div>
            )}
            {/* Theme selector and logout section at bottom */}
            <div className="absolute bottom-5 left-0 right-0 px-5 flex flex-col gap-4">
                {/* User info display */}
                {user && (
                    <div className="flex flex-col items-center mb-2 py-2 px-3 rounded-md border border-solid"
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
                <motion.div
                    onClick={() => logout()}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex gap-2 items-center px-5 py-2 cursor-pointer rounded-md transition-all duration-200 border border-solid`}
                    style={{
                        backgroundColor: 'transparent',
                        color: themeColors.text,
                        borderColor: `${themeColors.accent}40`
                    }}
                >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                </motion.div>
                <ThemeSelector />
            </div>

            <motion.button
                onClick={handleToggleNavbar}
                className={`absolute top-1/2 ${hidden ? 'right-[-40px] rounded-r-lg' : 'right-[-30px] rounded-xl'} transform -translate-y-1/2 border border-solid p-2 shadow-lg`}
                style={{
                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`,
                    color: themeColors.accent,
                    borderColor: `${themeColors.secondary}40`,
                    boxShadow: 'var(--shadow-md)'
                }}
                whileHover={{ scale: 1.1, color: themeColors.text }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
                {hidden ? <TbArrowBadgeRightFilled size={22} /> : <TbArrowBadgeLeftFilled size={22} />}
            </motion.button>
        </motion.nav>

    )
}

export default NavBar;