import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Icons
import { BiSolidEdit } from 'react-icons/bi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";
import { HiOutlineSearch } from 'react-icons/hi';
import { MdAdd, MdInfo, MdOutlineInventory } from 'react-icons/md';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useQuestionModal } from '../../context/QuestionModalContext';

// Services
import { deleteProduct } from '../../api/productService';

// Types
import { ProductType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useMessageModal } from '../../context/MessageModalContext';

/**
 * Props for the TableProducts component
 * @interface TableProductsProps
 */
type TableProductsProps = {
    /** Array of product data to display in the table */
    products: ProductType[];
    /** Function to update the products list state */
    setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
    /** Function to set the currently selected product for editing */
    selectProduct: React.Dispatch<React.SetStateAction<ProductType | undefined>>;
    /** Function to create a new product */
    createProduct: () => void;
};

/**
 * TableProducts Component
 * 
 * Displays product data in a sortable, searchable table format with edit and delete actions.
 * Features:
 * - Column sorting by name and stock
 * - Search filtering by name and description
 * - Visual indicators for stock levels (colors)
 * - Animated UI responses and empty state handling
 * 
 * @param {TableProductsProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const TableProducts = ({ products, setProducts, selectProduct, createProduct }: TableProductsProps) => {
    // Authentication context
    const { hasRole } = useAuth();

    // Theme and modal context
    const { themeColors } = useTheme();
    const { askQuestion } = useQuestionModal();
    const { showMessageModal } = useMessageModal();

    // Table state management
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
     * Handles column sorting
     * - Toggles between ascending and descending if the same column is clicked
     * - Sets to ascending if a different column is clicked
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
            {/* Product table header with animated title and search bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-5">
                    <motion.h1
                        className="text-3xl font-bold tracking-tight relative group"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
                            Products
                        </span>
                        <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                            style={{ background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})` }}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "100%", opacity: 0.3 }}
                            whileHover={{ opacity: 0.8, height: "3px", bottom: "-3px" }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.h1>
                    {/* Create Product Button */}
                    {hasRole(["ADMIN", "MANAGER"]) && (
                        <button
                            onClick={createProduct}
                            className="btn btn-icon-sm btn-accent btn-with-icon-animation"
                        >
                            <MdAdd size={24} />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <motion.div
                        className="flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            boxShadow: isSearchFocused ?
                                `0 0 0 2px ${themeColors.accent}40, 0 4px 6px -1px ${themeColors.accent}30` :
                                `0 4px 6px -1px ${themeColors.text}10`
                        }}
                        animate={{
                            width: isSearchFocused ? '300px' : '240px'
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
                                className="btn btn-xs btn-icon-sm btn-secondary flex items-center justify-center"
                                onClick={() => setSearchTerm('')}
                            >
                                ×
                            </motion.button>
                        )}
                    </motion.div>

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
                </div>
            </div>

            <div className="w-full overflow-hidden rounded-lg relative"
                style={{
                    color: themeColors.text,
                    boxShadow: `0 4px 6px -1px ${themeColors.accent}20, 0 2px 4px -2px ${themeColors.accent}10`
                }}>
                {/* Table headers - fixed */}
                <table className="w-full border-separate border-spacing-0 sticky top-0 z-10 bg-inherit">
                    <colgroup>
                        <col className="w-[90px]" />
                        <col />
                        <col className="min-w-[120px] w-[30%]" />
                        <col className="min-w-[120px] w-[18%]" />
                        <col className="w-[120px]" />
                        {hasRole(["ADMIN", "MANAGER"]) && (<col className="w-[120px]" />)}
                    </colgroup>
                    <thead>
                        <tr className="text-left"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent})`,
                                borderBottom: `2px solid ${themeColors.accent}40`
                            }}>
                            <th className="px-6 py-4 font-semibold rounded-tl-lg">Image</th>
                            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => handleSort('name')} >
                                <div className='flex justify-between items-center gap-2'>
                                    <span className="flex items-center gap-2">
                                        Name
                                        <motion.span
                                            animate={{
                                                color: sortConfig.key === 'name' ? themeColors.accent : 'inherit',
                                                opacity: sortConfig.key === 'name' ? 1 : 0.5,
                                            }}
                                        >
                                            {sortConfig.key !== 'name' ? (
                                                <FaSort size={14} />
                                            ) : sortConfig.direction === 'asc' ? (
                                                <FaSortUp size={14} />
                                            ) : (
                                                <FaSortDown size={14} />
                                            )}
                                        </motion.span>
                                    </span>
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold">Description</th>
                            <th className="px-6 py-4 font-semibold">Allergens</th>
                            <th className="px-6 py-4 font-semibold cursor-pointer" onClick={() => handleSort('stock')}>
                                <div className='flex items-center gap-2'>
                                    <MdOutlineInventory size={16} />
                                    <span>Stock</span>
                                    <motion.span
                                        animate={{
                                            color: sortConfig.key === 'stock' ? themeColors.accent : 'inherit',
                                            opacity: sortConfig.key === 'stock' ? 1 : 0.5
                                        }}
                                    >
                                        {sortConfig.key !== 'stock' ? (
                                            <FaSort size={14} />
                                        ) : sortConfig.direction === 'asc' ? (
                                            <FaSortUp size={14} />
                                        ) : (
                                            <FaSortDown size={14} />
                                        )}
                                    </motion.span>
                                </div>
                            </th>
                            {hasRole(["ADMIN", "MANAGER"]) && (<th className="px-6 py-4 font-semibold rounded-tr-lg">Actions</th>)}
                        </tr>
                    </thead>
                </table>
                <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-180px)]">
                    <table className="w-full border-separate border-spacing-0">
                        <colgroup>
                            <col className="w-[90px]" />
                            <col />
                            <col className="min-w-[120px] w-[30%]" />
                            <col className="min-w-[120px] w-[18%]" />
                            <col className="w-[120px]" />
                            {hasRole(["ADMIN", "MANAGER"]) && (<col className="w-[120px]" />)}
                        </colgroup>
                        <tbody>
                            <AnimatePresence>
                                {filteredAndSortedProducts.length > 0 ? (
                                    filteredAndSortedProducts.map((product, index) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 25,
                                                delay: index * 0.05 // Staggered animation
                                            }}
                                            style={{
                                                backgroundColor: index % 2 === 0 ?
                                                    `color-mix(in srgb, ${themeColors.background} 100%, ${themeColors.text})` :
                                                    `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.text})`
                                            }}
                                            className="transition-all hover:shadow-md"
                                            whileHover={{
                                                backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.accent})`,
                                                scale: 1.005,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <td className="p-4 text-center flex justify-center items-center">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    {product?.url ? (
                                                        <img
                                                            src={product.url}
                                                            alt={product.name}
                                                            className="w-16 h-16 object-cover rounded-lg mx-auto shadow-md"
                                                            style={{
                                                                boxShadow: `0 4px 6px -1px ${themeColors.accent}30, 0 2px 4px -2px ${themeColors.accent}20`
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-16 h-16 flex items-center justify-center rounded-lg"
                                                            style={{ background: `color-mix(in srgb, ${themeColors.accent} 20%, ${themeColors.background})` }}
                                                        >
                                                            <MdInfo size={24} style={{ color: themeColors.accent }} />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{product.name}</div>
                                            </td>
                                            <td className="p-4 max-w-xs text-sm opacity-80">
                                                <div className="line-clamp-2">{product.description}</div>
                                            </td>
                                            <td className="p-4 text-center max-w-[300px]">
                                                <div className="flex justify-center flex-wrap gap-2">
                                                    {product.allergens && product.allergens.length > 0 ? (
                                                        product.allergens.map((allergen, index) => (
                                                            <motion.div
                                                                key={index}
                                                                whileHover={{ y: -3, scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                transition={{ type: "spring", stiffness: 400 }}
                                                                className="relative group"
                                                            >
                                                                <img
                                                                    src={`/allergens/${allergen.toLowerCase()}.svg`}
                                                                    alt={allergen}
                                                                    className="w-10 h-10 transition-all"
                                                                />
                                                                <div
                                                                    className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 py-1 px-2 text-xs rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap"
                                                                    style={{
                                                                        backgroundColor: themeColors.accent,
                                                                        color: themeColors.background
                                                                    }}
                                                                >
                                                                    {allergen}
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm opacity-50">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <motion.div
                                                    className="inline-block py-1 px-3 rounded-full text-sm font-medium"
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
                                            </td>
                                            {hasRole(["ADMIN", "MANAGER"]) && (
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="btn btn-icon btn-outline-accent btn-with-icon-animation text-blue-500"
                                                            onClick={() => selectProduct(product)}
                                                        >
                                                            <BiSolidEdit size={24} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="btn btn-icon btn-danger btn-with-icon-animation"
                                                            onClick={() => askDeleteProduct(product.id)}
                                                        >
                                                            <RiDeleteBin6Fill size={24} />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
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
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TableProducts