/**
 * InvoiceFilters.tsx
 * Component for filtering invoices by various criteria.
 */

// React and external libraries
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// Icons
import { MdFilterList, MdFilterAlt, MdDateRange, MdAttachMoney, MdCreditCard } from 'react-icons/md';
import { BiReset } from 'react-icons/bi';
import { FaTable, FaReceipt } from 'react-icons/fa';

// Context
import { useTheme } from '../../context/ThemeContext';

// Types
import { InvoiceFiltersType } from '../../types';

/**
 * Props for the InvoiceFilters component
 */
interface InvoiceFiltersProps {
    /** Current filter settings */
    filters: InvoiceFiltersType;
    /** Setter function for updating filters */
    setFilters: React.Dispatch<React.SetStateAction<InvoiceFiltersType>>;
}

/**
 * InvoiceFilters Component
 * 
 * Provides a dropdown interface for filtering invoices by various criteria including:
 * - Invoice number and order number
 * - Table number
 * - Payment type (all, card, cash, mixed)
 * - Total amount range
 * - Date range
 * 
 * The component renders as a button that expands to show all filter options when clicked.
 * 
 * @param {InvoiceFiltersProps} props - The component props
 */
const InvoiceFilters = ({ filters, setFilters }: InvoiceFiltersProps) => {
    const { themeColors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Initialize filters with default values on component mount
     */
    useEffect(() => {
        resetFilters();
    }, []);

    // Common styles for form inputs
    const baseClassName = "text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-inner";
    const inputClassName = `w-full px-3 py-2 ${baseClassName}`;
    
    /**
     * Reset filters to default values
     * Sets date range to yesterday 2:00 AM through tomorrow 2:00 AM
     * and payment type to 'all'
     */
    const resetFilters = () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(2, 0, 0, 0);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(2, 0, 0, 0);

        setFilters({ 
            paymentType: 'all', 
            startDate: startDate.toISOString().replace("Z", ""), 
            endDate: endDate.toISOString().replace("Z", "") 
        });
    }

    return (
        <div className="relative">
            {/* Trigger button with enhanced animations */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg relative overflow-hidden group"
                whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 10px 15px -3px ${themeColors.secondary}20, 0 4px 6px -2px ${themeColors.secondary}10`
                }}
                whileTap={{ scale: 0.98 }}
                initial={{}}
                animate={{
                    backgroundColor: isOpen ? `${themeColors.accent}15` : 'transparent',
                    transition: { duration: 0.3 }
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                style={{
                    color: themeColors.text,
                    boxShadow: isOpen 
                        ? `0 10px 15px -3px ${themeColors.accent}15, 0 4px 6px -2px ${themeColors.accent}10`
                        : `0 4px 6px -1px ${themeColors.secondary}10, 0 2px 4px -1px ${themeColors.secondary}05`
                }}
            >
                {/* Button background effect */}
                <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{}}
                    animate={{
                        background: isOpen 
                            ? `linear-gradient(45deg, ${themeColors.accent}15, ${themeColors.secondary}15)`
                            : `linear-gradient(45deg, ${themeColors.secondary}10, ${themeColors.primary}10)`
                    }}
                />
                
                {/* Icon with animated ring effect */}
                <motion.div 
                    className="relative"
                    animate={{
                        rotate: isOpen ? 180 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <MdFilterAlt 
                        className={`text-xl relative z-10`} 
                        style={{ color: isOpen ? themeColors.accent : themeColors.secondary }}
                    />
                    {isOpen && (
                        <motion.div 
                            className="absolute inset-0 rounded-full" 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.8, opacity: [0, 0.5, 0] }}
                            transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
                            style={{ backgroundColor: `${themeColors.accent}30` }}
                        />
                    )}
                </motion.div>
                
                {/* Text with gradient effect when active */}
                <span 
                    className={`font-medium relative z-10 ${isOpen ? 'bg-gradient-to-r from-accent to-secondary bg-clip-text' : ''}`}
                >
                    Filters
                </span>
            </motion.button>

            {/* Enhanced dropdown content */}
            {isOpen && (
                <motion.div
                    className="absolute right-0 mt-3 w-[540px] rounded-xl z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        boxShadow: `0 20px 25px -5px ${themeColors.accent}20, 0 10px 10px -5px ${themeColors.accent}10`,
                        border: `1px solid ${themeColors.accent}30`
                    }}
                >
                    {/* Gradient header */}
                    <div className="p-4 relative overflow-hidden">
                        <div 
                            className="absolute inset-0 opacity-10" 
                            style={{ 
                                background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.secondary})` 
                            }}
                        />
                        <div className="relative flex justify-between items-center">
                            <h3 className="font-semibold text-xl flex items-center gap-2">
                                <span className="p-1.5 rounded-md bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                                    <MdFilterAlt className="h-4 w-4" />
                                </span>
                                <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text">
                                    Filter Invoices
                                </span>
                            </h3>
                            <motion.button
                                onClick={resetFilters}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 relative overflow-hidden"
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: `0 4px 6px -1px ${themeColors.accent}20, 0 2px 4px -1px ${themeColors.accent}10`
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                style={{
                                    backgroundColor: `${themeColors.background}90`,
                                    color: themeColors.text,
                                    border: `1px solid ${themeColors.accent}40`,
                                    boxShadow: `0 1px 3px 0 ${themeColors.accent}15, 0 1px 2px 0 ${themeColors.accent}05`
                                }}
                            >
                                <motion.div 
                                    className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-300"
                                    style={{ 
                                        background: `linear-gradient(45deg, ${themeColors.accent}, ${themeColors.secondary})` 
                                    }}
                                />
                                <BiReset className="text-accent" />
                                <span>Reset Filters</span>
                            </motion.button>
                        </div>
                    </div>
                    
                    {/* Divider */}
                    <div 
                        className="h-px w-full" 
                        style={{ backgroundColor: `${themeColors.text}10` }}
                    />
                    <div className="w-full h-px mb-4" style={{ background: `linear-gradient(to right, transparent, ${themeColors.primary}, ${themeColors.secondary}, transparent)` }}></div>

                    <div className="p-5">
                        {/* Invoice / Order Number */}
                        <div className="flex gap-4 relative">
                            <div className="absolute -left-2.5 top-0 h-full flex items-center">
                                <div className="h-full w-1 rounded-full bg-gradient-to-b from-accent to-transparent opacity-40" />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.accent }}>
                                    <FaReceipt className="opacity-80" />
                                    Invoice Number
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    placeholder="Invoice #"
                                    value={filters.invoiceId || ''}
                                    onChange={(e) => setFilters({ ...filters, invoiceId: e.target.value ? parseInt(e.target.value) : undefined })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 80%, ${themeColors.accent})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.accent}15`
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.accent }}>
                                    <MdFilterList className="opacity-80" />
                                    Order Number
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    placeholder="Order #"
                                    value={filters.orderId || ''}
                                    onChange={(e) => setFilters({ ...filters, orderId: e.target.value ? parseInt(e.target.value) : undefined })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 80%, ${themeColors.accent})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.accent}15`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Table Number / Payment Type */}
                        <div className="flex gap-4 relative">
                            <div className="absolute -left-2.5 top-0 h-full flex items-center">
                                <div className="h-full w-1 rounded-full bg-gradient-to-b from-primary to-transparent opacity-40" />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.secondary }}>
                                    <FaTable className="opacity-80" />
                                    Table Number
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    placeholder="Table #"
                                    value={filters.tableNumber || ''}
                                    onChange={(e) => setFilters({ ...filters, tableNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 80%, ${themeColors.secondary})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.secondary}15`
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.secondary }}>
                                    <MdCreditCard className="opacity-80" />
                                    Payment Type
                                </label>
                                <select 
                                    className={`${inputClassName} appearance-none`}
                                    value={filters.paymentType || 'all'}
                                    onChange={(e) => setFilters({ ...filters, paymentType: e.target.value as any })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 80%, ${themeColors.secondary})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.secondary}15`
                                    }}
                                >
                                    <option value="all">All Payments</option>
                                    <option value="card">Card Only</option>
                                    <option value="cash">Cash Only</option>
                                    <option value="mixed">Mixed Payments</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-700">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Amount Range */}
                        <div className="flex gap-4 relative">
                            <div className="absolute -left-2.5 top-0 h-full flex items-center">
                                <div className="h-full w-1 rounded-full bg-gradient-to-b from-secondary to-transparent opacity-40" />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.accent }}>
                                    <MdAttachMoney className="opacity-80" />
                                    Minimum Total
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    placeholder="Min €"
                                    value={filters.minTotal}
                                    onChange={(e) => setFilters({ ...filters, minTotal: parseFloat(e.target.value) })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 85%, ${themeColors.accent})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.accent}15`
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.accent }}>
                                    <MdAttachMoney className="opacity-80" />
                                    Maximum Total
                                </label>
                                <input
                                    type="number"
                                    className={inputClassName}
                                    placeholder="Max €"
                                    value={filters.maxTotal}
                                    onChange={(e) => setFilters({ ...filters, maxTotal: parseFloat(e.target.value) })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 85%, ${themeColors.accent})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.accent}15`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="col-span-2 flex gap-4 relative mt-1">
                            <div className="absolute -left-2.5 top-0 h-full flex items-center">
                                <div className="h-full w-1 rounded-full bg-gradient-to-b from-accent via-primary to-secondary opacity-40" />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.secondary }}>
                                    <MdDateRange className="opacity-80" />
                                    Start Date
                                </label>
                                <input
                                    type="datetime-local"
                                    className={inputClassName}
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 85%, ${themeColors.secondary})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.secondary}15`
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-sm mb-1.5 font-medium" style={{ color: themeColors.secondary }}>
                                    <MdDateRange className="opacity-80" />
                                    End Date
                                </label>
                                <input
                                    type="datetime-local"
                                    className={inputClassName}
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 85%, ${themeColors.secondary})`,
                                        color: themeColors.text,
                                        borderColor: 'transparent',
                                        boxShadow: `inset 0 2px 4px 0 ${themeColors.secondary}15`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default InvoiceFilters;