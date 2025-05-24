/**
 * Order.tsx
 * Component for managing and displaying individual orders.
 */

// React and external libraries
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

// Icons
import { MdAdd, MdRemove, MdDelete, MdAddBox } from "react-icons/md";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { TiPrinter } from "react-icons/ti";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import { BsCashCoin } from "react-icons/bs";

// Components
import PaymentManager from "../payment/PaymentManager";

// Context
import { useTheme } from "../../context/ThemeContext";

// Services
import { printOrder } from "../../api/printService";

// Types
import { OrderItemType, OrderType } from "../../types";

/**
 * Props for the Order component
 * @interface OrderProps
 */
interface OrderProps {
    /** The order data to display/edit */
    order: OrderType;
    /** Whether the order is in edit mode */
    editMode: boolean;
    /** Callback function to update the order */
    updateOrder?: (order: OrderType) => void;
    /** Callback function to delete the order */
    deleteOrder?: (orderId: number) => void;
    /** Callback function to select the order */
    selectOrder?: (order: OrderType) => void;
    /** State setter for changing table */
    changeTable?: React.Dispatch<React.SetStateAction<number | null>>;
    /** Whether table changing mode is active */
    changingTable?: boolean;
    /** Whether order merging mode is active */
    isMerging?: boolean;
    /** Callback function to merge orders */
    mergeOrder?: () => void;
    /** Whether order splitting mode is active */
    isSplitting?: boolean;
    /** Order being split */
    splitOrder?: OrderType | null;
    /** Whether split direction is reversed */
    reverseSplit?: boolean;
}

