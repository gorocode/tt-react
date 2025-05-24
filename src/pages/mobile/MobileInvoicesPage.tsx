/**
 * MobileInvoicesPage.tsx
 * Mobile-optimized version of the InvoicesPage for viewing and managing invoice records.
 */

// React and external libraries
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Types
import { InvoiceType, InvoiceFiltersType } from '../../types';

// Context
import { useTheme } from '../../context/ThemeContext';

// Components
import InvoiceViewer from '../../components/invoices/InvoiceViewer';
import MobileInvoiceFilters from '../../components/invoices/MobileInvoiceFilters';
import MobilePageWrapper from '../../components/global/MobilePageWrapper';

// API Services
import { getInvoicesByFilters } from '../../api/invoiceService';

// Icons
import { MdFilterList, MdArrowBack, MdClose } from 'react-icons/md';

/**
 * MobileInvoicesPage Component
 * 
 * Mobile-optimized interface for viewing and managing invoice records, featuring:
 * - Vertically stacked layout for better mobile viewing
 * - Switch between invoice list and detail views
 * - Collapsible filter section to save space
 * - Touch-friendly interface with large tap targets
 */
const MobileInvoicesPage = () => {
    // Theme hook
    const { themeColors } = useTheme();
    
    // State management
    const [invoices, setInvoices] = useState<InvoiceType[]>();
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>();
    const [filters, setFilters] = useState<InvoiceFiltersType>({ paymentType: 'all' }); // Using the correct InvoiceFiltersType
    const [showFilters, setShowFilters] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    
    /**
     * Fetch invoices whenever filters change
     */
    useEffect(() => {
        fetchInvoices();
    }, [filters]);
    
    /**
     * Handles selecting an invoice to view its details
     */
    const handleSelectInvoice = (invoice: InvoiceType | null) => {
        setSelectedInvoice(invoice);
        if (invoice) {
            setShowDetails(true);
        }
    };

    /**
     * Fetch invoices based on current filter settings
     */
    const fetchInvoices = async () => {
        try {
            const invoiceData = await getInvoicesByFilters(filters);
            const sortedInvoices = invoiceData.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setInvoices(sortedInvoices);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };
    
    /**
     * Filter action button for the header
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
    
    /**
     * Back button for the header (when in detail view)
     */
    const BackButton = (
        <motion.button
            onClick={() => {
                setShowDetails(false);
                setSelectedInvoice(null);
            }}
            className="p-2 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ 
                color: themeColors.text
            }}
        >
            <MdArrowBack size={24} />
        </motion.button>
    );
    
    /**
     * Format date for display
     */
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    /**
     * Format amount for display
     */
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    
    /**
     * Render loading state while invoices are being fetched
     */
    if (invoices === undefined) {
        return (
            <MobilePageWrapper title="Invoices" headerAction={FilterButton}>
                <div className="flex h-full w-full items-center justify-center p-4">
                    <div 
                        className="p-6 rounded-xl border border-secondary border-opacity-20 w-full"
                        style={{ backgroundColor: themeColors.background, color: themeColors.text }}
                    >
                        <div className="flex items-center justify-center space-x-3">
                            <div 
                                className="w-5 h-5 rounded-full animate-pulse"
                                style={{ backgroundColor: themeColors.accent }}
                            ></div>
                            <p>Loading invoices...</p>
                        </div>
                    </div>
                </div>
            </MobilePageWrapper>
        );
    }

    return (
        <MobilePageWrapper 
            title={showDetails && selectedInvoice ? `Invoice #${selectedInvoice.id}` : "Invoices"} 
            headerAction={showDetails ? BackButton : FilterButton}
        >
            {/* Filters panel - full screen modal on mobile */}
            <AnimatePresence>
                {showFilters && !showDetails && (
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
                                <h2 className="text-lg font-semibold">Filter Invoices</h2>
                                <motion.button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <MdClose size={20} />
                                </motion.button>
                            </div>
                            <MobileInvoiceFilters 
                                filters={filters} 
                                setFilters={setFilters} 
                                onClose={() => setShowFilters(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Invoices list view */}
            {!showDetails && (
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: `${themeColors.secondary}25` }}>
                    {invoices.length > 0 ? (
                        <div className="p-2">
                            {invoices.map(invoice => (
                                <motion.div
                                    key={invoice.id}
                                    className="border-b last:border-b-0 p-3 cursor-pointer"
                                    style={{ borderColor: `${themeColors.secondary}20` }}
                                    whileHover={{ backgroundColor: `${themeColors.accent}10` }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectInvoice(invoice)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium" style={{ color: themeColors.text }}>
                                            Invoice #{invoice.id}
                                        </span>
                                        <span 
                                            className="px-2 py-1 rounded text-xs font-medium"
                                            style={{ 
                                                backgroundColor: invoice.paidWithCash > 0 && invoice.paidWithCard === 0
                                                    ? '#4CAF50' // Cash only
                                                    : invoice.paidWithCard > 0 && invoice.paidWithCash === 0
                                                        ? '#2196F3' // Card only
                                                        : '#9E9E9E', // Mixed or unknown
                                                color: '#FFF'
                                            }}
                                        >
                                            {invoice.paidWithCash > 0 && invoice.paidWithCard === 0
                                                ? 'CASH'
                                                : invoice.paidWithCard > 0 && invoice.paidWithCash === 0
                                                    ? 'CARD'
                                                    : 'MIXED'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: `${themeColors.text}80` }}>
                                            {formatDate(invoice.date)}
                                        </span>
                                        <span style={{ color: themeColors.accent, fontWeight: 'bold' }}>
                                            {formatAmount(invoice.paidWithCash + invoice.paidWithCard)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div 
                            className="p-8 text-center"
                            style={{ color: `${themeColors.text}70` }}
                        >
                            <p className="mb-2 font-medium">No invoices found</p>
                            <p className="text-sm">Try adjusting your filters to see more results</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Invoice detail view */}
            <AnimatePresence>
                {showDetails && selectedInvoice && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="border rounded-lg overflow-hidden"
                        style={{ borderColor: `${themeColors.secondary}25` }}
                    >
                        <InvoiceViewer invoice={selectedInvoice} />
                    </motion.div>
                )}
            </AnimatePresence>
        </MobilePageWrapper>
    );
};

export default MobileInvoicesPage;
