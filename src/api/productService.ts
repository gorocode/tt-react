/**
 * productService.ts
 * Service for handling product inventory-related API requests
 */

// Types
import { ProductType } from '../types';

// API utilities
import request from './apiService';

/**
 * Retrieves all products in the inventory
 * 
 * @returns {Promise<ProductType[]>} Array of all products with their details
 */
export const getProducts = async (): Promise<ProductType[]>  => {
    return await request<ProductType[]>('/products');
};

/**
 * Creates a new product in the inventory
 * 
 * @param {ProductType} product - The product data to create
 * @returns {Promise<ProductType>} The created product with server-generated ID
 */
export const postProduct = async (product: ProductType): Promise<ProductType>  => {
    return await request<ProductType>('/products', 'POST', product);
};

/**
 * Updates an existing product
 * Used for modifying product details, stock, or images
 * 
 * @param {ProductType} product - The product data to update (must include ID)
 * @returns {Promise<ProductType>} The updated product from the server
 */
export const updateProduct = async (product: ProductType): Promise<ProductType> => {
    return await request<ProductType>('/products', 'PUT', product);
};

/**
 * Deletes a product by its ID
 * 
 * @param {number} productId - The ID of the product to delete
 * @returns {Promise<any>} Response indicating deletion success
 */
export const deleteProduct = async (productId: number): Promise<any> => {
    return await request(`/products/${productId}`, 'DELETE');
};