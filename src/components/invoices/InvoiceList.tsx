import { motion } from 'motion/react';

// Context
import { useTheme } from '../../context/ThemeContext';

// Types
import { InvoiceType } from '../../types';

// Icons
import { FaCalendarAlt, FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from 'react-icons/fa';

/**
 * Props for the InvoiceList component
 */
interface InvoiceListProps {
    /** Array of invoices to display */
    invoices?: InvoiceType[];
    /** Currently selected invoice (if any) */
    selectedInvoice?: InvoiceType | null;
    /** Callback to handle invoice selection/deselection */
    setSelectedInvoice: (invoice: InvoiceType | null) => void;
}

/**
 * InvoiceList Component
 * 
 * Displays a scrollable list of invoices with visual indication of selection state.
 * Features:
 * - Responsive card-based design for each invoice
 * - Visual highlighting of selected invoice
 * - Toggle selection on click (select/deselect)
 * - Payment type indicators (Card, Cash, Mixed)
 * - Animated hover and tap effects
 * 
 * @param {InvoiceListProps} props - Component props
 */
const InvoiceList = ({ invoices, selectedInvoice, setSelectedInvoice }: InvoiceListProps) => {
    const { themeColors } = useTheme();
    
    /**
     * Toggles invoice selection state
     * If the clicked invoice is already selected, it will be deselected
     * @param {InvoiceType} invoice - The invoice to select or deselect
     */
    const selectInvoice = (invoice: InvoiceType) => {
        if (selectedInvoice?.id === invoice.id) {
            setSelectedInvoice(null);
        } else {
            setSelectedInvoice(invoice);
        }
    };

    return (
        <div className="space-y-4 custom-scrollbar overflow-y-auto overflow-x-hidden p-2 h-full">
            {/* Empty state message when no invoices match filters */}
            {invoices?.length === 0 ? (
                <motion.div 
                    className="text-center py-12 flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    style={{ color: `${themeColors.text}80` }}
                >
                    <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-secondary to-accent opacity-20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="font-medium text-lg">No invoices found with the current filters</p>
                    <p className="mt-2 max-w-md">Try adjusting your filter settings or check back later for new invoices.</p>
                </motion.div>
            ) : (
                invoices?.map((invoice, index) => (
                    <motion.div
                        key={invoice.id}
                        className={`p-5 rounded-lg cursor-pointer border-l-4 relative overflow-hidden group`}
                        style={{
                            backgroundColor: selectedInvoice?.id === invoice.id 
                                ? `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.accent})`
                                : `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.accent})`,
                            color: themeColors.text,
                            borderLeftColor: selectedInvoice?.id === invoice.id ? themeColors.accent : 'transparent',
                            boxShadow: selectedInvoice?.id === invoice.id
                                ? `0 10px 25px -5px ${themeColors.accent}25, 0 8px 10px -6px ${themeColors.accent}10`
                                : `0 4px 15px -3px ${themeColors.secondary}20`
                        }}
                        onClick={() => selectInvoice(invoice)}
                        whileHover={{ 
                            y: -5,
                            boxShadow: `0 15px 30px -5px ${themeColors.secondary}30, 0 10px 15px -5px ${themeColors.secondary}20`
                        }}
                        whileTap={{ y: 0, scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: index * 0.05, duration: 0.3 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        {/* Highlight overlay when selected */}
                        {selectedInvoice?.id === invoice.id && (
                            <motion.div 
                                className="absolute inset-0 opacity-5 z-0" 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.05 }}
                                style={{ 
                                    background: `linear-gradient(125deg, ${themeColors.accent}50 0%, transparent 60%)` 
                                }}
                            />
                        )}
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <p className={`font-semibold text-lg mb-1.5 group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-secondary group-hover:bg-clip-text transition-all duration-300`}
                                   style={{ color: selectedInvoice?.id === invoice.id ? themeColors.accent : themeColors.text }}
                                >
                                    Invoice #{invoice.id}
                                </p>
                                <div className="text-sm flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5"
                                          style={{ 
                                             backgroundColor: `color-mix(in srgb, ${themeColors.background} 80%, ${themeColors.secondary})`,
                                             color: themeColors.accent
                                          }}>
                                        Order #{invoice.order.id}
                                    </span>
                                    <span className="text-gray-500 px-1">•</span>
                                    <span className="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5"
                                          style={{ 
                                             backgroundColor: `color-mix(in srgb, ${themeColors.background} 80%, ${themeColors.secondary})`,
                                             color: themeColors.accent
                                          }}>
                                        Table #{invoice.order.table.number}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <motion.p 
                                    className="text-lg font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text relative"
                                    initial={{}}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 10 }}
                                >
                                    {invoice.order.totalWithTax.toFixed(2)} €
                                    <motion.span 
                                        className="absolute -bottom-0.5 right-0 h-0.5 bg-gradient-to-r from-accent to-secondary"
                                        style={{ width: '0%' }}
                                        whileHover={{ width: '100%' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.p>
                                <div className="mt-2">
                                    {/* Payment type indicator */}
                                    {invoice.paidWithCard > 0 && invoice.paidWithCash > 0 ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                              style={{ 
                                                backgroundColor: 'rgba(139, 92, 246, 0.15)', 
                                                color: 'rgb(91, 33, 182)' 
                                              }}>
                                            <FaExchangeAlt className="mr-1" /> Mixed
                                        </span>
                                    ) : invoice.paidWithCard > 0 ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                              style={{ 
                                                backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                                                color: 'rgb(30, 64, 175)' 
                                              }}>
                                            <FaCreditCard className="mr-1" /> Card
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                              style={{ 
                                                backgroundColor: 'rgba(34, 197, 94, 0.15)', 
                                                color: 'rgb(22, 101, 52)' 
                                              }}>
                                            <FaMoneyBillWave className="mr-1" /> Cash
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Invoice date with calendar icon */}
                        <div className="text-sm mt-4 pt-3 border-t flex items-center"
                             style={{ 
                                 color: `${themeColors.text}80`,
                                 borderColor: `${themeColors.text}15`
                             }}>
                            <FaCalendarAlt className="h-3.5 w-3.5 mr-2" />
                            {new Date(invoice.date).toLocaleString()}
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default InvoiceList;