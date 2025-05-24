import { useEffect, useState } from "react";

import { getAllMenus, postMenu, updateMenu, deleteMenu, toggleMenuAvailability } from "../api/menuService";
import { deleteCategory, getAllCategories, postCategory, updateCategory } from "../api/menuCategoryService";
import { getProducts } from "../api/productService";

import { CategoryType, MenuItemType, ProductType, type MenuType } from "../types";

import Menu from "../components/menu/Menu";
import SmallProducts from "../components/products/SmallProducts";
import MenuItemModal from "../components/menu/MenuItemModal";
import CategoryModal from "../components/menu/CategoryModal";

import { useTheme } from "../context/ThemeContext";
import { useMessageModal } from "../context/MessageModalContext";
import { useQuestionModal } from "../context/QuestionModalContext";

import { motion, AnimatePresence } from "motion/react";
import { MdAdd, MdOutlineArrowBackIos } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

/**
 * MenuPage component
 * 
 * Provides interface for restaurant menu management including:
 * - Creating, editing, and deleting menus
 * - Managing menu items and categories
 * - Adding products to menus with prices and taxes
 */
const MenuPage = () => {
	// Authentication context
	const { hasRole } = useAuth();

	// Theme and modal hooks
	const { themeColors } = useTheme();
	const { showMessageModal } = useMessageModal();
	const { askQuestion } = useQuestionModal();

	// State for data management
	const [categories, setCategories] = useState<CategoryType[]>();
	const [menus, setMenus] = useState<MenuType[]>();
	const [menu, setMenu] = useState<MenuType>();
	const [products, setProducts] = useState<ProductType[]>();

	// UI state management
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemType>();
	const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>();
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	/**
	 * Load initial data when component mounts
	 */
	useEffect(() => {
		fetchData();
	}, []);

	/**
	 * Fetches all required data from the API:
	 * - Menus (and selects the active one)
	 * - Categories
	 * - Products
	 */
	const fetchData = async () => {
		const menuData = await getAllMenus();

		const sortedMenus = menuData.map((menu) => ({
			...menu,
			categories: menu.categories
				.sort((a, b) => a.menuOrder - b.menuOrder)
				.map((category) => ({
					...category,
					menuItems: category.menuItems.sort(
						(a, b) => a.menuOrder - b.menuOrder
					),
				})),
		})).sort((a, b) => a.id - b.id);

		setMenus(sortedMenus);


		// Select the active menu by default
		menuData.forEach((menu) => {
			if (menu.available) {
				setMenu(menu);
			}
		});

		const categoriesData = await getAllCategories();
		setCategories(categoriesData);

		const productData = await getProducts();
		setProducts(productData);
	}

	/**
	 * Creates a new empty menu and sets it as the active menu in edit mode
	 */
	const createNewMenu = async () => {
		const newMenu: MenuType = {
			id: 0,
			name: "New Menu",
			description: "",
			available: false,
			categories: []
		};
		const menuData = await postMenu(newMenu);
		setMenus(prev => prev ? [...prev, menuData] : [menuData]);
		setMenu(menuData);
		setIsEditMode(true);
	};

	/**
	 * Saves the current menu to the server
	 * Updates the local state with the returned data
	 */
	const saveMenu = async () => {
		if (!menu) return;
		const confirmed = await askQuestion("Do you want to save the menu?");
		if (!confirmed) return;
		const menuData = await updateMenu(menu);
		const sortedMenuData = {
			...menuData,
			categories: menuData.categories
				.sort((a, b) => a.menuOrder - b.menuOrder)
				.map((category) => ({
					...category,
					menuItems: category.menuItems.sort(
						(a, b) => a.menuOrder - b.menuOrder
					),
				})),
		}
		setMenus(prev => prev?.map(m => m.id === sortedMenuData.id ? sortedMenuData : m));
		setMenu(sortedMenuData);
		fetchData();
		setIsEditMode(false);
		showMessageModal("SUCCESS", "Menu saved successfully");
	};

	/**
	 * Asks for confirmation before deleting the current menu
	 * Updates state if deletion is successful
	 */
	const askDeleteMenu = async (menu: MenuType) => {
		if (!menu) return;
		const confirmed = await askQuestion(`Do you want to delete ${menu.name}?`);
		if (confirmed) {
			const confirmed2 = await askQuestion(`Are you sure you want to delete ${menu.name}?`);
			if (confirmed2) {
				await deleteMenu(menu.id);
				setMenus(prev => prev?.filter(m => m.id !== menu.id));
				setMenu(menus?.find(m => m.id !== menu.id));
				showMessageModal("SUCCESS", "Menu deleted successfully");
				fetchData();
			}
		}
	};

	/**
	 * Resets the current menu to its original state and exits edit mode
	 */
	const resetMenu = () => {
		const originalMenu = menus?.find(m => m.id === menu?.id);
		setMenu(originalMenu);
	};

	/**
	 * Creates a new empty category
	 */
	const createCategory = async () => {
		const category: CategoryType = {
			id: 0,
			name: "New Category",
			description: "",
			menuItems: [],
			menuOrder: categories ? categories.length : 0
		};

		setSelectedCategory(category);
		setIsCategoryModalOpen(true);
	};

	/**
	 * Handles product selection to add to menu
	 * Opens the menu item modal with the selected product
	 * 
	 * @param product - The product to add to the menu
	 */
	const handleProductClick = (product: ProductType) => {
		const itemAlreadyExists = menu?.categories.find(c => c.menuItems.find(item => item.product.id === product.id));

		if (itemAlreadyExists) {
			showMessageModal("ERROR", "Item already exists in the menu");
			return;
		}

		const newMenuItem: MenuItemType = {
			id: Date.now(),
			price: 0,
			tax: 0,
			available: true,
			product: product,
			menuOrder: 0
		}
		setSelectedMenuItem(newMenuItem);
		setIsMenuItemModalOpen(true);
	};

	/**
	 * Creates a new menu item or updates an existing one with the selected category
	 * 
	 * @param menuItem - The menu item to add or update
	 * @param categoryId - The ID of the category to add/move the menu item to
	 */
	const handleAddMenuItem = async (menuItem: MenuItemType, categoryId: number) => {
		if (!menu || !menuItem || !categories) return;

		setMenu(prev => {
			if (!prev) return prev;

			let updatedCategories = prev.categories.map(c => ({
				...c,
				menuItems: c.menuItems.filter(item => item.id !== menuItem.id)
			}));

			const categoryInMenu = updatedCategories.find(c => c.id === categoryId);

			if (categoryInMenu) {
				updatedCategories = updatedCategories.map(c =>
					c.id === categoryId
						? {
							...c,
							menuItems: [...c.menuItems, {
								...menuItem,
								menuOrder: c.menuItems.length
							}]
						}
						: c
				);
			} else {
				const newCategory = categories.find(c => c.id === categoryId);
				if (!newCategory) return prev;

				updatedCategories.push({
					...newCategory,
					menuItems: [{
						...menuItem,
						menuOrder: 0
					}]
				});
			}

			return {
				...prev,
				categories: updatedCategories.filter(c => c.menuItems.length > 0)
			};
		});

		setIsMenuItemModalOpen(false);
		setSelectedMenuItem(undefined);
	};

	const handleEditMenuItem = (menuItem: MenuItemType) => {
		setSelectedMenuItem(menuItem);
		setIsMenuItemModalOpen(true);
	}

	const askToggleMenuAvailability = async (menu: MenuType) => {
		if (!menu) return;

		const confirmed = await askQuestion(`Do you want to ${menu.available ? "disable" : "enable"} ${menu.name}?`);
		if (!confirmed) return;

		const availableMenu = menus?.find(m => m.available);
		let unavailableMenuData: MenuType;

		if (availableMenu && availableMenu.id !== menu.id) {
			const data = await toggleMenuAvailability(availableMenu.id);
			unavailableMenuData = {
				...data,
				categories: data.categories
					.sort((a, b) => a.menuOrder - b.menuOrder)
					.map(category => ({
						...category,
						menuItems: category.menuItems.sort((a, b) => a.menuOrder - b.menuOrder),
					})),
			};
		}

		const data = await toggleMenuAvailability(menu.id);
		const sortedMenuData: MenuType = {
			...data,
			categories: data.categories
				.sort((a, b) => a.menuOrder - b.menuOrder)
				.map(category => ({
					...category,
					menuItems: category.menuItems.sort((a, b) => a.menuOrder - b.menuOrder),
				})),
		};

		setMenus(prev => prev?.map(m => m.id === sortedMenuData.id ? sortedMenuData : m.id === unavailableMenuData?.id ? unavailableMenuData : m));
		setMenu(sortedMenuData);
		showMessageModal("SUCCESS", `Menu ${menu.available ? "disabled" : "enabled"} successfully`);
	}

	const handleAddCategory = async (category: CategoryType) => {
		if (!categories) return;

		if (category.id === 0) {
			const categoryData = await postCategory(category);
			setCategories(prev => prev ? [...prev, categoryData] : [categoryData]);
		} else {
			const categoryData = await updateCategory(category);
			setCategories(prev => prev ? prev.map(c => c.id === categoryData.id ? categoryData : c) : [categoryData]);
		}

		setIsCategoryModalOpen(false);
		setSelectedCategory(undefined);
		showMessageModal("SUCCESS", "Category saved successfully");
	}

	const askDeleteCategory = async (category: CategoryType) => {
		if (!category) return;
		const confirmed = await askQuestion(`Do you want to delete ${category.name}?`);
		if (confirmed) {
			const confirmed2 = await askQuestion(`Are you sure you want to delete ${category.name}?`);
			if (confirmed2) {
				await deleteCategory(category.id);
				setCategories(prev => prev?.filter(c => c.id !== category.id));
				showMessageModal("SUCCESS", "Category deleted successfully");
				fetchData();
			}
		}
	}

	return (
		<motion.div
			className="flex h-full w-full items-center justify-center p-4"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className={`grid h-full w-full gap-4 p-2 grid-cols-1 md:grid-cols-2 ${isEditMode ? 'grid-rows-1' : 'grid-rows-[minmax(auto,50%)_minmax(auto,50%)]'} rounded-lg sm:overflow-hidden overflow-y-auto`}>

				{/* Products/Categories Panel */}
				<div className="col-span-1 row-span-1 rounded-lg flex flex-col gap-4 p-4 border-b-2" style={{
					backgroundColor: themeColors.background,
					color: themeColors.text,
					borderColor: themeColors.secondary
				}}>
					<div className="flex justify-between items-center mb-2">
						<motion.h1
							className="text-3xl font-bold tracking-tight relative group"
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ type: "spring", stiffness: 300, damping: 15 }}
						>
							<span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
								{isEditMode ? 'Products' : 'Menus'}
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

						<div className="relative">
							<motion.div
								className="flex items-center gap-4"
								transition={{ type: 'spring', stiffness: 400, damping: 25 }}
							>
								{isEditMode ? (
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: "spring", stiffness: 300 }}
										className="text-3xl flex items-center gap-1 cursor-pointer hover:text-primary transition-colors px-3 py-1 rounded-lg hover:bg-gray-100 hover:bg-opacity-10"
										onClick={() => { setIsEditMode(false); resetMenu(); }}
									>
										<MdOutlineArrowBackIos /> <span className='text-xl font-medium'>Back to Menus</span>
									</motion.div>
								) : (
									hasRole(["ADMIN", "MANAGER"]) && (
										<div className="relative group select-none" key="new-category">
											<motion.button
												whileHover={{ scale: 1.1, y: -2 }}
												whileTap={{ scale: 0.9 }}
												transition={{ type: "spring", stiffness: 400 }}
												className="btn btn-icon-sm btn-accent btn-with-icon-animation"
												onClick={createNewMenu}
											>
												<MdAdd size={24} />
											</motion.button>
											<span
												className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 z-1 rounded-md`}
											>
												New Menu
											</span>
										</div>
									)
								)}
							</motion.div>
						</div>
					</div>

					{isEditMode && hasRole(["ADMIN", "MANAGER"]) ? (
						<SmallProducts
							products={products}
							onProductClick={handleProductClick}
						/>
					) : (
						menus && (
							<div className="h-full flex flex-col gap-4 overflow-y-auto overflow-x-hidden">
								<motion.div
									className="grid grid-cols-2 gap-4"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
								>
									{menus.map((m, index) => (
										<motion.div
											key={m.id}
											layout
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -20 }}
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 25,
												delay: index * 0.05
											}}
											className={`relative p-4 rounded-lg shadow-md border cursor-pointer 
												${m.available ? 'border-yellow-500' : 'border-gray-300'} 
												${m.id === menu?.id ? 'ring-2 ring-blue-500 ring-opacity-70' : ''} 
												hover:shadow-lg hover:translate-y-[-2px] transform transition-all duration-300 
												bg-gradient-to-br from-background to-background/50 backdrop-blur-sm`}
											style={{
												borderColor: m.available ? themeColors.accent : themeColors.secondary,
												boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`
											}}
											onClick={() => setMenu(m)}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<h3 className="font-bold text-lg mb-2">
												<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
													{m.name}
												</span>
											</h3>
											<div className="flex gap-2 items-center mb-1">
												<div className="h-2 w-2 rounded-full bg-accent"></div>
												<p className="text-sm">{m.categories.length} categories</p>
											</div>
											<div className="flex gap-2 items-center mb-2">
												<div className="h-2 w-2 rounded-full bg-secondary"></div>
												<p className="text-sm">
													{m.categories.reduce((acc, cat) => acc + cat.menuItems.length, 0)} items
												</p>
											</div>
											{hasRole(["ADMIN", "MANAGER"]) && (
												<div className="flex gap-2 absolute right-2 bottom-3">
													<div className="relative group select-none" key="menu-item-availability">
														<motion.button
															whileHover={{ scale: 1.1, y: -2 }}
															whileTap={{ scale: 0.9 }}
															animate={{ opacity: 1 }}
															transition={{ type: "spring", stiffness: 400 }}
															className="btn btn-icon-xs btn-secondary btn-with-icon-animation"
															style={{ padding: '0.2rem' }}
															onClick={() => askToggleMenuAvailability(m)}
														>
															{m.available ? (
																<FaEye size={20} />
															) : (
																<FaEyeSlash size={20} />
															)}
														</motion.button>
														<span
															className={`absolute top-[-2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
														>
															{m.available ? "Available" : "Unavailable"}
														</span>
													</div>
													<div className="relative group select-none" key="edit-menu">
														<motion.button
															whileHover={{ scale: 1.1, y: -2 }}
															whileTap={{ scale: 0.9 }}
															transition={{ type: "spring", stiffness: 400 }}
															className="btn btn-icon-xs btn-outline-accent btn-with-icon-animation"
															style={{ padding: '0.2rem' }}
															onClick={() => {
																setMenu(m);
																setIsEditMode(true);
															}}
														>
															<BiSolidEdit size={20} />
														</motion.button>
														<span
															className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
														>
															Edit
														</span>
													</div>

													<div className="relative group select-none" key="delete-menu">
														<motion.button
															whileHover={{ scale: 1.1, y: -2 }}
															whileTap={{ scale: 0.9 }}
															animate={{ opacity: 1 }}
															transition={{ type: "spring", stiffness: 400 }}
															className="btn btn-icon-xs btn-danger btn-with-icon-animation"
															onClick={() => askDeleteMenu(m)}
														>
															<RiDeleteBin6Fill size={20} />
														</motion.button>
														<span
															className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
														>
															Delete
														</span>
													</div>
												</div>
											)}
										</motion.div>
									))}
								</motion.div>
							</div>
						)
					)}
				</div>

				{/* Menu Preview */}
				<motion.div
					className="h-full col-span-1 row-span-2 rounded-lg flex flex-col gap-4 border-l-2 overflow-y-auto overflow-x-hidden p-4"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
					style={{
						backgroundColor: themeColors.background,
						color: themeColors.text,
						borderColor: themeColors.secondary
					}}>
					{menu && (
						<Menu
							menu={menu}
							setMenu={setMenu}
							isEditMode={isEditMode}
							editMenuItem={handleEditMenuItem}
							saveMenu={saveMenu}
							resetMenu={() => {
								resetMenu();
								showMessageModal("INFO", "Changes discarded");
							}}
						/>
					)}
				</motion.div>

				{/* Categories */}
				{!isEditMode &&
					<motion.div
						className="col-span-1 row-span-1 rounded-lg flex flex-col gap-4 p-4 border-b-2"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
						style={{
							backgroundColor: themeColors.background,
							color: themeColors.text,
							borderColor: themeColors.secondary
						}}
					>
						<div className="flex justify-between items-center mb-2">
							<motion.h1
								className="text-3xl font-bold tracking-tight relative group"
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ type: "spring", stiffness: 300, damping: 15 }}
							>
								<span className="bg-gradient-to-r from-accent to-secondary bg-clip-text group-hover:from-secondary group-hover:to-accent transition-all duration-300">
									Categories
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
							{hasRole(["ADMIN", "MANAGER"]) && (
								<div className="relative group select-none" key="new-category">
									<motion.button
										whileHover={{ scale: 1.1, y: -2 }}
										whileTap={{ scale: 0.9 }}
										transition={{ type: "spring", stiffness: 400 }}
										className="btn btn-icon-sm btn-accent btn-with-icon-animation"
										onClick={createCategory}
									>
										<MdAdd size={24} />
									</motion.button>
									<span
										className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 z-1 rounded-md`}
									>
										New Category
									</span>
								</div>
							)}
						</div>

						{categories && (
							<div className="h-full flex flex-col gap-4 overflow-y-auto overflow-x-hidden">
								<motion.div
									className="grid grid-cols-3 gap-4"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
								>
									{categories.map((c, index) => (
										<motion.div
											key={c.id}
											layout
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{
												type: "spring",
												stiffness: 400,
												damping: 25,
												delay: index * 0.05
											}}
											className={`relative p-4 rounded-lg shadow-md border-2 bg-gradient-to-br from-background to-background/60 backdrop-blur-sm`}
											style={{
												boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
												borderColor: themeColors.accent + '40'
											}}
											whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)' }}
										>
											<h3 className="font-bold text-lg mb-2">
												<span className="bg-gradient-to-r from-accent to-primary bg-clip-text">
													{c.name}
												</span>
											</h3>
											<div className="flex gap-2 items-center mb-2">
												<div className="h-2 w-2 rounded-full bg-secondary"></div>
												<p className="text-sm">
													{c.menuItems.length} items
												</p>
											</div>
											{hasRole(["ADMIN", "MANAGER"]) && (
												<div className="flex gap-4 absolute right-2 bottom-3">
													<div className="relative group select-none" key="edit-menu">
														<motion.button
															whileHover={{ scale: 1.1, y: -2 }}
															whileTap={{ scale: 0.9 }}
															transition={{ type: "spring", stiffness: 400 }}
															className="btn btn-icon-xs btn-outline-accent btn-with-icon-animation"
															style={{ padding: '0.2rem' }}
															onClick={() => {
																setSelectedCategory(c);
																setIsCategoryModalOpen(true);
															}}
														>
															<BiSolidEdit size={20} />
														</motion.button>
														<span
															className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
														>
															Edit
														</span>
													</div>
													<div className="relative group select-none" key="delete-category">
														<motion.button
															whileHover={{ scale: 1.1, y: -2 }}
															whileTap={{ scale: 0.9 }}
															transition={{ type: "spring", stiffness: 400 }}
															className="btn btn-icon-xs btn-danger btn-with-icon-animation"
															style={{ padding: '0.2rem' }}
															onClick={() => askDeleteCategory(c)}
														>
															<RiDeleteBin6Fill size={20} />
														</motion.button>
														<span
															className={`absolute top-[2rem] left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md`}
														>
															Delete
														</span>
													</div>
												</div>
											)}
										</motion.div>
									))}
								</motion.div>
							</div>
						)}
					</motion.div>
				}
			</div>

			{/* Modals */}
			<AnimatePresence>
				{selectedMenuItem && (
					<MenuItemModal
						menuItem={selectedMenuItem}
						categories={categories || []}
						isOpen={isMenuItemModalOpen}
						isEditing={menu?.categories ? menu.categories.some(c => c.menuItems.some(item => item.id === selectedMenuItem?.id)) : false}
						onClose={() => {
							setIsMenuItemModalOpen(false);
							setSelectedMenuItem(undefined);
						}}
						onConfirm={handleAddMenuItem} />
				)}
				{selectedCategory && (
					<CategoryModal
						category={selectedCategory}
						isOpen={isCategoryModalOpen}
						onClose={() => {
							setIsCategoryModalOpen(false);
							setSelectedCategory(undefined);
						}}
						onConfirm={handleAddCategory} />
				)}
			</AnimatePresence>
		</motion.div >
	);
}

export default MenuPage;
