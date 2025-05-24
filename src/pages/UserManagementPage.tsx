import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useMessageModal } from '../context/MessageModalContext';
import { useTheme } from '../context/ThemeContext';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import { createUser, updateUser } from '../api/userService';
import { Navigate } from 'react-router-dom';
import { User, UserRegistrationRequest, UserUpdateRequest } from '../types';

// Icons
import { MdPeopleAlt, MdPersonAdd } from 'react-icons/md';

/**
 * User Management Page for administrators to view, create, update, and delete users
 * 
 * Features:
 * - Create, edit, and delete users with role-based permissions
 * - Modern UI with elegant transitions and theme-aware styling
 * - Responsive layout for different screen sizes
 */
const UserManagementPage: React.FC = () => {
    const { hasRole, isAuthenticated } = useAuth();
    const { showMessageModal } = useMessageModal();
    const { themeColors } = useTheme();
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);

    // Redirect if not authenticated or not admin
    if (!isAuthenticated() || !hasRole(['ADMIN'])) {
        return <Navigate to="/manager" />;
    }

    const handleCreateClick = () => {
        setSelectedUser(undefined);
        setIsEditing(false);
        setShowForm(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setSelectedUser(undefined);
    };

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

    return (
        <motion.div
            className="container mx-auto mb-5 px-4 py-6 h-full overflow-x-hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.primary})`,
                            boxShadow: `0 4px 12px -2px ${themeColors.accent}40`
                        }}
                    >
                        <MdPeopleAlt size={24} style={{ color: '#fff' }} />
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: themeColors.text }}
                    >
                        User Management
                    </h1>
                </div>
                {!showForm && (
                    <motion.button
                        onClick={handleCreateClick}
                        className="btn btn-accent btn-md btn-with-icon-animation btn-ripple flex items-center gap-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <MdPersonAdd size={20} />
                        Create New User
                    </motion.button>
                )}
            </motion.div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
                        <UserList onEdit={handleEditUser} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserManagementPage;
