import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Icons
import { BiSolidEdit } from 'react-icons/bi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";
import { HiOutlineSearch } from 'react-icons/hi';
import { MdOutlinePerson, MdOutlineManageAccounts } from 'react-icons/md';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useQuestionModal } from '../../context/QuestionModalContext';
import { useMessageModal } from '../../context/MessageModalContext';

// Services
import { deleteUser, getAllUsers } from '../../api/userService';

// Types
import { User } from '../../types';

interface UserListProps {
    onEdit: (user: User) => void;
}

/**
 * UserList Component
 * 
 * Displays user data in a sortable, searchable table format with edit and delete actions.
 * Features:
 * - Column sorting by username, email, and role
 * - Search filtering by username, email, and name
 * - Visual indicators for role and status
 * - Animated UI responses and empty state handling
 * 
 * @param {UserListProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const UserList: React.FC<UserListProps> = ({ onEdit }) => {
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
                    className=" w-16 rounded-full"
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
        <motion.div
            className="w-full h-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="rounded-xl overflow-hidden shadow-lg flex flex-col h-full" style={{
                backgroundColor: themeColors.background,
                boxShadow: `0 10px 25px -5px ${themeColors.accent}25, 0 4px 10px -4px ${themeColors.text}10`,
                border: `1px solid ${themeColors.text}10`
            }}>
                <div className="relative overflow-hidden" style={{
                    background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.primary})`,
                }}>
                    <div className="absolute inset-0 bg-black opacity-10 skew-y-3 transform origin-top-right"></div>
                    <motion.div
                        className="px-6 py-4 relative flex justify-between items-center"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <motion.h3
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            className="text-white text-xl font-bold flex items-center gap-2"
                        >
                            <MdOutlineManageAccounts size={24} />
                            User List
                        </motion.h3>
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                        >
                            <div
                                className={`flex items-center px-3 py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg transition-all duration-200 ${isSearchFocused ? 'shadow-md ring-2 ring-white bg-opacity-20 pr-10' : 'shadow'}`}
                            >
                                <HiOutlineSearch size={18} className="mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="bg-transparent border-none outline-none placeholder-gray-400 text-sm w-full"
                                />
                                {searchTerm && (
                                    <motion.button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 text-white hover:text-gray-200"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="overflow-x-auto overflow-y-auto flex-1 h-full flex flex-col">
                    <table className="min-w-full table-fixed">
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${themeColors.text}15` }}>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('username')}
                                    style={{ color: themeColors.text }}
                                >
                                    <div className="flex items-center">
                                        <span>Username</span>
                                        {sortConfig?.key === 'username' ? (
                                            sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                                        ) : <FaSort className="ml-1 opacity-50" />}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('email')}
                                    style={{ color: themeColors.text }}
                                >
                                    <div className="flex items-center">
                                        <span>Email</span>
                                        {sortConfig?.key === 'email' ? (
                                            sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                                        ) : <FaSort className="ml-1 opacity-50" />}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text }}>
                                    Name
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('role')}
                                    style={{ color: themeColors.text }}
                                >
                                    <div className="flex items-center">
                                        <span>Role</span>
                                        {sortConfig?.key === 'role' ? (
                                            sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                                        ) : <FaSort className="ml-1 opacity-50" />}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('enabled')}
                                    style={{ color: themeColors.text }}
                                >
                                    <div className="flex items-center">
                                        <span>Status</span>
                                        {sortConfig?.key === 'enabled' ? (
                                            sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                                        ) : <FaSort className="ml-1 opacity-50" />}
                                    </div>
                                </th>
                                {hasRole(['ADMIN']) && (
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.text }}>
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode='wait'>
                                {filteredAndSortedUsers.length > 0 ? (
                                    filteredAndSortedUsers.map((user, index) => {
                                        const roleBadgeColors = getRoleBadgeColors(user.role);
                                        const statusColors = user.enabled
                                            ? { bg: '#bbf7d0', text: '#166534' }
                                            : { bg: '#fecaca', text: '#991b1b' };

                                        return (
                                            <motion.tr
                                                key={user.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 30,
                                                    delay: index * 0.05
                                                }}
                                                whileHover={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`
                                                }}
                                                style={{
                                                    borderBottom: `1px solid ${themeColors.text}10`
                                                }}
                                            >
                                                <td className="px-6 py-2 whitespace-nowrap h-fit">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                                                            style={{
                                                                backgroundColor: `color-mix(in srgb, ${themeColors.primary}30, ${themeColors.background})`,
                                                            }}
                                                        >
                                                            <MdOutlinePerson size={18} style={{ color: themeColors.primary }} />
                                                        </div>
                                                        <span className="font-medium" style={{ color: themeColors.text }}>
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 whitespace-nowrap text-sm h-fit" style={{ color: `color-mix(in srgb, ${themeColors.text} 80%, ${themeColors.background})` }}>
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-2 whitespace-nowrap text-sm h-fit" style={{ color: `color-mix(in srgb, ${themeColors.text} 80%, ${themeColors.background})` }}>
                                                    {user.firstName || user.lastName
                                                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-2 whitespace-nowrap h-fit">
                                                    <div
                                                        className="px-2.5 py-1 rounded-full inline-flex text-xs font-semibold"
                                                        style={{
                                                            backgroundColor: roleBadgeColors.bg,
                                                            color: roleBadgeColors.text
                                                        }}
                                                    >
                                                        {user.role}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 whitespace-nowrap h-fit">
                                                    <div
                                                        className="px-2.5 py-1 rounded-full inline-flex text-xs font-semibold"
                                                        style={{
                                                            backgroundColor: statusColors.bg,
                                                            color: statusColors.text
                                                        }}
                                                    >
                                                        {user.enabled ? 'Active' : 'Inactive'}
                                                    </div>
                                                </td>
                                                {hasRole(['ADMIN']) && (
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium h-fit">
                                                        <div className="flex justify-center gap-3">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, y: -2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                transition={{ type: "spring", stiffness: 400 }}
                                                                className="btn btn-icon btn-outline-accent btn-with-icon-animation"
                                                                onClick={() => onEdit(user)}
                                                            >
                                                                <BiSolidEdit size={24} />
                                                            </motion.button>
                                                            {user.id !== 'd6a3dcb4-7727-4eba-999e-0431a6cda204' && (
                                                                <motion.button
                                                                whileHover={{ scale: 1.1, y: -2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                transition={{ type: "spring", stiffness: 400 }}
                                                                className="btn btn-icon btn-danger btn-with-icon-animation"
                                                                onClick={() => handleDeleteUser(user)}
                                                            >
                                                                <RiDeleteBin6Fill size={24} />
                                                            </motion.button>
                                                            )}
                                                            
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr className="h-fit">
                                        <td colSpan={hasRole(['ADMIN']) ? 6 : 5} className="p-8 text-center">
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
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default UserList;
