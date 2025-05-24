/**
 * ProductManager.tsx
 * Component for managing product creation and editing.
 */

// React and external libraries
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IoSaveOutline, IoArrowBackOutline } from 'react-icons/io5';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useQuestionModal } from '../../context/QuestionModalContext';

// Services & Utils
import { postProduct, updateProduct } from '../../api/productService';
import { showMessageModal } from '../../utils/messageModalController';
import config from '../../config';

// Types
import { ProductType } from '../../types';

/**
 * Props for the ProductManager component
 * @interface ProductManagerProps
 */
type ProductManagerProps = {
    /** The product to create or edit */
    product: ProductType;
    /** Function to update or clear the product in state */
    setProduct: React.Dispatch<React.SetStateAction<ProductType | undefined>>;
    /** Function to update the products list */
    setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
};

/**
 * List of available allergens for product selection
 */
const ALLERGENS = [
    "Gluten",
    "Crustacean",
    "Egg",
    "Fish",
    "Peanut",
    "Soy",
    "Lactose",
    "Nuts",
    "Celery",
    "Mustard",
    "Sesame",
    "Sulfite",
    "Lupin",
    "Mollusk",
];

/**
 * ProductManager Component
 * 
 * Form interface for creating and editing products with fields for name, description, 
 * image upload, stock quantity, and allergen selection.
 * 
 * Features:
 * - Image upload to Cloudinary
 * - Real-time image preview
 * - Interactive allergen selection
 * - Form validation
 *
 * @param {ProductManagerProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const ProductManager = ({ product, setProduct, setProducts }: ProductManagerProps) => {
    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { askQuestion } = useQuestionModal();
    
    // Form state management
    const [formData, setFormData] = useState<ProductType>(product);
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);
    const [imagePreview, setImagePreview] = useState(product.url);
    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({});
    // Focus states for input highlighting
    const [focusedField, setFocusedField] = useState<string | null>(null);
    
    /**
     * Handles navigating back to the product list
     */
    const handleBackToList = () => {
        setProduct(undefined);
    };
    
    /**
     * Handles toggling an allergen selection
     * @param {string} allergen - The allergen to toggle
     */
    const handleAllergenToggle = (allergen: string) => {
        const e = {
            target: {
                value: allergen.toUpperCase(),
                checked: !formData.allergens.includes(allergen.toUpperCase())
            }
        } as React.ChangeEvent<HTMLInputElement>;
        handleAllergenChange(e);
    };

    /**
     * Handles change events for text and number inputs
     * Converts stock value to integer if applicable
     * Clears validation errors for the changed field
     * 
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Input change event
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'stock' ? parseInt(value) : value,
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
     * Handles allergen selection and deselection
     * Updates the allergens array in the form data
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Checkbox change event
     */
    const handleAllergenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const updatedAllergens = checked
            ? [...formData.allergens, value]
            : formData.allergens.filter((allergen) => allergen !== value);

        setFormData({ ...formData, allergens: updatedAllergens });
    };

    /**
     * Handles image file selection
     * Creates a preview URL for the selected image
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    /**
     * Saves the product data after confirmation
     * Uploads image if a new one was selected
     * Creates a new product or updates an existing one
     */
    const saveProduct = async () => {
        const confirmed = await askQuestion(`Do you want to save the product ${product.name}?`);
        if (confirmed) {
            let imageUrl = product.url;
            if (imageFile) {
                try {
                    const uploadedUrl = await uploadImage();
                    if (uploadedUrl) imageUrl = uploadedUrl;
                } catch (error) {
                    showMessageModal("ERROR", "Couldn't upload product image");
                }
            }

            const dataToSave = { ...formData, url: imageUrl };

                let savedProduct: ProductType;
                if (product.id === 0) {
                    savedProduct = await postProduct(dataToSave);
                    setProducts(prev => [...prev, savedProduct]);
                } else {
                    savedProduct = await updateProduct(dataToSave);
                    setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
                }
                showMessageModal("SUCCESS", 'Product saved successfully');
                setProduct(undefined);
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

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Product name must be at least 2 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handles the save button click event
     * Validates form data and initiates the product saving process
     */
    const handleSaveProduct = () => {
        if (validate()) {
            saveProduct();
        }
    };

    /**
     * Handles the back button click event
     * Navigates back to the product list
     */
    const handleBackButtonClick = () => {
        handleBackToList();
    };

    /**
     * Uploads the selected image to Cloudinary
     * Returns the secure URL of the uploaded image
     * Shows error message if upload fails
     * 
     * @returns {Promise<string|null>} The uploaded image URL or null if failed
     */
    const uploadImage = async () => {
        if (!imageFile) return;
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", config.CLOUDINARY_PRESENT);
        console.log(config.CLOUDINARY_NAME, config.CLOUDINARY_PRESENT);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${config.CLOUDINARY_NAME}/image/upload`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            showMessageModal("ERROR", "Couldn't upload product image");
            return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="h-full w-full max-w-[600px] mx-auto p-6 rounded-xl overflow-hidden"
            style={{
                backgroundColor: `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.accent})`,
                color: themeColors.text,
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <motion.h1
                    className="text-2xl font-bold tracking-tight relative group"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                    <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
                        {formData.id === 0 ? 'Create New Product' : 'Edit Product'}
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
            </div>
            <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div className="mb-5">
                    <label htmlFor="name" className="block text-m font-bold font-medium mb-2 opacity-90">Product Name*</label>
                    <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="mt-1 block w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            border: errors.name 
                                ? `2px solid #ef4444` 
                                : focusedField === 'name' 
                                    ? `2px solid ${themeColors.accent}` 
                                    : `1px solid ${themeColors.text}20`,
                            color: themeColors.text,
                            boxShadow: focusedField === 'name' ? `0 0 0 3px ${themeColors.accent}30` : `0 2px 5px -2px ${themeColors.secondary}30`
                        }}
                        placeholder="Enter product name"
                    />
                    {errors.name && (
                        <motion.p 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-500">
                            {errors.name}
                        </motion.p>
                    )}
                </div>
                <div className="mb-5">
                    <label htmlFor="description" className="block text-m font-bold mb-2 opacity-90">Description*</label>
                    <motion.textarea
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('description')}
                        onBlur={() => setFocusedField(null)}
                        rows={4}
                        className="mt-1 block w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            border: errors.description 
                                ? `2px solid #ef4444` 
                                : focusedField === 'description' 
                                    ? `2px solid ${themeColors.accent}` 
                                    : `1px solid ${themeColors.text}20`,
                            color: themeColors.text,
                            boxShadow: focusedField === 'description' ? `0 0 0 3px ${themeColors.accent}30` : `0 2px 5px -2px ${themeColors.secondary}30`
                        }}
                        placeholder="Enter product description"
                    />
                    {errors.description && (
                        <motion.p 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-500">
                            {errors.description}
                        </motion.p>
                    )}
                </div>
                <div className='mb-6 flex flex-col gap-4 items-center w-full justify-center'>
                    <div className='flex-1 w-full'>
                        <label htmlFor="image" className="block text-m font-bold font-medium mb-2 opacity-90">Product Image</label>
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            style={{
                                borderColor: themeColors.secondary + '40',
                                boxShadow: `0 2px 5px -2px ${themeColors.secondary}30`
                            }}
                            className="relative border rounded-lg overflow-hidden w-full"
                        >
                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="cursor-pointer w-full relative z-10 py-2.5 px-4 opacity-0 h-12"
                            />
                            <div
                                className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none"
                                style={{
                                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                                    color: themeColors.text
                                }}
                            >
                                <span className="opacity-75">{imageFile ? imageFile.name : 'Choose an image file...'}</span>
                                <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent font-medium">Browse</span>
                            </div>
                        </motion.div>
                    </div>
                    <AnimatePresence mode="wait">
                        {imagePreview ? (
                            <motion.div
                                key="image-preview"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="relative rounded-lg overflow-hidden bg-black/10 backdrop-blur-sm p-1 flex-shrink-0 "
                                style={{ boxShadow: `0 8px 20px -4px ${themeColors.secondary}40` }}
                            >
                                <img
                                    src={imagePreview}
                                    alt="Product preview"
                                    className="w-32 h-32 object-cover rounded"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="image-placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="w-32 h-32 flex-shrink-0 rounded-lg flex items-center justify-center md:ml-2"
                                style={{
                                    border: `2px dashed ${themeColors.secondary}40`,
                                    color: themeColors.text + '70'
                                }}
                            >
                                <span className="text-xs text-center px-2">Image preview will appear here</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="mb-6">
                    <label htmlFor="stock" className="block text-m font-bold font-medium mb-2 opacity-90">Available Stock</label>
                    <motion.input
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="mt-1 block w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            borderColor: themeColors.secondary + '40',
                            color: themeColors.text,
                            boxShadow: `0 2px 5px -2px ${themeColors.secondary}30`
                        }}
                        min="0"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-m font-bold font-medium mb-3 opacity-90">Allergens</label>
                    <div
                        className="p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.secondary})`,
                            border: `1px solid ${themeColors.secondary}20`
                        }}
                    >
                        {ALLERGENS.map((allergen) => {
                            const isSelected = formData.allergens.includes(allergen.toUpperCase());
                            return (
                                <motion.div
                                    key={allergen}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAllergenToggle(allergen)}
                                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-black/5"
                                    style={{
                                        backgroundColor: isSelected ? `color-mix(in srgb, ${themeColors.accent}30, ${themeColors.background})` : 'transparent',
                                        boxShadow: isSelected ? `0 0 0 2px ${themeColors.accent}` : 'none'
                                    }}
                                >

                                    <motion.img
                                        src={`/allergens/${allergen.toLowerCase()}.svg`}
                                        alt={allergen}
                                        className={`w-6 h-6 ${isSelected ? 'grayscale-0' : 'grayscale opacity-70'}`}
                                        animate={{
                                            scale: isSelected ? 1.1 : 1
                                        }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    />
                                    <span className="text-sm">{allergen}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-5 mt-2">
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    onClick={handleSaveProduct}
                    className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium"
                    style={{
                        background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.secondary})`,
                        color: '#ffffff',
                        boxShadow: `0 4px 15px -3px ${themeColors.accent}50`
                    }}
                >
                    <IoSaveOutline size={18} />
                    Save Product
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    onClick={handleBackButtonClick}
                    className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                        color: themeColors.text,
                        border: `1px solid ${themeColors.text}20`,
                        boxShadow: `0 4px 15px -3px ${themeColors.text}20`
                    }}
                >
                    <IoArrowBackOutline size={18} />
                    Back to List
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ProductManager;