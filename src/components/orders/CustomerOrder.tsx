import React from "react";
import { motion } from "motion/react";
import { MdAdd, MdRemove, MdDelete, MdHistory, MdShoppingCart, MdReceipt } from "react-icons/md";

// Context
import { useTheme } from "../../context/ThemeContext";

// Types
import { OrderType } from "../../types";

/**
 * Props for the CustomerOrder component
 * @interface OrderProps
 */
interface OrderProps {
    /** The order data to display */
    order: OrderType;
    /** Callback function to update the order (optional, enables edit mode when provided) */
    updateOrder?: (order: OrderType) => void;
    /** Callback function to view all orders for this table (optional) */
    onViewTableOrders?: () => void;
}

/**
 * CustomerOrder Component
 * 
 * Customer-facing view of an order with items, status, and totals.
 * Supports editing item quantities when updateOrder callback is provided.
 * Displays order information in a visually appealing, responsive layout.
 *
 * @param {OrderProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const Order: React.FC<OrderProps> = ({ order, updateOrder, onViewTableOrders }) => {
    // Theme setup
    const { themeColors } = useTheme();

    /**
     * Changes the quantity of an order item and updates the order
     * Removes items with zero quantity
     * 
     * @param {number} itemId - ID of the order item to modify
     * @param {number} newQuantity - New quantity for the item
     */
    const changeQuantity = (itemId: number, newQuantity: number) => {
        if (updateOrder) {
            const updatedOrder = {
                ...order,
                orderItems: order.orderItems.map((item) =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                ).filter(item => item.quantity > 0)
            };
            updateOrder(updatedOrder);
        }
    };

    return (
        <motion.div
            className="w-full h-full min-h-screen md:min-h-0 flex flex-col items-center p-4 overflow-hidden"
            style={{ backgroundColor: themeColors.background, color: themeColors.text }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            {/* Header with order title and table information */}
            <motion.div
                className="w-full max-w-2xl flex flex-row sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-10 h-10 flex items-center justify-center rounded-lg"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.accent} 20%, ${themeColors.background})`,
                            color: themeColors.accent
                        }}
                    >
                        <MdShoppingCart size={24} />
                    </div>
                    <h1
                        className="text-2xl font-bold tracking-tight"
                        style={{
                            background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.accent})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}
                    >
                        {order.id !== 0 ? `Order #${order.id}` : 'Payment Pending'}
                    </h1>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <motion.span
                        className="text-sm px-2 py-1 rounded-full"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.secondary} 15%, ${themeColors.background})`,
                            color: themeColors.secondary,
                            border: `1px solid color-mix(in srgb, ${themeColors.secondary} 30%, ${themeColors.background})`
                        }}
                        whileHover={{ scale: 1.05 }}
                    >
                        Table #{order.table.number}
                    </motion.span>
                    {updateOrder && onViewTableOrders && (
                        <motion.button
                            onClick={() => onViewTableOrders()}
                            className="flex items-center gap-1 px-3 py-1 text-sm rounded-full"
                            style={{
                                background: `color-mix(in srgb, ${themeColors.accent} 15%, ${themeColors.background})`,
                                color: themeColors.accent,
                                border: `1px solid color-mix(in srgb, ${themeColors.accent} 30%, ${themeColors.background})`
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <MdHistory size={16} />
                            <span className="hidden sm:inline">Table History</span>
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Main order container with item list and totals */}
            <motion.div
                className="w-full max-w-2xl p-5 md:p-6 rounded-xl shadow-lg select-none md:h-auto"
                style={{
                    backgroundColor: `color-mix(in srgb, ${themeColors.background} 98%, ${themeColors.secondary})`,
                    color: themeColors.text,
                    border: `1px solid color-mix(in srgb, ${themeColors.secondary} 30%, ${themeColors.background})`,
                    boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            >
                {/* Order status and date information */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{
                                backgroundColor: order.status === 'COMPLETED' ? '#10B981' :
                                    order.status === 'IN_PROGRESS' ? '#F59E0B' :
                                        order.status === 'PENDING' ? '#6366F1' : '#EF4444'
                            }}
                        />
                        <p>
                            <span className="font-medium">Status:</span>
                            <span className="ml-1" 
                                  style={{ 
                                      color: `color-mix(in srgb, ${themeColors.text} 75%, ${themeColors.secondary})`,
                                      letterSpacing: "0.01em"
                                  }}>
                                {order.status.replace('_', ' ').toLowerCase()}
                            </span>
                        </p>
                    </div>
                    <p>
                        <span className="font-medium">Date:</span>
                        <span className="ml-1" 
                              style={{ 
                                  color: `color-mix(in srgb, ${themeColors.text} 75%, ${themeColors.secondary})`,
                                  letterSpacing: "0.01em"
                              }}>
                            {new Date(order.date).toLocaleString()}
                        </span>
                    </p>
                </div>

                <div
                    className="h-px w-full my-4"
                    style={{
                        background: `linear-gradient(to right, transparent, ${themeColors.secondary}, transparent)`,
                        opacity: 0.3
                    }}
                />

                {/* Order items list with quantity controls */}
                <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                        <MdReceipt size={20} style={{ color: themeColors.accent }} />
                        <h3 className="text-lg font-semibold" 
                           style={{ 
                               color: themeColors.primary,
                               textShadow: "0px 0.5px 0px rgba(0,0,0,0.05)"
                           }}>
                            Order Items
                        </h3>
                    </div>

                    <div className="rounded-lg overflow-hidden" style={{
                        border: `1px solid color-mix(in srgb, ${themeColors.secondary} 15%, ${themeColors.background})`
                    }}>
                        <div className="space-y-0 text-sm overflow-y-auto max-h-[40dvh]">
                            {order.orderItems.length > 0 ? (
                                order.orderItems.map((orderItem, index) => (
                                    <motion.div
                                        key={orderItem.id}
                                        className={`
                                            flex justify-between items-center p-3
                                            ${index !== order.orderItems.length - 1 ? 'border-b' : ''}
                                        `}
                                        style={{
                                            borderColor: `color-mix(in srgb, ${themeColors.secondary} 15%, ${themeColors.background})`,
                                            backgroundColor: index % 2 === 0 ?
                                                `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.primary})` :
                                                `color-mix(in srgb, ${themeColors.background} 99%, ${themeColors.primary})`
                                        }}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{
                                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`
                                        }}
                                    >
                                        <div className={`flex-grow ${!updateOrder && 'flex items-center justify-between gap-2'}`}>
                                            <div className="flex items-center gap-2">
                                                {!updateOrder &&
                                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full"
                                                        style={{
                                                            backgroundColor: `color-mix(in srgb, ${themeColors.accent} 15%, ${themeColors.background})`,
                                                            color: themeColors.accent
                                                        }}
                                                    >
                                                        {orderItem.quantity}
                                                    </span>
                                                }
                                                <p className="font-medium" 
                                                   style={{ 
                                                       textShadow: "0px 0.5px 0px rgba(0,0,0,0.03)",
                                                       color: themeColors.primary
                                                   }}>
                                                    {orderItem.menuItem.product.name}
                                                </p>
                                            </div>
                                            <p className="text-xs mt-1" 
                                               style={{ 
                                                   color: `color-mix(in srgb, ${themeColors.text} 75%, ${themeColors.secondary})`,
                                                   letterSpacing: "0.01em"
                                               }}>
                                                {orderItem.price.toFixed(2)} € per unit
                                            </p>
                                        </div>

                                        {updateOrder && (
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    className="p-1 rounded-full transition-all"
                                                    style={{
                                                        color: "#f87171",
                                                        background: `color-mix(in srgb, #f87171 15%, ${themeColors.background})`
                                                    }}
                                                    onClick={() => changeQuantity(orderItem.id, 0)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <MdDelete size={18} />
                                                </motion.button>

                                                <div className="flex items-center gap-1 rounded-lg px-1 py-0.5"
                                                    style={{
                                                        background: `color-mix(in srgb, ${themeColors.secondary} 10%, ${themeColors.background})`,
                                                        border: `1px solid color-mix(in srgb, ${themeColors.secondary} 20%, ${themeColors.background})`
                                                    }}
                                                >
                                                    <motion.button
                                                        className="p-1 rounded-full"
                                                        style={{ color: themeColors.secondary }}
                                                        onClick={() => changeQuantity(orderItem.id, orderItem.quantity - 1)}
                                                        whileHover={{ scale: 1.1, color: themeColors.primary }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <MdRemove size={16} />
                                                    </motion.button>

                                                    <span className="font-semibold w-6 text-center text-sm">
                                                        {orderItem.quantity}
                                                    </span>

                                                    <motion.button
                                                        className="p-1 rounded-full"
                                                        style={{ color: themeColors.accent }}
                                                        onClick={() => changeQuantity(orderItem.id, orderItem.quantity + 1)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <MdAdd size={16} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-4 text-center" 
                                     style={{ 
                                         color: `color-mix(in srgb, ${themeColors.text} 70%, ${themeColors.secondary})`,
                                         letterSpacing: "0.01em",
                                         opacity: 0.9
                                     }}>
                                    <p>No items in this order yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order total calculation summary */}
                <motion.div
                    className=" pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div
                        className="h-px w-full mb-4"
                        style={{
                            background: `linear-gradient(to right, transparent, ${themeColors.accent}, transparent)`,
                            opacity: 0.3
                        }}
                    />

                    <div className="text-sm space-y-2 rounded-lg p-3"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.accent})`,
                            border: `1px solid color-mix(in srgb, ${themeColors.accent} 20%, ${themeColors.background})`
                        }}
                    >
                        <p className="flex justify-between items-center">
                            <span className="font-medium" style={{ color: `color-mix(in srgb, ${themeColors.text} 90%, ${themeColors.secondary})` }}>Subtotal:</span>
                            <span className="font-medium" style={{ color: `color-mix(in srgb, ${themeColors.text} 90%, ${themeColors.primary})` }}>{order.totalWithoutTax.toFixed(2)} €</span>
                        </p>
                        <div
                            className="h-px w-full my-2"
                            style={{
                                background: `linear-gradient(to right, transparent, ${themeColors.secondary}, transparent)`,
                                opacity: 0.2
                            }}
                        />
                        <p className="flex justify-between items-center">
                            <span className="font-bold" style={{ color: `color-mix(in srgb, ${themeColors.text} 95%, ${themeColors.accent})` }}>Total (with tax):</span>
                            <span
                                className="text-lg font-bold"
                                style={{ 
                                    color: themeColors.accent,
                                    textShadow: "0 1px 1px rgba(0,0,0,0.15)",
                                    letterSpacing: "0.01em"
                                }}
                            >
                                {order.totalWithTax.toFixed(2)} €
                            </span>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Order;