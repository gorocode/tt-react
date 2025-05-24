/**
 * MobileOrdersPage.tsx
 * Mobile-optimized version of the OrdersPage for managing restaurant orders.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useMessageModal } from '../../context/MessageModalContext';
import { useQuestionModal } from '../../context/QuestionModalContext';
import MobilePageWrapper from '../../components/global/MobilePageWrapper';
import {
    OrderType,
    OrderItemType,
    TableMapType,
    MapType,
    MenuType,
    OrderFiltersType,
    MenuItemType
} from '../../types';
import { BiSolidEdit } from 'react-icons/bi';
import { FaMap } from 'react-icons/fa';
import { AiOutlineMergeCells } from 'react-icons/ai';
import { MdAdd, MdFilterList, MdArrowBack, MdClose } from 'react-icons/md';
import Map from '../../components/map/Map';
import MobileOrderFilters from '../../components/orders/MobileOrderFilters';
import { getOrdersByFilters, deleteOrder, putOrder, postOrder } from '../../api/orderService';
import { getMenu } from '../../api/menuService';
import Order from '../../components/orders/Order';
import { Client, IMessage } from '@stomp/stompjs';
import config from '../../config';
import { getAllMaps } from '../../api/mapService';
import useResponsiveStage from '../../utils/useResponsiveStage';

/**
 * MobileOrdersPage component
 * 
 * Mobile-optimized interface for managing restaurant orders, featuring:
 * - Vertical layout optimized for touch interaction
 * - Collapsible sections for filters, map, and actions
 * - Large touch targets for improved mobile UX
 * - Maintains all functionality of the desktop version
 */
