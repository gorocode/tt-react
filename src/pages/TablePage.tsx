import { useEffect, useState } from "react";

import { MapType, TableMapType, TableType } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useQuestionModal } from "../context/QuestionModalContext";
import { useMessageModal } from "../context/MessageModalContext";

// API Services
import { getAllMaps, putMap, deleteMap } from "../api/mapService";
import { getAllTables } from "../api/tableService";

// Components
import Map from "../components/map/Map";
import TableEditor from "../components/map/TableEditor";
import TableList from "../components/map/TableList";
import TableManager from "../components/map/TableManager";

// Hooks & Utilities
import { motion } from "motion/react";
import useResponsiveStage from "../utils/useResponsiveStage";
import { v4 as uuidv4 } from "uuid";

// Icons
import { IoIosSave } from "react-icons/io";
import { PiArrowArcLeftBold } from "react-icons/pi";
import { AiFillCloseSquare } from "react-icons/ai";
import { BiSolidEdit } from "react-icons/bi";
import { MdAdd } from "react-icons/md";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";

/**
 * TablePage component
 * 
 * Provides an interface for viewing and managing restaurant floor maps and tables.
 * Features:
 * - Displaying tables in a visual floor map layout
 * - Editing map layouts including table positions, sizes, and angles
 * - Managing tables (creating, editing, deleting)
 * - Adding/removing tables to/from maps
 * - Responsive design that scales to different screen sizes
 */
