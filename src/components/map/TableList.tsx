import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Icons
import { MdAdd, MdAddBox, MdDining, MdOutdoorGrill } from 'react-icons/md';
import { BiSolidEdit } from "react-icons/bi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaQrcode, FaGlassMartiniAlt, FaChair, FaMapMarkerAlt, FaPrint } from "react-icons/fa";

// Context
import { useTheme } from '../../context/ThemeContext';
import { useQuestionModal } from '../../context/QuestionModalContext';
import { useMessageModal } from '../../context/MessageModalContext';

// Components
import TableQR from './TableQr';

// Types & Services
import { TableType } from '../../types';
import { deleteTable } from '../../api/tableService';
import { printMultipleQRCodes } from '../../utils/printQr';

/**
 * Props for the TableList component
 * @interface TableListProps
 */
type TableListProps = {
    /** List of tables to display, undefined if loading or no tables */
    tables: TableType[] | undefined;
    /** Whether the component is in edit mode, enabling creation/editing */
    isEditMode: boolean;
    /** Callback to add a table to the map canvas */
    addTableToMap: (table: TableType) => void;
    /** Callback when creating a new table */
    onCreate: () => void;
    /** Callback when editing an existing table */
    onEdit: (table: TableType) => void;
    /** Callback to fetch data */
    fetchData: () => void;
};

