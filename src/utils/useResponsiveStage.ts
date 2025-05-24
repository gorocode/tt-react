/**
 * useResponsiveStage.ts
 * Custom React hook for responsive scaling of components based on container size
 * 
 * This hook helps maintain consistent UI proportions across different screen sizes
 * by calculating a scale factor based on original dimensions and container size.
 */
import { useState, useEffect, useRef } from 'react';

/**
 * A hook that provides responsive scaling for components
 * 
 * This hook:
 * - Creates a reference to attach to a container element
 * - Calculates a scale factor based on container dimensions vs original dimensions
 * - Determines if the container is in portrait or landscape orientation
 * - Updates automatically on resize using ResizeObserver
 * 
 * @param {number} originalWidth - The original/design width of the component
 * @param {number} originalHeight - The original/design height of the component
 * @returns {Object} Object containing containerRef, isPortrait flag, and scaleFactor
 */
const useResponsiveStage = (originalWidth: number, originalHeight: number) => {
    // Reference to attach to the container element
    const containerRef = useRef<HTMLDivElement>(null);
    // Scale factor to apply to child elements
    const [scaleFactor, setScaleFactor] = useState(1);
    // Whether the container is in portrait mode (height > width)
    const [isPortrait, setIsPortrait] = useState(true);

    /**
     * Effect to handle resize events and calculate the scale factor
     * Uses ResizeObserver for better performance than window resize events
     */
    useEffect(() => {
        // Handler function to calculate new dimensions and scale factor
        const handleResize = () => {
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    const containerHeight = containerRef.current.offsetHeight;
                    const containerWidth = containerRef.current.offsetWidth;
                    
                    // Determine orientation
                    setIsPortrait(containerHeight > containerWidth);

                    // Calculate scale factor based on container height
                    // Adding padding (50px) to avoid content touching edges
                    const newScaleFactor = containerHeight / (originalHeight + 50);
                    setScaleFactor(newScaleFactor);
                }
            });
        };

        // Set up ResizeObserver to watch for container size changes
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        
        // Initial calculation with a small delay to ensure container is properly rendered
        // This helps with consistent sizing when navigating between pages
        handleResize();
        
        // Secondary calculation after a brief delay to catch any post-render adjustments
        const delayedResize = setTimeout(() => {
            handleResize();
        }, 150);

        // Clean up observer and timeout on unmount
        return () => {
            observer.disconnect();
            clearTimeout(delayedResize);
        };
    }, [originalWidth, originalHeight]);

    /**
     * Return values for the hook
     * @property {React.RefObject<HTMLDivElement>} containerRef - Ref to attach to the container element
     * @property {boolean} isPortrait - Whether the container is in portrait orientation
     * @property {number} scaleFactor - Scale factor to apply to maintain proportions
     */
    return { containerRef, isPortrait, scaleFactor };
};

export default useResponsiveStage;
