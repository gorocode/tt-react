/**
 * Types for Products and Menu items
 */

/**
 * Represents a product with its basic information
 */
export interface ProductType {
    /** Unique identifier for the product */
    id: number;
    /** Product name */
    name: string;
    /** Product description */
    description: string;
    /** URL to the product image */
    url: string;
    /** Available stock quantity */
    stock: number;
    /** List of allergens present in the product */
    allergens: string[];
}

/**
 * Represents a menu item with pricing and associated product
 */
export interface MenuItemType {
    /** Unique identifier for the menu item */
    id: number;
    /** Price of the menu item */
    price: number;
    /** Tax percentage applied to the menu item */
    tax: number;
    /** Whether the menu item is currently available */
    available: boolean;
    /** The associated product */
    product: ProductType;
    /** Display order in the menu */
    menuOrder: number;
}

/**
 * Writeable version of MenuItemType for creating or updating menu items
 * Uses IDs instead of nested objects for API operations
 */
export interface WMenuItemType {
    /** Unique identifier for the menu item */
    id: number;
    /** Price of the menu item */
    price: number;
    /** Tax percentage applied to the menu item */
    tax: number;
    /** Whether the menu item is currently available */
    available: boolean;
    /** ID of the associated product */
    productId: number;
    /** ID of the category this menu item belongs to */
    categoryId: number;
    /** ID of the menu this item belongs to */
    menuId: number;
    /** Display order in the menu */
    menuOrder: number;
}


/**
 * Represents a category of menu items
 */
export interface CategoryType {
    /** Unique identifier for the category */
    id: number;
    /** Category name */
    name: string;
    /** Category description */
    description: string;
    /** List of menu items in this category */
    menuItems: MenuItemType[];
    /** Display order in the menu */
    menuOrder: number;
}

/**
 * Represents a complete menu with its categories
 */
export interface MenuType {
    /** Unique identifier for the menu */
    id: number;
    /** Menu name */
    name: string;
    /** Menu description */
    description: string;
    /** Whether the menu is currently available */
    available: boolean;
    /** List of categories in this menu */
    categories: CategoryType[];
}

/**
 * Types for Tables and Map elements
 */

/**
 * Represents a restaurant table
 */
export interface TableType {
    /** Unique identifier for the table */
    id: number;
    /** Table number displayed to customers and staff */
    number: number;
    /** Maximum number of people the table can accommodate */
    capacity: number;
    /** Location description or identifier */
    location: string;
}

/**
 * Represents a table's visual representation on the restaurant map
 */
export interface TableMapType {
    /** Unique identifier for the table map element */
    id: number;
    /** Horizontal gap spacing */
    gapX: number;
    /** Vertical gap spacing */
    gapY: number;
    /** Rotation angle in degrees */
    angle: number;
    /** Shape of the table ("rectangle", "circle", etc.) */
    shape: string;
    /** Color of the table representation */
    color: string;
    /** Height of the table representation */
    height: number;
    /** Width of the table representation */
    width: number;
    /** X-coordinate position */
    x: number;
    /** Y-coordinate position */
    y: number;
    /** Z-index for layering */
    z: number;
    /** The actual table object this map element represents */
    table: TableType;
}

/**
 * Represents a complete restaurant floor map
 */
export interface MapType {
    /** Unique identifier for the map */
    id: number;
    /** Map name (e.g., "Ground Floor", "Terrace") */
    name: string;
    /** List of table map elements contained in this map */
    tableMap: TableMapType[];
}

/**
 * Types for Orders and related entities
 */

/**
 * Represents a customer order
 */
export interface OrderType {
    /** Unique identifier for the order */
    id: number;
    /** Total price without tax */
    totalWithoutTax: number;
    /** Total price with tax included */
    totalWithTax: number;
    /** Date and time when the order was placed */
    date: string;
    /** Current status of the order (e.g., "PENDING", "COMPLETED") */
    status: "PENDING" | "COMPLETED" | "IN_PROGRESS" | "FINISHED";
    /** Whether the order has been paid */
    paid: boolean;
    /** List of items in the order */
    orderItems: Array<OrderItemType>;
    /** The table associated with this order */
    table: TableType;
};

