import React from 'react';

/**
 * LoadingScreen component
 * 
 * Displays a centered loading spinner with text while content is being loaded.
 * Used during authentication initialization and other loading states throughout the application.
 * The component uses theme-aware styling with Tailwind CSS classes.
 */
const LoadingScreen: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Loading...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
