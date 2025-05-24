import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

// Types
import { ProductType } from '../types';

// API Services
import { getProducts } from '../api/productService';

// Components
import TableProducts from '../components/products/TableProducts';
import ProductManager from '../components/products/ProductManager';

/**
 * ProductsPage Component
 * 
 * Provides an interface for managing product inventory including:
 * - Viewing all products in a tabular format
 * - Filtering products by name
 * - Creating, editing, and deleting products
 * - Managing product details, images, and inventory levels
 */
const ProductsPage = () => {
    const { themeColors } = useTheme();

    // State
    const [search] = useState("");
    const [products, setProducts] = useState<ProductType[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductType | undefined>(undefined);
    
    // Filtered products based on search term
    const filteredProducts = products?.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    /**
     * Load all products on component mount
     */
    useEffect(() => {
        const fetchData = async () => {
            const productData = await getProducts();
            setProducts(productData);
        };
        fetchData();
    }, []);

    /**
     * Create a new product with default values
     * This method initializes a new product record before editing
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
    }

    /**
     * Renders either the product list table or the product edit form
     * depending on whether a product is selected
     */
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="grid h-full w-full gap-4 p-2 grid-cols-auto grid-rows-[auto] rounded-lg">
                {selectedProduct ? (
                    // Product edit mode - show the product manager component
                    <ProductManager 
                        product={selectedProduct} 
                        setProduct={setSelectedProduct} 
                        setProducts={setProducts} 
                    />
                ) : (
                    // Product list mode - show the products table
                    <div
                        className="w-full p-4 col-span-1 row-span-1 relative"
                        style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            borderColor: themeColors.secondary
                        }}
                    >
                        <TableProducts 
                            products={filteredProducts} 
                            setProducts={setProducts} 
                            selectProduct={setSelectedProduct} 
                            createProduct={createProduct}
                        />
                        
                    
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductsPage;