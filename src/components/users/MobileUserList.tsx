import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Icons
import { BiSolidEdit } from 'react-icons/bi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { FaSortDown, FaSortUp } from "react-icons/fa6";
import { HiOutlineSearch } from 'react-icons/hi';
import { MdClose, MdOutlinePerson } from 'react-icons/md';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useQuestionModal } from '../../context/QuestionModalContext';
import { useMessageModal } from '../../context/MessageModalContext';

// Services
import { deleteUser, getAllUsers } from '../../api/userService';

// Types
import { User } from '../../types';

interface MobileUserListProps {
    onEdit: (user: User) => void;
}

/**
 * MobileUserList Component
 * 
 * Displays user data in a mobile-friendly card layout with sorting, searching, and action capabilities.
 * Features:
 * - Sorting by username, email, and role
 * - Search filtering by username, email, and name
 * - Visual indicators for role and status
 * - Touch-optimized card UI with swipe animations
 * - Responsive design for small screens
 * 
 * @param {MobileUserListProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const MobileUserList: React.FC<MobileUserListProps> = ({ onEdit }) => {
    // State management
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' }>({ key: 'username', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Context hooks
    const { themeColors } = useTheme();
    const { hasRole } = useAuth();
    const { askQuestion } = useQuestionModal();
    const { showMessageModal } = useMessageModal();

    /**
     * Fetches users from the API
     * - Updates users state with fetched data
     * - Handles loading state and error messaging
     */
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showMessageModal('ERROR', 'Failed to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    /**
     * Handles user deletion with confirmation
     * - Prompts for confirmation before deletion
     * - Updates the users state after successful deletion
     * 
     * @param {User} user - The user to delete
     */
    const handleDeleteUser = async (user: User) => {
        if (!hasRole(['ADMIN'])) return;

        const confirmed = await askQuestion(
            `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`
        );

        if (confirmed) {
            await deleteUser(user.id);
            showMessageModal('SUCCESS', 'User deleted successfully.');
            fetchUsers();
        }
    };

    /**
     * Gets color information for role badges
     * - Returns an object with background and text colors for different roles
     * 
     * @param {string} role - The role to get colors for
     * @returns {Object} Object with bg and text color values
     */
    const getRoleBadgeColors = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return { bg: '#fecaca', text: '#991b1b' };
            case 'MANAGER':
                return { bg: '#e9d5ff', text: '#6b21a8' };
            case 'WORKER':
                return { bg: '#bfdbfe', text: '#1e40af' };
            case 'CUSTOMER':
                return { bg: '#bbf7d0', text: '#166534' };
            default:
                return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    /**
     * Handles column sorting
     * - Toggles between ascending and descending if the same column is clicked
     * - Sets to ascending if a different column is clicked
     * 
     * @param {keyof User} key - The property key to sort by
     */
    const handleSort = (key: keyof User) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    /**
     * Filter and sort users based on search term and sort configuration
     * - Filters by username, email, and name (case-insensitive)
     * - Sorts by the configured column and direction
     */
    const filteredAndSortedUsers = [...users]
        .filter(user => {
            const searchLower = searchTerm.toLowerCase();
            return user.username.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchLower);
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;

            // Handle special cases for nested or computed properties
            if (key === 'firstName' || key === 'lastName') {
                const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
                const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
                return direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            }

            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <motion.div
                    className="h-16 w-16 rounded-full"
                    style={{
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        borderColor: `${themeColors.accent} transparent ${themeColors.secondary} transparent`,
                        boxShadow: `0 0 15px ${themeColors.accent}40`
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        ease: "linear",
                        repeat: Infinity
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            {/* Search header */}
            <div className="flex flex-col gap-3 mb-4">
                {/* Search input */}
                <motion.div
                    className="relative w-full"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div 
                        className="flex items-center gap-2 px-4 py-2 rounded-full w-full"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            boxShadow: isSearchFocused ?
                                `0 0 0 2px ${themeColors.accent}40, 0 4px 6px -1px ${themeColors.accent}30` :
                                `0 4px 6px -1px ${themeColors.text}10`
                        }}
                    >
                        <HiOutlineSearch
                            className="text-lg"
                            style={{ color: themeColors.text, opacity: 0.7 }}
                        />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="bg-transparent border-none outline-none flex-1 text-sm"
                            style={{ color: themeColors.text }}
                        />
                        {searchTerm && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="btn btn-xs flex items-center justify-center"
                                onClick={() => setSearchTerm('')}
                            >
                                <MdClose size={12} />
                            </motion.button>
                        )}
                    </div>

                    {searchTerm && (
                        <motion.div
                            className="absolute right-4 -bottom-5 text-xs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            style={{ color: themeColors.text }}
                        >
                            Found: {filteredAndSortedUsers.length} user(s)
                        </motion.div>
                    )}
                </motion.div>
                
                {/* Sort options */}
                <motion.div
                    className="flex flex-col gap-2 p-3 rounded-lg mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.accent})`,
                        boxShadow: `0 4px 6px -1px ${themeColors.accent}20`
                    }}
                >
                    <div className="text-sm font-medium mb-1">Sort by:</div>
                    <div className="flex flex-wrap gap-2">
                        <motion.button
                            onClick={() => handleSort('username')}
                            className="flex items-center gap-1 px-3 py-2 rounded-full text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                backgroundColor: sortConfig.key === 'username' ? themeColors.accent : `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                color: sortConfig.key === 'username' ? themeColors.background : themeColors.text
                            }}
                        >
                            <span>Username</span>
                            {sortConfig.key === 'username' && (
                                sortConfig.direction === 'asc' ? <FaSortUp size={14} /> : <FaSortDown size={14} />
                            )}
                        </motion.button>
                        
                        <motion.button
                            onClick={() => handleSort('email')}
                            className="flex items-center gap-1 px-3 py-2 rounded-full text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                backgroundColor: sortConfig.key === 'email' ? themeColors.accent : `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                color: sortConfig.key === 'email' ? themeColors.background : themeColors.text
                            }}
                        >
                            <span>Email</span>
                            {sortConfig.key === 'email' && (
                                sortConfig.direction === 'asc' ? <FaSortUp size={14} /> : <FaSortDown size={14} />
                            )}
                        </motion.button>

                        <motion.button
                            onClick={() => handleSort('role')}
                            className="flex items-center gap-1 px-3 py-2 rounded-full text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                backgroundColor: sortConfig.key === 'role' ? themeColors.accent : `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                color: sortConfig.key === 'role' ? themeColors.background : themeColors.text
                            }}
                        >
                            <span>Role</span>
                            {sortConfig.key === 'role' && (
                                sortConfig.direction === 'asc' ? <FaSortUp size={14} /> : <FaSortDown size={14} />
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* User cards list */}
            <div className="overflow-y-auto pb-16 mt-2">
                <AnimatePresence>
                    {filteredAndSortedUsers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredAndSortedUsers.map((user, index) => {
                                const roleBadgeColors = getRoleBadgeColors(user.role);
                                const statusColors = user.enabled
                                    ? { bg: '#bbf7d0', text: '#166534' }
                                    : { bg: '#fecaca', text: '#991b1b' };

                                return (
                                    <motion.div
                                        key={user.id}
                                        className="rounded-xl overflow-hidden"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                            delay: index * 0.05 // Staggered animation
                                        }}
                                        style={{
                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.text})`,
                                            boxShadow: `0 4px 8px -2px ${themeColors.accent}20`
                                        }}
                                        whileHover={{
                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.accent})`,
                                            scale: 1.01,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <div className="relative p-4">
                                            {/* User header with avatar and username */}
                                            <div className="flex items-center mb-3">
                                                <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
                                                    style={{
                                                        backgroundColor: `color-mix(in srgb, ${themeColors.primary}30, ${themeColors.background})`,
                                                    }}
                                                >
                                                    <MdOutlinePerson size={20} style={{ color: themeColors.primary }} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-base">{user.username}</div>
                                                    <div className="text-sm opacity-70">{user.email}</div>
                                                </div>
                                            </div>

                                            {/* User details */}
                                            <div className="flex flex-col gap-2 mb-3">
                                                {/* Name */}
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium mr-2 opacity-70">Name:</span>
                                                    <span className="text-sm">
                                                        {user.firstName || user.lastName
                                                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                            : '-'}
                                                    </span>
                                                </div>

                                                {/* Status badges */}
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Role badge */}
                                                    <div
                                                        className="px-2.5 py-1 rounded-full inline-flex text-xs font-semibold"
                                                        style={{
                                                            backgroundColor: roleBadgeColors.bg,
                                                            color: roleBadgeColors.text
                                                        }}
                                                    >
                                                        {user.role}
                                                    </div>

                                                    {/* Status badge */}
                                                    <div
                                                        className="px-2.5 py-1 rounded-full inline-flex text-xs font-semibold"
                                                        style={{
                                                            backgroundColor: statusColors.bg,
                                                            color: statusColors.text
                                                        }}
                                                    >
                                                        {user.enabled ? 'Active' : 'Inactive'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            {hasRole(['ADMIN']) && (
                                                <div className="absolute right-2 bottom-2 flex gap-2 mt-2 justify-end">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, y: -2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                        className="btn btn-icon btn-outline-accent btn-with-icon-animation"
                                                        onClick={() => onEdit(user)}
                                                    >
                                                        <BiSolidEdit size={20} />
                                                    </motion.button>
                                                    {user.id !== 'd6a3dcb4-7727-4eba-999e-0431a6cda204' && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="btn btn-icon btn-danger btn-with-icon-animation"
                                                            onClick={() => handleDeleteUser(user)}
                                                        >
                                                            <RiDeleteBin6Fill size={20} />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="flex flex-col items-center justify-center p-10 text-center rounded-xl backdrop-blur-sm"
                            style={{
                                opacity: 0.7
                            }}
                        >
                            <div className="text-6xl mb-4">
                                🔍
                            </div>
                            <h3 className="text-xl font-bold mb-2">No users found</h3>
                            <p className="text-sm max-w-md">
                                {searchTerm ?
                                    `No users match your search "${searchTerm}". Try a different search term.` :
                                    "There are no users available at the moment."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MobileUserList;
