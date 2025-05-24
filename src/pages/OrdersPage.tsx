import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Client, IMessage } from '@stomp/stompjs';

// Context
import { useTheme } from '../context/ThemeContext';
import { useMessageModal } from '../context/MessageModalContext';
import { useQuestionModal } from '../context/QuestionModalContext';

// Types
import { MapType, MenuItemType, MenuType, OrderFiltersType, OrderItemType, OrderType, TableMapType } from '../types';

// API Services
import { getAllMaps } from '../api/mapService';
import { deleteOrder, getOrdersByFilters, postFullOrder, postOrder, putOrder } from '../api/orderService';
import { getMenu } from '../api/menuService';
import config from '../config';

// Components
import Map from "../components/map/Map";
import Order from '../components/orders/Order';
import SmallMenu from '../components/menu/SmallMenu';
import OrderFilters from '../components/orders/OrderFilters';

// Hooks & Utilities
import useResponsiveStage from '../utils/useResponsiveStage';

// Icons
import { MdAddBox, MdOutlineArrowBackIos } from 'react-icons/md';
import { FaMap } from "react-icons/fa";
import { TbLayoutSidebarLeftExpandFilled, TbLayoutSidebarRightExpandFilled } from "react-icons/tb";
import { AiOutlineMergeCells, AiOutlineSplitCells } from 'react-icons/ai';
import { PiArrowArcLeftBold } from 'react-icons/pi';
import { BiSolidEdit } from 'react-icons/bi';

/**
 * OrdersPage component
 * 
 * Provides a comprehensive interface for managing restaurant orders, including:
 * - Real-time order tracking with WebSocket integration
 * - Viewing order details and status
 * - Creating, editing, and deleting orders
 * - Adding menu items to orders
 * - Filtering orders by various criteria
 * - Map-based table selection
 * - Order operations (merge, split, table reassignment)
 */
