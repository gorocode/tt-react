/**
 * ThemeSelector.tsx
 * Button component that opens the theme selection modal.
 */

// React and external libraries
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PiPaintBrushFill } from 'react-icons/pi';

// Context and components
import { useTheme } from '../../context/ThemeContext';
import ThemeModal from './ThemeModal';

/**
 * ThemeSelector component
 * 
 * Provides a button to open the theme selection modal, allowing users to
 * change the application's visual theme. Features interactive animations
 * that respond to user interactions.
 */
const ThemeSelector = () => {
    const { themeColors } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * Toggles the visibility of the theme selection modal
     */
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div className="relative">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <motion.button
                    onClick={toggleModal}
                    className="p-3 text-xl shadow-xl rounded-full flex items-center justify-center relative overflow-hidden group"
                    style={{
                        backgroundColor: themeColors.accent,
                        color: themeColors.background,
                        boxShadow: `0 0 15px 0 ${themeColors.accent}60`
                    }}
                    whileHover={{
                        scale: 1.1,
                        boxShadow: `0 0 20px 0 ${themeColors.accent}80`,
                        rotate: 15
                    }}
                    whileTap={{ scale: 0.9, rotate: -15 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    aria-label="Change theme"
                >
                    <motion.span 
                        className="absolute inset-0 opacity-0 group-hover:opacity-30 z-0"
                        animate={{ 
                            background: `radial-gradient(circle at center, ${themeColors.background}50 0%, transparent 70%)`
                        }}
                    />
                    <PiPaintBrushFill className="relative z-10" />
                </motion.button>
            </motion.div>

            {/* Theme Modal */}
            <AnimatePresence>
                {isModalOpen && <ThemeModal isOpen={isModalOpen} onClose={toggleModal} />}
            </AnimatePresence>
        </div>
    );
};

export default ThemeSelector;
