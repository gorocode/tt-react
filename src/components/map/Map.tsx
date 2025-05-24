import { useEffect } from "react";
import { Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

// Context
import { useTheme } from "../../context/ThemeContext";

// Types
import { MapType, TableMapType } from "../../types";

/**
 * Props for the Map component
 * @interface MapProps
 */
type MapProps = {
    /** Current map data or undefined if no map is loaded */
    map: MapType | undefined;
    /** Function to update the map data */
    setMap: React.Dispatch<React.SetStateAction<MapType | undefined>>;
    /** Currently selected table or undefined if no table is selected */
    selectedTable: TableMapType | undefined;
    /** Function to update the selected table */
    setSelectedTable: React.Dispatch<React.SetStateAction<TableMapType | undefined>>;
    /** Function to control table editor visibility, undefined in view-only mode */
    setTableEditorVisible: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    /** Current scale factor of the map view */
    scaleFactor: number;
    /** Whether the map is in edit mode (allows table editing) */
    isEditMode: boolean;
}

/**
 * Map Component
 * 
 * Renders an interactive restaurant map with tables and chairs using react-konva.
 * Supports grid display, table selection, editing, and dragging in edit mode.
 * Tables can have different shapes, colors, and chair arrangements.
 *
 * @param {MapProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
const Map = ({ map, setMap, selectedTable, setSelectedTable, setTableEditorVisible, scaleFactor, isEditMode }: MapProps) => {
    const { themeColors } = useTheme();

    // Reset selected table when edit mode changes
    useEffect(() => { setSelectedTable(undefined) }, [isEditMode]);

    // Show a placeholder if no map is loaded
    if (!map) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="p-6 rounded-lg shadow-md text-center" 
                    style={{ 
                        backgroundColor: `color-mix(in srgb, ${themeColors.background} 95%, ${themeColors.text})`,
                        color: themeColors.text,
                        border: `1px solid ${themeColors.secondary}30`
                    }}>
                    <p className="text-lg font-medium">No map data available</p>
                    <p className="text-sm mt-2 opacity-70">Please create a new map or select an existing one.</p>
                </div>
            </div>
        );
    }

    /**
     * Toggles selection of a table
     * Deselects the table if it's already selected, otherwise selects it
     * 
     * @param {TableMapType} tableMap - The table to select or deselect
     */
    const selectTable = (tableMap: TableMapType) => {
        if (selectedTable?.table.id === tableMap.table.id) {
            setSelectedTable(undefined);
        } else {
            setSelectedTable(tableMap);
        }
    }
    /**
     * Rotates the selected table by 90 degrees
     * Swaps width and height and increments angle
     */
    const rotateTable = () => {
        setSelectedTable((prevTable) => prevTable ? {
            ...prevTable,
            width: prevTable.height,
            height: prevTable.width,
            angle: (prevTable.angle + 90) % 360,
        } : prevTable);
    }

    /**
     * Opens the table editor modal for the selected table
     */
    const openTableEditor = () => {
        setTableEditorVisible?.(true);
    }

    /**
     * Generates grid lines for the map background
     * Creates major and minor grid lines with different styling
     * 
     * @returns {JSX.Element[]} Array of Line and Rect components for the grid
     */
    const gridLines = () => {
        const lines = [];
        const gridSpacing = 100 * scaleFactor;
        const gridSize = 800 * scaleFactor;
        const gridColor = themeColors.text;
        const gridOpacity = 0.15;
        const majorGridOpacity = 0.25;
        const strokeWidth = 1.5;
        
        // Background grid area
        lines.push(
            <Rect
                key="grid-bg"
                x={0}
                y={0}
                width={gridSize}
                height={gridSize}
                fill={`color-mix(in srgb, ${themeColors.background} 97%, ${themeColors.accent})`}
                cornerRadius={3}
                opacity={0.2}
            />
        );

        // HORIZONTAL LINES
        for (let i = 0; i <= gridSize; i += gridSpacing) {
            // Draw major grid lines with different styling
            const isMajor = (i / gridSpacing) % 2 === 0;
            lines.push(
                <Line
                    key={`h-${i}`}
                    points={[0, i, gridSize, i]}
                    stroke={isMajor ? themeColors.accent : gridColor}
                    strokeWidth={isMajor ? strokeWidth + 0.5 : strokeWidth}
                    dash={isMajor ? [10, 5] : [5, 5]}
                    opacity={isMajor ? majorGridOpacity : gridOpacity}
                />
            );
        }

        // VERTICAL LINES
        for (let i = 0; i <= gridSize; i += gridSpacing) {
            // Draw major grid lines with different styling
            const isMajor = (i / gridSpacing) % 2 === 0;
            lines.push(
                <Line
                    key={`v-${i}`}
                    points={[i, 0, i, gridSize]}
                    stroke={isMajor ? themeColors.accent : gridColor}
                    strokeWidth={isMajor ? strokeWidth + 0.5 : strokeWidth}
                    dash={isMajor ? [10, 5] : [5, 5]}
                    opacity={isMajor ? majorGridOpacity : gridOpacity}
                />
            );
        }

        return lines;
    };

    /**
     * Handles dragging a table on the map
     * Constrains movement within map boundaries and snaps to grid
     * Updates table position in the map state
     * 
     * @param {number} id - The ID of the table being dragged
     * @param {KonvaEventObject<DragEvent>} e - The drag event object
     */
    const handleDragMove = (id: number, e: KonvaEventObject<DragEvent>) => {
        const table = map.tableMap.find((table) => table.id === id);
        if (!table) return;
        const { x, y } = e.target.position();

        const maxX = (800 * scaleFactor - e.target.width());
        const maxY = (800 * scaleFactor - e.target.height());
        const clampedX = Math.min(Math.max(x, 0), maxX);
        const clampedY = Math.min(Math.max(y, 0), maxY);

        const snappedPosition = snapTable(clampedX, clampedY, table.width, table.height);
        e.target.position(snappedPosition);
        e.target.getLayer()?.batchDraw();
        setMap((prevMap) => prevMap ? {
            ...prevMap,
            tableMap: prevMap.tableMap.map((table) =>
                table.id === id
                    ? { ...table, x: snappedPosition.x / scaleFactor, y: snappedPosition.y / scaleFactor }
                    : table
            ),
        } : prevMap);
    };

    /**
     * Handles the end of a table drag operation
     * Updates the selected table position if the dragged table is selected
     * 
     * @param {number} id - The ID of the table that was dragged
     * @param {KonvaEventObject<DragEvent>} e - The drag end event object
     */
    const handleDragEnd = (id: number, e: KonvaEventObject<DragEvent>) => {
        if (selectedTable?.id === id) {
            setSelectedTable((prevTable) => prevTable ? { ...prevTable, x: e.target.x() / scaleFactor, y: e.target.y() / scaleFactor } : prevTable);
        }
    }

    /**
     * Snaps a table position to the nearest grid point
     * Used during table dragging to align tables with the grid
     * 
     * @param {number} x - The current X position
     * @param {number} y - The current Y position
     * @param {number} width - The table width
     * @param {number} height - The table height
     * @returns {{ x: number, y: number }} The snapped position coordinates
     */
    const snapTable = (x: number, y: number, width: number, height: number) => {
        const gridSpacing = 100 * scaleFactor;

        const positions = [
            x,
            x + width,
            x + width / 2,
            y,
            y + height,
            y + height / 2,
        ];

        const snappedX = Math.round(positions[0] / (gridSpacing / 2)) * (gridSpacing / 2);
        const snappedY = Math.round(positions[3] / (gridSpacing / 2)) * (gridSpacing / 2);

        const offsetX = snappedX - positions[0];
        const offsetY = snappedY - positions[3];

        return { x: x + offsetX, y: y + offsetY };
    };

    /**
     * Calculates the luminance value of a color
     * Used for determining if a color needs to be lightened or darkened
     * 
     * @param {string} color - The color to calculate luminance for (hex or rgb)
     * @returns {number} The luminance value between 0 and 1, or -1 if invalid
     */
    const getLuminance = (color: string): number => {
        let r: number, g: number, b: number;
        if (color.startsWith("#")) {
            r = parseInt(color.slice(1, 3), 16) / 255;
            g = parseInt(color.slice(3, 5), 16) / 255;
            b = parseInt(color.slice(5, 7), 16) / 255;
        } else {
            const rgb = color.match(/\d+/g);
            if (rgb) {
                r = parseInt(rgb[0]) / 255;
                g = parseInt(rgb[1]) / 255;
                b = parseInt(rgb[2]) / 255;
            } else return -1;
        }

        const a = [r, g, b].map((x) => {
            return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    /**
     * Lightens a color by a specified factor
     * 
     * @param {string} color - The color to lighten (hex or rgb)
     * @param {number} factor - The factor by which to lighten (0-1)
     * @returns {string} The lightened color as an RGB string
     */
    const lightenColor = (color: string, factor: number): string => {
        let r, g, b;
        if (color.startsWith("#")) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else {
            const rgb = color.match(/\d+/g);
            if (rgb) {
                r = parseInt(rgb[0]);
                g = parseInt(rgb[1]);
                b = parseInt(rgb[2]);
            } else return color;
        }
        r = Math.min(255, r + (255 - r) * factor);
        g = Math.min(255, g + (255 - g) * factor);
        b = Math.min(255, b + (255 - b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    };

    /**
     * Darkens a color by a specified factor
     * 
     * @param {string} color - The color to darken (hex or rgb)
     * @param {number} factor - The factor by which to darken (0-1)
     * @returns {string} The darkened color as an RGB string
     */
    const darkenColor = (color: string, factor: number): string => {
        let r, g, b;
        if (color.startsWith("#")) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else {
            const rgb = color.match(/\d+/g);
            if (rgb) {
                r = parseInt(rgb[0]);
                g = parseInt(rgb[1]);
                b = parseInt(rgb[2]);
            } else return color;
        }
        r = Math.max(0, r - factor * 255);
        g = Math.max(0, g - factor * 255);
        b = Math.max(0, b - factor * 255);

        return `rgb(${r}, ${g}, ${b})`;
    };

    /**
     * Adjusts a table color based on the current theme
     * Ensures colors have appropriate contrast in both light and dark themes
     * 
     * @param {string} color - The original table color
     * @returns {string} The adjusted color appropriate for the current theme
     */
    const adjustTableColor = (color: string): string => {
        const luminance = getLuminance(color);
        if (themeColors.background === '#121212' || themeColors.background === '#2e2e2e') {
            if (luminance < 0.1) {
                return lightenColor(color, 1);
            }
            return color;
        }
        if (luminance > 0.8) {
            return darkenColor(color, 1);
        }
        return color;
    };

    /**
     * Renders chair elements around a table based on its shape and capacity
     * Places chairs differently for rectangle, square, and circle tables
     * 
     * @param {TableMapType} table - The table to render chairs for
     * @returns {JSX.Element[]} Array of chair components positioned around the table
     */
    const renderChairs = (table: TableMapType) => {
        const angle = table.angle || 0;
        const centerX = (table.x + table.width / 2) * scaleFactor;
        const centerY = (table.y + table.height / 2) * scaleFactor;
        const chairSize = (table.width + table.height) / 8 * scaleFactor;
        const gapX = (table.gapX || 0) * scaleFactor;
        const gapY = (table.gapY || 0) * scaleFactor;
        const capacity = Math.min(Math.max(table.table.capacity, 1), 8);

        /**
         * Rotates a point around a center point by an angle
         * Used for positioning chairs when tables are rotated
         * 
         * @param {number} x - X coordinate of the point to rotate
         * @param {number} y - Y coordinate of the point to rotate
         * @param {number} cx - X coordinate of the center point
         * @param {number} cy - Y coordinate of the center point
         * @param {number} angle - Rotation angle in degrees
         * @returns {{ x: number, y: number }} The rotated point coordinates
         */
        const rotatePoint = (x: number, y: number, cx: number, cy: number, angle: number) => {
            const radians = (angle * Math.PI) / 180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const nx = cos * (x - cx) - sin * (y - cy) + cx;
            const ny = sin * (x - cx) + cos * (y - cy) + cy;
            return { x: nx, y: ny };
        };

        const chairPositions = [];

        if (table.shape === 'square') {
            const leftX = centerX - gapY;
            const rightX = centerX + gapY;
            const topY = centerY - gapY;
            const bottomY = centerY + gapY;

            let remainingChairs = capacity;
            let side = 0; // 0: bottom, 1: top, 2: left, 3: right

            while (remainingChairs > 0) {
                const numChairs = Math.min(remainingChairs, 2);
                if (side === 0) {
                    const y = bottomY;
                    const totalWidth = (numChairs - 1) * gapX;
                    const startX = centerX - totalWidth / 2;

                    for (let i = 0; i < numChairs; i++) {
                        const x = startX + i * gapX;
                        chairPositions.push(rotatePoint(x, y, centerX, centerY, angle));
                    }
                } else if (side === 1) {
                    const y = topY;
                    const totalWidth = (numChairs - 1) * gapX;
                    const startX = centerX - totalWidth / 2;

                    for (let i = 0; i < numChairs; i++) {
                        const x = startX + i * gapX;
                        chairPositions.push(rotatePoint(x, y, centerX, centerY, angle));
                    }
                } else if (side === 2) {
                    const x = leftX;
                    const totalHeight = (numChairs - 1) * gapX;
                    const startY = centerY - totalHeight / 2;

                    for (let i = 0; i < numChairs; i++) {
                        const y = startY + i * gapX;
                        chairPositions.push(rotatePoint(x, y, centerX, centerY, angle));
                    }
                } else if (side === 3) {
                    const x = rightX;
                    const totalHeight = (numChairs - 1) * gapX;
                    const startY = centerY - totalHeight / 2;

                    for (let i = 0; i < numChairs; i++) {
                        const y = startY + i * gapX;
                        chairPositions.push(rotatePoint(x, y, centerX, centerY, angle));
                    }
                }
                remainingChairs -= numChairs;
                side = (side + 1) % 4;
            }
        } else if (table.shape === 'rect') {
            const bottomY = centerY + gapY;
            const topY = centerY - gapY;

            let remainingChairs = capacity;
            let side = 0; // 0: bottom, 1: top

            while (remainingChairs > 0) {
                const numChairs = Math.min(remainingChairs, Math.ceil(capacity / 2));
                if (side === 0) {
                    const y = bottomY;
                    const totalWidth = (numChairs - 1) * gapX;
                    const startX = centerX - totalWidth / 2;

                    for (let i = 0; i < numChairs; i++) {
                        const x = startX + i * gapX;
                        chairPositions.push(rotatePoint(x, y, centerX, centerY, angle));
                    }
                } else if (side === 1) {
                    const y = topY;
                    const totalWidth = (numChairs - 1) * gapX;
                    const startX = centerX - totalWidth / 2;

                    for (let i = 0; i < numChairs; i++) {
                        const x = startX + i * gapX;
                        chairPositions.push(rotatePoint(x, y, centerX, centerY, angle));
                    }
                }
                remainingChairs -= numChairs;
                side = (side + 1) % 2;
            }
        } else if (table.shape === 'circle') {
            const radius = (table.width / 2 + gapY) * scaleFactor;
            const angleIncrement = 360 / capacity;

            for (let i = 0; i < capacity; i++) {
                const chairAngle = angleIncrement * i + angle;
                const chairX = centerX + Math.cos((chairAngle * Math.PI) / 180) * radius;
                const chairY = centerY + Math.sin((chairAngle * Math.PI) / 180) * radius;
                chairPositions.push({ x: chairX, y: chairY });
            }
        }

        return chairPositions.map((pos, index) => (
            <Rect
                key={`chair-${table.id}-${index}-${pos.x}-${pos.y}`}
                x={pos.x - chairSize / 2}
                y={pos.y - chairSize / 2}
                width={chairSize}
                height={chairSize}
                cornerRadius={chairSize / 2}
                listening={false}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: chairSize, y: chairSize }}
                fillLinearGradientColorStops={[
                    0, adjustTableColor(darkenColor(table.color, 0.3)),
                    1, adjustTableColor(lightenColor(table.color, 0.3))
                ]}
                shadowColor={themeColors.background === '#121212' || themeColors.background === '#2e2e2e' ? '#000000' : '#aaaaaa'}
                shadowBlur={5}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.4}
            />
        ));
    };

    return (
        <Stage width={800 * scaleFactor} height={800 * scaleFactor} style={{ borderRadius: '8px', overflow: 'auto' }}>
            {/* Grid background layer */}
            <Layer>
                {gridLines()}
            </Layer>
            {/* Chair layer */}
            <Layer>
                {map.tableMap.map((table) => renderChairs(table))}
            </Layer>
            {/* Tables layer - contains interactive table elements */}
            <Layer>
                {map.tableMap.map((table) => (
                    <Group key={table.table.id}>
                        <Rect
                            draggable={isEditMode}
                            onDragMove={(e) => handleDragMove(table.id, e)}
                            onDragEnd={(e) => handleDragEnd(table.id, e)}
                            onClick={() => selectTable(table)}
                            onTouchStart={() => selectTable(table)}
                            key={table.table.id}
                            x={table.x * scaleFactor}
                            y={table.y * scaleFactor}
                            width={table.width * scaleFactor}
                            height={table.height * scaleFactor}
                            fill={adjustTableColor(table.color)}
                            cornerRadius={table.shape === "circle" ? 300 : table.shape === "rect" ? 8 : 5}
                            hitStrokeWidth={12}
                            perfectDrawEnabled={true}
                            strokeLinearGradientStartPoint={{ x: 0, y: 0 }}
                            strokeLinearGradientEndPoint={{ x: table.width * scaleFactor, y: table.height * scaleFactor }}
                            strokeLinearGradientColorStops={table.table.location === 'BAR_AREA' ? 
                                (themeColors.background === '#121212' || themeColors.background === '#2e2e2e') ? 
                                    [0, lightenColor(adjustTableColor(table.color), 0.3)] : 
                                    [0, darkenColor(adjustTableColor(table.color), 0.3)] 
                                : [0, lightenColor(adjustTableColor(table.color), 0.3), 1, darkenColor(adjustTableColor(table.color), 0.3)]}
                            strokeWidth={selectedTable?.table.id === table.table.id ? 6 : 3}                            
                            shadowColor={selectedTable?.table.id === table.table.id ? themeColors.accent : table.table.location === 'BAR_AREA' ? 'transparent' : themeColors.secondary}
                            shadowBlur={selectedTable?.table.id === table.table.id ? 15 : table.table.location === 'BAR_AREA' ? 0 : 8}
                            shadowOffset={selectedTable?.table.id === table.table.id ? { x: 0, y: 0 } : table.table.location === 'BAR_AREA' ? { x: 0, y: 0 } : { x: 3, y: 3 }} 
                            shadowOpacity={selectedTable?.table.id === table.table.id ? 0.8 : table.table.location === 'BAR_AREA' ? 0 : 0.4}
                        />
                        <Text
                            x={table.x * scaleFactor}
                            y={table.y * scaleFactor}
                            width={table.width * scaleFactor}
                            height={table.height * scaleFactor}
                            text={`#${table.table.number}`}
                            align="center"
                            verticalAlign="middle"
                            fontSize={45 * scaleFactor * ((table.width + table.height) / 1.2) / 300}
                            fontStyle="bold"
                            fontFamily="'Inter', sans-serif"
                            fill={themeColors.background}
                            shadowColor={themeColors.text}
                            shadowBlur={2}
                            shadowOffset={{ x: 1, y: 1 }}
                            shadowOpacity={0.3}
                            listening={false}
                        />


                        {isEditMode && selectedTable?.table.id === table.table.id && (
                            <>
                                <Group
                                    x={(table.x + table.width) * scaleFactor}
                                    y={(table.y + table.height + 5) * scaleFactor}
                                    onClick={() => rotateTable()}
                                    onTouchStart={() => rotateTable()}
                                    cursor="pointer"
                                >
                                    <Rect
                                        x={-20 * scaleFactor}
                                        y={-20 * scaleFactor}
                                        width={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        height={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        cornerRadius={8}
                                        fill={themeColors.accent}
                                        opacity={0.85}
                                        shadowColor={themeColors.text}
                                        shadowBlur={10}
                                        shadowOffset={{ x: 2, y: 2 }}
                                        shadowOpacity={0.2}
                                    />
                                    <Text
                                        x={-20 * scaleFactor}
                                        y={-20 * scaleFactor}
                                        width={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        height={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        text="↻"
                                        fontSize={(28 * scaleFactor) > 20 ? (28 * scaleFactor) : 20}
                                        fontStyle="bold"
                                        fill={themeColors.background}
                                        align="center"
                                        verticalAlign="middle"
                                    />
                                </Group>
                                <Group
                                    x={(table.x + table.width) * scaleFactor}
                                    y={(table.y - 20) * scaleFactor}
                                    onClick={() => openTableEditor()}
                                    onTouchStart={() => openTableEditor()}
                                    cursor="pointer"
                                >
                                    <Rect
                                        x={-20 * scaleFactor}
                                        y={0}
                                        width={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        height={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        cornerRadius={8}
                                        fill={themeColors.accent}
                                        opacity={0.85}
                                        shadowColor={themeColors.text}
                                        shadowBlur={10}
                                        shadowOffset={{ x: 2, y: 2 }}
                                        shadowOpacity={0.2}
                                    />
                                    <Text
                                        x={-20 * scaleFactor}
                                        y={0}
                                        width={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        height={(40 * scaleFactor) > 30 ? (40 * scaleFactor) : 30}
                                        text="✎"
                                        fontSize={(28 * scaleFactor) > 20 ? (28 * scaleFactor) : 20}
                                        fontStyle="bold"
                                        fill={themeColors.background}
                                        align="center"
                                        verticalAlign="middle"
                                    />
                                </Group>
                            </>
                        )}

                    </Group>
                ))}
            </Layer>
        </Stage>
    );
};

export default Map;
