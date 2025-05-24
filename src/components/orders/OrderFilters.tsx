import { motion } from "motion/react";

// Context
import { useTheme } from "../../context/ThemeContext";

// Types
import { OrderFiltersType } from "../../types";

/**
 * Props for the OrderFilters component
 * @interface OrderFiltersProps
 */
interface OrderFiltersProps {
    /** Current filter settings */
    filters: OrderFiltersType;
    /** Function to update filter settings */
    setFilters: React.Dispatch<React.SetStateAction<OrderFiltersType>>;
}

/**
 * OrderFilters Component
 * 
 * Filter interface for orders with controls for filtering by ID, status, payment status,
 * and date range. Provides visual feedback for selected filters and theme-aware styling.
 *
 * @param {OrderFiltersProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const OrderFilters = ({ filters, setFilters}: OrderFiltersProps) => {
    const { themeColors } = useTheme();

    return (
        <>

            {/* Filter controls container */}
            <div className="flex flex-col gap-4 overflow-auto h-full">
                {/* Order ID text filter */}
                <div className="flex items-center gap-4">
                    <label className="text-lg font-semibold w-1/4 text-right">Order ID</label>
                    <input
                        type="text"
                        placeholder="253"
                        onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-all duration-300"
                        style={{
                            backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6',
                            color: themeColors.text,
                            borderColor: `${themeColors.secondary}60`
                        }}
                    />
                </div>

                {/* Order status multi-select filter */}
                <div className="flex items-center gap-4">
                    <label className="text-lg font-semibold w-1/4 text-right">Status</label>
                    <div className="flex-1 flex justify-between flex-wrap gap-2">
                        {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FINISHED'].map((status) => (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                key={status}
                                className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all duration-300 ${filters.status?.includes(status) ?
                                    status === 'PENDING' ? 'bg-yellow-500 bg-opacity-20 text-yellow-800 border-yellow-500' :
                                        status === 'IN_PROGRESS' ? 'bg-blue-500 bg-opacity-20 text-blue-800 border-blue-500' :
                                            status === 'COMPLETED' ? 'bg-green-500 bg-opacity-20 text-green-800 border-green-500' :
                                                'bg-purple-500 bg-opacity-20 text-purple-800 border-purple-500' : 'hover:shadow-btn'}`}
                                style={{
                                    backgroundColor: filters.status?.includes(status) ? '' : themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6',
                                    color: filters.status?.includes(status) ? '' : themeColors.text,
                                    borderColor: filters.status?.includes(status) ? '' : `${themeColors.secondary}60`
                                }}
                                onClick={() => setFilters((prev) => {
                                    // Toggle status selection - remove if already selected, add if not
                                    const newStatus = prev.status?.includes(status) ? prev.status?.filter(s => s !== status) : [...(prev.status || []), status];
                                    return { ...prev, status: newStatus };
                                })}
                            >
                                {status.replace('_', ' ')}
                            </motion.button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-lg font-semibold w-1/4 text-right">Payment</label>
                    <div className="flex-1 flex justify-between flex-wrap gap-2">
                        {[
                            { label: 'All', value: undefined },
                            { label: 'Paid', value: true },
                            { label: 'Unpaid', value: false }
                        ].map((status) => (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                key={status.label}
                                className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all duration-300 ${filters.paid === status.value ?
                                    status.value === true ? 'bg-green-500 bg-opacity-20 text-green-800 border-green-500' :
                                        status.value === false ? 'bg-red-500 bg-opacity-20 text-red-800 border-red-500' :
                                            'bg-blue-500 bg-opacity-20 text-blue-800 border-blue-500' : 'hover:shadow-btn'}`}
                                style={{
                                    backgroundColor: filters.paid === status.value ? '' : themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6',
                                    color: filters.paid === status.value ? '' : themeColors.text,
                                    borderColor: filters.paid === status.value ? '' : `${themeColors.secondary}60`
                                }}
                                onClick={() => setFilters((prev) => ({
                                    ...prev,
                                    // Toggle payment status filter - clear if already selected, set if not
                                    paid: prev.paid === status.value ? undefined : status.value
                                }))}
                            >
                                {status.label}
                            </motion.button>
                        ))}
                    </div>
                </div>
                {/* Date range filters */}
                <div className="flex items-center gap-4">
                    <label className="text-lg font-semibold w-1/4 text-right">From</label>
                    <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        onChange={(e) => setFilters({ ...filters, startDate: `${e.target.value}:00` })}
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-all duration-300"
                        style={{
                            backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6',
                            color: themeColors.text,
                            borderColor: `${themeColors.secondary}60`
                        }}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-lg font-semibold w-1/4 text-right">To</label>
                    <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        onChange={(e) => setFilters({ ...filters, endDate: `${e.target.value}:00` })}
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-all duration-300"
                        style={{
                            backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6',
                            color: themeColors.text,
                            borderColor: `${themeColors.secondary}60`
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default OrderFilters;