/**
 * InvoicesPage.tsx
 * Main page for viewing and managing invoice records.
 */

// React and external libraries
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// Types
import { InvoiceType, InvoiceFiltersType } from '../types';

// Context
import { useTheme } from '../context/ThemeContext';

// Components
import InvoiceList from '../components/invoices/InvoiceList';
import InvoiceViewer from '../components/invoices/InvoiceViewer';
import InvoiceFilters from '../components/invoices/InvoiceFilters';

// API Services
import { getInvoicesByFilters } from '../api/invoiceService';

/**
 * InvoicesPage Component
 * 
 * Provides an interface for viewing and managing invoice records, featuring:
 * - Chronological listing of all invoices (newest first)
 * - Detailed invoice viewing with order information
 * - Filtering by payment type and date range
 * - Responsive two-panel layout
 */
const InvoicesPage = () => {
    // Theme hook
    const { themeColors } = useTheme();
    
    // State management
    const [invoices, setInvoices] = useState<InvoiceType[]>();
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>();
    const [filters, setFilters] = useState<InvoiceFiltersType>({ paymentType: 'all' });

    /**
     * Fetch invoices whenever filters change
     */
    useEffect(() => {
        fetchInvoices();
    }, [filters]);
    
    /**
     * Handles selecting an invoice to view its details
     * @param {InvoiceType|null} invoice - The invoice to select or null to clear selection
     */
    const handleSelectInvoice = (invoice: InvoiceType | null) => {
        setSelectedInvoice(invoice);
    };

    /**
     * Fetch invoices based on current filter settings
     * Sorts invoices by date (newest first)
     * @returns {Promise<void>}
     */
    const fetchInvoices = async () => {
        const invoiceData = await getInvoicesByFilters(filters);
        const sortedInvoices = invoiceData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setInvoices(sortedInvoices);
    };
    
    // Filter update is handled directly by setFilters in the InvoiceFilters component

    /**
     * Render loading state while invoices are being fetched
     */
    if (invoices === undefined) {
        return (
            <div className="flex h-full w-full items-center justify-center p-4">
                <div className="p-6 rounded-xl shadow-card border border-secondary border-opacity-20"
                    style={{ backgroundColor: themeColors.background, color: themeColors.text }}
                >
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-accent to-secondary bg-clip-text">
                        Invoices
                    </h2>
                    <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent to-secondary animate-pulse"></div>
                        <p>Loading invoices...</p>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Render the main invoices interface with two panels:
     * 1. Left panel: Invoice list with filters
     * 2. Right panel: Selected invoice details
     */
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="grid h-full w-full gap-4 p-2 grid-cols-[1fr_auto] grid-rows-[auto] rounded-lg">
                {/* Invoices List Panel */}
                <motion.div 
                    className="p-5 rounded-lg h-full overflow-visible" 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ 
                        backgroundColor: themeColors.background, 
                        color: themeColors.text, 
                        boxShadow: `0 10px 30px -5px ${themeColors.secondary}20, 0 8px 10px -6px ${themeColors.secondary}10`
                    }}
                >
                    <div className='flex items-center justify-between mb-4'>
                        {/* Animated page title */}
                        <motion.h1
                            className="text-3xl font-bold tracking-tight relative group"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
                                Invoices
                            </span>
                            <motion.div
                                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                                style={{ background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})` }}
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 0.3 }}
                                whileHover={{ opacity: 0.8, height: "3px", bottom: "-3px" }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.h1>
                        {/* Invoice filter controls */}
                        <InvoiceFilters filters={filters} setFilters={setFilters} />
                    </div>

                    {/* Invoice list with virtualized scrolling */}
                    <div className="h-[calc(100vh-130px)] overflow-visible">
                        <InvoiceList
                            invoices={invoices}
                            selectedInvoice={selectedInvoice}
                            setSelectedInvoice={handleSelectInvoice}
                        />                    
                    </div>
                </motion.div>

                {/* Invoice Viewer Panel */}
                <motion.div 
                    className="p-5 rounded-xl min-w-[450px] overflow-hidden relative"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ 
                        backgroundColor: themeColors.background, 
                        color: themeColors.text,
                        boxShadow: `0 10px 25px -5px ${themeColors.secondary}20, 0 8px 10px -6px ${themeColors.secondary}10`,
                        borderLeft: `2px solid ${themeColors.accent}40`
                    }}
                >
                    {selectedInvoice ? (
                        <InvoiceViewer invoice={selectedInvoice} />
                    ) : (
                        <motion.div 
                            className="h-full flex flex-col items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ color: `${themeColors.text}70` }}
                        >
                            <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-accent to-secondary opacity-10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-center font-semibold text-lg mb-2">No Invoice Selected</p>
                            <p className="text-center max-w-xs">Select an invoice from the list to view its details</p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default InvoicesPage;