const MobileOrdersPage = () => {
    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { showMessageModal } = useMessageModal();
    const { askQuestion } = useQuestionModal();

    // Orders state
    const [orders, setOrders] = useState<OrderType[]>();
    const [selectedOrder, setSelectedOrder] = useState<OrderType>();
    const selectedOrderRef = useRef<OrderType | null>(null);

    // Menu state
    const [menu, setMenu] = useState<MenuType>();

    // UI mode state
    const [editMode, setEditMode] = useState(false);
    const [isMerging, setIsMerging] = useState<boolean>(false);
    const [ordersToMerge, setOrdersToMerge] = useState<OrderType[]>([]);

    // Map and table state
    const [map, setMap] = useState<MapType>({
        name: '',
        id: 0,
        tableMap: []
    });
    const [maps, setMaps] = useState<MapType[]>([]);
    const [selectedTableMap, setSelectedTableMap] = useState<TableMapType>();
    const [isMapSelectorVisible, setIsMapSelectorVisible] = useState(true);
    const [orderToChangeTable, setOrderToChangeTable] = useState<number | null>(null);

    // Filters state
    const [filters, setFilters] = useState<OrderFiltersType>({ status: ['IN_PROGRESS'] });
    const [showFilters, setShowFilters] = useState(false);

    // UI state for mobile
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // WebSocket client reference
    const clientRef = useRef<Client | null>(null);

    // Responsive layout utilities for consistent map scaling
    const { containerRef, scaleFactor, isPortrait } = useResponsiveStage(800, 800);

    /**
     * Toggles the edit mode for orders
     */
    const handleToggleEditMode = () => {
        if (isMerging) {
            showMessageModal("ERROR", "Can't edit while merging");
            return;
        }

        setEditMode(!editMode);
        setOrderToChangeTable(null);
        showMessageModal("INFO", editMode ? "Edit Mode: Deactivated" : "Edit Mode: Activated");
    };

    /**
     * Toggles the merge mode for combining orders
     */
    const handleToggleMergeMode = () => {
        if (ordersToMerge.length > 1) {
            mergeOrders();
            return;
        }
        if (editMode) {
            showMessageModal("ERROR", "Can't merge while editing");
            return;
        }

        setIsMerging(!isMerging);
        setOrdersToMerge([]);
        showMessageModal("INFO", isMerging ? "Merge Mode: Deactivated" : "Merge Mode: Select orders to merge");
    };

    /**
     * Initialize WebSocket connection for real-time order updates
     */
    useEffect(() => {
        if (clientRef.current) return;

        const client = new Client({
            brokerURL: config.WS_URL,
            reconnectDelay: 5000,
            debug: (str) => console.log(str),

            onConnect: () => {
                client.subscribe('/topic/kitchen/orders', (message: IMessage) => {
                    const data: OrderType[] = JSON.parse(message.body);
                    // Update selected order if it exists in the new data
                    const currentOrder = selectedOrderRef.current;
                    if (currentOrder) {
                        const foundOrder: OrderType | undefined = data.find((o) => o.id === currentOrder.id);
                        if (foundOrder) setSelectedOrder(foundOrder);
                    }
                });

                client.publish({
                    destination: '/app/kitchen/subscribe',
                    body: JSON.stringify({}),
                });
            },

            onStompError: () => {
                showMessageModal("ERROR", "Couldn't establish connection to the server. Please try again later.");
            },
        });
        clientRef.current = client;
        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, []);

    /**
     * Load maps and menu data on component mount
     */
    useEffect(() => {
        const fetchMaps = async () => {
            const mapsData = await getAllMaps();
            setMaps(mapsData);
            if (mapsData.length > 0) {
                setMap(mapsData[0]);
            }
        };

        const fetchMenu = async () => {
            const menuData = await getMenu();
            setMenu(menuData);
        };

        fetchMaps();
        fetchMenu();
    }, []);

    /**
     * Fetch orders based on current filters
     */
    useEffect(() => {
        const fetchOrders = async () => {
            const ordersData = await getOrdersByFilters(filters);
            setOrders(ordersData);
        };

        fetchOrders();
    }, [filters]);

    /**
     * Update reference to selected order for WebSocket updates
     */
    useEffect(() => {
        selectedOrderRef.current = selectedOrder || null;
    }, [selectedOrder]);

    useEffect(() => {
        if (selectedTableMap) {
            setFilters({
                ...filters,
                tableId: selectedTableMap.table.id,
                status: ['IN_PROGRESS', 'PENDING', 'COMPLETED']
            });
        }
    }, [selectedTableMap]);

    /**
     * Handle order updates
     */
    const handleUpdateOrder = async (updatedOrder: OrderType) => {
        await putOrder(updatedOrder);
        if (orders) {
            setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        }
        setSelectedOrder(updatedOrder);
    };

    /**
     * Handle order deletion
     */
    const handleDeleteOrder = async (orderId: number) => {
        const confirmed = await askQuestion("Are you sure you want to delete this order?");
        if (confirmed) {

            await deleteOrder(orderId);
            if (orders) {
                setOrders(orders.filter(o => o.id !== orderId));
            }
            setSelectedOrder(undefined);
            showMessageModal("SUCCESS", "Order deleted successfully.");

        }
    };

    /**
     * Handle order selection
     */
    const handleSelectOrder = (order: OrderType) => {
        if (isMerging) {
            handleOrderToMerge(order);
            return;
        }

        if (orderToChangeTable !== null) {
            if (!selectedTableMap) {
                showMessageModal("ERROR", "Please select a table first");
                return;
            }

            handleChangeOrderTable(orderToChangeTable, selectedTableMap.id);
            setOrderToChangeTable(null);
            setSelectedTableMap(undefined);
            return;
        }

        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    /**
     * Handle adding order to merge list
     */
    const handleOrderToMerge = (order: OrderType) => {
        if (ordersToMerge.find(o => o.id === order.id)) {
            setOrdersToMerge(ordersToMerge.filter(o => o.id !== order.id));
        } else {
            setOrdersToMerge([...ordersToMerge, order]);
        }
    };

    /**
     * Merge selected orders
     */
    const mergeOrders = async () => {
        if (ordersToMerge.length < 2) {
            showMessageModal("ERROR", "Please select at least two orders to merge");
            return;
        }

        const mainOrder = ordersToMerge[0];
        const otherOrders = ordersToMerge.slice(1);

        let mergedOrderItems: OrderItemType[] = [...mainOrder.orderItems];

        otherOrders.forEach(order => {
            order.orderItems.forEach(item => {
                // Check for matching menu item without relying on non-existent properties
                const existingItem = mergedOrderItems.find(i =>
                    i.menuItem.id === item.menuItem.id &&
                    i.note === item.note
                );

                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    mergedOrderItems.push(item);
                }
            });
        });

        const mergedOrder: OrderType = {
            ...mainOrder,
            orderItems: mergedOrderItems
        };
        await putOrder(mergedOrder);

        for (const order of otherOrders) {
            await deleteOrder(order.id);
        }
        const updatedOrders = await getOrdersByFilters(filters);
        setOrders(updatedOrders);

        setIsMerging(false);
        setOrdersToMerge([]);
        showMessageModal("SUCCESS", "Orders merged successfully");
    };

    const handleChangeOrderTable = async (orderId: number, tableId: number) => {
        const orderToUpdate = orders?.find(o => o.id === orderId);
        if (!orderToUpdate) return;

        // Find the table object that corresponds to this ID
        const tableObj = map?.tableMap.find(tm => tm.table.id === tableId)?.table;

        if (!tableObj) {
            showMessageModal("ERROR", "Table not found");
            return;
        }

        const updatedOrder: OrderType = {
            ...orderToUpdate,
            table: tableObj
        };

        await putOrder(updatedOrder);
        if (orders) {
            setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        }
        showMessageModal("SUCCESS", "Order table updated successfully");
    };

    /**
     * Creates a new order for the selected table and shows the menu
     */
    const handleCreateOrder = async () => {
        if (isMerging) {
            showMessageModal("ERROR", "Can't create order while merging");
            return;
        }

        // Create a new order
        if (selectedTableMap) {
            const newOrder: OrderType = await postOrder(selectedTableMap.table.id);
            setSelectedOrder(newOrder);
            setOrderToChangeTable(null);
            setEditMode(true);
            if (orders) setOrders([...orders, newOrder]);
            // Update local state
            const updatedOrders = await getOrdersByFilters(filters);
            setOrders(updatedOrders);        
            // Show the menu to add items
            setShowOrderDetail(true);
            setEditMode(true);
            
            showMessageModal('SUCCESS', 'New order created');
        } else {
            showMessageModal("INFO", "Please select a table on the map to create an order.");
        }
        

    };

    const handleAddMenuItemToOrder = async (menuItem: MenuItemType) => {
        // Add menu item to order with default quantity 1
        const quantity = 1;

        if (selectedOrder) {
            // Add to existing order
            const existingItem = selectedOrder.orderItems.find(item =>
                item.menuItem.id === menuItem.id
            );

            let updatedOrderItems;
            if (existingItem) {
                updatedOrderItems = selectedOrder.orderItems.map(item => {
                    if (item.id === existingItem.id) {
                        return {
                            ...item,
                            quantity: item.quantity + quantity
                        };
                    }
                    return item;
                });
            } else {
                // Create a new order item
                const newOrderItem: OrderItemType = {
                    id: Math.floor(Math.random() * 1000000),
                    menuItem,
                    quantity,
                    note: '',
                    price: menuItem.price,
                    tax: 0,
                    status: 'pending',
                    completed: false
                };

                updatedOrderItems = [...selectedOrder.orderItems, newOrderItem];
            }

            const updatedOrder = {
                ...selectedOrder,
                orderItems: updatedOrderItems
            };

            await putOrder(updatedOrder);
            
            // Update the selected order
            setSelectedOrder(updatedOrder);

            // Refresh orders
            getOrdersByFilters(filters).then(setOrders);
            // Show success notification
            showMessageModal('SUCCESS', 'Item added to order');
        }
    }

    /**
     * Filter action button to add to header
     */
    const FilterButton = (
        <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-full flex items-center justify-center relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
                backgroundColor: showFilters ? themeColors.accent : 'transparent',
                color: showFilters ? themeColors.background : themeColors.text
            }}
        >
            <MdFilterList size={24} />
            {/* Badge showing active filter count */}
            {Object.keys(filters).length > 1 && (
                <span 
                    className="absolute -top-1 -right-1 w-4 h-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white font-bold"
                >
                    {Object.keys(filters).length - 1}
                </span>
            )}
        </motion.button>
    );

    return (
        <MobilePageWrapper title="Orders" headerAction={FilterButton}>
            {/* Filters panel - full screen modal on mobile */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="w-full max-w-md max-h-[90vh] overflow-auto rounded-lg shadow-xl"
                        >
                            <div className="flex items-center justify-between p-4 border-b"
                                style={{ 
                                    backgroundColor: themeColors.background,
                                    color: themeColors.text,
                                    borderColor: `${themeColors.secondary}25`
                                }}
                            >
                                <h2 className="text-lg font-semibold">Filter Orders</h2>
                                <motion.button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <MdClose size={20} />
                                </motion.button>
                            </div>
                            <MobileOrderFilters 
                                filters={filters} 
                                setFilters={setFilters} 
                                onClose={() => setShowFilters(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <motion.button
                    onClick={handleToggleEditMode}
                    className={`btn btn-icon ${editMode ? 'btn-primary' : 'btn-outline-accent'} btn-with-icon-animation flex items-center gap-2 py-2 px-3 rounded-lg`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <BiSolidEdit size={20} />
                </motion.button>

                <motion.button
                    onClick={handleToggleMergeMode}
                    className={`btn btn-icon ${isMerging ? 'btn-primary' : 'btn-outline-accent'} btn-with-icon-animation flex items-center gap-2 py-2 px-3 rounded-lg`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <AiOutlineMergeCells size={20} />
                </motion.button>

                <motion.button
                    onClick={() => setIsMapSelectorVisible(!isMapSelectorVisible)}
                    className={`btn btn-icon ${isMapSelectorVisible ? 'btn-primary' : 'btn-outline-accent'} btn-with-icon-animation flex items-center gap-2 py-2 px-3 rounded-lg`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <FaMap size={20} />
                </motion.button>

                <motion.button
                    onClick={handleCreateOrder}
                    className={`btn btn-icon btn-outline-accent btn-with-icon-animation flex items-center gap-2 py-2 px-3 rounded-lg`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <MdAdd size={24} />
                </motion.button>
            </div>

            {/* Map selector */}
            <AnimatePresence>
                {isMapSelectorVisible && maps && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="border rounded-lg overflow-hidden mb-2 h-2/5"
                            style={{
                                borderColor: `${themeColors.secondary}25`
                            }}
                        >
                            {/* Map Selector */}

                            <div className="mb-2 border rounded-lg px-2 py-1" style={{ borderColor: `${themeColors.secondary}25` }}>
                                <label
                                    htmlFor="mapSelector"
                                    className="block mb-1 text-sm font-medium"
                                    style={{ color: themeColors.text }}
                                >
                                    Select Map
                                </label>
                                <select
                                    className="w-full p-2 rounded-lg border text-base"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        color: themeColors.text,
                                        borderColor: `${themeColors.secondary}50`
                                    }}
                                    value={map?.id || ""}
                                    onChange={(e) => {
                                        const selectedMap = maps.find(m => m.id === parseInt(e.target.value));
                                        if (selectedMap) setMap(selectedMap);
                                    }}
                                >
                                    {maps.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Top half - Map area */}
                            <div className="border max-h-[400px] rounded-lg overflow-hidden mb-2 h-2/5"
                                style={{
                                    borderColor: `${themeColors.secondary}25`
                                }}
                            >
                                {map ? (
                                    <div className="max-h-[400px] flex flex-col items-center">
                                        <div className="w-full p-2 font-medium flex justify-between items-center"
                                            style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.text }}
                                        >
                                            <span>Floor Map</span>
                                        </div>

                                        {/* Map Container */}
                                        <div
                                            ref={containerRef}
                                            className={`relative max-w-[400px] max-h-[400px] flex-1 rounded-lg flex items-center ${isPortrait ? 'justify-start' : 'justify-center'} overflow-hidden p-2`}
                                            style={{
                                                backgroundColor: themeColors.background,
                                                color: themeColors.text,
                                                borderColor: themeColors.secondary
                                            }}
                                        >
                                            <Map
                                                map={map}
                                                selectedTable={selectedTableMap}
                                                setMap={() => { }}
                                                setSelectedTable={setSelectedTableMap}
                                                setTableEditorVisible={() => { }}
                                                scaleFactor={scaleFactor}
                                                isEditMode={false}
                                            />
                                        </div>
                                    </div>

                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No map selected
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="border rounded-lg overflow-hidden" style={{ borderColor: `${themeColors.secondary}25` }}>
                <div className="p-2 font-medium flex justify-between items-center"
                    style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.text }}
                >
                    <div className="flex items-center gap-2 w-full justify-between">
                        <span>{showOrderDetail ? 'Order Viewer' : showMenu ? 'Menu Viewer' : 'Orders List'}</span>
                        {(showOrderDetail || showMenu) && (
                            <motion.button
                                onClick={() => {
                                    if (showMenu) {
                                        setShowMenu(false);
                                        setShowOrderDetail(true);
                                        return;
                                    } else if (showOrderDetail) {
                                        setShowOrderDetail(false);
                                        setSelectedOrder(undefined);
                                    }
                                }}
                                className="flex items-center justify-center p-1 rounded-full"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <MdArrowBack size={20} />
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Content container */}
                <div className="p-2">
                    {/* Orders list */}
                    {!showOrderDetail && !showMenu && (
                        <div className="flex flex-col gap-2">
                            {orders && orders.length > 0 ? (
                                orders.map(order => (
                            <motion.div
                                key={order.id}
                                className="border rounded-lg p-3 shadow-sm cursor-pointer"
                                style={{
                                    borderColor: `${themeColors.secondary}50`,
                                    backgroundColor: ordersToMerge.some(o => o.id === order.id)
                                        ? `${themeColors.accent}15`
                                        : themeColors.background
                                }}
                                onClick={() => handleSelectOrder(order)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium" style={{ color: themeColors.text }}>
                                        Order #{order.id}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {/* Payment status indicator */}
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                order.paid
                                                  ? 'bg-green-500/15 text-green-600'
                                                  : 'bg-red-500/15 text-red-600'
                                              }`}
                                        >
                                            {order.paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                        
                                        {/* Order status indicator */}
                                        <span
                                             className={`px-2 py-1 rounded text-xs font-medium ${
                                                order.status === 'PENDING'
                                                  ? 'bg-yellow-500/15 text-yellow-800'
                                                  : order.status === 'IN_PROGRESS'
                                                    ? 'bg-blue-500/15 text-blue-800'
                                                    : order.status === 'COMPLETED'
                                                      ? 'bg-green-500/15 text-green-800'
                                                      : 'bg-purple-500/15 text-purple-800'
                                              }`}
                                        >
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: `${themeColors.text}95` }}>
                                        Table #{order.table?.number || 'None'}
                                    </span>
                                    <span style={{ color: `${themeColors.text}95` }}>
                                        Items: {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                            ) : (
                                <div
                                    className="text-center py-8"
                                    style={{ color: `${themeColors.text}80` }}
                                >
                                    No orders found. Try changing filters or create a new order.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order detail view */}
                    {showOrderDetail && selectedOrder && (
                        <div>
                            <Order
                                order={selectedOrder}
                                editMode={editMode}
                                updateOrder={handleUpdateOrder}
                                deleteOrder={handleDeleteOrder}
                                isMerging={isMerging}
                                selectOrder={() => {setShowMenu(true); setShowOrderDetail(false); }}
                            />
                        </div>
                    )}

                    {/* Menu for adding items */}
                    {showMenu && menu && (
                        <div>
                            {/* Adapt to SmallMenu component's interface */}
                            <div className="p-4">
                                {menu && menu.categories.map(category => (
                                    <div key={category.id} className="mb-6">
                                        <h3 className="text-lg font-bold mb-2" style={{ color: themeColors.text }}>
                                            {category.name}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {category.menuItems.map(menuItem => (
                                                <motion.div
                                                    key={menuItem.id}
                                                    className="border rounded-lg p-3 cursor-pointer"
                                                    style={{ borderColor: `${themeColors.secondary}30` }}
                                                    whileHover={{ scale: 1.02, backgroundColor: `${themeColors.accent}10` }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleAddMenuItemToOrder(menuItem)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium" style={{ color: themeColors.text }}>
                                                            {menuItem.product?.name || 'Unnamed Item'}
                                                        </span>
                                                        <span className="text-sm font-bold" style={{ color: themeColors.accent }}>
                                                            {menuItem.price.toFixed(2)} €
                                                        </span>
                                                    </div>
                                                    {menuItem.product?.description ? (
                                                        <p className="text-sm mt-1" style={{ color: `${themeColors.text}90` }}>
                                                            {menuItem.product.description}
                                                        </p>
                                                    ) : null}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MobilePageWrapper>
    );
};

export default MobileOrdersPage;
