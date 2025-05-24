/**
 * UserForm.tsx
 * Component for managing user creation and editing.
 */

// React and external libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { IoSaveOutline, IoArrowBackOutline } from 'react-icons/io5';
import { MdPerson, MdEmail, MdPassword, MdAdminPanelSettings } from 'react-icons/md';

// Context
import { useTheme } from '../../context/ThemeContext';

// Services & Types
import { User, UserRegistrationRequest, UserUpdateRequest } from '../../types';

/**
 * Props for the UserForm component
 * @interface UserFormProps
 */
interface UserFormProps {
    /** The user to create or edit */
    user?: User;
    /** Function to handle form submission */
    onSubmit: (userData: UserRegistrationRequest | UserUpdateRequest) => void;
    /** Function to handle cancellation */
    onCancel: () => void;
    /** Whether this is an edit operation */
    isEdit: boolean;
}

/**
 * UserForm Component
 * 
 * Form interface for creating and editing users with fields for username, email, 
 * password, name, role, and account status.
 * 
 * Features:
 * - Validation for all required fields
 * - Dynamic field state updates
 * - Role selection with dropdown
 * - Active/inactive toggle for existing users
 * 
 * @param {UserFormProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isEdit }) => {
    // Theme and state hooks
    const { themeColors } = useTheme();
    
    // Form state management
    const [formData, setFormData] = useState<UserUpdateRequest>({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'CUSTOMER',
        enabled: true
    });
    
    // Input field animation stagger offsets
    // const fieldAnimationOffsets = {
    //     username: 0,
    //     email: 0.05,
    //     password: 0.1,
    //     firstName: 0.15,
    //     lastName: 0.2,
    //     role: 0.25,
    //     enabled: 0.3
    // };
    
    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Focus states for input highlighting
    const [focusedField, setFocusedField] = useState<string | null>(null);

    /**
     * Initialize form data when user is provided for editing
     */
    useEffect(() => {
        if (user && isEdit) {
            setFormData({
                username: user.username,
                email: user.email,
                password: '', // Don't populate password in edit mode
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                role: user.role,
                enabled: user.enabled
            });
        }
    }, [user, isEdit]);

    /**
     * Handles change events for inputs and dropdowns
     * Updates the form data state and clears any validation errors
     * 
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Input change event
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear error when field is modified
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    /**
     * Validates form data before submission
     * Checks required fields and format requirements
     * 
     * @returns {boolean} Whether the form data is valid
     */
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!isEdit && !formData.password) {
            newErrors.password = 'Password is required for new users';
        } else if (
            formData.password && 
            !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/.test(formData.password)
        ) {
            newErrors.password = 'Password must be at least 8 characters and include one digit, one lowercase, one uppercase letter, and one special character';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handles form submission after validation
     * Prevents default form submission and calls the parent handler
     * 
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };
    
    /**
     * Handles the cancel button click
     * Calls the parent cancel handler
     */
    const handleCancel = () => {
        onCancel();
    };

    return (
        <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="rounded-xl overflow-hidden shadow-lg" style={{
                backgroundColor: themeColors.background,
                boxShadow: `0 10px 25px -5px ${themeColors.accent}25, 0 4px 10px -4px ${themeColors.text}10`,
                border: `1px solid ${themeColors.text}10`
            }}>
                <div className="relative overflow-hidden" style={{
                    background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.primary})`,
                }}>
                    <div className="absolute inset-0 bg-black opacity-10 skew-y-3 transform origin-top-right"></div>
                    <motion.div 
                        className="px-6 py-4 relative"
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
                            <MdAdminPanelSettings size={24} />
                            {isEdit ? 'Edit User' : 'Create New User'}
                        </motion.h3>
                    </motion.div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Username Field */}
                        <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, type: "spring" }}
                        >
                            <label 
                                className="flex items-center gap-2 text-sm font-medium mb-2" 
                                style={{ color: themeColors.text }}
                                htmlFor="username"
                            >
                                <MdPerson size={18} />
                                Username*
                            </label>
                            <div className="relative">
                                <input
                                    className={`w-full px-4 py-2 rounded-lg transition-all duration-200 outline-none ${user?.username === "admin" && "cursor-not-allowed"}`}
                                    style={{
                                        backgroundColor: user?.username === "admin" ? `color-mix(in srgb, ${themeColors.background} 65%, ${themeColors.text})` : `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                                        border: errors.username 
                                            ? `2px solid #ef4444` 
                                            : focusedField === 'username' 
                                                ? `2px solid ${themeColors.accent}` 
                                                : `1px solid ${themeColors.text}20`,
                                        color: themeColors.text,
                                        boxShadow: focusedField === 'username' ? `0 0 0 3px ${themeColors.accent}30` : 'none'
                                    }}
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    disabled={user?.username === "admin"}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Username"
                                />
                            </div>
                            {errors.username && (
                                <motion.p 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-red-500">
                                    {errors.username}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Email Field */}
                        <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, type: "spring" }}
                        >
                            <label 
                                className="flex items-center gap-2 text-sm font-medium mb-2" 
                                style={{ color: themeColors.text }}
                                htmlFor="email"
                            >
                                <MdEmail size={18} />
                                Email*
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-2 rounded-lg transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                                        border: errors.email 
                                            ? `2px solid #ef4444` 
                                            : focusedField === 'email' 
                                                ? `2px solid ${themeColors.accent}` 
                                                : `1px solid ${themeColors.text}20`,
                                        color: themeColors.text,
                                        boxShadow: focusedField === 'email' ? `0 0 0 3px ${themeColors.accent}30` : 'none'
                                    }}
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Email"
                                />
                            </div>
                            {errors.email && (
                                <motion.p 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-red-500">
                                    {errors.email}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Password Field */}
                        <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <label 
                                className="flex items-center gap-2 text-sm font-medium mb-2" 
                                style={{ color: themeColors.text }}
                                htmlFor="password"
                            >
                                <MdPassword size={18} />
                                {isEdit ? 'Password (leave blank to keep current)' : 'Password*'}
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-2 rounded-lg transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                                        border: errors.password 
                                            ? `2px solid #ef4444` 
                                            : focusedField === 'password' 
                                                ? `2px solid ${themeColors.accent}` 
                                                : `1px solid ${themeColors.text}20`,
                                        color: themeColors.text,
                                        boxShadow: focusedField === 'password' ? `0 0 0 3px ${themeColors.accent}30` : 'none'
                                    }}
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Password"
                                />
                            </div>
                            {errors.password && (
                                <motion.p 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-red-500">
                                    {errors.password}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Role Field */}
                        <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, type: "spring" }}
                        >
                            <label 
                                className="flex items-center gap-2 text-sm font-medium mb-2" 
                                style={{ color: themeColors.text }}
                                htmlFor="role"
                            >
                                <MdAdminPanelSettings size={18} />
                                Role*
                            </label>
                            <div className="relative">
                                <select
                                    className={`w-full px-4 py-2 rounded-lg transition-all duration-200 outline-none appearance-none ${user?.username === "admin" && "cursor-not-allowed"}`}
                                    style={{
                                        backgroundColor: user?.username === "admin" ? `color-mix(in srgb, ${themeColors.background} 65%, ${themeColors.text})` : `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                                        border: focusedField === 'role' 
                                            ? `2px solid ${themeColors.accent}` 
                                            : `1px solid ${themeColors.text}20`,
                                        color: themeColors.text,
                                        boxShadow: focusedField === 'role' ? `0 0 0 3px ${themeColors.accent}30` : 'none'
                                    }}
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('role')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={user?.username === "admin"}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="WORKER">Worker</option>
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="GUEST">Guest</option>
                                </select>
                            </div>
                        </motion.div>

                        {/* First Name Field */}
                        <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, type: "spring" }}
                        >
                            <label 
                                className="flex items-center gap-2 text-sm font-medium mb-2" 
                                style={{ color: themeColors.text }}
                                htmlFor="firstName"
                            >
                                <MdPerson size={18} />
                                First Name
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-2 rounded-lg transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                                        border: focusedField === 'firstName' 
                                            ? `2px solid ${themeColors.accent}` 
                                            : `1px solid ${themeColors.text}20`,
                                        color: themeColors.text,
                                        boxShadow: focusedField === 'firstName' ? `0 0 0 3px ${themeColors.accent}30` : 'none'
                                    }}
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('firstName')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="First Name"
                                />
                            </div>
                        </motion.div>

                        {/* Last Name Field */}
                        <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, type: "spring" }}
                        >
                            <label 
                                className="flex items-center gap-2 text-sm font-medium mb-2" 
                                style={{ color: themeColors.text }}
                                htmlFor="lastName"
                            >
                                <MdPerson size={18} />
                                Last Name
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-2 rounded-lg transition-all duration-200 outline-none"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                                        border: focusedField === 'lastName' 
                                            ? `2px solid ${themeColors.accent}` 
                                            : `1px solid ${themeColors.text}20`,
                                        color: themeColors.text,
                                        boxShadow: focusedField === 'lastName' ? `0 0 0 3px ${themeColors.accent}30` : 'none'
                                    }}
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('lastName')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Last Name"
                                />
                            </div>
                        </motion.div>

                        {/* Enabled Status Field (Only for Edit Mode) */}
                        {isEdit && (
                            <motion.div 
                                className="mb-4 col-span-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, type: "spring" }}
                            >
                                <label 
                                    className="flex items-center gap-2 text-sm font-medium mb-2" 
                                    style={{ color: themeColors.text }}
                                    htmlFor="enabled"
                                >
                                    Account Status
                                </label>
                                <div 
                                    className="p-3 rounded-lg flex items-center"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                                        border: `1px solid ${themeColors.text}20`,
                                    }}
                                >
                                    <input
                                        id="enabled"
                                        type="checkbox"
                                        name="enabled"
                                        disabled={user?.username === "admin"}
                                        checked={formData.enabled}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded"
                                        style={{
                                            accentColor: themeColors.accent,
                                        }}
                                    />
                                    <label htmlFor="enabled" className="ml-2 text-sm" style={{ color: themeColors.text }}>
                                        User account is {formData.enabled ? 'active' : 'inactive'}
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex justify-center gap-5 mt-8">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2, boxShadow: `0 8px 20px -5px ${themeColors.accent}60` }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            type="submit"
                            className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium"
                            style={{
                                background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.primary})`,
                                color: '#ffffff',
                                boxShadow: `0 4px 15px -3px ${themeColors.accent}40`
                            }}
                        >
                            <IoSaveOutline size={18} />
                            {isEdit ? 'Update User' : 'Create User'}
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2, boxShadow: `0 8px 20px -5px ${themeColors.text}30` }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                color: themeColors.text,
                                border: `1px solid ${themeColors.text}20`,
                                boxShadow: `0 4px 15px -3px ${themeColors.text}20`
                            }}
                        >
                            <IoArrowBackOutline size={18} />
                            Cancel
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default UserForm;
