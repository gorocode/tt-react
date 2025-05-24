/**
 * MobileKitchenPage.tsx
 * Mobile-optimized version of the KitchenPage for kitchen staff to manage orders.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useMessageModal } from '../../context/MessageModalContext';

// Types
import { OrderType } from '../../types';

// Components
import KitchenOrder from '../../components/orders/KitchenOrder';
import MobilePageWrapper from '../../components/global/MobilePageWrapper';

// Services & Utilities
import { Client, IMessage } from '@stomp/stompjs';
import config from '../../config';

// Icons
import { MdRefresh } from 'react-icons/md';

/**
 * MobileKitchenPage Component
 * 
 * Mobile-optimized interface for kitchen staff to view and manage orders, featuring:
 * - Vertically stacked layout optimized for mobile screens
 * - Live order updates via WebSocket connection
 * - Touch-friendly controls with larger tap targets
 * - Order status management optimized for mobile interaction
 */
const MobileKitchenPage = () => {
    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { showMessageModal } = useMessageModal();
    
    // State and refs
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null); // WebSocket client reference

    /**
     * Initialize WebSocket connection for real-time order updates
     */
    useEffect(() => {
        // Prevent duplicate connections
        if (clientRef.current) return;
        
        connectWebSocket();

        // Clean up WebSocket connection on component unmount
        return () => {
            if (clientRef.current && clientRef.current.connected) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    /**
     * Establish WebSocket connection to server
     */
    const connectWebSocket = () => {
        const client = new Client({
            brokerURL: config.WS_URL,
            reconnectDelay: 5000,
            debug: (str) => console.log(str),

            onConnect: () => {
                setIsConnected(true);
                
                // Subscribe to receive all in-progress orders
                client.subscribe('/topic/kitchen/orders', (message: IMessage) => {
                    const data: OrderType[] = JSON.parse(message.body);
                    // Sort orders chronologically (oldest first)
                    const sortedOrders = data.sort((a, b) => {
                        if (!a.date || !b.date) return 0;
                        return new Date(a.date).getTime() - new Date(b.date).getTime();
                    });
                    setOrders(sortedOrders);
                });

                // Subscribe to kitchen updates
                client.publish({
                    destination: '/app/kitchen/subscribe',
                    body: JSON.stringify({}),
                });
            },

            onStompError: () => {
                setIsConnected(false);
                showMessageModal("ERROR", "Couldn't establish connection to the server. Please try again later.");
            },
            
            onDisconnect: () => {
                setIsConnected(false);
            }
        });
        
        clientRef.current = client;
        client.activate();
    };

    /**
     * Manually reconnect to the WebSocket server
     */
    const handleReconnect = () => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.deactivate();
        }
        
        showMessageModal("INFO", "Reconnecting to server...");
        connectWebSocket();
    };

    /**
     * Send updated order data to the server via WebSocket
     */
    const sendUpdate = (order: OrderType) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: '/app/kitchen',
                body: JSON.stringify(order),
            });
        } else {
            showMessageModal("ERROR", "Couldn't establish connection to the server. Please try again later.");
        }
    };

    /**
     * Refresh button for the header
     */
    const RefreshButton = (
        <motion.button
            onClick={handleReconnect}
            className="p-2 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400 }}
            style={{ 
                color: isConnected ? themeColors.text : "#f44336"
            }}
        >
            <MdRefresh size={24} />
        </motion.button>
    );

    return (
        <MobilePageWrapper title="Kitchen Orders" headerAction={RefreshButton}>
            {/* Connection status indicator */}
            <div 
                className="mb-4 py-2 px-4 rounded-lg flex items-center justify-between"
                style={{ 
                    backgroundColor: isConnected ? `${themeColors.accent}15` : "#ffebee",
                    borderLeft: `4px solid ${isConnected ? themeColors.accent : "#f44336"}`
                }}
            >
                <span 
                    className="text-sm font-medium"
                    style={{ color: isConnected ? themeColors.text : "#d32f2f" }}
                >
                    {isConnected ? "Connected to kitchen" : "Disconnected"}
                </span>
                <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: isConnected ? "#4caf50" : "#f44336" }}
                ></div>
            </div>
            
            {/* Orders list */}
            <div className="flex flex-col gap-4 pb-4">
                {orders?.length === 0 ? (
                    <div 
                        className="border rounded-lg p-8 text-center"
                        style={{ 
                            borderColor: `${themeColors.secondary}25`,
                            color: `${themeColors.text}80` 
                        }}
                    >
                        <h2 className="text-xl font-medium mb-2">No orders found</h2>
                        <p>Kitchen orders will appear here when customers place orders</p>
                    </div>
                ) : (
                    orders?.map((order) => (
                        <div 
                            key={order.id}
                            className="border rounded-lg overflow-hidden"
                            style={{ borderColor: `${themeColors.secondary}25` }}
                        >
                            <KitchenOrder 
                                order={order} 
                                editMode={false} 
                                kitchen={true} 
                                sendUpdate={sendUpdate} 
                            />
                        </div>
                    ))
                )}
            </div>
        </MobilePageWrapper>
    );
};

export default MobileKitchenPage;
