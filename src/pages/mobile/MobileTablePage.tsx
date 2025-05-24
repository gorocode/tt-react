/**
 * MobileTablePage.tsx
 * Mobile-optimized version of the TablePage for managing restaurant floor maps and tables.
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// Types and Context
import { MapType, TableMapType, TableType } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { useQuestionModal } from "../../context/QuestionModalContext";
import { useMessageModal } from "../../context/MessageModalContext";
import { useAuth } from "../../context/AuthContext";

// API Services
import { getAllMaps, putMap, deleteMap } from "../../api/mapService";
import { getAllTables, putTable, deleteTable } from "../../api/tableService";

// Utilities
import { printMultipleQRCodes } from "../../utils/printQr";

// Components
import Map from "../../components/map/Map";
import MobilePageWrapper from "../../components/global/MobilePageWrapper";

// Hooks & Utilities
import useResponsiveStage from "../../utils/useResponsiveStage";
import { v4 as uuidv4 } from "uuid";

// Icons
import { IoIosSave, IoMdRefresh } from "react-icons/io";
import { PiArrowArcLeftBold } from "react-icons/pi";
import { BiSolidEdit } from "react-icons/bi";
import { MdAdd, MdMoreVert, MdQrCode2, MdLocationOn, MdClose, MdPeople } from "react-icons/md";
import { RiDeleteBin6Fill } from "react-icons/ri";

/**
 * MobileTablePage component
 * 
 * Mobile-optimized interface for managing restaurant floor maps and tables, featuring:
 * - Vertical stacking of UI elements for better mobile UX
 * - Touch-friendly controls and larger tap targets
 * - Collapsible sections to conserve screen space
 * - Maintains all functionality of the desktop version
 */
