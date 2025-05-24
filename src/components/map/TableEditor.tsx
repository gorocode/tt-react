import React, { useState, useRef } from "react";
import { motion } from "motion/react";

// Context
import { useTheme } from "../../context/ThemeContext";
import { useQuestionModal } from "../../context/QuestionModalContext";

// Types
import { TableMapType } from "../../types";

/**
 * Props for the TableEditor component
 * @interface TableEditorProps
 */
type TableEditorProps = {
    /** Reference to the container element that houses the editor */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /** Current scale factor of the map view */
    scaleFactor: number;
    /** The table map data being edited */
    tableMap: TableMapType;
    /** Function to update the table map data */
    setTableMap: React.Dispatch<React.SetStateAction<TableMapType | undefined>>;
    /** Function to call when closing the editor */
    onClose: () => void;
    /** Function to delete the current table from the map */
    deleteTableFromMap: () => void;
};

/**
 * TableEditor Component
 * 
 * A draggable modal editor for modifying table properties on the restaurant map.
 * Allows editing shape, color, dimensions, and provides controls for table deletion.
 * The component can be dragged around the screen via its header.
 *
 * @param {TableEditorProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
const TableEditor = ({ containerRef, scaleFactor, tableMap, setTableMap, onClose, deleteTableFromMap }: TableEditorProps) => {
    // References and state
    const modalRef = useRef<HTMLDivElement>(null);
    const { themeColors } = useTheme();
    const [position, setPosition] = useState({ top: 25, left: 25 });
    const { askQuestion } = useQuestionModal();

    /**
     * Handles the mouse down event for dragging the editor modal
     * Sets up event listeners for mouse move and mouse up to handle the dragging behavior
     * 
     * @param {Object} event - The mouse down event
     * @param {number} event.clientX - The X coordinate of the mouse
     * @param {number} event.clientY - The Y coordinate of the mouse
     */
    const handleMouseDown = (event: { clientX: number; clientY: number; }) => {
        if (!containerRef.current || !modalRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const modalRect = modalRef.current.getBoundingClientRect();

        const offsetX = event.clientX - position.left;
        const offsetY = event.clientY - position.top;

        /**
         * Handles mouse movement during dragging
         * Calculates new position while ensuring editor stays within container bounds
         * 
         * @param {Object} moveEvent - The mouse move event
         * @param {number} moveEvent.clientX - Current X coordinate of the mouse
         * @param {number} moveEvent.clientY - Current Y coordinate of the mouse
         */
        const handleMouseMove = (moveEvent: { clientX: number; clientY: number; }) => {
            const newX = Math.min(Math.max(moveEvent.clientX - offsetX, 0), containerRect.width - modalRect.width);
            const newY = Math.min(Math.max(moveEvent.clientY - offsetY, 0), containerRect.height - 50 - modalRect.height);

            setPosition({ top: newY, left: newX });
        };

        /**
         * Handles the mouse up event to stop dragging
         * Removes event listeners set during mouse down
         */
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <>
            <motion.div
                ref={modalRef}
                className="absolute shadow-lg rounded-lg p-4 z-50"
                style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: themeColors.secondary,
                    top: position.top * scaleFactor, 
                    left: position.left * scaleFactor
                }}

            >
                {/* Draggable Header */}
                <motion.div
                    id="editor-header"
                    className="select-none cursor-move p-3 rounded-t-lg"
                    style={{
                        backgroundColor: themeColors.secondary,
                        color: themeColors.background
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <h2 className="text-lg font-semibold text-center">Edit Table #{tableMap.table.number}</h2>
                </motion.div>

                {/* Table Properties Form */}
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Shape</label>
                        <select
                            className="w-full border rounded p-2"
                            style={{
                                backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6',
                                color: themeColors.text,
                                borderColor: themeColors.secondary
                            }}
                            value={tableMap.shape}
                            onChange={(e) => setTableMap({ ...tableMap, shape: e.target.value })}
                        >
                            <option value="rect">Rectangle</option>
                            <option value="square">Square</option>
                            <option value="circle">Circle</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Color</label>
                        <input
                            type="color"
                            className="w-16 border rounded p-1"
                            style={{
                                backgroundColor: themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#1f1f1f' : '#f3f4f6',
                                color: themeColors.text,
                                borderColor: themeColors.secondary
                            }}
                            value={tableMap.color}
                            onChange={(e) => setTableMap({ ...tableMap, color: e.target.value })}
                        />
                    </div>
                    {tableMap.shape !== "circle" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Width</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="300"
                                        className="w-full"
                                        value={tableMap.width}
                                        onChange={(e) => setTableMap({ ...tableMap, width: Number(e.target.value), height: tableMap.shape === "square" ? Number(e.target.value) : tableMap.height })}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="300"
                                        className="w-16 border rounded p-1"
                                        value={tableMap.width}
                                        onChange={(e) => setTableMap({ ...tableMap, width: Number(e.target.value), height: tableMap.shape === "square" ? Number(e.target.value) : tableMap.height })}
                                    />
                                </div>
                            </div>
                            {tableMap.shape !== "square" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Height</label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="300"
                                            className="w-full"
                                            value={tableMap.height}
                                            onChange={(e) => setTableMap({ ...tableMap, height: Number(e.target.value) })}
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            max="300"
                                            className="w-16 border rounded p-1"
                                            value={tableMap.height}
                                            onChange={(e) => setTableMap({ ...tableMap, height: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">Gap X</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="300"
                                        className="w-full"
                                        value={tableMap.gapX}
                                        onChange={(e) => setTableMap({ ...tableMap, gapX: Number(e.target.value) })}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="300"
                                        className="w-16 border rounded p-1"
                                        value={tableMap.gapX}
                                        onChange={(e) => setTableMap({ ...tableMap, gapX: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Gap Y</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="300"
                                        className="w-full"
                                        value={tableMap.gapY}
                                        onChange={(e) => setTableMap({ ...tableMap, gapY: Number(e.target.value) })}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="300"
                                        className="w-16 border rounded p-1"
                                        value={tableMap.gapY}
                                        onChange={(e) => setTableMap({ ...tableMap, gapY: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {tableMap.shape === "circle" && (
                        <>
                            <div>
                                <label className="block text-sm font-bold mb-1">Radius</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="300"
                                        className="w-full"
                                        value={tableMap.width}
                                        onChange={(e) => setTableMap({ ...tableMap, width: Number(e.target.value), height: Number(e.target.value) })}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="300"
                                        className="w-16 border rounded p-1"
                                        value={tableMap.width}
                                        onChange={(e) => setTableMap({ ...tableMap, width: Number(e.target.value), height: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Gap Y</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="300"
                                        className="w-full"
                                        value={tableMap.gapY}
                                        onChange={(e) => setTableMap({ ...tableMap, gapY: Number(e.target.value) })}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="300"
                                        className="w-16 border rounded p-1"
                                        value={tableMap.gapY}
                                        onChange={(e) => setTableMap({ ...tableMap, gapY: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={async () => {
                            // Confirm table deletion with user before proceeding
                            const confirmed = await askQuestion(`Do you want to remove table #${tableMap.table.number} from this map?`);
                            if (confirmed) {
                                deleteTableFromMap();
                            }
                        }}
                        className="px-4 py-2 rounded"
                        style={{
                            backgroundColor: "#ef4444",
                            color: "#ffffff"
                        }}
                    >
                        Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded"
                        style={{
                            backgroundColor: themeColors.secondary,
                            color: themeColors.background
                        }}
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default TableEditor;
