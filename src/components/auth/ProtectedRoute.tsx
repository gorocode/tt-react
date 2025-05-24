import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../global/LoadingScreen';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
    /**
     * Optional array of roles that are allowed to access the protected route
     * If not provided, any authenticated user can access the route
     */
    requiredRole?: string[];
}

/**
 * ProtectedRoute component to restrict access to authenticated users only.
 * Handles route protection based on authentication status and user roles.
 * Supports waiting for authentication to initialize before making access decisions.
 * 
 * @param requiredRole - Optional array of roles that are allowed to access the protected routes
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    requiredRole
}) => {
    const { isAuthenticated, user, isLoading, authInitialized } = useAuth();
    
    // Wait for authentication to be initialized before making any decisions
    if (isLoading || !authInitialized) {
        return <LoadingScreen />;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
        return <Navigate to="/manager" replace />;
    }

    // If a specific role is required and the user doesn't have it, redirect to login
    if (requiredRole && (!user || !requiredRole.includes(user.role))) {
        return <Navigate to="/manager" replace />;
    }

    // If authenticated and has the right role, render the children routes
    return <Outlet />;
};

export default ProtectedRoute;
