/**
 * MobileMenuPage.tsx
 * Mobile-optimized version of the MenuPage for managing restaurant menus.
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// API Services
import { getAllMenus, postMenu, updateMenu, deleteMenu, toggleMenuAvailability } from "../../api/menuService";
import { getAllCategories, postCategory, updateCategory } from "../../api/menuCategoryService";
import { getProducts } from "../../api/productService";

// Types
import { CategoryType, MenuItemType, ProductType, type MenuType } from "../../types";

// Components
import Menu from "../../components/menu/Menu";
import SmallProducts from "../../components/products/SmallProducts";
import MenuItemModal from "../../components/menu/MenuItemModal";
import CategoryModal from "../../components/menu/CategoryModal";
import MobilePageWrapper from "../../components/global/MobilePageWrapper";

// Context
import { useTheme } from "../../context/ThemeContext";
import { useMessageModal } from "../../context/MessageModalContext";
import { useQuestionModal } from "../../context/QuestionModalContext";
import { useAuth } from "../../context/AuthContext";

// Icons
import { MdAdd, MdOutlineArrowBackIos, MdMoreVert } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

/**
 * MobileMenuPage component
 * 
 * Mobile-optimized interface for restaurant menu management, featuring:
 * - Vertical layout optimized for touch interaction
 * - Collapsible sections for better space utilization
 * - Large touch targets for improved mobile UX
 * - Maintains all functionality of the desktop version
 */