/**
 * TableList Component
 * 
 * Displays a categorized list of tables organized by location (Bar area, Indoor, Outdoor).
 * Provides QR code generation, table editing, and table management functionality.
 * Tables can be added to the map canvas via click, or managed through edit controls.
 *
 * @param {TableListProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const TableList = ({ tables, isEditMode, addTableToMap, onCreate, onEdit, fetchData }: TableListProps) => {
    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { askQuestion } = useQuestionModal();
    const { showMessageModal } = useMessageModal();
    
    // State for the currently selected table for QR code display
    const [qrTable, setQrTable] = useState<TableType | null>(null);

    /**
     * Prompts for confirmation and deletes a table if confirmed
     * 
     * @param {TableType} table - The table to delete
     */
    const askDeleteTable = async (table: TableType) => {
        const confirmed = await askQuestion(`Do you want to delete #${table.number} table?`);
        if (confirmed) {
            const confirmed2 = await askQuestion(`Are you sure you want to delete #${table.number} table?`);
            if (confirmed2) {
                await deleteTable(table.id);
                fetchData();
                showMessageModal("SUCCESS", "Table deleted successfully");
            }
        }
    }

    return (
        <>
            {qrTable && (
                <TableQR table={qrTable} onClose={() => setQrTable(null)} />
            )}

            <div className="flex justify-between items-center mb-4 gap-5 w-full">
                <AnimatePresence>
                    <div className="flex items-center gap-5">
                        <motion.h1
                            className="text-3xl font-bold tracking-tight relative group"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
                                Tables
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


                        {isEditMode && (
                            <div className="relative group select-none " key="new-table">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="btn btn-icon-sm btn-accent btn-with-icon-animation"
                                    onClick={onCreate}
                                >
                                    <MdAdd size={24} />
                                </motion.div>
                                <span
                                    className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
                                >
                                    New Table
                                </span>
                            </div>

                        )}
                    </div>
                    <motion.div
                        key="print-qr"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="relative group select-none"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2, boxShadow: `0 10px 15px -3px ${themeColors.accent}40, 0 4px 6px -4px ${themeColors.accent}30` }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            style={{
                                boxShadow: `0 4px 6px -1px ${themeColors.accent}30, 0 2px 4px -2px ${themeColors.accent}20`,
                                background: `linear-gradient(135deg, ${themeColors.accent}, color-mix(in srgb, ${themeColors.accent} 70%, ${themeColors.secondary}))`
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer text-white transition-all duration-300"
                            onClick={() => tables?.length ? printMultipleQRCodes(tables) : null}
                        >
                            <FaPrint className="text-lg" />
                            <span className="text-sm font-medium">Print All QR Codes</span>

                            <motion.span
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: tables && tables.length > 0 ? 1 : 0.5,
                                    scale: tables && tables.length > 0 ? 1 : 0.8,
                                    backgroundColor: tables && tables.length > 0 ? themeColors.background : "rgba(255,255,255,0.2)"
                                }}
                                className="ml-1 flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold"
                                style={{ color: themeColors.accent }}
                            >
                                {tables?.length || 0}
                            </motion.span>
                        </motion.div>
                    </motion.div>

                </AnimatePresence>
            </div>

            <div className="space-y-4 custom-scrollbar overflow-y-auto overflow-x-hidden p-2 h-full w-full">
                {/* Grouped Table List by Location Sections */}
                {['Bar area', 'Indoor Seating', 'Outdoor Seating'].map((section) => {
                    // Helper function to get the appropriate icon for each location section
                    const getIcon = () => {
                        switch (section) {
                            case 'Bar area': return <FaGlassMartiniAlt className="mr-2 text-lg" />;
                            case 'Indoor Seating': return <MdDining className="mr-2 text-xl" />;
                            case 'Outdoor Seating': return <MdOutdoorGrill className="mr-2 text-xl" />;
                            default: return null;
                        }
                    };

                    const sectionTables = tables?.filter(table =>
                        table.location.toLowerCase() === section.toLowerCase().replace(' ', '_')
                    ) || [];

                    return (
                        <motion.div
                            key={section}
                            className="mb-8 w-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, delay: section === 'Bar area' ? 0.1 : section === 'Indoor Seating' ? 0.2 : 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <motion.h2
                                    className="text-xl font-semibold flex items-center"
                                    whileHover={{ x: 5 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    {getIcon()}
                                    <span>{section}</span>
                                    <motion.span
                                        className="ml-2 px-2 text-xs rounded-full"
                                        style={{
                                            backgroundColor: `color-mix(in srgb, ${themeColors.accent} 15%, ${themeColors.background})`,
                                            color: themeColors.accent,
                                            border: `1px solid ${themeColors.accent}30`
                                        }}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {sectionTables.length}
                                    </motion.span>
                                </motion.h2>
                            </div>
                            <div className="w-full flex items-center mb-4">
                                <div
                                    className="w-12 h-0.5 rounded-full"
                                    style={{ background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})` }}
                                ></div>
                                <div className="flex-1 h-px bg-gradient-to-r to-transparent ml-1"
                                    style={{ background: `linear-gradient(to right, ${themeColors.secondary}50, ${themeColors.background}10, transparent)` }}></div>
                            </div>

                            <div className="grid grid-cols-[repeat(auto-fill,_minmax(180px,_1fr))] grid-rows-auto gap-4">
                                {tables ? tables
                                    ?.filter((table) => table.location.toLowerCase() === section.toLowerCase().replace(' ', '_'))
                                    .map((table) => (
                                        <motion.div
                                            key={`t-${table.id}`}
                                            initial={{ scale: 0.95, opacity: 0.8, y: 10 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                y: 0,
                                                boxShadow: `0 4px 12px -2px ${themeColors.accent}25, 0 2px 6px -1px ${themeColors.accent}10`
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 25,
                                                delay: 0.1 * (table.number % 5) // Stagger animation
                                            }}
                                            whileHover={{
                                                scale: 1.05,
                                                y: -5,
                                                zIndex: 5,
                                                boxShadow: `0 10px 25px -5px ${themeColors.accent}30, 0 8px 10px -6px ${themeColors.accent}20`
                                            }}
                                            className={`relative flex flex-col w-40 justify-between px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-300 ${!isEditMode ? 'cursor-pointer' : ''}`}
                                            style={{
                                                backgroundColor: `color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.accent})`,
                                                color: themeColors.text,
                                                borderLeft: `3px solid ${themeColors.accent}80`,
                                                boxShadow: `0 4px 12px -2px ${themeColors.accent}15, 0 2px 6px -1px ${themeColors.accent}05`
                                            }}
                                            onClick={() => addTableToMap(table)}
                                        >
                                            {/* Table number badge/chip in top-right corner */}
                                            <div className="absolute -top-2 -right-2 flex items-center justify-center"
                                                style={{ zIndex: 2 }}
                                            >
                                                <motion.div
                                                    className="h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
                                                    style={{
                                                        backgroundColor: themeColors.accent,
                                                        color: themeColors.background,
                                                        boxShadow: `0 4px 6px -1px ${themeColors.accent}40`
                                                    }}
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    #{table.number}
                                                </motion.div>
                                            </div>

                                            <div className="w-full flex items-center mb-3">
                                                <div
                                                    className="w-12 h-0.5 rounded-full"
                                                    style={{ background: `linear-gradient(to right, ${themeColors.accent}, transparent)` }}
                                                ></div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center">
                                                    <FaChair className="mr-2 text-sm opacity-70" />
                                                    <p className="text-sm font-medium">
                                                        Capacity: <span className="font-semibold">{table.capacity}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <FaMapMarkerAlt className="mr-2 text-sm opacity-70" />
                                                    <p className="text-sm font-medium">
                                                        {table.location
                                                            .replace('_', ' ')
                                                            .toLowerCase()
                                                            .replace(/^./, (str) => str.toUpperCase())}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-full mt-2 pt-3 border-t border-secondary border-opacity-10">
                                                <motion.div
                                                    key={`actions-${table.id}`}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                                    className="flex gap-2 justify-between items-center"
                                                >
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={{ type: "spring", stiffness: 400 }}
                                                        className="flex items-center gap-1.5 rounded-lg bg-secondary bg-opacity-10 hover:bg-opacity-20 text-sm font-medium transition-all duration-200 cursor-pointer"
                                                        onClick={(e) => { e.stopPropagation(); setQrTable(table) }}
                                                    >
                                                        <FaQrcode size={28} />
                                                        {!isEditMode && (
                                                            <span>QR Code</span>
                                                        )}
                                                    </motion.button>

                                                    {isEditMode && (<>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="text-blue-500 text-sm font-medium transition-all duration-200 cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); onEdit(table) }}
                                                        >
                                                            <BiSolidEdit size={28} />
                                                        </motion.button>

                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                            className="text-red-500 text-sm font-medium transition-all duration-200 cursor-pointer"
                                                            onClick={(e) => { e.stopPropagation(); askDeleteTable(table) }}
                                                        >
                                                            <RiDeleteBin6Fill size={28} />
                                                        </motion.button>
                                                    </>
                                                    )}
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )
                                    ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="flex flex-col items-center justify-center p-10 text-center rounded-xl backdrop-blur-sm border border-dashed"
                                        style={{
                                            borderColor: `${themeColors.accent}40`,
                                            background: `linear-gradient(135deg, ${themeColors.background}, color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.accent}))`,
                                            boxShadow: `0 10px 30px -15px ${themeColors.accent}30`
                                        }}
                                    >
                                        <motion.div
                                            initial={{ scale: 0, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            whileHover={{ rotate: 5, scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                                            className="text-6xl mb-6 opacity-80"
                                            style={{ color: themeColors.accent }}
                                        >
                                            <FaChair />
                                        </motion.div>
                                        <motion.h3
                                            className="text-xl font-bold mb-3"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            style={{ color: themeColors.accent }}
                                        >
                                            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                                                No Tables Available
                                            </span>
                                        </motion.h3>
                                        <motion.p
                                            className="text-md opacity-70 max-w-xs"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.8 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            {isEditMode ?
                                                "Click the + button above to create your first table" :
                                                "No tables have been created yet. Please contact management."}
                                        </motion.p>

                                        {isEditMode && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5, type: "spring" }}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="mt-6 px-5 py-2 rounded-full flex items-center gap-2"
                                                style={{
                                                    backgroundColor: '#22c55e',
                                                    color: 'white',
                                                    boxShadow: '0 4px 10px -2px rgba(34, 197, 94, 0.5)'
                                                }}
                                                onClick={onCreate}
                                            >
                                                <MdAddBox />
                                                <span>Create New Table</span>
                                            </motion.button>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}</div>
        </>
    );
};

export default TableList;
