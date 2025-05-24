/**
 * orderService.ts
 * Service for handling order-related API requests
 */

// Types
import { OrderType, OrderFiltersType } from "../types";

// API utilities
import request from "./apiService";

/**
 * Retrieves orders that match the provided filters
 * 
 * Features:
 * - Filter by order ID and table ID
 * - Filter by multiple order statuses
 * - Filter by payment status
 * - Filter by date range
 * 
 * @param {OrderFiltersType} filters - Filter criteria for orders
 * @returns {Promise<OrderType[]>} Array of matching orders
 */
export const getOrdersByFilters = async (filters: OrderFiltersType): Promise<OrderType[]> => {
    const params = new URLSearchParams();
    
    // Basic filters
    if (filters.orderId) params.append('orderId', filters.orderId.toString());
    if (filters.tableId) params.append('tableId', filters.tableId.toString());
    
    // Status filters (can have multiple)
    if (filters.status && Array.isArray(filters.status)) {
        filters.status.forEach(status => params.append('status', status));
    }
    
    // Payment status
    if (filters.paid !== undefined) params.append('paid', filters.paid.toString());

    // Date range filters
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const endpoint = `/orders/filters?${params.toString()}`;
    return await request<OrderType[]>(endpoint);
}

/**
 * Creates a new empty order for a specific table
 * 
 * @param {number} tableId - The ID of the table to create an order for
 * @returns {Promise<OrderType>} The created order with server-generated ID
 */
export const postOrder = async (tableId: number): Promise<OrderType> => {
    return await request<OrderType>(`/orders?tableId=${tableId}`, 'POST');
}

/**
 * Creates a new order with all details (items, table, etc.)
 * 
 * @param {OrderType} order - Complete order data to create
 * @returns {Promise<OrderType>} The created order with server-generated properties
 */
export const postFullOrder = async (order: OrderType): Promise<OrderType> => {
    return await request<OrderType>(`/orders/full`, 'POST', order);
}

/**
 * Updates an existing order
 * Used for modifying items, status, or payment status
 * 
 * @param {OrderType} order - The order data to update (must include ID)
 * @returns {Promise<OrderType>} The updated order from the server
 */
export const putOrder = async (order: OrderType): Promise<OrderType> => {
    return await request<OrderType>(`/orders`, 'PUT', order);
}

/**
 * Deletes an order by its ID
 * 
 * @param {number} orderId - The ID of the order to delete
 * @returns {Promise<void>} Empty response indicating deletion success
 */
export const deleteOrder = async (orderId: number): Promise<void> => {
    return await request<void>(`/orders/${orderId}`, 'DELETE');
}
