/**
 * invoiceService.ts
 * Service for handling invoice-related API requests
 */

// Types
import { InvoiceFiltersType, InvoiceType } from "../types";

// API utilities
import request from "./apiService";

/**
 * Creates a new invoice
 * 
 * @param {InvoiceType} invoice - Invoice data to create
 * @returns {Promise<InvoiceType>} Created invoice with server-generated properties
 */
export const postInvoice = async (invoice: InvoiceType): Promise<InvoiceType> => {
    return await request<InvoiceType>('/invoice', 'POST', invoice);
};

/**
 * Retrieves invoices that match the provided filters
 * 
 * Features:
 * - Filter by invoice ID, order ID, table number
 * - Filter by price range (min/max total)
 * - Filter by payment type
 * - Filter by date range with default date handling
 * 
 * @param {InvoiceFiltersType} filters - Filter criteria for invoices
 * @returns {Promise<InvoiceType[]>} Array of matching invoices
 */
export const getInvoicesByFilters = async (filters: InvoiceFiltersType): Promise<InvoiceType[]> => {
    const params = new URLSearchParams();
    
    // Basic filters
    if (filters.invoiceId) params.append('invoiceId', filters.invoiceId.toString());
    if (filters.orderId) params.append('orderId', filters.orderId.toString());
    if (filters.tableNumber) params.append('tableNum', filters.tableNumber.toString());

    // Amount filters
    if (filters.minTotal) params.append('min', filters.minTotal.toString());
    if (filters.maxTotal) params.append('max', filters.maxTotal.toString());
    if (filters.paymentType) params.append('paymentType', filters.paymentType.toString());
    
    // Date filters with defaults
    if (filters.startDate) {
        params.append('startDate', filters.startDate);
    } else {
        // Default to start of current day
        const newDate = new Date();
        newDate.setDate(newDate.getDate());
        newDate.setHours(0, 0, 0, 0);
        params.append('startDate', newDate.toISOString().replace("Z", ""));
    }
    
    if (filters.endDate) {
        params.append('endDate', filters.endDate); 
    } else {
        // Default to start of next day
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 1);
        newDate.setHours(0, 0, 0, 0);
        params.append('endDate', newDate.toISOString().replace("Z", ""));
    }
    
    const endpoint = `/invoice/filters?${params.toString()}`;
    return await request<InvoiceType[]>(endpoint);
}