const MobileMenuPage = () => {
    // Authentication context
    const { hasRole } = useAuth(); // Only import what we need

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
    const [showActions, setShowActions] = useState(false);
    const [showProducts, setShowProducts] = useState(false);
    
    // Ref for the actions menu container
    const actionsMenuRef = useRef<HTMLDivElement>(null);

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
     * Fetches all required data from the API
     */
    const fetchData = async () => {
        try {
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
            const activeMenu = menuData.find((menu) => menu.available);
            if (activeMenu) {
                setMenu(activeMenu);
            } else if (menuData.length > 0) {
                setMenu(menuData[0]);
            }

            const categoriesData = await getAllCategories();
            setCategories(categoriesData);

            const productData = await getProducts();
            setProducts(productData);
        } catch (error) {
            console.error("Error fetching data:", error);
            showMessageModal("ERROR", "Failed to load menu data");
        }
    };

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
        showMessageModal("SUCCESS", "New menu created");
    };

    /**
     * Saves the current menu to the server
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
        };

        setMenus(prev => prev?.map(m => m.id === sortedMenuData.id ? sortedMenuData : m));
        setMenu(sortedMenuData);
        fetchData();
        setIsEditMode(false);
        setShowProducts(false);
        showMessageModal("SUCCESS", "Menu saved successfully");
    };

    /**
     * Deletes the current menu after confirmation
     */
    const askDeleteMenu = async (menuToDelete: MenuType) => {
        if (!menuToDelete) return;

        const confirmed = await askQuestion(`Do you want to delete ${menuToDelete.name}?`);
        if (!confirmed) return;

        const confirmedAgain = await askQuestion(`Are you sure you want to delete ${menuToDelete.name}?`);
        if (!confirmedAgain) return;

        await deleteMenu(menuToDelete.id);
        setMenus(prev => prev?.filter(m => m.id !== menuToDelete.id));

        // Select another menu if available
        if (menu?.id === menuToDelete.id) {
            const remainingMenus = menus?.filter(m => m.id !== menuToDelete.id) || [];
            setMenu(remainingMenus.length > 0 ? remainingMenus[0] : undefined);
        }

        showMessageModal("SUCCESS", "Menu deleted successfully");
        fetchData();
    };

    /**
     * Toggles the availability of a menu
     */
    const handleToggleAvailability = async (menuToToggle: MenuType) => {
        await toggleMenuAvailability(menuToToggle.id);
        fetchData();
        showMessageModal("SUCCESS", `Menu ${menuToToggle.available ? 'hidden' : 'published'} successfully`);
    };

    /**
     * Resets the current menu to its original state and exits edit mode
     */
    const resetMenu = () => {
        const originalMenu = menus?.find(m => m.id === menu?.id);
        setMenu(originalMenu);
        setIsEditMode(false);
        setShowProducts(false);
        showMessageModal("INFO", "Changes discarded");
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
     * Handles saving a new category
     */
    const handleSaveCategory = async (category: CategoryType) => {
        if (category.id === 0) {
            await postCategory(category);
            showMessageModal("SUCCESS", "Category created successfully");
        } else {
            await updateCategory(category);
            showMessageModal("SUCCESS", "Category updated successfully");
        }

        fetchData();

        setIsCategoryModalOpen(false);
    };

    /**
     * Handles product selection to add to menu
     */
    const handleProductClick = (product: ProductType) => {
        const itemAlreadyExists = menu?.categories.some(c =>
            c.menuItems.some(item => item.product.id === product.id)
        );

        if (itemAlreadyExists) {
            showMessageModal("ERROR", "Item already exists in the menu");
            return;
        }

        const menuItem: MenuItemType = {
            id: 0,
            price: 0, // Default price, will be set by user in modal
            tax: 10,
            available: true,
            product: product,
            menuOrder: 0
        };

        setSelectedMenuItem(menuItem);
        setIsMenuItemModalOpen(true);
    };

    /**
     * Handles opening the menu item modal for editing
     */
    const handleEditMenuItem = (menuItem: MenuItemType) => {
        setSelectedMenuItem(menuItem);
        setIsMenuItemModalOpen(true);
    };

    /**
     * Updates menu with the new or edited menu item
     */
    const handleSaveMenuItem = (menuItem: MenuItemType, categoryId: number) => {
        if (!menu) return;

        // Create a deep copy of the menu to modify
        const updatedMenu = JSON.parse(JSON.stringify(menu)) as MenuType;

        // Find the category
        const categoryIndex = updatedMenu.categories.findIndex(c => c.id === categoryId);

        if (categoryIndex === -1) {
            showMessageModal("ERROR", "Category not found");
            return;
        }

        // Check if we're updating an existing item or adding a new one
        const existingItemIndex = updatedMenu.categories[categoryIndex].menuItems.findIndex(
            item => item.id === menuItem.id
        );

        if (existingItemIndex !== -1) {
            // Update existing item
            updatedMenu.categories[categoryIndex].menuItems[existingItemIndex] = menuItem;
        } else {
            // Add new item
            menuItem.menuOrder = updatedMenu.categories[categoryIndex].menuItems.length;
            updatedMenu.categories[categoryIndex].menuItems.push(menuItem);
        }

        setMenu(updatedMenu);
        setIsMenuItemModalOpen(false);
    };

    /**
     * Action button for the header
     */
    const ActionButton = (
        hasRole(["ADMIN", "MANAGER"]) && (
        <motion.button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
                color: themeColors.text
            }}
        >
            <MdMoreVert size={24} />
        </motion.button>
    )
    );

    return (
        <MobilePageWrapper title={isEditMode ? "Edit Menu" : "Menu"} headerAction={ActionButton}>
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
                                        onClick={saveMenu}
                                        className="flex items-center w-full px-4 py-2 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <BiSolidEdit size={18} className="mr-2" />
                                        Save Menu
                                    </motion.button>
                                    <motion.button
                                        onClick={resetMenu}
                                        className="flex items-center w-full px-4 py-2 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <MdOutlineArrowBackIos size={18} className="mr-2" />
                                        Cancel Editing
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.button
                                        onClick={() => setIsEditMode(true)}
                                        className="flex items-center w-full px-4 py-2 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <BiSolidEdit size={18} className="mr-2" />
                                        Edit Menu
                                    </motion.button>
                                    <motion.button
                                        onClick={createNewMenu}
                                        className="flex items-center w-full px-4 py-2 text-left"
                                        whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                        style={{ color: themeColors.text }}
                                    >
                                        <MdAdd size={18} className="mr-2" />
                                        New Menu
                                    </motion.button>
                                    {menu && (
                                        <>
                                            <motion.button
                                                onClick={() => handleToggleAvailability(menu)}
                                                className="flex items-center w-full px-4 py-2 text-left"
                                                whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                                style={{ color: themeColors.text }}
                                            >
                                                {menu.available ? (
                                                    <>
                                                        <FaEyeSlash size={18} className="mr-2" />
                                                        Hide Menu
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaEye size={18} className="mr-2" />
                                                        Publish Menu
                                                    </>
                                                )}
                                            </motion.button>
                                            <motion.button
                                                onClick={() => askDeleteMenu(menu)}
                                                className="flex items-center w-full px-4 py-2 text-left"
                                                whileHover={{ backgroundColor: `${themeColors.accent}15` }}
                                                style={{ color: "#f44336" }}
                                            >
                                                <RiDeleteBin6Fill size={18} className="mr-2" />
                                                Delete Menu
                                            </motion.button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Menu selector */}
            {menus && menus.length > 0 && (
                <div className="mb-4">
                    <label
                        htmlFor="menuSelector"
                        className="block mb-2 text-sm font-medium"
                        style={{ color: themeColors.text }}
                    >
                        Select Menu
                    </label>
                    <select
                        id="menuSelector"
                        className="w-full p-2 rounded border"
                        style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.text,
                            borderColor: `${themeColors.secondary}50`
                        }}
                        value={menu?.id || ""}
                        onChange={(e) => {
                            const selectedMenu = menus.find(m => m.id === parseInt(e.target.value));
                            if (selectedMenu) setMenu(selectedMenu);
                        }}
                        disabled={isEditMode}
                    >
                        {menus.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} {m.available ? "(Published)" : ""}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Menu editor */}
            {menu && isEditMode && (
                <div className="mb-4 border rounded-lg" style={{ borderColor: `${themeColors.secondary}25` }}>
                    <div className="flex justify-between gap-2">
                        <motion.button
                            onClick={createCategory}
                            className="btn btn-success btn-with-icon-animation flex items-center py-2 px-3 rounded-lg"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <MdAdd size={20} />
                            <span>Add Category</span>
                        </motion.button>

                        <motion.button
                            onClick={() => setShowProducts(!showProducts)}
                            className="btn btn-accent btn-with-icon-animation flex items-cente gap-2 py-2 px-3 rounded-lg"
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <MdAdd size={20} />
                            <span>{showProducts ? "Hide Products" : "Add Products"}</span>
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Products panel */}
            <AnimatePresence>
                {isEditMode && showProducts && products && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="border rounded-lg overflow-hidden" style={{ borderColor: `${themeColors.secondary}25` }}>
                            <div className="p-3 font-medium" style={{ backgroundColor: `${themeColors.accent}15`, color: themeColors.text }}>
                                
                            </div>
                            <div className="p-2 overflow-y-auto">
                                <SmallProducts
                                    products={products}
                                    onProductClick={handleProductClick}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Menu display */}
            {menu && (!isEditMode || !showProducts) && (
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: `${themeColors.secondary}25` }}>
                    {/* Pass the correct props to the Menu component based on its interface */}
                    <Menu
                        menu={menu}
                        setMenu={setMenu}
                        isEditMode={isEditMode}
                        editMenuItem={handleEditMenuItem}
                        saveMenu={async () => {
                            // Save menu functionality
                            if (menu) {
                                await updateMenu(menu);
                                showMessageModal("SUCCESS", "Menu updated successfully");
                            }
                        }}
                        resetMenu={fetchData}
                    />
                </div>
            )}

            {/* Modals */}
            {isMenuItemModalOpen && selectedMenuItem && (
                <MenuItemModal
                    menuItem={selectedMenuItem}
                    isOpen={isMenuItemModalOpen}
                    onClose={() => setIsMenuItemModalOpen(false)}
                    onConfirm={(updatedItem, categoryId) => handleSaveMenuItem(updatedItem, categoryId)}
                    categories={menu?.categories || []}
                />
            )}

            {isCategoryModalOpen && selectedCategory && (
                <CategoryModal
                    category={selectedCategory}
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    onConfirm={handleSaveCategory}
                />
            )}
        </MobilePageWrapper>
    );
};

export default MobileMenuPage;
