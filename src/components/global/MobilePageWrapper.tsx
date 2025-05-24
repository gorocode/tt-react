/**
 * MobilePageWrapper.tsx
 * Wrapper component for mobile pages that provides consistent layout and navigation.
 */

// React and external libraries
import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

// Context
import { useTheme } from '../../context/ThemeContext';

/**
 * Props for the MobilePageWrapper component
 * @interface MobilePageWrapperProps
 */
interface MobilePageWrapperProps {
    /** Page title to display in the header */
    title: string;
    /** Children components to render within the page */
    children: ReactNode;
    /** Optional right header action component */
    headerAction?: ReactNode;
}

/**
 * MobilePageWrapper component
 * 
 * Provides a consistent layout for mobile pages with:
 * - Fixed header with page title and optional action
 * - Content area with proper padding for mobile view
 * - Mobile navigation bar at the bottom
 * - Theme-aware styling
 * 
 * @param {MobilePageWrapperProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const MobilePageWrapper: React.FC<MobilePageWrapperProps> = ({ 
    title, 
    children,
    headerAction
}) => {
    const { themeColors } = useTheme();

    return (
        <div 
            className="flex flex-col w-[100vw] h-[100vh] overflow-hidden"
            style={{ backgroundColor: themeColors.background }}
        >
            {/* Header */}
            <motion.header
                className="flex items-center justify-between px-4 py-3 shadow-sm z-10"
                style={{
                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.primary})`,
                    borderBottom: `1px solid ${themeColors.secondary}25`
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
            >
                <h1 
                    className="text-xl font-medium truncate"
                    style={{ color: themeColors.text }}
                >
                    {title}
                </h1>
                {headerAction && (
                    <div className="flex items-center">
                        {headerAction}
                    </div>
                )}
            </motion.header>

            {/* Content area */}
            <motion.main 
                className="flex-1 overflow-auto p-4 pb-20" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                {children}
            </motion.main>

        </div>
    );
};

export default MobilePageWrapper;
