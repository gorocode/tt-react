/**
 * tableService.ts
 * Service for handling restaurant table-related API requests
 */

// Types
import { TableType } from '../types';

// API utilities
import request from './apiService';

/**
 * Retrieves all tables in the restaurant
 * 
 * @returns {Promise<TableType[]>} Array of all tables with their details
 */
export const getAllTables = async (): Promise<TableType[]> => {
    return await request('/tables');
};

/**
 * Creates a new table in the restaurant
 * 
 * @param {TableType} table - The table data to create
 * @returns {Promise<TableType>} The created table with server-generated ID
 */
export const postTable = async (table: TableType): Promise<TableType> => {
    return await request<TableType>('/tables', 'POST', table);
};

/**
 * Updates an existing table
 * Used for modifying table properties, position, or status
 * 
 * @param {TableType} table - The table data to update (must include ID)
 * @returns {Promise<TableType>} The updated table from the server
 */
export const putTable = async (table: TableType): Promise<TableType> => {
    return await request<TableType>('/tables', 'PUT', table);
};

/**
 * Deletes a table by its ID
 * 
 * @param {number} tableId - The ID of the table to delete
 * @returns {Promise<void>} Empty response indicating deletion success
 */
export const deleteTable = async (tableId: number): Promise<void> => {
    return await request<void>(`/tables/${tableId}`, 'DELETE');
};