const OrdersPage = () => {
    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { showMessageModal } = useMessageModal();
    const { askQuestion } = useQuestionModal();
    
    // Orders state
    const [inProgressOrders, setInProgressOrders] = useState<OrderType[]>([]);
    const [orders, setOrders] = useState<OrderType[]>();
    const [selectedOrder, setSelectedOrder] = useState<OrderType>();
    const selectedOrderRef = useRef<OrderType | null>(null);
    
    // Menu state
    const [menu, setMenu] = useState<MenuType>();
    
    // UI mode state
    const [editMode, setEditMode] = useState(false);
    const [isMerging, setIsMerging] = useState<boolean>(false);
    const [ordersToMerge, setOrdersToMerge] = useState<OrderType[]>([]);
    const [isSplitting, setIsSplitting] = useState<boolean>(false);
    const [splitOrder, setSplitOrder] = useState<OrderType | null>(null);
    
    // Map and table state
    const [map, setMap] = useState<MapType>();
    const [maps, setMaps] = useState<MapType[]>();
    const { containerRef, isPortrait, scaleFactor } = useResponsiveStage(800, 800);
    const [selectedTableMap, setSelectedTableMap] = useState<TableMapType>();
    const [isMapSelectorVisible, setIsMapSelectorVisible] = useState(true);
    const [orderToChangeTable, setOrderToChangeTable] = useState<number | null>(null);
    
    // Filters state
    const [filters, setFilters] = useState<OrderFiltersType>({ status: ['IN_PROGRESS'] });
    
    // WebSocket client reference
    const clientRef = useRef<Client | null>(null);

    /**
     * Toggles the edit mode for orders
     * Cancels other modes (merge, split) when activated
     */
    const handleToggleEditMode = () => {

        showMessageModal("INFO", editMode ? "Edit Mode: Deactivated" : "Edit Mode: Activated");
        if (isMerging) {
            showMessageModal("ERROR", "Can't edit while merging");
            return;
        }
        if (isSplitting) {
            showMessageModal("ERROR", "Can't edit while spliting");
            return;
        }
        setEditMode(!editMode);
        setOrderToChangeTable(null);
        setSelectedOrder(undefined);  
        showMessageModal("INFO", editMode ? "Edit Mode: Deactivated" : "Edit Mode: Activated");
    };
    
    /**
     * Toggles the merge mode for combining orders
     * Validates that other modes are not active
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
        if (isSplitting) {
            showMessageModal("ERROR", "Can't merge while splitting");
            return;
        }

        setIsMerging(!isMerging);
        setOrdersToMerge([]);
        showMessageModal("INFO", isMerging ? "Merge Mode: Deactivated" : "Merge Mode: Select orders to merge");
    };
    
    /**
     * Toggles the split mode for dividing orders
     * Validates that other modes are not active
     */
    const handleToggleSplitMode = () => {
        if (editMode) {
            showMessageModal("ERROR", "Can't split while editing");
            return;
        }
        if (isMerging) {
            showMessageModal("ERROR", "Can't split while merging");
            return;
        }

        setIsSplitting(!isSplitting);
        setSelectedOrder(undefined);

        if (!isSplitting) showMessageModal("INFO", "Split Mode: Select an order to split");
        else {
            if (selectedOrder?.orderItems.length === 0) deleteOrder(selectedOrder.id)
            if (splitOrder?.orderItems.length === 0) deleteOrder(splitOrder.id)
            showMessageModal("INFO", "Split Mode: Deactivated");
            setSplitOrder(null);
            setSelectedOrder(undefined);
        }
    };

    /**
     * Initialize WebSocket connection to receive real-time order updates from the kitchen
     * Sets up STOMP client for subscribing to order events
     */
    useEffect(() => {
        // Prevent duplicate WebSocket connections
        if (clientRef.current) return;

        const client = new Client({
            brokerURL: config.WS_URL,
            reconnectDelay: 5000,
            debug: (str) => console.log(str),

            onConnect: () => {
                client.subscribe('/topic/kitchen/orders', (message: IMessage) => {
                    const data: OrderType[] = JSON.parse(message.body);
                    setInProgressOrders(data);
                    // Update the currently selected order if it's in the new data
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
     * Load initial data (maps and menu) on component mount
     */
    useEffect(() => {
        const fetchData = async (mapData?: MapType) => {
            const mapsData = await getAllMaps();
            setMaps(mapsData);
            setMap(mapsData.find(m => m.id === mapData?.id) || mapsData.find(m => m.id === map?.id) || mapsData[0]);

            const menuData = await getMenu();
            setMenu(menuData);
        }

            fetchData();
    }, []);

    /**
     * Fetch and filter orders based on selected filters and real-time data
     * Combines in-progress orders from WebSocket with filtered orders from API
     */
    useEffect(() => {
        const fetchData = async () => {
            // Refresh map data if needed
            if (map) {
                const mapData = await getAllMaps();
                setMaps(mapData);
                setMap(mapData.find(m => m.id === map?.id) || mapData[0]);
            }

            const combinedOrders = [];

            // Handle real-time IN_PROGRESS orders from WebSocket
            if (filters.status?.includes('IN_PROGRESS') && inProgressOrders.length > 0) {
                const ordersData = inProgressOrders.filter(order => {
                    const matchOrderId = filters.orderId ? order.id == filters.orderId : true;
                    const matchTableNum = filters.paid !== undefined ? order.paid == filters.paid : true;
                    const matchPaid = filters.tableId ? order.table.id == filters.tableId : true;
                    const matchStartDate = filters.startDate ? new Date(order.date) >= new Date(filters.startDate) : true;
                    const matchEndDate = filters.endDate ? new Date(order.date) <= new Date(filters.endDate) : true;

                    return matchOrderId && matchTableNum && matchPaid && matchStartDate && matchEndDate;
                });
                combinedOrders.push(...ordersData);
            }

            // Handle other order statuses from API
            const filtersData = {
                ...filters,
                status: filters.status?.filter(status => status !== 'IN_PROGRESS') || []
            };

            if (filtersData.status?.length > 0) {
                const filteredOrders = await getOrdersByFilters(filtersData);
                combinedOrders.push(...filteredOrders);
            }

            // Sort orders by date (oldest first)
            const sortedOrders = combinedOrders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setOrders(sortedOrders);
        }

        fetchData();
    }, [filters, inProgressOrders]);

    /**
     * Handle table selection and order table reassignment
     * When a table is selected on the map, it automatically:
     * - Updates the order's table if in table change mode
     * - Updates filters to show orders for the selected table
     */
    useEffect(() => {
        if (selectedTableMap) {
            // Handle table reassignment if an order is being changed
            if (orderToChangeTable) {
                const orderData = orders?.find(o => o.id === orderToChangeTable);
                if (orderData) {
                    const updatedOrder = {
                        ...orderData,
                        table: selectedTableMap.table,
                    };
                    updateOrder(updatedOrder);
                }
            }
            // Filter orders to show only those for the selected table
            setFilters((prev) => ({ ...prev, tableId: selectedTableMap.table.id }));
        } else {
            // Remove table filter when no table is selected
            setFilters((prev) => ({ ...prev, tableId: undefined }));
        }
    }, [selectedTableMap]);

    /**
     * Keep a reference to the currently selected order for WebSocket updates
     */
    useEffect(() => {
        selectedOrderRef.current = selectedOrder || null;
    }, [selectedOrder]);

    /**
     * Handle map selection from the dropdown
     * @param event - The select change event
     */
    const handleMapChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMap = maps?.find(m => m.id === Number(event.target.value));
        setMap(selectedMap || undefined);
    };

    /**
     * Update an order via API and reflect changes in the UI
     * Updates all relevant state to ensure consistency
     * @param order - The order to update
     */
    const updateOrder = async (order: OrderType) => {
        const orderData = await putOrder(order);
        // Update in the orders list
        setOrders((prevOrders) => prevOrders?.map(o => o.id === order.id ? orderData : o));
        setOrderToChangeTable(null);
        // Update selected order if it matches
        if (selectedOrder && selectedOrder.id === order.id) {
            setSelectedOrder(orderData);
        }
        // Update split order if it matches
        if (splitOrder && splitOrder.id === order.id) {
            if (order.paid) {
                setSplitOrder(null);
            } else {
                setSplitOrder(orderData);
            }
        }
    }

    /**
     * Create a new order based on the current mode
     * - In normal mode: creates an order for the selected table
     * - In split mode: creates a secondary order for splitting items
     * 
     * Includes validation to prevent order creation in incompatible modes
     */
    const createOrder = async () => {
        // Validate against incompatible operations
        if (splitOrder) {
            showMessageModal("ERROR", "Can't create order while splitting");
            return;
        }
        if (isMerging) {
            showMessageModal("ERROR", "Can't create order while merging");
            return;
        }
        
        // Create a secondary order for splitting
        if (isSplitting && selectedOrder) {
            const newOrder: OrderType = {
                id: 0,
                totalWithoutTax: 0,
                totalWithTax: 0,
                date: new Date().toISOString(),
                status: selectedOrder.status,
                orderItems: [],
                table: selectedOrder.table,
                paid: false
            };
            const orderData: OrderType = await postFullOrder(newOrder);
            setSplitOrder(orderData);
            return;
        }

        // Create a standard order for the selected table
        if (selectedTableMap) {
            const newOrder: OrderType = await postOrder(selectedTableMap.table.id);
            setSelectedOrder(newOrder);
            setOrderToChangeTable(null);
            setEditMode(true);
            if (orders) setOrders([...orders, newOrder]);
        } else {
            showMessageModal("INFO", "Please select a table on the map to create an order.");
        }
    };

    /**
     * Add a menu item to the currently selected order
     * Validates that the item doesn't already exist in the order
     * @param menuItem - The menu item to add to the order
     */
    const addProductToOrder = async (menuItem: MenuItemType) => {
        if (selectedOrder) {
            // Check if the item already exists in the order
            const exists = selectedOrder.orderItems.some(
                (item) => item.menuItem.id === menuItem.id
            );

            if (exists) {
                showMessageModal("ERROR", "Item already exists in the order.");
                return;
            }

            // Create a new order item with default values
            const updatedOrder: OrderType = {
                ...selectedOrder,
                orderItems: [...selectedOrder.orderItems, {
                    id: 0, quantity: 1, price: menuItem.price, tax: menuItem.tax, note: '', status: 'PENDING', completed: false,
                    menuItem: menuItem
                }],
            };
            const orderData = await putOrder(updatedOrder);
            setSelectedOrder(orderData);
            setOrders((prevOrders) => prevOrders?.map(o => o.id === orderData.id ? orderData : o));
        }
    }

    /**
     * Reset all order-related state to default values
     * Used when switching between modes or clearing filters
     */
    const resetOrders = () => {
        setSelectedTableMap(undefined);
        setFilters({ status: ['IN_PROGRESS'] });
        setSelectedOrder(undefined);
        setOrderToChangeTable(null);
        setIsMerging(false);
        setOrdersToMerge([]);
        setIsSplitting(false);
        setSplitOrder(null);
        setEditMode(false);
    }

    /**
     * Prompt for confirmation and delete an order if confirmed
     * @param orderId - The ID of the order to delete
     */
    const askDeleteOrder = async (orderId: number) => {
        const confirmed = await askQuestion(`Do you want to delete Order #${orderId}`);
        if (confirmed) {
            await deleteOrder(orderId);
            // Remove from orders list
            setOrders((prevOrders) => prevOrders?.filter(o => o.id !== orderId));
            // Reset selection state
            setSelectedOrder(undefined);
            setOrderToChangeTable(null);
            showMessageModal("SUCCESS", `Order #${orderId} deleted`);
        }
    }

    /**
     * Merge multiple orders into a single order
     * Combines all items, summing quantities for identical products
     * Deletes the original orders after successful merge
     */
    const mergeOrders = async () => {
        const confirmed = await askQuestion(`Do you want to merge selected orders?`);
        if (confirmed) {
            try {
                // Combine all order items, merging quantities for the same product
                const orderItems: OrderItemType[] = [];
                ordersToMerge.forEach((order) => {
                    order.orderItems.forEach((orderItem) => {
                        const existingItemIndex = orderItems.findIndex(
                            (item) => item.menuItem.product.id === orderItem.menuItem.product.id
                        );
                        if (existingItemIndex >= 0) {
                            // Sum quantities for identical products
                            orderItems[existingItemIndex].quantity += orderItem.quantity;
                        } else {
                            // Add new unique items
                            orderItems.push({ ...orderItem });
                        }
                    })
                });

                // Create a new merged order
                const newOrder: OrderType = {
                    id: 0,
                    totalWithoutTax: 0,
                    totalWithTax: 0,
                    date: new Date().toISOString(),
                    status: 'COMPLETED',
                    orderItems: orderItems,
                    table: ordersToMerge[0].table,
                    paid: false
                };
                
                // Save the new order and update UI
                const newOrderData = await postFullOrder(newOrder);
                setOrders((prev) => [
                    ...(prev ?? []).filter((o) => !ordersToMerge.some((order) => order.id === o.id)),
                    newOrderData
                ]);
                
                // Delete original orders and reset state
                ordersToMerge.forEach(async (o) => await deleteOrder(o.id));
                setOrdersToMerge([]);
                setIsMerging(false);
                setSelectedOrder(newOrderData);
                setEditMode(true);
            } catch (error) {
                showMessageModal("ERROR", "Couldn't complete merge action");
            }
        }
    }

    return (
        <>
            <div className="flex h-full w-full items-center justify-center p-4">
                <div
                    key="orders-grid"
                    className="grid h-full w-full gap-4 p-2 grid-cols-[auto_minmax(auto,400px)] grid-rows-[400px_auto] rounded-lg sm:overflow-hidden overflow-y-auto">
                    <div
                        key="orders-list"
                        className="col-span-1 row-span-2 p-5 rounded-lg  flex flex-wrap gap-5 items-center justify-center overflow-auto"
                        style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            borderColor: themeColors.secondary
                        }}
                    >
                        {isSplitting && selectedOrder ? (
                            <div className='w-full flex flex-col gap-5 w-full h-full justify-start items-start'>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-3xl flex items-center gap-1 cursor-pointer hover:text-primary transition-colors px-3 py-1 rounded-lg hover:bg-gray-100 hover:bg-opacity-10"
                                    onClick={() => {
                                        if (selectedOrder?.orderItems.length === 0) deleteOrder(selectedOrder.id)
                                        if (splitOrder?.orderItems.length === 0) deleteOrder(splitOrder.id)
                                        showMessageModal("INFO", "Split Mode: Deactivated");
                                        setSplitOrder(null);
                                        setSelectedOrder(undefined);
                                        setIsSplitting(false);
                                    }}
                                >
                                    <MdOutlineArrowBackIos /> <span className='text-xl font-medium'>Back to Orders</span>
                                </motion.div>
                                <div className='h-[calc(100%-3rem)] w-full flex justify-center items-center'>
                                    <div className='w-full grid grid-cols-[49%_2%_49%] overflow-hidden'>
                                        <Order key={selectedOrder.id} order={selectedOrder}
                                            editMode={false}
                                            updateOrder={updateOrder}
                                            deleteOrder={() => askDeleteOrder(selectedOrder.id)}
                                            splitOrder={splitOrder}
                                        />
                                        <div className='h-full flex items-center justify-center'>
                                            <div className='h-3/4 w-0 border-r-2 border-dashed border-secondary border-opacity-40'></div>
                                        </div>
                                        {splitOrder ? (
                                            <Order
                                                order={splitOrder}
                                                editMode={false}
                                                updateOrder={updateOrder}
                                                deleteOrder={() => askDeleteOrder(splitOrder.id)}
                                                splitOrder={selectedOrder}
                                                reverseSplit={true}
                                            />
                                        ) : (
                                            <motion.div
                                                whileHover={{ scale: 1.2 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                className={`text-6xl cursor-pointer ${editMode ? 'text-blue-500 ' : 'hover:text-blue-500'} transition-colors select-none w-full flex flex-col justify-center items-center`}
                                                onClick={() => { createOrder() }}
                                            >
                                                <MdAddBox />
                                                <span
                                                    className="text-lg whitespace-nowrap text-center"
                                                    style={{ color: themeColors.text }}
                                                >
                                                    Split Order
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : selectedOrder ? (
                            <div className='flex gap-3 w-full h-full justify-center items-start'>
                                <div className='min-w-[330px] max-w-[400px] h-full w-full'>
                                    <div className="h-12 mb-2">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="text-3xl flex items-center gap-1 cursor-pointer hover:text-primary transition-colors w-fit px-3 py-1 rounded-lg hover:bg-gray-100 hover:bg-opacity-10"
                                            onClick={() => setSelectedOrder(undefined)}
                                        >
                                            <MdOutlineArrowBackIos />
                                            <span className='text-xl font-medium'>Back to Orders</span>
                                        </motion.div>
                                    </div>
                                    <div className='h-[calc(100%-3rem)] flex justify-center items-center'>
                                        <Order key={selectedOrder.id} order={selectedOrder}
                                            editMode={true}
                                            updateOrder={updateOrder}
                                            deleteOrder={() => askDeleteOrder(selectedOrder.id)}
                                            changeTable={setOrderToChangeTable}
                                            changingTable={selectedOrder.id === orderToChangeTable}
                                        />
                                    </div>
                                </div>
                                <div className='overflow-auto h-full w-full rounded-xl border border-secondary border-opacity-20 shadow-inner p-3'>
                                    <SmallMenu menu={menu} sendItem={addProductToOrder} />
                                </div>
                            </div>
                        ) : (
                            orders?.length !== 0 ? (
                                orders?.map((order) =>
                                    <Order key={order.id} order={order}
                                        editMode={editMode}
                                        updateOrder={updateOrder}
                                        deleteOrder={() => askDeleteOrder(order.id)}
                                        selectOrder={setSelectedOrder}
                                        changeTable={setOrderToChangeTable}
                                        changingTable={order.id === orderToChangeTable}
                                        isMerging={ordersToMerge.includes(order)}
                                        mergeOrder={() => {
                                            if (isMerging) {
                                                setOrdersToMerge((prev) => {
                                                    if (prev.includes(order)) {
                                                        return prev.filter((o) => o.id !== order.id);
                                                    } else {
                                                        return [...prev, order];
                                                    }
                                                });
                                            }
                                        }}
                                        isSplitting={isSplitting}
                                    />)
                            ) : <h1 className='text-2xl font-bold'>No orders found</h1>
                        )}
                    </div>

                    <div
                        key="map"
                        ref={containerRef}
                        className={`col-span-1 row-span-1 overflow-x-hidden relative h-full rounded-xl shadow-card flex items-center ${isPortrait ? 'justify-start' : 'justify-center'} border-2 border-secondary border-opacity-30 overflow-x-auto overflow-y-hidden p-2`}
                        style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            borderColor: themeColors.secondary
                        }}
                    >
                        {/* Map Selector */}
                        <motion.div
                            animate={{
                                width: isMapSelectorVisible ? '250px' : '42px',
                            }}
                            initial={{
                                width: isMapSelectorVisible ? '250px' : '42px',
                                bottom: 0,
                                left: 0,

                            }}
                            transition={{
                                duration: 0.3,
                                ease: 'easeInOut',
                            }}
                            className={`flex gap-2 items-center absolute z-10 ${themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? 'bg-zinc-100/75 text-black' : 'bg-zinc-900/75 text-white'} rounded-lg rounded-bl-none  shadow-md p-2 overflow-hidden`}
                        >

                            {isMapSelectorVisible ? (
                                <>
                                    <FaMap className="text-2xl" />
                                    <select
                                        className="text-base font-medium border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                                        onChange={handleMapChange}
                                        value={map?.id}
                                    >
                                        <option className="text-black" value="" disabled>Choose a map</option>
                                        {maps?.map((map) => (
                                            <option key={map.id} className="text-black" value={map.id}>
                                                {map.name}
                                            </option>
                                        ))}
                                    </select>
                                    |
                                    <TbLayoutSidebarRightExpandFilled className="text-3xl cursor-pointer hover:text-primary transition-colors" onClick={() => setIsMapSelectorVisible(false)} />
                                </>
                            ) : (
                                <>
                                    <TbLayoutSidebarLeftExpandFilled className="text-3xl cursor-pointer hover:text-primary transition-colors" onClick={() => setIsMapSelectorVisible(true)} />
                                </>
                            )}
                        </motion.div>
                        <Map map={map} setMap={setMap} selectedTable={selectedTableMap} setSelectedTable={setSelectedTableMap} setTableEditorVisible={undefined} scaleFactor={scaleFactor} isEditMode={false} />
                    </div>

                    <div
                        key="orders-filters"
                        className={`col-span-1 row-span-1 rounded-xl shadow-card px-6 flex flex-col gap-4 overflow-hidden border-l-2 border-secondary border-opacity-20`}
                        style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            borderColor: themeColors.secondary
                        }}
                    >
                        <div className="flex justify-center gap-5 mt-2">


                            <div className="relative group select-none">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-4xl cursor-pointer hover:text-green-500 transition-colors filter drop-shadow-md"
                                    onClick={() => createOrder()}
                                >
                                    <MdAddBox />
                                </motion.div>
                                <span
                                    className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
                                >
                                    New Order
                                </span>
                            </div>
                            <div className="relative group select-none">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    animate={editMode ? { scale: 1.2 } : ''}                                    className={`text-4xl cursor-pointer ${editMode ? 'text-blue-500 ' : 'hover:text-blue-500'} transition-colors filter drop-shadow-md`}
                                    onClick={handleToggleEditMode}
                                >
                                    <BiSolidEdit />
                                </motion.div>
                                <span
                                    className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
                                >
                                    Edit Mode
                                </span>
                            </div>
                            <div className="relative group select-none">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    animate={isMerging ? { scale: 1.2 } : ''}
                                    className={`text-4xl cursor-pointer ${isMerging ? 'text-purple-500 ' : 'hover:text-purple-500'}  transition-colors filter drop-shadow-md`}
                                    onClick={handleToggleMergeMode}
                                >
                                    <AiOutlineMergeCells />
                                </motion.div>
                                <span
                                    className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
                                >
                                    Merge Orders
                                </span>
                            </div>
                            <div className="relative group select-none" key="split-orders">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    animate={isSplitting ? { scale: 1.2 } : ''}
                                    className={`text-4xl cursor-pointer ${isSplitting ? 'text-purple-500' : 'hover:text-purple-500'} transition-colors filter drop-shadow-md`}
                                    onClick={handleToggleSplitMode}
                                >
                                    <AiOutlineSplitCells />
                                </motion.div>
                                <span
                                    className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
                                >
                                    Split Orders
                                </span>
                            </div>
                            <div className="relative group select-none" key="reset-orders">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-3xl cursor-pointer hover:text-blue-500 transition-colors filter drop-shadow-md"
                                    onClick={resetOrders}
                                >
                                    <PiArrowArcLeftBold />
                                </motion.div>
                                <span
                                    className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
                                >
                                    Reset
                                </span>
                            </div>
                        </div>
                        <div className="w-full flex items-center select-none pointer-events-none">
                            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${themeColors.primary}, ${themeColors.secondary}, transparent)` }}></div>
                        </div>

                        <OrderFilters filters={filters} setFilters={setFilters} />
                    </div>
                </div>

            </div>
        </>
    );
}

export default OrdersPage