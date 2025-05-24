/**
 * CustomerOrderMenu.tsx
 * Customer-facing menu and ordering system for restaurant tables.
 */

// React and external libraries
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Client, IMessage } from '@stomp/stompjs';

// Icons
import { MdRestaurantMenu, MdPayment, MdSend } from 'react-icons/md';

// Context
import { useTheme } from '../context/ThemeContext';
import { useMessageModal } from '../context/MessageModalContext';
import { useQuestionModal } from '../context/QuestionModalContext';

// Types
import { InvoiceType, MenuType, OrderItemType, OrderType } from '../types';

// Components
import CustomerMenu from '../components/menu/CustomerMenu';
import CustomerOrder from '../components/orders/CustomerOrder';
import PayPalButton from '../components/payment/PayPalButton';
import ThemeSelector from '../components/global/ThemeSelector';

// API Services
import { getMenu } from '../api/menuService';
import { deleteOrder, getOrdersByFilters, postFullOrder } from '../api/orderService';
import { postInvoice } from '../api/invoiceService';

// Utilities
import { decodeId } from '../utils/obfuscate';
import config from '../config';

/**
 * CustomerOrderMenu Component
 *
 * Provides a customer-facing interface for restaurant ordering, featuring:
 * - Interactive menu browsing and item selection
 * - Real-time order management via WebSocket
 * - Order review and submission to kitchen
 * - Payment processing via PayPal integration
 * - Responsive design with animated transitions for mobile and desktop
 * - Theme customization support
 */
