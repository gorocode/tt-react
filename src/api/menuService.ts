/**
 * menuService.ts
 * Service for handling menu-related API requests
 */

// Types
import { MenuType } from '../types';

// API utilities
import request from './apiService';

/**
 * Retrieves the currently available menu
 * Used primarily for customer-facing displays
 * 
 * @returns {Promise<MenuType>} The active menu with its categories and items
 */
export const getMenu = async (): Promise<MenuType>  => {
    return await request<MenuType>('/menu/available');
};

/**
 * Retrieves all menus in the system
 * Used primarily for administrative purposes
 * 
 * @returns {Promise<MenuType[]>} Array of all menus
 */
export const getAllMenus = async (): Promise<MenuType[]> => {
    return await request<MenuType[]>('/menu');
};

/**
 * Creates a new menu
 * 
 * @param {MenuType} menu - The menu data to create
 * @returns {Promise<MenuType>} The created menu with server-generated ID
 */
export const postMenu = async (menu: MenuType): Promise<MenuType>  => {
    return await request<MenuType>('/menu', 'POST', menu);
};

/**
 * Updates an existing menu
 * Used for modifying menu properties or changing its active status
 * 
 * @param {MenuType} menu - The menu data to update (must include ID)
 * @returns {Promise<MenuType>} The updated menu from the server
 */
export const updateMenu = async (menu: MenuType): Promise<MenuType> => {
    return await request<MenuType>('/menu', 'PUT', menu);
};

/**
 * Toggles the availability status of a menu.
 * 
 * @param {number} menuId - The ID of the menu to toggle
 * @returns {Promise<MenuType>} Response containing the updated menu
 */
export const toggleMenuAvailability = async (menuId: number): Promise<MenuType> => {
    return await request<MenuType>(`/menu/${menuId}/toggle-available`, 'PATCH');
};

/**
 * Deletes a menu by its ID
 * 
 * @param {number} menuId - The ID of the menu to delete
 * @returns {Promise<any>} Response indicating deletion success
 */
export const deleteMenu = async (menuId: number): Promise<any> => {
    return await request(`/menu/${menuId}`, 'DELETE');
};
