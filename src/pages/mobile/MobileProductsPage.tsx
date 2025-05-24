/**
 * MobileProductsPage.tsx
 * Mobile-optimized version of the ProductsPage for managing product inventory.
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Types
import { ProductType } from '../../types';

// API Services
import { getProducts } from '../../api/productService';

// Components
import MobileProductList from '../../components/products/MobileProductList';
import ProductManager from '../../components/products/ProductManager';
import MobilePageWrapper from '../../components/global/MobilePageWrapper';

// Icons
import { BiSearch } from 'react-icons/bi';
import { MdAdd, MdArrowBack } from 'react-icons/md';

/**
 * MobileProductsPage Component
 * 
 * Mobile-optimized interface for managing product inventory, featuring:
 * - Vertically stacked layout optimized for mobile screens
 * - Touch-friendly controls with larger tap targets
 * - Simplified navigation between product list and edit views
 * - Maintains all functionality of the desktop version
 */
const MobileProductsPage = () => {
    const { themeColors } = useTheme();
    const { hasRole } = useAuth();

    // State
    const [showSearch, setShowSearch] = useState(false);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductType | undefined>(undefined);

    /**
     * Load all products on component mount
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const productData = await getProducts();
                setProducts(productData);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchData();
    }, []);

    /**
     * Create a new product with default values
     */
    const createProduct = () => {
        const newProduct: ProductType = {
            id: 0,
            name: '',
            description: '',
            url: '',
            stock: 0,
            allergens: []
        };

        setSelectedProduct(newProduct);
    };

    /**
     * Search button for the header
     */
    const SearchButton = (
        <motion.button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
                color: showSearch ? themeColors.accent : themeColors.text
            }}
        >
            <BiSearch size={24} />
        </motion.button>
    );

    /**
     * Add button for the header (when in list view)
     */
    const AddButton = (
        hasRole(["ADMIN", "MANAGER"]) && (
            <motion.button
                onClick={createProduct}
                className="p-2 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    color: themeColors.text
                }}
            >
                <MdAdd size={24} />
            </motion.button>
        )
    );

    /**
     * Back button for the header (when in edit view)
     */
    const BackButton = (
        <motion.button
            onClick={() => setSelectedProduct(undefined)}
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
            title={selectedProduct ? (selectedProduct.id === 0 ? "New Product" : "Edit Product") : "Products"}
            headerAction={selectedProduct ? BackButton : (showSearch ? SearchButton : AddButton)}
        >
            {selectedProduct ? (
                // Product edit mode
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: `${themeColors.secondary}25` }}>
                    <ProductManager
                        product={selectedProduct}
                        setProduct={setSelectedProduct}
                        setProducts={setProducts}
                    />
                </div>
            ) : (
                // Product list mode
                <div
                    className="w-full rounded-lg overflow-hidden"
                    style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: `${themeColors.secondary}25`
                    }}
                >
                    <MobileProductList
                        products={products}
                        setProducts={setProducts}
                        selectProduct={setSelectedProduct}
                    />
                </div>
            )}
        </MobilePageWrapper>
    );
};

export default MobileProductsPage;