const TablePage = () => {
	// Authentication context
	const { hasRole } = useAuth();

	// Theme and modal hooks
	const { themeColors } = useTheme();
	const { askQuestion } = useQuestionModal();
	const { showMessageModal } = useMessageModal();

	// Main state for maps and tables
	const [map, setMap] = useState<MapType>();
	const [maps, setMaps] = useState<MapType[]>();
	const [tables, setTables] = useState<TableType[]>();

	// Responsive layout utilities
	const { containerRef, isPortrait, scaleFactor } = useResponsiveStage(800, 800);

	// UI state
	const [isEditMode, setIsEditMode] = useState(false);
	const [tableEditorVisible, setTableEditorVisible] = useState(false);
	const [selectedTableMap, setSelectedTableMap] = useState<TableMapType>();
	const [selectedTable, setSelectedTable] = useState<TableType>();

	/**
	 * Load initial data on component mount
	 */
	useEffect(() => {
		fetchData();
	}, []);

	/**
	 * Update the map when a table map is selected/edited
	 * Replaces the edited table in the current map's tableMap array
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
	 * Fetches maps and tables data from the API and sets the current map
	 * @param mapData - Optional map to set as current after fetching
	 */
	const fetchData = async (mapData?: MapType) => {
		const mapsData = await getAllMaps();
		setMaps(mapsData);
		setMap(mapsData.find(m => m.id === mapData?.id) || mapsData.find(m => m.id === map?.id) || mapsData[0]);

		const tablesData = await getAllTables();
		setTables(tablesData);
	}

	/**
	 * Handles map selection change from the dropdown
	 * @param event - The select change event
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
	}
	/**
	 * Prompts for confirmation and deletes the current map if confirmed
	 */
	const askDeleteMap = async () => {
		if (!map) return;
		const confirmed = await askQuestion(`Do you want to delete ${map?.name} map?`);
		if (confirmed) {
			const confirmed2 = await askQuestion(`Are you sure you want to delete ${map?.name} map?`);
			if (confirmed2) {
				await deleteMap(map?.id);
				await fetchData();
				showMessageModal("SUCCESS", "Map deleted successfully");
			}
		}
	}

	/**
	 * Prompts for confirmation and saves the current map changes if confirmed
	 */
	const askSaveMap = async () => {
		if (!map) return;
		const confirmed = await askQuestion(`Do you want to save ${map?.name} map changes?`);
		if (confirmed) {
			const updatedMap = await putMap(map);
			await fetchData(updatedMap);
			setTableEditorVisible(false);
			setIsEditMode(false);
			showMessageModal("SUCCESS", "Map saved successfully");
		}
	}

	/**
	 * Adds a table to the current map with default position and styling
	 * Only works in edit mode and prevents adding duplicate tables
	 * @param table - The table to add to the map
	 */
	const addTableToMap = (table: TableType) => {
		if (!isEditMode) return;
		setMap((prev) => {
			if (!prev) return prev;

			const exists = prev.tableMap?.some(t => t.table.id === table.id);
			if (exists) return prev;

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
	}

	/**
	 * Resets the current map to its original state (discards unsaved changes)
	 */
	const resetMap = () => {
		setMap((prevMap) => {
			return maps?.find((mapFound) => mapFound.id === prevMap?.id) || maps?.[0];
		});
	};

	/**
	 * Exits edit mode and resets selection states
	 * Also discards unsaved changes by resetting the map
	 */
	const exitEditMode = () => {
		resetMap();
		setSelectedTableMap(undefined);
		setSelectedTable(undefined);
		setIsEditMode(false);
	}

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
	 * Initializes a new table record with default values and opens the table editor
	 */
	const createTable = () => {
		setSelectedTable(
			{
				id: 0,
				number: 1,
				location: "BAR_AREA",
				capacity: 1
			}
		)
	}

	return (
		<div className="flex h-full w-full items-center justify-center p-4">
			<div className="grid h-full w-full gap-x-4 p-2 grid-cols-[minmax(450px,auto)_minmax(450px,1fr)] grid-rows-[50px_auto] rounded-lg sm:overflow-auto overflow-x-auto overflow-y-auto">
				<div
					className="col-span-1 row-span-1 flex items-center justify-center gap-2 px-6 py-4"
					style={{
						backgroundColor: themeColors.background,
						color: themeColors.text,
						borderColor: themeColors.secondary
					}}
				>
					<motion.div
						transition={{ type: "spring", stiffness: 300 }}
						animate={{ scale: isEditMode ? 1.0001 : 1, marginRight: isEditMode ? 10 : 0 }}
						className="flex items-center gap-4">
						<motion.h1
							className="text-3xl font-bold tracking-tight relative group"
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ type: "spring", stiffness: 300, damping: 15 }}
						>
							<span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
								Map
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
						{isEditMode ? (
							<input
								className="text-lg font-medium border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={map?.name}
								onChange={(e) =>
									setMap((prevMap) => {
										if (prevMap) {
											return { ...prevMap, name: e.target.value };
										}
										return prevMap;
									})
								}
							/>
						) : (
							<select
								className="text-lg font-medium border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								onChange={handleChange}
								value={map?.id}
							>
								<option className="text-black" value="">Choose a map</option>
								{maps?.map((map) => (
									<option key={map.id} className="text-black" value={map.id}>
										{map.name}
									</option>
								))}
							</select>
						)}
					</motion.div>
					{hasRole(["ADMIN", "MANAGER"]) && (
						<motion.div
							transition={{ type: "spring", stiffness: 300 }}
							animate={{ scale: isEditMode ? 1.0001 : 1 }}
							className="flex items-center gap-3 z-10">
							{isEditMode ? (
								<>
									<div className="relative group select-none" key="new-map">
										<motion.button
											whileHover={{ scale: 1.1, y: -2 }}
											whileTap={{ scale: 0.9 }}
											transition={{ type: "spring", stiffness: 400 }}
											className="btn btn-icon btn-success btn-with-icon-animation"
											onClick={newMap}
										>
											<MdAdd size={24} />
										</motion.button>
										<span
											className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
										>
											New Map
										</span>
									</div>

									<div className="relative group select-none" key="delete-map">
										<motion.button
											whileHover={{ scale: 1.1, y: -2 }}
											whileTap={{ scale: 0.9 }}
											transition={{ type: "spring", stiffness: 400 }}
											className="btn btn-icon btn-danger btn-with-icon-animation"
											onClick={askDeleteMap}
										>
											<RiDeleteBin6Fill size={24} />
										</motion.button>
										<span
											className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
										>
											Delete Map
										</span>
									</div>
									|
									<div className="relative group select-none" key="save-map">
										<motion.button
											whileHover={{ scale: 1.1, y: -2 }}
											whileTap={{ scale: 0.9 }}
											transition={{ type: "spring", stiffness: 400 }}
											className="btn btn-icon btn-accent btn-with-icon-animation"
											onClick={askSaveMap}
										>
											<IoIosSave size={24} />
										</motion.button>
										<span
											className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
										>
											Save
										</span>
									</div>
									<div className="relative group select-none" key="reset-map">
										<motion.button
											whileHover={{ scale: 1.1, y: -2 }}
											whileTap={{ scale: 0.9 }}
											transition={{ type: "spring", stiffness: 400 }}
											className="btn btn-icon btn-secondary btn-with-icon-animation"
											onClick={resetMap}
										>
											<PiArrowArcLeftBold size={24} />
										</motion.button>
										<span
											className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
										>
											Reset
										</span>
									</div>
									<div className="relative group select-none" key="exit-map">
										<motion.button
											whileHover={{ scale: 1.1, y: -2 }}
											whileTap={{ scale: 0.9 }}
											transition={{ type: "spring", stiffness: 400 }}
											className="btn btn-icon btn-danger btn-with-icon-animation"
											onClick={exitEditMode}
										>
											<AiFillCloseSquare size={24} />
										</motion.button>
										<span
											className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
										>
											Exit
										</span>
									</div>
								</>
							) : (

								<div className="relative group select-none" key="edit-map">
									<motion.button
										whileHover={{ scale: 1.1, y: -2 }}
										whileTap={{ scale: 0.9 }}
										transition={{ type: "spring", stiffness: 400 }}
										className="btn btn-icon btn-outline-accent btn-with-icon-animation"
										onClick={() => setIsEditMode(true)}
									>
										<BiSolidEdit size={24} />
									</motion.button>
									<span
										className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
									>
										Edit Mode
									</span>
								</div>
							)}
						</motion.div>
					)}

				</div>

				<div
					className="col-span-1 row-span-2 rounded-lg flex flex-col items-center justify-start p-4 border-l-2 overflow-x-hidden overflow-y-auto"
					style={{
						backgroundColor: themeColors.background,
						color: themeColors.text,
						borderColor: themeColors.secondary
					}}
				>
					{!selectedTable ? (
						<TableList tables={tables} isEditMode={isEditMode} addTableToMap={addTableToMap} onCreate={createTable} onEdit={(table) => setSelectedTable(table)} fetchData={fetchData} />
					) : (
						<TableManager table={selectedTable} setTable={setSelectedTable} setTables={setTables} setMap={setMap} setSelectedTableMap={setSelectedTableMap} />
					)}
				</div>

				<div
					ref={containerRef}
					className={`relative h-full col-span-1 row-span-1 rounded-lg flex items-center ${isPortrait ? 'justify-start' : 'justify-center'} overflow-x-auto overflow-y-hidden p-2`}
					style={{
						backgroundColor: themeColors.background,
						color: themeColors.text,
						borderColor: themeColors.secondary
					}}
				>
					<Map map={map} setMap={setMap} selectedTable={selectedTableMap} setSelectedTable={setSelectedTableMap} setTableEditorVisible={setTableEditorVisible} scaleFactor={scaleFactor} isEditMode={isEditMode} />

					{tableEditorVisible && selectedTableMap && (
						<TableEditor
							containerRef={containerRef}
							scaleFactor={scaleFactor}
							tableMap={selectedTableMap}
							setTableMap={setSelectedTableMap}
							onClose={() => setTableEditorVisible(false)}
							deleteTableFromMap={deleteTableFromMap} />
					)}
				</div>
			</div>
		</div>
	);
}

export default TablePage