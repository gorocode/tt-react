/**
 * MobileUserManagementPage.tsx
 * Mobile-optimized version of the UserManagementPage for administering users.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigate } from 'react-router-dom';

// Context
import { useAuth } from '../../context/AuthContext';
import { useMessageModal } from '../../context/MessageModalContext';
import { useTheme } from '../../context/ThemeContext';

// Components
import MobileUserList from '../../components/users/MobileUserList';
import UserForm from '../../components/users/UserForm';
import MobilePageWrapper from '../../components/global/MobilePageWrapper';

// API Services
import { createUser, updateUser } from '../../api/userService';

// Types
import { User, UserRegistrationRequest, UserUpdateRequest } from '../../types';

// Icons
import { MdPersonAdd, MdArrowBack } from 'react-icons/md';

/**
 * MobileUserManagementPage Component
 * 
 * Mobile-optimized interface for administering users, featuring:
 * - Vertically stacked layout optimized for mobile screens
 * - Touch-friendly controls with larger tap targets
 * - Simplified navigation between user list and form views
 * - Maintains all functionality of the desktop version
 */
const MobileUserManagementPage: React.FC = () => {
    const { hasRole, isAuthenticated } = useAuth();
    const { showMessageModal } = useMessageModal();
    const { themeColors } = useTheme();

    // UI state
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);

    // Redirect if not authenticated or not admin
    if (!isAuthenticated() || !hasRole(['ADMIN'])) {
        return <Navigate to="/manager" />;
    }

    /**
     * Initiates creation of a new user
     */
    const handleCreateClick = () => {
        setSelectedUser(undefined);
        setIsEditing(false);
        setShowForm(true);
    };

    /**
     * Handles editing an existing user
     */
    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditing(true);
        setShowForm(true);
    };

    /**
     * Cancels the form and returns to the user list
     */
    const handleCancelForm = () => {
        setShowForm(false);
        setSelectedUser(undefined);
    };

    /**
     * Handles form submission for creating or updating users
     */
    const handleSubmitForm = async (userData: UserRegistrationRequest | UserUpdateRequest) => {
        if (isEditing && selectedUser) {
            await updateUser(selectedUser.id, userData as UserUpdateRequest);
            showMessageModal('SUCCESS', 'User updated successfully.');
        } else {
            await createUser(userData as UserRegistrationRequest, (userData as UserUpdateRequest).role);
            showMessageModal('SUCCESS', 'User created successfully.');
        }
        setShowForm(false);
        setSelectedUser(undefined);
    };

    /**
     * Create user button for the header
     */
    const CreateButton = (
        <motion.button
            onClick={handleCreateClick}
            className="p-2 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400 }}
        >
            <MdPersonAdd size={24} />
        </motion.button>
    );

    /**
     * Back button for the header (when in form view)
     */
    const BackButton = (
        <motion.button
            onClick={handleCancelForm}
            className="p-2 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
                color: themeColors.text
            }}
        >
            <MdArrowBack size={24} />
        </motion.button>
    );

    return (
        <MobilePageWrapper
            title={showForm ? (isEditing ? "Edit User" : "Create User") : "Users"}
            headerAction={showForm ? BackButton : CreateButton}
        >
            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="border rounded-lg overflow-hidden"
                        style={{ borderColor: `${themeColors.secondary}25` }}
                    >
                        <UserForm
                            user={selectedUser}
                            onSubmit={handleSubmitForm}
                            onCancel={handleCancelForm}
                            isEdit={isEditing}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        className="w-full flex-1 flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <MobileUserList onEdit={handleEditUser} />
                    </motion.div>
                )}
            </AnimatePresence>
        </MobilePageWrapper>
    );
};

export default MobileUserManagementPage;
