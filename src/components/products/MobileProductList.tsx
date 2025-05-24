import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Icons
import { BiSolidEdit } from 'react-icons/bi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { FaSortDown, FaSortUp } from "react-icons/fa6";
import { HiOutlineSearch } from 'react-icons/hi';
import { MdClose, MdInfo, MdOutlineInventory } from 'react-icons/md';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useQuestionModal } from '../../context/QuestionModalContext';
import { useAuth } from '../../context/AuthContext';
import { useMessageModal } from '../../context/MessageModalContext';

// Services
import { deleteProduct } from '../../api/productService';

// Types
import { ProductType } from '../../types';

/**
 * Props for the MobileProductList component
 * @interface MobileProductListProps
 */
type MobileProductListProps = {
    /** Array of product data to display in the list */
    products: ProductType[];
    /** Function to update the products list state */
    setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
    /** Function to set the currently selected product for editing */
    selectProduct: React.Dispatch<React.SetStateAction<ProductType | undefined>>;
};

/**
 * MobileProductList Component
 * 
 * Displays product data in a mobile-friendly card layout with sorting, searching, and action capabilities.
 * Features:
 * - Sorting by name and stock
 * - Search filtering by name and description
 * - Visual indicators for stock levels (colors)
 * - Touch-optimized card UI with swipe animations
 * - Responsive design for small screens
 * 
 * @param {MobileProductListProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const MobileProductList = ({ products, setProducts, selectProduct }: MobileProductListProps) => {
    // Authentication context
    const { hasRole } = useAuth();

    // Theme and modal context
    const { themeColors } = useTheme();
    const { askQuestion } = useQuestionModal();
    const { showMessageModal } = useMessageModal();

    // List state management
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProductType; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    /**
     * Filter and sort products based on search term and sort configuration
     * - Filters by product name and description (case-insensitive)
     * - Sorts by the configured column and direction
     */
    const filteredAndSortedProducts = [...products]
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    /**
     * Handles sorting by the specified property
     * - Toggles between ascending and descending if the same property is selected
     * - Sets to ascending if a different property is selected
     * 
     * @param {keyof ProductType} key - The property key to sort by
     */
    const handleSort = (key: keyof ProductType) => {
        setSortConfig((prev) => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    /**
     * Handles product deletion with confirmation
     * - Prompts for confirmation before deletion
     * - Updates the products state after successful deletion
     * 
     * @param {number} productId - The ID of the product to delete
     */
    const askDeleteProduct = async (productId: number) => {
        const confirmed = await askQuestion(`Do you want to delete this product?`);
        if (confirmed) {
            const confirmed2 = await askQuestion(`Are you sure you want to delete this product?`);
            if (confirmed2) {
                await deleteProduct(productId);
                setProducts((prev) => prev.filter((product) => product.id !== productId));
                showMessageModal("INFO", "Product deleted successfully.");
            }
        }
    }

    return (
        <div className="flex flex-col w-full">
            {/* Product list header with title, search, and sort */}
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
                            placeholder="Search products..."
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
                            Found: {filteredAndSortedProducts.length} product(s)
                        </motion.div>
                    )}
                </motion.div>
                
                {/* Sort options dropdown */}
                <AnimatePresence>
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
                                    onClick={() => handleSort('name')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full text-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        backgroundColor: sortConfig.key === 'name' ? themeColors.accent : `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                        color: sortConfig.key === 'name' ? themeColors.background : themeColors.text
                                    }}
                                >
                                    <span>Name</span>
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'asc' ? <FaSortUp size={14} /> : <FaSortDown size={14} />
                                    )}
                                </motion.button>
                                
                                <motion.button
                                    onClick={() => handleSort('stock')}
                                    className="flex items-center gap-1 px-3 py-2 rounded-full text-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        backgroundColor: sortConfig.key === 'stock' ? themeColors.accent : `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                        color: sortConfig.key === 'stock' ? themeColors.background : themeColors.text
                                    }}
                                >
                                    <MdOutlineInventory size={16} />
                                    <span>Stock</span>
                                    {sortConfig.key === 'stock' && (
                                        sortConfig.direction === 'asc' ? <FaSortUp size={14} /> : <FaSortDown size={14} />
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                </AnimatePresence>
            </div>

            {/* Product cards list */}
            <div className="overflow-y-auto pb-16 mt-2">
                <AnimatePresence>
                    {filteredAndSortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredAndSortedProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
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
                                    <div className="flex items-start p-3">
                                        {/* Product image */}
                                        <div className="mr-3">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                {product?.url ? (
                                                    <img
                                                        src={product.url}
                                                        alt={product.name}
                                                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                                                        style={{
                                                            boxShadow: `0 4px 6px -1px ${themeColors.accent}30`
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-20 h-20 flex items-center justify-center rounded-lg"
                                                        style={{ background: `color-mix(in srgb, ${themeColors.accent} 20%, ${themeColors.background})` }}
                                                    >
                                                        <MdInfo size={24} style={{ color: themeColors.accent }} />
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                        
                                        {/* Product details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                                                
                                                {/* Stock indicator */}
                                                <motion.div
                                                    className="py-1 px-3 rounded-full text-sm font-medium ml-2"
                                                    style={{
                                                        backgroundColor: product.stock > 10 ?
                                                            'rgba(34, 197, 94, 0.15)' :
                                                            product.stock > 0 ?
                                                                'rgba(234, 179, 8, 0.15)' :
                                                                'rgba(239, 68, 68, 0.15)',
                                                        color: product.stock > 10 ?
                                                            'rgb(22, 163, 74)' :
                                                            product.stock > 0 ?
                                                                'rgb(202, 138, 4)' :
                                                                'rgb(220, 38, 38)'
                                                    }}
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    {product.stock}
                                                </motion.div>
                                            </div>
                                            
                                            {/* Description */}
                                            <p className="text-sm opacity-80 mb-2 line-clamp-2">
                                                {product.description}
                                            </p>
                                            
                                            {/* Allergens */}
                                            {product.allergens && product.allergens.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                                                    {product.allergens.map((allergen, index) => (
                                                        <motion.div
                                                            key={index}
                                                            whileHover={{ y: -2, scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="relative group"
                                                        >
                                                            <img
                                                                src={`/allergens/${allergen.toLowerCase()}.svg`}
                                                                alt={allergen}
                                                                className="w-8 h-8"
                                                            />
                                                            <div
                                                                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 py-1 px-2 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap"
                                                                style={{
                                                                    backgroundColor: themeColors.accent,
                                                                    color: themeColors.background
                                                                }}
                                                            >
                                                                {allergen}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Action buttons */}
                                            {hasRole(["ADMIN", "MANAGER"]) && (
                                                <div className="w-full flex justify-end gap-2 mt-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, y: -2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                        className="btn btn-icon btn-outline-accent btn-with-icon-animation"
                                                        onClick={() => selectProduct(product)}
                                                    >
                                                        <BiSolidEdit size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, y: -2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                        className="btn btn-icon btn-danger btn-with-icon-animation"
                                                        onClick={() => askDeleteProduct(product.id)}
                                                    >
                                                        <RiDeleteBin6Fill size={20} />
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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
                            <h3 className="text-xl font-bold mb-2">No products found</h3>
                            <p className="text-sm max-w-md">
                                {searchTerm ?
                                    `No products match your search "${searchTerm}". Try a different search term.` :
                                    "There are no products available at the moment."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default MobileProductList;
