/**
 * MobileInvoiceFilters.tsx
 * Mobile-optimized filter component for invoices
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { InvoiceFiltersType } from '../../types';
import { MdClear, MdAttachMoney, MdCalendarToday, MdReceiptLong, MdTableBar } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';

interface MobileInvoiceFiltersProps {
  filters: InvoiceFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InvoiceFiltersType>>;
  onClose?: () => void;
}

/**
 * MobileInvoiceFilters Component
 * 
 * Mobile-optimized interface for filtering invoices with:
 * - Tab-based filter categories for better space usage
 * - Touch-friendly controls with large hit areas
 * - Immediate visual feedback
 * - Compact design suited for mobile screens
 */
const MobileInvoiceFilters = ({ filters, setFilters, onClose }: MobileInvoiceFiltersProps) => {
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState<'payment' | 'date' | 'ids' | 'table'>('payment');
  const [tempFilters, setTempFilters] = useState<InvoiceFiltersType>(filters);
  
  // Apply filters and close modal
  const applyFilters = () => {
    setFilters(tempFilters);
    if (onClose) onClose();
  };
  
  // Reset all filters
  const resetFilters = () => {
    const defaultFilters: InvoiceFiltersType = { paymentType: 'all' };
    setTempFilters(defaultFilters);
  };
  
  // Count active filters to show in badge
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (tempFilters.invoiceId) count++;
    if (tempFilters.orderId) count++;
    if (tempFilters.tableNumber) count++;
    if (tempFilters.paymentType && tempFilters.paymentType !== 'all') count++;
    if (tempFilters.minTotal || tempFilters.maxTotal) count++;
    if (tempFilters.startDate || tempFilters.endDate) count++;
    return count;
  };

  return (
    <div className="flex flex-col overflow-hidden w-full max-w-md shadow-xl"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.text,
        maxHeight: '80vh'
      }}
    >
      {/* Filter tabs */}
      <div className="flex border-b sticky top-0 z-10" style={{ borderColor: `${themeColors.secondary}25`, backgroundColor: `${themeColors.accent}08` }}>
        <motion.button
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 relative`}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('payment')}
          style={{
            backgroundColor: activeTab === 'payment' ? `${themeColors.accent}15` : 'transparent',
            color: activeTab === 'payment' ? themeColors.accent : themeColors.text
          }}
        >
          <MdAttachMoney size={18} />
          <span className="text-sm font-medium">Payment</span>
          {(tempFilters.paymentType && tempFilters.paymentType !== 'all') || 
           (tempFilters.minTotal || tempFilters.maxTotal) ? (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
          ) : null}
        </motion.button>
        
        <motion.button
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 relative`}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('date')}
          style={{
            backgroundColor: activeTab === 'date' ? `${themeColors.accent}15` : 'transparent',
            color: activeTab === 'date' ? themeColors.accent : themeColors.text
          }}
        >
          <MdCalendarToday size={18} />
          <span className="text-sm font-medium">Date</span>
          {(tempFilters.startDate || tempFilters.endDate) && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
          )}
        </motion.button>
        
        <motion.button
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 relative`}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('ids')}
          style={{
            backgroundColor: activeTab === 'ids' ? `${themeColors.accent}15` : 'transparent',
            color: activeTab === 'ids' ? themeColors.accent : themeColors.text
          }}
        >
          <MdReceiptLong size={18} />
          <span className="text-sm font-medium">IDs</span>
          {(tempFilters.invoiceId || tempFilters.orderId) && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
          )}
        </motion.button>
        
        <motion.button
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 relative`}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('table')}
          style={{
            backgroundColor: activeTab === 'table' ? `${themeColors.accent}15` : 'transparent',
            color: activeTab === 'table' ? themeColors.accent : themeColors.text
          }}
        >
          <MdTableBar size={18} />
          <span className="text-sm font-medium">Table</span>
          {tempFilters.tableNumber && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
          )}
        </motion.button>
      </div>
      
      {/* Filter content based on active tab */}
      <div className="p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'payment' && (
            <motion.div
              key="payment-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="font-medium text-sm mb-3">Payment Type</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'card', 'cash', 'mixed'] as const).map((type) => (
                    <motion.button
                      key={type}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border flex items-center justify-between`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      style={{
                        backgroundColor: tempFilters.paymentType === type
                          ? type === 'card' ? 'rgba(59, 130, 246, 0.15)'
                          : type === 'cash' ? 'rgba(16, 185, 129, 0.15)'
                          : type === 'mixed' ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(107, 114, 128, 0.15)'
                          : `${themeColors.background}`,
                        color: tempFilters.paymentType === type
                          ? type === 'card' ? 'rgb(37, 99, 235)'
                          : type === 'cash' ? 'rgb(5, 150, 105)'
                          : type === 'mixed' ? 'rgb(124, 58, 237)'
                          : 'rgb(75, 85, 99)'
                          : themeColors.text,
                        borderColor: tempFilters.paymentType === type
                          ? type === 'card' ? 'rgba(59, 130, 246, 0.5)'
                          : type === 'cash' ? 'rgba(16, 185, 129, 0.5)'
                          : type === 'mixed' ? 'rgba(139, 92, 246, 0.5)'
                          : 'rgba(107, 114, 128, 0.5)'
                          : `${themeColors.secondary}30`
                      }}
                      onClick={() => {
                        setTempFilters(prev => ({
                          ...prev,
                          paymentType: prev.paymentType === type ? 'all' : type
                        }));
                      }}
                    >
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      {tempFilters.paymentType === type && (
                        <FaCheck size={14} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: `${themeColors.secondary}15` }}>
                <h3 className="font-medium text-sm mb-3">Amount Range</h3>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium">Minimum ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={tempFilters.minTotal || ''}
                      onChange={(e) => setTempFilters({
                        ...tempFilters,
                        minTotal: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: `${themeColors.secondary}50`
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium">Maximum ($)</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={tempFilters.maxTotal || ''}
                      onChange={(e) => setTempFilters({
                        ...tempFilters,
                        maxTotal: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: `${themeColors.secondary}50`
                      }}
                    />
                  </div>
                </div>
                
                {(tempFilters.minTotal || tempFilters.maxTotal) && (
                  <motion.button
                    className="mt-2 py-1.5 px-3 rounded text-xs flex items-center gap-1 w-full justify-center"
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: 'rgb(220, 38, 38)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                    onClick={() => setTempFilters(prev => ({
                      ...prev,
                      minTotal: undefined,
                      maxTotal: undefined
                    }))}
                  >
                    <MdClear size={14} />
                    <span>Clear Amount Range</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'date' && (
            <motion.div
              key="date-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-medium text-sm mb-3">Date Range</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium block">From</label>
                <input
                  type="datetime-local"
                  value={tempFilters.startDate?.split(':00')[0] || ''}
                  onChange={(e) => setTempFilters({ 
                    ...tempFilters, 
                    startDate: e.target.value ? `${e.target.value}:00` : undefined 
                  })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: `${themeColors.secondary}50`
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium block">To</label>
                <input
                  type="datetime-local"
                  value={tempFilters.endDate?.split(':00')[0] || ''}
                  onChange={(e) => setTempFilters({ 
                    ...tempFilters, 
                    endDate: e.target.value ? `${e.target.value}:00` : undefined 
                  })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: `${themeColors.secondary}50`
                  }}
                />
              </div>
              
              {(tempFilters.startDate || tempFilters.endDate) && (
                <motion.button
                  className="mt-2 py-1.5 px-3 rounded text-xs flex items-center gap-1 w-full justify-center"
                  whileTap={{ scale: 0.98 }}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'rgb(220, 38, 38)',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                  onClick={() => setTempFilters(prev => ({
                    ...prev,
                    startDate: undefined,
                    endDate: undefined
                  }))}
                >
                  <MdClear size={14} />
                  <span>Clear Dates</span>
                </motion.button>
              )}
            </motion.div>
          )}
          
          {activeTab === 'ids' && (
            <motion.div
              key="ids-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="font-medium text-sm mb-2">Invoice ID</h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Enter invoice ID"
                    value={tempFilters.invoiceId || ''}
                    onChange={(e) => setTempFilters({ 
                      ...tempFilters, 
                      invoiceId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: `${themeColors.secondary}50`
                    }}
                  />
                  
                  {tempFilters.invoiceId && (
                    <motion.button
                      className="py-1.5 px-3 rounded text-xs flex items-center gap-1 w-full justify-center"
                      whileTap={{ scale: 0.98 }}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'rgb(220, 38, 38)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                      onClick={() => setTempFilters(prev => ({
                        ...prev,
                        invoiceId: undefined
                      }))}
                    >
                      <MdClear size={14} />
                      <span>Clear Invoice ID</span>
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: `${themeColors.secondary}15` }}>
                <h3 className="font-medium text-sm mb-2">Order ID</h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Enter order ID"
                    value={tempFilters.orderId || ''}
                    onChange={(e) => setTempFilters({ 
                      ...tempFilters, 
                      orderId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: `${themeColors.secondary}50`
                    }}
                  />
                  
                  {tempFilters.orderId && (
                    <motion.button
                      className="py-1.5 px-3 rounded text-xs flex items-center gap-1 w-full justify-center"
                      whileTap={{ scale: 0.98 }}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'rgb(220, 38, 38)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                      onClick={() => setTempFilters(prev => ({
                        ...prev,
                        orderId: undefined
                      }))}
                    >
                      <MdClear size={14} />
                      <span>Clear Order ID</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'table' && (
            <motion.div
              key="table-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h3 className="font-medium text-sm mb-3">Table Number</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Enter table number"
                  value={tempFilters.tableNumber || ''}
                  onChange={(e) => setTempFilters({ 
                    ...tempFilters, 
                    tableNumber: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: `${themeColors.secondary}50`
                  }}
                />
                
                {tempFilters.tableNumber && (
                  <motion.button
                    className="mt-2 py-1.5 px-3 rounded text-xs flex items-center gap-1 w-full justify-center"
                    whileTap={{ scale: 0.98 }}
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: 'rgb(220, 38, 38)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                    onClick={() => setTempFilters(prev => ({
                      ...prev,
                      tableNumber: undefined
                    }))}
                  >
                    <MdClear size={14} />
                    <span>Clear Table Number</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Action buttons */}
      <div className="p-4 border-t sticky bottom-0 z-10" 
        style={{ 
          borderColor: `${themeColors.secondary}25`,
          backgroundColor: themeColors.background,
          boxShadow: `0 -2px 10px rgba(0,0,0,0.05)`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Active filters:</span>
            <span className="bg-accent bg-opacity-20 text-accent px-2 py-0.5 rounded-full text-xs font-medium">
              {getActiveFilterCount()}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <motion.button
            className="btn btn-secondary btn-with-icon-animation flex items-center gap-2 py-2 px-4 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFilters}
          >
            Reset
          </motion.button>
          
          <motion.button
            className="btn btn-accent btn-with-icon-animation flex items-center gap-2 py-2 px-4 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={applyFilters}
          >
            Apply
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MobileInvoiceFilters;
