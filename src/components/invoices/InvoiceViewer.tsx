/**
 * InvoiceViewer.tsx
 * Component for displaying detailed invoice information. 
 */

// React and external libraries
import { motion } from 'motion/react';

// Icons
import { TiPrinter } from 'react-icons/ti';
import { FaCalendarAlt, FaFileInvoice, FaShoppingCart, FaChair } from 'react-icons/fa';
import { BiMoney, BiCreditCard, BiReceipt, BiCollection } from 'react-icons/bi';

// Context
import { useTheme } from '../../context/ThemeContext';

// Types
import { InvoiceType } from '../../types';

// Services
import { printInvoice } from '../../api/printService';

/**
 * Props for the InvoiceViewer component
 */
interface InvoiceViewerProps {
    /** The invoice to display */
    invoice: InvoiceType;
}

/**
 * InvoiceViewer Component
 * 
 * Displays detailed information about a selected invoice including:
 * - Invoice metadata (number, date, order number, table)
 * - Payment details (cash, card, total)
 * - Itemized list of ordered products with quantities and prices
 * 
 * Features a print button that sends the invoice to the "BAR" printer
 * via the print service API.
 * 
 * @param {InvoiceViewerProps} props - Component props
 */
const InvoiceViewer = ({ invoice }: InvoiceViewerProps) => {
    const { themeColors } = useTheme();
    
    /**
     * Handles printing the invoice to the BAR printer
     * Uses the print service API to send the print request
     */
    const handlePrintInvoice = () => {
        if (invoice.id) {
            printInvoice(invoice.id, "BAR");
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header with title and print button */}
            <div className="flex justify-between items-center shrink-0 mb-6">
                <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.5 }}
                >
                    <FaFileInvoice size={20} />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text relative inline-block">
                        Invoice #{invoice.id}
                        <motion.span 
                            className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-accent to-secondary" 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        />
                    </h2>
                </motion.div>
                <motion.button
                    whileHover={{ 
                        scale: 1.1,
                        backgroundColor: `${themeColors.accent}15`
                    }}
                    whileTap={{ 
                        scale: 0.9, 
                        backgroundColor: `${themeColors.accent}25` 
                    }}
                    className="p-3 rounded-full flex items-center justify-center"
                    style={{
                        color: themeColors.accent,
                        backgroundColor: `${themeColors.accent}10`,
                        boxShadow: `0 4px 6px -1px ${themeColors.accent}10, 0 2px 4px -1px ${themeColors.accent}05`
                    }}
                    onClick={handlePrintInvoice}
                    title="Print Invoice"
                    aria-label="Print Invoice"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.2 }}
                >
                    <TiPrinter size={28} />
                    <span className="ml-2 font-medium sr-only md:not-sr-only">Print</span>
                </motion.button>
            </div>

            <div className="flex flex-col gap-4 flex-1 min-h-0">
                {/* Invoice metadata section - 2x2 grid with cards */}
                <div className="grid grid-cols-2 gap-4 shrink-0">
                    <motion.div 
                        className="px-4 py-2 rounded-lg overflow-hidden relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent})`,
                            boxShadow: `0 4px 6px -1px ${themeColors.secondary}15`
                        }}
                    >
                        <div className="absolute top-0 right-0 w-12 h-12 opacity-5 -mr-4 -mt-4">
                            <FaCalendarAlt size={48} />
                        </div>
                        <p className="text-sm mb-1" style={{ color: `${themeColors.text}70` }}>Date</p>
                        <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" style={{ color: themeColors.accent }} />
                            <p className="font-semibold">{new Date(invoice.date).toLocaleString()}</p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="px-4 py-2 rounded-lg overflow-hidden relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.secondary})`,
                            boxShadow: `0 4px 6px -1px ${themeColors.secondary}15`
                        }}
                    >
                        <div className="absolute top-0 right-0 w-12 h-12 opacity-5 -mr-4 -mt-4">
                            <FaShoppingCart size={48} />
                        </div>
                        <p className="text-sm mb-1" style={{ color: `${themeColors.text}70` }}>Order Number</p>
                        <div className="flex items-center">
                            <FaShoppingCart className="mr-2" style={{ color: themeColors.secondary }} />
                            <p className="font-semibold">#{invoice.order.id}</p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="px-4 py-2 rounded-lg overflow-hidden relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.primary})`,
                            boxShadow: `0 4px 6px -1px ${themeColors.secondary}15`
                        }}
                    >
                        <div className="absolute top-0 right-0 w-12 h-12 opacity-5 -mr-4 -mt-4">
                            <FaChair size={48} />
                        </div>
                        <p className="text-sm mb-1" style={{ color: `${themeColors.text}70` }}>Table Number</p>
                        <div className="flex items-center">
                            <FaChair className="mr-2" style={{ color: themeColors.primary }} />
                            <p className="font-semibold">#{invoice.order.table.number}</p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="px-4 py-2 rounded-lg overflow-hidden relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 75%, ${themeColors.accent})`,
                            boxShadow: `0 4px 6px -1px ${themeColors.secondary}15`
                        }}
                    >
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-accent to-secondary opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 0.05 }}
                        />
                        <div className="relative">
                            <p className="text-sm mb-1" style={{ color: `${themeColors.text}70` }}>Total Amount</p>
                            <div className="flex items-center">
                                <BiReceipt className="mr-2" style={{ color: themeColors.accent }} />
                                <p className="font-semibold bg-gradient-to-r from-accent to-secondary bg-clip-text">
                                    {invoice.order.totalWithTax.toFixed(2)} €
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Payment details section */}
                <motion.div 
                    className="px-4 py-2 rounded-lg shrink-0 overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    whileHover={{ 
                        boxShadow: `0 10px 15px -3px ${themeColors.secondary}20, 0 4px 6px -2px ${themeColors.secondary}10`
                    }}
                    style={{
                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.secondary})`,
                        color: themeColors.text,
                        boxShadow: `0 4px 6px -1px ${themeColors.secondary}15, 0 2px 4px -1px ${themeColors.secondary}10`
                    }}
                >
                    <div className="absolute top-0 right-0 w-28 h-28 opacity-5 -mr-10 -mt-10">
                        <BiMoney size={112} />
                    </div>
                    
                    <div className="relative">
                        <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                            <span className="p-1.5 rounded-md bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                                <BiMoney size={20} />
                            </span>
                            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text">
                                Payment Details
                            </span>
                        </h3>
                        
                        <div className="space-y-2">
                            <motion.div 
                                className="flex justify-between items-center py-2 px-3 rounded-md"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, duration: 0.3 }}
                                style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
                            >
                                <span className="flex items-center gap-2 font-medium text-green-700">
                                    <BiMoney className="h-4 w-4" />
                                    Cash Payment
                                </span>
                                <span className="font-medium rounded-md text-green-800">
                                    {invoice.paidWithCash.toFixed(2)} €
                                </span>
                            </motion.div>
                            
                            <motion.div 
                                className="flex justify-between items-center py-2 px-3 rounded-md"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7, duration: 0.3 }}
                                style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}
                            >
                                <span className="flex items-center gap-2 font-medium text-blue-700">
                                    <BiCreditCard className="h-4 w-4" />
                                    Card Payment
                                </span>
                                <span className="font-medium rounded-md text-blue-800">
                                    {invoice.paidWithCard.toFixed(2)} €
                                </span>
                            </motion.div>
                            
                            <motion.div 
                                className="flex justify-between font-bold pt-2 border-t mt-3 px-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                style={{ borderColor: `${themeColors.text}15` }}
                            >
                                <span className="flex items-center gap-2">
                                    <BiReceipt className="h-5 w-5" style={{ color: themeColors.accent }} />
                                    Total Amount:
                                </span>
                                <span className="text-lg bg-gradient-to-r from-accent to-secondary bg-clip-text">
                                    {invoice.order.totalWithTax.toFixed(2)} €
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Order items section with scrollable content */}
                <motion.div 
                    className="p-5 rounded-lg flex flex-col min-h-0 flex-1 overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                    whileHover={{ 
                        boxShadow: `0 10px 15px -3px ${themeColors.secondary}20, 0 4px 6px -2px ${themeColors.secondary}10`
                    }}
                    style={{
                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.primary})`,
                        color: themeColors.text,
                        boxShadow: `0 4px 6px -1px ${themeColors.secondary}15, 0 2px 4px -1px ${themeColors.secondary}10`
                    }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 -mr-10 -mt-10">
                        <BiCollection size={128} />
                    </div>
                    
                    <div className="relative">
                        <h3 className="font-semibold mb-2 text-lg flex items-center gap-2 shrink-0">
                            <span className="p-1.5 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <FaShoppingCart className="h-4 w-4" />
                            </span>
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
                                Order Items
                            </span>
                        </h3>
                        
                        {/* Scrollable list of order items */}
                        <div className="overflow-y-auto min-h-0 flex-1 custom-scrollbar">
                            {invoice.order.orderItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className={`flex justify-between py-2 items-center rounded-md px-3 mb-2 hover:bg-(--accent) hover:bg-opacity-5 transition-colors duration-200`}
                                    style={{
                                        borderBottom: index !== invoice.order.orderItems.length - 1 ? `1px solid ${themeColors.text}10` : 'none'
                                    }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 + (index * 0.05), duration: 0.3 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span 
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                                            style={{
                                                backgroundColor: `${themeColors.secondary}25`,
                                                color: themeColors.text
                                            }}
                                        >
                                            {item.quantity}
                                        </span>
                                        <span className="font-medium">{item.menuItem.product.name}</span>
                                    </div>
                                    <span 
                                        className="font-medium px-2  rounded-md"
                                        style={{
                                            backgroundColor: `${themeColors.primary}15`,
                                            color: themeColors.primary
                                        }}
                                    >
                                        {(item.price * item.quantity).toFixed(2)} €
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InvoiceViewer;