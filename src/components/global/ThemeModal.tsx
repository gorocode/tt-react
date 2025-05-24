import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, ThemeName, builtInThemes, CustomTheme } from '../../context/ThemeContext';
import { useQuestionModal } from '../../context/QuestionModalContext';

// Icons
import { IoMdClose } from 'react-icons/io';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { MdSave, MdCancel, MdColorLens } from 'react-icons/md';

/**
 * Props for the ThemeModal component
 */
interface ThemeModalProps {
    /** Whether the modal is currently open/visible */
    isOpen: boolean;
    /** Function to call when the modal should be closed */
    onClose: () => void;
}

/**
 * ThemeModal component
 * 
 * Provides a modal interface for users to select and customize application themes.
 * Features:
 * - Built-in theme selection with previews
 * - Custom theme creation and management
 * - Live preview of theme changes
 * - Animated transitions for all interactions
 */
const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
    const {
        currentTheme,
        setTheme,
        themeColors,
        addCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
        customThemes
    } = useTheme();
    const { askQuestion } = useQuestionModal();

    // State for custom theme editor
    const [showCustomThemeEditor, setShowCustomThemeEditor] = useState(false);
    const [customThemeBeingEdited, setCustomThemeBeingEdited] = useState<CustomTheme | null>(null);
    const [newCustomTheme, setNewCustomTheme] = useState<CustomTheme>({
        name: '',
        label: '',
        description: '',
        background: '#ffffff',
        text: '#000000',
        primary: '#333333',
        secondary: '#666666',
        accent: '#0088cc'
    });

    /**
     * Built-in theme options with user-friendly labels and descriptions
     * Used to populate the theme selection interface
     */
    const builtInThemeOptions: { name: ThemeName; label: string; description: string }[] = [
        {
            name: 'sunriseCappuccino',
            label: 'Sunrise Cappuccino',
            description: 'Soft and warm tones inspired by the morning light.'
        },
        {
            name: 'midnight',
            label: 'Midnight',
            description: 'Dark and cozy theme with deep, rich coffee tones.'
        },
        {
            name: 'oliveGreen',
            label: 'Olive Green',
            description: 'Natural greens and earthy tones with a fresh vibe.'
        },
        {
            name: 'vintageGarnet',
            label: 'Vintage Garnet',
            description: 'Deep reds and muted tones for a vintage, elegant feel.'
        },
        {
            name: 'deepOcean',
            label: 'Deep Ocean',
            description: 'Cool and calming blues with a deep oceanic palette.'
        },
        {
            name: 'royalPurple',
            label: 'Royal Purple',
            description: 'Rich purple and lavender shades for a regal atmosphere.'
        },
        {
            name: 'autumnForest',
            label: 'Autumn Forest',
            description: 'Earthy autumn hues with warm and cozy accents.'
        },
        {
            name: 'freshMint',
            label: 'Fresh Mint',
            description: 'Refreshing mint greens and cool tones for a fresh look.'
        },
        {
            name: 'techDark',
            label: 'Tech Dark',
            description: 'Dark and modern with sharp tech-inspired accents.'
        },
        {
            name: 'rosySunrise',
            label: 'Rosy Sunrise',
            description: 'Soft pinks and rosy tones for a gentle, morning glow.'
        }
    ]


    /**
     * Custom theme options created by the user
     * Mapped from the customThemes object to match the same format as built-in themes
     */
    const customThemeOptions = Object.values(customThemes).map(theme => ({
        name: theme.name,
        label: theme.label,
        description: theme.description
    }));

    /** Combined list of all available themes (built-in + custom) */
    const allThemeOptions = [...builtInThemeOptions, ...customThemeOptions];

    /**
     * Changes the current application theme
     * @param theme - The theme name to switch to
     */
    const handleThemeChange = (theme: ThemeName) => {
        setTheme(theme);
    };

    /**
     * Sets up the editor to modify an existing custom theme
     * @param themeName - The name of the custom theme to edit
     */
    const handleEditCustomTheme = (themeName: string) => {
        const themeToEdit = customThemes[themeName];
        if (themeToEdit) {
            setCustomThemeBeingEdited(themeToEdit);
            setNewCustomTheme({
                ...themeToEdit
            });
            setShowCustomThemeEditor(true);
        }
    };

    /**
     * Prompts the user to confirm deletion of a custom theme
     * @param themeName - The name of the custom theme to delete
     */
    const handleDeleteCustomTheme = async (themeName: string) => {
        const confirmed = await askQuestion(`Are you sure you want to delete the theme "${customThemes[themeName]?.label || themeName}"?`);
        if (confirmed) {
            deleteCustomTheme(themeName);
        }
    };

    /**
     * Sets up the editor to create a new custom theme with default values
     */
    const handleCreateNewTheme = () => {
        setCustomThemeBeingEdited(null);
        setNewCustomTheme({
            name: `custom_${Date.now()}`,
            label: 'My Custom Theme',
            description: 'A personalized theme with my favorite colors.',
            background: '#ffffff',
            text: '#000000',
            primary: '#333333',
            secondary: '#666666',
            accent: '#0088cc'
        });
        setShowCustomThemeEditor(true);
    };

    /**
     * Saves the current theme being edited in the custom theme editor
     * Performs validation and either updates an existing theme or creates a new one
     */
    const handleSaveCustomTheme = () => {
        // Validate the theme has required fields
        if (!newCustomTheme.name || !newCustomTheme.label) {
            alert('Theme name and label are required');
            return;
        }

        if (customThemeBeingEdited) {
            updateCustomTheme(newCustomTheme);
        } else {
            addCustomTheme(newCustomTheme);
        }

        setShowCustomThemeEditor(false);
        setCustomThemeBeingEdited(null);
    };

    /**
     * Cancels the current theme editing operation and closes the editor
     */
    const handleCancelCustomTheme = () => {
        setShowCustomThemeEditor(false);
        setCustomThemeBeingEdited(null);
    };

    /**
     * Updates a specific field in the custom theme being edited
     * @param field - The theme property to update
     * @param value - The new value for the property
     */
    const handleCustomThemeChange = (field: keyof CustomTheme, value: string) => {
        setNewCustomTheme(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-md rounded-xl overflow-hidden"
                        style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            borderColor: themeColors.secondary,
                            boxShadow: `0 10px 30px -5px ${themeColors.accent}50, 0 0 10px 0 ${themeColors.primary}20`,
                            border: `1px solid ${themeColors.secondary}20`
                        }}
                    >
                        {/* Header */}
                        <div
                            className="p-5 font-bold text-xl flex justify-between items-center"
                            style={{
                                borderBottom: `1px solid ${themeColors.secondary}20`,
                                backgroundColor: themeColors.primary === themeColors.background
                                    ? `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`
                                    : `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.accent})`
                            }}
                        >
                            <h3 className="text-gradient font-semibold">Choose Theme</h3>
                            <motion.button
                                onClick={onClose}
                                className="p-1 rounded-full bg-opacity-20 text-2xl"
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                style={{ color: themeColors.text }}
                            >
                                <IoMdClose />
                            </motion.button>
                        </div>

                        {/* Theme Options */}
                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            {allThemeOptions.map((option) => (
                                <motion.div
                                    key={option.name}
                                    onClick={() => handleThemeChange(option.name)}
                                    className="p-4 rounded-lg cursor-pointer flex items-center gap-4"
                                    initial={{ opacity: 0.9 }}
                                    whileHover={{
                                        scale: 1.02,
                                        y: -2,
                                        boxShadow: currentTheme === option.name
                                            ? `0 8px 20px -4px ${themeColors.accent}30`
                                            : 'var(--shadow-md)'
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                    style={{
                                        backgroundColor: currentTheme === option.name
                                            ? `${themeColors.accent}15`
                                            : themeColors.primary === themeColors.background
                                                ? `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.primary})`
                                                : `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.text})`,
                                        border: currentTheme === option.name
                                            ? `1px solid ${themeColors.accent}40`
                                            : `1px solid ${themeColors.secondary}20`,
                                        boxShadow: currentTheme === option.name
                                            ? `0 4px 12px -2px ${themeColors.accent}25`
                                            : 'none'
                                    }}
                                >
                                    {/* Theme color preview */}
                                    <div className="flex-shrink-0">
                                        <div className="flex gap-1 p-1 rounded-lg shadow-sm"
                                            style={{
                                                backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                padding: '6px'
                                            }}>
                                            <div
                                                className="w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200"
                                                style={{
                                                    backgroundColor: (builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.background,
                                                    transform: currentTheme === option.name ? 'scale(1.2)' : 'scale(1)',
                                                    zIndex: currentTheme === option.name ? 5 : 1,
                                                    boxShadow: `0 0 0 1px ${(builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.text}10`
                                                }}
                                            />
                                            <div
                                                className="w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200"
                                                style={{
                                                    backgroundColor: (builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.primary,
                                                    transform: currentTheme === option.name ? 'scale(1.2)' : 'scale(1)',
                                                    transitionDelay: '50ms',
                                                    zIndex: currentTheme === option.name ? 6 : 1,
                                                    boxShadow: `0 0 0 1px ${(builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.text}10`
                                                }}
                                            />
                                            <div
                                                className="w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200"
                                                style={{
                                                    backgroundColor: (builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.secondary,
                                                    transform: currentTheme === option.name ? 'scale(1.2)' : 'scale(1)',
                                                    transitionDelay: '100ms',
                                                    zIndex: currentTheme === option.name ? 7 : 1,
                                                    boxShadow: `0 0 0 1px ${(builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.text}10`
                                                }}
                                            />
                                            <div
                                                className="w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200"
                                                style={{
                                                    backgroundColor: (builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.accent,
                                                    transform: currentTheme === option.name ? 'scale(1.2)' : 'scale(1)',
                                                    transitionDelay: '150ms',
                                                    zIndex: currentTheme === option.name ? 8 : 1,
                                                    boxShadow: `0 0 0 1px ${(builtInThemes[option.name as keyof typeof builtInThemes] || customThemes[option.name])?.text}10`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Theme info */}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-base flex justify-between items-center"
                                            style={{ color: currentTheme === option.name ? themeColors.accent : themeColors.text }}>
                                            {option.label}
                                            {customThemes[option.name] && (
                                                <div className="flex gap-2 ml-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-xs p-1 rounded-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditCustomTheme(option.name);
                                                        }}
                                                        title="Edit custom theme"
                                                    >
                                                        <HiPencil size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-xs p-1 rounded-full text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCustomTheme(option.name);
                                                        }}
                                                        title="Delete custom theme"
                                                    >
                                                        <HiTrash size={18} />
                                                    </motion.button>
                                                </div>
                                            )}
                                        </h4>
                                        <p className="text-sm mt-1"
                                            style={{ opacity: currentTheme === option.name ? 0.9 : 0.7 }}>
                                            {option.description}
                                        </p>
                                    </div>

                                    {/* Selected indicator */}
                                    {currentTheme === option.name && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-4 h-4 rounded-full flex items-center justify-center"
                                            style={{
                                                backgroundColor: themeColors.accent,
                                                boxShadow: `0 0 0 2px ${themeColors.background}, 0 0 0 4px ${themeColors.accent}40`
                                            }}
                                        >
                                            <motion.div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: themeColors.background }}
                                            />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Create Custom Theme Button */}
                            <motion.div
                                onClick={handleCreateNewTheme}
                                className="p-4 rounded-lg cursor-pointer flex items-center gap-4 border-dashed border-2"
                                initial={{ opacity: 0.8 }}
                                whileHover={{
                                    scale: 1.02,
                                    y: -2,
                                    borderColor: themeColors.accent
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                style={{
                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 98%, ${themeColors.accent})`,
                                    borderColor: `${themeColors.secondary}30`,
                                }}
                            >
                                <div className="p-2 rounded-full" style={{ backgroundColor: `${themeColors.accent}20` }}>
                                    <HiPlus size={18} style={{ color: themeColors.accent }} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-base">Create Custom Theme</h4>
                                    <p className="text-sm mt-1" style={{ opacity: 0.7 }}>
                                        Design your own theme with your favorite colors
                                    </p>
                                </div>
                            </motion.div>

                            {/* Custom Theme Editor */}
                            {showCustomThemeEditor && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border rounded-lg p-4 mt-4 space-y-4"
                                    style={{
                                        borderColor: `${themeColors.accent}40`,
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.accent})`
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg" style={{ color: themeColors.accent }}>
                                            {customThemeBeingEdited ? 'Edit Custom Theme' : 'Create New Theme'}
                                        </h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Theme Name</label>
                                            <input
                                                type="text"
                                                value={newCustomTheme.label}
                                                onChange={(e) => handleCustomThemeChange('label', e.target.value)}
                                                className="w-full p-2 rounded-md"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                    color: themeColors.text,
                                                    border: `1px solid ${themeColors.secondary}40`
                                                }}
                                                placeholder="My Custom Theme"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description</label>
                                            <input
                                                type="text"
                                                value={newCustomTheme.description}
                                                onChange={(e) => handleCustomThemeChange('description', e.target.value)}
                                                className="w-full p-2 rounded-md"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                    color: themeColors.text,
                                                    border: `1px solid ${themeColors.secondary}40`
                                                }}
                                                placeholder="A description of my theme"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                                    <span style={{ backgroundColor: newCustomTheme.background, width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
                                                    Background
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="color"
                                                        value={newCustomTheme.background}
                                                        onChange={(e) => handleCustomThemeChange('background', e.target.value)}
                                                        className="w-3 h-10 border-0 p-0 m-0 cursor-pointer appearance-none"
                                                    />

                                                    <input
                                                        type="text"
                                                        value={newCustomTheme.background}
                                                        onChange={(e) => handleCustomThemeChange('background', e.target.value)}
                                                        className="max-w-[150px] p-2 ml-2 rounded-md"
                                                        style={{
                                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                            color: themeColors.text,
                                                            border: `1px solid ${themeColors.secondary}40`
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                                    <span style={{ backgroundColor: newCustomTheme.text, width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
                                                    Text
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="color"
                                                        value={newCustomTheme.text}
                                                        onChange={(e) => handleCustomThemeChange('text', e.target.value)}
                                                        className="w-3 h-10 border-0 p-0 m-0 cursor-pointer appearance-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newCustomTheme.text}
                                                        onChange={(e) => handleCustomThemeChange('text', e.target.value)}
                                                        className="max-w-[150px] p-2 ml-2 rounded-md"
                                                        style={{
                                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                            color: themeColors.text,
                                                            border: `1px solid ${themeColors.secondary}40`
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                                    <span style={{ backgroundColor: newCustomTheme.primary, width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
                                                    Primary
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="color"
                                                        value={newCustomTheme.primary}
                                                        onChange={(e) => handleCustomThemeChange('primary', e.target.value)}
                                                        className="w-3 h-10 border-0 p-0 m-0 cursor-pointer appearance-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newCustomTheme.primary}
                                                        onChange={(e) => handleCustomThemeChange('primary', e.target.value)}
                                                        className="max-w-[150px] p-2 ml-2 rounded-md"
                                                        style={{
                                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                            color: themeColors.text,
                                                            border: `1px solid ${themeColors.secondary}40`
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                                    <span style={{ backgroundColor: newCustomTheme.secondary, width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
                                                    Secondary
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="color"
                                                        value={newCustomTheme.secondary}
                                                        onChange={(e) => handleCustomThemeChange('secondary', e.target.value)}
                                                        className="w-3 h-10 border-0 p-0 m-0 cursor-pointer appearance-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newCustomTheme.secondary}
                                                        onChange={(e) => handleCustomThemeChange('secondary', e.target.value)}
                                                        className="max-w-[150px] p-2 ml-2 rounded-md"
                                                        style={{
                                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                            color: themeColors.text,
                                                            border: `1px solid ${themeColors.secondary}40`
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                                    <span style={{ backgroundColor: newCustomTheme.accent, width: '12px', height: '12px', display: 'inline-block', borderRadius: '2px' }}></span>
                                                    Accent
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="color"
                                                        value={newCustomTheme.accent}
                                                        onChange={(e) => handleCustomThemeChange('accent', e.target.value)}
                                                        className="w-3 h-10 border-0 p-0 m-0 cursor-pointer appearance-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newCustomTheme.accent}
                                                        onChange={(e) => handleCustomThemeChange('accent', e.target.value)}
                                                        className="max-w-[150px] p-2 ml-2 rounded-md"
                                                        style={{
                                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                                            color: themeColors.text,
                                                            border: `1px solid ${themeColors.secondary}40`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-lg mt-4" style={{ backgroundColor: newCustomTheme.background }}>
                                            <h4 style={{ color: newCustomTheme.text, fontWeight: 'bold', marginBottom: '8px' }}>Preview</h4>
                                            <div className="flex gap-2 flex-wrap">
                                                <div className="rounded-md px-3 py-1.5 text-sm" style={{ backgroundColor: newCustomTheme.primary, color: newCustomTheme.background }}>Primary</div>
                                                <div className="rounded-md px-3 py-1.5 text-sm" style={{ backgroundColor: newCustomTheme.secondary, color: newCustomTheme.background }}>Secondary</div>
                                                <div className="rounded-md px-3 py-1.5 text-sm" style={{ backgroundColor: newCustomTheme.accent, color: newCustomTheme.background }}>Accent</div>
                                            </div>
                                            <p className="mt-2 text-sm" style={{ color: newCustomTheme.text }}>This is how your theme will look.</p>
                                        </div>

                                        <div className="flex justify-end space-x-3 mt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-4 py-2 rounded-md flex items-center gap-1"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background}, ${themeColors.text} 10%)`,
                                                    color: themeColors.text,
                                                    border: `1px solid ${themeColors.secondary}30`
                                                }}
                                                onClick={handleCancelCustomTheme}
                                            >
                                                <MdCancel size={16} />
                                                Cancel
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-4 py-2 rounded-md flex items-center gap-1"
                                                style={{
                                                    backgroundColor: themeColors.accent,
                                                    color: themeColors.background
                                                }}
                                                onClick={handleSaveCustomTheme}
                                            >
                                                <MdSave size={16} />
                                                Save Theme
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            className="p-5 flex justify-end"
                            style={{
                                borderTop: `1px solid ${themeColors.secondary}20`,
                                backgroundColor: themeColors.primary === themeColors.background
                                    ? `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`
                                    : `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.accent})`
                            }}
                        >
                            <div className="flex space-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 17 }}
                                    className="px-5 py-2 rounded-lg font-medium shadow-md flex items-center gap-1"
                                    style={{
                                        backgroundColor: themeColors.accent,
                                        color: themeColors.background,
                                        boxShadow: `0 4px 10px -2px ${themeColors.accent}40`
                                    }}
                                    onClick={onClose}
                                >
                                    <MdColorLens size={18} />
                                    Apply & Close
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ThemeModal;
