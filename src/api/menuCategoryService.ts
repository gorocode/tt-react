/**
 * menuCategoryService.ts
 * Service for handling menu category-related API requests
 */

// Types
import { CategoryType } from "../types";

// API utilities
import request from "./apiService";

/**
 * Retrieves all menu categories
 * 
 * @returns {Promise<CategoryType[]>} Array of all menu categories
 */
export const getAllCategories = async (): Promise<CategoryType[]> => {
    return await request<CategoryType[]>('/menu-category');
};

/**
 * Creates a new menu category
 * 
 * @param {CategoryType} category - The category data to create
 * @returns {Promise<CategoryType>} The created category with server-generated ID
 */
export const postCategory = async (category: CategoryType): Promise<CategoryType>  => {
    return await request<CategoryType>('/menu-category', 'POST', category);
};

/**
 * Updates an existing menu category
 * 
 * @param {CategoryType} category - The category data to update (must include ID)
 * @returns {Promise<CategoryType>} The updated category from the server
 */
export const updateCategory = async (category: CategoryType): Promise<CategoryType> => {
    return await request<CategoryType>('/menu-category', 'PUT', category);
};

/**
 * Deletes a menu category by its ID
 * 
 * @param {number} categoryId - The ID of the category to delete
 * @returns {Promise<any>} Response indicating deletion success
 */
export const deleteCategory = async (categoryId: number): Promise<any> => {
    return await request(`/menu-category/${categoryId}`, 'DELETE');
};