/**
 * TableManager.tsx
 * Component for managing table creation and editing.
 */

// React and external libraries
import React from "react";
import { motion } from "motion/react";
import { IoSaveOutline, IoArrowBackOutline } from "react-icons/io5";

// Context
import { useTheme } from "../../context/ThemeContext";
import { useQuestionModal } from "../../context/QuestionModalContext";

// Services & Utils
import { postTable, putTable } from "../../api/tableService";
import { showMessageModal } from "../../utils/messageModalController";

// Types
import { MapType, TableMapType, TableType } from "../../types";

/**
 * Props for the TableManager component
 * @interface TableManagerProps
 */
type TableManagerProps = {
    /** The table being created or edited */
    table: TableType;
    /** Function to update or clear the table in state */
    setTable: React.Dispatch<React.SetStateAction<TableType | undefined>>;
    /** Function to update the tables list in state */
    setTables: React.Dispatch<React.SetStateAction<TableType[] | undefined>>;
    /** Function to update the map in state */
    setMap: React.Dispatch<React.SetStateAction<MapType | undefined>>;
    /** Function to update the selected table in the map */
    setSelectedTableMap: React.Dispatch<React.SetStateAction<TableMapType | undefined>>;
};

/**
 * TableManager Component
 * 
 * Form for creating and editing tables with fields for table number, capacity, and location.
 * Handles both creation of new tables and updating existing ones while maintaining
 * consistency with the table map and table list.
 * 
 * @param {TableManagerProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const TableManager = ({ table, setTable, setTables, setMap, setSelectedTableMap }: TableManagerProps) => {
    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { askQuestion } = useQuestionModal();

    /**
     * Handles input change for table number
     * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
     */
    const handleTableNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTable({ ...table, number: Number(e.target.value) });
    };

    /**
     * Handles input change for capacity
     * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
     */
    const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTable({ ...table, capacity: Number(e.target.value) });
    };

    /**
     * Handles select change for location
     * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event
     */
    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTable({ ...table, location: e.target.value });
    };

    /**
     * Navigates back to the table list
     */
    const handleBackToList = () => {
        setTable(undefined);
    };

    /**
     * Saves the table data (creates new or updates existing)
     * Prompts for confirmation, updates corresponding state,
     * and shows success/error message
     */
    const saveTable = async () => {
        const confirmed = await askQuestion(`Do you want to save table #${table.number}?`);
        if (confirmed) {
            let tableData: TableType;
            if (table.id === 0) {
                tableData = await postTable(table);
                setTables((prevTables) => {
                    if (!prevTables) return undefined;
                    return [...prevTables, tableData];
                });
            } else {
                tableData = await putTable(table);
                setMap((prevMap) => {
                    if (!prevMap) return undefined;
                    return {
                        ...prevMap,
                        tableMap: prevMap.tableMap.map((t) =>
                            t.table.id === tableData.id ? { ...t, table: tableData } : t
                        ),
                    };
                });
                setSelectedTableMap((prevTableMap) => {
                    if (!prevTableMap) return undefined;
                    return prevTableMap.table.id === tableData.id ? { ...prevTableMap, table: tableData } : prevTableMap;
                });
                setTables((prevTables) => {
                    if (!prevTables) return undefined;
                    return prevTables.map((t) => (t.id === tableData.id ? tableData : t));
                });
            }
            setSelectedTableMap(undefined);
            setTable(undefined);
            showMessageModal("SUCCESS", `Table #${tableData.number} saved successfully`);
        }
    };

    /**
     * Handles save button click event
     * Initiates the table saving process
     */
    const handleSaveTable = () => {
        saveTable();
    };

    /**
     * Handles back button click event
     * Returns to the table list view
     */
    const handleBackButtonClick = () => {
        handleBackToList();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="h-full w-full max-w-[600px] mx-auto p-6 rounded-xl overflow-hidden"
            style={{
                backgroundColor: `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.accent})`,
                color: themeColors.text,
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <motion.h1
                    className="text-2xl font-bold tracking-tight relative group"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                    <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
                        {table.id === 0 ? 'Create New Table' : 'Edit Table'}
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
            </div>

            <div className="grid grid-cols-1 gap-6">
                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <label className="block text-sm text-m font-bold mb-1.5 ml-1">Table Number</label>
                    <input
                        type="number"
                        name="number"
                        value={table.number || 1}
                        onChange={handleTableNumberChange}
                        placeholder="Table Number"
                        className="mt-1 block w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            borderColor: themeColors.secondary + '40',
                            color: themeColors.text,
                            boxShadow: `0 2px 5px -2px ${themeColors.secondary}30`
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    <label className="block text-sm text-m font-bold mb-1.5 ml-1">Capacity</label>
                    <input
                        type="number"
                        name="capacity"
                        value={table.capacity || 1}
                        min={1}
                        onChange={handleCapacityChange}
                        placeholder="Capacity"
                        className="mt-1 block w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            borderColor: themeColors.secondary + '40',
                            color: themeColors.text,
                            boxShadow: `0 2px 5px -2px ${themeColors.secondary}30`
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                >
                    <label className="block text-sm text-m font-bold mb-1.5 ml-1">Location</label>
                    <motion.select
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        name="location"
                        className="mt-1 block w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                            borderColor: themeColors.secondary + '40',
                            color: themeColors.text,
                            boxShadow: `0 2px 5px -2px ${themeColors.secondary}30`
                        }}
                        value={table.location}
                        onChange={handleLocationChange}
                    >
                        <motion.option value="BAR_AREA">Bar Area</motion.option>
                        <motion.option value="INDOOR_SEATING">Indoor Seating</motion.option>
                        <motion.option value="OUTDOOR_SEATING">Outdoor Seating</motion.option>
                    </motion.select>
                </motion.div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-5 mt-8">
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    onClick={handleSaveTable}
                    className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium"
                    style={{
                        background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.secondary})`,
                        color: '#ffffff',
                        boxShadow: `0 4px 15px -3px ${themeColors.accent}50`
                    }}
                >
                    <IoSaveOutline size={18} />
                    Save Table
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    onClick={handleBackButtonClick}
                    className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 90%, ${themeColors.text})`,
                        color: themeColors.text,
                        border: `1px solid ${themeColors.text}20`,
                        boxShadow: `0 4px 15px -3px ${themeColors.text}20`
                    }}
                >
                    <IoArrowBackOutline size={18} />
                    Back to List
                </motion.button>
            </div>
        </motion.div>
    );
};

export default TableManager;