const CustomerOrderMenu = () => {
    // URL parameters & context hooks
    const { tableId: obfuscatedId } = useParams<{ tableId: string }>();
    const tableId = decodeId(obfuscatedId || "");
    const { showMessageModal } = useMessageModal();
    const { askQuestion } = useQuestionModal();
    const { themeColors } = useTheme();
    
    // State management
    const [menu, setMenu] = useState<MenuType>(); // Available restaurant menu
    const [order, setOrder] = useState<OrderType>(); // Current order being built
    const [showOrder, setShowOrder] = useState<boolean>(false); // Controls order panel visibility
    const [ordersToMerge, setOrdersToMerge] = useState<OrderType[]>([]); // Orders available for merging
    const [orderToPay, setOrderToPay] = useState<OrderType | null>(null); // Order selected for payment
    const [showOrderToPay, setShowOrderToPay] = useState<boolean>(false); // Controls payment panel visibility
    const [isPaypalVisible, setIsPaypalVisible] = useState(false); // Controls PayPal button visibility
    const [isLoading, setIsLoading] = useState(true); // Loading state indicator
    
    // WebSocket client reference
    const clientRef = useRef<Client | null>(null);
    
    /**
     * Load menu and prepare orders for the table on component mount
     * Fetches menu data and checks for existing unpaid orders to merge
     */
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const menuData = await getMenu();
                setMenu(menuData);
                await mergeOrders(); // Fetch any existing orders for this table
            } catch (error) {
                showMessageModal("ERROR", "There was an error loading the menu. Please try again later.");
                console.error("Error fetching menu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    /**
     * Initialize WebSocket connection for real-time order updates
     * Sets up STOMP client to subscribe to table-specific order events
     */
    useEffect(() => {
        // Prevent duplicate connections
        if (clientRef.current) return;
        
        const client = new Client({
            brokerURL: config.WS_URL,
            reconnectDelay: 5000,
            debug: (str) => console.log(str),

            onConnect: () => {
                // Subscribe to table-specific order updates
                client.subscribe(`/topic/table/${tableId}`, (message: IMessage) => {
                    const data: OrderType = JSON.parse(message.body);
                    setOrder(data);
                });

                // Register this client for the specific table
                client.publish({
                    destination: '/app/order/subscribe',
                    body: JSON.stringify({ tableId: parseInt(tableId!) }),
                });
            },

            onStompError: () => {
                showMessageModal("ERROR", "Couldn't stablish connection to the server. Please try again later.");
            },
        });
        
        clientRef.current = client;
        client.activate();

        // Clean up WebSocket connection on component unmount
        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, []);

    /**
     * Send updated order data to the server via WebSocket
     * Used when adding items to order or changing order status
     * @param order - The updated order to send to the server
     */
    const updateOrder = (order: OrderType) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: '/app/order',
                body: JSON.stringify(order),
            });
        } else {
            showMessageModal("ERROR", "Couldn't stablish connection to the server. Please try again later.");
        }
    };

    /**
     * Submit the current order to the kitchen after confirmation
     * Updates order status to IN_PROGRESS and sends to the server
     */
    const sendOrder = async () => {
        // Validate that the order contains items
        if (order?.orderItems.length === 0) {
            showMessageModal("ERROR", "You need to add at least one item to the order.");
            return;
        }
        
        // Ask for confirmation before sending
        const confirmed = await askQuestion("Do you want to send the order to the kitchen?");
        if (confirmed && order) {
            const orderToSend = {
                ...order,
                status: "IN_PROGRESS" as OrderType['status'],
                date: new Date().toISOString()
            };
            updateOrder(orderToSend);
        }
    }

    /**
     * Fetch and merge all unpaid orders for this table
     * Combines order items, calculates totals, and prepares for payment
     */
    const mergeOrders = async () => {
        try {
            // Fetch all unpaid orders for this table with eligible statuses
            const ordersToMergeData = await getOrdersByFilters({ 
                tableId: parseInt(tableId!), 
                status: ['IN_PROGRESS', 'COMPLETED'], 
                paid: false 
            });
            
            // Early return if no orders to merge
            if (ordersToMergeData.length === 0) {
                return;
            }
            
            // Calculate totals across all orders
            const subTotal = ordersToMergeData.reduce((acc, order) => acc + order.totalWithoutTax, 0);
            const total = ordersToMergeData.reduce((acc, order) => acc + order.totalWithTax, 0);
            
            // Store the orders for later deletion after payment
            setOrdersToMerge(ordersToMergeData);
            
            // Combine all order items, merging duplicates by increasing quantity
            const orderItems: OrderItemType[] = [];
            ordersToMergeData.forEach((order) => {
                order.orderItems.forEach((orderItem) => {
                    const existingItemIndex = orderItems.findIndex(
                        (item) => item.menuItem.product.id === orderItem.menuItem.product.id
                    );
                    if (existingItemIndex >= 0) {
                        orderItems[existingItemIndex].quantity += orderItem.quantity;
                    } else {
                        orderItems.push({ ...orderItem });
                    }
                });
            });

            // Create a consolidated order for payment
            const newOrder: OrderType = {
                id: 0,
                totalWithoutTax: subTotal,
                totalWithTax: total,
                date: new Date().toISOString(),
                status: ordersToMergeData[0].status,
                orderItems: orderItems,
                table: ordersToMergeData[0].table,
                paid: false
            };
            
            setOrderToPay(newOrder);

            // Note: The following commented code will be executed after payment approval
            // const newOrderData = await postFullOrder(newOrder);
            // ordersToMerge.forEach(async (o) => await deleteOrder(o.id));
        } catch (error) {
            showMessageModal("ERROR", "Couldn't complete merge action");
        }
    }

    /**
     * Process payment for the merged order
     * Called after successful PayPal payment approval
     * - Creates a consolidated order in the system
     * - Deletes the individual component orders
     * - Creates an invoice record for the payment
     * - Resets UI state after payment completion
     */
    const payOrder = async () => {
        // Create a consolidated order in the system
        const newOrderData = await postFullOrder(orderToPay!);
        
        // If successful, delete the individual orders that were merged
        if (newOrderData) {
            ordersToMerge.forEach(async (o) => await deleteOrder(o.id));
        }

        // Mark the consolidated order as paid
        const paidOrder: OrderType = {
            ...newOrderData!,
            paid: true,
        };

        // Create an invoice record for the payment
        const invoiceData: InvoiceType = {
            date: new Date().toISOString(),
            paidWithCard: newOrderData.totalWithTax * 1.0, // Full amount paid via PayPal
            paidWithCash: 0,
            order: paidOrder
        };
        await postInvoice(invoiceData);
        
        // Reset UI state after payment completion
        setOrderToPay(null);
        setShowOrderToPay(false);
        setShowOrder(false);
        setIsPaypalVisible(false);
    }

    return (
        <motion.div
            className="min-h-[100dvh] flex flex-col"
            style={{ backgroundColor: themeColors.background, color: themeColors.text }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            
            {!showOrder && !showOrderToPay &&
            <div className="absolute w-fit top-5 left-5 right-0 z-100 flex justify-start">
                <ThemeSelector />
            </div>}
            {/* Loading overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="p-6 rounded-xl bg-white shadow-2xl flex flex-col items-center"
                            style={{ backgroundColor: themeColors.background, color: themeColors.text }}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                        >
                            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4"
                                style={{ borderColor: `${themeColors.accent} transparent ${themeColors.secondary} ${themeColors.secondary}` }}
                            />
                            <p className="text-lg font-medium">Loading menu...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex flex-col md:flex-row flex-1 relative overflow-hidden">
                {/* Menu section */}
                <div className="w-full max-w-[800px] h-full overflow-y-auto">
                    {menu && (
                        <CustomerMenu
                            menu={menu}
                            order={order}
                            updateOrder={updateOrder}
                        />
                    )}
                </div>

                {/* Order section - Mobile: slides from bottom, Desktop: side panel */}
                <AnimatePresence>
                    {showOrder && (
                        <motion.div
                            className="w-full h-[100dvh] md:h-auto fixed bottom-0 left-0 md:static overflow-hidden z-10"
                            style={{
                                boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.1)',
                                borderTop: `1px solid ${themeColors.secondary}`,
                                borderLeft: `1px solid ${themeColors.secondary}`,
                                backgroundColor: themeColors.background
                            }}
                            initial={{ y: "100%", x: 0, opacity: 0.3 }}
                            animate={{ y: 0, x: 0, opacity: 1 }}
                            exit={{ y: "100%", x: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {order && (
                                <CustomerOrder
                                    order={order}
                                    updateOrder={order.status === "PENDING" ? updateOrder : undefined}
                                    onViewTableOrders={() => {
                                        setShowOrderToPay(true);
                                        setShowOrder(false);
                                    }}
                                />
                            )}

                        </motion.div>
                    )}
                    {showOrderToPay && (
                    <motion.div
                        className="w-full h-[100dvh] md:h-auto fixed bottom-0 left-0 md:static overflow-hidden z-10"
                        style={{
                            boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.1)',
                            borderTop: `1px solid ${themeColors.secondary}`,
                            borderLeft: `1px solid ${themeColors.secondary}`,
                            backgroundColor: themeColors.background
                        }}
                        initial={{ y: "100%", x: 0, opacity: 0.3 }}
                        animate={{ y: 0, x: 0, opacity: 1 }}
                        exit={{ y: "100%", x: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {orderToPay && (
                            <CustomerOrder
                                order={orderToPay}
                                updateOrder={orderToPay.status === "PENDING" ? updateOrder : undefined}
                            />
                        )}
                    </motion.div>
                )}
                </AnimatePresence>



            </div>
            {/* Action buttons */}
            <AnimatePresence>
                {order && (
                    <div className="fixed w-full bottom-5 left-1/2 transform -translate-x-1/2 z-30">
                        <div className="relative flex justify-center">
                            <motion.button
                                className='px-5 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg text-nowrap cursor-pointer z-2'
                                style={{
                                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`,
                                    color: '#ffffff',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                                }}
                                onClick={() => {
                                    setShowOrder(showOrderToPay ? false : !showOrder);
                                    setShowOrderToPay(false);
                                }}
                                initial={{ y: 100 }}
                                animate={{
                                    y: 0,
                                    x: showOrder || showOrderToPay ? -80 : 0,
                                    transition: { type: "spring", stiffness: 300, damping: 25 }
                                }}
                                exit={{ y: 100 }}
                                whileHover={{ scale: 1.05, boxShadow: '0 15px 20px -5px rgba(0, 0, 0, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {showOrder || showOrderToPay ? (
                                    <>
                                        <span>Hide</span>
                                    </>
                                ) : (
                                    <>
                                        <MdRestaurantMenu size={20} />
                                        <span>View Order</span>
                                    </>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showOrder && (
                                    <motion.button
                                        className='absolute px-5 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg text-nowrap cursor-pointer'
                                        style={{
                                            background: `linear-gradient(135deg, #22c55e, #16a34a)`,
                                            color: '#ffffff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                                        }}
                                        initial={{ opacity: 0, scale: 0.8, x: 60 }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            x: 60,
                                            transition: { type: "spring", stiffness: 300, damping: 25 }
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.8,
                                            x: 120,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileHover={{ scale: 1.05, boxShadow: '0 15px 20px -5px rgba(0, 0, 0, 0.3)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={sendOrder}
                                    >
                                        <MdSend size={18} />
                                        <span>Send Order</span>
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {showOrderToPay && (
                                    <motion.button
                                        className='absolute px-5 py-3 rounded-full flex items-center justify-center gap-2 font-bold shadow-lg text-nowrap cursor-pointer'
                                        style={{
                                            background: `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
                                            color: '#ffffff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                                        }}
                                        initial={{ opacity: 0, scale: 0.8, x: 60 }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            x: 60,
                                            transition: { type: "spring", stiffness: 300, damping: 25 }
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.8,
                                            x: 120,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileHover={{ scale: 1.05, boxShadow: '0 15px 20px -5px rgba(0, 0, 0, 0.3)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsPaypalVisible(true)}
                                    >
                                        <MdPayment size={18} />
                                        <span>Pay Order</span>
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* PayPal payment modal */}
            <PayPalButton
                paymentAmount={orderToPay?.totalWithTax || 0}
                isVisible={isPaypalVisible}
                onClose={() => setIsPaypalVisible(false)}
                onPaymentApprove={payOrder}
            />
        </motion.div>
    )
}

export default CustomerOrderMenu;