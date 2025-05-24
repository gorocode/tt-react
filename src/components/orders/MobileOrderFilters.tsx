/**
 * MobileOrderFilters.tsx
 * Mobile-optimized filter component for orders
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { OrderFiltersType } from '../../types';
import { MdClear, MdFilterAlt, MdCalendarToday, MdAttachMoney, MdShoppingCart } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';

interface MobileOrderFiltersProps {
  filters: OrderFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<OrderFiltersType>>;
  onClose?: () => void;
}

/**
 * MobileOrderFilters Component
 * 
 * Mobile-optimized interface for filtering orders with:
 * - Tab-based filter categories for better space usage
 * - Touch-friendly controls with large hit areas
 * - Immediate visual feedback
 * - Compact design suited for mobile screens
 */
const MobileOrderFilters = ({ filters, setFilters, onClose }: MobileOrderFiltersProps) => {
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState<'status' | 'payment' | 'date' | 'id'>('status');
  const [tempFilters, setTempFilters] = useState<OrderFiltersType>(filters);
  
  // Apply filters and close modal
  const applyFilters = () => {
    setFilters(tempFilters);
    if (onClose) onClose();
  };
  
  // Reset all filters
  const resetFilters = () => {
    const defaultFilters: OrderFiltersType = { status: ['IN_PROGRESS'] };
    setTempFilters(defaultFilters);
  };
  
  // Count active filters to show in badge
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (tempFilters.orderId) count++;
    if (tempFilters.status && tempFilters.status.length > 0) count++;
    if (tempFilters.paid !== undefined) count++;
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
          onClick={() => setActiveTab('status')}
          style={{
            backgroundColor: activeTab === 'status' ? `${themeColors.accent}15` : 'transparent',
            color: activeTab === 'status' ? themeColors.accent : themeColors.text
          }}
        >
          <MdFilterAlt size={18} />
          <span className="text-sm font-medium">Status</span>
          {tempFilters.status && tempFilters.status.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
          )}
        </motion.button>
        
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
          {tempFilters.paid !== undefined && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
          )}
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
          onClick={() => setActiveTab('id')}
          style={{
            backgroundColor: activeTab === 'id' ? `${themeColors.accent}15` : 'transparent',
            color: activeTab === 'id' ? themeColors.accent : themeColors.text
          }}
        >
          <MdShoppingCart size={18} />
          <span className="text-sm font-medium">Order ID</span>
          {tempFilters.orderId && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
          )}
        </motion.button>
      </div>
      
      {/* Filter content based on active tab */}
      <div className="p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'status' && (
            <motion.div
              key="status-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h3 className="font-medium text-sm mb-3">Order Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FINISHED'].map((status) => (
                  <motion.button
                    key={status}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border flex items-center justify-between`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    style={{
                      backgroundColor: tempFilters.status?.includes(status) 
                        ? status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' 
                        : status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.15)'
                        : status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(139, 92, 246, 0.15)'
                        : `${themeColors.background}`,
                      color: tempFilters.status?.includes(status)
                        ? status === 'PENDING' ? 'rgb(234, 88, 12)'
                        : status === 'IN_PROGRESS' ? 'rgb(37, 99, 235)'
                        : status === 'COMPLETED' ? 'rgb(5, 150, 105)'
                        : 'rgb(124, 58, 237)'
                        : themeColors.text,
                      borderColor: tempFilters.status?.includes(status)
                        ? status === 'PENDING' ? 'rgba(245, 158, 11, 0.5)'
                        : status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.5)'
                        : status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.5)'
                        : 'rgba(139, 92, 246, 0.5)'
                        : `${themeColors.secondary}30`
                    }}
                    onClick={() => {
                      setTempFilters((prev) => {
                        const newStatus = prev.status?.includes(status)
                          ? prev.status?.filter(s => s !== status)
                          : [...(prev.status || []), status];
                        return { ...prev, status: newStatus };
                      });
                    }}
                  >
                    <span>{status.replace('_', ' ')}</span>
                    {tempFilters.status?.includes(status) && (
                      <FaCheck size={14} />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'payment' && (
            <motion.div
              key="payment-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h3 className="font-medium text-sm mb-3">Payment Status</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'All', value: undefined },
                  { label: 'Paid', value: true },
                  { label: 'Unpaid', value: false }
                ].map((option) => (
                  <motion.button
                    key={option.label}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border flex items-center justify-between`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    style={{
                      backgroundColor: tempFilters.paid === option.value
                        ? option.value === true ? 'rgba(16, 185, 129, 0.15)'
                        : option.value === false ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(59, 130, 246, 0.15)'
                        : `${themeColors.background}`,
                      color: tempFilters.paid === option.value
                        ? option.value === true ? 'rgb(5, 150, 105)'
                        : option.value === false ? 'rgb(220, 38, 38)'
                        : 'rgb(37, 99, 235)'
                        : themeColors.text,
                      borderColor: tempFilters.paid === option.value
                        ? option.value === true ? 'rgba(16, 185, 129, 0.5)'
                        : option.value === false ? 'rgba(239, 68, 68, 0.5)'
                        : 'rgba(59, 130, 246, 0.5)'
                        : `${themeColors.secondary}30`
                    }}
                    onClick={() => {
                      setTempFilters((prev) => ({
                        ...prev,
                        paid: prev.paid === option.value ? undefined : option.value
                      }));
                    }}
                  >
                    <span>{option.label}</span>
                    {tempFilters.paid === option.value && (
                      <FaCheck size={14} />
                    )}
                  </motion.button>
                ))}
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
          
          {activeTab === 'id' && (
            <motion.div
              key="id-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h3 className="font-medium text-sm mb-3">Order ID</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter order ID"
                  value={tempFilters.orderId || ''}
                  onChange={(e) => setTempFilters({ 
                    ...tempFilters, 
                    orderId: e.target.value || undefined 
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
                    className="mt-2 py-1.5 px-3 rounded text-xs flex items-center gap-1 w-full justify-center"
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

export default MobileOrderFilters;
