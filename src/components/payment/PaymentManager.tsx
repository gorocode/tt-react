import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import { FaCreditCard, FaMoneyBill, FaCheck } from 'react-icons/fa';
import { LuSmartphoneNfc } from "react-icons/lu";
import { MdAdd, MdRemove } from 'react-icons/md';
import { PiArrowArcLeftBold } from 'react-icons/pi';
import { IoClose } from 'react-icons/io5';

// Context
import { useTheme } from '../../context/ThemeContext';
import { useMessageModal } from "../../context/MessageModalContext";

// Services
import { postInvoice } from '../../api/invoiceService';

// Types
import { InvoiceType, OrderType } from '../../types';

/**
 * Props for the PaymentManager component
 * @interface PaymentManagerProps
 */
interface PaymentManagerProps {
    /** Whether the payment modal is open */
    isOpen: boolean;
    /** Function to control the modal's open state */
    setIsOpen: (value: boolean) => void;
    /** The order being paid for */
    order: OrderType;
    /** Function to update the order state after payment */
    updateOrder: (order: OrderType) => void;
}

/**
 * Array of cash denominations with their values, types, and image paths
 * Used for the cash payment interface
 */
const CASH_VALUES = [
    { value: 2, type: 'coin', image: '/money/coin_2e.svg' },
    { value: 1, type: 'coin', image: '/money/coin_1e.svg' },
    { value: 0.5, type: 'coin', image: '/money/coin_50c.svg' },
    { value: 0.2, type: 'coin', image: '/money/coin_20c.svg' },
    { value: 0.1, type: 'coin', image: '/money/coin_10c.svg' },
    { value: 0.05, type: 'coin', image: '/money/coin_5c.svg' },
    { value: 0.02, type: 'coin', image: '/money/coin_2c.svg' },
    { value: 0.01, type: 'coin', image: '/money/coin_1c.svg' },
    { value: 500, type: 'bill', image: '/money/bill_500.svg' },
    { value: 200, type: 'bill', image: '/money/bill_200.svg' },
    { value: 100, type: 'bill', image: '/money/bill_100.svg' },
    { value: 50, type: 'bill', image: '/money/bill_50.svg' },
    { value: 20, type: 'bill', image: '/money/bill_20.svg' },
    { value: 10, type: 'bill', image: '/money/bill_10.svg' },
    { value: 5, type: 'bill', image: '/money/bill_5.svg' },
];

/**
 * PaymentManager Component
 * 
 * Modal interface for processing order payments with multiple payment methods:
 * - Cash payment with change calculation
 * - Card payment simulation
 * - Mixed payment (combination of cash and card)
 * 
 * Creates an invoice when payment is completed successfully.  
 *
 * @param {PaymentManagerProps} props - Component props
 * @returns {JSX.Element | null} The rendered component or null when closed
 */
