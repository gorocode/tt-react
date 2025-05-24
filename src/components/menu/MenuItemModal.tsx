import { motion, AnimatePresence } from "motion/react";

// Icons
import { MdAttachMoney, MdCategory, MdPercent } from "react-icons/md";
import { IoRestaurant } from "react-icons/io5";

// Context
import { useTheme } from "../../context/ThemeContext";

// Types
import { CategoryType, MenuItemType } from "../../types";
import { JSX } from "react";

/**
 * Props for the MenuItemModal component
 * @interface MenuItemModalProps
 */
type MenuItemModalProps = {
    /** Menu item to add to the menu */
    menuItem: MenuItemType;
    /** List of categories to select from */
    categories: CategoryType[];
    /** Whether the modal is open */
    isOpen: boolean;
    /** Whether we are editing an existing item */
    isEditing?: boolean;
    /** Function to close the modal */
    onClose: () => void;
    /** Function called when the form is submitted with price, tax and category values */
    onConfirm: (menuItem: MenuItemType, categoryId: number) => void;
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
const MenuItemModal = ({ menuItem, categories, isOpen, isEditing, onClose, onConfirm }: MenuItemModalProps): JSX.Element | null => {
    const { themeColors } = useTheme();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const categoryId = parseFloat(formData.get('categoryId') as string);

        // Only get price/tax from form in create mode
        const price = isEditing ? menuItem.price : parseFloat(formData.get('price') as string);
        const tax = isEditing ? menuItem.tax : parseFloat(formData.get('tax') as string);

        // Create a new menu item object to pass to the onConfirm function
        const newMenuItem: MenuItemType = {
            ...menuItem,
            price,
            tax,
            product: menuItem.product,
        };

        onConfirm(newMenuItem, categoryId);
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
                            
                            {/* Enhanced header with product info */}
                            <div className="relative mb-6">
                                <div className="flex items-start gap-3">
                                    {/* Product icon or image */}
                                    <motion.div 
                                        className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {menuItem.product.url ? (
                                            <div className="relative w-full h-full">
                                                <div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary opacity-20 rounded-lg" />
                                                <img 
                                                    src={menuItem.product.url}
                                                    alt={menuItem.product.name}
                                                    className="w-full h-full object-cover relative z-10"
                                                />
                                            </div>
                                        ) : (
                                            <div 
                                                className="w-full h-full flex items-center justify-center rounded-lg"
                                                style={{ background: `linear-gradient(135deg, ${themeColors.accent}30, ${themeColors.secondary}30)` }}
                                            >
                                                <IoRestaurant size={24} style={{ color: themeColors.accent }} />
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Title and subtitle */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text">
                                            {menuItem.product.name}
                                            <motion.div 
                                                className="absolute -bottom-1 left-0 h-0.5 rounded-full" 
                                                style={{ background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})` }}
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "40%", opacity: 0.5 }}
                                                transition={{ delay: 0.3, duration: 0.4 }}
                                            />
                                        </h3>
                                        <p 
                                            className="text-sm mt-0.5" 
                                            style={{ color: `${themeColors.text}80` }}
                                        >
                                            {isEditing ? "Edit menu item details" : "Add this product to your menu"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form with enhanced styling and animation */}
                            <form onSubmit={(e) => handleSubmit(e)} className="mt-2">
                                <div className="space-y-5">
                                    {/* Price input */}
                                    <motion.div 
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex items-center mb-1.5 gap-1.5">
                                            <MdAttachMoney className="text-base" style={{ color: themeColors.accent }} />
                                            <label className="text-sm font-medium">Price (€)</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="price"
                                                step="0.01"
                                                min="0"
                                                defaultValue={menuItem.price || "1"}
                                                required
                                                disabled={isEditing}
                                                className={`w-full px-3 py-2.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent}20)`,
                                                    color: themeColors.text,
                                                    borderColor: `${themeColors.secondary}40`,
                                                    boxShadow: `0 2px 4px ${themeColors.secondary}15`
                                                }}
                                                placeholder="Enter price"
                                            />
                                            {isEditing && (
                                                <div className="absolute right-3 top-2.5 text-xs py-0.5 px-2 rounded-full" style={{ backgroundColor: `${themeColors.secondary}30`, color: themeColors.secondary }}>
                                                    Locked
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                    
                                    {/* Tax input */}
                                    <motion.div 
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex items-center mb-1.5 gap-1.5">
                                            <MdPercent className="text-base" style={{ color: themeColors.accent }} />
                                            <label className="text-sm font-medium">Tax Rate</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="tax"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                defaultValue={menuItem.tax || "0.21"}
                                                required
                                                disabled={isEditing}
                                                className={`w-full px-3 py-2.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent}20)`,
                                                    color: themeColors.text,
                                                    borderColor: `${themeColors.secondary}40`,
                                                    boxShadow: `0 2px 4px ${themeColors.secondary}15`
                                                }}
                                                placeholder="Enter tax rate"
                                            />
                                            {isEditing && (
                                                <div className="absolute right-3 top-2.5 text-xs py-0.5 px-2 rounded-full" style={{ backgroundColor: `${themeColors.secondary}30`, color: themeColors.secondary }}>
                                                    Locked
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                    
                                    {/* Category selection */}
                                    <motion.div 
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="flex items-center mb-1.5 gap-1.5">
                                            <MdCategory className="text-base" style={{ color: themeColors.accent }} />
                                            <label className="text-sm font-medium">Category</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                name="categoryId"
                                                required
                                                className="w-full px-3 py-2.5 rounded-xl border appearance-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent}20)`,
                                                    color: themeColors.text,
                                                    borderColor: `${themeColors.secondary}40`,
                                                    boxShadow: `0 2px 4px ${themeColors.secondary}15`
                                                }}
                                            >
                                                {categories.map((category) => (
                                                    <option 
                                                        key={category.id} 
                                                        value={category.id} 
                                                        selected={category.menuItems.some((item) => item.id === menuItem.id)}
                                                    >
                                                        {category.name} ({category.menuItems.length} items)
                                                    </option>
                                                ))}
                                            </select>
                                            {/* Custom dropdown arrow */}
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-4 h-4" style={{ color: themeColors.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Action buttons with enhanced styling */}
                                <motion.div 
                                    className="flex justify-end gap-3 mt-6"
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
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
                                        {isEditing ? 'Update Item' : 'Add to Menu'}
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

export default MenuItemModal;