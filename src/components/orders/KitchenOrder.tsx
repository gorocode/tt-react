import React, { useEffect, useState } from "react";

// Context
import { useTheme } from "../../context/ThemeContext";
import { useQuestionModal } from "../../context/QuestionModalContext";

// Types
import { OrderType } from "../../types";

/**
 * Props for the KitchenOrder component
 * @interface OrderProps
 */
interface OrderProps {
    /** The order data to display and manage */
    order: OrderType;
    /** Whether the order is in edit mode */
    editMode: boolean;
    /** Whether the order is displayed in the kitchen view */
    kitchen: boolean;
    /** Callback function to send order updates to the server */
    sendUpdate?: (order: OrderType) => void;
}

/**
 * KitchenOrder Component
 * 
 * Displays a kitchen-friendly view of an order with its items.
 * Allows kitchen staff to mark items as completed and manages order status.
 * Provides visual indicators for completed vs pending items.
 *
 * @param {OrderProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const KitchenOrder: React.FC<OrderProps> = ({ order, sendUpdate }) => {
    // Theme, modal, and state setup
    const { themeColors } = useTheme();
    const { askQuestion } = useQuestionModal();
    const [sortedItems, setSortedItems] = useState(order.orderItems);

    /**
     * Sort order items to show incomplete items first
     * Re-sorts whenever order items change
     */
    useEffect(() => {
        const sortedItems = order.orderItems.sort((a, b) => {
            if (a.completed === b.completed) {
                return 0;
            }
            return a.completed ? 1 : -1;
        });
        setSortedItems(sortedItems);
    }, [order.orderItems]);

    /**
     * Toggle completion status of an order item
     * Prompts to complete the entire order if all items become completed
     * 
     * @param {number} orderItemId - ID of the order item to toggle
     */
    const completeItem = (orderItemId: number) => {
        const updatedOrder = {
            ...order,
            orderItems: order.orderItems.map((item) =>
                item.id === orderItemId ? { ...item, completed: !item.completed } : item
            ),
        };
        const allItemsCompleted = updatedOrder.orderItems.every(item => item.completed);

        if (allItemsCompleted) {
            completeOrder();
        }

        if (sendUpdate) {
            sendUpdate(updatedOrder);
        }
    }

    /**
     * Prompts for confirmation and then marks the entire order as completed
     * Sets paid orders to FINISHED instead of COMPLETED
     */
    const completeOrder = async () => {
        const confirmed = await askQuestion(`Do you want to complete order #${order.id}`);
        if (confirmed) {
            const updatedOrder = {
                ...order,
                status: order.paid ? 'FINISHED' as OrderType['status'] : 'COMPLETED' as OrderType['status'] ,
            };

            if (sendUpdate) {
                sendUpdate(updatedOrder);
            }
        }
    }

    return (
        <div
            className="w-[350px] mx-auto p-6 border rounded-lg shadow-md font-mono"
            style={{
                backgroundColor: themeColors.background,
                color: themeColors.text,
                borderColor: themeColors.secondary
            }}
        >
            {/* Order header with table number and order ID */}
            <div className="text-center mb-4">
                <h1 className="text-2xl font-extrabold">
                    Table #{order.table.number}
                </h1>
                <p className="text-sm" style={{ color: themeColors.accent }}>Order #{order.id}</p>
            </div>

            <hr className="border-dashed my-4" style={{ borderColor: themeColors.secondary }} />

            {/* List of order items with completion status */}
            <div className="space-y-3 text-sm h-[250px] overflow-y-auto">
                {sortedItems.map((orderItem) => (
                    <div
                        key={orderItem.id}
                        className={`flex justify-between items-center p-3 rounded-lg shadow-sm transition-all duration-200 ${orderItem.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            } hover:shadow-md`}
                        onClick={() => completeItem(orderItem.id)}
                    >
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold">{orderItem.quantity}x</span>
                            <p className="font-medium">{orderItem.menuItem.product.name}</p>
                        </div>
                        <span className={`text-xs font-bold ${orderItem.completed ? 'text-green-600' : 'text-gray-500'}`}>
                            {orderItem.completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                ))}
            </div>

            <hr className="border-dashed my-4" style={{ borderColor: themeColors.secondary }} />

            {/* Order timestamp footer */}
            <div className="text-center">
                <p className="text-sm" style={{ color: themeColors.accent }}>
                    {new Date(order.date).toLocaleString()}
                </p>
            </div>
        </div>

    );
};

export default KitchenOrder;