const PaymentManager = ({ isOpen, setIsOpen, order, updateOrder }: PaymentManagerProps) => {
    // Theme and context hooks
    const { themeColors } = useTheme();
    const { showMessageModal } = useMessageModal();
    
    // Payment state
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
    const [mixedPayment, setMixedPayment] = useState<boolean>(false);
    const [cashAmounts, setCashAmounts] = useState<{ [key: number]: number }>(
        CASH_VALUES.reduce((acc, { value }) => ({ ...acc, [value]: 0 }), {})
    );
    const [cardTotal, setCardTotal] = useState<number>(0);
    const [isCompleting, setIsCompleting] = useState<boolean>(false);
    
    // Calculated totals
    const total = order.totalWithTax;
    const cashTotal = Object.entries(cashAmounts).reduce(
        (sum, [value, quantity]) => sum + Number(value) * quantity,
        0
    );
    
    // Reference for continuous button press operations
    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Starts a continuous operation (adding or subtracting) when a button is held down
     * Allows for faster input of cash amounts
     * 
     * @param {number} value - The denomination value to modify
     * @param {'add' | 'subtract'} operation - Whether to add or subtract
     */
    const startContinuousOperation = (value: number, operation: 'add' | 'subtract') => {
        if (intervalRef.current) return;

        const updateValue = () => {
            setCashAmounts(prev => ({
                ...prev,
                [value]: operation === 'add'
                    ? (prev[value] || 0) + 1
                    : Math.max(0, (prev[value] || 0) - 1)
            }));
        };

        updateValue();
        intervalRef.current = setInterval(updateValue, 150);
    };

    /**
     * Stops the continuous operation when a button is released
     */
    const stopContinuousOperation = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    /**
     * Calculates the change to return to the customer
     * @returns {number} The change amount
     */
    const getChange = () => {
        return Math.round((cashTotal - total) * 100) / 100;
    };

    useEffect(() => {
        return () => stopContinuousOperation();
    }, []);

    /**
     * Completes the payment process
     * For mixed payments, it first sets up the card payment portion
     * Otherwise, creates an invoice and marks the order as paid
     */
    const completePayment = async () => {
        if (mixedPayment) {
            setCardTotal(total - cashTotal);
            setMixedPayment(false);
            setPaymentMethod("card");
            return;
        }

        setIsCompleting(true);
        
        setTimeout(async () => {
            if (order.status === 'COMPLETED') {
                // Handle completed status if needed
            }
            
            const paidOrder: OrderType = {
                ...order,
                status: order.status === 'COMPLETED' ? 'FINISHED' : order.status,
                paid: true,
            }

            const invoiceData: InvoiceType = {
                date: new Date().toISOString(),
                paidWithCard: cardTotal * 1.0,
                paidWithCash: (total - cardTotal) * 1.0,
                order: paidOrder
            }

            await postInvoice(invoiceData);
            updateOrder(paidOrder);
            showMessageModal("SUCCESS", `Order ${order.id}# successfully paid`);
            setIsOpen(false);
            setIsCompleting(false);
        }, 1500); // Short delay for animation
    }

    /**
     * Renders a single cash denomination item with controls
     * @param {typeof CASH_VALUES[0]} item - The cash denomination item to render
     * @returns {JSX.Element} The rendered cash item
     */
    const renderCashItem = ({ value, type, image }: typeof CASH_VALUES[0]) => (
        <motion.div key={value}
            className="p-2 rounded-lg flex items-center gap-1 group"
            style={{
                backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6'
            }}
            whileHover={{ 
                boxShadow: `0 4px 8px rgba(0,0,0,0.1)`,
                y: -2
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <motion.img 
                src={image}
                alt={`${value}€`}
                className={`h-8 w-12 object-contain ${type === 'coin' ? 'rounded-full' : 'rounded'}`}
                whileHover={{ rotate: type === 'coin' ? 10 : 0, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="flex-1 flex items-center gap-2">
                <motion.button
                    className="p-2 rounded-full"
                    style={{
                        backgroundColor: themeColors.secondary,
                        color: themeColors.background
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onMouseDown={() => startContinuousOperation(value, 'subtract')}
                    onMouseUp={stopContinuousOperation}
                    onMouseLeave={stopContinuousOperation}
                >
                    <MdRemove size={20} />
                </motion.button>

                <motion.div 
                    className="flex-1 text-center"
                    animate={{ 
                        scale: cashAmounts[value] > 0 ? [1, 1.05, 1] : 1,
                        transition: { duration: 0.3 }
                    }}
                >
                    <span className="text-sm font-medium block">
                        {cashAmounts[value] > 0 && (`${value >= 1 ? (value * cashAmounts[value]) : (value * cashAmounts[value]).toFixed(2)} €`)}
                    </span>
                    <span className="text-sm font-medium block">
                        × {cashAmounts[value] || 0}
                    </span>
                </motion.div>

                <motion.button
                    className="p-2 rounded-full"
                    style={{
                        backgroundColor: themeColors.secondary,
                        color: themeColors.background
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onMouseDown={() => startContinuousOperation(value, 'add')}
                    onMouseUp={stopContinuousOperation}
                    onMouseLeave={stopContinuousOperation}
                >
                    <MdAdd size={20} />
                </motion.button>
            </div>
        </motion.div>
    );

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                <motion.div
                className={`w-auto p-6 rounded-lg shadow-xl relative overflow-hidden`}
                style={{
                    width: paymentMethod === 'cash' ? '950px' : '650px',
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: themeColors.secondary
                }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 300 
                }}
            >
                {paymentMethod && (
                    <motion.div
                        className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: paymentMethod === 'cash' ? '#10b981' : '#3b82f6',
                            color: '#ffffff'
                        }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {paymentMethod === 'cash' ? 'Cash Payment' : 'Card Payment'}
                        {mixedPayment && ' (Mixed)'}
                    </motion.div>
                )}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-center">Payment Method</h2>
                    <motion.div 
                        className="w-full h-px"
                        style={{ 
                            background: `linear-gradient(to right, transparent, ${themeColors.text}, transparent)` 
                        }}
                        initial={{ opacity: 0, scaleX: 0.7 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                    
                    <AnimatePresence mode="wait">
                    {!paymentMethod ? (
                        <motion.div
                            key="payment-selection"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col gap-6 px-10 py-4"
                        >
                            <p className="text-center text-lg" style={{ color: themeColors.text }}>Select your preferred payment method</p>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <motion.div
                                    className={`p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 cursor-pointer overflow-hidden relative`}
                                    style={{
                                        backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' 
                                        ? '#1f1f1f' 
                                        : '#f3f4f6',
                                        border: `2px solid ${themeColors.secondary}40`
                                    }}
                                    onClick={() => setPaymentMethod('cash')}
                                    whileHover={{ 
                                        scale: 1.03,
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                        borderColor: themeColors.secondary
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <motion.div
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
                                        whileHover={{ y: -5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <FaMoneyBill size={32} className="text-green-500" />
                                    </motion.div>
                                    <h3 className="text-xl font-semibold mt-2" style={{ color: themeColors.text }}>Cash</h3>
                                    <p className="text-sm text-center" style={{ color: `${themeColors.text}99` }}>Pay with physical money</p>
                                    
                                    <motion.div 
                                        className="absolute -right-8 -bottom-8 w-20 h-20 rounded-full"
                                        style={{ backgroundColor: "rgba(16, 185, 129, 0.07)" }}
                                        initial={{ scale: 0 }}
                                        whileHover={{ scale: 1.2 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    />
                                </motion.div>
                                
                                <motion.div
                                    className={`p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 cursor-pointer overflow-hidden relative`}
                                    style={{
                                        backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' 
                                        ? '#1f1f1f' 
                                        : '#f3f4f6',
                                        border: `2px solid ${themeColors.secondary}40`
                                    }}
                                    onClick={() => {setCardTotal(total); setPaymentMethod('card')}}
                                    whileHover={{ 
                                        scale: 1.03,
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                        borderColor: themeColors.secondary
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <motion.div
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                                        whileHover={{ y: -5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <FaCreditCard size={32} className="text-blue-500" />
                                    </motion.div>
                                    <h3 className="text-xl font-semibold mt-2" style={{ color: themeColors.text }}>Card</h3>
                                    <p className="text-sm text-center" style={{ color: `${themeColors.text}99` }}>Pay with credit/debit card</p>
                                    
                                    <motion.div 
                                        className="absolute -right-8 -bottom-8 w-20 h-20 rounded-full"
                                        style={{ backgroundColor: "rgba(59, 130, 246, 0.07)" }}
                                        initial={{ scale: 0 }}
                                        whileHover={{ scale: 1.2 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    />
                                </motion.div>
                            </div>
                            
                            <motion.div
                                className={`p-6 mt-2 rounded-xl shadow-lg flex flex-col items-center gap-3 cursor-pointer overflow-hidden relative`}
                                style={{
                                    backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' 
                                    ? '#1f1f1f' 
                                    : '#f3f4f6',
                                    border: `2px solid ${themeColors.secondary}40`
                                }}
                                onClick={() => {setPaymentMethod('cash'); setMixedPayment(true);}}
                                whileHover={{ 
                                    scale: 1.02,
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                    borderColor: themeColors.secondary
                                }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <div className="flex gap-6 items-center">
                                    <motion.div
                                        className="relative"
                                        whileHover={{ y: -3 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <motion.div
                                            className="w-14 h-14 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
                                        >
                                            <FaMoneyBill size={28} className="text-green-500" />
                                        </motion.div>
                                        <motion.div 
                                            className="absolute -top-1 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                                            initial={{ scale: 1 }}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <FaCreditCard size={18} className="text-blue-500" />
                                        </motion.div>
                                    </motion.div>
                                    
                                    <div className="text-left">
                                        <h3 className="text-xl font-semibold" style={{ color: themeColors.text }}>Mixed Payment</h3>
                                        <p className="text-sm" style={{ color: `${themeColors.text}99` }}>Pay with both cash and card</p>
                                    </div>
                                </div>
                                
                                <motion.div 
                                    className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full"
                                    style={{ 
                                        background: `linear-gradient(45deg, rgba(16, 185, 129, 0.07), rgba(59, 130, 246, 0.07))` 
                                    }}
                                    initial={{ scale: 0 }}
                                    whileHover={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                />
                            </motion.div>
                            
                            <motion.div 
                                className="text-center text-sm mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 0.5 }}
                                style={{ color: `${themeColors.text}80` }}
                            >
                                Total amount: {total.toFixed(2)} €
                            </motion.div>
                        </motion.div>
                    ) : paymentMethod === 'cash' ? (
                        <motion.div
                            key="cash-payment"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-4">
                            <div className="grid grid-cols-4 gap-3 p-2">
                                {CASH_VALUES.map(renderCashItem)}
                                <motion.div key="reset"
                                    className={`p-2 rounded-lg flex items-center justify-center`}
                                >
                                    <div className="relative group select-none" key="cash-reset">
                                        <motion.div
                                            whileHover={{ scale: 1.2, y: -5, rotate: -30 }}
                                            whileTap={{ scale: 0.9, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="text-4xl cursor-pointer"
                                            style={{
                                                color: themeColors.secondary
                                            }}
                                            onClick={() => {
                                                setCashAmounts(CASH_VALUES.reduce((acc, { value }) => ({ ...acc, [value]: 0 }), {}));
                                            }}
                                        >
                                            <PiArrowArcLeftBold />
                                        </motion.div>
                                        <motion.span
                                            initial={{ opacity: 0, y: 5 }}
                                            whileHover={{ opacity: 1, y: 0 }}
                                            className="absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm"
                                            style={{
                                                color: themeColors.text
                                            }}
                                        >
                                            Reset
                                        </motion.span>
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div 
                                className="mt-4 text-lg flex justify-end gap-10"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex flex-col items-end">
                                    <span>Total to Pay:</span>
                                    <span>Amount Paid:</span>
                                    <motion.span 
                                        animate={{ 
                                            color: getChange() < 0 ? '#ef4444' : getChange() > 0 ? '#10b981' : themeColors.text
                                        }}
                                    >
                                        Change:
                                    </motion.span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span>{total.toFixed(2)} €</span>
                                    <motion.span 
                                        animate={{ 
                                            scale: [1, cashTotal > 0 ? 1.05 : 1, 1],
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        {cashTotal.toFixed(2)} €
                                    </motion.span>
                                    <motion.span 
                                        animate={{ 
                                            scale: getChange() !== 0 ? [1, 1.05, 1] : 1,
                                            color: getChange() < 0 ? '#ef4444' : getChange() > 0 ? '#10b981' : themeColors.text,
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        {getChange().toFixed(2)} €
                                    </motion.span>
                                </div>
                            </motion.div>
                            
                            {paymentMethod === 'cash' && cashTotal >= total && (
                                <motion.div
                                    className="mt-2 p-2 rounded-lg text-center"
                                    style={{
                                        backgroundColor: '#10b981',
                                        color: '#ffffff'
                                    }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    Change to return: {getChange().toFixed(2)} €
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="card-payment"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center gap-6 p-8">
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        y: [0, -5, 0]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        color: themeColors.secondary
                                    }}
                                >
                                    <LuSmartphoneNfc size={64} />
                                </motion.div>
                                
                                <motion.div
                                    className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ 
                                        opacity: [0, 0.5, 1, 0], 
                                        scale: [0.5, 1.2, 1.5, 0.5],
                                        transition: { 
                                            duration: 2, 
                                            repeat: Infinity,
                                            repeatDelay: 0.5 
                                        }
                                    }}
                                    style={{ 
                                        backgroundColor: 'rgba(16, 185, 129, 0.2)' 
                                    }}
                                />
                            </motion.div>

                            <motion.div 
                                className="flex flex-col items-center gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="text-xl font-semibold">Processing Payment</h3>
                                <p className="text-sm" style={{ color: themeColors.secondary }}>
                                    Please hold your card near the terminal
                                </p>

                                <motion.div className="flex gap-2 mt-4">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: themeColors.secondary }}
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.6, 1, 0.6]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            </motion.div>

                            <motion.p 
                                className="text-lg font-medium mt-4 px-4 py-2 rounded-lg"
                                style={{ 
                                    backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' 
                                        ? '#1f1f1f' 
                                        : '#f3f4f6',
                                    border: `1px solid ${themeColors.secondary}`
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: 0,
                                    boxShadow: [
                                        `0 0 0 rgba(0, 0, 0, 0)`,
                                        `0 0 10px ${themeColors.secondary}40`,
                                        `0 0 0 rgba(0, 0, 0, 0)`
                                    ]
                                }}
                                transition={{
                                    y: { duration: 0.3 },
                                    opacity: { duration: 0.3 },
                                    boxShadow: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                            >
                                Amount: {cardTotal.toFixed(2)} €
                            </motion.p>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <motion.div 
                        className="flex justify-end gap-4 mt-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.button
                            className="px-4 py-2 cursor-pointer rounded flex items-center gap-2"
                            style={{
                                backgroundColor: themeColors.secondary,
                                color: themeColors.background
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => {
                                setPaymentMethod(null);
                                showMessageModal("INFO", "Payment cancelled");
                                setIsOpen(false);
                                setCashAmounts(CASH_VALUES.reduce((acc, { value }) => ({ ...acc, [value]: 0 }), {}));
                            }}
                        >
                            <IoClose size={18} />
                            <span>Cancel</span>
                        </motion.button>

                        {paymentMethod && (
                            <motion.button
                                className={`px-4 py-2 rounded flex items-center gap-2 ${
                                    (paymentMethod === 'cash' && cashTotal < total && !mixedPayment) 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-600 cursor-pointer'
                                }`}
                                style={{
                                    color: '#ffffff'
                                }}
                                whileHover={{ 
                                    scale: (paymentMethod === 'cash' && cashTotal < total && !mixedPayment) ? 1 : 1.05 
                                }}
                                whileTap={{ 
                                    scale: (paymentMethod === 'cash' && cashTotal < total && !mixedPayment) ? 1 : 0.95 
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                onClick={completePayment}
                                disabled={(paymentMethod === 'cash' && cashTotal < total && !mixedPayment)}
                            >
                                {isCompleting ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheck size={18} />
                                        <span>Confirm Payment</span>
                                    </>
                                )}
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

export default PaymentManager