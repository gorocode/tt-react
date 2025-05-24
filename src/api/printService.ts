/**
 * printService.ts
 * Service for handling print-related API requests
 */

// Types
import { OrderType } from '../types';

// API utilities
import request from './apiService';

/**
 * Sends a request to print a specific order
 * 
 * @param {number} orderId - The ID of the order to print
 * @param {string} printer - The name/identifier of the printer to use
 * @returns {Promise<OrderType>} Response containing the printed order data
 */
export const printOrder = async (orderId: number, printer: string): Promise<OrderType>  => {
    return await request<OrderType>(`/print/order/${orderId}?printer=${printer}`);
};

/**
 * Sends a request to print a specific invoice
 * 
 * @param {number} invoiceId - The ID of the invoice to print
 * @param {string} printer - The name/identifier of the printer to use
 * @returns {Promise<OrderType>} Response containing the related order data
 */
export const printInvoice = async (invoiceId: number, printer: string): Promise<OrderType>  => {
    return await request<OrderType>(`/print/invoice/${invoiceId}?printer=${printer}`);
};
