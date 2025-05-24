import { useEffect, useRef, useState } from 'react';

// Context
import { useTheme } from '../context/ThemeContext';
import { useMessageModal } from '../context/MessageModalContext';

// Types
import { OrderType } from '../types';

// Components
import KitchenOrder from '../components/orders/KitchenOrder';

// Services & Utilities
import { Client, IMessage } from '@stomp/stompjs';
import config from '../config';

/**
 * KitchenPage Component
 * 
 * Provides a real-time interface for kitchen staff to view and manage orders, featuring:
 * - Live order updates via WebSocket connection
 * - Order status management and tracking
 * - Chronological display of orders (oldest first)
 * - Item completion tracking for efficient meal preparation
 */
const KitchenPage = () => {
    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { showMessageModal } = useMessageModal();
    
    // State and refs
    const [orders, setOrders] = useState<OrderType[]>([]);
    const clientRef = useRef<Client | null>(null); // WebSocket client reference

    /**
     * Initialize WebSocket connection for real-time order updates
     * Sets up STOMP client to subscribe to kitchen order events
     */
    useEffect(() => {
        // Prevent duplicate connections
        if (clientRef.current) return;
        
        const client = new Client({
            brokerURL: config.WS_URL,
            reconnectDelay: 5000,
            debug: (str) => console.log(str),

            onConnect: () => {
                // Subscribe to receive all in-progress orders
                client.subscribe('/topic/kitchen/orders', (message: IMessage) => {
                    const data: OrderType[] = JSON.parse(message.body);
                    // Sort orders chronologically (oldest first)
                    const sortedOrders = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setOrders(sortedOrders);
                });

                // Subscribe to kitchen updates
                client.publish({
                    destination: '/app/kitchen/subscribe',
                    body: JSON.stringify({}),
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
     * Used when kitchen staff marks items as complete or changes order status
     * @param order - The updated order to send to the server
     */
    const sendUpdate = (order: OrderType) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: '/app/kitchen',
                body: JSON.stringify(order),
            });
        } else {
            showMessageModal("ERROR", "Couldn't stablish connection to the server. Please try again later.");
        }
    };

    /**
     * Renders the kitchen order management interface
     * Displays all in-progress orders chronologically
     */
    return (
        <div className='w-full h-full p-4 flex items-center justify-center'>
            <div
                className="w-full h-full p-5 rounded-lg flex flex-wrap gap-5 items-center justify-center overflow-auto"
                style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: themeColors.secondary
                }}
            >   
                {orders?.length === 0 && <h1 className='text-2xl font-bold'>No orders found</h1>}
                {orders?.map((order) => (
                    <KitchenOrder 
                        key={order.id} 
                        order={order} 
                        editMode={false} 
                        kitchen={true} 
                        sendUpdate={sendUpdate} 
                    />
                ))}
            </div>
        </div>
    );
}

export default KitchenPage;