/**
 * Order Component
 * 
 * Displays and manages an individual order in the restaurant system.
 * Supports editing order items, printing receipts, handling payments,
 * and special operations like merging and splitting orders.
 *
 * @param {OrderProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const Order: React.FC<OrderProps> = ({
    order,
    editMode,
    updateOrder,
    deleteOrder,
    selectOrder,
    changeTable,
    changingTable,
    isMerging,
    mergeOrder,
    isSplitting,
    splitOrder,
    reverseSplit,
}) => {
    // Theme and state setup
    const { themeColors } = useTheme();
    const [showPrintOptions, setShowPrintOptions] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    let holdTimeout: ReturnType<typeof setTimeout>;
    const [showPaymentModal, setShowPaymentModal] = useState(false);

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

    /**
     * Changes the status of the order
     * Automatically sets paid orders to FINISHED when completing
     * 
     * @param {string} newStatus - New status for the order
     */
    const changeStatus = (newStatus: string) => {
        if (newStatus === 'COMPLETED' && order.paid) {
            newStatus = 'FINISHED';
        }
        if (updateOrder) {
            const updatedOrder = {
                ...order,
                status: newStatus as OrderType['status']
            };
            updateOrder(updatedOrder);
        }
    };

    /**
     * Handles mouse/touch down on the print button
     * Starts a timer for long press detection to show print options
     */
    const handleMouseDown = () => {
        if (showPrintOptions) {
            setShowPrintOptions(false);
            return;
        }
        holdTimeout = setTimeout(() => {
            setShowPrintOptions(true);
        }, 500); // 500ms to detect long press
    };

    /**
     * Handles mouse/touch up on the print button
     * Cancels long press timer and prints to both bar and kitchen if not showing options
     */
    const handleMouseUp = async () => {
        clearTimeout(holdTimeout);
        if (!showPrintOptions) {
            await printOrder(order.id, 'BAR');
            await printOrder(order.id, 'KITCHEN');
        }
    };

    /**
     * Sends a print request to the specified printer
     * 
     * @param {string} printer - Printer destination ('BAR' or 'KITCHEN')
     */
    const sendPrintOrder = async (printer: string) => {
        await printOrder(order.id, printer);
        setShowPrintOptions(false);
    }

    /**
     * Handles clicks outside the print options dropdown to close it
     * 
     * @param {MouseEvent} event - Mouse event
     */
    const handleClickOutside = (event: MouseEvent) => {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
            setShowPrintOptions(false);
        }
    };

    /**
     * Add and remove event listener for detecting clicks outside print options
     */
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /**
     * Moves an item from the current order to the split order
     * 
     * @param {number} itemId - ID of the item to split
     * @param {boolean} all - Whether to move all of the item or just one
     */
    const splitItem = (itemId: number, all: boolean) => {
        if (updateOrder && splitOrder) {
            const itemToMove: OrderItemType | undefined = order.orderItems.find(item => item.id === itemId);
            if (itemToMove) {
                const updatedOrder: OrderType = {
                    ...order,
                    orderItems: order.orderItems.map((item) =>
                        item.id === itemId ? { ...item, quantity: all ? 0 : item.quantity - 1 } : item
                    ).filter(item => item.quantity > 0)
                };
                updateOrder(updatedOrder);

                const existingItem: OrderItemType | undefined = splitOrder.orderItems.find(item => item.menuItem.id === itemToMove.menuItem.id);

                const updatedSplit: OrderType = {
                    ...splitOrder,
                    orderItems: existingItem
                        ? splitOrder.orderItems.map(item =>
                            item.menuItem.id === existingItem.menuItem.id
                                ? { ...item, quantity: all ? item.quantity + itemToMove.quantity : item.quantity + 1 }
                                : item
                        )
                        : [...splitOrder.orderItems, { ...itemToMove, id: 0, quantity: all ? itemToMove.quantity : 1 }]
                };
                updateOrder(updatedSplit);
            }
        }

    }

    return (
        <>
            {updateOrder && (
                <PaymentManager
                    isOpen={showPaymentModal}
                    setIsOpen={setShowPaymentModal}
                    order={order}
                    updateOrder={updateOrder}
                />
            )}
            <div
                className={`w-[300px] mx-auto p-6 border-2 rounded-lg shadow-lg font-mono select-none ${isMerging ? 'bg-sky-100' : ''}`}
                style={{
                    backgroundColor: isMerging ? '' : themeColors.background,
                    color: themeColors.text,
                    borderColor: themeColors.secondary
                }}
                onClick={() => {
                    if (mergeOrder && !order.paid) mergeOrder();
                    if (selectOrder && isSplitting && !order.paid) selectOrder(order);
                }}
            >

                {/* Order header with print and payment controls */}
                <div className="relative text-center flex justify-center items-center">
                    <h1 className={`text-2xl ${editMode && !order.paid && 'text-left'} w-full font-bold tracking-wide`}>Order #{order.id}</h1>
                    {/*<p className="text-sm text-gray-500">Thank you for your visit!</p>*/}
                    <div className="absolute right-0 flex justify-center items-center gap-2">
                        {!order.paid && (
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="text-xl cursor-pointer hover:text-green-600 transition-colors"
                                onClick={() => setShowPaymentModal(true)}>
                                <BsCashCoin />
                            </motion.div>
                        )}
                        <motion.div
                            ref={buttonRef}
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative text-2xl cursor-pointer hover:text-primary transition-colors"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchEnd={handleMouseUp}
                            onTouchCancel={() => clearTimeout(holdTimeout)}
                            onMouseLeave={() => clearTimeout(holdTimeout)}
                        >
                            <TiPrinter />
                            {showPrintOptions && (
                                <div className="absolute z-50 mt-2 flex flex-col left-1/2 transform -translate-x-1/2 border-2 rounded text-lg shadow-dropdown"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        color: themeColors.text,
                                        borderColor: themeColors.secondary
                                    }}>
                                    <button
                                        className="px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
                                        onClick={() => sendPrintOrder('BAR')}
                                    >
                                        Bar
                                    </button>
                                    <div className="border-t border-gray-300 w-full"></div>
                                    <button
                                        className="px-4 py-2 hover:bg-green-500 hover:text-white transition-colors"
                                        onClick={() => sendPrintOrder('KITCHEN')}
                                    >
                                        Kitchen
                                    </button>
                                </div>
                            )}
                        </motion.div>
                        {editMode && !order.paid && (
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="text-2xl cursor-pointer hover:text-red-500 transition-colors"
                                onClick={() => { if (deleteOrder) deleteOrder(order.id) }}
                            >
                                <RiDeleteBin6Fill />
                            </motion.div>
                        )}
                    </div>

                </div>

                <hr className="border-dashed border-gray-400 my-2" />

                {/* Order Info */}
                <div className="text-sm">
                    <p onClick={() => { if (changeTable && editMode && !order.paid) { changeTable((prev) => { if (prev !== order.id) return order.id; else return null }) } }}
                        className={`flex items-center gap-2 py-1 px-2 ${editMode && !order.paid ? changingTable ? "cursor-pointer bg-opacity-20 bg-secondary rounded-md" : "cursor-pointer hover:bg-secondary hover:bg-opacity-10 hover:rounded-md transition-all duration-300" : ""}`}
                    >
                        <strong className="font-medium">Table:</strong>
                        <span className="px-2 py-0.5 bg-primary bg-opacity-15 rounded-md font-semibold">#{order.table.number}</span>

                        {changingTable && (
                            <span className="text-xs italic ml-2 text-primary">
                                {"Click on map to change table"}
                            </span>
                        )}
                    </p>
                    <p className="flex items-center gap-2 py-1 px-2">
                        <strong className="font-medium">Status:</strong>
                        {editMode && order.status !== 'FINISHED' ? (
                            <select
                                value={order.status}
                                onChange={(e) => changeStatus(e.target.value)}
                                className="px-2 py-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                                style={{
                                    backgroundColor: `${themeColors.background}`,
                                    color: themeColors.text,
                                    borderColor: themeColors.secondary
                                }}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        ) : (
                            <span className={`px-2 py-0.5 rounded-md font-medium ${order.status === 'PENDING' ? 'bg-yellow-500 bg-opacity-20 text-yellow-800' : 
                                order.status === 'IN_PROGRESS' ? 'bg-blue-500 bg-opacity-20 text-blue-800' : 
                                order.status === 'COMPLETED' ? 'bg-green-500 bg-opacity-20 text-green-800' : 
                                'bg-purple-500 bg-opacity-20 text-purple-800'}`}>
                                {order.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                        )}
                    </p>
                    <p className="flex items-center gap-2 py-1 px-2">
                        <strong className="font-medium">Date:</strong>
                        <span className="text-sm">{new Date(order.date).toLocaleString()}</span>
                    </p>
                </div>

                <div className="w-full h-px my-3 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50"></div>

                {/* Order Items */}
                <div className="flex justify-center gap-2">
                    <h3 className="text-lg font-semibold mb-2 text-center">Order Items</h3>
                    {selectOrder && editMode && !order.paid && (
                        <motion.div
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="text-2xl cursor-pointer hover:text-green-500 transition-colors"
                            onClick={() => selectOrder(order)}
                        >
                            <MdAddBox />
                        </motion.div>
                    )}
                </div>

                <div className="space-y-2 text-sm h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    {order.orderItems.map((orderItem, index) => (
                        <div
                            key={orderItem.id}
                            className={`flex justify-between items-center pb-2 ${index !== order.orderItems.length - 1 ? 'border-b border-gray-300' : ''}`}
                        >
                            {splitOrder && reverseSplit && (
                                <div className="flex items-center space-x-2">
                                    <RxDoubleArrowLeft
                                        className="cursor-pointer text-xl"
                                        aria-label="Split all of this item"
                                        onClick={() => splitItem(orderItem.id, true)}
                                    />
                                    <MdAdd
                                        className="text-green-700 cursor-pointer  text-xl"
                                        aria-label="Split 1 of this item"
                                        onClick={() => splitItem(orderItem.id, false)}
                                    />
                                    <span className="font-semibold">{orderItem.quantity}</span>
                                </div>
                            )}

                            <div className={(editMode || splitOrder) && !order.paid ? '' : 'w-full mr-2 flex justify-between items-center'}>
                                <p className={`font-medium ${reverseSplit && 'text-right'}`}>{((!editMode && !splitOrder) || order.paid) && (orderItem.quantity)} {orderItem.menuItem.product.name}</p>
                                <p className={`text-xs text-gray-500 ${reverseSplit && 'text-right'}`}>
                                    {`${orderItem.price.toFixed(2)} €`}
                                </p>
                            </div>
                            {editMode && !order.paid && (
                                <div className="flex items-center space-x-2">
                                    <MdDelete
                                        className="text-red-500 cursor-pointer text-xl"
                                        aria-label="Remove this item from the order"
                                        onClick={() => changeQuantity(orderItem.id, 0)}
                                    />
                                    <MdRemove
                                        className="text-gray-500 cursor-pointer text-xl"
                                        aria-label="Decrease in 1 this item from the order"
                                        onClick={() => changeQuantity(orderItem.id, orderItem.quantity - 1)}
                                    />
                                    <span className="font-semibold">{orderItem.quantity < 10 && ('0')}{orderItem.quantity}</span>
                                    <MdAdd
                                        className="text-green-700 cursor-pointer text-xl"
                                        aria-label="Increase in 1 this item from the order"
                                        onClick={() => changeQuantity(orderItem.id, orderItem.quantity + 1)}
                                    />
                                </div>
                            )}
                            {splitOrder && !reverseSplit && (
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold">{orderItem.quantity}</span>
                                    <MdAdd
                                        className="text-green-700 cursor-pointer  text-xl"
                                        aria-label="Split 1 of this item"
                                        onClick={() => splitItem(orderItem.id, false)}
                                    />
                                    <RxDoubleArrowRight
                                        className="cursor-pointer text-xl"
                                        aria-label="Split all of this item"
                                        onClick={() => splitItem(orderItem.id, true)}
                                    />
                                </div>
                            )}

                        </div>
                    ))}
                </div>

                <hr className="border-dashed border-gray-400 my-4" />

                {/* Totals */}

                <div className="text-sm">
                    <p className="flex justify-between">
                        <span className="text-gray-600">Total (without tax):</span>
                        <span>{order.totalWithoutTax.toFixed(2)} €</span>
                    </p>
                    <p className="flex justify-between py-1 text-base font-bold">
                        <span>Total (with tax):</span>
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
                            {order.totalWithTax.toFixed(2)} €
                        </span>
                    </p>
                </div>
                <hr className="border-dashed border-gray-400 my-4" />


                {/* Footer */}
                {/*<div className="text-center text-xs">
                <p>Powered by Your Restaurant</p>
                <p>Visit us again!</p>
            </div>*/}
            </div>
        </>
    );
};

export default Order;