/**
 * Represents an individual item within an order
 */
export interface OrderItemType {
    /** Unique identifier for the order item */
    id: number;
    /** Quantity ordered */
    quantity: number;
    /** Price per unit */
    price: number;
    /** Tax percentage applied */
    tax: number;
    /** Special instructions or notes for this item */
    note: string;
    /** Current status of the order item (e.g., "PREPARING", "READY") */
    status: string;
    /** The menu item that was ordered */
    menuItem: MenuItemType;
    /** Whether this item has been completed by the kitchen */
    completed: boolean;
}

/**
 * Filter criteria for searching orders
 */
export interface OrderFiltersType {
    /** Filter by specific order ID */
    orderId?: string | number;
    /** Filter by specific table ID */
    tableId?: string | number;
    /** Filter by one or more order statuses */
    status?: string[];
    /** Filter by payment status */
    paid?: boolean;
    /** Filter for orders placed on or after this date */
    startDate?: string;
    /** Filter for orders placed on or before this date */
    endDate?: string;
}

/**
 * Types for Authentication and User Management
 */

/**
 * User roles in the system
 */
export type Role = 'ADMIN' | 'MANAGER' | 'WORKER' | 'CUSTOMER' | 'GUEST';

/**
 * Modal types for consistent styling
 */
export type MessageModalType = 'Success' | 'Error' | 'Warning' | 'Info';

/**
 * Types for Invoices and billing
 */

/**
 * Represents an invoice generated for an order
 */
export interface InvoiceType {
    /** Unique identifier for the invoice (optional for new invoices) */
    id?: number | null;
    /** Name of the customer or company */
    customer_name?: string;
    /** Tax ID or other customer identifier */
    customer_id?: string;
    /** Billing address */
    address?: string;
    /** Date when the invoice was issued */
    date: string;
    /** Amount paid by card */
    paidWithCard: number;
    /** Amount paid in cash */
    paidWithCash: number;
    /** The order this invoice is for */
    order: OrderType;
}

/**
 * Filter criteria for searching invoices
 */
export interface InvoiceFiltersType {
    /** Filter by specific invoice ID */
    invoiceId?: number;
    /** Filter by specific order ID */
    orderId?: number;
    /** Filter by table number */
    tableNumber?: number;
    /** Filter for invoices issued on or after this date */
    startDate?: string;
    /** Filter for invoices issued on or before this date */
    endDate?: string;
    /** Filter for invoices with a total amount greater than or equal to this value */
    minTotal?: number;
    /** Filter for invoices with a total amount less than or equal to this value */
    maxTotal?: number;
    /** Filter by payment method used */
    paymentType: 'all' | 'card' | 'cash' | 'mixed';
}


/**
 * Represents a user account in the system
 */
export interface User {
    /** Unique identifier for the user */
    id: string;
    /** Username for login */
    username: string;
    /** User's email address */
    email: string;
    /** User's first name (can be null) */
    firstName: string | null;
    /** User's last name (can be null) */
    lastName: string | null;
    /** User's role in the system */
    role: Role;
    /** Whether the user account is enabled */
    enabled: boolean;
    /** Date when the user account was created */
    createdAt: string;
    /** Date when the user account was last updated */
    updatedAt: string;
}

/**
 * Data structure for user registration requests
 */
export interface UserRegistrationRequest {
    /** Username for the new account */
    username: string;
    /** Email address for the new account */
    email: string;
    /** Password for the new account */
    password: string;
    /** Optional first name */
    firstName?: string;
    /** Optional last name */
    lastName?: string;
}

/**
 * Data structure for user account update requests
 */
export interface UserUpdateRequest {
    /** Updated username */
    username: string;
    /** Updated email address */
    email: string;
    /** Optional new password (only provided when changing password) */
    password?: string;
    /** Optional updated first name */
    firstName?: string;
    /** Optional updated last name */
    lastName?: string;
    /** Updated user role */
    role: Role;
    /** Updated account status */
    enabled: boolean;
}