const MobileTablePage = () => {
    // Authentication context - not using auth in this component
    const { hasRole } = useAuth();

    // Theme and modal hooks
    const { themeColors } = useTheme();
    const { askQuestion } = useQuestionModal();
    const { showMessageModal } = useMessageModal();

    // Main state for maps and tables
    const [map, setMap] = useState<MapType | undefined>({
        name: "",
        id: 0,
        tableMap: []
    });
    const [maps, setMaps] = useState<MapType[]>();
    const [tables, setTables] = useState<TableType[]>();

    // Responsive layout utilities - using the same dimensions as TablePage for consistent scaling
    const { containerRef, scaleFactor, isPortrait } = useResponsiveStage(800, 800);

    // UI state management
    const [isEditMode, setIsEditMode] = useState(false);
    const [tableEditorVisible, setTableEditorVisible] = useState(false);
    const [showActions, setShowActions] = useState(false);
    
    // Ref for the actions menu container
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const [selectedTableMap, setSelectedTableMap] = useState<TableMapType>();
    const [selectedTable, setSelectedTable] = useState<TableType>();
    const [tableEditMode, setTableEditMode] = useState(false);
    const [editingTable, setEditingTable] = useState<TableType | null>(null);

    /**
     * Load initial data when component mounts
     */
    useEffect(() => {
        fetchData();
    }, []);
    
    /**
     * Handle clicks outside the actions menu
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showActions && actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setShowActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActions]);

    /**
     * Update the map when a table map is selected/edited
     */
    useEffect(() => {
        setMap((prev) => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                tableMap: prev.tableMap?.map((tableMap) => {
                    if (tableMap.table.id === selectedTableMap?.table.id) {
                        return selectedTableMap;
                    }
                    return tableMap;
                }),
            };
        });
    }, [selectedTableMap]);

    /**
     * Fetches maps and tables data from the API
     */
    const fetchData = async (mapData?: MapType) => {
        const mapsData = await getAllMaps();
        setMaps(mapsData);
        setMap(mapsData.find(m => m.id === mapData?.id) || mapsData.find(m => m.id === map?.id) || mapsData[0]);

        const tablesData = await getAllTables();
        setTables(tablesData);
    };

    /**
     * Handles map selection change from the dropdown
     */
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMap = maps?.find(m => m.id === Number(event.target.value));
        setMap(selectedMap || undefined);
    };

    /**
     * Creates a new empty map and enters edit mode
     */
    const newMap = () => {
        setMap({
            id: 0,
            name: "New Map",
            tableMap: []
        });
        setIsEditMode(true);
        setShowActions(false);
    };

    /**
     * Prompts for confirmation and deletes the current map if confirmed
     */
    const askDeleteMap = async () => {
        if (!map) return;

        const confirmed = await askQuestion(`Do you want to delete ${map?.name} map?`);
        if (!confirmed) return;

        const confirmedAgain = await askQuestion(`Are you sure you want to delete ${map?.name} map?`);
        if (!confirmedAgain) return;

        await deleteMap(map?.id);
        await fetchData();
        showMessageModal("SUCCESS", "Map deleted successfully");

        setShowActions(false);
    };

    /**
     * Prompts for confirmation and saves the current map changes if confirmed
     */
    const askSaveMap = async () => {
        if (!map) return;

        const confirmed = await askQuestion(`Do you want to save ${map?.name} map changes?`);
        if (!confirmed) return;

        const updatedMap = await putMap(map);
        await fetchData(updatedMap);
        setTableEditorVisible(false);
        setIsEditMode(false);
        showMessageModal("SUCCESS", "Map saved successfully");
    };

    /**
     * Adds a table to the current map with default position and styling
     */
    const addTableToMap = (table: TableType) => {
        if (!isEditMode) return;

        setMap((prev) => {
            if (!prev) return prev;

            const exists = prev.tableMap?.some(t => t.table.id === table.id);
            if (exists) {
                showMessageModal("INFO", "Table already exists in this map");
                return prev;
            }

            const tableMapData: TableMapType = {
                id: parseInt(uuidv4().replace(/\D/g, "").slice(0, 10)),
                gapX: 0,
                gapY: 0,
                angle: 0,
                shape: "square",
                color: themeColors.text,
                height: 100,
                width: 100,
                x: 100,
                y: 100,
                z: 0,
                table: table
            };

            return {
                ...prev,
                tableMap: [...(prev.tableMap || []), tableMapData]
            };
        });
    };

    /**
 * Removes the currently selected table from the map
 * Also closes the table editor if it's open
 */
    const deleteTableFromMap = () => {
        if (!map || !selectedTableMap) return;
        setMap((prevMap) => {
            if (!prevMap) return prevMap;

            return {
                ...prevMap,
                tableMap: prevMap.tableMap?.filter((tableMap) => tableMap.table.id !== selectedTableMap.table.id)
            };
        });
        setTableEditorVisible(false);
    }

    /**
     * Resets the current map to its original state
     */
    const resetMap = () => {
        setMap((prevMap) => {
            return maps?.find((mapFound) => mapFound.id === prevMap?.id) || maps?.[0];
        });
        setIsEditMode(false);
        setTableEditorVisible(false);
        setShowActions(false);
    };

    /**
     * Updates the map name
     */
    const updateMapName = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!map) return;
        setMap({ ...map, name: e.target.value });
    };

    /**
     * Removes a table from the current map
     */
    // const removeTableFromMap = (tableMapId: number) => {
    //     if (!isEditMode || !map) return;

    //     setMap({
    //         ...map,
    //         tableMap: map.tableMap?.filter(t => t.id !== tableMapId) || []
    //     });

    //     setSelectedTableMap(undefined);
    //     setTableEditorVisible(false);
    // };

    /**
     * Action button for the header
     */
    const ActionButton = (
        hasRole(["ADMIN", "MANAGER"]) && (
            <motion.button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
                style={{
                    color: themeColors.text
                }}
            >
                <MdMoreVert size={24} />
            </motion.button>
        )
    );

    return (
        <MobilePageWrapper title={isEditMode ? `Edit ${map?.name || 'Map'}` : 'Table Manager'} headerAction={ActionButton}>
            {/* Actions dropdown */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        ref={actionsMenuRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-4 top-12 z-50 bg-white rounded-lg shadow-lg overflow-hidden"
                        style={{
                            backgroundColor: themeColors.background,
                            border: `1px solid ${themeColors.secondary}25`
                        }}
                    >
                        <div className="py-1 w-48">
                            {isEditMode ? (
                                <>
                                    <motion.button
                                        onClick={askSaveMap}
                                        className="flex items-center w-full px-4 py-3 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <IoIosSave size={18} className="mr-2" />
                                        Save Map
                                    </motion.button>
                                    <motion.button
                                        onClick={resetMap}
                                        className="flex items-center w-full px-4 py-3 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <PiArrowArcLeftBold size={18} className="mr-2" />
                                        Cancel Editing
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.button
                                        onClick={() => {
                                            setIsEditMode(true);
                                            setShowActions(false);
                                        }}
                                        className="flex items-center w-full px-4 py-3 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <BiSolidEdit size={18} className="mr-2" />
                                        Edit Map
                                    </motion.button>
                                    <motion.button
                                        onClick={newMap}
                                        className="flex items-center w-full px-4 py-3 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <MdAdd size={18} className="mr-2" />
                                        New Map
                                    </motion.button>
                                    {map && (
                                        <motion.button
                                            onClick={askDeleteMap}
                                            className="flex items-center w-full px-4 py-3 text-left"
                                            whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                            style={{ color: "#f44336" }}
                                        >
                                            <RiDeleteBin6Fill size={18} className="mr-2" />
                                            Delete Map
                                        </motion.button>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map selector - Positioned at the top */}
            {!isEditMode && maps && maps.length > 0 && (
                <div className="mb-2 border rounded-lg px-2 py-1" style={{ borderColor: `${themeColors.secondary}25` }}>
                    <label
                        htmlFor="mapSelector"
                        className="block mb-1 text-sm font-medium"
                        style={{ color: themeColors.text }}
                    >
                        Select Map
                    </label>
                    <select
                        id="mapSelector"
                        className="w-full p-2 rounded-lg border text-base"
                        style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            borderColor: `${themeColors.secondary}50`
                        }}
                        value={map?.id || ""}
                        onChange={handleChange}
                        disabled={isEditMode}
                    >
                        {maps.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Map editor (shown when in edit mode) - Compact design */}
            {isEditMode && (
                <div className="mb-2 border rounded-lg px-2 py-1" style={{ borderColor: `${themeColors.secondary}25` }}>
                    <div>
                        <label
                            htmlFor="mapName"
                            className="block mb-1 text-sm font-medium"
                            style={{ color: themeColors.text }}
                        >
                            Map Name
                        </label>
                        <input
                            id="mapName"
                            type="text"
                            className="w-full p-2 rounded-lg border text-base"
                            style={{
                                backgroundColor: themeColors.background,
                                color: themeColors.text,
                                borderColor: `${themeColors.secondary}50`
                            }}
                            value={map?.name || ""}
                            onChange={updateMapName}
                        />
                    </div>
                </div>
            )}

            {/* Main split content layout - Map on top half, Tables on bottom half */}
            <div className="flex flex-col">
                {/* Top half - Map area */}
                <div className="border max-h-[400px] rounded-lg overflow-hidden mb-2 h-2/5"
                    style={{
                        borderColor: `${themeColors.secondary}25`
                    }}
                >
                    {map ? (
                        <div className="max-h-[400px] flex flex-col items-center">
                            <div className="w-full p-2 font-medium flex justify-between items-center"
                                style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.text }}
                            >
                                <span>Floor Map</span>
                            </div>

                            <div
                                ref={containerRef}
                                className={`relative max-w-[400px] max-h-[400px] flex-1 rounded-lg flex items-center ${isPortrait ? 'justify-start' : 'justify-center'} overflow-hidden p-2`}
                                style={{
                                    backgroundColor: themeColors.background,
                                    color: themeColors.text,
                                    borderColor: themeColors.secondary
                                }}
                            >
                                <Map
                                    map={map}
                                    setMap={setMap}
                                    selectedTable={selectedTableMap}
                                    setSelectedTable={setSelectedTableMap}
                                    setTableEditorVisible={isEditMode ? setTableEditorVisible : undefined}
                                    scaleFactor={scaleFactor}
                                    isEditMode={isEditMode}
                                />

                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            No map selected
                        </div>
                    )}
                </div>

                {/* Bottom half - Table list or Table editor */}
                <div className="h-3/5 border rounded-lg overflow-hidden" style={{ borderColor: `${themeColors.secondary}25` }}>
                    <div className="h-full flex flex-col">
                        {!tableEditorVisible ? (
                            /* Table List View */
                            <>
                                <div className="p-2 font-medium flex justify-between items-center"
                                    style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.text }}
                                >
                                    <span>Table List</span>
                                    {isEditMode && selectedTable && (
                                        <motion.button
                                            onClick={() => addTableToMap(selectedTable)}
                                            className="btn btn-icon btn-success btn-with-icon-animation flex items-center gap-1 py-1 px-2 rounded-lg text-xs"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <MdAdd size={28} />
                                        </motion.button>
                                    )}
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto p-2">
                                    {tables ? (
                                        <div className="space-y-2">
                                            {tables.map(table => (
                                                <motion.div
                                                    key={table.id}
                                                    className={`p-3 rounded-lg border shadow-sm ${selectedTable?.id === table.id ? 'border-primary' : 'border-transparent hover:border-gray-200'}`}
                                                    style={{
                                                        backgroundColor: selectedTable?.id === table.id ? `${themeColors.accent}15` : 'transparent'
                                                    }}
                                                    onClick={() => setSelectedTable(table)}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-medium text-base">Table {table.number}</div>
                                                            <div className="flex items-center text-xs mt-1 opacity-75">
                                                                <MdLocationOn size={14} className="mr-1" />
                                                                <span>{table.location || 'No location'}</span>
                                                            </div>
                                                            <div className="flex items-center text-xs mt-1 opacity-75">
                                                                <MdPeople size={14} className="mr-1" />
                                                                <span>{table.capacity || 0} seats</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex space-x-1">
                                                            {hasRole(["ADMIN", "MANAGER"]) && (
                                                                <motion.button
                                                                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedTable(table);
                                                                        setEditingTable(table);
                                                                        setTableEditMode(true);
                                                                    }}
                                                                    title="Edit Table"
                                                                >
                                                                    <BiSolidEdit size={28} style={{ color: themeColors.accent }} />
                                                                </motion.button>
                                                            )}

                                                            <motion.button
                                                                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    printMultipleQRCodes([table]);
                                                                }}
                                                                title="Print QR Code"
                                                            >
                                                                <MdQrCode2 size={28} style={{ color: themeColors.accent }} />
                                                            </motion.button>

                                                            {hasRole(["ADMIN", "MANAGER"]) && (
                                                                <motion.button
                                                                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        const confirmed = await askQuestion(`Do you want to delete Table ${table.number}?`);
                                                                        if (confirmed) {
                                                                            await deleteTable(table.id);
                                                                            fetchData();
                                                                            showMessageModal("SUCCESS", `Table ${table.number} deleted successfully`);
                                                                        }
                                                                    }}
                                                                    title="Delete Table"
                                                                >
                                                                    <RiDeleteBin6Fill size={28} style={{ color: '#f44336' }} />
                                                                </motion.button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                            Loading tables...
                                        </div>
                                    )}
                                </div>

                            </>
                        ) : (
                            /* Table Editor View */
                            <>
                                <div className="p-3 font-medium flex justify-between items-center sticky top-0 z-10"
                                    style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.text }}
                                >
                                    <span>Edit Table #{selectedTableMap?.table.number} on Map {map?.name}</span>
                                    <motion.button
                                        onClick={() => setTableEditorVisible(false)}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <MdClose size={20} />
                                    </motion.button>
                                </div>
                                <div className="p-4 overflow-y-auto">
                                    <div className="space-y-4">
                                        {/* Shape Selection */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                                Shape
                                            </label>
                                            <select
                                                className="w-full p-2 rounded-lg border"
                                                style={{
                                                    backgroundColor: themeColors.background,
                                                    color: themeColors.text,
                                                    borderColor: `${themeColors.secondary}50`
                                                }}
                                                value={selectedTableMap?.shape}
                                                onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                    ...selectedTableMap,
                                                    shape: e.target.value
                                                })}
                                            >
                                                <option value="rect">Rectangle</option>
                                                <option value="square">Square</option>
                                                <option value="circle">Circle</option>
                                            </select>
                                        </div>

                                        {/* Color Picker */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                                Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    className="w-12 h-10 border rounded"
                                                    value={selectedTableMap?.color}
                                                    onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                        ...selectedTableMap,
                                                        color: e.target.value
                                                    })}
                                                    style={{
                                                        borderColor: `${themeColors.secondary}50`
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 p-2 rounded-lg border"
                                                    value={selectedTableMap?.color}
                                                    onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                        ...selectedTableMap,
                                                        color: e.target.value
                                                    })}
                                                    style={{
                                                        backgroundColor: themeColors.background,
                                                        color: themeColors.text,
                                                        borderColor: `${themeColors.secondary}50`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Width/Height Controls - Conditional based on shape */}
                                        {selectedTableMap?.shape !== "circle" && (
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                                    Width
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="300"
                                                        className="flex-1"
                                                        value={selectedTableMap?.width}
                                                        onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                            ...selectedTableMap,
                                                            width: Number(e.target.value),
                                                            height: selectedTableMap.shape === "square" ? Number(e.target.value) : selectedTableMap.height
                                                        })}
                                                    />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="300"
                                                        className="w-16 p-2 rounded-lg border"
                                                        value={selectedTableMap?.width}
                                                        onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                            ...selectedTableMap,
                                                            width: Number(e.target.value),
                                                            height: selectedTableMap.shape === "square" ? Number(e.target.value) : selectedTableMap.height
                                                        })}
                                                        style={{
                                                            backgroundColor: themeColors.background,
                                                            color: themeColors.text,
                                                            borderColor: `${themeColors.secondary}50`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedTableMap?.shape !== "circle" && selectedTableMap?.shape !== "square" && (
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                                    Height
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="300"
                                                        className="flex-1"
                                                        value={selectedTableMap?.height}
                                                        onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                            ...selectedTableMap,
                                                            height: Number(e.target.value)
                                                        })}
                                                    />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="300"
                                                        className="w-16 p-2 rounded-lg border"
                                                        value={selectedTableMap?.height}
                                                        onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                            ...selectedTableMap,
                                                            height: Number(e.target.value)
                                                        })}
                                                        style={{
                                                            backgroundColor: themeColors.background,
                                                            color: themeColors.text,
                                                            borderColor: `${themeColors.secondary}50`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedTableMap?.shape === "circle" && (
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                                    Radius
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="150"
                                                        className="flex-1"
                                                        value={(selectedTableMap?.width || 0) / 2}
                                                        onChange={(e) => {
                                                            if (!selectedTableMap) return;
                                                            const value = Number(e.target.value);
                                                            setSelectedTableMap({
                                                                ...selectedTableMap,
                                                                width: value * 2,
                                                                height: value * 2
                                                            });
                                                        }}
                                                    />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="150"
                                                        className="w-16 p-2 rounded-lg border"
                                                        value={(selectedTableMap?.width || 0) / 2}
                                                        onChange={(e) => {
                                                            if (!selectedTableMap) return;
                                                            const value = Number(e.target.value);
                                                            setSelectedTableMap({
                                                                ...selectedTableMap,
                                                                width: value * 2,
                                                                height: value * 2
                                                            });
                                                        }}
                                                        style={{
                                                            backgroundColor: themeColors.background,
                                                            color: themeColors.text,
                                                            borderColor: `${themeColors.secondary}50`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Gap Controls */}

                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                                Gap X
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="300"
                                                    className="flex-1"
                                                    value={selectedTableMap?.gapX || 0}
                                                    onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                        ...selectedTableMap,
                                                        gapX: Number(e.target.value)
                                                    })}
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="300"
                                                    className="w-16 p-2 rounded-lg border"
                                                    value={selectedTableMap?.gapX || 0}
                                                    onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                        ...selectedTableMap,
                                                        gapX: Number(e.target.value)
                                                    })}
                                                    style={{
                                                        backgroundColor: themeColors.background,
                                                        color: themeColors.text,
                                                        borderColor: `${themeColors.secondary}50`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                                Gap Y
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="300"
                                                    className="flex-1"
                                                    value={selectedTableMap?.gapY || 0}
                                                    onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                        ...selectedTableMap,
                                                        gapY: Number(e.target.value)
                                                    })}
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="300"
                                                    className="w-16 p-2 rounded-lg border"
                                                    value={selectedTableMap?.gapY || 0}
                                                    onChange={(e) => selectedTableMap && setSelectedTableMap({
                                                        ...selectedTableMap,
                                                        gapY: Number(e.target.value)
                                                    })}
                                                    style={{
                                                        backgroundColor: themeColors.background,
                                                        color: themeColors.text,
                                                        borderColor: `${themeColors.secondary}50`
                                                    }}
                                                />
                                            </div>
                                        </div>


                                        {/* Action Buttons */}
                                        <div className="flex justify-end pt-4 gap-5">
                                            <motion.button
                                                onClick={deleteTableFromMap}
                                                className="btn btn-icon btn-danger btn-with-icon-animation flex items-center gap-1 py-2 px-3 rounded-lg"
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.9 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                            >
                                                <RiDeleteBin6Fill size={20} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating action buttons - At the bottom of the screen */}
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-40">

                <motion.button
                    onClick={() => fetchData()}
                    className="btn btn-icon btn-accent btn-with-icon-animation rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    title="Refresh Data"
                >
                    <IoMdRefresh size={24} />
                </motion.button>

                {!isEditMode && tables && tables.length > 0 && (
                    <motion.button
                        onClick={() => printMultipleQRCodes(tables)}
                        className="btn btn-icon btn-secondary btn-with-icon-animation rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        title="Print All QR Codes"
                    >
                        <MdQrCode2 size={24} />
                    </motion.button>
                )}

            </div>

            {/* Table Edit Modal */}
            <AnimatePresence>
                {tableEditMode && editingTable && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-white rounded-lg overflow-hidden"
                            style={{ backgroundColor: themeColors.background, maxHeight: '80vh' }}
                        >
                            <div className="p-3 font-medium flex justify-between items-center sticky top-0 z-10"
                                style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.text }}
                            >
                                <span>Edit Table #{editingTable.number}</span>
                                <motion.button
                                    onClick={() => setTableEditMode(false)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <MdClose size={20} />
                                </motion.button>
                            </div>
                            <div className="p-4 overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                            Table Number
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full p-2 rounded-lg border"
                                            value={editingTable.number}
                                            onChange={(e) => setEditingTable({
                                                ...editingTable,
                                                number: parseInt(e.target.value) || 0
                                            })}
                                            style={{
                                                backgroundColor: themeColors.background,
                                                color: themeColors.text,
                                                borderColor: `${themeColors.secondary}50`
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                            Capacity (Seats)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full p-2 rounded-lg border"
                                            value={editingTable.capacity}
                                            onChange={(e) => setEditingTable({
                                                ...editingTable,
                                                capacity: parseInt(e.target.value) || 0
                                            })}
                                            style={{
                                                backgroundColor: themeColors.background,
                                                color: themeColors.text,
                                                borderColor: `${themeColors.secondary}50`
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-2 rounded-lg border"
                                            value={editingTable.location}
                                            onChange={(e) => setEditingTable({
                                                ...editingTable,
                                                location: e.target.value
                                            })}
                                            style={{
                                                backgroundColor: themeColors.background,
                                                color: themeColors.text,
                                                borderColor: `${themeColors.secondary}50`
                                            }}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-4">
                                        <motion.button
                                            className="btn btn-secondary btn-with-icon-animation flex items-center gap-2 py-2 px-4 rounded-lg"
                                            onClick={() => setTableEditMode(false)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Cancel
                                        </motion.button>

                                        <motion.button
                                            className="btn btn-accent btn-with-icon-animation flex items-center gap-2 py-2 px-4 rounded-lg"
                                            onClick={async () => {
                                                await putTable(editingTable);
                                                fetchData();
                                                setTableEditMode(false);
                                                showMessageModal("SUCCESS", `Table ${editingTable.number} updated successfully`);
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Save Changes
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MobilePageWrapper >
    );
};

export default MobileTablePage;
