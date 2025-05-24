import { motion } from "motion/react";
import { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Props for the PageTransition component
 */
interface PageTransitionProps {
    /** Child elements to be wrapped with the transition effect */
    children: ReactNode;
}

/**
 * PageTransition component
 * 
 * Provides smooth, animated transitions between pages using motion animations.
 * Creates a cohesive user experience when navigating between different views.
 * Includes subtle theme-aware styling and 3D perspective effects.
 * 
 * @param children - The page content to be wrapped with transition effects
 */
const PageTransition = ({ children }: PageTransitionProps) => {
    const { themeColors } = useTheme();
    
    // Animation variants for entry, display, and exit states
    const pageVariants = {
        initial: { 
            opacity: 0, 
            y: 20,
        },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: { 
                type: 'spring',
                stiffness: 260,
                damping: 20,
                mass: 1,
                delay: 0.1
            } 
        },
        exit: { 
            opacity: 0, 
            y: -20,
            transition: { 
                duration: 0.25,
                ease: [0.36, 0, 0.66, -0.56] 
            } 
        },
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative"
            style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Subtle theme-aware gradient background effect */}
            <div 
                className="absolute inset-0 opacity-30 pointer-events-none" 
                style={{
                    background: `radial-gradient(circle at 50% 30%, ${themeColors.accent}15, transparent 70%)`,
                    zIndex: -1
                }}
            />
            {children}
        </motion.div>
    );
}

export default PageTransition;