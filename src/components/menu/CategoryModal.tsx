import { JSX } from "react";
import { motion, AnimatePresence } from "motion/react";

// Icons
import { MdCategory, MdDescription } from "react-icons/md";

// Context
import { useTheme } from "../../context/ThemeContext";

// Types
import { CategoryType } from "../../types";

/**
 * Props for the CategoryModal component
 * @interface CategoryModalProps
 */
type CategoryModalProps = {
    /** Category to be edited or created */
    category: CategoryType;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Function to close the modal */
    onClose: () => void;
    /** Function called when the form is submitted with price, tax and category values */
    onConfirm: (category: CategoryType) => void;
};

/**
 * MenuItemModal Component
 * 
 * Modal dialog for adding or editing a menu item.
 * In edit mode, only the category can be modified.
 * In create mode, all fields are editable.
 *
 * @param {MenuItemModalProps} props - Component props
 * @returns {JSX.Element | null} The rendered component or null if not open
 */
const CategoryModal = ({ category, isOpen, onClose, onConfirm }: CategoryModalProps): JSX.Element | null => {
    const { themeColors } = useTheme();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        const newCategory: CategoryType = {
            ...category,
            name,
            description
        };

        onConfirm(newCategory);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex justify-center items-center z-50">
                    {/* Backdrop with blur effect */}
                    <motion.div 
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    
                    {/* Modal container with enhanced animations */}
                    <motion.div
                        className="relative z-10 w-full max-w-md"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div 
                            className="p-6 rounded-2xl shadow-xl w-full overflow-hidden"
                            style={{
                                backgroundColor: themeColors.background,
                                color: themeColors.text,
                                boxShadow: `0 10px 25px -5px ${themeColors.accent}30, 0 8px 10px -6px ${themeColors.secondary}20`,
                                border: `1px solid ${themeColors.secondary}30`
                            }}
                        >
                            {/* Decorative gradient top border */}
                            <div 
                                className="absolute top-0 left-0 right-0 h-1 rounded-t-lg" 
                                style={{ background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})` }}
                            />
                            
                            {/* Enhanced header with gradient text */}
                            <div className="relative mb-6">
                                <motion.div 
                                    className="w-12 h-12 rounded-full mb-3 flex items-center justify-center absolute -top-1 -left-1 -z-10 opacity-10"
                                    initial={{ scale: 0 }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [-5, 5, 0]
                                    }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    style={{ background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.secondary})` }}
                                />
                                <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text">
                                    {category.id === 0 ? "Create Category" : `Edit ${category.name}`}
                                    <motion.div 
                                        className="absolute -bottom-1 left-0 h-0.5 rounded-full" 
                                        style={{ background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})` }}
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: "40%", opacity: 0.5 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                    />
                                </h3>
                                <p 
                                    className="text-sm mt-1" 
                                    style={{ color: `${themeColors.text}80` }}
                                >
                                    {category.id === 0 ? "Add a new category to your menu" : "Update this category's information"}
                                </p>
                            </div>

                            {/* Form with enhanced styling and animation */}
                            <form onSubmit={(e) => handleSubmit(e)}>
                                <div className="space-y-5">
                                    <motion.div 
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex items-center mb-1.5 gap-1.5">
                                            <MdCategory className="text-base" style={{ color: themeColors.accent }} />
                                            <label className="text-sm font-medium">Category Name</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                defaultValue={category.name}
                                                required
                                                className="w-full px-3 py-2.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent}20)`,
                                                    color: themeColors.text,
                                                    borderColor: `${themeColors.secondary}40`,
                                                    boxShadow: `0 2px 4px ${themeColors.secondary}15`
                                                }}
                                                placeholder="Enter category name"
                                            />
                                        </div>
                                    </motion.div>
                                    
                                    <motion.div 
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex items-center mb-1.5 gap-1.5">
                                            <MdDescription className="text-base" style={{ color: themeColors.accent }} />
                                            <label className="text-sm font-medium">Description</label>
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                name="description"
                                                defaultValue={category.description}
                                                rows={3}
                                                className="w-full px-3 py-2.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent}20)`,
                                                    color: themeColors.text,
                                                    borderColor: `${themeColors.secondary}40`,
                                                    boxShadow: `0 2px 4px ${themeColors.secondary}15`,
                                                    resize: "none"
                                                }}
                                                placeholder="Optional description for this category"
                                            />
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Action buttons with enhanced styling */}
                                <motion.div 
                                    className="flex justify-end gap-3 mt-6"
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <motion.button
                                        type="button"
                                        className="px-4 py-2 rounded-xl font-medium transition-all duration-300 border"
                                        style={{
                                            borderColor: `${themeColors.secondary}50`,
                                            color: themeColors.text
                                        }}
                                        onClick={onClose}
                                        whileHover={{ scale: 1.03, backgroundColor: `${themeColors.secondary}15` }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl font-medium text-white shadow-md"  
                                        style={{
                                            background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.secondary})`
                                        }}
                                        whileHover={{ scale: 1.03, boxShadow: `0 4px 8px ${themeColors.accent}40` }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        {category.id === 0 ? "Create Category" : "Save Changes"}
                                    </motion.button>
                                </motion.div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CategoryModal;